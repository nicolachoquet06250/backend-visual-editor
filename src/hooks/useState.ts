import type {ContextId, Signal} from "@builder.io/qwik";
import {useContext, useSignal} from "@builder.io/qwik";
import type {Setter} from "~/hooks/setterFactory";
import {setterFactory} from "~/hooks/setterFactory";

export function useState<T>(defaultValue?: T) {
    const s = useSignal<T>(defaultValue as T);

    return [s as Signal<T>, setterFactory(s) as Setter<T>] as const;
}

export function useStateFromContext<T = unknown>(context: ContextId<Signal<T>>) {
    const s = useContext(context);

    return [s, setterFactory(s)] as const;
}