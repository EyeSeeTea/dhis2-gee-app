import * as core from "@actions/core";
import { validateApi } from "../../../src/scripts/validate-gee-api";

async function run(): Promise<void> {
    try {
        core.debug("Checking Google Earth Engine API");

        const errors = await validateApi();

        if (errors.length > 0) {
            errors.forEach(({ id, url, error }) =>
                core.error([`Data Set: ${id}`, `Url: ${url}`, error, ""].join("\n"))
            );

            core.setFailed(`Found ${errors.length} errors`);
        } else {
            core.setOutput("time", new Date().toTimeString());
        }
    } catch (error: any) {
        core.setFailed(error.message);
    }
}

run();
