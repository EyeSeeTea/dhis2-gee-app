import DeleteIcon from "@material-ui/icons/Delete";
import DescriptionIcon from "@material-ui/icons/Description";
import {
    ConfirmationDialog,
    ObjectsTable,
    ObjectsTableDetailField,
    TableAction,
    TableColumn,
    TableState,
    useSnackbar,
} from "@eyeseetea/d2-ui-components";
import _ from "lodash";
import React, { useEffect, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import Dropdown from "../../components/dropdown/Dropdown";
import PageHeader from "../../components/page-header/PageHeader";
import { Typography, LinearProgress } from "@material-ui/core";
import { HistoryState, historyInitialState, ImportSummaryState } from "./HistoryState";
import { useCompositionRoot } from "../../contexts/app-context";
import { pageRoutes } from "../Router";
import { DeleteImportSummaryByIdsError } from "../../../domain/repositories/ImportSummaryRepository";
import { Ref } from "../../../domain/entities/Ref";
import i18n from "../../utils/i18n";

const HistoryPage: React.FC = () => {
    const history = useHistory();
    const snackbar = useSnackbar();
    const importSummaries = useCompositionRoot().importSummaries();
    const importRules = useCompositionRoot().importRules();

    const [state, setState] = useState<HistoryState>(historyInitialState);

    useEffect(() => {
        importSummaries.getAll.execute(state.filters).then(importSummaries => {
            setState(state => {
                return {
                    ...state,
                    history: importSummaries,
                };
            });
        });
    }, [importSummaries.getAll, state.filters, state.objectsTableKey]);

    useEffect(() => {
        importRules.getAll.execute().then(importRules => {
            setState(state => {
                return {
                    ...state,
                    importRules: importRules,
                };
            });
        });
    }, [importRules.getAll]);

    const formatStatusTag = (value: string) => {
        const text = _.startCase(_.toLower(value));
        const color = value === "FAILURE" ? "#e53935" : value === "SUCCESS" ? "#7cb342" : "#3e2723";

        return <b style={{ color }}>{text}</b>;
    };

    const columns: TableColumn<ImportSummaryState>[] = [
        {
            name: "importRule",
            text: i18n.t("Import Rule"),
            getValue: ({ importRule: id, importRuleLabel }) => {
                const importRuleName = () => {
                    if (!id) {
                        return i18n.t("(on-demand global mapping import)");
                    } else {
                        return _.find(state.importRules, { id })?.name ?? i18n.t("(on-demand import)");
                    }
                };

                return importRuleLabel ?? importRuleName();
            },
        },
        { name: "date", text: i18n.t("Date") },
        {
            name: "status",
            text: i18n.t("Status"),
            getValue: ({ status }) => formatStatusTag(status),
        },
        { name: "user", text: i18n.t("User") },
    ];

    const details: ObjectsTableDetailField<ImportSummaryState>[] = [
        { name: "user", text: i18n.t("User") },
        { name: "date", text: i18n.t("Date") },
        {
            name: "status",
            text: i18n.t("Status"),
            getValue: notification => _.startCase(_.toLower(notification.status)),
        },
        {
            name: "importRule",
            text: i18n.t("Import Rule"),
            getValue: ({ importRule: id, importRuleLabel }) => {
                if (importRuleLabel) {
                    return <Typography>{importRuleLabel}</Typography>;
                } else {
                    const importRuleObj = state.importRules.find(e => e.id === id);
                    if (!importRuleObj) return null;

                    return (
                        <Link
                            to={pageRoutes.importRulesDetail.generateUrl({
                                id: id,
                                action: "edit",
                            })}
                        >
                            {i18n.t("Edit {{name}}", importRuleObj)}
                        </Link>
                    );
                }
            },
        },
    ];

    const openResult = (ids: string[]) => {
        const id = _.first(ids);
        if (!id) return;

        const importSummary = _.find(state.history.items, ["id", id]);

        if (!importSummary) return;

        if (importSummary.result.success) {
            snackbar.success(i18n.t("Import successful") + "\n" + importSummary.result.messages.join("\n"), {
                autoHideDuration: null,
            });
        } else {
            snackbar.error(i18n.t("Import failed") + "\n" + importSummary.result.failures.join("\n"), {
                autoHideDuration: null,
            });
        }
    };

    const actions: TableAction<ImportSummaryState>[] = [
        {
            name: "details",
            text: i18n.t("Details"),
            multiple: false,
        },
        {
            name: "delete",
            text: i18n.t("Delete"),
            icon: <DeleteIcon />,
            multiple: true,
            onClick: (ids: string[]) => setState({ ...state, toDelete: ids }),
        },
        {
            name: "result",
            text: i18n.t("View result"),
            icon: <DescriptionIcon />,
            multiple: false,
            primary: true,
            onClick: openResult,
        },
    ];

    const confirmDelete = async () => {
        setState({
            ...state,
            isDeleting: true,
        });

        const handleFailure = (failure: DeleteImportSummaryByIdsError): string => {
            switch (failure.kind) {
                case "UnexpectedError":
                    return i18n.t("An unexpected error has ocurred deleting import history. ") + failure.error.message;
            }
        };

        const results = await importSummaries.delete.execute(state.toDelete);

        results.fold(
            error => snackbar.error(handleFailure(error)),
            () => snackbar.success(i18n.t("Successfully import histories", results))
        );

        setState({
            ...state,
            isDeleting: false,
            toDelete: [],
            selection: [],
            objectsTableKey: new Date().getTime(),
        });
    };

    const handleTableChange = (tableState: TableState<Ref>) => {
        setState({
            ...state,
            filters: {
                ...state.filters,
                sorting: tableState.sorting,
                pagination: {
                    page: tableState.pagination.page,
                    pageSize: tableState.pagination.pageSize,
                },
            },
            selection: tableState.selection.map(sel => {
                return {
                    id: sel.id,
                };
            }),
        });
    };

    const customFilters = (
        <React.Fragment>
            <Dropdown
                key={"status-filter"}
                items={state.statusFilterItems}
                onValueChange={value =>
                    setState({
                        ...state,
                        filters: {
                            ...state.filters,
                            status: value,
                        },
                    })
                }
                value={state.filters.status ?? ""}
                label={i18n.t("Import status")}
            />
            <Dropdown
                key={"import-rule-filter"}
                items={state.importRules}
                onValueChange={value =>
                    setState({
                        ...state,
                        filters: {
                            ...state.filters,
                            importRule: value,
                        },
                    })
                }
                value={state.filters.importRule ?? ""}
                label={i18n.t("Import Rule")}
            />
        </React.Fragment>
    );

    return (
        <React.Fragment>
            <PageHeader title={i18n.t("Imports History")} onBackClick={() => history.goBack()} />
            <ObjectsTable<ImportSummaryState>
                rows={state.history.items}
                columns={columns}
                details={details}
                initialState={{ sorting: state.filters.sorting }}
                pagination={{
                    page: state.history.pager.page,
                    pageSize: state.history.pager.pageSize,
                    total: state.history.pager.totalItems,
                }}
                selection={state.selection}
                actions={actions}
                filterComponents={customFilters}
                onChange={handleTableChange}
            />

            {state.toDelete.length > 0 && (
                <ConfirmationDialog
                    isOpen={true}
                    onSave={confirmDelete}
                    onCancel={() => setState({ ...state, toDelete: [] })}
                    title={i18n.t("Delete import histories?")}
                    description={i18n.t("Are you sure you want to delete {{deleteCount}} import histories?", {
                        deleteCount: state.toDelete.length,
                    })}
                    saveText={i18n.t("Ok")}
                >
                    {state.isDeleting && <LinearProgress />}
                </ConfirmationDialog>
            )}
        </React.Fragment>
    );
};

export default HistoryPage;
