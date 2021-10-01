import i18n from "@dhis2/d2-i18n";
import { DatePicker } from "@eyeseetea/d2-ui-components";
import { Box } from "@material-ui/core";
import React from "react";
import { availablePeriods, PeriodId, PeriodOption } from "../../../domain/entities/PeriodOption";
import Dropdown from "../dropdown/Dropdown";

interface PeriodSelectorProps {
    className?: string | undefined;
    selectedPeriod: PeriodOption | undefined;
    onChange: (period: PeriodOption) => void;
}

const PeriodSelector: React.FC<PeriodSelectorProps> = ({ selectedPeriod, onChange, className }) => {
    const periodItems = Object.values(availablePeriods);

    return (
        <Box display="flex" flexDirection="column" alignItems="center" className={className}>
            <Dropdown
                label={i18n.t("Period")}
                items={periodItems}
                value={selectedPeriod?.id || ""}
                onValueChange={(value: PeriodId) => onChange(availablePeriods[value])}
            />

            {selectedPeriod && selectedPeriod.id === "FIXED" && (
                <div>
                    <DatePicker
                        label={`${i18n.t("Start date")} (*)`}
                        value={selectedPeriod.startDate || null}
                        onChange={date => onChange({ ...selectedPeriod, startDate: date })}
                    />
                    <DatePicker
                        label={`${i18n.t("End date")} (*)`}
                        value={selectedPeriod.endDate || null}
                        onChange={date => onChange({ ...selectedPeriod, endDate: date })}
                    />
                </div>
            )}
        </Box>
    );
};

export default PeriodSelector;
