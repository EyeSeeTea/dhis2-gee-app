import _ from "lodash";
import moment, { Moment } from "moment";
import ee, {
    GeometryPoint,
    GeometryPolygon,
    ImageCollection,
    InfoDataRowBase,
    InfoData
} from "@google/earthengine";
import {
    GeeDataValueSetRepository,
    GeeDataFilters,
    GeeGeometry
} from "../domain/repositories/GeeDataValueSetRepository";
import { GeeDataValueSet, GeeDataValue } from "../domain/entities/GeeDataValueSet";
import { D2Api } from "d2-api";

type Geometry = GeometryPoint | GeometryPolygon;

export interface geeCredentials {
    client_id: string;
    access_token: string;
    expires_in: number;
}

export class GeeDataEarthEngineRepository implements GeeDataValueSetRepository {
    constructor(private d2Api: D2Api) { }

    async getData<Band extends string>(options: GeeDataFilters<Band>): Promise<GeeDataValueSet<Band>> {
        await this.initializeEngine();

        const { id, bands, geometry, interval, scale = 30 } = options;
        const startDate = this.getDayString(interval.start);
        const endDate = this.getDayString(interval.end); // last day is not included
        const engineGeometry = this.getGeometry(geometry);

        const imageCollection = new ee.ImageCollection(id);
        console.log("ee.getImageCollection", { id, bands, startDate, endDate, geometry, scale });

        const rows = await this.getInfo(
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
            .flatMap(row => this.getGeeItemsFromApiRow(bands, row))
            .value();

        console.log({ rows, items });
        return items;
    }

    private async initializeEngine() {
        const credentials = await this.d2Api.get<geeCredentials>("/tokens/google").getData();

        ee.data.setAuthToken(
            credentials.client_id,
            "Bearer",
            credentials.access_token,
            credentials.expires_in,
            null,
            null,
            false
        );

        await ee.initialize();
    }

    private getDayString(date: Moment): string {
        return date.format("YYYY-MM-DD");
    }

    private getGeometry(geometry: GeeGeometry): Geometry {
        switch (geometry.type) {
            case "point":
                return ee.Geometry.Point(geometry.coordinates);
            case "multi-polygon":
                return ee.Geometry.MultiPolygon(geometry.polygonCoordinates);
        }
    }

    private getGeeItemsFromApiRow<Band>(bands: Band[], row: any[]): GeeDataValue<Band>[] {
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

    private async getInfo(imageCollection: ImageCollection): Promise<InfoData> {
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
}


