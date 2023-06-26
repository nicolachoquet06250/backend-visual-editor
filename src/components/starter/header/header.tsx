import { component$ } from '@builder.io/qwik';
import { QwikLogo } from '../icons/qwik';
import styles from './header.module.css';
import { Link } from '@builder.io/qwik-city';

export default component$(() => {
  const links = [
    {
      label: 'Mes projets',
      link: '/'
    },
    {
      label: 'Docs',
      link: 'https://qwik.builder.io/docs/components/overview/',
      blank: true
    },
    {
      label: 'Examples',
      link: 'https://qwik.builder.io/examples/introduction/hello-world/',
      blank: true
    },
    {
      label: 'Tutorials',
      link: 'https://qwik.builder.io/tutorial/welcome/overview/',
      blank: true
    },
  ];

  return (
    <header class={styles.header}>
      <div class={['container', styles.wrapper]}>
        <div class={styles.logo}>
          <a href="/" title="qwik">
            <QwikLogo height={50} width={143} />
          </a>
        </div>

        <ul>
          {links.map(({ link, label, blank = false }) => (
            <li>
              {!blank && 
                (<Link href={link}>{label}</Link>) || 
                (<a href={link} target="_blank">
                  {label}
                </a>)}
            </li>
          ))}
        </ul>
      </div>
    </header>
  );
});
