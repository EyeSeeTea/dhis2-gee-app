import _ from "lodash";
import moment, { Moment } from "moment";
import ee from "@google/earthengine";
import { GeometryPoint, GeometryPolygon, ImageCollection } from "@google/earthengine";
import { InfoDataRowBase, InfoData } from "@google/earthengine";

export type DataSetId = string;
export type Coordinates = [number, number];
export type Interval = { type: "daily"; start: Moment; end: Moment };

export type Geometry =
    | { type: "point"; coordinates: Coordinates }
    | { type: "multi-polygon"; polygonCoordinates: Coordinates[][][] };

export interface GetDataOptions<Band> {
    id: DataSetId;
    bands: Band[];
    geometry: Geometry;
    interval: Interval;
    scale?: number;
}

export type DataItem<Band> = {
    periodId: string;
    date: Moment;
    lat: number;
    lon: number;
    band: Band;
    value: number;
};

export type GeeData<Band> = DataItem<Band>[];

export interface Credentials {
    client_id: string;
    access_token: string;
    expires_in: number;
}

type GeeGeometry = GeometryPoint | GeometryPolygon;

export class EarthEngine {
    static async init(credentials: Credentials) {
        ee.data.setAuthToken(
            credentials.client_id,
            "Bearer",
            credentials.access_token,
            credentials.expires_in,
            null,
            null,
            false
        );

        await new Promise((resolve, reject) => {
            ee.initialize(null, null, resolve, reject);
        });

        return new EarthEngine();
    }

    async getData<Band extends string>(options: GetDataOptions<Band>): Promise<GeeData<Band>> {
        const { id, bands, geometry, interval, scale = 30 } = options;
        const imageCollection = new ee.ImageCollection(id);
        const startDate = getDayString(interval.start);
        const endDate = getDayString(interval.end); // last day is not included
        const engineGeometry = getGeometry(geometry);
        console.log("ee.getImageCollection", { id, bands, startDate, endDate, geometry, scale });

        const rows = await getInfo(
            imageCollection
                .select(bands)
                .filterDate(startDate, endDate)
                .getRegion(engineGeometry, scale)
        );

        const header = rows[0];
        if (!header) throw new Error("Header not found in response");

        const expectedHeader = ["id", "longitude", "latitude", "time", ...bands];
        if (!_.isEqual(header, expectedHeader))
            throw new Error(`Unexpected header: ${JSON.stringify(header)}`);

        const items = _(rows)
            .drop(1)
            .flatMap(row => getGeeItemsFromApiRow(bands, row))
            .value();

        console.log({ rows, items });
        return items;
    }
}

function getDayString(date: Moment): string {
    return date.format("YYYY-MM-DD");
}

function getGeometry(geometry: Geometry): GeeGeometry {
    switch (geometry.type) {
        case "point":
            return ee.Geometry.Point(geometry.coordinates);
        case "multi-polygon":
            return ee.Geometry.MultiPolygon(geometry.polygonCoordinates);
    }
}

function getGeeItemsFromApiRow<Band>(bands: Band[], row: any[]): DataItem<Band>[] {
    const [periodId, lon, lat, time] = _.take(row, 4) as InfoDataRowBase;
    const values = _.drop(row, 4) as number[];
    const date = moment(time);
    const baseItem = { periodId, date, lat, lon };

    return _(bands)
        .zip(values)
        .map(([band, value]) => (!band || _.isNil(value) ? null : { ...baseItem, band, value }))
        .compact()
        .value();
}

async function getInfo(imageCollection: ImageCollection): Promise<InfoData> {
    return new Promise<InfoData>((resolve, reject) => {
        imageCollection.getInfo((data, error) => {
            if (error) {
                reject(error);
            } else if (data) {
                resolve(data);
            } else {
                throw new Error("[getInfo] Error: No data or error");
            }
        });
    });
}
