import React from "react";
import i18n from "../../locales";
import { useSnackbar } from "d2-ui-components";
import { Id } from "d2-api";
import { useAppContext } from "../../contexts/app-context";
import { makeStyles } from "@material-ui/styles";
import { ImportDetailModel } from "../../models/ImportDetail";

interface ImportDetailProps {
    prefix: string;
}

const ImportDetail: React.FunctionComponent<ImportDetailProps> = props => {
    const { prefix } = props;
    const { d2, api, currentUser } = useAppContext();
    const snackbar = useSnackbar();
    const classes = useStyles();

    return (
        <div>
            <h2 className={classes.title}>Import {prefix}!</h2>

            <div>
                <p>
                    This is an example component written in Typescript, you can find it in{" "}
                    <b>src/pages/example/</b>, and its test in <b>src/pages/example/__tests__</b>
                </p>
            </div>

            <div>
                <p>Example of d2-ui-components snackbar usage:</p>

                <button onClick={() => snackbar.error("Some info")}>
                    {i18n.t("Click to show feedback")}
                </button>
            </div>
        </div>
    );
};

const useStyles = makeStyles({
    title: {
        color: "blue",
    },
});

export default React.memo(ImportDetail);
