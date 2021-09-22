import { DataStore } from "@eyeseetea/d2-api/api/dataStore";
import axios from "axios";
import moment from "moment";
import { Maybe } from "../domain/common/Maybe";
import { GeeDataSet } from "../domain/entities/GeeDataSet";
import { GeeDataSetRepository, GeeDataSetsFilter } from "../domain/repositories/GeeDataSetRepository";
import { promiseMap } from "../domain/utils";

const geeDataSetCatalog = "https://earthengine-stac.storage.googleapis.com/catalog/catalog.json";

export class GeeDataSetFileRepository implements GeeDataSetRepository {
    private cachedGeeDataSets: GeeDataSetsCache | undefined;

    constructor(private dataStore: DataStore, private dataStoreKey: string) {}

    async getAll(filter?: GeeDataSetsFilter): Promise<GeeDataSet[]> {
        const dataSets = await this.getDataSets();

        const filteredDataSets = dataSets
            .filter(dataSet => dataSet.type === "image_collection")
            .filter(dataSet => {
                return filter && filter.search
                    ? dataSet.imageCollectionId.toLowerCase().includes(filter.search.toLowerCase()) ||
                          dataSet.displayName.toLowerCase().includes(filter.search.toLowerCase()) ||
                          dataSet.keywords.includes(filter.search.toLowerCase())
                    : true;
            })
            .filter(dataSet => (filter && filter.cadence ? dataSet.cadence?.includes(filter.cadence) : true));
        return filteredDataSets;
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
            const dataSets = await this.getDatasetsFromDataStore();

            if (dataSets && moment(new Date()).diff(moment(dataSets.lastUpdated), "days") < 7) {
                this.cachedGeeDataSets = dataSets;

                return this.cachedGeeDataSets.dataSets;
            } else {
                const dataSets = await this.getDatasetsFromGeeCatalog();

                await this.saveDatasetsInDataStore(dataSets);

                this.cachedGeeDataSets = dataSets;

                return this.cachedGeeDataSets.dataSets;
            }
        }
    }

    private async getDatasetsFromGeeCatalog(): Promise<GeeDataSetsCache> {
        const datasets = await axios.get(geeDataSetCatalog);

        const links = datasets.data.links.filter((link: any) => link.rel === "child").map((link: any) => link.href);

        const fullDatasets: GeeDataSet[] = await promiseMap(links, (link: string) =>
            this.getDatasetFromGeeCatalog(link)
        );

        return {
            lastUpdated: new Date().toISOString(),
            dataSets: fullDatasets,
        };
    }

    private async getDatasetFromGeeCatalog(url: string): Promise<GeeDataSet> {
        const response = await axios.get(url);

        const data = response.data;

        const id = data.id.replace(new RegExp("/", "g"), "-");

        // TODO: This was a quick fix to get the data from the catalog.
        const getProperty = (property: string): any => {
            return data.properties?.[property] ?? data.summaries?.[property] ?? data[property];
        };

        const geeDataset = {
            id: id,
            imageCollectionId: data.id,
            displayName: data.title,
            type: getProperty("gee:type"),
            description: data.description,
            doc: `https://developers.google.com/earth-engine/datasets/catalog/${data.id}`,
            cadence: getProperty("gee:cadence"),
            bands: getProperty("eo:bands")?.map((band: any) => {
                return {
                    name: band.name,
                    units: band["gee:unit"],
                    description: band.description,
                };
            }),
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
