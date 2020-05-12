import _ from "lodash";

import { getImportCountString } from "../../webapp/utils/dhis2";
import { Config } from "../../webapp/models/Config";
import i18n from "../../webapp/locales";
import { EarthEngine, Interval, Credentials } from "../../webapp/models/EarthEngine";
import { GeeDhis2, OrgUnit, DataValueSet } from "../../webapp/models/GeeDhis2";
import { getAttributeMappings, getDataSetValue } from "../../webapp/utils/gee";
import { buildPeriod, downloadFile } from "../../webapp/utils/import";
import { D2Api } from "d2-api";
import { DataImportData } from "../../webapp/models/Import";

//TODO: this use case is the old run method in old import model
// little a little we are going to refactoring this use case 
// creating adapters that invoke it until the usecase has not 
// webapp and infrastructure dependencies
class ImportUseCase {
    constructor(private api: D2Api, private config: Config) { }

    public async execute(
        dryRun: boolean,
        data: DataImportData
    ): Promise<{ success: boolean; failures: string[]; messages: string[] }> {
        let failures: string[] = [];
        let messages: string[] = [];
        try {
            const credentials = await this.api.get<Credentials>("/tokens/google").getData();

            const earthEngine = await EarthEngine.init(credentials);
            const geeDhis2 = GeeDhis2.init(this.api, earthEngine);

            const baseImportConfig: { orgUnits: OrgUnit[]; interval: Interval } = {
                //orgUnits: [{ id: "IyO9ICB0WIn" }, { id: "xloTsC6lk5Q" }],
                orgUnits: data.selectedOUs.map(o => {
                    return {
                        id: o.split("/").pop(),
                    } as OrgUnit;
                }),
                interval: {
                    type: "daily",
                    ...buildPeriod(data.periodInformation),
                },
            };
            let importDataValueSet: DataValueSet = { dataValues: [] };

            await Promise.all(
                data.selectedMappings.map(async selectedMapping => {
                    try {
                        const dataValueSet: DataValueSet = await geeDhis2.getDataValueSet({
                            ...baseImportConfig,
                            geeDataSetId: getDataSetValue(
                                selectedMapping.geeImage,
                                this.config,
                                "pointer"
                            ),
                            mapping: getAttributeMappings(
                                selectedMapping.attributeMappingDictionary
                            ),
                        });

                        importDataValueSet = {
                            dataValues: _.concat(
                                importDataValueSet.dataValues,
                                dataValueSet.dataValues
                            ),
                        };
                        messages = [
                            ...messages,
                            i18n.t("{{n}} data values from {{name}} google data set.", {
                                name: getDataSetValue(
                                    selectedMapping.geeImage,
                                    this.config,
                                    "displayName"
                                ),
                                n: dataValueSet.dataValues.length,
                            }),
                        ];
                    } catch (err) {
                        failures = [...failures, err];
                    }
                })
            );
            if (!dryRun) {
                const res = await geeDhis2.postDataValueSet(importDataValueSet);
                messages = [...messages, getImportCountString(res.importCount)];
            } else {
                messages = [...messages, i18n.t("No effective import into DHIS2, file download")];
                downloadFile({
                    filename: "data.json",
                    mimeType: "application/json",
                    contents: JSON.stringify(importDataValueSet),
                });
            }
            return {
                success: _.isEmpty(failures) && !_.isEmpty(messages),
                messages: messages,
                failures: failures,
            };
        } catch (err) {
            return {
                success: false,
                messages: messages,
                failures: [...failures, i18n.t("Import config failed"), err],
            };
        }
    }
}

export default ImportUseCase;