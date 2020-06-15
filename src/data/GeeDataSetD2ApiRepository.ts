import { GeeDataSetRepository } from "../domain/repositories/GeeDataSetRepository";
import { GeeDataSet } from "../domain/entities/GeeDataSet";
import axios from "axios";
import DataStore from "d2-api/api/dataStore";
import moment from "moment";
import { Maybe } from "../domain/common/Maybe";

const geeDataSetCatalog = "https://earthengine-stac.storage.googleapis.com/catalog/catalog.json";

export class GeeDataSetFileRepository implements GeeDataSetRepository {
    private cachedGeeDataSets: GeeDataSetsCache | undefined;

    constructor(private dataStore: DataStore, private dataStoreKey: string) { }

    async getAll(): Promise<GeeDataSet[]> {
        const dataSets = await this.getDataSets();
        console.log("getAll", dataSets);
        return dataSets;
    }

    async getById(id: string): Promise<Maybe<GeeDataSet>> {
        const dataSets = await this.getDataSets();
        const dataSetResult = Maybe.fromValue(dataSets.find(ds => ds.id === id));

        return dataSetResult;
    }

    private async getDataSets(): Promise<GeeDataSet[]> {
        if (this.cachedGeeDataSets) {
            return this.cachedGeeDataSets.dataSets;
        } else {
            console.log("loadDataSets");
            const dataSets = await this.getDatasetsFromDataStore();
            console.log({ dataSets });

            if (dataSets && moment(new Date()).diff(moment(dataSets.lastUpdated), "days") < 7) {
                console.log("cached datasets from data store is valid");
                this.cachedGeeDataSets = dataSets;

                return this.cachedGeeDataSets.dataSets;
            } else {
                console.log("getDatasetsFromGeeCatalog");
                const dataSets = await this.getDatasetsFromGeeCatalog();

                await this.saveDatasetsInDataStore(dataSets);

                console.log({ dataSets });

                this.cachedGeeDataSets = dataSets;

                return this.cachedGeeDataSets.dataSets;
            }
        }
    }

    private async getDatasetsFromGeeCatalog(): Promise<GeeDataSetsCache> {
        const datasets = await axios.get(geeDataSetCatalog);

        const links = datasets.data.links
            .filter((link: any) => link.rel === "child")
            .map((link: any) => link.href);

        const fullDatasets: GeeDataSet[] = await Promise.all(
            links.map(async (link: any) => {
                return await this.getDatasetFromGeeCatalog(link);
            })
        );

        return {
            lastUpdated: new Date().toISOString(),
            dataSets: fullDatasets,
        };
    }

    private async getDatasetFromGeeCatalog(url: string): Promise<GeeDataSet> {
        const response = await axios.get(url);

        const data = response.data;

        const geeDataset = {
            id: data.id.replace("/", "-"),
            imageCollectionId: data.id,
            displayName: data.title,
            type: data.properties["gee:type"],
            description: data.description,
            doc: `https://developers.google.com/earth-engine/datasets/catalog/${data.id}`,
            cadence: data.properties["gee:cadence"],
            bands: data.properties["eo:bands"]
                ? data.properties["eo:bands"].map((band: any) => {
                    return {
                        name: band.name,
                        units: band["gee:unit"],
                        description: band.description,
                    };
                })
                : undefined,
            keywords: data.keywords,
        };

        return geeDataset;
    }

    private async getDatasetsFromDataStore(): Promise<GeeDataSetsCache | undefined> {
        const data = await this.dataStore.get<GeeDataSetsCache>(this.dataStoreKey).getData();

        return data;
    }

    private async saveDatasetsInDataStore(imporRulesData: GeeDataSetsCache): Promise<void> {
        this.dataStore.save(this.dataStoreKey, imporRulesData);
    }
}

export type GeeDataSetsCache = {
    lastUpdated: string;
    dataSets: GeeDataSet[];
};
