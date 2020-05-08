import React from "react";
import _ from "lodash";
import { Card, CardContent } from "@material-ui/core";

import { StepProps } from "../MappingWizard";
import AttributeMappingTable from "../../../attribute-mapping/AttributeMappingTable";

class VariablesMappingStep extends React.Component<StepProps> {
    render() {
        const { api, config, mapping, onChange } = this.props;
        return (
            <Card>
                <CardContent>
                    <AttributeMappingTable
                        api={api}
                        mapping={mapping}
                        onChange={onChange}
                        availableBands={
                            _(config.data.base.googleDatasets).get(mapping.geeImage)["bands"]
                        }
                    />
                </CardContent>
            </Card>
        );
    }
}

export default React.memo(VariablesMappingStep);
