import {
    ConfirmationDialog,
    MouseActionsMapping,
    ObjectsTable,
    TableAction,
    TableColumn,
    TablePagination,
    TableSorting,
    useSnackbar,
} from "@eyeseetea/d2-ui-components";
import { Box, createStyles, Fab, Icon, LinearProgress, Theme } from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import { makeStyles } from "@material-ui/styles";
import _ from "lodash";
import { Checkbox } from "material-ui";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Id } from "../../../domain/entities/Ref";
import {
    DeleteGlobalOUMappingError,
    SaveGlobalOUMappingError,
} from "../../../domain/repositories/GlobalOUMappingRepository";
import { DeleteMappingByIdsError } from "../../../domain/repositories/MappingRepository";
import OUDialog from "../../components/dialogs/OrganisationUnitDialog";
import { useAppContext, useCompositionRoot } from "../../contexts/app-context";
import Mapping from "../../models/Mapping";
import i18n from "../../utils/i18n";
import { GoTo, pageRoutes, useGoTo } from "../Router";

type ContextualAction = "details" | "edit" | "delete" | "assignOU" | "setAsDefault";

interface MappingsListProps {
    header?: string;
    selectedMappings?: string[];
    onSelectionChange: (selectedMappings: string[]) => void;
    onDeleteMappings: (deletedMappings: string[]) => void;
}

const mouseActionsMapping: MouseActionsMapping = {
    left: { type: "action", action: "edit" },
    right: { type: "contextual" },
};

function getComponentConfig(
    goTo: GoTo,
    setMappingIdsToDelete: (state: React.SetStateAction<string[] | undefined>) => void,
    setMappingIdToAssignOUs: (state: React.SetStateAction<string | undefined>) => void,
    setMappingAsDefault: (mappingId?: Id) => void
) {
    const initialPagination = {
        page: 1,
        pageSize: 10,
        pageSizeOptions: [10, 25, 50],
    };

    const initialSorting = { field: "name" as const, order: "asc" as const };
    const columns: TableColumn<Mapping>[] = [
        { name: "name" as const, text: i18n.t("Name"), sortable: true },
        { name: "dataSetName" as const, text: i18n.t("Dataset"), sortable: true },
        { name: "dataSetId" as const, text: i18n.t("Dataset id"), sortable: true, hidden: true },
        { name: "geeImage" as const, text: i18n.t("G.E.E Dataset"), sortable: true },
        {
            name: "isDefault" as const,
            text: i18n.t("Default"),
            sortable: true,
            /*eslint-disable*/
            getValue: mapping => {
                return <Checkbox disabled={true} checked={mapping.isDefault} />;
            },
        },
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
            onClick: (ids: string[]) => onFirst(ids, id => goTo(pageRoutes.mappingsEdit, { id })),
        },
        delete: {
            name: "delete",
            text: i18n.t("Delete"),
            icon: <Icon>delete</Icon>,
            multiple: true,
            primary: true,
            onClick: setMappingIdsToDelete,
        },
        assignOU: {
            name: "assignOU",
            text: i18n.t("Assign organisation unit"),
            icon: <Icon>open_in_new</Icon>,
            multiple: false,
            primary: false,
            onClick: (ids: string[]) => setMappingIdToAssignOUs(ids[0]),
        },
        setAsDefault: {
            name: "setAsDefault",
            text: i18n.t("Set as default"),
            icon: <Icon>check_circle</Icon>,
            multiple: false,
            primary: false,
            onClick: (ids: string[]) => setMappingAsDefault(ids[0]),
        },
    };
    const actions = [
        allActions.details,
        allActions.edit,
        allActions.delete,
        allActions.assignOU,
        allActions.setAsDefault,
    ];

    return { columns, initialSorting, details, actions, initialPagination };
}

type MappingTableSorting = TableSorting<Mapping>;

