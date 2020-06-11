export type GeeDataSet = {
    code: string;
    displayName: string;
    description: string;
    imageCollectionId: string;
    bands: string[];
    doc: string;
};

export type GeeBand = {
    name: string;
    units: string;
    description: string;
};
