import React from "react";
import { Route, Switch, HashRouter } from "react-router-dom";
import Example from "../example/Example";
import ImportDetail from "../import/ImportDetail";
import LandingPage from "../landing/LandingPage";
import MappingsList from "../mappings/MappingsList";

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
                <Route
                    path="/mappings/:mapping_id"
                    render={({ match } ) => <MappingsList />}
                />
                <Route 
                    path="/mappings" 
                    render={() => <MappingsList />} 
                />
                <Route
                    path="/imports/:prefix"
                    render={({ match } ) => <ImportDetail prefix={match.params.prefix} />}
                />
                <Route 
                    path="/imports" 
                    render={() => <ImportDetail prefix="default" />} 
                />
                

                {/* Default route */}
                <Route render={() => <ImportDetail prefix={"default"} />} />
            </Switch>
        </HashRouter>
    );
};

export default Root;
