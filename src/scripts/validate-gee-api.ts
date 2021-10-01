import { DataStore, DataStoreKeyMetadata } from "@eyeseetea/d2-api/api/dataStore";
import { command, run } from "cmd-ts";
import _ from "lodash";
import path from "path";
import { GeeApiDataSet, GeeApiEoBand, GeeDataSetD2ApiRepository } from "../data/GeeDataSetD2ApiRepository";
import { Codec, Schema } from "../domain/utils/codec";
import { D2Api, D2ApiResponse } from "../types/d2-api";

export async function validateApi(): Promise<Array<{ id: string; url?: string; error: string }>> {
    const repository = new GeeDataSetD2ApiRepository(new FakeDataStore(), "");
    const dataSets = await repository.getGeeApi();

    return _(dataSets)
        .map(dataSet => {
            const validation = DataSetModel.decode(dataSet);
            const error = validation.leftToMaybe().extract();
            const url = dataSet.links?.find(item => item.rel === "self")?.href;

            return error ? { id: dataSet.id, url, error } : undefined;
        })
        .compact()
        .value();
}

function main() {
    const cmd = command({
        name: path.basename(__filename),
        description: "Validate Google Earth Engine API",
        args: {},
        handler: async () => {
            const errors = await validateApi();

            if (errors.length > 0) {
                errors.forEach(({ id, url, error }) =>
                    console.error([`Data Set: ${id}`, `Url: ${url}`, error, ""].join("\n"))
                );

                console.error(`Found ${errors.length} errors`);
            } else {
                console.log("No errors");
            }
        },
    });

    run(cmd, process.argv.slice(2));
}

class FakeDataStore extends DataStore {
    constructor() {
        super(new D2Api(), "global", "");
    }

    getKeys(): D2ApiResponse<string[]> {
        return new D2ApiResponse(() => {}, Promise.resolve({ data: [], status: 200, headers: {} }));
    }

    get<T>(_key: string): D2ApiResponse<T | undefined> {
        return new D2ApiResponse(() => {}, Promise.resolve({ data: undefined, status: 200, headers: {} }));
    }

    save(_key: string, _value: object): D2ApiResponse<void> {
        return new D2ApiResponse(() => {}, Promise.resolve({ data: undefined, status: 200, headers: {} }));
    }

    delete(_key: string): D2ApiResponse<boolean> {
        return new D2ApiResponse(() => {}, Promise.resolve({ data: true, status: 200, headers: {} }));
    }

    getMetadata(_key: string): D2ApiResponse<DataStoreKeyMetadata | undefined> {
        return new D2ApiResponse(() => {}, Promise.resolve({ data: undefined, status: 200, headers: {} }));
    }
}

main();

const EoBandModel: Codec<GeeApiEoBand> = Schema.object({
    name: Schema.string,
    description: Schema.string,
    "gee:units": Schema.optional(Schema.string),
});

const DataSetModel: Codec<GeeApiDataSet> = Schema.object({
    id: Schema.string,
    title: Schema.string,
    description: Schema.string,
    keywords: Schema.array(Schema.string),
    "gee:type": Schema.string,
    summaries: Schema.object({
        "eo:bands": Schema.optional(Schema.array(EoBandModel)),
    }),
    properties: Schema.optional(Schema.object({})),
    links: Schema.optional(
        Schema.array(
            Schema.object({
                rel: Schema.string,
                href: Schema.string,
                type: Schema.optional(Schema.string),
            })
        )
    ),
});
