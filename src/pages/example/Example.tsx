import React, { useState, useContext, useEffect } from "react";
import i18n from "../../locales";
import { useSnackbar } from "d2-ui-components";
import { Id } from "d2-api";
import { ApiContext } from "../../contexts/api-context";
import { makeStyles } from "@material-ui/styles";

interface ExampleProps {
    name: string;
}

// We need explicit casting until d2-api supports type inteference from the options argument
interface DataSet {
    id: Id;
}

export default function Example(props: ExampleProps) {
    const [counter, setCounter] = useState(0);
    const [dataSets, setDataSets] = useState<DataSet[]>([]);
    const snackbar = useSnackbar();
    const classes = useStyles();
    const api = useContext(ApiContext);

    useEffect(() => {
        function set() {
            const { cancel, response } = api.models.dataSets.get({ pageSize: 5 });
            response.then(response_ => setDataSets(response_.data.objects));
            return cancel;
        }
        return set();
    }, []);

    return (
        <div>
            <h2 className={classes.title}>Hello {props.name}!</h2>

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

                <button onClick={() => snackbar.info("Some info")}>
                    {i18n.t("Click to show feedback")}
                </button>
            </div>
        </div>
    );
}

const useStyles = makeStyles({
    title: {
        color: "blue",
    },
});
