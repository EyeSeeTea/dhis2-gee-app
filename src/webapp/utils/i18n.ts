import i18n from "@dhis2/d2-i18n";

function t(message: string, namespace: object = {}) {
    const fullNamespace = { ...namespace, nsSeparator: false };
    return i18n.t(message, fullNamespace);
}

export default { t };
