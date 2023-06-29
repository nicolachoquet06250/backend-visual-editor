import {$, component$} from "@builder.io/qwik";
import {Card} from "~/components/card";
import type {DragNDropEvent} from "~/components/draggable";
import {Draggable} from "~/components/draggable";
import {useDragNDrop} from "~/components/drag-n-drop-context";
import type {DragNDropDataTransfer} from "~/components/blocs";

export const Var = component$(() => {
    const [, setDragNDropData] = useDragNDrop<DragNDropDataTransfer>();

    const handleDragStart = $<DragNDropEvent>(async () => {
        await setDragNDropData({
            title: 'VARIABLE',
            type: 'initVar',
            data: {
                name: 'x',
                type: 'int',
                value: 12
            }
        });
        console.log('start var');
    });

    return (<Draggable onDragStart$={handleDragStart}>
        <Card>
            <span q:slot='title'>
                VARIABLE
            </span>
        </Card>
    </Draggable>);
})