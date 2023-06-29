import {component$, Slot, useStylesScoped$} from "@builder.io/qwik";
import styles from './sidebar.module.css?inline';

export const Sidebar = component$(() => {
    useStylesScoped$(styles);

    return (<aside>
        <nav>
            <Slot name='back'/>

            <ul>
                <Slot />
            </ul>
        </nav>
    </aside>);
})