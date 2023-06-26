import {component$, useStylesScoped$, $, useSignal, QRL} from '@builder.io/qwik';
import type {ProjectForm} from '~/routes';
import styles from './project.module.css?inline';
import type {DialogEvents} from "~/components/dialog-context";
import {useCloseDialog, useOpenDialog, useSetDialogContent} from "~/components/dialog-context";

export const Project = component$<ProjectForm>(props => {
    useStylesScoped$(styles);

    const closeDialog = useCloseDialog();
    const openDialog = useOpenDialog();
    const setContent = useSetDialogContent<DialogEvents>();

    const fileJSON = useSignal({});

    const getDirectoryContent = $(async () => {
        const dirHandle = await window.showDirectoryPicker({
            startIn: props.baseDir
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

        return  await Promise.all(promises);
    });

    const handleCreatePathIfExists = $(async () => {
        await closeDialog();

        const files = await getDirectoryContent();
        const handler = await files.pop()?.handle;
        if (handler) {
            const fileHandle = await handler.getFileHandle('.algo', {
                create: true
            });

            let file = await fileHandle.getFile();

            if (await file.text() === '') {
                const writable = await fileHandle.createWritable();

                fileJSON.value = {
                    title: 'Backend php script',
                    scopes: [{
                        name: 'main',
                        type: 'root',
                        scopes: []
                    }]
                };

                await writable.write(JSON.stringify(fileJSON.value));

                await writable.close()
            }

            file = await fileHandle.getFile()

            const text = await file.text();

            await setContent(
                component$<{ onClose: QRL<() => void> }>(({ onClose }) => (<>
                    <pre>{JSON.stringify(JSON.parse(text), null, 1)}</pre>

                    <button onClick$={onClose}>X</button>
                </>))
            );

            await openDialog();
        }
    });
    
    return (<section
        preventdefault:click
        onClick$={handleCreatePathIfExists}
    >
        <h2>{props.title}</h2>
        <p>{props.description}</p>

        <div>
            <p>répertoire de base: {props.baseDir}</p>
            <p>Chemin: {props.path}</p>
        </div>
    </section>);
});