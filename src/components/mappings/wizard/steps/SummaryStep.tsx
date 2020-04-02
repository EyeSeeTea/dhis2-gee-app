import React, { useState } from "react";
import _ from "lodash";
import { StepProps } from "../MappingWizard";
import { makeStyles, Button, LinearProgress } from "@material-ui/core";
import i18n from "../../../../locales";
import Mapping from "../../../../models/Mapping";
import { useGoTo } from "../../../../router";
import { useSnackbar } from "d2-ui-components";

const SummaryStep: React.FC<StepProps> = props => {
    const { api, config, mapping, onCancel } = props;
    const goTo = useGoTo();
    const snackbar = useSnackbar();
    const classes = useStyles();

    const [isSaving, setSaving] = useState(false);

    async function save() {
        try {
            setSaving(true);
            await mapping.save(api, config);
            setSaving(false);
            goTo("imports");
            snackbar.success(`${i18n.t("Mapping saved:")} ${mapping.name}`);
        } catch (err) {
            setSaving(false);
            snackbar.error(err.message || err.toString());
        }
    }

    return (
        <React.Fragment>
            <div className={classes.wrapper}>
                <ul>
                    <LiEntry label={Mapping.getFieldName("name")} value={mapping.name} />
                    <LiEntry
                        label={Mapping.getFieldName("description")}
                        value={mapping.description}
                    />
                    <LiEntry
                        label={i18n.t("Dataset")}
                        value={
                            <span>
                                {mapping.dataSetName} - ({mapping.dataSetId})
                            </span>
                        }
                    />
                    <LiEntry
                        label={Mapping.getFieldName("geeImage")}
                        value={
                            _(config.data.base.googleDatasets).get(mapping.geeImage)["displayName"]
                        }
                    />
                    <LiEntry
                        label={Mapping.getFieldName("attributeMappingDictionary")}
                        value={
                            <ul>
                                {_.map(mapping.attributeMappingDictionary, attributeMapping => (
                                    <LiEntry
                                        label={attributeMapping.geeBand}
                                        value={
                                            <span key={attributeMapping.geeBand + "Div"}>
                                                {attributeMapping.dataElementName} - (
                                                {attributeMapping.dataElementId})
                                            </span>
                                        }
                                        separator=" ->"
                                    ></LiEntry>
                                ))}
                            </ul>
                        }
                    />
                </ul>

                <Button onClick={onCancel} variant="contained">
                    {i18n.t("Cancel")}
                </Button>
                <Button className={classes.saveButton} onClick={() => save()} variant="contained">
                    {i18n.t("Save")}
                </Button>

                {isSaving && <LinearProgress />}
            </div>
        </React.Fragment>
    );
};

const LiEntry = ({
    label,
    value,
    separator = ":",
}: {
    label: string;
    value?: React.ReactNode;
    separator?: string;
}) => {
    return (
        <li key={label}>
            {label}
            {separator}&nbsp;{value || "-"}
        </li>
    );
};

const useStyles = makeStyles({
    wrapper: {
        padding: 5,
    },
    saveButton: {
        margin: 10,
        backgroundColor: "#2b98f0",
        color: "white",
    },
});

export default React.memo(SummaryStep);
