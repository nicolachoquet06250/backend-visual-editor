import type {QRL} from '@builder.io/qwik';
import {$, component$, useSignal} from '@builder.io/qwik';
import type {DialogEvents} from "~/components/dialog-context";
import {useCloseDialog, useOpenDialog, useSetDialogContent} from "~/components/dialog-context";

export const OpenProjectButton = component$(() => {
    const closeDialog = useCloseDialog();
    const openDialog = useOpenDialog();
    const setContent = useSetDialogContent<DialogEvents>();

    const fileJSON = useSignal({});

    const getDirectoryContent = $(async () => {
        const dirHandle = await window.showDirectoryPicker({
            startIn: 'desktop'
        });

        const promises = [];
        for await (const entry of dirHandle.values()) {
            if (entry.kind !== 'file') break;

            promises.push((async () => {
                const file = await entry.getFile();
                const text = await file.text();
                const { name, size } = file

                return { name, size, text, handle: dirHandle };
            })());
        }

        return [dirHandle, await Promise.all(promises)] as const;
    });

    const writeFile = $(async (handler: FileSystemDirectoryHandle, defaultJSON: object) => {
        const fileHandle = await handler.getFileHandle('.algo', {
            create: true
        });

        const file = await fileHandle.getFile();

        if (await file.text() === '') {
            const writable = await fileHandle.createWritable();

            fileJSON.value = defaultJSON;

            await writable.write(JSON.stringify(fileJSON.value));

            await writable.close()
        }

        return fileHandle.getFile()
    });

    const handleCreatePathIfExists = $(async () => {
        try {
            await closeDialog();

            const [handler] = await getDirectoryContent();

            console.log(handler);

            if (handler) {
                const file = await writeFile(handler, {
                    title: 'Backend php script',
                    scopes: [{
                        name: 'main',
                        type: 'root',
                        scopes: []
                    }]
                });

                const text = await file.text();

                await setContent(
                    component$<{ onClose: QRL<() => void> }>(({onClose}) => (<>
                        <header style={{display: 'flex', justifyContent: 'flex-end', alignItems: 'center'}}>
                            <button class='danger' onClick$={onClose}>X</button>
                        </header>

                        <pre>{JSON.stringify(JSON.parse(text), null, 1)}</pre>
                    </>))
                );

                await openDialog();
            }
        } catch (err) {
            console.error(err);
        }
    });

    return (<button preventdefault:click onClick$={handleCreatePathIfExists}>
        Ouvrir un projet
    </button>);
});