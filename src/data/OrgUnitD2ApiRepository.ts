import { Id } from "@eyeseetea/d2-api";
import { OrgUnit } from "../domain/entities/OrgUnit";
import OrgUnitRepository from "../domain/repositories/OrgUnitRepository";
import { D2Api } from "../types/d2-api";
import _ from "lodash";

class OrgUnitD2ApiRepository implements OrgUnitRepository {
    constructor(private d2Api: D2Api) {}

    async getByIds(ids: Id[]): Promise<OrgUnit[]> {
        const response = await this.d2Api
            .get<{ organisationUnits: OrgUnit[] }>("/organisationUnits", {
                paging: false,
                fields: "id,geometry",
                filter: `id:in:[${ids.join(",")}]`,
            })
            .getData();

        return response.organisationUnits;
    }

    async getAllWithCoordinates(): Promise<OrgUnit[]> {
        // First, fetch the first page to get the total number of pages
        const initialResponse = await this.d2Api
            .get<{ organisationUnits: OrgUnit[]; pager: { page: number; pageCount: number } }>("/organisationUnits", {
                paging: true,
                pageSize: 1000, // Fetch in batches of 1000
                fields: "id,geometry",
                filter: "geometry:!null",
                page: 1,
            })
            .getData();

        const totalPages = initialResponse.pager.pageCount;

        // Create an array of page numbers to fetch
        const pageNumbers = _(totalPages)
            .range(1) // Generate numbers from 2 to totalPages
            .reverse()
            .value();

        // Map each page number to a fetch promise
        const fetchPromises = pageNumbers.map(page =>
            this.d2Api
                .get<{ organisationUnits: OrgUnit[] }>("/organisationUnits", {
                    paging: true,
                    pageSize: 1000,
                    fields: "id,geometry",
                    filter: "geometry:!null",
                    page: page,
                })
                .getData()
                .then(response => response.organisationUnits)
        );

        // Use Promise.all to wait for all fetch promises to resolve
        const pages = await Promise.all(fetchPromises);

        // Flatten the array of pages into a single array of OrgUnits
        return [initialResponse.organisationUnits, ...pages].flat();
    }
}

export default OrgUnitD2ApiRepository;
