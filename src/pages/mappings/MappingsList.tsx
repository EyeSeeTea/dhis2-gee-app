import React, { useState, useEffect, useCallback } from "react";
import {
    MouseActionsMapping,
    TableColumn,
    TableAction,
    TableSorting,
    TablePagination,
    ObjectsTable,
    TableState,
} from "d2-ui-components";
import { D2Api } from "d2-api";
import { Config } from "../../models/Config";
import Mapping from "../../models/Mapping";
import i18n from "../../locales";
import { useAppContext } from "../../contexts/app-context";
import { Filter } from "d2-api/api/common";
import { makeStyles } from "@material-ui/styles";
import { Theme, createStyles } from "@material-ui/core";
import { User } from "../../models/User";

type ContextualAction = "details" | "edit";

interface MappingsListProps {
    header?: string;
    import?: string;
    mappingId?: string;
}

const mouseActionsMapping: MouseActionsMapping = {
    left: { type: "contextual" },
    right: { type: "contextual" },
};

function getComponentConfig(api: D2Api, config: Config, currentUser: User) {
    const initialPagination = {
        page: 1,
        pageSize: 5,
        pageSizeOptions: [5, 10, 20],
    };

    const initialSorting = { field: "name" as const, order: "asc" as const };
    const columns: TableColumn<Mapping>[] = [
        { name: "name" as const, text: i18n.t("Name"), sortable: true },
        { name: "code" as const, text: i18n.t("Code"), sortable: true },
        { name: "dataSet" as const, text: i18n.t("Data set"), sortable: true },
        { name: "dataElement" as const, text: i18n.t("Data element"), sortable: true },
        { name: "geeImage" as const, text: i18n.t("G.E.E Dataset"), sortable: true },
        { name: "geeBand" as const, text: i18n.t("G.E.E Attribute"), sortable: true },
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
    const { api, config, currentUser } = useAppContext();
    const componentConfig = React.useMemo(() => {
        return getComponentConfig(api, config, currentUser);
    }, [api, config, currentUser]);
    const classes = useStyles();
    const [rows, setRows] = useState<Mapping[] | undefined>(undefined);
    const [pagination, setPagination] = useState(componentConfig.initialPagination);
    const [sorting, setSorting] = useState<MappingTableSorting>(componentConfig.initialSorting);
    const [filter] = useState<Filter>({});
    const [, setLoading] = useState(true);
    const [objectsTableKey, objectsTableKeySet] = useState(() => new Date().getTime());

    useEffect(() => {
        getMappings(sorting, { page: 1 });
    }, [filter]);

    async function getMappings(
        sorting: TableSorting<Mapping>,
        paginationOptions: Partial<TablePagination>
    ) {
        const filters = {};
        const listPagination = { ...pagination, ...paginationOptions };

        setLoading(true);
        const res = await Mapping.getList(api, config, filters, sorting, listPagination);
        setRows(res.objects);
        setPagination({ ...listPagination, ...res.pager });
        setSorting(sorting);
        setLoading(false);
    }

    return (
        <div>
            {rows && (
                <ObjectsTable<Mapping>
                    key={objectsTableKey}
                    pagination={pagination}
                    details={componentConfig.details}
                    columns={componentConfig.columns}
                    actions={componentConfig.actions}
                    onActionButtonClick={() => console.log("New mapping")}
                    mouseActionsMapping={mouseActionsMapping}
                    rows={rows}
                    filterComponents={
                        props.header && <div className={classes.tableHeader}>{props.header}:</div>
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
