export interface EarthEngine {
    data: Data;
    initialize(): void;

    Geometry: Geometry;
    Image(s: any): Image;
    ImageCollection: {
        new (dataSetId: string): ImageCollection;
    };
    Reducer: {
        mean(): any;
    };
}

export interface Region {
    getInfo(onFinish: (data?: InfoData, error?: string) => void): unknown;
}

export interface ImageCollection {
    select(bands: string[]): this;
    filterDate(startDate: string, endDater: string): this;
    getInfo(onFinish: (data?: DataSetInfoData, error?: string) => void): unknown;
    map(image: any): this;
    getRegion(geometry: GeometryInstance, scale: number): Region;
}

type PropertiesDictionary = {
    [name: string]: any;
};

export type DataSetInfoData = {
    type: string;
    properties: PropertiesDictionary;
    features: DataSetInfoData[];
};

export interface Image {
    setMulti(properties: PropertiesDictionary): unknown;
    reduceRegion(params: ReduceRegionParams): PropertiesDictionary;
}

export interface ReduceRegionParams {
    reducer: Reducer<any, any>;
    geometry?: GeometryInstance;
    scale?: number;
    bestEffort?: boolean;
    maxPixels?: number;
    tileScale?: number;
}

export interface List {
    getInfo(): any[];
}

type Reducer<Input, Output> = (input: Input) => Output;

// [periodId, lon, lat, time, ...number]
export type InfoData = Array<any[]>;

export type Coordinates = [number, number];

export interface Geometry {
    Point(coordinates: Coordinates): GeometryPoint;
    MultiPolygon(Coordinates: any): GeometryPolygon;
}

export interface Data {
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

export type GeometryPoint = object;
export type GeometryPolygon = object;
export type GeometryInstance = GeometryPoint | GeometryPolygon;

// [periodId, lon, lat, time]
export type InfoDataRowBase = [string, number, number, number];

type Maybe<T> = T | undefined | null;
type Callback = () => void;
