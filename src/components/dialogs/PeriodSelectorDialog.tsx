import React from "react";
import _ from "lodash";
import { DatePicker, ConfirmationDialog } from "d2-ui-components";
import { DialogContent } from "@material-ui/core";
import i18n from "../../locales";
import Dropdown from "../dropdown/Dropdown";
import { PeriodInformation } from "../../models/Import";
import { availablePeriods } from "../../utils/import";

interface PeriodSelectorDialogProps {
    periodInformation: PeriodInformation;
    onCancel(): void;
    onSave: (periodInformation: PeriodInformation) => void;
}

const PeriodSelectorDialog: React.FC<PeriodSelectorDialogProps> = props => {
    const { periodInformation, onCancel, onSave } = props;

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
