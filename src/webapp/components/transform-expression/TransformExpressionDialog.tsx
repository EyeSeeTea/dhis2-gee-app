import DialogContent from "@material-ui/core/DialogContent";
import { ConfirmationDialog, useSnackbar } from "d2-ui-components";
import React, { useState } from "react";
import AttributeMapping from "../../models/AttributeMapping";
import { TextField, Box, Button, makeStyles } from "@material-ui/core";
import {
    TransformExpression,
    trasnformExpressionToken,
} from "../../../domain/entities/TransformExpression";
import i18n from "../../utils/i18n";

export interface AttributeMappingDialogProps {
    attributeMapping: AttributeMapping;
    onTransformExpressionChange: (newMapping: AttributeMapping) => void;
    onClose: () => void;
}

const TransformExpressionDialog: React.FC<AttributeMappingDialogProps> = ({
    attributeMapping,
    onTransformExpressionChange,
    onClose,
}) => {
    const classes = useStyles();
    const [expression, setExpression] = useState<string>(
        attributeMapping?.transformExpression || ""
    );
    const snackbar = useSnackbar();

    const onSave = () => {
        if (!attributeMapping) return;

        if (expression === "") {
            onTransformExpressionChange(attributeMapping.set("transformExpression", expression));
        } else {
            const creationResult = TransformExpression.create(expression);

            creationResult.fold(
                () => snackbar.error(i18n.t("The expression is not valid")),
                expression =>
                    onTransformExpressionChange(
                        attributeMapping.set("transformExpression", expression.value)
                    )
            );
        }
    };

    const title = i18n.t("Transform expression for attribute {{attr}}", {
        attr: attributeMapping ? attributeMapping.geeBand : "-",
    });

    const handleExpressionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setExpression(event.target.value);
    };

    const onTokenClick = () => {
        setExpression(expression + trasnformExpressionToken);
    };

    return (
        <React.Fragment>
            <ConfirmationDialog
                open={true}
                title={title}
                onCancel={onClose}
                onSave={onSave}
                maxWidth={"md"}
                fullWidth={true}
                disableSave={false}
                cancelText={i18n.t("Cancel")}
            >
                <DialogContent>
                    <Box display="flex" flexDirection="row" alignItems="center">
                        <Box width={3 / 4}>
                            <TextField
                                id="standard-full-width"
                                label="Transform expression"
                                style={{ margin: 8 }}
                                fullWidth
                                margin="normal"
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                value={expression}
                                onChange={handleExpressionChange}
                            />
                        </Box>
                        <Box
                            display="flex"
                            flexDirection="row"
                            width={1 / 4}
                            alignItems="center"
                            justifyContent="center"
                        >
                            <span>{i18n.t("Variable") + ": "} </span>
                            <Button
                                color="primary"
                                onClick={onTokenClick}
                                className={classes.label}
                            >
                                {trasnformExpressionToken}
                            </Button>
                        </Box>
                    </Box>
                </DialogContent>
            </ConfirmationDialog>
        </React.Fragment>
    );
};

export default TransformExpressionDialog;

const useStyles = makeStyles({
    label: {
        textTransform: "none",
    },
});
