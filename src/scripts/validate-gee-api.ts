import { DataStore, DataStoreKeyMetadata } from "@eyeseetea/d2-api/api/dataStore";
import { command, run } from "cmd-ts";
import path from "path";
import { GeeDataSetFileRepository } from "../data/GeeDataSetD2ApiRepository";
import { D2Api, D2ApiResponse } from "../types/d2-api";

function main() {
    const cmd = command({
        name: path.basename(__filename),
        description: "Validate Google Earth Engine API",
        args: {},
        handler: async args => {
            console.debug(args);

            const geeDataSetRepository = new GeeDataSetFileRepository(new FakeDataStore(), "");
            const dataSets = await geeDataSetRepository.getAll();
            console.log(dataSets);
        },
    });

    run(cmd, process.argv.slice(2));
}

class FakeDataStore extends DataStore {
    constructor() {
        super(new D2Api(), "global", "");
    }

    getKeys(): D2ApiResponse<string[]> {
        return new D2ApiResponse(
            () => {},
            Promise.resolve({
                data: [],
                status: 200,
                headers: {},
            })
        );
    }

    get<T>(_key: string): D2ApiResponse<T | undefined> {
        return new D2ApiResponse(
            () => {},
            Promise.resolve({
                data: undefined,
                status: 200,
                headers: {},
            })
        );
    }

    save(_key: string, _value: object): D2ApiResponse<void> {
        return new D2ApiResponse(
            () => {},
            Promise.resolve({
                data: undefined,
                status: 200,
                headers: {},
            })
        );
    }

    delete(_key: string): D2ApiResponse<boolean> {
        return new D2ApiResponse(
            () => {},
            Promise.resolve({
                data: true,
                status: 200,
                headers: {},
            })
        );
    }

    getMetadata(_key: string): D2ApiResponse<DataStoreKeyMetadata | undefined> {
        return new D2ApiResponse(
            () => {},
            Promise.resolve({
                data: undefined,
                status: 200,
                headers: {},
            })
        );
    }
}

main();
