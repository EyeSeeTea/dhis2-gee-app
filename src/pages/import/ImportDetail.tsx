import React, { useCallback } from "react";
import i18n from "../../locales";
import { useAppContext } from "../../contexts/app-context";
import { makeStyles } from "@material-ui/styles";
import PageHeader from "../../components/page-header/PageHeader";
import MappingsList from "../mappings/MappingsList";
import { Button } from "@material-ui/core";
import GetAppIcon from "@material-ui/icons/GetApp";
import ImportExportIcon from "@material-ui/icons/ImportExport";
import { ImportDetailModel } from "../../models/ImportDetail";
import OUDialog from "../../components/dialogs/OrganisationUnitDialog";
import DatePickerDialog from "../../components/dialogs/PeriodSelectorDialog";

interface ImportDetailProps {
    prefix: string;
}

const ImportDetail: React.FunctionComponent<ImportDetailProps> = props => {
    const { prefix } = props;
    const { api, config } = useAppContext();
    const classes = useStyles();
    const [selectedMappings, setSelectedMappings] = React.useState<string[]>([]);
    const [showOUDialog, setOUDialog] = React.useState<boolean>(false);
    const [showDatePickerDialog, setDatePickerDialog] = React.useState<boolean>(false);

    const model = React.useMemo(() => new ImportDetailModel(api, config, prefix), [
        api,
        config,
        prefix,
    ]);

    React.useEffect(() => {
        model.getImportData().then(setSelectedMappings);
    }, [api, model]);

    const closeDialog = useCallback(() => {
        setOUDialog(false);
        setDatePickerDialog(false);
    }, []);

    return (
        <React.Fragment>
            {showOUDialog && <OUDialog importPrefix={prefix} onClose={closeDialog} />}
            {showDatePickerDialog && (
                <DatePickerDialog importPrefix={prefix} onClose={closeDialog} />
            )}
            <PageHeader title={i18n.t("Import")} />
            <Button
                className={classes.button}
                variant="contained"
                onClick={() => setOUDialog(true)}
            >
                {i18n.t("Edit Organisation Units")}
            </Button>
            <Button
                className={classes.button}
                variant="contained"
                onClick={() => setDatePickerDialog(true)}
            >
                {i18n.t("Edit Period")}
            </Button>
            <Button className={classes.newImportButton} variant="contained">
                {i18n.t("Import to DHIS2 ")}
                <ImportExportIcon />
            </Button>
            <Button className={classes.newImportButton} variant="contained">
                {i18n.t("Download JSON ")}
                <GetAppIcon />
            </Button>
            <MappingsList header={"Selected mappings"} selectedMappings={selectedMappings} />
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
