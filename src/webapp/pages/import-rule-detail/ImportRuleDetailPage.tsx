import React, { useState } from "react";
import { useCompositionRoot, useCurrentUser } from "../../contexts/app-context";
import { makeStyles } from "@material-ui/styles";
import PageHeader from "../../components/page-header/PageHeader";
import MappingsList from "../mappings/MappingsList";
import { Button, LinearProgress, Box, Theme, Card, CardContent, CardActions } from "@material-ui/core";
import GetAppIcon from "@material-ui/icons/GetApp";
import ImportExportIcon from "@material-ui/icons/ImportExport";
import OUDialog from "../../components/dialogs/OrganisationUnitDialog";
import PeriodSelectorDialog from "../../components/dialogs/PeriodSelectorDialog";
import { ConfirmationDialog, useSnackbar } from "@eyeseetea/d2-ui-components";
import { useHistory, useParams } from "react-router-dom";
import ImportUseCase from "../../../domain/usecases/ImportUseCase";
import { UpdateImportRuleError } from "../../../domain/usecases/UpdateImportRuleUseCase";
import { PeriodOption } from "../../../domain/entities/PeriodOption";
import { ImportRuleDetailState, importRuleDetailInitialState, ImportRuleState } from "./ImportRuleDetailState";
import { importRuleOndemandId } from "../../../domain/entities/ImportRule";
import GeneralInfo from "../../components/import-rule/GeneralInfo";
import { CreateImportRuleError } from "../../../domain/usecases/CreateImportRuleUseCase";
import { getValidationTranslations } from "../../utils/ValidationTranslations";
import i18n from "../../utils/i18n";

interface ImportRuleDetailPageParams {
    id: string;
    action: "edit" | "new" | "ondemand";
}

