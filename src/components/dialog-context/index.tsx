import type {Component, QRL, Signal} from "@builder.io/qwik";
import {
    $,
    component$,
    createContextId,
    Slot,
    useContext,
    useContextProvider,
    useSignal, useStylesScoped$
} from "@builder.io/qwik";
import styles from './dialog-context.module.css?inline'

export type DialogState = {
    opened: boolean,
    content: Component<any>
};

export type DialogEvents = {
    onClose: QRL<() => void>
    onnOpen: QRL<() => void>
    onSetContent: QRL<(content: Component<DialogEvents>) => void>
};

export const DialogContext = createContextId<Signal<DialogState['opened']>>('dialog.context.opened');
export const DialogContextContent = createContextId<Signal<DialogState['content']>>('dialog.context.content');

export function useOpenDialog() {
    const opened = useContext(DialogContext);

    return $(() => (opened.value = true));
}
export function useCloseDialog() {
    const opened = useContext(DialogContext);

    return $(() => (opened.value = false));
}
export function useSetDialogContent<T extends object>() {
    const content = useContext<Signal<Component<T>>>(DialogContextContent);

    // eslint-disable-next-line qwik/valid-lexical-scope
    return $((c: Component<T>) => (content.value = c));
}

export default component$(() => {
    useStylesScoped$(styles);

    const d = useSignal(false);
    const c = useSignal<Component<any>>();

    useContextProvider(DialogContext, d);
    useContextProvider(DialogContextContent, c);

    return (<>
        <Slot/>

        <dialog open={d.value}>
            {c.value && <c.value
                onClose={$(() => (d.value = false))}
                onnOpen={$(() => (d.value = true))}
                onSetContent={$((content: Component<any>) => {
                    // eslint-disable-next-line qwik/valid-lexical-scope
                    c.value = content
                })}
            />}
        </dialog>
    </>);
});