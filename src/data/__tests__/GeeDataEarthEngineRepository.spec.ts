import { GeeDataEarthEngineRepository } from "../GeeDataEarthEngineRepository";
import { ImageCollection, InfoData } from "@google/earthengine";
import { D2ApiDefault } from "d2-api";
import { Params, D2ApiResponse, D2Response } from "d2-api/api/common";
import moment from "moment";
import { GeeDataFilters } from "../../domain/repositories/GeeDataRepository";

jest.mock("@google/earthengine");
jest.mock("d2-api");

const MockImageCollection = ImageCollection as jest.Mock<ImageCollection>;
const MockD2ApiDefault = D2ApiDefault as jest.Mock<D2ApiDefault>;
const mockedImageCollection: any = {};

describe("GeeDataEarthEngineRepository", () => {
    beforeEach(() => {
        MockImageCollection.mockClear();
        MockD2ApiDefault.mockClear();
    });

    describe("gee interaction", () => {
        it("should to have been called successfully", async () => {
            givenAGeeImageCollection();
            const d2Api = givenAD2Api();
            const geeDataRepository = new GeeDataEarthEngineRepository(d2Api)

            const filters: GeeDataFilters<string> = {
                id: "GeeDataSetId",
                bands: ["minimum_2m_air_temperature",
                    "maximum_2m_air_temperature",
                    "mean_2m_air_temperature"],
                geometry: { type: "point", coordinates: [3000, 3000] },
                interval: { type: "daily", start: moment("2000-12-01"), end: moment("2000-12-31") }
            }
            const result = await geeDataRepository.getData(filters);

            console.log({ result });

            expect(MockImageCollection).toHaveBeenCalledTimes(1);
            expect(mockedImageCollection.select).toHaveBeenCalledTimes(1);
            expect(mockedImageCollection.filterDate).toHaveBeenCalledTimes(1);
            expect(mockedImageCollection.getRegion).toHaveBeenCalledTimes(1);
            expect(mockedImageCollection.getInfo).toHaveBeenCalledTimes(1);
        });
    });
});

export { };

function givenAGeeImageCollection() {
    mockedImageCollection.select = jest.fn().mockImplementation(() => mockedImageCollection);
    mockedImageCollection.filterDate = jest.fn().mockImplementation(() => mockedImageCollection);
    mockedImageCollection.getRegion = jest.fn().mockImplementation(() => mockedImageCollection);
    mockedImageCollection.getInfo =
        jest.fn().mockImplementation(
            (onFinish: (data?: InfoData, error?: string) => void) => onFinish([
                [
                    "id",
                    "longitude",
                    "latitude",
                    "time",
                    "minimum_2m_air_temperature",
                    "maximum_2m_air_temperature",
                    "mean_2m_air_temperature"
                ],
                [
                    "20180101",
                    -2.55736886659566,
                    6.695188728307,
                    1514764800000,
                    294.7579345703125,
                    308.13607788085938,
                    300.81417846679688
                ]]));

    MockImageCollection.mockImplementation(() => {
        return mockedImageCollection;
    });

    //return obj:
}

function givenAD2Api(): D2ApiDefault {
    const mockedD2ApiDefault: any = {};

    mockedD2ApiDefault.get = (url: string, params?: Params) => {
        const reponse = new Promise<D2Response<any>>((resolve, reject) => {
            resolve({
                status: 200,
                data: {
                    client_id: "fake client_id",
                    access_token: "fake access_token",
                    expires_in: 200,
                },
                headers: {}
            });
        });

        return D2ApiResponse.build({ response: reponse })
    }

    MockD2ApiDefault.mockImplementation(() => {
        return mockedD2ApiDefault;
    });

    return new D2ApiDefault();
}