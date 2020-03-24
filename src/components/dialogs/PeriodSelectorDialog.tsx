import React from "react";
import _ from "lodash";
import { DatePicker, ConfirmationDialog } from "d2-ui-components";
import { DialogContent } from "@material-ui/core";
import i18n from "../../locales";
import Dropdown from "../dropdown/Dropdown";

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

export type PeriodInformation = {
    id: string;
    startDate?: Date;
    endDate?: Date;
};
interface PeriodSelectorDialogProps {
    periodInformation: PeriodInformation;
    onCancel(): void;
    onSave: (periodInformation: PeriodInformation) => void;
}

const PeriodSelectorDialog: React.FC<PeriodSelectorDialogProps> = props => {
    const { periodInformation, onCancel, onSave } = props;

    console.log({ periodInformation });
    const [period, setPeriod] = React.useState<string>(periodInformation.id);
    const [fixedStart, setFixedStart] = React.useState<Date | undefined>(
        periodInformation.startDate ?? undefined
    );
    const [fixedEnd, setFixedEnd] = React.useState<Date | undefined>(
        periodInformation.endDate ?? undefined
    );

    const periodItems = _(availablePeriods)
        .mapValues((value, key) => ({ ...value, id: key }))
        .values()
        .value();

    const onSaveClicked = () => {
        const periodInformation = { ...availablePeriods[period], id: period };
        if (period === "FIXED") {
            onSave({
                ...periodInformation,
                startDate: fixedStart,
                endDate: fixedEnd,
            });
        } else {
            onSave(periodInformation);
        }
    };
    return (
        <React.Fragment>
            <ConfirmationDialog
                isOpen={true}
                title={i18n.t("Select period interval")}
                onSave={onSaveClicked}
                onCancel={onCancel}
                saveText={i18n.t("Save")}
                maxWidth={"lg"}
                fullWidth={true}
            >
                <DialogContent>
                    <Dropdown
                        label={i18n.t("Period")}
                        items={periodItems}
                        value={period}
                        onValueChange={setPeriod}
                        hideEmpty={true}
                    />

                    {period === "FIXED" && (
                        <div>
                            <DatePicker
                                label={`${i18n.t("Start date")} (*)`}
                                value={fixedStart || null}
                                onChange={setFixedStart}
                            />
                            <DatePicker
                                label={`${i18n.t("End date")} (*)`}
                                value={fixedEnd || null}
                                onChange={setFixedEnd}
                            />
                        </div>
                    )}
                </DialogContent>
            </ConfirmationDialog>
        </React.Fragment>
    );
};

export default PeriodSelectorDialog;
