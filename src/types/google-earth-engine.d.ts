declare module "@google/earthengine" {
    export var data: Data;
    export function initialize(
        opt_baseurl?: Maybe<string>,
        opt_tileurl?: Maybe<string>,
        opt_successCallback?: Maybe<Callback>,
        opt_errorCallback?: Maybe<Callback>,
        opt_xsrfToken?: Maybe<string>
    );

    export class Region {
        getInfo(onFinish: (data?: InfoData, error?: string) => void): void;
    }

    export class ImageCollection {
        constructor(dataSetId: string);
        select(bands: string[]): this;
        filterDate(startDate: string, endDater: string): this;
        getInfo(onFinish: (data?: DataSetInfoData, error?: string) => void): void;
        map(image: any): this;
        getRegion(geometry: GeometryInstance, scale: number): Region;
    }

    declare type PropertiesDicctionary = {
        [name: string]: any;
    };

    declare type DataSetInfoData = {
        type: string;
        properties: PropertiesDicctionary;
        features: DataSetInfoData[];
    };

    declare function Image(Image);

    export class Image {
        setMulti(properties: PropertiesDicctionary);
        reduceRegion(params: ReduceRegionParams);
    }

    export type ReduceRegionParams = {
        reducer: Reducer;
        geometry?: GeometryInstance = null;
        scale?: number = null;
        bestEffort?: boolean = false;
        maxPixels?: number = 10000000;
        tileScale?: number = 1;
    };

    export class List {
        getInfo(): any[];
    }

    declare type Reducer<Input, Output> = (input: Input) => Output;

    export var Reducer: { [name: string]: Reducer } = {
        median = () => {},
    };

    // [periodId, lon, lat, time, ...number]
    declare type InfoData = Array<any[]>;

    declare type Coordinates = [number, number];

    declare interface Geometry {
        Point(coordinates: Coordinates): GeometryPoint;
        MultiPolygon(Coordinates: any): GeometryPolygon;
    }

    declare interface Data {
        setAuthToken: (
            clientId: string,
            tokenType: string,
            accessToken: string,
            expiresIn: number,
            extraScopes: Maybe<string[]>,
            callback: Maybe<Callback>,
            updateAuthLibrary: boolean
        ) => void;
    }

    declare type GeometryPoint = object;
    declare type GeometryPolygon = object;
    type GeometryInstance = GeometryPoint | GeometryPolygon;

    // [periodId, lon, lat, time]
    declare type InfoDataRowBase = [string, number, number, number];

    export var Geometry: Geometry;
}

type Maybe<T> = T | undefined | null;
type Callback = () => void;
