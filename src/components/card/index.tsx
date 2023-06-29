import type {QRL, QwikMouseEvent, Signal} from "@builder.io/qwik";
import {component$, Slot, useSignal, useStylesScoped$, useVisibleTask$} from "@builder.io/qwik";
import styles from './card.module.css?inline';

type MouseEvent = (ev: QwikMouseEvent, el: HTMLElement) => null|void;

export type CardProps = {
    onClick$?: MouseEvent|QRL<MouseEvent>,
    onMouseDown$?: MouseEvent|QRL<MouseEvent>,
    onMouseUp$?: MouseEvent|QRL<MouseEvent>,
    widthAuto?: boolean,
    width?: Signal<number>,
    height?: Signal<number>
};

export const Card = component$<CardProps>(({
   onClick$,
   onMouseDown$,
   onMouseUp$,
   widthAuto = false,
   width,
   height
}) => {
    useStylesScoped$(styles);

    const outputRef = useSignal<Element>();
    useVisibleTask$(() => {
        if (outputRef.value) {
            const rect = outputRef.value.getBoundingClientRect();
            if (width) {
                width.value = Math.round(rect.width);
            }
            if (height) {
                height.value = Math.round(rect.height);
            }
        }
    });

    return (<section
        ref={outputRef}
        data-max_content={widthAuto}
        onClick$={onClick$}
        onMouseDown$={onMouseDown$}
        onMouseUp$={onMouseUp$}
    >
        <div class='left'>
            <Slot name='left' />
        </div>
        <div class='bottom'>
            <Slot name='bottom' />
        </div>
        <div class='right'>
            <Slot name='right' />
        </div>
        <div class='top'>
            <Slot name='top' />
        </div>

        <h1>
            <Slot name='title' />
        </h1>

        <Slot />
    </section>);
})