import React from "react";
import { useHistory } from "react-router-dom";
import { MenuCardProps } from "./landing/MenuCard";
import { Landing } from "./Landing";

const LandingPage: React.FC = () => {
    const history = useHistory();

    const cards: {
        title: string;
        key: string;
        isVisible?: boolean;
        children: MenuCardProps[];
    }[] = [
        {
            title: "Section",
            key: "main",
            children: [
                {
                    name: "With List",
                    description: "This entry has only a list action.",
                    listAction: () => history.push("/for/John"),
                },
                {
                    name: "List/add",
                    description: "This action has list and add icons",
                    addAction: () => history.push("/for"),
                    listAction: () => history.push("/for/Mary"),
                },
            ],
        },
        {
            title: "Configuration",
            key: "configuration",
            children: [
                {
                    name: "Stub configuration",
                    description: "Configuration",
                    listAction: () => history.push("/for/Configuration"),
                },
            ],
        },
    ];

    return <Landing cards={cards} />;
};

export default LandingPage;
