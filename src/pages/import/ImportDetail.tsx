import React from "react";
import i18n from "../../locales";
import { useAppContext } from "../../contexts/app-context";
import { makeStyles } from "@material-ui/styles";
import PageHeader from "../../components/page-header/PageHeader";
import { useHistory } from "react-router";
import { History } from "history";
import MappingsList from "../mappings/MappingsList";
import { Button } from "@material-ui/core";
import GetAppIcon from "@material-ui/icons/GetApp";
import ImportExportIcon from "@material-ui/icons/ImportExport";

function goTo(history: History, url: string) {
    history.push(url);
}

interface ImportDetailProps {
    prefix: string;
}

const ImportDetail: React.FunctionComponent<ImportDetailProps> = props => {
    const { prefix } = props;
    console.log(prefix);
    const history = useHistory();
    const { api } = useAppContext();
    console.log(api.baseUrl);
    const classes = useStyles();

    return (
        <React.Fragment>
            <PageHeader title={i18n.t("Import")} onBackClick={() => goTo(history, "/")} />
            <Button className={classes.button} variant="contained">
                {i18n.t("Edit Organisation Units")}
            </Button>
            <Button className={classes.button} variant="contained">
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
            <MappingsList header={"Selected mappings"} />
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
