import React from "react";
import { pageRoutes } from "../root/Root";
import { makeStyles, Typography, Theme, Box } from "@material-ui/core";
import i18n from "../../../locales";
import { Link } from "react-router-dom";

const useStyles = makeStyles((theme: Theme) => ({
    root: {
        marginTop: theme.spacing(14),
        padding: theme.spacing(4),
    },
    link: {
        marginTop: theme.spacing(2),
    },
}));

const NotFoundPage: React.FC = () => {
    const classes = useStyles();

    return (
        <React.Fragment>
            {
                <Box
                    display="flex"
                    flexDirection="column"
                    className={classes.root}
                    justifyContent="center"
                    alignItems="center"
                >
                    <Typography variant="h5">
                        {i18n.t("404, The page you are looking for isn’t here")}
                    </Typography>
                    <Typography variant="h6">
                        {i18n.t("You either tried some shady route or you came here by mistake.")}
                    </Typography>
                    <Link to={pageRoutes.home.path} className={classes.link}>
                        {i18n.t("Back to Home")}
                    </Link>
                </Box>
            }
        </React.Fragment>
    );
};

export default NotFoundPage;
