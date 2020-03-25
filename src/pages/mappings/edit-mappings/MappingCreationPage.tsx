import React, { useEffect, useState } from "react";
import PageHeader from "../../../components/page-header/PageHeader";
import i18n from "../../../locales";
import { useGoTo } from "../../../router";
import { ConfirmationDialog, useLoading } from "d2-ui-components";
import MappingWizard from "../../../components/mappings/wizard/MappingWizard";
import Mapping from "../../../models/Mapping";
import { useAppContext } from "../../../contexts/app-context";

interface SyncRulesCreationParams {
    id?: string;
    action: "edit" | "new";
}

const MappingCreation: React.FC<SyncRulesCreationParams> = props => {
    const goTo = useGoTo();
    const loading = useLoading();
    const { api, config } = useAppContext();
    const { id, action } = props;
    const isEdit = action === "edit" && !!id;

    const title = !isEdit ? i18n.t("New mapping") : i18n.t("Edit mapping");
    const cancel = !isEdit ? i18n.t("Cancel mapping creation") : i18n.t("Cancel mapping edition");

    const [mapping, updateMapping] = useState(Mapping.create());

    useEffect(() => {
        if (isEdit && !!id) {
            loading.show(true, "Loading mapping");
            Mapping.get(api, config, id).then(m => {
                updateMapping(m);
                loading.reset();
            });
        }
    }, [api, config, loading, isEdit, id]);

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
            <MappingWizard mapping={mapping} onChange={updateMapping}></MappingWizard>
        </React.Fragment>
    );
};

export default React.memo(MappingCreation);
