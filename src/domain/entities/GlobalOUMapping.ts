import { Id } from "./Ref";

export type GlobalOUValue = {
    orgUnitPath: string;
    mappingId: string;
};

export type GlobalOUMapping = Record<Id, GlobalOUValue>;
