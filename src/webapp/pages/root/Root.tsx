import React from "react";
import { Route, Switch, HashRouter, useHistory } from "react-router-dom";
import ImportOnDemandPage from "../import-on-demand/ImportOnDemandPage";
import MappingCreationPage from "../mappings/edit-mappings/MappingCreationPage";
import LandingPage from "../home/HomePage";
import ImportRulesPage from "../import-rules-list/ImportRulesListPage";

export const pageRoutes = {
    home: { path: "/" },
    import: { path: "/import" },
    importRules: { path: "/import-rules" },
    importRulesNew: { path: "/import-rules/new" },
    importRulesEdit: {
        path: "/import-rules/:id",
        generateUrl: ({ id }: { id: string }) => `/import-rules/${id}`,
    },
    mappingsNew: { path: "/mappings/new" },
    mappingsEdit: {
        path: "/mappings/:id",
        generateUrl: ({ id }: { id: string }) => `/mappings/${id}`,
    },
    history: { path: "/history" },
};

interface PageRoute {
    path: string;
    generateUrl?: (params: any) => string;
}

export type GoTo = (pageRoute: PageRoute, params?: any) => void;

export function useGoTo() {
    const history = useHistory();
    const goTo: GoTo = (pageRoute: PageRoute, params?: any) => {
        if (pageRoute.generateUrl && params) {
            history.push(pageRoute.generateUrl(params));
        } else {
            history.push(pageRoute.path);
        }
    };
    return goTo;
}

const Root = () => {
    return (
        <HashRouter>
            <Switch>
                <Route path={pageRoutes.home.path} exact render={() => <LandingPage />} />

                <Route
                    path={pageRoutes.import.path}
                    render={() => <ImportOnDemandPage id="default" />}
                />

                <Route
                    path={pageRoutes.mappingsNew.path}
                    render={() => <MappingCreationPage action={"new"} />}
                />
                <Route path={pageRoutes.importRules.path} render={() => <ImportRulesPage />} />
                <Route
                    path={pageRoutes.mappingsEdit.path}
                    render={({ match }) => (
                        <MappingCreationPage action={"edit"} id={match.params.id} />
                    )}
                />
            </Switch>
        </HashRouter>
    );
};

export default Root;
