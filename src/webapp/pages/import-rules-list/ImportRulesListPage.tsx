import i18n from "@dhis2/d2-i18n";
import { Icon, LinearProgress } from "@material-ui/core";
import {
    ConfirmationDialog,
    ObjectsTable,
    ObjectsTableDetailField,
    TableAction,
    TableColumn,
    useLoading,
    useSnackbar,
    TableState,
    ReferenceObject,
    DatePicker,
} from "d2-ui-components";
import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import PageHeader from "../../components/page-header/PageHeader";
import { ImportRule } from "../../../domain/entities/ImportRule";
import { FIXED } from "../../../domain/entities/PeriodOption";
import moment from "moment";
import { useCompositionRoot } from "../../contexts/app-context";
import { GetImportRulesUseCase } from "../../../domain/usecases/GetImportRulesUseCase";
import ImportUseCase from "../../../domain/usecases/ImportUseCase";
import { Id } from "d2-api";

const ImportRulesPage: React.FC = () => {
    const loading = useLoading();
    const snackbar = useSnackbar();
    const history = useHistory();

    const compositionRoot = useCompositionRoot();
    const getImportRulesUseCase = compositionRoot.get(GetImportRulesUseCase);
    const importUseCase = compositionRoot.get<ImportUseCase>("importUseCase");
    const downloadUseCase = compositionRoot.get<ImportUseCase>("downloadUseCase");

    //TODO: Unify to unique state?
    const [rows, setRows] = useState<ImportRule[]>([]);
    const [selection, setSelection] = useState<{ id: string }[]>([]);
    const [toDelete, setToDelete] = useState<string[]>([]);
    const [search, setSearchFilter] = useState("");
    const [lastExecutedFilter, setLastExecutedFilter] = useState<Date | null>(null);
    const [openImportDialog, setOpenImportDialog] = useState<boolean>(false);
    const [isImporting, setImporting] = useState(false);
    const [importRuleToExecute, setImportRuleToExecute] = useState<string | undefined>(undefined);

    useEffect(() => {
        getImportRulesUseCase
            .execute({
                search: search,
                lastExecuted: lastExecutedFilter ? lastExecutedFilter : undefined,
            })
            .then(setRows);
    }, [getImportRulesUseCase, search, lastExecutedFilter]);

    const getPeriodText = (importRule: ImportRule) => {
        const formatDate = (date: Date) => moment(date).format("YYYY-MM-DD");

        return `${importRule.periodInformation.id}
        ${
            importRule.periodInformation.id === FIXED.id
                ? `- start: ${formatDate(
                      importRule.periodInformation.startDate!!
                  )} - end: ${formatDate(importRule.periodInformation.endDate!!)}`
                : ""
        }`;
    };

    const columns: TableColumn<ImportRule>[] = [
        { name: "name", text: i18n.t("Name"), sortable: true },
        { name: "description", text: i18n.t("Description"), sortable: true },
        {
            name: "periodInformation",
            text: i18n.t("Period"),
            sortable: true,
            getValue: getPeriodText,
        },
        { name: "lastExecuted", text: i18n.t("Last executed"), sortable: true },
    ];

    const details: ObjectsTableDetailField<ImportRule>[] = [
        { name: "name", text: i18n.t("Name") },
        { name: "description", text: i18n.t("Description") },
        { name: "periodInformation", text: i18n.t("Period"), getValue: getPeriodText },
        { name: "lastExecuted", text: i18n.t("Last executed") },
    ];

    const confirmDelete = async () => {
        // loading.show(true, i18n.t("Deleting Import Rules"));
        // const results = [];
        // for (const id of toDelete) {
        //     const rule = await SyncRule.get(api, id);
        //     const deletedRuleLabel = `${rule.name} (${i18n.t("deleted")})`;
        //     results.push(await rule.remove(api));
        // }
        // if (_.some(results, ["status", false])) {
        //     snackbar.error(i18n.t("Failed to delete some rules"));
        // } else {
        //     snackbar.success(
        //         i18n.t("Successfully deleted {{count}} rules", { count: toDelete.length })
        //     );
        // }
        // loading.reset();
        // setToDelete([]);
        // setSelection([]);
    };

    const createRule = () => {
        //history.push(`/sync-rules/${type}/new`);
    };

    const editRule = (ids: string[]) => {
        // const id = _.first(ids);
        // if (!id) return;
        // history.push(`/sync-rules/${type}/edit/${id}`);
    };

    const executeOrDownload = async (id: Id, useCase: ImportUseCase) => {
        setImporting(true);

        const result = await useCase.execute(id);

        console.log({ result });
        setImporting(false);

        if (result?.success) {
            snackbar.success(i18n.t("Import successful \n") + result.messages.join("\n"));
        } else {
            snackbar.error(i18n.t("Import failed: \n") + result.failures.join("\n"));
        }
    };

    const executeRule = async () => {
        if (importRuleToExecute) {
            await executeOrDownload(importRuleToExecute, importUseCase);
            setOpenImportDialog(false);
            setImportRuleToExecute(undefined);
        }
    };

    const downloadJSON = async (ids: string[]) => {
        const id = ids[0];
        await executeOrDownload(id, downloadUseCase);
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
            onClick: setToDelete,
            icon: <Icon>delete</Icon>,
        },
        {
            name: "execute",
            text: i18n.t("Execute"),
            multiple: false,
            onClick: (ids: string[]) => {
                setOpenImportDialog(true);
                setImportRuleToExecute(ids[0]);
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
        setSelection(
            tableState.selection.map(sel => {
                return {
                    id: sel.id,
                };
            })
        );
    };

    const filterComponents = (
        <React.Fragment>
            <DatePicker
                placeholder={i18n.t("Last executed")}
                value={lastExecutedFilter}
                onChange={setLastExecutedFilter}
                isFilter={true}
            />
        </React.Fragment>
    );

    return (
        <React.Fragment>
            <PageHeader title={i18n.t("Import Rules")} onBackClick={() => history.goBack()} />
            <ObjectsTable<ImportRule>
                rows={rows}
                columns={columns}
                details={details}
                actions={actions}
                selection={selection}
                onChange={handleTableChange}
                onActionButtonClick={createRule}
                searchBoxLabel={i18n.t("Search by name")}
                onChangeSearch={setSearchFilter}
                filterComponents={filterComponents}
            />

            {openImportDialog && (
                <ConfirmationDialog
                    isOpen={true}
                    onSave={executeRule}
                    onCancel={() => (isImporting ? { undefined } : setOpenImportDialog(false))}
                    title={i18n.t("New import request")}
                    description={i18n.t(
                        "This operation will collect and import data from Google Earth Engine to the instance. Are you sure you want to proceed?"
                    )}
                    saveText={isImporting ? i18n.t("Importing...") : i18n.t("Import")}
                    disableSave={isImporting}
                    cancelText={i18n.t("Cancel")}
                >
                    {isImporting && <LinearProgress />}
                </ConfirmationDialog>
            )}

            {toDelete.length > 0 && (
                <ConfirmationDialog
                    isOpen={true}
                    onSave={confirmDelete}
                    onCancel={() => setToDelete([])}
                    title={i18n.t("Delete Rules?")}
                    description={
                        toDelete
                            ? i18n.t("Are you sure you want to delete {{count}} rules?", {
                                  count: toDelete.length,
                              })
                            : ""
                    }
                    saveText={i18n.t("Ok")}
                />
            )}
        </React.Fragment>
    );
};

export default ImportRulesPage;
