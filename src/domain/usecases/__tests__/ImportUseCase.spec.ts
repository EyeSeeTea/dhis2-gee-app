/* eslint-disable @typescript-eslint/camelcase */

import moment from "moment";
import ImportUseCase from "../ImportUseCase";

import { GeeDataSetRepository } from "../../repositories/GeeDataSetRepository";
import { GeeDataValueSetRepository } from "../../repositories/GeeDataValueSetRepository";
import OrgUnitRepository from "../../repositories/OrgUnitRepository";
import DataValueSetRepository from "../../repositories/DataValueSetRepository";
import { ImportRuleRepository } from "../../repositories/ImportRuleRepository";
import { DataValueSet } from "../../entities/DataValueSet";
import { Maybe } from "../../common/Maybe";
import { Either } from "../../common/Either";
import { ImportRule } from "../../entities/ImportRule";
import MappingRepository from "../../repositories/MappingRepository";
import { ImportSummaryRepository } from "../../repositories/ImportSummaryRepository";
import { trasnformExpressionToken, TransformExpression } from "../../entities/TransformExpression";

//TODO: add test import summary

describe("ImportUseCase", () => {
    describe("executeImportRule", () => {
        it("should import expected data value set and return expected message", async () => {
            const ImportRuleRepository = givenAImportRuleRepository();
            const mappingRepository = givenAMappingRepository();
            const geeDataSetRepository = givenAGeeDataSetRepository();
            const geeDataRepository = givenAGeeDataValueSetRepository();
            const orgUnitRepository = givenAOrgUnitRepository();
            const dataValueSetRepository = givenADataValueSetRepository();
            const importSummaryRepository = givenAImportSummaryRepository();

            const importUseCase = new ImportUseCase(
                ImportRuleRepository,
                mappingRepository,
                geeDataSetRepository,
                geeDataRepository,
                orgUnitRepository,
                dataValueSetRepository,
                importSummaryRepository
            );

            const result = await importUseCase.executeImportRule(defaultImportRule.id, "fakeUser");

            const expectedDataValueSet = givenAnExpectedDataValueSet();

            expect(dataValueSetRepository.save).toBeCalledWith(expectedDataValueSet);
            expect(result).toEqual({
                failures: [],
                messages: [
                    "6 data values from ECMWF-ERA5-DAILY google data set.",
                    "Imported 6 - updated 0 - ignored 0",
                ],
                success: true,
            });
        });
        it("should import expected data value set applying transforms", async () => {
            const transformExpression = "#{input} - 273.15";

            const ImportRuleRepository = givenAImportRuleRepository();
            const mappingRepository = givenAMappingRepository(transformExpression);
            const geeDataSetRepository = givenAGeeDataSetRepository();
            const geeDataRepository = givenAGeeDataValueSetRepository();
            const orgUnitRepository = givenAOrgUnitRepository();
            const dataValueSetRepository = givenADataValueSetRepository();
            const importSummaryRepository = givenAImportSummaryRepository();

            const importUseCase = new ImportUseCase(
                ImportRuleRepository,
                mappingRepository,
                geeDataSetRepository,
                geeDataRepository,
                orgUnitRepository,
                dataValueSetRepository,
                importSummaryRepository
            );

            const result = await importUseCase.executeImportRule(defaultImportRule.id, "fakeUser");

            const expectedDataValueSet = givenAnExpectedDataValueSet(transformExpression);

            expect(dataValueSetRepository.save).toBeCalledWith(expectedDataValueSet);
            expect(result).toEqual({
                failures: [],
                messages: [
                    "6 data values from ECMWF-ERA5-DAILY google data set.",
                    "Imported 6 - updated 0 - ignored 0",
                ],
                success: true,
            });
        });
    });
});

export {};

