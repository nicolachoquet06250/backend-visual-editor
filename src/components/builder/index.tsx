import type {QRL, Signal} from "@builder.io/qwik";
import {$, component$, useSignal, useStore} from "@builder.io/qwik";
import type {JsonAlgo} from "~/components/dialog-context";
import {useJsonAlgo} from "~/components/dialog-context";
import {Card} from "~/components/card";
import {DragZone} from "~/components/dragzone";
import {useDragNDrop, useDragNDropContext} from "~/components/drag-n-drop-context";
import type {DragNDropDataTransfer} from "~/components/blocs";
import css from './builder.module.css';
import type {Setter} from "~/hooks/setterFactory";

/*
TODO: Glisser / déposer fonctionne uniquement avec un bloque par ligne.
 si une ligne dépasse 1 bloque, impossible de rajouter un bloque sur la ligne du dessous.
*/
export type FirstLetter<T extends string> = T extends `${infer FL}${string}` ? FL : T;
export type ExtractFirstLetter<T extends string> = T extends `${FirstLetter<T>}${infer S}` ? S : T;
export type UcFirst<T extends string> = `${Uppercase<FirstLetter<T>>}${ExtractFirstLetter<T>}`;
export type AllUcFirst<T> = { [K in keyof T]: K extends string ? UcFirst<K> : K }[keyof T];

type StateTuple<T, Persist extends boolean = false> = Persist extends false ? [
    signal: Signal<T>,
    setter: Setter<T>
] : [
    signal: Signal<T>,
    setter: Setter<T>,
    persistantSetter: Setter<T>
];

