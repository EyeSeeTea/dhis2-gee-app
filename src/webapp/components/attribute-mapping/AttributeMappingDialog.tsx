import i18n from "@dhis2/d2-i18n";
import DialogContent from "@material-ui/core/DialogContent";
import { ConfirmationDialog } from "d2-ui-components";
import React, { useEffect, useState, useCallback } from "react";
import DataElementsTable from "../data-elements/DataElementsTable";
import AttributeMapping from "../../models/AttributeMapping";
import DataElement from "../../../domain/entities/DataElement";
import { useCompositionRoot } from "../../contexts/app-context";

export interface AttributeMappingDialogConfig {
    dataset: string;
    attributeMapping?: AttributeMapping;
}

export interface AttributeMappingDialogProps {
    params: AttributeMappingDialogConfig;
    onMappingChange: (newMapping: AttributeMapping) => void;
    onClose: () => void;
}

const AttributeMappingDialog: React.FC<AttributeMappingDialogProps> = ({
    params,
    onMappingChange,
    onClose,
}) => {
    const { dataset, attributeMapping } = params;
    const [rows, setRows] = useState<DataElement[]>([]);

    const dataElements = useCompositionRoot().dataElements();

    useEffect(() => {
        dataElements.getByDataSet.execute(dataset).then(setRows);
    }, [dataElements.getByDataSet, dataset]);

    const onSelectedDataElement = useCallback(
        (dataElement: DataElement) => {
            if (attributeMapping) {
                onMappingChange(attributeMapping.setDataElement(dataElement));
            } else {
                console.error("Error adding mapping of google band.");
            }
        },
        [onMappingChange, attributeMapping]
    );

    const title = i18n.t("Mapping for attribute {{attr}}", {
        attr: attributeMapping ? attributeMapping.geeBand : "-",
    });

    return (
        <ConfirmationDialog
            open={true}
            title={title}
            onCancel={onClose}
            maxWidth={"lg"}
            fullWidth={true}
            disableSave={false}
            cancelText={i18n.t("Cancel")}
        >
            <DialogContent>
                <DataElementsTable dataElements={rows} onSelectedMapping={onSelectedDataElement} />
            </DialogContent>
        </ConfirmationDialog>
    );
};

export default AttributeMappingDialog;
