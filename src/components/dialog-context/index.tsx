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
import {useFileSystemDirectory} from "~/components/file-system-context";

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
    id?: string,
    title: string,
    type?: string,
    data?: Record<string, any>,
    scopes?: JsonAlgo[]
}

export function useJsonAlgo() {
    const [json, _setJson] = useStateFromContext(JsonAlgoContext);
    const [handler] = useFileSystemDirectory();

    const writeFile = $<(content: JsonAlgo) => void>(async (content) => {
        if (handler.value) {
            const fileHandle = await handler.value.getFileHandle('.algo', {
                create: true
            });

            const writable = await fileHandle.createWritable();
            await writable.write(JSON.stringify(content));
            await writable.close();

            await _setJson(content);
        }
    });

    return [json, _setJson, $<(c: JsonAlgo) => void>(async (json) => await writeFile(json))] as [
        json: typeof json,
        setJson: typeof _setJson,
        setPersistantJson: QRL<(json: JsonAlgo) => void>
    ];
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