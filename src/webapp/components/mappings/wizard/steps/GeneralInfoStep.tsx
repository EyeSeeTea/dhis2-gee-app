import React from "react";
import _ from "lodash";
import { Card, CardContent } from "@material-ui/core";

import { StepProps } from "../MappingWizard";
import i18n from "@dhis2/d2-i18n";
import Mapping, { MappingData } from "../../../../models/Mapping";
import GeeDataSetSelector from "../../../gee-data-sets/GeeDataSetSelector";

/* eslint-disable @typescript-eslint/no-var-requires */
const { TextField, DropDown } = require("@dhis2/d2-ui-core");
const { FormBuilder, Validators } = require("@dhis2/d2-ui-forms");

type StringField = "name" | "description";
type DropdownField = "dataSetId";

class GeneralInfoStep extends React.Component<StepProps> {
    onUpdateField = <K extends keyof MappingData>(fieldName: K, newValue: MappingData[K]) => {
        const { mapping, onChange, dataSets } = this.props;
        let newMapping = mapping.set(fieldName, newValue as MappingData[K]);

        if (fieldName === "geeImage") {
            newMapping = newMapping.set("attributeMappingDictionary", {});
        } else if (fieldName === "dataSetId") {
            newMapping = newMapping.set(
                "dataSetName",
                _.find(dataSets, ["id", newValue])?.name ?? "-"
            );
        }
        onChange(newMapping);
    };

    render() {
        const { mapping, dataSets } = this.props;
        const fields = [
            getTextField("name", mapping.name, {
                validators: [validators.presence],
                props: {
                    floatingLabelText: Mapping.getFieldName("name") + " (*)",
                },
            }),
            getTextField("description", mapping.description, {
                props: { multiLine: true, floatingLabelText: Mapping.getFieldName("description") },
            }),
            getGeeDataSetSelectorField("geeImage", mapping.geeImage, {
                validators: [validators.presence],
                props: {
                    floatingLabelText: Mapping.getFieldName("geeImage") + " (*)",
                    style: { marginTop: 20 },
                },
            }),
            getDropdownField("dataSetId", mapping.dataSetId, {
                validators: [validators.presence],
                props: {
                    floatingLabelText: Mapping.getFieldName("dataSetId") + " (*)",
                    menuItems: _(dataSets)
                        .map(value => ({ ...value, displayName: value.name }))
                        .value(),
                    style: { marginTop: 20 },
                },
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

function getDropdownField(
    name: DropdownField,
    value: string,
    { validators, props }: { validators?: Validator<string>[]; props?: _.Dictionary<any> } = {}
) {
    return {
        name,
        value,
        component: DropDown,
        props: {
            ...(props || {}),
        },
        validators: validators || [],
    };
}

function getGeeDataSetSelectorField(
    name: string,
    value: string,
    { validators, props }: { validators?: Validator<string>[]; props?: _.Dictionary<any> } = {}
) {
    return {
        name,
        value,
        component: GeeDataSetSelector,
        props: {
            ...(props || {}),
        },
        validators: validators || [],
    };
}

export default React.memo(GeneralInfoStep);
