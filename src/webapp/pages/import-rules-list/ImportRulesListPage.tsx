import i18n from "@dhis2/d2-i18n";
import { Icon } from "@material-ui/core";
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
    TableSelection,
} from "d2-ui-components";
import _ from "lodash";
import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import PageHeader from "../../components/page-header/PageHeader";
import { ImportRule } from "../../../domain/entities/ImportRule";
import { FIXED } from "../../../domain/entities/PeriodOption";
import moment from "moment";
import { useCompositionRootContext } from "../../contexts/app-context";
import { GetImportRulesUseCase } from "../../../domain/usecases/GetImportRulesUseCase";

// interface ImportRulesState{
//     rows:ImportRule[],
// }

const ImportRulesPage: React.FC = () => {
    const loading = useLoading();
    const snackbar = useSnackbar();
    const history = useHistory();
    const getImportRulesUseCase = useCompositionRootContext().get(GetImportRulesUseCase);

    const [rows, setRows] = useState<ImportRule[]>([]);
    const [selection, setSelection] = useState<TableSelection[]>([]);
    const [toDelete, setToDelete] = useState<string[]>([]);
    const [search, setSearchFilter] = useState("");
    const [lastExecutedFilter, setLastExecutedFilter] = useState<Date | undefined>(undefined);

    useEffect(() => {
        getImportRulesUseCase
            .execute({ search: search, lastExecutedFilter: lastExecutedFilter })
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
        { name: "lastUpdated", text: i18n.t("Last updated"), sortable: true },
    ];

    const details: ObjectsTableDetailField<ImportRule>[] = [
        { name: "name", text: i18n.t("Name") },
        { name: "description", text: i18n.t("Description") },
        { name: "periodInformation", text: i18n.t("Period"), getValue: getPeriodText },
        { name: "lastUpdated", text: i18n.t("Last updated") },
    ];

    const downloadJSON = async (ids: string[]) => {};

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

    const replicateRule = async (ids: string[]) => {
        // const id = _.first(ids);
        // if (!id) return;
        // const rule = await SyncRule.get(api, id);
        // history.push({
        //     pathname: `/sync-rules/${type}/new`,
        //     state: { syncRule: rule.replicate() },
        // });
    };

    const executeRule = async (ids: string[]) => {
        // const id = _.first(ids);
        // if (!id) return;
        // const rule = await SyncRule.get(api, id);
        // const { builder, id: syncRule, type = "metadata" } = rule;
        // const { SyncClass } = config[type];
        // const sync = new SyncClass(d2 as D2, api, { ...builder, syncRule });
        // for await (const { message, syncReport, done } of sync.execute()) {
        //     if (message) loading.show(true, message);
        //     if (syncReport) await syncReport.save(api);
        //     if (done && syncReport) setSyncReport(syncReport);
        // }
        // loading.reset();
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
            onClick: executeRule,
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
        const { selection } = tableState;
        setSelection(selection);
    };

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
            />

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
