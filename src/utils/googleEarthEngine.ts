import { Config } from "../models/Config";
/* eslint-disable @typescript-eslint/no-var-requires */
const ee = require("@google/earthengine");

export function getConnection(config: Config) {
    const { privateKeyFile } = config.data.base.gee;
    ee.data.authenticateViaPrivateKey(privateKeyFile);
    ee.initialize();
}
