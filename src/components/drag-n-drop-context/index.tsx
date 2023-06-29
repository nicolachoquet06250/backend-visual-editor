import type {Signal} from "@builder.io/qwik";
import {
    component$,
    createContextId,
    Slot,
    useContextProvider,
    useSignal,
    useTask$
} from "@builder.io/qwik";
import type {Setter} from "~/hooks/setterFactory";
import {useStateFromContext} from "~/hooks/useState";

const DragNDropContext = createContextId<Signal<unknown>>('drag.and.drop.context');
const DragNDropContextDrag = createContextId<Signal<boolean>>('drag.and.drop.drag.context');
const DragNDropContextDropped = createContextId<Signal<boolean>>('drag.and.drop.dropped.context');

export function useDragNDrop<T>() {
    const [dragNDrop, setDragNDrop] = useStateFromContext(DragNDropContext)
    // const dragNDrop = useContext(DragNDropContext);

    return [dragNDrop, setDragNDrop] as [Signal<T>, Setter<T>];
}

// export function useDNDState() {
//     const [dragNDropDrag, setDragNDropDrag] = useStateFromContext(DragNDropContextDrag)
//     const [dragNDropDropped, setDragNDropDropped] = useStateFromContext(DragNDropContextDropped);
//
//     return [
//         [dragNDropDrag, dragNDropDropped],
//         [setDragNDropDrag, setDragNDropDropped]
//     ] as const;
// }

export const DragNDrop = component$(() => {
    const dragNDropDrag = useSignal<boolean>(false);
    const dragNDropDropped = useSignal<boolean>(false);

    useContextProvider(DragNDropContext, useSignal<unknown>());
    useContextProvider(DragNDropContextDrag, dragNDropDrag);
    useContextProvider(DragNDropContextDropped, dragNDropDropped);

    useTask$(({ track }) => {
        track(() => dragNDropDrag.value);
        track(() => dragNDropDropped.value);

        if (dragNDropDrag.value) {
            dragNDropDropped.value = false;
        }
        if (dragNDropDropped.value) {
            dragNDropDrag.value = false;
        }
    });

    return (<Slot />);
});