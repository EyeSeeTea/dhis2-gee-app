/* Map sequentially over T[] with an async function and return array of mapped values */
import moment, { Moment } from "moment";
import { availablePeriods, PeriodOption } from "../entities/PeriodOption";

export function promiseMap<T, S>(inputValues: T[], mapper: (value: T) => Promise<S>): Promise<S[]> {
    const reducer = (acc$: Promise<S[]>, inputValue: T): Promise<S[]> =>
        acc$.then((acc: S[]) =>
            mapper(inputValue).then(result => {
                acc.push(result);
                return acc;
            })
        );
    return inputValues.reduce(reducer, Promise.resolve([]));
}

export function buildPeriod(
    periodInfo: PeriodOption,
    today: Moment = moment()
): { start: Moment; end: Moment } {
    const {
        id,
        startDate = "1970-01-01",
        endDate = moment(today).add(10, "years").endOf("year").format("YYYY-MM-DD"),
    } = periodInfo;

    if (!id || id === "FIXED") {
        return { start: moment(startDate), end: moment(endDate) };
    } else {
        const { start, end = start } = availablePeriods[id];
        if (start === undefined || end === undefined)
            throw new Error("Unsupported period provided");

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
