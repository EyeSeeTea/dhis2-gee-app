import React from "react";
import { ConfirmationDialog } from "d2-ui-components";
import { DialogContent } from "@material-ui/core";
import i18n from "@dhis2/d2-i18n";
import { PeriodOption } from "../../../domain/entities/PeriodOption";
import PeriodSelector from "../period/PeriodSelector";

interface PeriodSelectorDialogProps {
    periodInformation: PeriodOption | undefined;
    onCancel(): void;
    onSave: (periodInformation?: PeriodOption) => void;
}

const PeriodSelectorDialog: React.FC<PeriodSelectorDialogProps> = props => {
    const { periodInformation, onCancel, onSave } = props;

    const [currentPeriod, setCurrentPeriod] = React.useState<PeriodOption | undefined>(
        periodInformation
    );

    const onSaveClicked = () => {
        onSave(currentPeriod);
    };

    return (
        <React.Fragment>
            <ConfirmationDialog
                isOpen={true}
                title={i18n.t("Select period interval")}
                onSave={onSaveClicked}
                onCancel={onCancel}
                saveText={i18n.t("Save")}
                maxWidth={"xs"}
                fullWidth={true}
            >
                <DialogContent>
                    <PeriodSelector selectedPeriod={currentPeriod} onChange={setCurrentPeriod} />
                </DialogContent>
            </ConfirmationDialog>
        </React.Fragment>
    );
};

export default PeriodSelectorDialog;
