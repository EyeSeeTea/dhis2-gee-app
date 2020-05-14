import _ from "lodash";
import { D2Api, DataValueSetsPostResponse } from "d2-api";
import {
    GeeDataSetId,
    GeeInterval,
    GeeGeometry,
    GeeDataFilters,
    GeeDataRepository
} from "../../domain/repositories/GeeDataRepository";
import { GeeDataItem } from "../../domain/entities/GeeData";
import { DataValueSet, DataValue } from "../../domain/entities/DataValue";
import { OrgUnit } from "../../domain/entities/OrgUnit";

type DataElementId = string;

export interface GetDataValueSetOptions<Band extends string> {
    geeDataSetId: GeeDataSetId;
    mapping: Record<Band, DataElementId>;
    orgUnits: OrgUnit[];
    interval: GeeInterval;
    scale?: number;
}


export class GeeDhis2 {
    constructor(public api: D2Api, public geeDataRepository: GeeDataRepository) { }

    static init(api: D2Api, geeDataRepository: GeeDataRepository) {
        return new GeeDhis2(api, geeDataRepository);
    }

    async getDataValueSet<Band extends string>(
        options: GetDataValueSetOptions<Band>
    ): Promise<DataValueSet> {
        const { geeDataRepository } = this;
        const { geeDataSetId, orgUnits, mapping, interval, scale } = options;

        const dataValuesList = await promiseMap(orgUnits, async (orgUnit) => {
            const geometry = getGeometryFromOrgUnit(orgUnit);

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

    mapGeeDataItemToDataValue<Band extends string>(
        item: GeeDataItem<Band>, orgUnitId: string,
        mapping: Record<Band, DataElementId>): DataValue | undefined {

        const { date, band, value } = item;
        const dataElementId = get(mapping, band);

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

function get<K extends keyof T, T>(obj: T, key: K): T[K] | undefined {
    return obj[key];
}

function getGeometryFromOrgUnit(orgUnit: OrgUnit): GeeGeometry | undefined {
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

/* Map sequentially over T[] with an async function and return array of mapped values */
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
