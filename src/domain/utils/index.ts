/* Map sequentially over T[] with an async function and return array of mapped values */
import moment, { Moment } from "moment";
import { availablePeriods, PeriodOption } from "../entities/PeriodOption";

/* Map sequentially over T[] with an asynchronous function and return array of mapped values */
export async function promiseMap<T, S>(
    inputValues: T[],
    mapper: (value: T, index: number) => Promise<S>
): Promise<S[]> {
    const output: S[] = [];
    let index = 0;

    for (const value of inputValues) {
        const res = await mapper(value, index++);
        output.push(res);
    }

    return output;
}

export function buildPeriod(periodInfo: PeriodOption, today: Moment = moment()): { start: Moment; end: Moment } {
    const {
        id,
        startDate = "1970-01-01",
        endDate = moment(today).add(10, "years").endOf("year").format("YYYY-MM-DD"),
    } = periodInfo;

    if (!id || id === "FIXED") {
        return { start: moment(startDate), end: moment(endDate) };
    } else {
        const { start, end = start } = availablePeriods[id];
        if (start === undefined || end === undefined) throw new Error("Unsupported period provided");

        const [startAmount, startType] = start;
        const [endAmount, endType] = end;

        return {
            start: moment(today)
                .subtract(startAmount, startType as moment.unitOfTime.DurationConstructor)
                .startOf(startType as moment.unitOfTime.DurationConstructor),
            end: moment(today)
                .subtract(endAmount, endType as moment.unitOfTime.DurationConstructor)
                .endOf(endType as moment.unitOfTime.DurationConstructor),
        };
    }
}
