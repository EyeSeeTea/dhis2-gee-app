import _ from "lodash";
import i18n from "@dhis2/d2-i18n";

export interface Validation {
    [key: string]: {
        key: string;
        namespace: object;
    }[];
}

const translations: { [key: string]: (namespace: object) => string } = {
    cannotBeBlank: namespace => i18n.t("Field {{field}} cannot be blank", namespace),
    urlUsernameComboAlreadyExists: () => i18n.t("This URL and username combination already exists"),
    cannotBeEmpty: namespace => i18n.t("You need to select at least one {{element}}", namespace),

    invalidPeriod: () => i18n.t("Start and end dates are not a valid period"),
};

export async function getValidationMessages(
    d2: object,
    model: { validate: (d2?: object) => Validation | Promise<Validation> },
    validationKeys: string[] | null = null
) {
    const validationObj = await model.validate(d2);

    return _(validationObj)
        .at(validationKeys || _.keys(validationObj))
        .flatten()
        .compact()
        .map(error => {
            const translation = translations[error.key];
            if (translation) {
                return i18n.t(translation(error.namespace));
            } else {
                return `Missing translations: ${error.key}`;
            }
        })
        .value();
}
