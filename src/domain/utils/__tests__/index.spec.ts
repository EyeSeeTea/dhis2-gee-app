
import { availablePeriods } from "../../entities/PeriodOption";
import { buildPeriod } from "..";
import moment, { Moment } from "moment";

const YYYYMMDD = "YYYY-MM-DD";

describe("buildPeriod", () => {
    describe("should return expected start and end date for", () => {
        it("FIXED", async () => {
            const { start, end } = buildPeriod(
                {
                    id: "FIXED",
                    startDate: new Date("2020-03-01"),
                    endDate: new Date("2020-03-31")
                });

            expect(start.format(YYYYMMDD)).toEqual("2020-03-01");
            expect(end.format(YYYYMMDD)).toEqual("2020-03-31");
        });
        it("TODAY", async () => {
            const { start, end } = buildPeriod({ id: "TODAY" }, moment("2020-03-31"));

            expect(start.format(YYYYMMDD)).toEqual("2020-03-31");
            expect(end.format(YYYYMMDD)).toEqual("2020-03-31");
        });
        it("YESTERDAY", async () => {
            const { start, end } = buildPeriod({ id: "YESTERDAY" }, moment("2020-03-31"));

            expect(start.format(YYYYMMDD)).toEqual("2020-03-30");
            expect(end.format(YYYYMMDD)).toEqual("2020-03-30");
        });
        it("LAST_7_DAYS", async () => {
            const { start, end } = buildPeriod({ id: "LAST_7_DAYS" }, moment("2020-03-31"));

            expect(start.format(YYYYMMDD)).toEqual("2020-03-24");
            expect(end.format(YYYYMMDD)).toEqual("2020-03-31");
        });
        it("LAST_14_DAYS", async () => {
            const { start, end } = buildPeriod({ id: "LAST_14_DAYS" }, moment("2020-03-31"));

            expect(start.format(YYYYMMDD)).toEqual("2020-03-17");
            expect(end.format(YYYYMMDD)).toEqual("2020-03-31");
        });
        it("THIS_WEEK", async () => {
            const { start, end } = buildPeriod({ id: "THIS_WEEK" }, moment("2020-03-31"));

            expect(start.format(YYYYMMDD)).toEqual("2020-03-30");
            expect(end.format(YYYYMMDD)).toEqual("2020-04-05");
        });
        it("LAST_WEEK", async () => {
            const { start, end } = buildPeriod({ id: "LAST_WEEK" }, moment("2020-03-31"));

            expect(start.format(YYYYMMDD)).toEqual("2020-03-23");
            expect(end.format(YYYYMMDD)).toEqual("2020-03-29");
        });
        it("THIS_MONTH", async () => {
            const { start, end } = buildPeriod({ id: "THIS_MONTH" }, moment("2020-03-31"));

            expect(start.format(YYYYMMDD)).toEqual("2020-03-01");
            expect(end.format(YYYYMMDD)).toEqual("2020-03-31");
        });
        it("LAST_MONTH", async () => {
            const { start, end } = buildPeriod({ id: "LAST_MONTH" }, moment("2020-03-31"));

            expect(start.format(YYYYMMDD)).toEqual("2020-02-01");
            expect(end.format(YYYYMMDD)).toEqual("2020-02-29");
        });
        it("THIS_QUARTER", async () => {
            const { start, end } = buildPeriod({ id: "THIS_QUARTER" }, moment("2020-03-31"));

            expect(start.format(YYYYMMDD)).toEqual("2020-01-01");
            expect(end.format(YYYYMMDD)).toEqual("2020-03-31");
        });
        it("LAST_QUARTER", async () => {
            const { start, end } = buildPeriod({ id: "LAST_QUARTER" }, moment("2020-03-31"));

            expect(start.format(YYYYMMDD)).toEqual("2019-10-01");
            expect(end.format(YYYYMMDD)).toEqual("2019-12-31");
        });
        it("THIS_YEAR", async () => {
            const { start, end } = buildPeriod({ id: "THIS_YEAR" }, moment("2020-03-31"));

            expect(start.format(YYYYMMDD)).toEqual("2020-01-01");
            expect(end.format(YYYYMMDD)).toEqual("2020-12-31");
        });
        it("THIS_YEAR", async () => {
            const { start, end } = buildPeriod({ id: "LAST_YEAR" }, moment("2020-03-31"));

            expect(start.format(YYYYMMDD)).toEqual("2019-01-01");
            expect(end.format(YYYYMMDD)).toEqual("2019-12-31");
        });
    });
});

export { };