import {component$, useStylesScoped$} from '@builder.io/qwik';
import {type DocumentHead} from '@builder.io/qwik-city';
import {OpenProjectButton} from "~/components/open-project-button";
import styles from './index.module.css?inline';

export default component$(() => {
  useStylesScoped$(styles);

  return (<main>
      <OpenProjectButton/>
  </main>);
});

export const head: DocumentHead = {
  title: 'My projects',
  meta: [
    {
      name: 'description',
      content: 'Editeur visuel de backends',
    },
  ],
};
