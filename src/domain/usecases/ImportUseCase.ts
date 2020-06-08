import _ from "lodash";

import {
    GeeInterval,
    GeeDataValueSetRepository,
    GeeGeometry,
    GeeDataSetId,
    GeeDataFilters,
} from "../repositories/GeeDataValueSetRepository";
import { OrgUnit } from "../entities/OrgUnit";
import { DataValueSet, DataValue } from "../entities/DataValueSet";
import OrgUnitRepository from "../repositories/OrgUnitRepository";
import { GeeDataValue } from "../entities/GeeDataValueSet";
import { promiseMap, buildPeriod } from "../utils";
import DataValueSetRepository, {
    SaveDataValueSetReponse,
} from "../repositories/DataValueSetRepository";
import { GeeDataSetRepository } from "../repositories/GeeDataSetRepository";
import { ImportRuleRepository } from "../repositories/ImportRuleRepository";
import { Id } from "../entities/Ref";

import i18n from "../../webapp/utils/i18n";
import { AttributeMappingDictionary } from "../entities/Mapping";
import MappingRepository from "../repositories/MappingRepository";
import { ImportRule } from "../entities/ImportRule";
import { ImportSummary, ImportResult } from "../entities/ImportSummary";
import {
    ImportSummaryRepository,
    SaveImportSummaryError,
} from "../repositories/ImportSummaryRepository";
import { Either } from "../common/Either";

export default class ImportUseCase {
    constructor(
        private importRuleRepository: ImportRuleRepository,
        private mappingRepository: MappingRepository,
        private geeDataSetRepository: GeeDataSetRepository,
        private geeDataRepository: GeeDataValueSetRepository,
        private orgUnitRepository: OrgUnitRepository,
        private dataValueSetRepository: DataValueSetRepository,
        private importSummaryRepository: ImportSummaryRepository
    ) {}

    //TODO: pass userid? and retrieve name?
    // Validate user is not empty?
    public async execute(
        importRuleId: Id,
        username: string
    ): Promise<{ success: boolean; failures: string[]; messages: string[] }> {
        let failures: string[] = [];
        let messages: string[] = [];
        try {
            const importRuleResult = await this.importRuleRepository.getById(importRuleId);
            const importRule = importRuleResult.getOrThrow(
                `importRule with id ${importRuleId} does not exist`
            );

            failures = this.validateImportRule(importRule);

            if (failures.length === 0) {
                const orgUnitIds = _.compact(importRule.selectedOUs.map(o => o.split("/").pop()));
                const orgUnits = await this.orgUnitRepository.getByIds(orgUnitIds);

                const baseImportConfig: { orgUnits: OrgUnit[]; interval: GeeInterval } = {
                    orgUnits: orgUnits,
                    interval: {
                        type: "daily",
                        ...buildPeriod(importRule.periodInformation),
                    },
                };
                let importDataValueSet: DataValueSet = { dataValues: [] };

                const mappings = await this.mappingRepository.getAll(importRule.selectedMappings);

                await Promise.all(
                    mappings.map(async selectedMapping => {
                        try {
                            const geeDataSet = await this.geeDataSetRepository.getByCode(
                                selectedMapping.geeImage
                            );

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

                const dataValueSetResponse = await this.dataValueSetRepository.save(
                    importDataValueSet
                );

                messages = [...messages, this.getImportCountString(dataValueSetResponse)];
            }

            const updatedImportRule = importRule.updateLastExecuted();
            const syncRuleResponse = await this.importRuleRepository.save(updatedImportRule);

            failures = syncRuleResponse.fold(
                () => [
                    ...failures,
                    i18n.t("An error has ocurred updating lastUpdate field of import rule"),
                ],
                () => failures
            );

            const importResult = {
                success: _.isEmpty(failures) && !_.isEmpty(messages),
                messages: messages,
                failures: failures,
            };

            await this.saveImportResult(username, importRuleId, importResult);

            return importResult;
        } catch (err) {
            const importResult = {
                success: false,
                messages: messages,
                failures: [...failures, i18n.t("Import config failed"), err],
            };

            await this.saveImportResult(username, importRuleId, importResult);

            return importResult;
        }
    }

    private validateImportRule(importRule: ImportRule): string[] {
        const failures: string[] = [];

        if (importRule.selectedOUs.length === 0) {
            failures.push(
                i18n.t("Does not exists any selected organisation unit in the import rule")
            );
        }

        if (!importRule.periodInformation) {
            failures.push(i18n.t("Does not exists any selected period in the import rule"));
        }

        if (importRule.selectedMappings.length === 0) {
            failures.push(i18n.t("Does not exists any selected mapping in the import rule"));
        }

        return failures;
    }

    private async getDataValueSet<Band extends string>(
        options: GetDataValueSetOptions<Band>
    ): Promise<DataValueSet> {
        const { geeDataRepository } = this;
        const { geeDataSetId, orgUnits, attributeIdsMapping, interval, scale } = options;

        const dataValuesList = await promiseMap(orgUnits, async orgUnit => {
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

            return _(geeData)
                .map(item => this.mapGeeDataValueToDataValue(item, orgUnit.id, attributeIdsMapping))
                .compact()
                .value();
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
        item: GeeDataValue<Band>,
        orgUnitId: string,
        mapping: Record<Band, DataElementId>
    ): DataValue | undefined {
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

    private getImportCountString(dataValueSetReponse: SaveDataValueSetReponse): string {
        if (typeof dataValueSetReponse == "string") {
            return dataValueSetReponse;
        } else {
            return i18n.t("Imported: {{imported}} - updated: {{updated}} - ignored: {{ignored}}", {
                imported: dataValueSetReponse.imported,
                updated: dataValueSetReponse.updated,
                ignored: dataValueSetReponse.ignored,
            });
        }
    }

    private saveImportResult(
        username: string,
        importRuleId: string,
        importResult: ImportResult
    ): Promise<Either<SaveImportSummaryError, true>> {
        const importSummary = ImportSummary.createNew({
            username: username,
            importRule: importRuleId,
            result: importResult,
        });

        return this.importSummaryRepository.save(importSummary);
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
