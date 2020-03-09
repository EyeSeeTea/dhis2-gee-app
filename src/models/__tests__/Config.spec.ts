import { Config } from "../Config";
import { getTestContext } from "../../utils/tests";

const { api, mock } = getTestContext();
let config: Config;

describe("Config", () => {
    describe("build", () => {
        beforeAll(async () => {
            mock.onGet("/metadata", {
                params: {
                    "categoryCombos:fields": "code,id",
                },
            }).replyOnce(200, { categoryCombos: [] });

            config = await Config.build(api);
        });

        it("has base config", () => {
            expect(config.data.base).toEqual({});
        });

        it("has category combos", () => {
            expect(config.data.categoryCombos).toEqual([]);
        });
    });
});
