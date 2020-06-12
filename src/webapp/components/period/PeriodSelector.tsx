import React from "react";
import { DatePicker } from "d2-ui-components";
import i18n from "@dhis2/d2-i18n";
import Dropdown from "../dropdown/Dropdown";
import { availablePeriods, PeriodOption } from "../../../domain/entities/PeriodOption";

interface PeriodSelectorProps {
    selectedPeriod: PeriodOption | undefined;
    onChange: (period: PeriodOption) => void;
}

const PeriodSelector: React.FC<PeriodSelectorProps> = props => {
    const { selectedPeriod, onChange } = props;

    const periodItems = Object.values(availablePeriods);

    return (
        <React.Fragment>
            <Dropdown
                label={i18n.t("Period")}
                items={periodItems}
                value={selectedPeriod?.id || ""}
                onValueChange={(value: string) => onChange(availablePeriods[value])}
                hideEmpty={true}
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
        </React.Fragment>
    );
};

export default PeriodSelector;
