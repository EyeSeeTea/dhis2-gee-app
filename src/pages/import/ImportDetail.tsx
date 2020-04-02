import React, { useCallback, useState } from "react";
import i18n from "../../locales";
import _ from "lodash";
import { useAppContext } from "../../contexts/app-context";
import { makeStyles } from "@material-ui/styles";
import PageHeader from "../../components/page-header/PageHeader";
import MappingsList from "../mappings/MappingsList";
import { Button, LinearProgress } from "@material-ui/core";
import GetAppIcon from "@material-ui/icons/GetApp";
import ImportExportIcon from "@material-ui/icons/ImportExport";
import { DataImport, PeriodInformation } from "../../models/Import";
import OUDialog from "../../components/dialogs/OrganisationUnitDialog";
import PeriodSelectorDialog from "../../components/dialogs/PeriodSelectorDialog";
import { ConfirmationDialog, useSnackbar } from "d2-ui-components";
import Mapping from "../../models/Mapping";

interface ImportDetailProps {
    prefix: string;
}

const ImportDetail: React.FunctionComponent<ImportDetailProps> = props => {
    const { prefix } = props;
    const { api, config } = useAppContext();
    const classes = useStyles();
    const snackbar = useSnackbar();
    const [selectedMappings, setSelectedMappings] = useState<Mapping[]>([]);
    const [selectedOUs, setSelectedOUs] = useState<string[]>([]);
    const [periodInformation, setPeriodInformation] = useState<PeriodInformation>({ id: "" });
    const [showOUDialog, setOUDialog] = useState<boolean>(false);
    const [showPeriodDialog, setPeriodDialog] = useState<boolean>(false);
    const [openImportDialog, setOpenImportDialog] = useState<boolean>(false);
    const [isImporting, setImporting] = useState(false);

    React.useEffect(() => {
        DataImport.getImportData(api, config, prefix).then(imp => {
            setSelectedMappings(imp ? imp.data.selectedMappings : []);
            setSelectedOUs(imp ? imp.data.selectedOUs : []);
            setPeriodInformation(imp ? imp.data.periodInformation : { id: "" });
        });
    }, [api, config, prefix]);

    const closeDialog = useCallback(() => {
        setOUDialog(false);
        setPeriodDialog(false);
    }, []);

    const onSelectedMappingsChange = useCallback(
        (newSelectedMappings: Mapping[]) => {
            setSelectedMappings(newSelectedMappings);
            DataImport.getImportData(api, config, prefix).then(imp => {
                imp
                    ? imp.setSelectedMappings(newSelectedMappings).save()
                    : console.log("No import found");
            });
        },
        [api, config, prefix]
    );

    const onDeleteMappings = useCallback(
        (deletedMappingsIds: string[]) => {
            const newSelectedMappings = _.filter(
                selectedMappings,
                m => !deletedMappingsIds.includes(m.id)
            );
            onSelectedMappingsChange(newSelectedMappings);
        },
        [selectedMappings, onSelectedMappingsChange]
    );

    const onSelectedOUsSave = useCallback(
        (newSelectedOUs: string[]) => {
            setSelectedOUs(newSelectedOUs);
            DataImport.getImportData(api, config, prefix).then(imp => {
                imp ? imp.setSelectedOUs(newSelectedOUs).save() : console.log("No import found");
            });
            setOUDialog(false);
        },
        [api, config, prefix]
    );

    const onPeriodSelectionSave = useCallback(
        (newPeriod: PeriodInformation) => {
            setPeriodInformation(newPeriod);
            DataImport.getImportData(api, config, prefix).then(imp => {
                imp ? imp.setPeriodInformation(newPeriod).save() : console.log("No import found");
            });
            setPeriodDialog(false);
        },
        [api, config, prefix]
    );

    const importData = useCallback(() => {
        setImporting(true);
        DataImport.getImportData(api, config, prefix).then(async imp => {
            const response = await imp.run(false, api);
            console.log({ response });
            setImporting(false);
            setOpenImportDialog(false);

            if (response?.success) {
                snackbar.success(i18n.t("Import successful \n") + response.messages.join("\n"));
            } else {
                snackbar.error(i18n.t("Import failed: \n") + response.failures.join("\n"));
            }
        });
    }, [api, config, prefix, snackbar]);

    const downloadData = useCallback(() => {
        setImporting(true);
        DataImport.getImportData(api, config, prefix).then(async imp => {
            const response = await imp.run(true, api);
            console.log({ response });
            setImporting(false);

            if (response?.success) {
                snackbar.success(i18n.t("Import successful \n") + response.messages.join("\n"));
            } else {
                snackbar.error(i18n.t("Import failed: ") + response.failures.join("\n"));
            }
        });
    }, [api, config, prefix, snackbar]);

    return (
        <React.Fragment>
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
                    periodInformation={periodInformation}
                    onCancel={closeDialog}
                    onSave={onPeriodSelectionSave}
                />
            )}
            <PageHeader title={i18n.t("Import")} />
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
