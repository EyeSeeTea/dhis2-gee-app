import i18n from "../../webapp/utils/i18n";

export const FIXED: PeriodOption = { id: "FIXED", name: i18n.t("Fixed period") };
export const TODAY: PeriodOption = { id: "TODAY", name: i18n.t("Today"), start: [0, "day"] };
export const YESTERDAY: PeriodOption = {
    id: "YESTERDAY",
    name: i18n.t("Yesterday"),
    start: [1, "day"],
};
export const LAST_7_DAYS: PeriodOption = {
    id: "LAST_7_DAYS",
    name: i18n.t("Last 7 days"),
    start: [7, "day"],
    end: [0, "day"],
};
export const LAST_14_DAYS: PeriodOption = {
    id: "LAST_14_DAYS",
    name: i18n.t("Last 14 days"),
    start: [14, "day"],
    end: [0, "day"],
};
export const THIS_WEEK: PeriodOption = {
    id: "THIS_WEEK",
    name: i18n.t("This week"),
    start: [0, "isoWeek"],
};
export const LAST_WEEK: PeriodOption = {
    id: "LAST_WEEK",
    name: i18n.t("Last week"),
    start: [1, "isoWeek"],
};
export const THIS_MONTH: PeriodOption = {
    id: "THIS_MONTH",
    name: i18n.t("This month"),
    start: [0, "month"],
};
export const LAST_MONTH: PeriodOption = {
    id: "LAST_MONTH",
    name: i18n.t("Last month"),
    start: [1, "month"],
};
export const THIS_QUARTER: PeriodOption = {
    id: "THIS_QUARTER",
    name: i18n.t("This quarter"),
    start: [0, "quarter"],
};
export const LAST_QUARTER: PeriodOption = {
    id: "LAST_QUARTER",
    name: i18n.t("Last quarter"),
    start: [1, "quarter"],
};
export const THIS_YEAR: PeriodOption = {
    id: "THIS_YEAR",
    name: i18n.t("This year"),
    start: [0, "year"],
};
export const LAST_YEAR: PeriodOption = {
    id: "LAST_YEAR",
    name: i18n.t("Last year"),
    start: [1, "year"],
};

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

export type PeriodId =
    | "FIXED"
    | "TODAY"
    | "YESTERDAY"
    | "LAST_7_DAYS"
    | "LAST_14_DAYS"
    | "THIS_WEEK"
    | "LAST_WEEK"
    | "THIS_MONTH"
    | "LAST_MONTH"
    | "THIS_QUARTER"
    | "LAST_QUARTER"
    | "THIS_YEAR"
    | "LAST_YEAR";

export interface PeriodOption {
    id: PeriodId;
    name: string;
    start?: [number, string];
    end?: [number, string];
    startDate?: Date;
    endDate?: Date;
}

export const defaultPeriod = LAST_YEAR;
