import React, { useEffect } from "react";
import { OrgUnitsSelector, ConfirmationDialog } from "d2-ui-components";
import { useAppContext, useCompositionRoot } from "../../contexts/app-context";
import { DialogContent } from "@material-ui/core";
import i18n from "@dhis2/d2-i18n";

interface OUDialogProps {
    selectedOUs: string[];
    onCancel(): void;
    onSave: (newSelectedOUs: string[]) => void;
}

const OUDialog: React.FC<OUDialogProps> = props => {
    const { selectedOUs, onCancel, onSave } = props;
    const { api } = useAppContext();
    const [selectedOrgs, setSelectedOrgs] = React.useState<string[]>(selectedOUs);
    const [selectablesOrgs, setSelectablesOrgs] = React.useState<string[]>([]);
    const orgUnits = useCompositionRoot().orgUnits();

    useEffect(() => {
        orgUnits.getWithCoordinates.execute().then(orgUnits => {
            setSelectablesOrgs(orgUnits.map(ou => ou.id));
        });
    }, [orgUnits.getWithCoordinates]);

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
                        selectableIds={selectablesOrgs}
                    />
                </DialogContent>
            </ConfirmationDialog>
        </React.Fragment>
    );
};

export default OUDialog;