const ImportRuleDetailPage: React.FC = () => {
    const classes = useStyles();
    const snackbar = useSnackbar();
    const history = useHistory();
    const { action, id } = useParams() as ImportRuleDetailPageParams;
    const currentUser = useCurrentUser();

    const [state, setState] = useState<ImportRuleDetailState>(importRuleDetailInitialState);

    const importRules = useCompositionRoot().importRules();
    const geeImport = useCompositionRoot().geeImport();

    React.useEffect(() => {
        if (action === "edit" || action === "ondemand") {
            const importRuleId = action === "edit" ? id : importRuleOndemandId;
            importRules.getById.execute(importRuleId).then(response => {
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
                            isOndemand: importRule.isOndemand,
                        };
                    });
                } else {
                    history.goBack();
                    snackbar.error(i18n.t("Import Rule {{id}} not found", { id }));
                }
            });
        } else {
            setState(state => {
                return {
                    ...state,
                    isOndemand: false,
                };
            });
        }
    }, [importRules.getById, id, snackbar, history, action]);

    const closeDialog = () => {
        setState({
            ...state,
            showOUDialog: false,
            showPeriodDialog: false,
        });
    };

    const handleSaveError = (error: UpdateImportRuleError | CreateImportRuleError): string => {
        switch (error.kind) {
            case "ItemIdNotFoundError":
                return i18n.t("Import Rule {{id}} not found", { id });
            case "UnexpectedError":
                return i18n.t("An unexpected error has ocurred saving:") + error.error.message;
            case "ValidationErrors":
                return getValidationTranslations(error.errors).join("\n");
        }
    };

    const saveIfDefault = async (editedImportRule: ImportRuleState) => {
        if (state.isOndemand) {
            save(editedImportRule);
        }
    };

    const save = async (editedImportRule: ImportRuleState) => {
        const saveReponse =
            action === "new"
                ? await importRules.create.execute(editedImportRule)
                : await importRules.update.execute(editedImportRule);

        saveReponse.fold(
            error => snackbar.error(handleSaveError(error)),
            () => {
                if (action !== "ondemand") {
                    history.goBack();
                    snackbar.success(i18n.t("Success"));
                }
            }
        );
    };

    const onSelectedMappingsChange = (newSelectedMappings: string[]) => {
        const newState = {
            ...state,
            importRule: {
                ...state.importRule,
                selectedMappings: newSelectedMappings,
            },
        };

        saveIfDefault(newState.importRule);
        setState(newState);
    };

    const onDeleteMappings = (deletedMappingsIds: string[]) => {
        const newSelectedMappings = state.importRule.selectedMappings.filter(
            mappingId => !deletedMappingsIds.includes(mappingId)
        );

        onSelectedMappingsChange(newSelectedMappings);
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

        saveIfDefault(newState.importRule);
        setState(newState);
    };

    const onPeriodSelectionSave = (newPeriod?: PeriodOption) => {
        const newState = {
            ...state,
            importRule: {
                ...state.importRule,
                periodInformation: newPeriod,
            },
            showPeriodDialog: false,
        };

        saveIfDefault(newState.importRule);
        setState(newState);
    };

    const executeOrDownload = async (useCase: ImportUseCase) => {
        setState({
            ...state,
            isImporting: true,
        });

        const result = await useCase.executeImportRule(state.importRule.id, currentUser.username);

        setState({
            ...state,
            isImporting: false,
        });

        if (result?.success) {
            snackbar.success(i18n.t("Import successful") + "\n" + result.messages.join("\n"));
        } else {
            snackbar.error(i18n.t("Import failed") + "\n" + result.failures.join("\n"));
        }
    };

    const importData = async () => {
        await executeOrDownload(geeImport.import);
        setState({
            ...state,
            showImportDialog: false,
        });
    };

    const downloadData = async () => {
        await executeOrDownload(geeImport.download);
    };

    return (
        <React.Fragment>
            <PageHeader
                onBackClick={() => history.goBack()}
                title={action === "ondemand" ? i18n.t("On-demand import") : i18n.t("Import Rule")}
            />

            <Card className={classes.card}>
                <CardContent>
                    {state.isOndemand === false && (
                        <Box className={classes.generalInfo}>
                            <GeneralInfo
                                importRule={state.importRule}
                                onChange={newImportRule => setState({ ...state, importRule: newImportRule })}
                            />
                        </Box>
                    )}

                    <Box display="flex" flexDirection="column">
                        <Box display="flex" flexDirection="row" justifyContent="space-between">
                            <Box display="flex" flexDirection="row">
                                <Button
                                    className={classes.firstButton}
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
                            </Box>
                            {state.isOndemand && (
                                <Box display="flex" flexDirection="row">
                                    <Button
                                        className={`${classes.newImportButton} ${classes.firstButton}`}
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
                                </Box>
                            )}
                        </Box>
                        <MappingsList
                            header={"Select & map datasets"}
                            selectedMappings={state.importRule.selectedMappings}
                            onSelectionChange={onSelectedMappingsChange}
                            onDeleteMappings={onDeleteMappings}
                        />
                    </Box>
                </CardContent>
                {state.isOndemand === false && (
                    <CardActions>
                        <Button color="primary" variant="contained" onClick={() => save(state.importRule)}>
                            {i18n.t("Save")}
                        </Button>
                        <Button variant="contained" onClick={() => history.goBack()}>
                            {i18n.t("Cancel")}
                        </Button>
                    </CardActions>
                )}
            </Card>
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
        </React.Fragment>
    );
};

const useStyles = makeStyles((theme: Theme) => ({
    card: {
        margin: theme.spacing(1),
        padding: theme.spacing(2),
    },
    generalInfo: {
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(3),
    },
    title: {
        color: "blue",
    },
    firstButton: { marginRight: theme.spacing(2) },
    newImportButton: {
        backgroundColor: theme.palette.primary.main,
        color: "white",
    },
    saveButton: {
        position: "absolute",
        bottom: theme.spacing(6),
        right: theme.spacing(10),
    },
}));

export default ImportRuleDetailPage;
