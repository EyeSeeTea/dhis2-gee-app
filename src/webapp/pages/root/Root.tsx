import React from "react";
import { Route, Switch, HashRouter } from "react-router-dom";
import ImportDetail from "../import/ImportDetail";
import MappingCreationPage from "../mappings/edit-mappings/MappingCreationPage";
import LandingPage from "../home/HomePage";

const Root = () => {
    return (
        <HashRouter>
            <Switch>
                <Route path="/" exact render={() => <LandingPage />} />

                <Route path="/import" render={() => <ImportDetail prefix="default" />} />

                <Route path="/mappings/new" render={() => <MappingCreationPage action={"new"} />} />
                <Route
                    path="/mappings/:id"
                    render={({ match }) => (
                        <MappingCreationPage action={"edit"} id={match.params.id} />
                    )}
                />
            </Switch>
        </HashRouter>
    );
};

export default Root;
