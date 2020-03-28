import React, { useEffect, useState } from "react";
import PageHeader from "../../../components/page-header/PageHeader";
import i18n from "../../../locales";
import { useGoTo } from "../../../router";
import { useLoading } from "d2-ui-components";
import MappingWizard from "../../../components/mappings/wizard/MappingWizard";
import Mapping from "../../../models/Mapping";
import { useAppContext } from "../../../contexts/app-context";
import ExitWizardButton from "../../../components/mappings/wizard/ExitWizardButton";

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

    const [mapping, updateMapping] = useState(Mapping.create());
    const [dialogOpen, setDialogOpen] = useState(false);

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
            <PageHeader title={title} onBackClick={() => setDialogOpen(true)} />
            <ExitWizardButton
                isOpen={dialogOpen}
                onConfirm={() => goTo("imports")}
                onCancel={() => setDialogOpen(false)}
            />

            <MappingWizard
                mapping={mapping}
                onChange={updateMapping}
                onCancel={() => setDialogOpen(true)}
            ></MappingWizard>
        </React.Fragment>
    );
};

export default React.memo(MappingCreation);
