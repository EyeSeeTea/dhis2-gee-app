import React from "react";
import _ from "lodash";
import { Card, CardContent, makeStyles, createStyles, Theme } from "@material-ui/core";

import { StepProps } from "../MappingWizard";

class VariablesMappingStep extends React.Component<StepProps> {
    render() {
        const { config, mapping } = this.props;
        console.log(_(config.data.base.googleDatasets).get(mapping.geeImage));
        return (
            <Card>
                <CardContent>
                    {/*
                    <ObjectsTable<AttributeMapping>
                        details={details}
                        columns={columns}
                        actions={.actions}
                        onActionButtonClick={() => goTo("mappings.new")}
                        mouseActionsMapping={mouseActionsMapping}
                        rows={rows}
                        filterComponents={
                            <div className={classes.tableHeader}>
                                {
                                    _(config.data.base.googleDatasets).get(mapping.geeImage)
                                        .displayName
                                }
                                :
                            </div>
                        }
                    />*/}
                </CardContent>
            </Card>
        );
    }
}

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        tableHeader: {
            ...theme.typography.button,
            padding: theme.spacing(1),
        },
    })
);

export default React.memo(VariablesMappingStep);
