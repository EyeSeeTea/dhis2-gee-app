import _ from "lodash";
import moment, { Moment } from "moment";

export type GoogleEarthEngine = any;
export type DataSetId = string;
export type Band = string;
export type Coordinates = [number, number];
export type Interval = { type: "daily"; start: Moment; end: Moment };

export type Geometry =
    | { type: "point"; coordinates: Coordinates }
    | { type: "multi-polygon"; polygonCoordinates: Coordinates[][][] };

export interface GetDataOptions {
    id: DataSetId;
    bands: Band[];
    geometry: Geometry;
    interval: Interval;
    scale?: number;
}

export type DataItem = {
    periodId: string;
    date: Moment;
    lat: number;
    lon: number;
    values: Record<Band, number>;
};

export type GeeData = DataItem[];

export interface Credentials {
    client_id: string;
    access_token: string;
    expires_in: number;
}

type GeeGeometry = any;
type GeeImageCollection = any;

export class EarthEngine {
    constructor(public gee: GoogleEarthEngine) {}

    static async init(gee: GoogleEarthEngine, credentials: Credentials) {
        gee.data.setAuthToken(
            credentials.client_id,
            "Bearer",
            credentials.access_token,
            credentials.expires_in,
            null,
            null,
            false
        );
        await new Promise((resolve, reject) => {
            gee.initialize(null, null, resolve, reject);
        });

        return new EarthEngine(gee);
    }

    async getData(options: GetDataOptions): Promise<GeeData> {
        const { gee } = this;
        const { id, bands, geometry, interval, scale = 30 } = options;

        const imageCollection = new gee.ImageCollection(id);
        const startDate = getDayString(interval.start);
        const endDate = getDayString(interval.end); // last day is not included
        const engineGeometry = getGeometry(gee, geometry);
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
            .map(row => getGeeItemFromApiRow(bands, row))
            .value();
        console.log({ rows, items });

        return items;
    }
}

function getDayString(date: Moment): string {
    return date.format("YYYY-MM-DD");
}

function getGeometry(gee: GoogleEarthEngine, geometry: Geometry): GeeGeometry {
    switch (geometry.type) {
        case "point":
            return gee.Geometry.Point(geometry.coordinates);
        case "multi-polygon":
            return gee.Geometry.MultiPolygon(geometry.polygonCoordinates);
    }
}

function getGeeItemFromApiRow(bands: Band[], row: any[]): DataItem {
    const [periodId, lon, lat, time] = _.take(row, 4) as [string, number, number, number];
    const valuesForBands = _.drop(row, 4) as number[];
    const values: Record<Band, number> = _.fromPairs(_.zip(bands, valuesForBands));
    const date = moment(time);
    const item: DataItem = { periodId, date, lat, lon, values };
    return item;
}

async function getInfo(imageCollection: GeeImageCollection): Promise<Array<any[]>> {
    return new Promise(resolve => {
        imageCollection.getInfo(resolve);
    });
}
