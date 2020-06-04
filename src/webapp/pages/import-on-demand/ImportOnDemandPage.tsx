import React, { useState } from "react";
import i18n from "../../locales";
import { useCompositionRoot } from "../../contexts/app-context";
import { makeStyles } from "@material-ui/styles";
import PageHeader from "../../components/page-header/PageHeader";
import MappingsList from "../mappings/MappingsList";
import { Button, LinearProgress } from "@material-ui/core";
import GetAppIcon from "@material-ui/icons/GetApp";
import ImportExportIcon from "@material-ui/icons/ImportExport";
import OUDialog from "../../components/dialogs/OrganisationUnitDialog";
import PeriodSelectorDialog from "../../components/dialogs/PeriodSelectorDialog";
import { ConfirmationDialog, useSnackbar } from "d2-ui-components";
import { useHistory } from "react-router-dom";
import ImportUseCase from "../../../domain/usecases/ImportUseCase";
import { GetImportRuleByIdUseCase } from "../../../domain/usecases/GetImportRuleByIdUseCase";
import { SaveImportRuleUseCase } from "../../../domain/usecases/SaveImportRuleUseCase";
import { PeriodOption } from "../../../domain/entities/PeriodOption";
import { ImportOnDemandState, importOnDemandInitialState, ImportRuleState } from "./ImportState";
import { SaveError } from "../../../domain/repositories/ImportRuleRepository";

interface ImportOnDemandPageProps {
    id: string;
}

