import React from "react";
import PageHeader from "../../../components/page-header/PageHeader";
import i18n from "../../../locales";
import { useGoTo } from "../../../router";
import { ConfirmationDialog } from "d2-ui-components";

interface SyncRulesCreationParams {
    id?: string;
    action: "edit" | "new";
}
/*
const initialSteps = [
    {
        key: "general-info",
        label: i18n.t("General info"),
        component: GeneralInfoStep,
        description: i18n.t(`Please fill out information below for your project:`),
        props: {}
    },
    {
        key: "save-info",
        label: i18n.t("Summary and save"),
        component: GeneralInfoStep,
        description: i18n.t(`Please fill out information below for your project:`),
        props: {}
    },
];
*/

const MappingCreation: React.FC<SyncRulesCreationParams> = props => {
    const goTo = useGoTo();
    const { id, action } = props;
    const isEdit = action === "edit" && !!id;

    const title = !isEdit ? i18n.t("New mapping") : i18n.t("Edit mapping");

    const cancel = !isEdit ? i18n.t("Cancel mapping creation") : i18n.t("Cancel mapping edition");

    return (
        <React.Fragment>
            <ConfirmationDialog
                isOpen={false}
                title={cancel}
                onSave={() => console.log("save")}
                onCancel={() => console.log("cancel")}
                saveText={i18n.t("Ok")}
            />
            <PageHeader title={title} onBackClick={() => goTo("imports")} />
        </React.Fragment>
    );
};

export default React.memo(MappingCreation);
