import { DataStore } from "@eyeseetea/d2-api/api/dataStore";
import axios from "axios";
import moment from "moment";
import { Maybe } from "../domain/common/Maybe";
import { GeeDataSet } from "../domain/entities/GeeDataSet";
import { GeeDataSetRepository, GeeDataSetsFilter } from "../domain/repositories/GeeDataSetRepository";
import _ from "lodash";

export class GeeDataSetD2ApiRepository implements GeeDataSetRepository {
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

    async getGeeApi(): Promise<GeeApiDataSet[]> {
        const geeDataSetCatalog = "https://storage.googleapis.com/earthengine-stac/catalog/catalog.json";
        const { data: catalog } = await axios.get<GeeApiCatalog>(geeDataSetCatalog);
        const links = catalog.links.filter(link => link.rel === "child").map(link => link.href);

        // Fetch parent links to fetch data for child links and flatten the result
        const childrensCatalog = await Promise.all(
            links.map(async link => {
                const { data } = await axios.get<GeeApiCatalog>(link);
                const childLinks = data.links?.filter(link => link.rel === "child").map(link => link.href) || [];

                return Promise.all(
                    childLinks.map(async childLink => {
                        const { data: childData } = await axios.get<GeeApiDataSet>(childLink);
                        return childData;
                    })
                );
            })
        );
        return _.flatten(childrensCatalog);
    }

    private async getDataSets(): Promise<GeeDataSet[]> {
        if (this.cachedGeeDataSets) {
            return this.cachedGeeDataSets.dataSets;
        }

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

    private async getDatasetsFromGeeCatalog(): Promise<GeeDataSetsCache> {
        const apiDataSets = await this.getGeeApi();
        const dataSets = apiDataSets.map(dataset => mapGeeDataSet(dataset));

        return { lastUpdated: new Date().toISOString(), dataSets };
    }

    private async getDatasetsFromDataStore(): Promise<GeeDataSetsCache | undefined> {
        const data = await this.dataStore.get<GeeDataSetsCache>(this.dataStoreKey).getData();
        return data;
    }

    private async saveDatasetsInDataStore(imporRulesData: GeeDataSetsCache): Promise<void> {
        this.dataStore.save(this.dataStoreKey, imporRulesData);
    }
}

function mapGeeDataSet(data: GeeApiDataSet): GeeDataSet {
    const id = data.id.replace(new RegExp("/", "g"), "-");

    const getProperty = (property: string): any => {
        return data.properties?.[property] ?? data.summaries?.[property] ?? data[property];
    };

    return {
        id: id,
        imageCollectionId: data.id,
        displayName: data.title,
        type: getProperty("gee:type"),
        description: data.description,
        doc: `https://developers.google.com/earth-engine/datasets/catalog/${data.id}`,
        cadence: getProperty("gee:interval")?.unit,
        bands: getProperty("eo:bands")?.map((band: any) => {
            return {
                name: band.name,
                units: band["gee:units"],
                description: band.description,
            };
        }),
        keywords: data.keywords,
    };
}

export type GeeDataSetsCache = {
    lastUpdated: string;
    dataSets: GeeDataSet[];
};

export interface GeeApiCatalog {
    links: {
        rel: string;
        href: string;
    }[];
}

export interface GeeApiDataSet {
    id: string;
    title: string;
    description: string;
    keywords: string[];
    "gee:type": string;
    summaries: {
        [key: string]: any;
        "eo:bands"?: GeeApiEoBand[];
    };
    properties?: {
        [key: string]: any;
    };
    links?: {
        rel: string;
        href: string;
        type?: string;
    }[];
    [key: string]: any;
}

export interface GeeApiEoBand {
    name: string;
    description: string;
    "gee:units"?: string;
}
