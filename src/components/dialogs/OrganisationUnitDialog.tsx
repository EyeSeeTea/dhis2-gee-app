import React from "react";
import { OrgUnitsSelector, ConfirmationDialog } from "d2-ui-components";
import { useAppContext } from "../../contexts/app-context";
import { DialogContent } from "@material-ui/core";
import i18n from "../../locales";
interface OUDialogProps {
    importPrefix: string;
    onClose(): void;
}

const OUDialog: React.FC<OUDialogProps> = props => {
    const { onClose } = props;
    const { api } = useAppContext();

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
                onSave={() => console.log("Save")}
                onCancel={onClose}
                saveText={i18n.t("Save")}
                maxWidth={"lg"}
                fullWidth={true}
                disableSave={true}
            >
                <DialogContent>
                    <OrgUnitsSelector
                        api={api}
                        typeInput="radio"
                        fullWidth={true}
                        controls={controls}
                    />
                </DialogContent>
            </ConfirmationDialog>
        </React.Fragment>
    );
};

export default OUDialog;
