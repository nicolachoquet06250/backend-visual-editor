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
                        <pre>{JSON.stringify(JSON.parse(text), null, 1)}</pre>

                        <button onClick$={onClose}>X</button>
                    </>))
                );

                await openDialog();
            }
        } catch (err) {
            console.error(err);
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