import type {QRL, QwikDragEvent} from "@builder.io/qwik";
import {component$, Slot} from "@builder.io/qwik";

export type DragNDropEvent = (ev: QwikDragEvent, el: HTMLElement) => any|Promise<any>;

export type DraggableProps = {
    onDragStart$?: DragNDropEvent|QRL<DragNDropEvent>,
    onDrop$?: DragNDropEvent|QRL<DragNDropEvent>,
    onDragEnd$?: DragNDropEvent|QRL<DragNDropEvent>,
    onDrag$?: DragNDropEvent|QRL<DragNDropEvent>,
    onDragLeave$?: DragNDropEvent|QRL<DragNDropEvent>,
}

export const Draggable = component$<DraggableProps>(({
    onDragStart$,
    onDrop$,
    onDragEnd$,
    onDrag$,
    onDragLeave$,
}) => {
    return (<div
        style={{display: 'contains', cursor: 'pointer'}}
        draggable={true}
        onDragStart$={onDragStart$}
        onDragEnd$={onDragEnd$}
        onDrop$={onDrop$}
        onDrag$={onDrag$}
        onDragLeave$={onDragLeave$}
    >
        <Slot />
    </div>)
});