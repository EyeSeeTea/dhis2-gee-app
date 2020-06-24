import React from "react";
import { ObjectsTable, TableColumn, MouseActionsMapping, TableAction } from "d2-ui-components";
import _ from "lodash";
import i18n from "@dhis2/d2-i18n";
import DataElement from "../../../domain/entities/DataElement";

export interface DataElementsTableProps {
    dataElements: DataElement[];
    onSelectedMapping: (dataElement: DataElement) => void;
}

const DataElementsTable: React.FC<DataElementsTableProps> = ({
    dataElements,
    onSelectedMapping,
}) => {
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
            columns={columns}
            searchBoxLabel={i18n.t("Search by name / code")}
            searchBoxColumns={["name", "code"]}
        />
    );
};

export default React.memo(DataElementsTable);
