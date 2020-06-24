import { GeeDataSetRepository } from "../repositories/GeeDataSetRepository";
import { GeeDataSet } from "../entities/GeeDataSet";
import { Maybe } from "../common/Maybe";

export class GetGeeDataSetByIdUseCase {
    constructor(private geeDataSetRepository: GeeDataSetRepository) {}

    async execute(id: string): Promise<Maybe<GeeDataSet>> {
        const response = this.geeDataSetRepository.getById(id);

        return response;
    }
}
