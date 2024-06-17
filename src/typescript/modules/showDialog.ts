import * as tasker from "../dev/tasker";

export function showTextDialog(dialogPayload: {
    title?: string;
    text?: string;
    button1?: string;
    button2?: string;
    button3?: string;
    closeAfterSeconds?: number;
    useHtml?: boolean;
    continueAfterError?: boolean;
}): void {
    tasker.performTask("Show Dialog", 101, JSON.stringify({
        type: "text",
        title: dialogPayload.title ?? " ",
        text: dialogPayload.text ?? " ",
        button1: dialogPayload.button1 ?? " ",
        button2: dialogPayload.button2 ?? " ",
        button3: dialogPayload.button3 ?? " ",
        closeAfterSeconds: dialogPayload.closeAfterSeconds ?? 120,
        useHtml: dialogPayload.useHtml ?? false,
        continueAfterError: dialogPayload.continueAfterError ?? true,
    }));
}

export function showProgressDialog(dialogPayload: {
    title: string;
    text?: string;
    useHtml?: boolean;
    continueAfterError?: boolean;
}): void {
    tasker.performTask("Show Dialog", 101, JSON.stringify({
        type: "progress",
        title: dialogPayload.title,
        text: dialogPayload.text ?? " ",
        useHtml: dialogPayload.useHtml ?? false,
        continueAfterError: dialogPayload.continueAfterError ?? true,
    }));
}

export function dismissProgressDialog() {
    tasker.performTask("Show Dialog", 101, JSON.stringify({ type: "dismissProgress" }));
}
