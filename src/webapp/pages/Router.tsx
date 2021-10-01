import { HashRouter, Redirect, Route, Switch, useHistory } from "react-router-dom";
import AdminRoute from "../components/routes/AdminRoute";
import { useAppContext } from "../contexts/app-context";
import LandingPage from "./home/HomePage";
import ImportGlobalPage from "./import-global/ImportGlobalPage";
import ImportRuleDetailPage from "./import-rule-detail/ImportRuleDetailPage";
import ImportRuleListPage from "./import-rule-list/ImportRuleListPage";
import HistoryPage from "./import-rules-history/HistoryPage";
import MappingCreationPage from "./mappings/edit-mappings/MappingCreationPage";
import NotFoundPage from "./not-found/NotFoundPage";

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

export const Router = () => {
    const { isAdmin } = useAppContext();

    return (
        <HashRouter>
            <Switch>
                <Route
                    path={pageRoutes.home.path}
                    exact
                    render={() => (isAdmin ? <LandingPage /> : <Redirect to={pageRoutes.importGlobal.path} />)}
                />

                <Route path={pageRoutes.importGlobal.path} render={() => <ImportGlobalPage />} />

                <Route path={pageRoutes.notFound.path} render={() => <NotFoundPage />} />

                <AdminRoute path={pageRoutes.importRules.path} exact render={() => <ImportRuleListPage />} />
                <AdminRoute path={pageRoutes.importRulesDetail.path} exact render={() => <ImportRuleDetailPage />} />

                <AdminRoute path={pageRoutes.mappingsNew.path} render={() => <MappingCreationPage action={"new"} />} />
                <AdminRoute
                    path={pageRoutes.mappingsEdit.path}
                    render={({ match }) => <MappingCreationPage action={"edit"} id={match.params.id} />}
                />

                <AdminRoute path={pageRoutes.importsHistory.path} render={() => <HistoryPage />} />

                <Redirect to={pageRoutes.notFound.path} />
            </Switch>
        </HashRouter>
    );
};
