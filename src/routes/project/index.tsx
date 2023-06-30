import {$, component$, useStylesScoped$} from "@builder.io/qwik";
import type {DocumentHead} from "@builder.io/qwik-city";
import {useNavigate} from "@builder.io/qwik-city";
import {Builder} from "~/components/builder";
import {Sidebar} from "~/components/sidebar";
import {SidebarItem} from "~/components/sidebar/sidebar-item";
import styles from './project.module.css?inline';
import css from './project.module.css';

import * as blocs from '~/components/blocs';
import {useDragNDropContext} from "~/components/drag-n-drop-context";
import type {DragNDropDataTransfer} from "~/components/blocs";

export default component$(() => {
    useStylesScoped$(styles);
    const DragNDrop = useDragNDropContext<DragNDropDataTransfer>();

    const go = useNavigate();

    const handleGo = $(async () => await go('/'));

    return (<DragNDrop>
        <main>
            <Sidebar>
                <button
                    class={css.back}
                    q:slot='back'
                    preventdefault:click
                    onClick$={handleGo}
                > Ouvrir un autre project </button>

                {Object.entries(blocs).map(([k, Comp]) =>
                    (<SidebarItem key={k}>
                        <Comp />
                    </SidebarItem>))}
            </Sidebar>

            <div>
                <Builder />
            </div>
        </main>
    </DragNDrop>);
});

export const head: DocumentHead = {
    title: 'My project',
    meta: [
        {
            name: 'description',
            content: 'Editeur visuel de backends',
        },
    ],
};