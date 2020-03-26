import React from "react";
import { OrgUnitsSelector, ConfirmationDialog } from "d2-ui-components";
import { useAppContext } from "../../contexts/app-context";
import { DialogContent } from "@material-ui/core";
import i18n from "../../locales";

interface OUDialogProps {
    selectedOUs: string[];
    onCancel(): void;
    onSave: (newSelectedOUs: string[]) => void;
}

const OUDialog: React.FC<OUDialogProps> = props => {
    const { selectedOUs, onCancel, onSave } = props;
    const { api } = useAppContext();
    const [selectedOrgs, setSelectedOrgs] = React.useState<string[]>(selectedOUs);

    const controls = {
        filterByLevel: true,
        filterByGroup: true,
        selectAll: true,
    };

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
                    <OrgUnitsSelector
                        api={api}
                        typeInput="checkbox"
                        fullWidth={true}
                        controls={controls}
                        onChange={setSelectedOrgs}
                        selected={selectedOUs ? selectedOrgs : []}
                    />
                </DialogContent>
            </ConfirmationDialog>
        </React.Fragment>
    );
};

export default OUDialog;
