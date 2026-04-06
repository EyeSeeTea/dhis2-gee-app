const url = require("url");

const headless = process.env.HEADLESS !== "false";
const dhis2Url = process.env.VITE_DHIS2_URL_TEST || process.env.REACT_APP_DHIS2_URL_TEST || "https://play.dhis2.org/dev";
const appUrl = process.env.VITE_URL_TEST || process.env.REACT_APP_URL_TEST || "http://localhost:8082";
const port = parseInt(url.parse(appUrl).port || "8082", 10);
const startServer = process.env.START_SERVER !== "false";
const serverCommand = `VITE_DHIS2_BASE_URL=${dhis2Url} VITE_PORT=${port} yarn start`;

module.exports = {
    launch: {
        dumpio: true,
        headless: headless,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
    },
    browserContext: "default",
    server: !startServer
        ? undefined
        : {
              command: serverCommand,
              port: port,
              launchTimeout: 30 * 1000,
          },
    config: { dhis2Url, appUrl },
};
