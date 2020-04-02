import React from "react";
import { useHistory } from "react-router-dom";
import { MenuCardProps } from "./landing/MenuCard";
import { Landing } from "./Landing";
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
            title: i18n.t("Import"),
            key: "main",
            children: [
                {
                    name: i18n.t("Import"),
                    description: i18n.t("List and manage a new import."),
                    listAction: () => history.push("/import"),
                },
            ],
        },
        {
            title: i18n.t("Configuration"),
            key: "configuration",
            children: [
                {
                    name: i18n.t("Configuration"),
                    description: i18n.t("Configuration"),
                    listAction: () => history.push("/app/Configuration"),
                },
            ],
        },
    ];

    return <Landing cards={cards} />;
};

export default LandingPage;
