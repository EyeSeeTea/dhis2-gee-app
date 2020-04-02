import React from "react";
import { Route, Switch, HashRouter } from "react-router-dom";
import ImportDetail from "../import/ImportDetail";
import MappingCreationPage from "../mappings/edit-mappings/MappingCreationPage";

const Root = () => {
    return (
        <HashRouter>
            <Switch>
                <Route
                    path="/imports/:prefix"
                    render={({ match }) => <ImportDetail prefix={match.params.prefix} />}
                />
                <Route path="/imports" render={() => <ImportDetail prefix="default" />} />

                <Route path="/mappings/new" render={() => <MappingCreationPage action={"new"} />} />
                <Route
                    path="/mappings/:id"
                    render={({ match }) => (
                        <MappingCreationPage action={"edit"} id={match.params.id} />
                    )}
                />

                {/* Default route */}
                <Route render={() => <ImportDetail prefix={"default"} />} />
            </Switch>
        </HashRouter>
    );
};

export default Root;
