import React, { useState, useEffect, useMemo, useCallback } from "react";
import _ from "lodash";
import {
    MouseActionsMapping,
    TableColumn,
    TableAction,
    TableSorting,
    TablePagination,
    ObjectsTable,
    ConfirmationDialog,
    useSnackbar,
} from "d2-ui-components";
import Mapping from "../../models/Mapping";
import i18n from "../../locales";
import { useAppContext } from "../../contexts/app-context";
import { makeStyles } from "@material-ui/styles";
import { Theme, createStyles, LinearProgress, Icon } from "@material-ui/core";
import { useGoTo, GoTo } from "../../router";
import { withSnackbarOnError } from "../../utils/error";

type ContextualAction = "details" | "edit" | "delete";

interface MappingsListProps {
    header?: string;
    selectedMappings?: Mapping[];
    onSelectionChange: (selectedMappings: Mapping[]) => void;
    onDeleteMappings: (deletedMappings: string[]) => void;
}

const mouseActionsMapping: MouseActionsMapping = {
    left: { type: "action", action: "edit" },
    right: { type: "contextual" },
};

function getComponentConfig(
    goTo: GoTo,
    setMappingIdsToDelete: (state: React.SetStateAction<string[] | undefined>) => void
) {
    const initialPagination = {
        page: 1,
        pageSize: 15,
        pageSizeOptions: [10, 15, 30],
    };

    const initialSorting = { field: "name" as const, order: "asc" as const };
    const columns: TableColumn<Mapping>[] = [
        { name: "name" as const, text: i18n.t("Name"), sortable: true },
        { name: "dataSetName" as const, text: i18n.t("Dataset"), sortable: true },
        { name: "dataSetId" as const, text: i18n.t("Dataset id"), sortable: true, hidden: true },
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
            icon: <Icon>details</Icon>,
            multiple: false,
            primary: true,
        },
        edit: {
            name: "edit",
            text: i18n.t("Edit"),
            multiple: false,
            icon: <Icon>edit</Icon>,
            primary: true,
            onClick: (ids: string[]) => onFirst(ids, id => goTo("mappings.edit", { id })),
        },
        delete: {
            name: "delete",
            text: i18n.t("Delete"),
            icon: <Icon>delete</Icon>,
            multiple: true,
            primary: true,
            onClick: setMappingIdsToDelete,
        },
    };
    const actions = [allActions.details, allActions.edit, allActions.delete];

    return { columns, initialSorting, details, actions, initialPagination };
}

type MappingTableSorting = TableSorting<Mapping>;

const MappingsList: React.FC<MappingsListProps> = props => {
    const { api, config } = useAppContext();
    const goTo = useGoTo();
    const snackbar = useSnackbar();
    const { header, selectedMappings, onSelectionChange, onDeleteMappings } = props;
    const [mappingIdsToDelete, setMappingIdsToDelete] = useState<string[] | undefined>(undefined);
    const componentConfig = React.useMemo(() => {
        return getComponentConfig(goTo, setMappingIdsToDelete);
    }, [goTo, setMappingIdsToDelete]);

    const classes = useStyles();
    const [rows, setRows] = useState<Mapping[]>([]);
    const [pagination, setPagination] = useState(componentConfig.initialPagination);
    const [sorting, setSorting] = useState<MappingTableSorting>(componentConfig.initialSorting);
    const [, setLoading] = useState(true);
    const [isDeleting, setDeleting] = useState(false);
    const [objectsTableKey] = useState(() => new Date().getTime());

    const selection = useMemo(() => {
        return rows
            .filter(mapping => selectedMappings?.map(m => m.id).includes(mapping.id))
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
        const listPagination = { ...pagination, ...paginationOptions };

        setLoading(true);
        const res = await Mapping.getList(api, config);
        setRows(res.mappings ?? []);
        setPagination({ ...listPagination, ...res.pager });
        setSorting(sorting);
        setLoading(false);
    }

    const deleteMappings = React.useCallback(() => {
        setDeleting(true);
        withSnackbarOnError(
            snackbar,
            async () => {
                await Mapping.delete(api, config, mappingIdsToDelete ?? []);
                onDeleteMappings(mappingIdsToDelete ?? []);
                snackbar.success(
                    i18n.t("{{n}} mappings deleted", {
                        n: mappingIdsToDelete ? mappingIdsToDelete.length : 0,
                    })
                );
            },
            {
                onFinally: () => {
                    setDeleting(false);
                    setMappingIdsToDelete(undefined);
                    getMappings(sorting, { page: 1 });
                },
            }
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [api, config, snackbar, sorting, mappingIdsToDelete]);

    const closeDeleteDialog = useCallback(() => {
        setMappingIdsToDelete(undefined);
    }, []);

    const onTableChange = useCallback(
        (newSelectedMappingsIds: string[]) => {
            const newSelectedMappings = _.filter(rows, m => newSelectedMappingsIds.includes(m.id));
            onSelectionChange(newSelectedMappings);
        },
        [rows, onSelectionChange]
    );
    return (
        <div>
            {mappingIdsToDelete && (
                <ConfirmationDialog
                    isOpen={true}
                    onSave={deleteMappings}
                    onCancel={isDeleting ? undefined : closeDeleteDialog}
                    title={i18n.t("Delete mapping")}
                    description={i18n.t(
                        "This operation will delete ({{n}}) mappings. This operation cannot be undone. Are you sure you want to proceed?",
                        { n: mappingIdsToDelete.length }
                    )}
                    saveText={isDeleting ? i18n.t("Deleting...") : i18n.t("Proceed")}
                    disableSave={isDeleting}
                    cancelText={i18n.t("Cancel")}
                >
                    {isDeleting && <LinearProgress />}
                </ConfirmationDialog>
            )}
            {rows && (
                <ObjectsTable<Mapping>
                    key={objectsTableKey}
                    selection={selection}
                    searchBoxLabel={i18n.t("Search by name or code")}
                    onChange={state => onTableChange(state.selection.map(m => m.id))}
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

function onFirst<T>(objs: T[], fn: (obj: T) => void): void {
    const obj = _.first(objs);
    if (obj) fn(obj);
}

export default React.memo(MappingsList);
