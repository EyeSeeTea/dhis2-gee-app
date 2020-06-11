import React from "react";
import { Card, CardContent } from "@material-ui/core";

import { StepProps } from "../MappingWizard";
import AttributeMappingTable from "../../../attribute-mapping/AttributeMappingTable";

class VariablesMappingStep extends React.Component<StepProps> {
    render() {
        const { config, mapping, onChange } = this.props;
        debugger;
        const bands = config.data.base.googleDatasets[mapping.geeImage]["bands"].map(
            (band: any) => band.name
        );
        return (
            <Card>
                <CardContent>
                    <AttributeMappingTable
                        mapping={mapping}
                        onChange={onChange}
                        availableBands={bands}
                    />
                </CardContent>
            </Card>
        );
    }
}

export default React.memo(VariablesMappingStep);
