import React from "react";
import { Route, Switch, HashRouter, useHistory, Redirect } from "react-router-dom";
import MappingCreationPage from "../mappings/edit-mappings/MappingCreationPage";
import LandingPage from "../home/HomePage";
import ImportRuleListPage from "../import-rule-list/ImportRuleListPage";
import ImportRuleDetailPage from "../import-rule-detail/ImportRuleDetailPage";

export const pageRoutes = {
    home: { path: "/" },
    importRules: { path: "/import-rules" },
    importRulesDetail: {
        path: "/import-rules/:action(new|edit|ondemand)/:id?",
        generateUrl: ({ id, action }: { id?: string; action: "new" | "edit" | "ondemand" }) =>
            `/import-rules/${action}${id ? "/" + id : ""}`,
    },
    mappingsNew: { path: "/mappings/new" },
    mappingsEdit: {
        path: "/mappings/:id",
        generateUrl: ({ id }: { id: string }) => `/mappings/${id}`,
    },
    history: { path: "/history" },
    notFound: { path: "/not-found" },
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
                    path={pageRoutes.importRules.path}
                    exact
                    render={() => <ImportRuleListPage />}
                />
                <Route
                    path={pageRoutes.importRulesDetail.path}
                    exact
                    render={() => <ImportRuleDetailPage />}
                />

                <Route
                    path={pageRoutes.mappingsNew.path}
                    render={() => <MappingCreationPage action={"new"} />}
                />
                <Route
                    path={pageRoutes.mappingsEdit.path}
                    render={({ match }) => (
                        <MappingCreationPage action={"edit"} id={match.params.id} />
                    )}
                />

                <Redirect to={pageRoutes.notFound.path} />
            </Switch>
        </HashRouter>
    );
};

export default Root;
