import React from "react";
import { WizardStep, Wizard } from "d2-ui-components";
import { D2Api } from "d2-api";
import Mapping from "../../../models/Mapping";
import { useLocation } from "react-router";
import _ from "lodash";
import { History, Location } from "history";
import { Config } from "../../../models/Config";
import { useAppContext } from "../../../contexts/app-context";
import { stepList } from "./Steps";
import { getValidationMessages } from "../../../utils/validations";

interface MappingWizardProps {
    mapping?: Mapping;
    onChange(newMapping: Mapping): void;
}

export interface StepProps {
    api: D2Api;
    mapping: Mapping;
    onChange(newMapping: Mapping): void;
}

interface Props {
    api: D2Api;
    config: Config;
    history: History;
    location: Location;
    snackbar: any;
}

const MappingWizard: React.FC<MappingWizardProps> = props => {
    const location = useLocation();
    const { api } = useAppContext();
    const { mapping, onChange } = props;
    const steps = stepList.map(step => ({
        ...step,
        props: {
            api,
            mapping,
            onChange,
        },
    }));

    const onStepChangeRequest = async (_currentStep: WizardStep, newStep: WizardStep) => {
        console.log("Change");
        const index = _(steps).findIndex(step => step.key === newStep.key);
        const validationMessages = await Promise.all(
            _.take(steps, index).map(({ validationKeys }) =>
                getValidationMessages(api, mapping, validationKeys)
            )
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
