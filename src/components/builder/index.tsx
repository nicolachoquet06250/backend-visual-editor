import {$, component$, useSignal, useStore} from "@builder.io/qwik";
import type {JsonAlgo} from "~/components/dialog-context";
import {useJsonAlgo} from "~/components/dialog-context";
import {Card} from "~/components/card";
import {DragZone} from "~/components/dragzone";
import {useDragNDrop} from "~/components/drag-n-drop-context";
import type {DragNDropDataTransfer} from "~/components/blocs";
import css from './builder.module.css';

const RecursiveTree = component$<JsonAlgo>(({
    title,
    type = 'main',
    data = {},
    scopes = []
}) => {
    const [json, setJson] = useJsonAlgo();
    const [dragNDropData] = useDragNDrop<DragNDropDataTransfer>();

    const bgColors = useStore({
        bottom: 'red',
        left: 'red',
        right: 'red'
    });

    function handleDropFactory(side: keyof typeof bgColors) {
        return $(async () => {
            await setJson({
                ...json.value,
                scopes: [
                    ...(json.value.scopes ?? []),
                    {
                        ...dragNDropData.value,
                        scopes: []
                    }
                ]
            });

            bgColors[side] = 'red';
        });
    }
    function handleDragEnterFactory(side: keyof typeof bgColors) {
        return $(() => {
            bgColors[side] = 'yellow';
        });
    }
    function handleDragLeaveFactory(side: keyof typeof bgColors) {
        return $(() => {
            bgColors[side] = 'red';
        });
    }

    const width = useSignal<number>(0);
    const height = useSignal<number>(0);

    return (<section style={{
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
                onDrop$={handleDropFactory('bottom')}
                onDragEnter$={handleDragEnterFactory('bottom')}
                onDragLeave$={handleDragLeaveFactory('bottom')}
            />

            <div style={{
                position: 'absolute',
                left: '-20px'
            }}>
                <DragZone
                    style={{'--background-color': bgColors.left}}
                    width={20} height={height.value}
                    preventDefaultDrop
                    preventDefaultDragOver
                    onDrop$={handleDropFactory('left')}
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
                    onDrop$={handleDropFactory('right')}
                    onDragEnter$={handleDragEnterFactory('right')}
                    onDragLeave$={handleDragLeaveFactory('right')}
                />
            </div>
        </div>

        {scopes.length > 0 && (<div style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center'
        }}>
            {scopes.map(s => ((<RecursiveTree {...s} key={JSON.stringify(s)} />)))}
        </div>)}
    </section>)
})

export const Builder = component$(() => {
    const [json] = useJsonAlgo();

    return (<div class={css.div}>
        <h1>{json.value.title}</h1>

        <RecursiveTree {...json.value} />

        <pre>{JSON.stringify(json.value, null, 1)}</pre>
    </div>);
});