import { EarthEngine } from "./../types/google-earth-engine";
import _ from "lodash";
import moment, { Moment } from "moment";
import {
    GeometryPoint,
    GeometryPolygon,
    InfoDataRowBase,
    InfoData,
    Image,
    Region,
    ImageCollection,
    DataSetInfoData,
} from "../types/google-earth-engine";
import {
    GeeDataValueSetRepository,
    GeeDataFilters,
    GeeGeometry,
} from "../domain/repositories/GeeDataValueSetRepository";
import { GeeDataValueSet, GeeDataValue } from "../domain/entities/GeeDataValueSet";
import { D2Api } from "d2-api";

type Geometry = GeometryPoint | GeometryPolygon;

export interface GeeCredentials {
    client_id: string;
    access_token: string;
    expires_in: number;
}

export class GeeDataEarthEngineRepository implements GeeDataValueSetRepository {
    constructor(private d2Api: D2Api, private ee: EarthEngine) {}

    async getData<Band extends string>(
        options: GeeDataFilters<Band>
    ): Promise<GeeDataValueSet<Band>> {
        await this.initializeEngine();

        const { id, bands, geometry, interval, scale = 30 } = options;
        const startDate = this.getDayString(interval.start);
        const endDate = this.getDayString(interval.end); // last day is not included
        const engineGeometry = this.getGeometry(geometry);

        if (geometry.type === "point") {
            return await this.retrieveByPoint<Band>(
                id,
                bands,
                startDate,
                endDate,
                geometry,
                engineGeometry,
                scale
            );
        } else {
            return await this.retrieveByPolygon<Band>(
                id,
                bands,
                startDate,
                endDate,
                geometry,
                engineGeometry
            );
        }
    }

    private async retrieveByPoint<Band extends string>(
        id: string,
        bands: Band[],
        startDate: string,
        endDate: string,
        geometry: GeeGeometry,
        engineGeometry: object,
        scale: number
    ): Promise<GeeDataValueSet<Band>> {
        const { ee } = this;
        const imageCollection = new ee.ImageCollection(id)
            .select(bands)
            .filterDate(startDate, endDate);

        const region = imageCollection.getRegion(engineGeometry, scale);

        console.log("ee.Region", { id, bands, startDate, endDate, engineGeometry, scale });

        const rows = await this.getInfo(region);

        const header = rows[0];
        if (!header) throw new Error("Header not found in response");

        const expectedHeader = ["id", "longitude", "latitude", "time", ...bands];
        if (!_.isEqual(header, expectedHeader))
            throw new Error(`Unexpected header: ${JSON.stringify(header)}`);

        const items = _(rows)
            .drop(1)
            .flatMap(row => this.getGeeItemsFromApiRow(bands, row, geometry))
            .value();

        console.log({ rows, items });
        return items;
    }

    private async retrieveByPolygon<Band extends string>(
        id: string,
        bands: Band[],
        startDate: string,
        endDate: string,
        geometry: GeeGeometry,
        engineGeometry: object
    ): Promise<GeeDataValueSet<Band>> {
        const { ee } = this;
        const imageCollection = new ee.ImageCollection(id)
            .select(bands)
            .filterDate(startDate, endDate);

        const reducedCollection = imageCollection.map((image: Image) => {
            const dictionary = image.reduceRegion({
                reducer: ee.Reducer.mean(),
                geometry: engineGeometry,
                bestEffort: true,
            });

            return ee.Image(image.setMulti(dictionary));
        });

        const collectionData = await this.getCollectionInfo(reducedCollection);

        const result = _(bands)
            .flatMap((band: Band) => {
                return collectionData.features.map((feature: any) => {
                    const dataValue = {
                        band,
                        value: feature.properties[band],
                        geometry: geometry,
                        periodId: feature.properties["system:index"],
                        date: moment(feature.properties["system:time_start"]),
                    };
                    return dataValue;
                });
            })
            .value();

        return result.filter(dataValue => dataValue.value);
    }

    private async initializeEngine() {
        const { ee } = this;
        const credentials = await this.d2Api.get<GeeCredentials>("/tokens/google").getData();

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
        const { ee } = this;
        switch (geometry.type) {
            case "point":
                return ee.Geometry.Point(geometry.coordinates);
            case "multi-polygon":
                return ee.Geometry.MultiPolygon(geometry.polygonCoordinates);
        }
    }

    private getGeeItemsFromApiRow<Band>(
        bands: Band[],
        row: any[],
        geometry: GeeGeometry
    ): GeeDataValue<Band>[] {
        const [periodId, , , time] = _.take(row, 4) as InfoDataRowBase;
        const values = _.drop(row, 4) as number[];
        const date = moment(time);
        const baseItem = { periodId, date, geometry };

        return _(bands)
            .zip(values)
            .map(([band, value]) => (!band || _.isNil(value) ? null : { ...baseItem, band, value }))
            .compact()
            .value();
    }

    private async getInfo(region: Region): Promise<InfoData> {
        return new Promise<InfoData>((resolve, reject) => {
            region.getInfo((data, error) => {
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

    private async getCollectionInfo(image: ImageCollection): Promise<DataSetInfoData> {
        return new Promise<DataSetInfoData>((resolve, reject) => {
            image.getInfo((data, error) => {
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
