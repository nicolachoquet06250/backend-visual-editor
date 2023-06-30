import {$, component$} from '@builder.io/qwik';
import type {DialogEvents, JsonAlgo} from "~/components/dialog-context";
import {useDialog, useJsonAlgo} from "~/components/dialog-context";
import {useNavigate} from "@builder.io/qwik-city";
import {useFileSystemDirectory} from "~/components/file-system-context";

export const OpenProjectButton = component$(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_, {setContent}] = useDialog<DialogEvents>();
    const [json, setJson] = useJsonAlgo();
    const [handler,,,getDirectoryContent] = useFileSystemDirectory();
    const go = useNavigate();

    /*const getDirectoryContent = $(async () => {
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
    });*/
    const writeFile = $<(h: FileSystemDirectoryHandle, dj: JsonAlgo) => Promise<File>>(
        async (handler, defaultJSON) => {
            const fileHandle = await handler.getFileHandle('.algo', {
                create: true
            });

            const file = await fileHandle.getFile();

            if (await file.text() === '') {
                const writable = await fileHandle.createWritable();

                await setJson(defaultJSON);

                await writable.write(JSON.stringify(json.value));

                await writable.close()
            }

            await setJson(JSON.parse(await (await fileHandle.getFile()).text()));

            return fileHandle.getFile()
        }
    );
    const handleCreatePathIfExists = $(async () => {
        try {
            await getDirectoryContent();
            // eslint-disable-next-line qwik/valid-lexical-scope
            console.log(handler.value)
            // eslint-disable-next-line qwik/valid-lexical-scope
            if (handler.value) {
                // eslint-disable-next-line qwik/valid-lexical-scope
                const file = await writeFile(handler.value, {
                    title: 'Backend php script',
                    scopes: []
                });

                const text = await file.text();

                await setContent(
                    component$(() => (<pre>{JSON.stringify(JSON.parse(text), null, 1)}</pre>))
                );

                await go('/project');
            }
        } catch (err) {
            console.error(err);
        }
    });

    return (<button
        preventdefault:click
        onClick$={handleCreatePathIfExists}
    > Ouvrir un projet </button>);
});