function givenAGeeDataSetRepository(): GeeDataSetRepository {
    return {
        getAll: jest.fn(),
        getById: jest.fn().mockImplementation(() => {
            return Maybe.fromValue({
                id: "ECMWF-ERA5-DAILY",
                imageCollectionId: "ECMWF/ERA5/DAILY",
                displayName:
                    "ERA5 Daily aggregates - Latest climate reanalysis produced by ECMWF / Copernicus Climate Change Service",
                type: "image_collection",
                description:
                    "ERA5 is the fifth generation ECMWF atmospheric reanalysis of the global climate.\nReanalysis combines model data with observations from across the world into\na globally complete and consistent dataset. ERA5 replaces its predecessor,\nthe ERA-Interim reanalysis.\n\n\nERA5 DAILY provides aggregated values for each day for seven ERA5 climate\nreanalysis parameters: 2m air temperature, 2m dewpoint temperature, total\nprecipitation, mean sea level pressure, surface pressure, 10m u-component\nof wind and 10m v-component of wind. Additionally, daily minimum and maximum\nair temperature at 2m has been calculated based on the hourly 2m air\ntemperature data. Daily total precipitation values are given as daily sums.\nAll other parameters are provided as daily averages.\n\nERA5 data is available from 1979 to three months from real-time. More information\nand more ERA5 atmospheric parameters can be found at the\n[Copernicus Climate Data Store](https://cds.climate.copernicus.eu).\n",
                doc: "https://developers.google.com/earth-engine/datasets/catalog/ECMWF/ERA5/DAILY",
                period: "day",
                bands: [
                    {
                        name: "mean_2m_air_temperature",
                        units: "K",
                        description: "Average air temperature at 2m height (daily average)",
                    },
                    {
                        name: "minimum_2m_air_temperature",
                        units: "K",
                        description: "Minimum air temperature at 2m height (daily minimum)",
                    },
                    {
                        name: "maximum_2m_air_temperature",
                        units: "K",
                        description: "Maximum air temperature at 2m height (daily maximum)",
                    },
                    {
                        name: "dewpoint_2m_temperature",
                        units: "K",
                        description: "Dewpoint temperature at 2m height (daily average)",
                    },
                    {
                        name: "total_precipitation",
                        units: "m",
                        description: "Total precipitation (daily sums)",
                    },
                    {
                        name: "surface_pressure",
                        units: "Pa",
                        description: "Surface pressure (daily average)",
                    },
                    {
                        name: "mean_sea_level_pressure",
                        units: "Pa",
                        description: "Mean sea level pressure (daily average)",
                    },
                    {
                        name: "u_component_of_wind_10m",
                        units: "m s-1",
                        description: "10m u-component of wind (daily average)",
                    },
                    {
                        name: "v_component_of_wind_10m",
                        units: "m s-1",
                        description: "10m v-component of wind (daily average)",
                    },
                ],
                keywords: [
                    "climate",
                    "copernicus",
                    "dewpoint",
                    "ecmwf",
                    "era5",
                    "precipitation",
                    "pressure",
                    "reanalysis",
                    "surface",
                    "temperature",
                    "wind",
                ],
            });
        }),
    };
}

function givenAOrgUnitRepository(): OrgUnitRepository {
    return {
        getByIds: jest.fn().mockImplementation(() => {
            return [
                {
                    id: "WFAboRxdVjA",
                    geometry: { type: "Point", coordinates: [-2.708309, 6.675618] },
                },
            ];
        }),
        getAllWithCoordinates: jest.fn(),
    };
}

function givenAMappingRepository(trasformExpresion: string | undefined = undefined): MappingRepository {
    const getTrasformExpresion = (trasformExpresion: string | undefined) => {
        if (!trasformExpresion) {
            return trasformExpresion;
        } else {
            const expressionResult = TransformExpression.create(trasformExpresion);

            return expressionResult.fold(
                () => undefined,
                expressionOK => expressionOK
            );
        }
    };

    return {
        getAll: jest.fn().mockImplementation(() => {
            return [
                {
                    id: "utQIFECT8tF",
                    name: "ERA",
                    dataSetId: "rayEGGqQwIC",
                    dataSetName: "Climate factors",
                    description: "",
                    geeImage: "ECMWF-ERA5-DAILY",
                    attributeMappingDictionary: {
                        minimum_2m_air_temperature: {
                            id: "minimum_2m_air_temperature",
                            geeBand: "minimum_2m_air_temperature",
                            dataElementId: "klaKtwaWAvG",
                            dataElementName: "CC - Temperature min",
                            dataElementCode: "CC - Temperature min",
                            comment: "",
                            transformExpression: getTrasformExpresion(trasformExpresion),
                        },
                        maximum_2m_air_temperature: {
                            id: "maximum_2m_air_temperature",
                            geeBand: "maximum_2m_air_temperature",
                            dataElementId: "c24Y5UNjXyj",
                            dataElementName: "CC - Temperature max",
                            dataElementCode: "CC - Temperature max",
                            comment: "",
                            transformExpression: getTrasformExpresion(trasformExpresion),
                        },
                        mean_2m_air_temperature: {
                            id: "mean_2m_air_temperature",
                            geeBand: "mean_2m_air_temperature",
                            dataElementId: "RSJpUZqMoxC",
                            dataElementName: "CC - Temperature",
                            dataElementCode: "CC - Temperature",
                            comment: "",
                            transformExpression: getTrasformExpresion(trasformExpresion),
                        },
                    },
                    created: new Date(),
                },
            ];
        }),
        saveAll: jest.fn(),
        deleteByIds: jest.fn(),
    };
}

