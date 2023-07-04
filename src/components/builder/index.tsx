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

type AdditionalJsonAlgo = {
    jsonAlgo: StateTuple<JsonAlgo, true>,
    dragNDropDataTransfer: StateTuple<DragNDropDataTransfer>
}

const RecursiveTree = component$<JsonAlgo & AdditionalJsonAlgo>(({
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

    type BgColors = {
        bottom: string,
        left: string,
        right: string
    };

    const bgColors = useStore<BgColors>({
        bottom: 'red',
        left: 'red',
        right: 'red'
    });

    const width = useSignal<number>(0);
    const height = useSignal<number>(0);

    type FindById<T extends JsonAlgo = JsonAlgo> = (
        node: T,
        cb: (node: T) => T
    ) => Promise<T>;
    type FindParentById<T extends JsonAlgo = JsonAlgo> = (
        node: T,
        cb: (parr: T[]) => T[]
    ) => Promise<T>;

    const findById = $<FindById>(async function findById(node, cb) {
        if ((node.id ?? '') === id) return cb(node);

        const tmp: JsonAlgo[] = [];
        for (const c of (node.scopes ?? [])) {
            tmp.push(await findById(c, cb));
        }

        return {...node, scopes: tmp};
    });
    const findParentById = $<FindParentById>(async function findParentById(node, cb): Promise<JsonAlgo> {
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
        };
    });

    type DataSetter = () => Promise<void>

    const setDataBottom = $<DataSetter>(async () => {
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
    const setDataLeft = $<DataSetter>(async () => {
        await setPersistentJson(await findParentById(json.value, (parentScopes) => ([
            {
                id: Date.now().toString(),
                scopes: [],
                ...dragNDropData.value
            },
            ...parentScopes
        ])));
    });
    const setDataRight = $<DataSetter>(async () => {
        await setPersistentJson(await findParentById(json.value, (parentScopes) => ([
            ...parentScopes,
            {
                id: Date.now().toString(),
                scopes: [],
                ...dragNDropData.value
            }
        ])));
    });

    function handleDropFactory<S extends keyof BgColors>(side: S, id?: string, cb?: QRL<(id: string) => void>) {
        return $(async () => {
            if (cb) await cb(id ?? '');

            bgColors[side] = 'red';
        });
    }
    function handleDragEnterFactory(side: keyof BgColors) {
        return $(() => (bgColors[side] = 'yellow'));
    }
    function handleDragLeaveFactory(side: keyof BgColors) {
        return $(() => (bgColors[side] = 'red'));
    }

    return (<section class={css.recursiveTree}>
        <div class={css.recursiveTreeCardContainer}>
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
                <div style={{position: 'absolute', left: '-20px'}}>
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

                <div style={{position: 'absolute', right: '-20px'}}>
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

        {scopes.length > 0 && (<div class={css.recursiveTreeScopeContainer}>
            {scopes.map(s => ((
                <DragNDrop key={JSON.stringify(s)} data={dragNDropData.value}>
                    <RecursiveTree
                        {...s}
                        jsonAlgo={jsonAlgo}
                        dragNDropDataTransfer={dragNDropDataTransfer}
                    />
                </DragNDrop>)))}
        </div>)}
    </section>);
})

export const Builder = component$(() => {
    const [json, setJson, setPersistentJson] = useJsonAlgo();
    const [dragNDropData, _] = useDragNDrop<DragNDropDataTransfer>();
    const DragNDrop = useDragNDropContext<DragNDropDataTransfer>();

    return (<div class={css.div}>
        <h1>{json.value.title}</h1>

        <DragNDrop data={dragNDropData.value}>
            <RecursiveTree
                {...json.value}
                jsonAlgo={[json, setJson, setPersistentJson as Setter<JsonAlgo>]}
                dragNDropDataTransfer={[dragNDropData, _]}
            />
        </DragNDrop>

        <pre>{JSON.stringify(json.value, null, 1)}</pre>
    </div>);
});