const RecursiveTree = component$<JsonAlgo & {
    jsonAlgo: StateTuple<JsonAlgo, true>,
    dragNDropDataTransfer: StateTuple<DragNDropDataTransfer>
}>(({
    id= '',
    title,
    type = 'main',
    data = {},
    scopes = [],
    jsonAlgo,
    dragNDropDataTransfer
}) => {
    const DragNDrop = useDragNDropContext<DragNDropDataTransfer>();

    const [json,, setPersistentJson] = jsonAlgo;
    const [dragNDropData] = dragNDropDataTransfer;

    const bgColors = useStore({
        bottom: 'red',
        left: 'red',
        right: 'red'
    });

    const width = useSignal<number>(0);
    const height = useSignal<number>(0);

    const findById = $(async function findById(node: JsonAlgo, cb: (node: JsonAlgo) => JsonAlgo) {
        if ((node.id ?? '') === id) return cb(node);

        const tmp: JsonAlgo[] = [];
        for (const c of (node.scopes ?? [])) {
            tmp.push(await findById(c, cb))
        }

        return {
            ...node,
            scopes: tmp
        };
    });
    const findParentById = $<(node: JsonAlgo, cb: (parr: JsonAlgo[]) => JsonAlgo[]) => Promise<JsonAlgo>>(async function findParentById(node, cb): Promise<JsonAlgo> {
        return {
            ...node,
            scopes: await (async () => {
                let exited = false;
                const tmp = [];
                for (const n of (node.scopes ?? [])) {
                    if (n?.id === id) {
                        exited = true;
                        break;
                    } else {
                        tmp.push(await findParentById(n, cb));
                    }
                }

                return exited ? cb(node.scopes ?? []) : tmp;
            })()
        }
    });

    const setDataBottom = $(async () => {
        await setPersistentJson(await findById(json.value, (node) => ({
            ...node,
            scopes: [
                ...node.scopes ?? [],
                {
                    id: Date.now().toString(),
                    scopes: [],
                    ...dragNDropData.value
                }
            ]
        })));
    });
    const setDataLeft = $(async () => {
        await setPersistentJson(await findParentById(json.value, (parentScopes) => ([
            {
                id: Date.now().toString(),
                scopes: [],
                ...dragNDropData.value
            },
            ...parentScopes
        ])));
    });
    const setDataRight = $(async () => {
        await setPersistentJson(await findParentById(json.value, (parentScopes) => ([
            ...parentScopes,
            {
                id: Date.now().toString(),
                scopes: [],
                ...dragNDropData.value
            }
        ])));
    });

    function handleDropFactory<S extends keyof typeof bgColors>(side: S, id?: string, cb?: QRL<(id: string) => void>) {
        return $(async () => {
            if (cb) await cb(id ?? '');

            bgColors[side] = 'red';
        });
    }
    function handleDragEnterFactory(side: keyof typeof bgColors) {
        return $(() => (bgColors[side] = 'yellow'));
    }
    function handleDragLeaveFactory(side: keyof typeof bgColors) {
        return $(() => (bgColors[side] = 'red'));
    }

    return (<DragNDrop data={dragNDropData.value}>
        <section style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center'
        }}>
            <div style={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
            }}>
                <Card widthAuto={true} width={width} height={height}>
                    <span q:slot='title'>{type === 'main' ? 'Start' : title}</span>

                    <ul>
                        {id && (<li>Id: {id}</li>)}
                        {type !== 'main' && (<li>Type : {type}</li>)}
                        {Object.keys(data).length > 0 && (<li>
                            <u>Données</u> <br />
                            <ul>
                                {Object.entries(data).map(([k, v]) =>
                                    (<li key={k}>
                                        {k}: {v}
                                    </li>)
                                )}
                            </ul>
                        </li>)}
                    </ul>
                </Card>

                <DragZone
                    style={{'--background-color': bgColors.bottom}}
                    width={width.value} height={20}
                    preventDefaultDrop
                    preventDefaultDragOver
                    onDrop$={handleDropFactory('bottom', id, setDataBottom)}
                    onDragEnter$={handleDragEnterFactory('bottom')}
                    onDragLeave$={handleDragLeaveFactory('bottom')}
                />

                {type !== 'main' && (<>
                    <div style={{
                        position: 'absolute',
                        left: '-20px'
                    }}>
                        <DragZone
                            style={{'--background-color': bgColors.left}}
                            width={20} height={height.value}
                            preventDefaultDrop
                            preventDefaultDragOver
                            onDrop$={handleDropFactory('left', id, setDataLeft)}
                            onDragEnter$={handleDragEnterFactory('left')}
                            onDragLeave$={handleDragLeaveFactory('left')}
                        />
                    </div>

                    <div style={{
                        position: 'absolute',
                        right: '-20px'
                    }}>
                        <DragZone
                            style={{'--background-color': bgColors.right}}
                            width={20} height={height.value}
                            preventDefaultDrop
                            preventDefaultDragOver
                            onDrop$={handleDropFactory('right', id, setDataRight)}
                            onDragEnter$={handleDragEnterFactory('right')}
                            onDragLeave$={handleDragLeaveFactory('right')}
                        />
                    </div>
                </>)}
            </div>

            {scopes.length > 0 && (<div style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center'
            }}>
                {scopes.map(s => ((<RecursiveTree
                    {...s}
                    jsonAlgo={jsonAlgo}
                    dragNDropDataTransfer={dragNDropDataTransfer}
                    key={JSON.stringify(s)}
                />)))}
            </div>)}
        </section>
    </DragNDrop>);
})

export const Builder = component$(() => {
    const [json, setJson, setPersistentJson] = useJsonAlgo();
    const [dragNDropData, _] = useDragNDrop<DragNDropDataTransfer>();

    return (<div class={css.div}>
        <h1>{json.value.title}</h1>

        <RecursiveTree
            {...json.value}
            jsonAlgo={[json, setJson, setPersistentJson as Setter<JsonAlgo>]}
            dragNDropDataTransfer={[dragNDropData, _]}
        />

        <pre>{JSON.stringify(json.value, null, 1)}</pre>
    </div>);
});
