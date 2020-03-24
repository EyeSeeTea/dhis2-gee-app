import React, { useState, useEffect, useMemo } from "react";
import {
    MouseActionsMapping,
    TableColumn,
    TableAction,
    TableSorting,
    TablePagination,
    ObjectsTable,
} from "d2-ui-components";
import Mapping from "../../models/Mapping";
import i18n from "../../locales";
import { useAppContext } from "../../contexts/app-context";
import { makeStyles } from "@material-ui/styles";
import { Theme, createStyles } from "@material-ui/core";
import { useGoTo } from "../../router";

type ContextualAction = "details" | "edit";

interface MappingsListProps {
    header?: string;
    selectedMappings?: string[];
    onSelectionChange: (selectedMappings: string[]) => void;
}

const mouseActionsMapping: MouseActionsMapping = {
    left: { type: "contextual" },
    right: { type: "contextual" },
};

function getComponentConfig() {
    const initialPagination = {
        page: 1,
        pageSize: 15,
        pageSizeOptions: [10, 15, 30],
    };

    const initialSorting = { field: "name" as const, order: "asc" as const };
    const columns: TableColumn<Mapping>[] = [
        { name: "name" as const, text: i18n.t("Name"), sortable: true },
        { name: "dataSet" as const, text: i18n.t("Data set"), sortable: true },
        { name: "geeImage" as const, text: i18n.t("G.E.E Dataset"), sortable: true },
    ];

    const details = [
        ...columns,
        { name: "id" as const, text: i18n.t("Id") },
        { name: "created" as const, text: i18n.t("Created") },
    ];

    const allActions: Record<ContextualAction, TableAction<Mapping>> = {
        details: {
            name: "details",
            text: i18n.t("Details"),
            multiple: false,
            primary: true,
        },
        edit: {
            name: "edit",
            text: i18n.t("Edit"),
            multiple: false,
            primary: true,
        },
    };

    const actions = [allActions.details, allActions.edit];

    return { columns, initialSorting, details, actions, initialPagination };
}

type MappingTableSorting = TableSorting<Mapping>;

const MappingsList: React.FC<MappingsListProps> = props => {
    const { api, config } = useAppContext();
    const goTo = useGoTo();
    const { header, selectedMappings, onSelectionChange } = props;
    const componentConfig = React.useMemo(() => {
        return getComponentConfig();
    }, []);

    const classes = useStyles();
    const [rows, setRows] = useState<Mapping[] | undefined>(undefined);
    const [pagination, setPagination] = useState(componentConfig.initialPagination);
    const [sorting, setSorting] = useState<MappingTableSorting>(componentConfig.initialSorting);
    const [, setLoading] = useState(true);
    const [objectsTableKey] = useState(() => new Date().getTime());

    const selection = useMemo(() => {
        return rows
            ?.filter(mapping => selectedMappings?.includes(mapping.id))
            .map(mapping => ({ id: mapping.id }));
    }, [rows, selectedMappings]);

    useEffect(() => {
        getMappings(sorting, { page: 1 });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sorting]);

    async function getMappings(
        sorting: TableSorting<Mapping>,
        paginationOptions: Partial<TablePagination>
    ) {
        //Filters to retrieve mappings from the data store.
        const filters = {};
        const listPagination = { ...pagination, ...paginationOptions };

        setLoading(true);
        const res = await Mapping.getList(api, config, filters, sorting, listPagination);
        setRows(res.mappings);
        setPagination({ ...listPagination, ...res.pager });
        setSorting(sorting);
        setLoading(false);
    }

    return (
        <div>
            {rows && (
                <ObjectsTable<Mapping>
                    key={objectsTableKey}
                    selection={selection}
                    searchBoxLabel={i18n.t("Search by name or code")}
                    onChange={state => onSelectionChange(state.selection.map(m => m.id))}
                    forceSelectionColumn={true}
                    pagination={pagination}
                    details={componentConfig.details}
                    columns={componentConfig.columns}
                    actions={componentConfig.actions}
                    onActionButtonClick={() => goTo("mappings.new")}
                    mouseActionsMapping={mouseActionsMapping}
                    rows={rows}
                    filterComponents={
                        header && <div className={classes.tableHeader}>{header}:</div>
                    }
                />
            )}
        </div>
    );
};

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        tableHeader: {
            ...theme.typography.button,
            padding: theme.spacing(1),
        },
    })
);

export default React.memo(MappingsList);
