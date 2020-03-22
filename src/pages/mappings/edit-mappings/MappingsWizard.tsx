import React from "react";
import PageHeader from "../../../components/page-header/PageHeader";
import ExitWizardButton from "../../../components/wizard/ExitWizardButton";
import i18n from "../../../locales";
import { useGoTo } from "../../../router";

export interface StepProps {}

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

const MappingWizardPage: React.FC = props => {
    const goTo = useGoTo();
    return (
        <React.Fragment>
            <ExitWizardButton
                isOpen={false}
                onConfirm={() => console.log("onConfirm")}
                onCancel={() => console.log("onCancel")}
            />
            <PageHeader title={i18n.t("Edit mapping")} onBackClick={() => goTo("imports")} />
            {/*
        <Wizard
            steps={initialSteps}
            useSnackFeedback={true}
            initialStepKey={"general-info"}
        />
        )}*/}
        </React.Fragment>
    );
};

export default React.memo(MappingWizardPage);
