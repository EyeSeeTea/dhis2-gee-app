import React from "react";
import {
    ObjectsTable,
    TablePagination,
    TableColumn,
    MouseActionsMapping,
    TableAction,
} from "d2-ui-components";
import _ from "lodash";
import i18n from "../../locales";
import DataElement from "../../models/DataElement";

export interface DataElementsTableProps {
    dataElements: DataElement[];
    onSelectedMapping: (dataElement: DataElement) => void;
}

const initialPagination: Partial<TablePagination> = {
    pageSize: 50,
    page: 1,
    pageSizeOptions: [10, 20, 50],
};

const DataElementsTable: React.FC<DataElementsTableProps> = props => {
    const { dataElements, onSelectedMapping } = props;

    const columns: TableColumn<DataElement>[] = [
        {
            name: "name" as const,
            text: i18n.t("Name"),
            sortable: true,
        },
        {
            name: "code" as const,
            text: i18n.t("Code"),
            sortable: true,
        },
    ];

    const mouseActionsMapping: MouseActionsMapping = {
        left: {
            type: "action",
            action: "select",
        },
        right: {
            type: "contextual",
        },
    };

    const actions: TableAction<DataElement>[] = [
        {
            name: "select",
            text: i18n.t("Select"),
            multiple: false,
            primary: true,
            onClick: (ids: string[]) => {
                const selectedDataElement = _.find(dataElements, ["id", ids[0]]);
                selectedDataElement
                    ? onSelectedMapping(selectedDataElement)
                    : console.log("Could not select data element");
            },
        },
    ];

    return (
        <ObjectsTable<DataElement>
            rows={dataElements}
            forceSelectionColumn={false}
            mouseActionsMapping={mouseActionsMapping}
            actions={actions}
            initialState={{ pagination: initialPagination }}
            columns={columns}
            searchBoxLabel={i18n.t("Search by name / code")}
            searchBoxColumns={["name", "code"]}
        />
    );
};

export default React.memo(DataElementsTable);
