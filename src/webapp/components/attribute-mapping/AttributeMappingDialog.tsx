import i18n from "@dhis2/d2-i18n";
import DialogContent from "@material-ui/core/DialogContent";
import { ConfirmationDialog, TableSorting, TablePagination } from "d2-ui-components";
import React, { useEffect, useState, useCallback } from "react";
import DataElementsTable from "../data-elements/DataElementsTable";
import DataElement from "../../models/DataElement";
import { D2Api } from "d2-api";
import AttributeMapping from "../../models/AttributeMapping";

export interface AttributeMappingDialogConfig {
    dataset: string;
    attributeMapping?: AttributeMapping;
}

export interface AttributeMappingDialogProps {
    api: D2Api;
    params: AttributeMappingDialogConfig;
    onMappingChange: (newMapping: AttributeMapping) => void;
    onClose: () => void;
}

type DataElementSorting = TableSorting<DataElement>;

const AttributeMappingDialog: React.FC<AttributeMappingDialogProps> = props => {
    const { api, params, onMappingChange, onClose } = props;
    const { dataset, attributeMapping } = params;
    const [rows, setRows] = useState<DataElement[] | undefined>(undefined);
    const [pagination, setPagination] = useState({
        page: 1,
        pageSize: 15,
        pageSizeOptions: [10, 15, 30],
    });
    const [sorting, setSorting] = useState<DataElementSorting>({
        field: "name" as const,
        order: "asc" as const,
    });

    useEffect(() => {
        getDataElements(sorting, { page: 1 });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sorting]);

    async function getDataElements(
        sorting: TableSorting<DataElement>,
        paginationOptions: Partial<TablePagination>
    ) {
        const listPagination = { ...pagination, ...paginationOptions };

        const res = await DataElement.getList(api, dataset);
        setRows(res.dataElements);
        setPagination({ ...listPagination, ...res.pager });
        setSorting(sorting);
    }

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
                <DataElementsTable
                    dataElements={rows ?? []}
                    onSelectedMapping={onSelectedDataElement}
                />
            </DialogContent>
        </ConfirmationDialog>
    );
};

export default AttributeMappingDialog;
