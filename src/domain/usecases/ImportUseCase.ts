import _ from "lodash";

import {
    GeeInterval,
    GeeDataRepository,
    GeeGeometry,
    GeeDataSetId,
    GeeDataFilters
} from "../repositories/GeeDataRepository";
import { OrgUnit } from "../entities/OrgUnit";
import { DataValueSet, DataValue } from "../entities/DataValue";
import OrgUnitRepository from "../repositories/OrgUnitRepository";
import { GeeDataItem } from "../entities/GeeData";
import { promiseMap } from "../utils";

import { getImportCountString } from "../../webapp/utils/dhis2";
import { Config } from "../../webapp/models/Config";
import i18n from "../../webapp/locales";
import { DataImportData } from "../../webapp/models/Import";
import { getAttributeMappings, getDataSetValue } from "../../webapp/utils/gee";
import { buildPeriod, downloadFile } from "../../webapp/utils/import";
import { D2Api } from "d2-api";

type DataElementId = string;

interface GetDataValueSetOptions<Band extends string> {
    geeDataSetId: GeeDataSetId;
    mapping: Record<Band, DataElementId>;
    orgUnits: OrgUnit[];
    interval: GeeInterval;
    scale?: number;
}

//TODO: this use case is the old run method in old import model
// little a little we are going to refactoring this use case
// creating adapters that invoke it until the usecase has not
// webapp and infrastructure dependencies
class ImportUseCase {
    constructor(private api: D2Api,
        private config: Config,
        private geeDataRepository: GeeDataRepository,
        private orgUnitRepository: OrgUnitRepository) { }

    public async execute(
        dryRun: boolean,
        data: DataImportData
    ): Promise<{ success: boolean; failures: string[]; messages: string[] }> {
        let failures: string[] = [];
        let messages: string[] = [];
        try {

            const orgUnitIds = _.compact(data.selectedOUs.map(o => o.split("/").pop()));
            const orgUnits = await this.orgUnitRepository.getByIds(orgUnitIds);

            const baseImportConfig: { orgUnits: OrgUnit[]; interval: GeeInterval } = {
                //orgUnits: [{ id: "IyO9ICB0WIn" }, { id: "xloTsC6lk5Q" }],
                orgUnits: orgUnits,
                interval: {
                    type: "daily",
                    ...buildPeriod(data.periodInformation),
                },
            };
            let importDataValueSet: DataValueSet = { dataValues: [] };

            await Promise.all(
                data.selectedMappings.map(async selectedMapping => {
                    try {
                        const dataValueSet: DataValueSet = await this.getDataValueSet({
                            ...baseImportConfig,
                            geeDataSetId: getDataSetValue(
                                selectedMapping.geeImage,
                                this.config,
                                "pointer"
                            ),
                            mapping: getAttributeMappings(
                                selectedMapping.attributeMappingDictionary
                            ),
                        });

                        importDataValueSet = {
                            dataValues: _.concat(
                                importDataValueSet.dataValues,
                                dataValueSet.dataValues
                            ),
                        };
                        messages = [
                            ...messages,
                            i18n.t("{{n}} data values from {{name}} google data set.", {
                                name: getDataSetValue(
                                    selectedMapping.geeImage,
                                    this.config,
                                    "displayName"
                                ),
                                n: dataValueSet.dataValues.length,
                            }),
                        ];
                    } catch (err) {
                        failures = [...failures, err];
                    }
                })
            );
            if (!dryRun) {
                const res = await this.api.dataValues.postSet({}, importDataValueSet).getData();
                messages = [...messages, getImportCountString(res.importCount)];
            } else {
                messages = [...messages, i18n.t("No effective import into DHIS2, file download")];
                downloadFile({
                    filename: "data.json",
                    mimeType: "application/json",
                    contents: JSON.stringify(importDataValueSet),
                });
            }
            return {
                success: _.isEmpty(failures) && !_.isEmpty(messages),
                messages: messages,
                failures: failures,
            };
        } catch (err) {
            return {
                success: false,
                messages: messages,
                failures: [...failures, i18n.t("Import config failed"), err],
            };
        }
    }


    private getGeometryFromOrgUnit(orgUnit: OrgUnit): GeeGeometry | undefined {
        const coordinates = orgUnit.coordinates ? JSON.parse(orgUnit.coordinates) : null;
        if (!coordinates) return;

        switch (orgUnit.featureType) {
            case "POINT":
                return { type: "point", coordinates };
            case "POLYGON":
            case "MULTI_POLYGON":
                return { type: "multi-polygon", polygonCoordinates: coordinates };
            default:
                return;
        }
    }

    private async getDataValueSet<Band extends string>(
        options: GetDataValueSetOptions<Band>
    ): Promise<DataValueSet> {
        const { geeDataRepository } = this;
        const { geeDataSetId, orgUnits, mapping, interval, scale } = options;

        const dataValuesList = await promiseMap(orgUnits, async (orgUnit) => {
            const geometry = this.getGeometryFromOrgUnit(orgUnit);

            if (!geometry) return [];

            const options: GeeDataFilters<Band> = {
                id: geeDataSetId,
                bands: _.keys(mapping) as Band[],
                geometry,
                interval,
                scale,
            };

            const geeData = await geeDataRepository.getData(options);

            return _(geeData).map(item =>
                this.mapGeeDataItemToDataValue(item, orgUnit.id, mapping)).compact().value()
        });

        return { dataValues: _.flatten(dataValuesList) };
    }

    private mapGeeDataItemToDataValue<Band extends string>(
        item: GeeDataItem<Band>, orgUnitId: string,
        mapping: Record<Band, DataElementId>): DataValue | undefined {

        const { date, band, value } = item;
        const dataElementId = mapping[band];

        if (!dataElementId) {
            console.error(`Band not found in mapping: ${band}`);
            return;
        } else {
            return {
                dataElement: dataElementId,
                value: value.toFixed(18),
                orgUnit: orgUnitId,
                period: date.format("YYYYMMDD"), // Assume periodType="DAILY"
            };
        }
    }
}

export default ImportUseCase;