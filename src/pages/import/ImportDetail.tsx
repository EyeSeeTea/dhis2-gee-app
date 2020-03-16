import React from "react";
import i18n from "../../locales";
import { useSnackbar, ObjectsTable, TableColumn, TableAction } from "d2-ui-components";
import { Id } from "d2-api";
import { useAppContext } from "../../contexts/app-context";
import { makeStyles } from "@material-ui/styles";
import { ImportDetailModel } from "../../models/ImportDetail";
import { MappingForList } from "../../models/Mapping";
import PageHeader from "../../components/page-header/PageHeader";

interface ImportDetailProps {
    prefix: string;
}

const columns: TableColumn<MappingForList>[] = [
    { name: "name", text: i18n.t("Name"), sortable: true },
    { name: "code", text: i18n.t("Code"), sortable: true },
    { name: "dataSet", text: i18n.t("Data set"), sortable: true },
    { name: "dataElement", text: i18n.t("Data element"), sortable: true },
    { name: "geeImage", text: i18n.t("G.E.E Dataset"), sortable: true },
    { name: "geeBand", text: i18n.t("G.E.E Attribute"), sortable: true },
    { name: "periodAgg", text: i18n.t("Period aggregation"), sortable: true },
];

const details = [
    ...columns,
    { name: "id", text: i18n.t("Id") },
    { name: "created", text: i18n.t("Created") }
];

const actions = [
    {
        name: "details",
        text: i18n.t("Details"),
        multiple: false,
        type: "details",
    }
];

const rows = [
    {
        "id": "Mapping1",
        "name": "Mapping1",
        "code": "Mapping1",
        "dataSet": "DS1",
        "dataElement": "DE1",
        "geeImage": "GEE",
        "geeBand": "GEE",
        "periodAgg": "Monthly",
        "created": "Date",
    },
];


const ImportDetail: React.FunctionComponent<ImportDetailProps> = props => {
    const { prefix } = props;
    const { d2, api, currentUser } = useAppContext();
    const snackbar = useSnackbar();
    const classes = useStyles();
    const model = React.useMemo(() => new ImportDetailModel(api), [api]);
   

    return (
        <React.Fragment>
            <PageHeader title={i18n.t("Import maintenance")} />
            <ObjectsTable<MappingForList>
                searchBoxLabel={i18n.t("Search")}
                columns={columns}
                actions={actions}
                rows={rows}
                actionButtonLabel={i18n.t("New mapping")}
                onActionButtonClick={() => console.log("Floating button clicked")}
            />
        </React.Fragment>
    );
};

const useStyles = makeStyles({
    title: {
        color: "blue",
    },
});

export default React.memo(ImportDetail);
