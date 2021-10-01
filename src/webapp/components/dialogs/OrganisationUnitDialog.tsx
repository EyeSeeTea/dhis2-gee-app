import React from "react";
import { ConfirmationDialog } from "@eyeseetea/d2-ui-components";
import { DialogContent } from "@material-ui/core";
import i18n from "@dhis2/d2-i18n";
import WithCoordinatesOrgUnitsSelector from "../org-unit/WithCoordinatesOrgUnitsSelector";

interface OUDialogProps {
    selectedOUs: string[];
    onCancel(): void;
    onSave: (newSelectedOUs: string[]) => void;
}

const OUDialog: React.FC<OUDialogProps> = props => {
    const { selectedOUs, onCancel, onSave } = props;
    const [selectedOrgs, setSelectedOrgs] = React.useState<string[]>(selectedOUs);

    return (
        <React.Fragment>
            <ConfirmationDialog
                isOpen={true}
                title={i18n.t("Select organisation unit")}
                onCancel={onCancel}
                onSave={() => onSave(selectedOrgs)}
                saveText={i18n.t("Save")}
                maxWidth={"lg"}
                fullWidth={true}
            >
                <DialogContent>
                    <WithCoordinatesOrgUnitsSelector
                        onChange={setSelectedOrgs}
                        selected={selectedOUs ? selectedOrgs : []}
                        fullWidth={true}
                    />
                </DialogContent>
            </ConfirmationDialog>
        </React.Fragment>
    );
};

export default OUDialog;
