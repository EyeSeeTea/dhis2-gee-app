import React from "react";
import { DatePicker, ConfirmationDialog } from "d2-ui-components";
import { DialogContent } from "@material-ui/core";
import i18n from "../../locales";

interface DatePickerDialogProps {
    importPrefix: string;
    onClose(): void;
}

const DatePickerDialog: React.FC<DatePickerDialogProps> = props => {
    const { onClose } = props;

    return (
        <React.Fragment>
            <ConfirmationDialog
                isOpen={true}
                title={i18n.t("Select period interval")}
                onSave={() => console.log("Save")}
                onCancel={onClose}
                saveText={i18n.t("Save")}
                maxWidth={"lg"}
                fullWidth={true}
                disableSave={true}
            >
                <DialogContent>
                    <DatePicker
                        label="From"
                        value={new Date("2019/01/30")}
                        onChange={newValue => console.log(newValue)}
                    />
                    <DatePicker
                        label="To"
                        value={new Date("2019/01/30")}
                        onChange={newValue => console.log(newValue)}
                    />
                </DialogContent>
            </ConfirmationDialog>
        </React.Fragment>
    );
};

export default DatePickerDialog;
