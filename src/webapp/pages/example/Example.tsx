import React from "react";
import i18n from "../../locales";
import { useSnackbar, MultiSelector, OrgUnitsSelector } from "d2-ui-components";
import { Id } from "d2-api";
import { useAppContext } from "../../contexts/app-context";
import { makeStyles } from "@material-ui/styles";
import { ExampleModel } from "../../models/Example";

interface ExampleProps {
    name: string;
    showExtraComponents?: boolean;
}

// We need explicit casting until d2-api supports type inteference from the options argument
interface DataSet {
    id: Id;
}

const Example: React.FunctionComponent<ExampleProps> = props => {
    const { name, showExtraComponents = true } = props;
    const { d2, api, currentUser } = useAppContext();
    const [counter, setCounter] = React.useState(0);
    const [dataSets, setDataSets] = React.useState<DataSet[]>([]);
    const [orgUnitPaths, setOrgUnitPaths] = React.useState<DataSet[]>([]);
    const [selected, setSelected] = React.useState(["v1"]);
    const snackbar = useSnackbar();
    const classes = useStyles();
    const model = React.useMemo(() => new ExampleModel(api), [api]);

    React.useEffect(() => {
        model.getDataSets().then(setDataSets);
    }, [api, model]);

    return (
        <div>
            <h2 className={classes.title}>Hello {name}!</h2>

            <div>
                <p>
                    This is an example component written in Typescript, you can find it in{" "}
                    <b>src/pages/example/</b>, and its test in <b>src/pages/example/__tests__</b>
                </p>
                <p>Datasets loaded: {dataSets.map(ds => ds.id).join(", ")}</p>
                <p>Usage example of useState, a counter:</p>
                <p>Value={counter}</p>
                <button onClick={() => setCounter(counter - 1)}>-1</button>
                &nbsp;
                <button onClick={() => setCounter(counter + 1)}>+1</button>
            </div>

            <div>
                <p>Example of d2-ui-components snackbar usage:</p>

                <button onClick={() => snackbar.error("Some info")}>
                    {i18n.t("Click to show feedback")}
                </button>
            </div>

            {showExtraComponents && (
                <div>
                    <OrgUnitsSelector
                        api={api}
                        onChange={setOrgUnitPaths}
                        selected={orgUnitPaths}
                        rootIds={currentUser.getOrgUnits().map(ou => ou.id)}
                        fullWidth={false}
                    />

                    <MultiSelector
                        d2={d2}
                        searchFilterLabel={true}
                        ordered={false}
                        height={300}
                        onChange={setSelected}
                        options={[
                            { text: "Option1", value: "v1" },
                            { text: "Option2", value: "v2" },
                        ]}
                        selected={selected}
                    />
                </div>
            )}
        </div>
    );
};

const useStyles = makeStyles({
    title: {
        color: "blue",
    },
});

export default React.memo(Example);
