import moment, { Moment } from "moment";
import { PeriodInformation } from "../models/Import";
import i18n from "../locales";

export const availablePeriods: {
    [id: string]: {
        name: string;
        start?: [number, string];
        end?: [number, string];
    };
} = {
    FIXED: { name: i18n.t("Fixed period") },
    TODAY: { name: i18n.t("Today"), start: [0, "day"] },
    YESTERDAY: { name: i18n.t("Yesterday"), start: [1, "day"] },
    LAST_7_DAYS: { name: i18n.t("Last 7 days"), start: [7, "day"], end: [0, "day"] },
    LAST_14_DAYS: { name: i18n.t("Last 14 days"), start: [14, "day"], end: [0, "day"] },
    THIS_WEEK: { name: i18n.t("This week"), start: [0, "isoWeek"] },
    LAST_WEEK: { name: i18n.t("Last week"), start: [1, "isoWeek"] },
    THIS_MONTH: { name: i18n.t("This month"), start: [0, "month"] },
    LAST_MONTH: { name: i18n.t("Last month"), start: [1, "month"] },
    THIS_QUARTER: { name: i18n.t("This quarter"), start: [0, "quarter"] },
    LAST_QUARTER: { name: i18n.t("Last quarter"), start: [1, "quarter"] },
    THIS_YEAR: { name: i18n.t("This year"), start: [0, "year"] },
    LAST_YEAR: { name: i18n.t("Last year"), start: [1, "year"] },
};

export function buildPeriod(periodInfo: PeriodInformation): { start: Moment; end: Moment } {
    const {
        id,
        startDate = "1970-01-01",
        endDate = moment().add(10, "years").endOf("year").format("YYYY-MM-DD"),
    } = periodInfo;

    if (!id || id === "ALL" || id === "FIXED") {
        return { start: moment(startDate), end: moment(endDate) };
    } else {
        const { start, end = start } = availablePeriods[id];
        if (start === undefined || end === undefined)
            throw new Error("Unsupported period provided");

        const [startAmount, startType] = start;
        const [endAmount, endType] = end;

        return {
            start: moment()
                .subtract(startAmount, startType as moment.unitOfTime.DurationConstructor)
                .startOf(startType as moment.unitOfTime.DurationConstructor),
            end: moment()
                .subtract(endAmount, endType as moment.unitOfTime.DurationConstructor)
                .endOf(endType as moment.unitOfTime.DurationConstructor),
        };
    }
}

type Options = { filename: string; mimeType: string; contents: string | ArrayBuffer };

export function downloadFile(options: Options) {
    const { filename, mimeType, contents } = options;
    const blob = new Blob([contents], { type: mimeType });
    const element = document.createElement("a");
    element.id = "download-file";
    element.href = window.URL.createObjectURL(blob);
    element.setAttribute("download", filename);
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
}
