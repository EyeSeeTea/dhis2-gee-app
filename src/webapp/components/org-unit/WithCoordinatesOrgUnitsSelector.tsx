import React, { useEffect } from "react";
import { OrgUnitsSelector } from "d2-ui-components";
import { useAppContext, useCompositionRoot } from "../../contexts/app-context";

interface OUDialogProps {
    selected: string[];
    onChange: (selectedOrgUnits: string[]) => void;
}

const WithCoordinatesOrgUnitsSelector: React.FC<OUDialogProps> = props => {
    const { selected, onChange } = props;
    const { api } = useAppContext();
    const [selectablesOrgs, setSelectablesOrgs] = React.useState<string[]>([]);
    const orgUnits = useCompositionRoot().orgUnits();

    useEffect(() => {
        orgUnits.getWithCoordinates.execute().then(orgUnits => {
            setSelectablesOrgs(orgUnits.map(ou => ou.id));
        });
    }, [orgUnits.getWithCoordinates]);

    const controls = {
        filterByLevel: true,
        filterByGroup: true,
        selectAll: true,
    };

    return (
        <OrgUnitsSelector
            api={api}
            typeInput="checkbox"
            fullWidth={true}
            controls={controls}
            onChange={onChange}
            selected={selected}
            selectableIds={selectablesOrgs}
        />
    );
};

export default WithCoordinatesOrgUnitsSelector;
