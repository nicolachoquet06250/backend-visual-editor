import { component$, useStylesScoped$ } from '@builder.io/qwik';
import { routeLoader$, type DocumentHead, z } from '@builder.io/qwik-city';
import type { ZodType } from 'zod';
import { projects } from '~/data/projects';
import { Project } from '~/components/project';
import styles from './index.module.css?inline';

// eslint-disable-next-line qwik/loader-location
const useProjects = routeLoader$(() => projects);

export const projectSchema = z.object({
  title: z.string().trim()
    .min(1, 'The title must not be empty!'), 
  description: z.string().trim()
    .min(1, 'The description must not be empty!'),
  baseDir: z.string().trim().nonempty()
    .regex(
      new RegExp('^(desktop|documents|downloads|music|pictures|videos)$', 'g'), 
      'The baseDir must be "desktop" or "documents" or "downloads" or "music" or "pictures" or "videos".'
    ),
  path: z.string().trim()
    .min(1, 'The path must not be empty!')
});
export const projectPathSchema = z.object({
  baseDir: z.string().trim().nonempty()
    .regex(
      new RegExp('^(desktop|documents|downloads|music|pictures|videos)$', 'g'), 
      'The baseDir must be "desktop" or "documents" or "downloads" or "music" or "pictures" or "videos".'
    ),
  path: z.string().trim()
    .min(1, 'The path must not be empty!')
});

type ProjectType<
    T extends ZodType<any, any, any>,
    T2 extends z.infer<T> = z.infer<T>,
    T3 = {
      baseDir?: ShowDirectoryPickerOptions['startIn'] extends infer T | undefined ? T : ShowDirectoryPickerOptions['startIn']
    }
> = Pick<T2, Exclude<keyof T2, 'baseDir'>> & T3

export type ProjectForm = ProjectType<typeof projectSchema>;
export type ProjectPathForm = ProjectType<typeof projectPathSchema>;

export default component$(() => {
  useStylesScoped$(styles);

  const projects = useProjects();

  return (<main>
      {projects.value.map(p => (<Project key={p.baseDir + '/' + p.path} {...p} />))}
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
