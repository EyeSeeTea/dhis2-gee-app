import React from "react";
import i18n from "../../../utils/i18n";
import { TextField } from "@dhis2/d2-ui-core";
import { FormBuilder, Validators } from "@dhis2/d2-ui-forms";
import { ImportRuleState } from "../../pages/import-rule-detail/ImportRuleDetailState";

interface GeneralInfoStepProps {
    importRule: ImportRuleState;
    onChange: (importRule: ImportRuleState) => void;
}

const GeneralInfoStep: React.FC<GeneralInfoStepProps> = ({ importRule, onChange }) => {
    const updateFields = (field: string, value: string) => {
        if (field === "name") {
            onChange({ ...importRule, name: value });
        } else if (field === "code") {
            onChange({ ...importRule, code: value });
        } else if (field === "description") {
            onChange({ ...importRule, description: value });
        }
    };

    const fields = [
        {
            name: "name",
            value: importRule.name,
            component: TextField,
            props: {
                floatingLabelText: `${i18n.t("Name")} (*)`,
                style: { width: "100%" },
                changeEvent: "onBlur",
                "data-test": "name",
            },
            validators: [
                {
                    message: i18n.t("Field cannot be blank"),
                    validator: Validators.isRequired,
                },
            ],
        },
        {
            name: "code",
            value: importRule.code,
            component: TextField,
            props: {
                floatingLabelText: `${i18n.t("Code")}`,
                style: { width: "100%" },
                changeEvent: "onBlur",
                "data-test": "code",
            },
            validators: [],
        },
        {
            name: "description",
            value: importRule.description,
            component: TextField,
            props: {
                floatingLabelText: i18n.t("Description"),
                style: { width: "100%" },
                changeEvent: "onBlur",
                "data-test": "description",
            },
            validators: [],
        },
    ];

    return <FormBuilder fields={fields} onUpdateField={updateFields} />;
};

export default React.memo(GeneralInfoStep);
