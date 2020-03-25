import React from "react";
import { Route, Switch, HashRouter } from "react-router-dom";
import LandingPage from "../landing/LandingPage";
import MappingCreationPage from "../mappings/edit-mappings/MappingCreationPage";

const Root = () => {
    return (
        <HashRouter>
            <Switch>
                <Route path="/mappings/new" render={() => <MappingCreationPage action={"new"} />} />

                {/* Default route */}
                <Route render={() => <LandingPage />} />
            </Switch>
        </HashRouter>
    );
};

export default Root;
