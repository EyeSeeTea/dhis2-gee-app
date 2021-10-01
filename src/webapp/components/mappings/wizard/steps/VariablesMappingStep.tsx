import React from "react";
import { Card, CardContent } from "@material-ui/core";
import { StepProps } from "../MappingWizard";
import AttributeMappingTable from "../../../attribute-mapping/AttributeMappingTable";
import { useCompositionRoot } from "../../../../contexts/app-context";

const VariablesMappingStep: React.FC<StepProps> = ({ mapping, onChange }) => {
    const geeDataSets = useCompositionRoot().geeDataSets();

    const [bands, setBands] = React.useState<string[]>([]);

    React.useEffect(() => {
        geeDataSets.getById.execute(mapping.geeImage).then(result => {
            if (result.isDefined()) {
                setBands(result.get().bands?.map(band => band.name) ?? []);
            }
        });
    }, [geeDataSets.getById, mapping]);

    return (
        <Card>
            <CardContent>
                <AttributeMappingTable mapping={mapping} onChange={onChange} availableBands={bands} />
            </CardContent>
        </Card>
    );
};

export default React.memo(VariablesMappingStep);
