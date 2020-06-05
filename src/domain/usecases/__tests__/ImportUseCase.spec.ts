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

describe("ImportUseCase", () => {
    it("should import expected data value set and return expected message", async () => {
        const ImportRuleRepository = givenAImportRuleRepository();
        const mappingRepository = givenAMappingRepository();
        const geeDataSetRepository = givenAGeeDataSetRepository();
        const geeDataRepository = givenAGeeDataValueSetRepository();
        const orgUnitRepository = givenAOrgUnitRepository();
        const dataValueSetRepository = givenADataValueSetRepository();

        const importUseCase = new ImportUseCase(
            ImportRuleRepository,
            mappingRepository,
            geeDataSetRepository,
            geeDataRepository,
            orgUnitRepository,
            dataValueSetRepository
        );

        const result = await importUseCase.execute(defaultImportRule.id);

        const expectedDataValueSet = givenAnExpectedDataValueSet();

        expect(dataValueSetRepository.save).toBeCalledWith(expectedDataValueSet);
        expect(result).toEqual({
            failures: [],
            messages: [
                "6 data values from ERA5 - DAILY google data set.",
                "Imported: 6 - updated: 0 - ignored: 0",
            ],
            success: true,
        });
    });
});

export {};

function givenAGeeDataSetRepository(): GeeDataSetRepository {
    return {
        getByCode: jest.fn().mockImplementation(() => {
            return {
                code: "era5Daily",
                displayName: "ERA5 - DAILY",
                imageCollectionId: "ECMWF/ERA5/DAILY",
                bands: [
                    "mean_2m_air_temperature",
                    "minimum_2m_air_temperature",
                    "maximum_2m_air_temperature",
                    "dewpoint_2m_temperature",
                    "total_precipitation",
                    "surface_pressure",
                    "mean_sea_level_pressure",
                    "u_component_of_wind_10m",
                    "v_component_of_wind_10m",
                ],
                doc:
                    "https://developers.google.com/earth-engine/datasets/catalog/UCSB-CHG_CHIRPS_DAILY",
            };
        }),
    };
}

function givenAOrgUnitRepository(): OrgUnitRepository {
    return {
        getByIds: jest.fn().mockImplementation(() => {
            return [
                { id: "WFAboRxdVjA", coordinates: "[-2.708309,6.675618]", featureType: "POINT" },
            ];
        }),
    };
}

function givenAMappingRepository(): MappingRepository {
    return {
        getAll: jest.fn().mockImplementation(() => {
            return [
                {
                    id: "utQIFECT8tF",
                    name: "ERA",
                    dataSetId: "rayEGGqQwIC",
                    dataSetName: "Climate factors",
                    description: "",
                    geeImage: "era5Daily",
                    attributeMappingDictionary: {
                        minimum_2m_air_temperature: {
                            id: "minimum_2m_air_temperature",
                            geeBand: "minimum_2m_air_temperature",
                            dataElementId: "klaKtwaWAvG",
                            dataElementName: "CC - Temperature min",
                            dataElementCode: "CC - Temperature min",
                            comment: "",
                        },
                        maximum_2m_air_temperature: {
                            id: "maximum_2m_air_temperature",
                            geeBand: "maximum_2m_air_temperature",
                            dataElementId: "c24Y5UNjXyj",
                            dataElementName: "CC - Temperature max",
                            dataElementCode: "CC - Temperature max",
                            comment: "",
                        },
                        mean_2m_air_temperature: {
                            id: "mean_2m_air_temperature",
                            geeBand: "mean_2m_air_temperature",
                            dataElementId: "RSJpUZqMoxC",
                            dataElementName: "CC - Temperature",
                            dataElementCode: "CC - Temperature",
                            comment: "",
                        },
                    },
                    created: new Date(),
                },
            ];
        }),
    };
}

function givenAImportRuleRepository(): ImportRuleRepository {
    return {
        getById: jest.fn().mockImplementation(() => {
            return Maybe.fromValue(defaultImportRule);
        }),
        getAll: jest.fn(),
        deleteById: jest.fn(),
        save: jest.fn().mockImplementation(() => {
            return Either.Success(true);
        }),
    };
}

function givenADataValueSetRepository(): DataValueSetRepository {
    return {
        save: jest.fn().mockImplementation(() => {
            return {
                imported: 6,
                updated: 0,
                ignored: 0,
                deleted: 0,
            };
        }),
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

function givenAnExpectedDataValueSet(): DataValueSet {
    const dataValueSet = {
        dataValues: [
            {
                dataElement: "klaKtwaWAvG",
                orgUnit: "WFAboRxdVjA",
                period: "20180101",
                value: "294.757934570312500000",
            },
            {
                dataElement: "c24Y5UNjXyj",
                orgUnit: "WFAboRxdVjA",
                period: "20180101",
                value: "308.136077880859375000",
            },
            {
                dataElement: "RSJpUZqMoxC",
                orgUnit: "WFAboRxdVjA",
                period: "20180101",
                value: "300.814178466796875000",
            },
            {
                dataElement: "klaKtwaWAvG",
                orgUnit: "WFAboRxdVjA",
                period: "20180102",
                value: "294.919311523437500000",
            },
            {
                dataElement: "c24Y5UNjXyj",
                orgUnit: "WFAboRxdVjA",
                period: "20180102",
                value: "306.922637939453125000",
            },
            {
                dataElement: "RSJpUZqMoxC",
                orgUnit: "WFAboRxdVjA",
                period: "20180102",
                value: "300.292205810546875000",
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
