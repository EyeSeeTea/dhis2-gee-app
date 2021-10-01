import React, { useState, useEffect } from "react";
import _ from "lodash";
import { StepProps } from "../MappingWizard";
import { makeStyles, Button, LinearProgress } from "@material-ui/core";
import i18n from "@dhis2/d2-i18n";
import Mapping from "../../../../models/Mapping";
import { useSnackbar } from "@eyeseetea/d2-ui-components";
import { useHistory } from "react-router-dom";
import { useCompositionRoot } from "../../../../contexts/app-context";
import { GeeDataSet } from "../../../../../domain/entities/GeeDataSet";

const SummaryStep: React.FC<StepProps> = props => {
    const { api, config, mapping, onCancel } = props;
    const history = useHistory();
    const snackbar = useSnackbar();
    const classes = useStyles();
    const geeDataSets = useCompositionRoot().geeDataSets();

    const [dataSets, setDataSets] = useState<GeeDataSet[]>([]);

    const [isSaving, setSaving] = useState(false);

    useEffect(() => {
        geeDataSets.getAll.execute().then(setDataSets);
    }, [geeDataSets.getAll]);

    async function save() {
        try {
            setSaving(true);
            await mapping.save(api, config);
            setSaving(false);

            history.goBack();
            snackbar.success(`${i18n.t("Mapping saved:")} ${mapping.name}`);
        } catch (err: any) {
            setSaving(false);
            snackbar.error(err.message || err.toString());
        }
    }

    return (
        <React.Fragment>
            <div className={classes.wrapper}>
                <ul>
                    <LiEntry label={Mapping.getFieldName("name")} value={mapping.name} />
                    <LiEntry label={Mapping.getFieldName("description")} value={mapping.description} />
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
                            dataSets.find(ds => ds.id === mapping.geeImage)
                                ? dataSets.find(ds => ds.id === mapping.geeImage)?.displayName
                                : ""
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
                                                {`${attributeMapping.dataElementName} - (${
                                                    attributeMapping.dataElementId
                                                }) ${
                                                    attributeMapping.transformExpression
                                                        ? i18n.t("Transform expression: {{transformExpression}}", {
                                                              transformExpression: attributeMapping.transformExpression,
                                                              nsSeparator: false,
                                                          })
                                                        : ""
                                                }`}
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

const LiEntry = ({ label, value, separator = ":" }: { label: string; value?: React.ReactNode; separator?: string }) => {
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
