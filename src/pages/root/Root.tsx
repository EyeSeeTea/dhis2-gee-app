import React from "react";
import { Route, Switch, HashRouter } from "react-router-dom";
import ImportDetail from "../import/ImportDetail";
import LandingPage from "../landing/LandingPage";
import MappingCreationPage from "../mappings/edit-mappings/MappingCreationPage";

const Root = () => {
    return (
        <HashRouter>
            <Switch>
                {/*
                <Route
                    path="/for/:name"
                    render={({ match }) => <Example name={match.params.name} />}
                />
                <Route path="/for" render={() => <Example name="Stranger" />} />
                */}
                {/*
                <Route
                    path="/mappings/:mapping_id"
                    render={({ match }) => <MappingsList mappingId={match.params.mapping_id} />}
                />
                */}
                <Route
                    path="/imports/:prefix"
                    render={({ match }) => <ImportDetail prefix={match.params.prefix} />}
                />
                <Route path="/imports" render={() => <ImportDetail prefix="default" />} />
                <Route path="/mappings/new" render={() => <MappingCreationPage action={"new"} />} />

                {/* Default route */}
                <Route render={() => <ImportDetail prefix={"default"} />} />
            </Switch>
        </HashRouter>
    );
};

export default Root;
