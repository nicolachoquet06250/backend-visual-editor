import type {NoSerialize, QRL, Signal} from "@builder.io/qwik";
import {$, component$, createContextId, noSerialize, Slot, useContextProvider, useSignal} from "@builder.io/qwik";
import {useStateFromContext} from "~/hooks/useState";

const FileSystemDirectoryContext = createContextId<Signal<NoSerialize<FileSystemDirectoryHandle|null>>>('file.system.directory.context');

export function useFileSystemDirectory() {
    const [fileSystemDirectory, setFileSystemDirectory] = useStateFromContext(FileSystemDirectoryContext);
    const error = useSignal<Error>();
    const children = useSignal();

    const saveFileSystemDirectoryHandler = $(async () => {
        try {
            // eslint-disable-next-line qwik/valid-lexical-scope
            if (!fileSystemDirectory.value && window) {
                const promises: Promise<{ name: string, size: number, text: string }>[] = [];

                const handle = await window.showDirectoryPicker({startIn: 'desktop'});
                await setFileSystemDirectory(noSerialize(handle));

                for await (const entry of handle.values()) {
                    if (entry.kind !== 'file') break;

                    promises.push((async () => {
                        const file = await entry.getFile();
                        const text = await file.text();
                        const {name, size} = file

                        return {name, size, text};
                    })());
                }

                // eslint-disable-next-line qwik/valid-lexical-scope
                children.value = await Promise.all(promises);
            }
        } catch (err) {
            error.value = err as Error;
        }
    });
    const resetFileSystemDirectoryHandler = $(async () => await setFileSystemDirectory(noSerialize(undefined)));

    return [fileSystemDirectory, children, error, saveFileSystemDirectoryHandler, resetFileSystemDirectoryHandler] as [
        handler: Signal<NoSerialize<FileSystemDirectoryHandle|null>>,
        children: Signal<{name: string, size: number, text: string}[]>,
        error: Signal<Error>,
        save:  QRL<() => Promise<void>>,
        reset:  QRL<() => Promise<void>>
    ];
}

export const FileSystemContext = component$(() => {
    const fileSystemDirectory = useSignal<NoSerialize<FileSystemDirectoryHandle|null>>();

    useContextProvider(FileSystemDirectoryContext, fileSystemDirectory);

    return (<Slot />);
})