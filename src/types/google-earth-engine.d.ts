declare module "@google/earthengine" {
    export var data: Data;
    export function initialize(
        opt_baseurl?: Maybe<string>,
        opt_tileurl?: Maybe<string>,
        opt_successCallback?: Maybe<Callback>,
        opt_errorCallback?: Maybe<Callback>,
        opt_xsrfToken?: Maybe<string>
    );

    export class ImageCollection {
        constructor(dataSetId: string);
        select(bands: string[]): this;
        filterDate(startDate: string, endDater: string): this;
        getRegion(geometry: GeometryInstance, scale: number): this;
        getInfo(onFinish: (data?: InfoData, error?: string) => void): void;
    }

    // [periodId, lon, lat, time, ...number]
    declare type InfoData = Array<any[]>;

    declare type Coordinates = [number, number];

    declare interface Geometry {
        Point(coordinates: Coordinates): GeometryPoint;
        MultiPolygon(Coordinates: Coordinates[][][]): GeometryPolygon;
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
