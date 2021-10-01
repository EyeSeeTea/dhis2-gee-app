import i18n from "@dhis2/d2-i18n";
import { ErrorsDictionary } from "../../domain/errors/Generic";

interface ErrorTranslations {
    [field: string]: (field: string) => string;
}

const translations: ErrorTranslations = {
    cannotBeEmpty: (field: string) => i18n.t("Field {{field}} cannot be blank", { field }),
};

export function getValidationTranslations(errors: ErrorsDictionary): string[] {
    return Object.keys(errors)
        .map(
            field =>
                errors[field]?.map(errorKey => {
                    const fieldErrorTranslation = translations[errorKey];
                    if (fieldErrorTranslation) {
                        return i18n.t(fieldErrorTranslation(field));
                    } else {
                        return `Missing translations: ${errors[field]}`;
                    }
                }) ?? []
        )
        .flat();
}
