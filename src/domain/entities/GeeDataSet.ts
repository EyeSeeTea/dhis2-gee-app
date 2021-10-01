export type GeeDataSet = {
    id: string;
    displayName: string;
    type: string;
    description: string;
    imageCollectionId: string;
    bands?: GeeBand[];
    doc: string;
    keywords: string[];
    cadence: string;
};

export type GeeBand = {
    name: string;
    units?: string;
    description: string;
};

export type Cadence = "day" | "month" | "year";
