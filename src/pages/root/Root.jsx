import React from "react";
import { Route, Switch, HashRouter } from "react-router-dom";
import Example from "../example/Example";

const Root = () => {
    return (
        <HashRouter>
            <Switch>
                <Route render={() => <Example name="Stranger" />} />
            </Switch>
        </HashRouter>
    );
};

export default Root;