const ImportOnDemandPage: React.FC<ImportOnDemandPageProps> = ({ id }) => {
    const classes = useStyles();
    const snackbar = useSnackbar();

    const [state, setState] = useState<ImportOnDemandState>(importOnDemandInitialState);

    const compositionRoot = useCompositionRoot();
    const importUseCase = compositionRoot.get<ImportUseCase>("importUseCase");
    const downloadUseCase = compositionRoot.get<ImportUseCase>("downloadUseCase");
    const getImportRuleByIdUseCase = compositionRoot.get(GetImportRuleByIdUseCase);
    const saveImportRuleUseCase = compositionRoot.get(SaveImportRuleUseCase);

    const history = useHistory();

    React.useEffect(() => {
        getImportRuleByIdUseCase.execute(id).then(response => {
            if (response.isDefined()) {
                const importRule = response.get();
                setState(state => {
                    return {
                        ...state,
                        importRule: {
                            id: importRule.id,
                            name: importRule.name,
                            code: importRule.code,
                            description: importRule.description,
                            selectedOUs: importRule.selectedOUs,
                            periodInformation: importRule.periodInformation,
                            selectedMappings: importRule.selectedMappings,
                        },
                    };
                });
            } else {
                history.goBack();
                snackbar.error(i18n.t("Import Rule {{id}} not found", { id }));
            }
        });
    }, [getImportRuleByIdUseCase, id, snackbar, history]);

    const closeDialog = () => {
        setState({
            ...state,
            showOUDialog: false,
            showPeriodDialog: false,
        });
    };

    const handleSaveError = (error: SaveError): string => {
        switch (error.kind) {
            case "ImportRuleIdNotFound":
                return i18n.t("Import Rule {{id}} not found", { id });
            case "UnexpectedError":
                return i18n.t(
                    "An unexpected error has ocurred updating last changes for on demand import"
                );
        }
    };

    const save = async (editedImportRule: ImportRuleState) => {
        if (editedImportRule) {
            const saveReponse = await saveImportRuleUseCase.execute(editedImportRule);
            saveReponse.fold(
                error => snackbar.error(handleSaveError(error)),
                () => console.log("Default import rule updated")
            );
        }
    };

    const onSelectedMappingsChange = (newSelectedMappings: string[]) => {
        const newState = {
            ...state,
            importRule: {
                ...state.importRule,
                selectedMappings: newSelectedMappings,
            },
        };

        save(newState.importRule);
        setState(newState);
    };

    const onDeleteMappings = () => {
        //TODO: if possible delete an used mapping
        // const newSelectedMappings = _.filter(
        //     selectedMappings,
        //     m => !deletedMappingsIds.includes(m.id)
        // );
        // onSelectedMappingsChange(newSelectedMappings);
    };

    const onSelectedOUsSave = (newSelectedOUs: string[]) => {
        const newState = {
            ...state,
            importRule: {
                ...state.importRule,
                selectedOUs: newSelectedOUs,
            },
            showOUDialog: false,
        };

        save(newState.importRule);
        setState(newState);
    };

    const onPeriodSelectionSave = (newPeriod: PeriodOption) => {
        const newState = {
            ...state,
            importRule: {
                ...state.importRule,
                periodInformation: newPeriod,
            },
            showPeriodDialog: false,
        };

        save(newState.importRule);
        setState(newState);
    };

    const executeOrDownload = async (useCase: ImportUseCase) => {
        setState({
            ...state,
            isImporting: true,
        });

        const result = await useCase.execute(id);

        console.log({ result });

        setState({
            ...state,
            isImporting: false,
        });

        if (result?.success) {
            snackbar.success(i18n.t("Import successful \n") + result.messages.join("\n"));
        } else {
            snackbar.error(i18n.t("Import failed: \n") + result.failures.join("\n"));
        }
    };

    const importData = async () => {
        await executeOrDownload(importUseCase);
        setState({
            ...state,
            showImportDialog: false,
        });
    };

    const downloadData = async () => {
        await executeOrDownload(downloadUseCase);
    };

    return (
        <React.Fragment>
            <PageHeader onBackClick={() => history.goBack()} title={i18n.t("Import")} />

            {state.showImportDialog && (
                <ConfirmationDialog
                    isOpen={true}
                    onSave={importData}
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
            {state.showOUDialog && (
                <OUDialog
                    selectedOUs={state.importRule.selectedOUs}
                    onCancel={closeDialog}
                    onSave={onSelectedOUsSave}
                />
            )}
            {state.showPeriodDialog && (
                <PeriodSelectorDialog
                    periodInformation={state.importRule.periodInformation}
                    onCancel={closeDialog}
                    onSave={onPeriodSelectionSave}
                />
            )}

            <Button
                className={classes.button}
                variant="contained"
                onClick={() =>
                    setState({
                        ...state,
                        showOUDialog: true,
                    })
                }
            >
                {i18n.t("Select Organisation Units")}
            </Button>
            <Button
                className={classes.button}
                variant="contained"
                onClick={() =>
                    setState({
                        ...state,
                        showPeriodDialog: true,
                    })
                }
            >
                {i18n.t("Select Period")}
            </Button>
            <Button
                className={classes.newImportButton}
                variant="contained"
                onClick={() =>
                    setState({
                        ...state,
                        showImportDialog: true,
                    })
                }
            >
                {i18n.t("Import to DHIS2 ")}
                <ImportExportIcon />
            </Button>
            <Button
                className={classes.newImportButton}
                variant="contained"
                disabled={state.isImporting}
                onClick={downloadData}
            >
                {i18n.t("Download JSON ")}
                <GetAppIcon />
                {state.isImporting && <LinearProgress />}
            </Button>
            <MappingsList
                header={"Select & map datasets"}
                selectedMappings={state.importRule.selectedMappings}
                onSelectionChange={onSelectedMappingsChange}
                onDeleteMappings={onDeleteMappings}
            />
        </React.Fragment>
    );
};

const useStyles = makeStyles({
    title: {
        color: "blue",
    },
    button: { marginLeft: 10, marginRight: 10 },
    floatLeft: { float: "right" },
    newImportButton: {
        float: "right",
        margin: 10,
        backgroundColor: "#2b98f0",
        color: "white",
    },
});

export default React.memo(ImportOnDemandPage);
