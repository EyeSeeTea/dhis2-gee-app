import { Icon, LinearProgress } from "@material-ui/core";
import {
    ConfirmationDialog,
    ObjectsTable,
    ObjectsTableDetailField,
    TableAction,
    TableColumn,
    useSnackbar,
    TableState,
    ReferenceObject,
    DatePicker,
} from "@eyeseetea/d2-ui-components";
import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import PageHeader from "../../components/page-header/PageHeader";
import { ImportRule, ImportRuleData } from "../../../domain/entities/ImportRule";
import { FIXED } from "../../../domain/entities/PeriodOption";
import moment from "moment";
import { useCompositionRoot, useCurrentUser } from "../../contexts/app-context";
import { Id } from "@eyeseetea/d2-api";
import { useGoTo, pageRoutes } from "../Router";
import { ImportRuleListState, importRuleListInitialState } from "./ImportRulesListState";
import ImportUseCase from "../../../domain/usecases/ImportUseCase";
import { DeleteImportRulesByIdError } from "../../../domain/repositories/ImportRuleRepository";
import i18n from "../../utils/i18n";

const ImportRuleListPage: React.FC = () => {
    const snackbar = useSnackbar();
    const history = useHistory();
    const goTo = useGoTo();
    const currentUser = useCurrentUser();

    const importRules = useCompositionRoot().importRules();
    const geeImport = useCompositionRoot().geeImport();

    const [state, setState] = useState<ImportRuleListState>(importRuleListInitialState);

    useEffect(() => {
        importRules.getAll
            .execute({
                search: state.search,
                lastExecuted: state.lastExecutedFilter ? state.lastExecutedFilter.toDate() : undefined,
            })
            .then(importRules => {
                setState(state => {
                    return {
                        ...state,
                        importRules,
                    };
                });
            });
    }, [importRules.getAll, state.search, state.lastExecutedFilter, state.objectsTableKey]);

    const getPeriodText = (importRule: ImportRule) => {
        const formatDate = (date?: Date) => moment(date).format("YYYY-MM-DD");

        return importRule.periodInformation
            ? `${importRule.periodInformation.name}
        ${
            importRule.periodInformation.id === FIXED.id
                ? `- start: ${formatDate(importRule.periodInformation.startDate)} - end: ${formatDate(
                      importRule.periodInformation.endDate
                  )}`
                : ""
        }`
            : "";
    };

    const columns: TableColumn<ImportRuleData>[] = [
        { name: "name", text: i18n.t("Name"), sortable: false },
        { name: "description", text: i18n.t("Description"), sortable: false },
        {
            name: "periodInformation",
            text: i18n.t("Period"),
            sortable: false,
            getValue: getPeriodText,
        },
        { name: "lastExecuted", text: i18n.t("Last executed"), sortable: false },
    ];

    const details: ObjectsTableDetailField<ImportRuleData>[] = [
        { name: "name", text: i18n.t("Name") },
        { name: "description", text: i18n.t("Description") },
        { name: "periodInformation", text: i18n.t("Period"), getValue: getPeriodText },
        { name: "lastExecuted", text: i18n.t("Last executed") },
    ];

    const confirmDelete = async () => {
        setState({
            ...state,
            isDeleting: true,
        });

        const handleFailure = (failure: DeleteImportRulesByIdError): string => {
            switch (failure.kind) {
                case "UnexpectedError":
                    return i18n.t("An unexpected error has ocurred deleting import rules. ") + failure.error.message;
            }
        };

        const results = await importRules.delete.execute(state.toDelete);

        results.fold(
            error => snackbar.error(handleFailure(error)),
            () =>
                snackbar.success(
                    i18n.t("Successfully delete {{deleteCount}} import rules", {
                        deleteCount: state.toDelete.length,
                    })
                )
        );

        setState({
            ...state,
            isDeleting: false,
            toDelete: [],
            selection: [],
            objectsTableKey: new Date().getTime(),
        });
    };

    const createRule = () => {
        goTo(pageRoutes.importRulesDetail, { action: "new" });
    };

    const editRule = (ids: string[]) => {
        if (!ids || ids.length !== 1) return;
        const id = ids[0];

        goTo(pageRoutes.importRulesDetail, { id: id, action: "edit" });
    };

    const executeOrDownload = async (id: Id, useCase: ImportUseCase) => {
        setState({
            ...state,
            isImporting: true,
        });

        const result = await useCase.executeImportRule(id, currentUser.username);

        setState({
            ...state,
            isImporting: false,
            objectsTableKey: new Date().getTime(),
        });

        if (result?.success) {
            snackbar.success(i18n.t("Import successful") + "\n" + result.messages.join("\n"));
        } else {
            snackbar.error(i18n.t("Import failed") + "\n" + result.failures.join("\n"));
        }
    };

    const executeRule = async () => {
        if (state.importRuleToExecute) {
            await executeOrDownload(state.importRuleToExecute, geeImport.import);
            setState({
                ...state,
                showImportDialog: false,
                importRuleToExecute: undefined,
            });
        }
    };

    const downloadJSON = async (ids: string[]) => {
        const id = ids[0];
        if (id) await executeOrDownload(id, geeImport.download);
    };

    const actions: TableAction<ImportRule>[] = [
        {
            name: "details",
            text: i18n.t("Details"),
            multiple: false,
        },
        {
            name: "edit",
            text: i18n.t("Edit"),
            multiple: false,
            onClick: editRule,
            primary: true,
            icon: <Icon>edit</Icon>,
        },
        {
            name: "delete",
            text: i18n.t("Delete"),
            multiple: true,
            onClick: (ids: string[]) =>
                setState({
                    ...state,
                    toDelete: ids,
                }),
            icon: <Icon>delete</Icon>,
        },
        {
            name: "execute",
            text: i18n.t("Execute"),
            multiple: false,
            onClick: (ids: string[]) => {
                setState({
                    ...state,
                    showImportDialog: true,
                    importRuleToExecute: ids[0],
                });
            },
            icon: <Icon>settings_input_antenna</Icon>,
        },
        {
            name: "download",
            text: i18n.t("Download JSON"),
            multiple: false,
            onClick: downloadJSON,
            icon: <Icon>cloud_download</Icon>,
        },
    ];

    const handleTableChange = (tableState: TableState<ReferenceObject>) => {
        setState({
            ...state,
            selection: tableState.selection.map(sel => {
                return {
                    id: sel.id,
                };
            }),
        });
    };

    const filterComponents = (
        <React.Fragment>
            <DatePicker
                placeholder={i18n.t("Last executed")}
                value={state.lastExecutedFilter}
                onChange={lastExecutedFilter =>
                    setState({
                        ...state,
                        lastExecutedFilter,
                    })
                }
                isFilter={true}
            />
        </React.Fragment>
    );

    return (
        <React.Fragment>
            <PageHeader title={i18n.t("Import Rules")} onBackClick={() => history.goBack()} />
            <ObjectsTable<ImportRuleData>
                rows={state.importRules}
                columns={columns}
                details={details}
                actions={actions}
                selection={state.selection}
                onChange={handleTableChange}
                onActionButtonClick={createRule}
                searchBoxLabel={i18n.t("Search by name")}
                onChangeSearch={(search: string) =>
                    setState({
                        ...state,
                        search,
                    })
                }
                filterComponents={filterComponents}
            />

            {state.showImportDialog && (
                <ConfirmationDialog
                    isOpen={true}
                    onSave={executeRule}
                    onCancel={() =>
                        state.isImporting
                            ? { undefined }
                            : setState({
                                  ...state,
                                  showImportDialog: false,
                              })
                    }
                    title={i18n.t("New import request")}
                    description={i18n.t(
                        "This operation will collect and import data from Google Earth Engine to the instance. Are you sure you want to proceed?"
                    )}
                    saveText={state.isImporting ? i18n.t("Importing...") : i18n.t("Import")}
                    disableSave={state.isImporting}
                    cancelText={i18n.t("Cancel")}
                >
                    {state.isImporting && <LinearProgress />}
                </ConfirmationDialog>
            )}

            {state.toDelete.length > 0 && (
                <ConfirmationDialog
                    isOpen={true}
                    onSave={confirmDelete}
                    onCancel={() =>
                        setState({
                            ...state,
                            toDelete: [],
                        })
                    }
                    title={i18n.t("Delete Rules?")}
                    description={
                        state.toDelete
                            ? i18n.t("Are you sure you want to delete {{deleteCount}} rules?", {
                                  deleteCount: state.toDelete.length,
                              })
                            : ""
                    }
                    saveText={i18n.t("Ok")}
                >
                    {state.isDeleting && <LinearProgress />}
                </ConfirmationDialog>
            )}
        </React.Fragment>
    );
};

export default ImportRuleListPage;
