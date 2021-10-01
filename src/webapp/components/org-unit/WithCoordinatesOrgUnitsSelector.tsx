import React, { useEffect } from "react";
import { OrgUnitsSelector } from "@eyeseetea/d2-ui-components";
import { useAppContext, useCompositionRoot } from "../../contexts/app-context";

interface OUDialogProps {
    selected: string[];
    selectableIds?: string[];
    onChange: (selectedOrgUnits: string[]) => void;
    fullWidth?: boolean;
}

const WithCoordinatesOrgUnitsSelector: React.FC<OUDialogProps> = ({
    selected,
    selectableIds,
    onChange,
    fullWidth = false,
}) => {
    const { api } = useAppContext();
    const [orgUnitsWithCoordinates, setOrgUnitsWithCoordinates] = React.useState<string[]>([]);
    const orgUnits = useCompositionRoot().orgUnits();

    useEffect(() => {
        orgUnits.getWithCoordinates.execute().then(orgUnits => {
            setOrgUnitsWithCoordinates(orgUnits.map(ou => ou.id));
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
            fullWidth={fullWidth}
            controls={controls}
            onChange={onChange}
            selected={selected}
            selectableIds={selectableIds ?? orgUnitsWithCoordinates}
        />
    );
};

export default WithCoordinatesOrgUnitsSelector;
