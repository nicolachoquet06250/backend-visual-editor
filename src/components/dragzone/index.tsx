import type {QRL} from "@builder.io/qwik";
import {component$} from "@builder.io/qwik";
import type {DragNDropEvent} from "~/components/draggable";

export type DragZoneProps = {
    style?: {
        '--background-color'?: string
    },
    width?: number|`${string}px`|`${string}%`,
    height?: number|`${string}px`|`${string}%`,
    size?: number|`${string}px`|`${string}%`,
    onDragEnter$?: DragNDropEvent|QRL<DragNDropEvent>,
    onDragOver$?: DragNDropEvent|QRL<DragNDropEvent>,
    onDragLeave$?: DragNDropEvent|QRL<DragNDropEvent>,
    onDrop$?: DragNDropEvent|QRL<DragNDropEvent>,
    onDragEnd$?:DragNDropEvent|QRL<DragNDropEvent>,
    preventDefaultDragEnter?: boolean,
    preventDefaultDragOver?: boolean,
    preventDefaultDragLeave?: boolean,
    preventDefaultDrop?: boolean,
    preventDefaultDragEnd?: boolean,
};

export const DragZone = component$<DragZoneProps>(({
    style = {},
    size,
    width,
    height,
    onDragEnter$,
    onDragOver$,
    onDragLeave$,
    onDrop$,
    onDragEnd$,
    preventDefaultDragOver = false,
    preventDefaultDragLeave = false,
    preventDefaultDrop = false,
    preventDefaultDragEnter = false,
    preventDefaultDragEnd = false
}) => {
    return (<div style={{
        ...style,
        background: 'var(--background-color)',
        width: (() => (size && typeof size === 'number' ? `${size}px` : size)
                || typeof width === 'number' ? `${width}px` : width)(),
        height: (() => (size && typeof size === 'number' ? `${size}px` : size)
                || typeof height === 'number' ? `${height}px` : height)(),
    }}
     preventdefault:drop={preventDefaultDrop}
     preventdefault:dragover={preventDefaultDragOver}
     preventdefault:dragleave={preventDefaultDragLeave}
     preventdefault:dragenter={preventDefaultDragEnter}
     preventdefault:dragend={preventDefaultDragEnd}
     onDragOver$={onDragOver$}
     onDragEnter$={onDragEnter$}
     onDragLeave$={onDragLeave$}
     onDrop$={onDrop$}
     onDragEnd$={onDragEnd$}
    />);
});