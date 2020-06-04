import React, { useCallback, useState } from "react";
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
import Mapping from "../../models/Mapping";
import { ImportRule } from "../../../domain/entities/ImportRule";
import { PeriodOption } from "../../../domain/entities/PeriodOption";

interface ImportDetailProps {
    id: string;
}

const ImportDetail: React.FC<ImportDetailProps> = ({ id }) => {
    const classes = useStyles();
    const snackbar = useSnackbar();

    const [selectedMappings, setSelectedMappings] = useState<Mapping[]>([]);
    const [selectedOUs, setSelectedOUs] = useState<string[]>([]);
    const [period, setPeriod] = useState<PeriodOption>();
    const [showOUDialog, setOUDialog] = useState<boolean>(false);
    const [showPeriodDialog, setPeriodDialog] = useState<boolean>(false);
    const [openImportDialog, setOpenImportDialog] = useState<boolean>(false);
    const [isImporting, setImporting] = useState(false);
    const [importRule, setImportRule] = useState<ImportRule>();

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
                setSelectedMappings(importRule.selectedMappings as Mapping[]);
                setSelectedOUs(importRule.selectedOUs);
                setPeriod(importRule.periodInformation);
                setImportRule(importRule);
            } else {
                history.goBack();
                snackbar.error(i18n.t("Import Rule {{id}} not found", { id }));
            }
        });
    }, [getImportRuleByIdUseCase, id, snackbar, history]);

    const closeDialog = useCallback(() => {
        setOUDialog(false);
        setPeriodDialog(false);
    }, []);

    const saveIfDefault = async (editedImportRule: ImportRule) => {
        if (editedImportRule && editedImportRule.isDefault) {
            const saveReponse = await saveImportRuleUseCase.execute(editedImportRule);

            saveReponse.fold(
                () => snackbar.error(i18n.t("Import Rule {{error}} not found", { id })),
                () => console.log("Default import rule updated")
            );
        }
    };

    const onSelectedMappingsChange = (newSelectedMappings: Mapping[]) => {
        setSelectedMappings(newSelectedMappings);
        const editedImportRule = importRule!!.changeMappings(newSelectedMappings);
        saveIfDefault(editedImportRule);
        setImportRule(editedImportRule);
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
        setSelectedOUs(newSelectedOUs);
        const editedImportRule = importRule!!.changeOUs(newSelectedOUs);
        saveIfDefault(editedImportRule);
        setImportRule(editedImportRule);
        setOUDialog(false);
    };

    const onPeriodSelectionSave = (newPeriod: PeriodOption) => {
        setPeriod(newPeriod);
        const editedImportRule = importRule!!.changePeriod(newPeriod);
        saveIfDefault(editedImportRule);
        setImportRule(editedImportRule);
        setPeriodDialog(false);
    };

    const executeOrDownload = async (useCase: ImportUseCase) => {
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

    const importData = async () => {
        await executeOrDownload(importUseCase);
        setOpenImportDialog(false);
    };

    const downloadData = async () => {
        await executeOrDownload(downloadUseCase);
    };

    return (
        <React.Fragment>
            <PageHeader onBackClick={() => history.goBack()} title={i18n.t("Import")} />

            {openImportDialog && (
                <ConfirmationDialog
                    isOpen={true}
                    onSave={importData}
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
            {showOUDialog && (
                <OUDialog
                    selectedOUs={selectedOUs}
                    onCancel={closeDialog}
                    onSave={onSelectedOUsSave}
                />
            )}
            {showPeriodDialog && (
                <PeriodSelectorDialog
                    periodInformation={period}
                    onCancel={closeDialog}
                    onSave={onPeriodSelectionSave}
                />
            )}

            <Button
                className={classes.button}
                variant="contained"
                onClick={() => setOUDialog(true)}
            >
                {i18n.t("Select Organisation Units")}
            </Button>
            <Button
                className={classes.button}
                variant="contained"
                onClick={() => setPeriodDialog(true)}
            >
                {i18n.t("Select Period")}
            </Button>
            <Button
                className={classes.newImportButton}
                variant="contained"
                onClick={() => setOpenImportDialog(true)}
            >
                {i18n.t("Import to DHIS2 ")}
                <ImportExportIcon />
            </Button>
            <Button
                className={classes.newImportButton}
                variant="contained"
                disabled={isImporting}
                onClick={downloadData}
            >
                {i18n.t("Download JSON ")}
                <GetAppIcon />
                {isImporting && <LinearProgress />}
            </Button>
            <MappingsList
                header={"Select & map datasets"}
                selectedMappings={selectedMappings}
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

export default React.memo(ImportDetail);
