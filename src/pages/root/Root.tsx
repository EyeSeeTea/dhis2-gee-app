import React from "react";
import { Route, Switch, HashRouter } from "react-router-dom";
import Example from "../example/Example";
import LandingPage from "../landing/LandingPage";

const Root = () => {
    return (
        <HashRouter>
            <Switch>
                <Route
                    path="/for/:name"
                    render={({ match }) => <Example name={match.params.name} />}
                />
                <Route path="/for" render={() => <Example name="Stranger" />} />

                {/* Default route */}
                <Route render={() => <LandingPage />} />
            </Switch>
        </HashRouter>
    );
};

export default Root;
