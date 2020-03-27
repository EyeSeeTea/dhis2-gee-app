import _ from "lodash";
import { D2Api, Id, DataValueSetsPostResponse } from "d2-api";
import { DataSetId, Band, GeeData, GetDataOptions, DataItem } from "./EarthEngine";
import { EarthEngine, Interval, Geometry } from "./EarthEngine";

export interface D2OrgUnit {
    id: Id;
    featureType?: "NONE" | "MULTI_POLYGON" | "POLYGON" | "POINT" | "SYMBOL";
    coordinates?: string;
}

export type D2DataElementId = string;

export interface DataValueSet {
    dataValues: Array<{
        dataElement: Id;
        value: string;
        orgUnit: Id;
        period: string;
        attributeOptionCombo?: Id;
        categoryOptionCombo?: Id;
    }>;
}

export interface GetDataValueSetOptions {
    geeDataSetId: DataSetId;
    mapping: Record<Band, D2DataElementId>;
    orgUnit: D2OrgUnit;
    interval: Interval;
    scale?: number;
}

export interface GetDataValuesOptions {
    orgUnitId: string;
    geeData: GeeData;
    mapping: Record<Band, D2DataElementId>;
}

export class GeeDhis2 {
    constructor(public api: D2Api, public ee: EarthEngine) {}

    static init(api: D2Api, ee: EarthEngine) {
        return new GeeDhis2(api, ee);
    }

    private async getOrgUnit(orgUnitId: Id) {
        const { api } = this;
        // d2-api supports 2.32 ou.geometry, not 2.30 ou.featureType/coordinates, do custom request
        const apiPath = `organisationUnits/${orgUnitId}.json?fields=id,featureType,coordinates`;
        const orgUnit = await api.get<D2OrgUnit | undefined>(apiPath).getData();

        if (!orgUnit) {
            throw new Error(`Org unit not found: ${orgUnitId}`);
        } else {
            return orgUnit;
        }
    }

    private async getGeometry(orgUnit: D2OrgUnit): Promise<Geometry | undefined> {
        const hasMissingCoordinatesInfo = orgUnit.featureType !== "NONE" && !orgUnit.coordinates;
        const orgUnit2 = hasMissingCoordinatesInfo ? await this.getOrgUnit(orgUnit.id) : orgUnit;
        if (!orgUnit2.coordinates) return;
        const coordinates = JSON.parse(orgUnit2.coordinates);

        switch (orgUnit2.featureType) {
            case "POINT":
                return { type: "point", coordinates };
            case "POLYGON":
            case "MULTI_POLYGON":
                return { type: "multi-polygon", polygonCoordinates: coordinates };
            default:
                return;
        }
    }

    async getDataValueSet(options: GetDataValueSetOptions): Promise<DataValueSet> {
        const { ee } = this;
        const { geeDataSetId, orgUnit, mapping, interval, scale } = options;
        const geometry = await this.getGeometry(orgUnit);
        if (!geometry) throw new Error(`Organisation unit has no geometry info: ${orgUnit.id}`);

        const imageCollectionOptions: GetDataOptions = {
            id: geeDataSetId,
            bands: _.keys(mapping),
            geometry,
            interval,
            scale,
        };

        const geeData = await ee.getData(imageCollectionOptions);
        return this.getDataValues({ orgUnitId: orgUnit.id, geeData, mapping });
    }

    getDataValues(options: GetDataValuesOptions): DataValueSet {
        const { orgUnitId, geeData, mapping } = options;

        function getDataValue(item: DataItem, dataElementId: D2DataElementId, band: Band) {
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

        const dataValues = _.flatMap(geeData, item =>
            _(mapping)
                .map((dataElementId, band) => getDataValue(item, dataElementId, band))
                .compact()
                .value()
        );

        return { dataValues };
    }

    async postDataValueSet(dataValueSet: DataValueSet): Promise<DataValueSetsPostResponse> {
        return this.api.dataValues.postSet({}, dataValueSet).getData();
    }
}

function get<T>(obj: Record<string, T>, key: string): T | undefined {
    return obj[key];
}
