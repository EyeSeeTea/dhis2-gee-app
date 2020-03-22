import React from "react";
import { StepProps } from "../MappingsWizard";
import { Card, CardContent } from "@material-ui/core";

class GeneralInfoStep extends React.Component<StepProps> {
    render() {
        return (
            <Card>
                <CardContent>General Information</CardContent>
            </Card>
        );
    }
}

export default React.memo(GeneralInfoStep);
