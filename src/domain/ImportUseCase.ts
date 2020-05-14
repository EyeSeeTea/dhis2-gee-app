import _ from "lodash";

import {
    GeeInterval,
    GeeDataValueSetRepository,
    GeeGeometry,
    GeeDataSetId,
    GeeDataFilters
} from "./gee/repositories/GeeDataValueSetRepository";
import { OrgUnit } from "./dhis2/entities/OrgUnit";
import { DataValueSet, DataValue } from "./dhis2/entities/DataValueSet";
import OrgUnitRepository from "./dhis2/repositories/OrgUnitRepository";
import { GeeDataValue } from "./gee/entities/GeeDataValueSet";
import { promiseMap } from "./utils";
import { ImportRule, AttributeMappingDictionary } from "./dhis2/entities/ImportRule";
import DataValueSetRepository, { SaveDataValueSetReponse } from "./dhis2/repositories/DataValueSetRepository";
import { GeeDataSetRepository } from "./gee/repositories/GeeDataSetRepository";

// To decouple
import { buildPeriod, downloadFile } from "../webapp/utils/import";

import i18n from "../webapp/locales";

export interface ImportUseCaseResult {
    success: boolean; failures: string[]; messages: string[]
}

//TODO: this use case is the old run method in old import model
// little a little we are going to refactoring this use case
// creating adapters that invoke it until the usecase has not
// webapp and infrastructure dependencies
export default class ImportUseCase {
    constructor(
        private geeDataSetRepository: GeeDataSetRepository,
        private geeDataRepository: GeeDataValueSetRepository,
        private orgUnitRepository: OrgUnitRepository,
        private dataValueSetRepository: DataValueSetRepository) { }

    public async execute(
        dryRun: boolean,
        importRule: ImportRule
    ): Promise<{ success: boolean; failures: string[]; messages: string[] }> {
        let failures: string[] = [];
        let messages: string[] = [];
        try {

            const orgUnitIds = _.compact(importRule.selectedOUs.map(o => o.split("/").pop()));
            const orgUnits = await this.orgUnitRepository.getByIds(orgUnitIds);

            const baseImportConfig: { orgUnits: OrgUnit[]; interval: GeeInterval } = {
                //orgUnits: [{ id: "IyO9ICB0WIn" }, { id: "xloTsC6lk5Q" }],
                orgUnits: orgUnits,
                interval: {
                    type: "daily",
                    ...buildPeriod(importRule.periodInformation),
                },
            };
            let importDataValueSet: DataValueSet = { dataValues: [] };

            await Promise.all(
                importRule.selectedMappings.map(async selectedMapping => {
                    try {

                        const geeDataSet = await this.geeDataSetRepository.getByCode(selectedMapping.geeImage);

                        const dataValueSet: DataValueSet = await this.getDataValueSet({
                            ...baseImportConfig,
                            geeDataSetId: geeDataSet.imageCollectionId,
                            attributeIdsMapping: this.getAttributeIdMappings(
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
                                name: geeDataSet.displayName,
                                n: dataValueSet.dataValues.length,
                            }),
                        ];
                    } catch (err) {
                        failures = [...failures, err];
                    }
                })
            );
            if (!dryRun) {
                const response = await this.dataValueSetRepository.save(importDataValueSet);
                messages = [...messages, this.getImportCountString(response)];
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

    private async getDataValueSet<Band extends string>(
        options: GetDataValueSetOptions<Band>
    ): Promise<DataValueSet> {
        const { geeDataRepository } = this;
        const { geeDataSetId, orgUnits, attributeIdsMapping, interval, scale } = options;

        const dataValuesList = await promiseMap(orgUnits, async (orgUnit) => {
            const geometry = this.mapOrgUnitToGeeGeometry(orgUnit);

            if (!geometry) return [];

            const options: GeeDataFilters<Band> = {
                id: geeDataSetId,
                bands: _.keys(attributeIdsMapping) as Band[],
                geometry,
                interval,
                scale,
            };

            const geeData = await geeDataRepository.getData(options);

            return _(geeData).map(item =>
                this.mapGeeDataValueToDataValue(item, orgUnit.id, attributeIdsMapping)).compact().value()
        });

        return { dataValues: _.flatten(dataValuesList) };
    }

    private mapOrgUnitToGeeGeometry(orgUnit: OrgUnit): GeeGeometry | undefined {
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

    private mapGeeDataValueToDataValue<Band extends string>(
        item: GeeDataValue<Band>, orgUnitId: string,
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

    private getAttributeIdMappings(
        attributeMappingsDictionary: AttributeMappingDictionary
    ): Record<string, string> {
        const bandDeMappings = _.mapValues(attributeMappingsDictionary, m => {
            return m.dataElementId ?? "";
        });
        return bandDeMappings;
    }

    private getImportCountString(dataValueSetReponse: SaveDataValueSetReponse) {
        return i18n.t("Imported: {{imported}} - updated: {{updated}} - ignored: {{ignored}}", {
            imported: dataValueSetReponse.imported,
            updated: dataValueSetReponse.updated,
            ignored: dataValueSetReponse.ignored,
        });
    }

}

type DataElementId = string;

interface GetDataValueSetOptions<Band extends string> {
    geeDataSetId: GeeDataSetId;
    attributeIdsMapping: Record<Band, DataElementId>;
    orgUnits: OrgUnit[];
    interval: GeeInterval;
    scale?: number;
}