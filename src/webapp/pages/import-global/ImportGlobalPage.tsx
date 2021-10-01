import React, { useState, useEffect } from "react";
import { useCompositionRoot, useCurrentUser, useAppContext } from "../../contexts/app-context";
import { makeStyles } from "@material-ui/styles";
import GetAppIcon from "@material-ui/icons/GetApp";
import ImportExportIcon from "@material-ui/icons/ImportExport";
import PageHeader from "../../components/page-header/PageHeader";
import { LinearProgress, Box, Theme, Card, CardContent, Button } from "@material-ui/core";
import { ConfirmationDialog, useSnackbar } from "@eyeseetea/d2-ui-components";
import { useHistory } from "react-router-dom";
import ImportUseCase from "../../../domain/usecases/ImportUseCase";
import WithCoordinatesOrgUnitsSelector from "../../components/org-unit/WithCoordinatesOrgUnitsSelector";
import PeriodSelector from "../../components/period/PeriodSelector";
import { PeriodOption } from "../../../domain/entities/PeriodOption";
import { ImportGlobalState, ImportGlobalStateInitialState } from "./ImportGlobalState";
import i18n from "../../utils/i18n";

const useStyles = makeStyles((theme: Theme) => ({
    card: {
        margin: theme.spacing(1),
        padding: theme.spacing(2),
    },
    period: {
        margin: 16,
        minHeight: 150,
    },
    importButton: {
        margin: theme.spacing(1),
        backgroundColor: theme.palette.primary.main,
        color: "white",
    },
}));

const ImportGlobalPage: React.FC = () => {
    const classes = useStyles();
    const snackbar = useSnackbar();
    const history = useHistory();
    const currentUser = useCurrentUser();
    const { isAdmin } = useAppContext();

    const [state, setState] = useState<ImportGlobalState>(ImportGlobalStateInitialState);

    const geeImport = useCompositionRoot().geeImport();
    const globalOUMapping = useCompositionRoot().globalOUMapping();
    const mapping = useCompositionRoot().mapping();

    useEffect(() => {
        globalOUMapping.get.execute().then(result =>
            setState(state => {
                return { ...state, globalOUMappings: result };
            })
        );
    }, [globalOUMapping.get]);

    useEffect(() => {
        mapping.getDefault.execute().then(defaultMapping => {
            setState(state => {
                return { ...state, defaultMapping };
            });
        });
    }, [mapping.getDefault]);

    const onChangeSelectedOU = (selectedOU: string[]) => {
        const selectedOUMappings = selectedOU.map(path => {
            const globalMappingId =
                state.globalOUMappings[path.split("/").pop() || ""]?.mappingId ?? state.defaultMapping?.id ?? "";
            return { orgUnitPath: path, mappingId: globalMappingId };
        });

        setState({
            ...state,
            selectedOUMappings,
        });
    };

    const selectableIds = () => {
        const anySelectableIds: string[] = [];
        const eitherSelectableIds = undefined;

        if (state.globalOUMappings || state.defaultMapping) {
            return state.globalOUMappings && !state.defaultMapping
                ? Object.keys(state.globalOUMappings)
                : eitherSelectableIds;
        } else {
            return anySelectableIds;
        }
    };

    const executeOrDownload = async (useCase: ImportUseCase) => {
        setState({
            ...state,
            isImporting: true,
        });

        const result = await useCase.executeByPairs(
            state.selectedOUMappings,
            state.selectedPeriod,
            currentUser.username
        );

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
            <PageHeader onBackClick={isAdmin ? () => history.goBack() : undefined} title={i18n.t("Import")} />

            <Card className={classes.card}>
                <CardContent>
                    <Box display="flex" flexDirection="Row">
                        <Box width="70%">
                            <WithCoordinatesOrgUnitsSelector
                                selectableIds={selectableIds()}
                                selected={state.selectedOUMappings.map(oumapping => oumapping.orgUnitPath)}
                                onChange={onChangeSelectedOU}
                            />
                        </Box>
                        <Box
                            display="flex"
                            flexDirection="column"
                            width="30%"
                            justifyContent="center"
                            alignItems="center"
                        >
                            <PeriodSelector
                                className={classes.period}
                                selectedPeriod={state.selectedPeriod}
                                onChange={(selectedPeriod: PeriodOption) =>
                                    setState({
                                        ...state,
                                        selectedPeriod,
                                    })
                                }
                            />

                            <Box display="flex" flexDirection="column" width={250}>
                                <Button
                                    className={classes.importButton}
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
                                    className={classes.importButton}
                                    variant="contained"
                                    disabled={state.isImporting}
                                    onClick={downloadData}
                                >
                                    {i18n.t("Download JSON ")}
                                    <GetAppIcon />
                                    {state.isImporting && <LinearProgress />}
                                </Button>
                            </Box>
                        </Box>
                        <Box display="flex" flexDirection=""></Box>
                    </Box>
                </CardContent>
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
        </React.Fragment>
    );
};

export default ImportGlobalPage;
