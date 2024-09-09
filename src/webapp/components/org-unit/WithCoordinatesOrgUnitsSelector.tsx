import React, { useCallback } from "react";
import { OrgUnitsSelector } from "@eyeseetea/d2-ui-components";
import { useAppContext } from "../../contexts/app-context";
import { OrgUnit } from "../../../domain/entities/OrgUnit";

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

    const controls = {
        filterByLevel: true,
        filterByGroup: true,
        selectAll: true,
    };

    const onFilterWithCoordinates = useCallback((orgUnits: OrgUnit[]) => {
        setOrgUnitsWithCoordinates(prevOrgUnitsWithCoordinates => [
            ...prevOrgUnitsWithCoordinates,
            ...orgUnits.filter(child => !!child.geometry).map(child => child.id),
        ]);
    }, []);

    return (
        <OrgUnitsSelector
            api={api}
            typeInput="checkbox"
            fullWidth={fullWidth}
            controls={controls}
            onChange={onChange}
            selected={selected}
            selectableIds={selectableIds ?? orgUnitsWithCoordinates}
            onChildrenLoaded={onFilterWithCoordinates}
        />
    );
};

export default WithCoordinatesOrgUnitsSelector;
