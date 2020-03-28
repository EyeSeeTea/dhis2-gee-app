import React from "react";
import PropTypes from "prop-types";
import { ConfirmationDialog } from "d2-ui-components";
import i18n from "@dhis2/d2-i18n";

class ExitWizardButton extends React.Component {
    static propTypes = {
        isOpen: PropTypes.bool,
        onConfirm: PropTypes.func.isRequired,
        onCancel: PropTypes.func.isRequired,
    };
    render() {
        const { isOpen, onCancel, onConfirm } = this.props;

        if (!isOpen) return null;

        return (
            <ConfirmationDialog
                isOpen={true}
                onSave={onConfirm}
                onCancel={onCancel}
                title={i18n.t("Cancel mapping?")}
                description={i18n.t(
                    "All your changes will be lost. Are you sure you want to proceed?"
                )}
                saveText={i18n.t("Yes")}
                cancelText={i18n.t("No")}
            />
        );
    }
}

export default React.memo(ExitWizardButton);
