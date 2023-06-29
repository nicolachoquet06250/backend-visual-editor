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
import styles from './dialog-context.module.css?inline';
import {useStateFromContext} from "~/hooks/useState";

export type DialogState = {
    opened: boolean,
    content: Component<any>
};

export type DialogEvents = {
    onClose: QRL<() => void>
    onnOpen: QRL<() => void>
    onSetContent: QRL<(content: Component<DialogEvents>) => void>
};

export const DialogContextOpened = createContextId<Signal<DialogState['opened']>>('dialog.context.opened');
export const DialogContextContent = createContextId<Signal<DialogState['content']>>('dialog.context.content');
export const JsonAlgoContext = createContextId<Signal<JsonAlgo>>('json.algo.context');

export function useDialog<T extends object>() {
    const opened = useContext<Signal<boolean>>(DialogContextOpened);
    const content = useContext<Signal<Component<T>>>(DialogContextContent);

    return [{opened, content}, {
        open: $<() => void>(() => (opened.value = true)),
        close: $<() => void>(() => (opened.value = false)),
        // eslint-disable-next-line qwik/valid-lexical-scope
        setContent: $<(c: Component<T>) => void>(c => (content.value = c))
    }] as const
}

export type JsonAlgo = {
    title: string,
    type?: string,
    data?: Record<string, any>,
    scopes?: JsonAlgo[]
}

export function useJsonAlgo() {
    return useStateFromContext(JsonAlgoContext);
}

export default component$(() => {
    useStylesScoped$(styles);

    const opened = useSignal(false);
    const content = useSignal<Component<any>>();
    const jsonAlgo = useSignal<JsonAlgo>({
        title: 'Backend php script',
        scopes: []
    });

    useContextProvider(DialogContextOpened, opened);
    useContextProvider(DialogContextContent, content);
    useContextProvider(JsonAlgoContext, jsonAlgo);

    const handleClose = $(() =>
        (opened.value = false));

    return (<>
        <Slot/>

        <dialog open={opened.value}>
            <header>
                <button class='danger' onClick$={handleClose}>X</button>
            </header>

            {content.value && <content.value
                onClose={handleClose}
                onnOpen={$(() => (opened.value = true))}
                onSetContent={$<(c: Component<any>) => void>(c => {
                    // eslint-disable-next-line qwik/valid-lexical-scope
                    content.value = c
                })}
            />}
        </dialog>
    </>);
});