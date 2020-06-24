import { GeeDataSetRepository, GeeDataSetsFilter } from "../repositories/GeeDataSetRepository";
import { GeeDataSet } from "../entities/GeeDataSet";

export class GetGeeDataSetsUseCase {
    constructor(private geeDataSetRepository: GeeDataSetRepository) {}

    execute(filter?: GeeDataSetsFilter): Promise<GeeDataSet[]> {
        return this.geeDataSetRepository.getAll(filter);
    }
}
