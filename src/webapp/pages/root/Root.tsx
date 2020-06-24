import React from "react";
import { Route, Switch, HashRouter, useHistory, Redirect } from "react-router-dom";
import MappingCreationPage from "../mappings/edit-mappings/MappingCreationPage";
import LandingPage from "../home/HomePage";
import ImportRuleListPage from "../import-rule-list/ImportRuleListPage";
import ImportRuleDetailPage from "../import-rule-detail/ImportRuleDetailPage";
import HistoryPage from "../import-rules-history/HistoryPage";
import ImportGlobalPage from "../import-global/ImportGlobalPage";
import { useAppContext } from "../../contexts/app-context";
import AdminRoute from "../../components/routes/AdminRoute";
import NotFoundPage from "../not-found/NotFoundPage";

export const pageRoutes = {
    home: { path: "/" },
    importRules: { path: "/import-rules" },
    importGlobal: { path: "/global-import" },
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
    importsHistory: { path: "/history" },
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
    const { isAdmin } = useAppContext();

    return (
        <HashRouter>
            <Switch>
                <Route
                    path={pageRoutes.home.path}
                    exact
                    render={() =>
                        isAdmin ? <LandingPage /> : <Redirect to={pageRoutes.importGlobal.path} />
                    }
                />

                <Route path={pageRoutes.importGlobal.path} render={() => <ImportGlobalPage />} />

                <Route path={pageRoutes.notFound.path} render={() => <NotFoundPage />} />

                <AdminRoute
                    path={pageRoutes.importRules.path}
                    exact
                    render={() => <ImportRuleListPage />}
                />
                <AdminRoute
                    path={pageRoutes.importRulesDetail.path}
                    exact
                    render={() => <ImportRuleDetailPage />}
                />

                <AdminRoute
                    path={pageRoutes.mappingsNew.path}
                    render={() => <MappingCreationPage action={"new"} />}
                />
                <AdminRoute
                    path={pageRoutes.mappingsEdit.path}
                    render={({ match }) => (
                        <MappingCreationPage action={"edit"} id={match.params.id} />
                    )}
                />

                <AdminRoute path={pageRoutes.importsHistory.path} render={() => <HistoryPage />} />

                <Redirect to={pageRoutes.notFound.path} />
            </Switch>
        </HashRouter>
    );
};

export default Root;
