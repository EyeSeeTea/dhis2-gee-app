import React, { useEffect, useState } from "react";
import PageHeader from "../../../components/page-header/PageHeader";
import i18n from "@dhis2/d2-i18n";
import { useLoading } from "d2-ui-components";
import MappingWizard from "../../../components/mappings/wizard/MappingWizard";
import Mapping from "../../../models/Mapping";
import { useAppContext } from "../../../contexts/app-context";
import ExitWizardButton from "../../../components/mappings/wizard/ExitWizardButton";
import DataSet from "../../../models/DataSet";
import { useHistory } from "react-router-dom";

interface SyncRulesCreationParams {
    id?: string;
    action: "edit" | "new";
}

const MappingCreation: React.FC<SyncRulesCreationParams> = props => {
    const history = useHistory();
    const loading = useLoading();
    const { api, config } = useAppContext();
    const { id, action } = props;
    const isEdit = action === "edit" && !!id;

    const title = !isEdit ? i18n.t("New mapping") : i18n.t("Edit mapping");

    const [mapping, updateMapping] = useState(Mapping.create());
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dataSets, updateDataSets] = useState<undefined | DataSet[]>([]);

    async function getDataSets() {
        const res = await DataSet.getList(api);
        updateDataSets(res.dataSets);
    }

    useEffect(() => {
        getDataSets();
        if (isEdit && !!id) {
            Mapping.get(api, config, id).then(m => {
                updateMapping(m);
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [api, config, loading, isEdit, id]);

    return (
        <React.Fragment>
            <PageHeader title={title} onBackClick={() => setDialogOpen(true)} />
            <ExitWizardButton
                isOpen={dialogOpen}
                onConfirm={() => history.goBack()}
                onCancel={() => setDialogOpen(false)}
            />

            <MappingWizard
                mapping={mapping}
                onChange={updateMapping}
                dataSets={dataSets ?? []}
                onCancel={() => setDialogOpen(true)}
            ></MappingWizard>
        </React.Fragment>
    );
};

export default React.memo(MappingCreation);
