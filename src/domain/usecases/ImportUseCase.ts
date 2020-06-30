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
import { ImportSummary, ImportResult } from "../entities/ImportSummary";
import {
    ImportSummaryRepository,
    SaveImportSummaryError,
} from "../repositories/ImportSummaryRepository";
import { Either } from "../common/Either";
import { evalTransformExpression } from "../entities/TransformExpression";
import { PeriodOption } from "../entities/PeriodOption";
import { Moment } from "moment";
import { GeeDataSet } from "../entities/GeeDataSet";

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
    public async executeImportRule(importRuleId: Id, username: string): Promise<ImportResult> {
        const importRuleResult = await this.importRuleRepository.getById(importRuleId);
        const importRule = importRuleResult.getOrThrow(
            `importRule with id ${importRuleId} does not exist`
        );

        const importResult = await this.execute(
            importRule.selectedOUs,
            importRule.selectedMappings,
            importRule.periodInformation
        );

        const updatedImportRule = importRule.updateLastExecuted();
        const syncRuleResponse = await this.importRuleRepository.save(updatedImportRule);

        const finalImportResult = {
            ...importResult,
            failures: syncRuleResponse.fold(
                () => [
                    ...importResult.failures,
                    i18n.t("An error has ocurred updating lastUpdate field of import rule"),
                ],
                () => importResult.failures
            ),
        };

        await this.saveImportResult(username, finalImportResult, importRuleId);

        return finalImportResult;
    }

    public async executeByPairs(
        orgUnitMappingPairs: { orgUnitPath: string; mappingId: string }[],
        period: PeriodOption,
        username: string
    ): Promise<ImportResult> {
        const results =
            orgUnitMappingPairs.length > 0
                ? await promiseMap(orgUnitMappingPairs, async orgUnitMappingPair => {
                      return this.execute(
                          [orgUnitMappingPair.orgUnitPath],
                          [orgUnitMappingPair.mappingId],
                          period
                      );
                  })
                : [
                      {
                          success: false,
                          failures: [
                              i18n.t("No organisation unit selected as global for the import rule"),
                          ],
                          messages: [],
                      },
                  ];

        const importResult = results.reduce(
            (acc, result) => {
                return {
                    ...acc,
                    success: !acc.success ? acc.success : result.success,
                    failures: [...acc.failures, ...result.failures],
                    messages: [...acc.messages, ...result.messages],
                };
            },
            {
                success: true,
                failures: [],
                messages: [],
            }
        );

        await this.saveImportResult(username, importResult);

        return importResult;
    }

    public async execute(
        orgUnitPaths: string[],
        mappingIds: string[],
        period?: PeriodOption
    ): Promise<ImportResult> {
        let failures: string[] = [];
        let messages: string[] = [];
        try {
            failures = this.validateInputs(orgUnitPaths, mappingIds, period);

            if (failures.length === 0 && period) {
                const orgUnitIds = _.compact(orgUnitPaths.map(o => o.split("/").pop()));
                const orgUnits = await this.orgUnitRepository.getByIds(orgUnitIds);

                const baseImportConfig: { orgUnits: OrgUnit[]; interval: GeeInterval } = {
                    orgUnits: orgUnits,
                    interval: {
                        ...buildPeriod(period),
                    },
                };
                let importDataValueSet: DataValueSet = { dataValues: [] };

                const mappings = await this.mappingRepository.getAll(mappingIds);

                await Promise.all(
                    mappings.map(async selectedMapping => {
                        try {
                            const geeDataSet = (
                                await this.geeDataSetRepository.getById(selectedMapping.geeImage)
                            ).getOrThrow();

                            const dataValueSet: DataValueSet = await this.getDataValueSet(
                                geeDataSet,
                                {
                                    ...baseImportConfig,
                                    geeDataSetId: geeDataSet.imageCollectionId,
                                    attributeIdsMapping: selectedMapping.attributeMappingDictionary,
                                }
                            );

                            importDataValueSet = {
                                dataValues: _.concat(
                                    importDataValueSet.dataValues,
                                    dataValueSet.dataValues
                                ),
                            };
                            messages = [
                                ...messages,
                                i18n.t("{{n}} data values from {{name}} google data set.", {
                                    name: geeDataSet.id,
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

                const dataValueSetMessages = this.getMessagesFromDataValueSetReponse(
                    dataValueSetResponse
                );
                messages = dataValueSetMessages ? [...messages, dataValueSetMessages] : messages;

                const dataValueSetFailures = this.getFailuresFromDataValueSetReponse(
                    dataValueSetResponse
                );
                failures = dataValueSetFailures ? [...failures, dataValueSetFailures] : failures;
            }

            const importResult = {
                success: _.isEmpty(failures) && !_.isEmpty(messages),
                messages: messages,
                failures: failures,
            };

            return importResult;
        } catch (err) {
            const importResult = {
                success: false,
                messages: messages,
                failures: [...failures, i18n.t("Import config failed"), err],
            };

            return importResult;
        }
    }

    private validateInputs(
        orgUnits: string[],
        mappings: string[],
        period?: PeriodOption
    ): string[] {
        const failures: string[] = [];

        if (orgUnits.length === 0) {
            failures.push(i18n.t("No organisation unit selected in the import rule"));
        }

        if (!period) {
            failures.push(i18n.t("No period selected in the import rule"));
        }

        if (mappings.length === 0) {
            failures.push(i18n.t("No mapping selected in the import rule"));
        }

        return failures;
    }

    private async getDataValueSet<Band extends string>(
        geeDataSet: GeeDataSet,
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
                .map(item =>
                    this.mapGeeDataValueToDataValue(
                        item,
                        orgUnit.id,
                        attributeIdsMapping,
                        geeDataSet
                    )
                )
                .compact()
                .value();
        });

        return { dataValues: _.flatten(dataValuesList) };
    }

    private mapOrgUnitToGeeGeometry(orgUnit: OrgUnit): GeeGeometry | undefined {
        if (!orgUnit.geometry) return;

        switch (orgUnit.geometry.type) {
            case "Point":
                return { type: "point", coordinates: orgUnit.geometry.coordinates };
            case "Polygon":
                return { type: "multi-polygon", polygonCoordinates: orgUnit.geometry.coordinates };
            default:
                return;
        }
    }

    private mapGeeDataValueToDataValue<Band extends string>(
        item: GeeDataValue<Band>,
        orgUnitId: string,
        mappingDicc: AttributeMappingDictionary,
        geeDataSet: GeeDataSet
    ): DataValue | undefined {
        const { date, band, value } = item;
        const mapping = mappingDicc[band];

        if (!mapping.dataElementId) {
            console.error(`Band not found in mapping: ${band}`);
            return;
        } else {
            const formattedValue = value.toFixed(18);
            const dataElementId: string = mapping.dataElementId;

            if (mapping.transformExpression) {
                const mappedValueResult = evalTransformExpression(
                    mapping.transformExpression,
                    +formattedValue
                );

                return mappedValueResult.fold(
                    () => {
                        throw new Error(
                            i18n.t("Unexpected error has ocurred apply transform expression")
                        );
                    },
                    numberResult => {
                        return {
                            dataElement: dataElementId,
                            value: numberResult.toString(),
                            orgUnit: orgUnitId,
                            period: this.getFormatedPeriod(date, geeDataSet),
                        };
                    }
                );
            } else {
                return {
                    dataElement: mapping.dataElementId,
                    value: formattedValue,
                    orgUnit: orgUnitId,
                    period: this.getFormatedPeriod(date, geeDataSet),
                };
            }
        }
    }

    private getFormatedPeriod(date: Moment, geeDataSet: GeeDataSet) {
        if (geeDataSet.cadence?.includes("year")) {
            return date.format("YYYY");
        } else if (geeDataSet.cadence?.includes("month")) {
            return date.format("YYYYMM");
        } else {
            return date.format("YYYYMMDD");
        }
    }

    private getMessagesFromDataValueSetReponse(
        dataValueSetReponse: SaveDataValueSetReponse
    ): string {
        if (typeof dataValueSetReponse === "string") {
            return dataValueSetReponse;
        } else {
            return dataValueSetReponse.status !== "ERROR"
                ? i18n.t("Imported {{imported}} - updated {{updated}} - ignored {{ignored}}", {
                      imported: dataValueSetReponse.importCount.imported,
                      updated: dataValueSetReponse.importCount.updated,
                      ignored: dataValueSetReponse.importCount.ignored,
                  })
                : "";
        }
    }

    private getFailuresFromDataValueSetReponse(
        dataValueSetReponse: SaveDataValueSetReponse
    ): string {
        return typeof dataValueSetReponse !== "string" && dataValueSetReponse.status === "ERROR"
            ? dataValueSetReponse.description
            : "";
    }

    private saveImportResult(
        username: string,
        importResult: ImportResult,
        importRuleId?: string
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
    attributeIdsMapping: AttributeMappingDictionary;
    orgUnits: OrgUnit[];
    interval: GeeInterval;
    scale?: number;
}
