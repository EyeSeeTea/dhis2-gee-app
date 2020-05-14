import moment, { Moment } from "moment";
import i18n from "../../webapp/utils/i18n";

export type PeriodId = "FIXED" | "TODAY" | "YESTERDAY" | "LAST_7_DAYS" | "LAST_14_DAYS" |
    "THIS_WEEK" | "LAST_WEEK" | "THIS_MONTH" | "LAST_MONTH" | "THIS_QUARTER" |
    "LAST_QUARTER" | "THIS_YEAR" | "LAST_YEAR"

export interface PeriodOption {
    id: PeriodId
    name: string;
    start?: [number, string];
    end?: [number, string]
}

const FIXED: PeriodOption = { id: "FIXED", name: i18n.t("Fixed period") };
const TODAY: PeriodOption = { id: "TODAY", name: i18n.t("Today"), start: [0, "day"] };
const YESTERDAY: PeriodOption = { id: "YESTERDAY", name: i18n.t("Yesterday"), start: [1, "day"] };
const LAST_7_DAYS: PeriodOption = { id: "LAST_7_DAYS", name: i18n.t("Last 7 days"), start: [7, "day"], end: [0, "day"] };
const LAST_14_DAYS: PeriodOption = { id: "LAST_14_DAYS", name: i18n.t("Last 14 days"), start: [14, "day"], end: [0, "day"] };
const THIS_WEEK: PeriodOption = { id: "THIS_WEEK", name: i18n.t("This week"), start: [0, "isoWeek"] };
const LAST_WEEK: PeriodOption = { id: "LAST_WEEK", name: i18n.t("Last week"), start: [1, "isoWeek"] };
const THIS_MONTH: PeriodOption = { id: "THIS_MONTH", name: i18n.t("This month"), start: [0, "month"] };
const LAST_MONTH: PeriodOption = { id: "LAST_MONTH", name: i18n.t("Last month"), start: [1, "month"] };
const THIS_QUARTER: PeriodOption = { id: "THIS_QUARTER", name: i18n.t("This quarter"), start: [0, "quarter"] };
const LAST_QUARTER: PeriodOption = { id: "LAST_QUARTER", name: i18n.t("Last quarter"), start: [1, "quarter"] };
const THIS_YEAR: PeriodOption = { id: "THIS_YEAR", name: i18n.t("This year"), start: [0, "year"] };
const LAST_YEAR: PeriodOption = { id: "LAST_YEAR", name: i18n.t("Last year"), start: [1, "year"] };

export const availablePeriods: {
    [id: string]: PeriodOption;
} = {
    FIXED,
    TODAY,
    YESTERDAY,
    LAST_7_DAYS,
    LAST_14_DAYS,
    THIS_WEEK,
    LAST_WEEK,
    THIS_MONTH,
    LAST_MONTH,
    THIS_QUARTER,
    LAST_QUARTER,
    THIS_YEAR,
    LAST_YEAR,
};

export interface PeriodSeed {
    id: string;
    name?: string;
    start?: string;
    end?: string;
    startDate?: Date
    endDate?: Date
}

class Period {
    public readonly startDate: Moment;
    public readonly endDate: Moment;

    constructor(public periodSeed: PeriodSeed) {
        const {
            id,
            startDate = "1970-01-01",
            endDate = moment().add(10, "years").endOf("year").format("YYYY-MM-DD"),
        } = periodSeed;

        if (!id || id === "ALL" || id === "FIXED") {
            this.startDate = moment(startDate);
            this.endDate = moment(endDate);
        } else {
            const { start, end = start } = availablePeriods[id];
            if (start === undefined || end === undefined)
                throw new Error("Unsupported period provided");

            const [startAmount, startType] = start;
            const [endAmount, endType] = end;

            this.startDate = moment()
                .subtract(startAmount, startType as moment.unitOfTime.DurationConstructor)
                .startOf(startType as moment.unitOfTime.DurationConstructor);
            this.endDate = moment()
                .subtract(endAmount, endType as moment.unitOfTime.DurationConstructor)
                .endOf(endType as moment.unitOfTime.DurationConstructor);
        }
    }
}

export default Period;
