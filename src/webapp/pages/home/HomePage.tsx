import React from "react";
import { useHistory } from "react-router-dom";
import { MenuCardProps } from "../../components/landing/MenuCard";
import { Landing } from "../../components/landing/Landing";
import i18n from "../../locales";

const LandingPage: React.FC = () => {
    const history = useHistory();

    const cards: {
        title: string;
        key: string;
        isVisible?: boolean;
        children: MenuCardProps[];
    }[] = [
        {
            title: "Imports",
            key: "Main",
            children: [
                {
                    name: i18n.t("Manual Import"),
                    description: i18n.t(
                        "Manually import gee data values by selecting organisation unit, period and creating o select the mapping/s for gee data sets."
                    ),
                    listAction: () => history.push("/import"),
                },
                {
                    name: i18n.t("Import rules"),
                    description: i18n.t(
                        "Create, modify, delete, execute import rules for gee data values selecting organisation unit, period and creating o select the mapping/s for gee data sets. "
                    ),
                    addAction: () => history.push("/import-rules/new"),
                    listAction: () => history.push("/import-rules"),
                },
                {
                    name: i18n.t("History"),
                    description: i18n.t(
                        "View and analyse the status and results of the manual import and import rules executions."
                    ),
                    listAction: () => history.push("/history"),
                },
            ],
        },
    ];

    return <Landing cards={cards} />;
};

export default LandingPage;
