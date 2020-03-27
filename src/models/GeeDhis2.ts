import _ from "lodash";
import { D2Api, Id, DataValueSetsPostResponse } from "d2-api";
import { DataSetId, Band, GeeData, GetDataOptions, DataItem } from "./EarthEngine";
import { EarthEngine, Interval, Geometry } from "./EarthEngine";

export interface OrgUnit {
    id: Id;
    featureType?: "NONE" | "MULTI_POLYGON" | "POLYGON" | "POINT" | "SYMBOL";
    coordinates?: string;
}

type DataElementId = string;
type OrgUnitId = string;

export interface DataValue {
    dataElement: Id;
    value: string;
    orgUnit: Id;
    period: string;
    attributeOptionCombo?: Id;
    categoryOptionCombo?: Id;
}

export interface DataValueSet {
    dataValues: DataValue[];
}

export interface GetDataValueSetOptions {
    geeDataSetId: DataSetId;
    mapping: Record<Band, DataElementId>;
    orgUnits: OrgUnit[];
    interval: Interval;
    scale?: number;
}

export interface GetDataValuesOptions {
    orgUnitId: string;
    geeData: GeeData;
    mapping: Record<Band, DataElementId>;
}

export class GeeDhis2 {
    constructor(public api: D2Api, public ee: EarthEngine) {}

    static init(api: D2Api, ee: EarthEngine) {
        return new GeeDhis2(api, ee);
    }

    private async getOrgUnitsWithGeometry(orgUnits: OrgUnit[]): Promise<OrgUnit[]> {
        const { api } = this;
        const [ousWithGeometry, ousWithoutGeometry] = _.partition(orgUnits, orgUnitHasGeometry);

        // d2-api supports 2.32 ou.geometry, not 2.30 ou.featureType/coordinates, do custom request
        const orgUnitIds = ousWithoutGeometry.map(ou => ou.id);
        const apiPath = [
            "/metadata?",
            "organisationUnits:fields=id,featureType,coordinates",
            "&",
            `organisationUnits:filter=id:in:[${orgUnitIds.join(",")}]`,
        ].join("");
        const { organisationUnits: organisationUnitsWithGeometryFromDb = [] } = await api
            .get<{ organisationUnits: OrgUnit[] | undefined }>(apiPath)
            .getData();

        return [...ousWithGeometry, ...organisationUnitsWithGeometryFromDb];
    }

    private async getGeometries(
        orgUnits: OrgUnit[]
    ): Promise<Record<OrgUnitId, Geometry | undefined>> {
        const orgUnitsWithGeometry = await this.getOrgUnitsWithGeometry(orgUnits);
        const pairs = orgUnitsWithGeometry.map(orgUnit => {
            const geometry = getGeometryFromOrgUnit(orgUnit);
            return [orgUnit.id, geometry] as [OrgUnitId, Geometry];
        });

        return _.fromPairs(pairs);
    }

    async getDataValueSet(options: GetDataValueSetOptions): Promise<DataValueSet> {
        const { ee } = this;
        const { geeDataSetId, orgUnits, mapping, interval, scale } = options;
        const geometries = await this.getGeometries(orgUnits);
        console.log({ geometries });

        const dataValuesList = await promiseMap(_.toPairs(geometries), async ([ouId, geometry]) => {
            if (!geometry) return [];

            const imageCollectionOptions: GetDataOptions = {
                id: geeDataSetId,
                bands: _.keys(mapping),
                geometry,
                interval,
                scale,
            };

            const geeData = await ee.getData(imageCollectionOptions);
            return this.getDataValues({ orgUnitId: ouId, geeData, mapping });
        });

        return { dataValues: _.flatten(dataValuesList) };
    }

    getDataValues(options: GetDataValuesOptions): DataValue[] {
        const { orgUnitId, geeData, mapping } = options;

        function getDataValue(item: DataItem, dataElementId: DataElementId, band: Band) {
            const value = get(item.values, band);
            if (!value) {
                return null;
            } else {
                return {
                    dataElement: dataElementId,
                    value: value.toFixed(2),
                    orgUnit: orgUnitId,
                    period: item.date.format("YYYYMMDD"),
                };
            }
        }

        return _.flatMap(geeData, item =>
            _(mapping)
                .map((dataElementId, band) => getDataValue(item, dataElementId, band))
                .compact()
                .value()
        );
    }

    async postDataValueSet(dataValueSet: DataValueSet): Promise<DataValueSetsPostResponse> {
        return this.api.dataValues.postSet({}, dataValueSet).getData();
    }
}

function get<T>(obj: Record<string, T>, key: string): T | undefined {
    return obj[key];
}

function getGeometryFromOrgUnit(orgUnit: OrgUnit): Geometry | undefined {
    const coordinates = orgUnit.coordinates ? JSON.parse(orgUnit.coordinates) : null;
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

function orgUnitHasGeometry(orgUnit: OrgUnit) {
    return orgUnit.featureType === "NONE" || orgUnit.coordinates;
}

/* Map sequentially over T[] with an asynchronous function and return array of mapped values */
export function promiseMap<T, S>(inputValues: T[], mapper: (value: T) => Promise<S>): Promise<S[]> {
    const reducer = (acc$: Promise<S[]>, inputValue: T): Promise<S[]> =>
        acc$.then((acc: S[]) =>
            mapper(inputValue).then(result => {
                acc.push(result);
                return acc;
            })
        );
    return inputValues.reduce(reducer, Promise.resolve([]));
}
