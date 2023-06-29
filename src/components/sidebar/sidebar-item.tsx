import {component$, Slot, useStylesScoped$} from "@builder.io/qwik";
import styles from './sidebar.module.css?inline';

export const SidebarItem = component$(() => {
    useStylesScoped$(styles);

    return (<li><Slot /></li>);
})