import { Wizard, WizardStep } from "@eyeseetea/d2-ui-components";
import _ from "lodash";
import React from "react";
import { useLocation } from "react-router";
import { D2Api } from "../../../../types/d2-api";
import { useAppContext } from "../../../contexts/app-context";
import { Config } from "../../../models/Config";
import DataSet from "../../../models/DataSet";
import Mapping from "../../../models/Mapping";
import { getValidationMessages } from "../../../utils/validations";
import { stepList } from "./Steps";

interface MappingWizardProps {
    mapping?: Mapping;
    dataSets: DataSet[];
    onChange(newMapping: Mapping): void;
    onCancel(): void;
}

export interface StepProps {
    api: D2Api;
    config: Config;
    mapping: Mapping;
    dataSets: DataSet[];
    onChange(newMapping: Mapping): void;
    onCancel(): void;
}

const MappingWizard: React.FC<MappingWizardProps> = props => {
    const location = useLocation();
    const { api, config } = useAppContext();
    const { mapping, onChange, onCancel, dataSets } = props;

    const steps = stepList.map(step => ({
        ...step,
        props: {
            api,
            config,
            mapping,
            dataSets,
            onChange,
            onCancel,
        },
    }));

    const onStepChangeRequest = async (_currentStep: WizardStep, newStep: WizardStep) => {
        if (!mapping) return;

        const index = _(steps).findIndex(step => step.key === newStep.key);
        const validationMessages = await Promise.all(
            _.take(steps, index).map(({ validationKeys }) => getValidationMessages(api, mapping, validationKeys))
        );

        return _.flatten(validationMessages);
    };

    const urlHash = location.hash.slice(1);
    const stepExists = steps.find(step => step.key === urlHash);
    const firstStepKey = steps.map(step => step.key)[0];
    const initialStepKey = stepExists ? urlHash : firstStepKey;

    return (
        <Wizard
            useSnackFeedback={true}
            initialStepKey={initialStepKey}
            lastClickableStepIndex={steps.length - 1}
            steps={steps}
            onStepChangeRequest={onStepChangeRequest}
        />
    );
};

export default MappingWizard;
