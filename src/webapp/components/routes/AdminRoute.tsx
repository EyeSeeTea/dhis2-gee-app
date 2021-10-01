import React from "react";
import { Route, Redirect, RouteComponentProps } from "react-router-dom";
import { useAppContext } from "../../contexts/app-context";
import { pageRoutes } from "../../pages/Router";

interface AdminRouteProps {
    path: string;
    exact?: boolean;
    render?: (props: RouteComponentProps<any>) => React.ReactNode;
    component?: React.ComponentType<RouteComponentProps<any>> | React.ComponentType<any>;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ path, component, exact, render }) => {
    const { isAdmin } = useAppContext();

    return isAdmin ? (
        <Route path={path} exact={exact} render={render} component={component} />
    ) : (
        <Redirect to={pageRoutes.notFound.path} />
    );
};

export default AdminRoute;
