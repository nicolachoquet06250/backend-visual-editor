import {$, component$} from "@builder.io/qwik";
import {Card} from "~/components/card";
import type {DragNDropEvent} from "~/components/draggable";
import {Draggable} from "~/components/draggable";
import {useDragNDrop} from "~/components/drag-n-drop-context";
import type {DragNDropDataTransfer} from "~/components/blocs";

export const Const = component$(() => {
    const [, setDragNDropData] = useDragNDrop<DragNDropDataTransfer>();

    const handleDragStart = $<DragNDropEvent>(async () => {
        await setDragNDropData({
            title: 'CONSTANTE',
            type: 'createConst',
            data: {
                name: 'test',
                type: 'int',
                value: 10
            }
        });
        console.log('start const');
    });

    return (<Draggable onDragStart$={handleDragStart}>
        <Card>
            <span q:slot='title'>
                CONSTANTE
            </span>
        </Card>
    </Draggable>);
})