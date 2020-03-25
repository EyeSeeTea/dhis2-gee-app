import React from "react";
import _ from "lodash";
import { Card, CardContent } from "@material-ui/core";

import { StepProps } from "../MappingWizard";
import i18n from "../../../../locales";
import { MappingData } from "../../../../models/Mapping";

/* eslint-disable @typescript-eslint/no-var-requires */
const { TextField } = require("@dhis2/d2-ui-core");
const { FormBuilder, Validators } = require("@dhis2/d2-ui-forms");

type StringField = "name" | "description";

class GeneralInfoStep extends React.Component<StepProps> {
    onUpdateField = <K extends keyof MappingData>(fieldName: K, newValue: MappingData[K]) => {
        const { mapping, onChange } = this.props;
        const newMapping = mapping.set(fieldName, newValue as MappingData[K]);
        onChange(newMapping);
    };
    render() {
        const { mapping } = this.props;
        const fields = [
            getTextField("name", mapping.name, {
                validators: [validators.presence],
            }),
            getTextField("description", mapping.description, {
                props: { multiLine: true },
            }),
        ];
        return (
            <Card>
                <CardContent>
                    <FormBuilder fields={fields} onUpdateField={this.onUpdateField} />
                </CardContent>
            </Card>
        );
    }
}

type Validator<T> = { message: string; validator: (value: T) => boolean };

const validators = {
    presence: {
        message: i18n.t("Field cannot be blank"),
        validator: Validators.isRequired,
    },
};

function getTextField(
    name: StringField,
    value: string,
    { validators, props }: { validators?: Validator<string>[]; props?: _.Dictionary<any> } = {}
) {
    return {
        name,
        value,
        component: TextField,
        props: {
            floatingLabelText: name,
            style: { width: "33%" },
            changeEvent: "onBlur",
            "data-field": name,
            ...(props || {}),
        },
        validators: validators || [],
    };
}

export default React.memo(GeneralInfoStep);
