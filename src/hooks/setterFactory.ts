import type {QRL, Signal} from "@builder.io/qwik";
import {$} from "@builder.io/qwik";

export type Fn<T> = (p: T) => T;

export type Setter<T> = QRL<(param: (T | Fn<T>)) => void>;

export function setterFactory<T>(signal: Signal<T>, additionalAction?: QRL<(v: T) => void>): Setter<T> {
    return $<(param: Fn<T>|T) => void>(async param => {
        signal.value = typeof param === 'function'
            ? (param as Fn<T>)(JSON.parse(JSON.stringify(signal.value))) : param;

        if (additionalAction) {
            await additionalAction(signal.value);
        }
    });
}