function givenAImportRuleRepository(): ImportRuleRepository {
    return {
        getById: jest.fn().mockImplementation(() => {
            return Maybe.fromValue(defaultImportRule);
        }),
        getAll: jest.fn(),
        deleteByIds: jest.fn(),
        save: jest.fn().mockImplementation(() => {
            return Either.success(true);
        }),
        saveAll: jest.fn(),
    };
}

function givenADataValueSetRepository(): DataValueSetRepository {
    return {
        save: jest.fn().mockImplementation(() => {
            return {
                status: "SUCCESS",
                description: "Import Success",
                importCount: {
                    imported: 6,
                    updated: 0,
                    ignored: 0,
                    deleted: 0,
                },
            };
        }),
    };
}

function givenAImportSummaryRepository(): ImportSummaryRepository {
    return {
        getAll: jest.fn(),
        save: jest.fn(),
        saveAll: jest.fn(),
        deleteByIds: jest.fn(),
    };
}

function givenAGeeDataValueSetRepository(): GeeDataValueSetRepository {
    return {
        getData: jest.fn().mockImplementation(() => {
            return [
                {
                    band: "minimum_2m_air_temperature",
                    date: moment(1514764800000),
                    lat: 6.675515623584783,
                    lon: -2.7082858343277394,
                    periodId: "20180101",
                    value: 294.7579345703125,
                },
                {
                    band: "maximum_2m_air_temperature",
                    date: moment(1514764800000),
                    lat: 6.675515623584783,
                    lon: -2.7082858343277394,
                    periodId: "20180101",
                    value: 308.13607788085938,
                },
                {
                    band: "mean_2m_air_temperature",
                    date: moment(1514764800000),
                    lat: 6.675515623584783,
                    lon: -2.7082858343277394,
                    periodId: "20180101",
                    value: 300.81417846679688,
                },
                {
                    band: "minimum_2m_air_temperature",
                    date: moment(1514851200000),
                    lat: 6.675515623584783,
                    lon: -2.7082858343277394,
                    periodId: "20180102",
                    value: 294.9193115234375,
                },
                {
                    band: "maximum_2m_air_temperature",
                    date: moment(1514851200000),
                    lat: 6.675515623584783,
                    lon: -2.7082858343277394,
                    periodId: "20180102",
                    value: 306.92263793945312,
                },
                {
                    band: "mean_2m_air_temperature",
                    date: moment(1514851200000),
                    lat: 6.675515623584783,
                    lon: -2.7082858343277394,
                    periodId: "20180102",
                    value: 300.29220581054688,
                },
            ];
        }),
    };
}

function givenAnExpectedDataValueSet(trasnformExpression: string | undefined = undefined): DataValueSet {
    /* eslint no-eval: 0 */
    const getValue = (value: string) => {
        return trasnformExpression
            ? eval(trasnformExpression.replace(trasnformExpressionToken, value)).toString()
            : value;
    };

    const dataValueSet = {
        dataValues: [
            {
                dataElement: "klaKtwaWAvG",
                orgUnit: "WFAboRxdVjA",
                period: "20180101",
                value: getValue("294.757934570312500000"),
            },
            {
                dataElement: "c24Y5UNjXyj",
                orgUnit: "WFAboRxdVjA",
                period: "20180101",
                value: getValue("308.136077880859375000"),
            },
            {
                dataElement: "RSJpUZqMoxC",
                orgUnit: "WFAboRxdVjA",
                period: "20180101",
                value: getValue("300.814178466796875000"),
            },
            {
                dataElement: "klaKtwaWAvG",
                orgUnit: "WFAboRxdVjA",
                period: "20180102",
                value: getValue("294.919311523437500000"),
            },
            {
                dataElement: "c24Y5UNjXyj",
                orgUnit: "WFAboRxdVjA",
                period: "20180102",
                value: getValue("306.922637939453125000"),
            },
            {
                dataElement: "RSJpUZqMoxC",
                orgUnit: "WFAboRxdVjA",
                period: "20180102",
                value: getValue("300.292205810546875000"),
            },
        ],
    };

    return dataValueSet;
}

const defaultImportRule = ImportRule.createExisted({
    id: "ondemand",
    name: "Ondemand import",
    description: "Ondemand import. Unique ondemand for all the instance",
    periodInformation: {
        id: "FIXED",
        name: "Fixed period",
        endDate: new Date("2018-01-31T16:43:00.000Z"),
        startDate: new Date("2018-01-01T16:43:00.000Z"),
    },
    created: new Date(),
    lastUpdated: new Date(),
    selectedMappings: ["utQIFECT8tF"],
    selectedOUs: ["/E4h5WBOg71F/RnDSNvg7zR2/KwLlNNoREes/GY1mRd2suuj/WFAboRxdVjA"],
});