const MappingsList: React.FC<MappingsListProps> = props => {
    const { api, config } = useAppContext();
    const goTo = useGoTo();
    const snackbar = useSnackbar();
    const { header, selectedMappings, onSelectionChange, onDeleteMappings } = props;
    const [mappingIdsToDelete, setMappingIdsToDelete] = useState<string[] | undefined>(undefined);
    const [mappingIdToAssignOUs, setMappingIdToAssignOUs] = useState<string | undefined>(undefined);
    const [selectedOrgUnitsByMapping, setSelectedOrgUnitsByMapping] = useState<string[] | undefined>([]);

    const mapping = useCompositionRoot().mapping();

    const setMappingAsDefault = async (mappingId?: Id) => {
        if (!mappingId) return;

        const results = await mapping.setAsDefault.execute(mappingId);
        const handleFailure = (failure: DeleteMappingByIdsError): string => {
            switch (failure.kind) {
                case "UnexpectedError":
                    return (
                        i18n.t("An unexpected error has ocurred setting mappings as default ") + failure.error.message
                    );
            }
        };

        results.fold(
            error => snackbar.error(handleFailure(error)),
            () => {
                onDeleteMappings(mappingIdsToDelete ?? []);
                snackbar.success(i18n.t("Successfully mapping set as default"));
            }
        );

        getMappings(sorting, { page: 1 });
    };

    const componentConfig = getComponentConfig(
        goTo,
        setMappingIdsToDelete,
        setMappingIdToAssignOUs,
        setMappingAsDefault
    );

    const classes = useStyles();
    const [rows, setRows] = useState<Mapping[]>([]);
    const [pagination, setPagination] = useState(componentConfig.initialPagination);
    const [sorting, setSorting] = useState<MappingTableSorting>(componentConfig.initialSorting);
    const [, setLoading] = useState(true);
    const [isDeleting, setDeleting] = useState(false);
    const [objectsTableKey] = useState(() => new Date().getTime());

    const globalOUMapping = useCompositionRoot().globalOUMapping();

    const selection = useMemo(() => {
        return rows.filter(mapping => selectedMappings?.includes(mapping.id)).map(mapping => ({ id: mapping.id }));
    }, [rows, selectedMappings]);

    useEffect(() => {
        getMappings(sorting, { page: 1 });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sorting]);

    useEffect(() => {
        if (mappingIdToAssignOUs) {
            globalOUMapping.getByMappingId.execute(mappingIdToAssignOUs).then(globalOUMappings => {
                setSelectedOrgUnitsByMapping(Object.values(globalOUMappings).map(v => v.orgUnitPath));
            });
        } else {
            setSelectedOrgUnitsByMapping(undefined);
        }
    }, [mappingIdToAssignOUs, globalOUMapping.getByMappingId]);

    async function getMappings(sorting: TableSorting<Mapping>, paginationOptions: Partial<TablePagination>) {
        //Filters to retrieve mappings from the data store.
        const listPagination = { ...pagination, ...paginationOptions };

        setLoading(true);
        const res = await Mapping.getList(api, config);
        setRows(res.mappings ?? []);
        setPagination({ ...listPagination, ...res.pager });
        setSorting(sorting);
        setLoading(false);
    }

    const deleteMappings = async () => {
        if (!mappingIdsToDelete) return;

        setDeleting(true);

        const handleFailure = (failure: DeleteMappingByIdsError): string => {
            switch (failure.kind) {
                case "UnexpectedError":
                    return i18n.t("An unexpected error has ocurred deleting mappings. ") + failure.error.message;
            }
        };

        const results = await mapping.delete.execute(mappingIdsToDelete);

        results.fold(
            error => snackbar.error(handleFailure(error)),
            () => {
                onDeleteMappings(mappingIdsToDelete ?? []);
                snackbar.success(
                    i18n.t("Successfully delete {{deleteCount}} mappings", {
                        deleteCount: mappingIdsToDelete.length,
                    })
                );
            }
        );

        setDeleting(false);
        setMappingIdsToDelete(undefined);
        getMappings(sorting, { page: 1 });
    };

    const closeDeleteDialog = useCallback(() => {
        setMappingIdsToDelete(undefined);
    }, []);

    const onTableChange = useCallback(
        (newSelectedMappingsIds: string[]) => {
            const newSelectedMappings = _.filter(rows, m => newSelectedMappingsIds.includes(m.id));
            onSelectionChange(newSelectedMappings.map(mapping => mapping.id));
        },
        [rows, onSelectionChange]
    );

    const closeOUDialog = () => {
        setMappingIdToAssignOUs(undefined);
    };

    const createGlobalOUMappings = async (newOrgUnitsPaths: string[]) => {
        const globalOUMappingsToCreate = newOrgUnitsPaths.reduce((acc, ouPath) => {
            return { ...acc, [ouPath]: mappingIdToAssignOUs };
        }, {});

        return globalOUMapping.create.execute(globalOUMappingsToCreate);
    };

    const deleteGlobalOUMappings = async (newOrgUnitsId: string[]) => {
        const selectedOrgUnitIdsByMapping = _.compact((selectedOrgUnitsByMapping || []).map(o => o.split("/").pop()));
        const orgUnitToDeleteFromGlobalMapping = selectedOrgUnitIdsByMapping.filter(ou => !newOrgUnitsId.includes(ou));

        return globalOUMapping.delete.execute(orgUnitToDeleteFromGlobalMapping);
    };

    const onSelectedOUsSave = async (newSelectedOUs: string[]) => {
        const orgUnitIds = _.compact(newSelectedOUs.map(o => o.split("/").pop()));

        const createResult = await createGlobalOUMappings(newSelectedOUs);
        const deleteResult = await deleteGlobalOUMappings(orgUnitIds);

        const finalResult = createResult.flatMap(() => deleteResult);

        const handleFailure = (failure: SaveGlobalOUMappingError | DeleteGlobalOUMappingError): string => {
            switch (failure.kind) {
                case "UnexpectedError":
                    return (
                        i18n.t("An unexpected error has ocurred updating organisation unit assigment. ") +
                        failure.error.message
                    );
            }
        };

        finalResult.fold(
            error => snackbar.error(handleFailure(error)),
            () => {
                snackbar.success(i18n.t("Organisation unit assignment success"));
            }
        );

        setMappingIdToAssignOUs(undefined);
    };

    return (
        <div>
            {mappingIdsToDelete && (
                <ConfirmationDialog
                    isOpen={true}
                    onSave={deleteMappings}
                    onCancel={isDeleting ? undefined : closeDeleteDialog}
                    title={i18n.t("Delete mapping")}
                    description={i18n.t(
                        "This operation will delete ({{n}}) mappings and remove related global organisation unit mapping and remove it as selected in related import rules. This operation cannot be undone. Are you sure you want to proceed?",
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
                <Box display="flex" flexDirection="column">
                    {header && <div className={classes.tableHeader}>{header}:</div>}

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
                        mouseActionsMapping={mouseActionsMapping}
                        rows={rows}
                        filterComponents={
                            <Fab
                                className={classes.addButton}
                                size="small"
                                aria-label="add"
                                onClick={() => goTo(pageRoutes.mappingsNew)}
                            >
                                <AddIcon />
                            </Fab>
                        }
                    />
                </Box>
            )}

            {mappingIdToAssignOUs && selectedOrgUnitsByMapping && (
                <OUDialog selectedOUs={selectedOrgUnitsByMapping} onCancel={closeOUDialog} onSave={onSelectedOUsSave} />
            )}
        </div>
    );
};

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        tableHeader: {
            ...theme.typography.button,
            marginTop: theme.spacing(5),
            marginLeft: theme.spacing(1),
        },
        addButton: {
            marginLeft: theme.spacing(1),
            boxShadow: "none",
        },
    })
);

function onFirst<T>(objs: T[], fn: (obj: T) => void): void {
    const obj = _.first(objs);
    if (obj) fn(obj);
}

export default React.memo(MappingsList);
