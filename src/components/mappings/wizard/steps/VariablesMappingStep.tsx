import React from "react";
import { Card, CardContent } from "@material-ui/core";

import { StepProps } from "../MappingWizard";

import { getConnection } from "../../../../utils/googleEarthEngine";

class VariablesMappingStep extends React.Component<StepProps> {
    render() {
        const { config } = this.props;
        getConnection(config);

        return (
            <Card>
                <CardContent></CardContent>
            </Card>
        );
    }
}

export default React.memo(VariablesMappingStep);
