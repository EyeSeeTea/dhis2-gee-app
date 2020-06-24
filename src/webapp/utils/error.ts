import { SnackbarState } from "d2-ui-components/snackbar/types";
import _ from "lodash";

interface Options {
    onFinally?(): void;
    onCatch?(): void;
}

export async function withSnackbarOnError(snackbar: SnackbarState, fn: Function, options: Options) {
    const { onCatch, onFinally } = options;
    try {
        await fn();
    } catch (err) {
        const bodyMessage = err.response?.data?.message;
        console.error(err);
        if (onCatch) onCatch();
        const message = _([err.message || err?.toString(), bodyMessage])
            .compact()
            .join(" - ");
        snackbar.error(message);
    } finally {
        if (onFinally) onFinally();
    }
}
