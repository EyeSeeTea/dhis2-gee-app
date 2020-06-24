import { GeeDataSetRepository } from "../repositories/GeeDataSetRepository";
import { GeeDataSet } from "../entities/GeeDataSet";

export class GetGeeDataSetsUseCase {
    constructor(private geeDataSetRepository: GeeDataSetRepository) {}

    execute(): Promise<GeeDataSet[]> {
        return this.geeDataSetRepository.getAll();
    }
}
