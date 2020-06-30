import i18n from "@dhis2/d2-i18n";
import GeneralInfoStep from "./steps/GeneralInfoStep";
import VariablesMappingStep from "./steps/VariablesMappingStep";
import SummaryStep from "./steps/SummaryStep";

export const stepList = [
    {
        key: "general-info",
        label: i18n.t("General info"),
        component: GeneralInfoStep,
        validationKeys: ["name", "geeImage", "dataSet"],
    },
    {
        key: "de-mappings",
        label: i18n.t("Google Earth Engine variables mapping"),
        component: VariablesMappingStep,
        validationKeys: ["attributeMappingDictionary"],
    },
    {
        key: "summary-save",
        label: i18n.t("Summary and save"),
        component: SummaryStep,
        validationKeys: [],
    },
];
