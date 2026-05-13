const link1 = document.createElement('link');
link1.rel = 'stylesheet';
link1.href = 'https://fonts.googleapis.com/css2?family=Rubik:wght@400;500;700&display=swap';
document.head.appendChild(link1);

const link2 = document.createElement('link');
link2.rel = 'stylesheet';
link2.href = 'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap';
document.head.appendChild(link2);

// CSS global de la app (sistema de idiomas, reset, layout)
import '../app/css/main.css';

export const parameters = {
  backgrounds: {
    default: 'claro',
    values: [
      { name: 'oscuro', value: '#0f172a' },
      { name: 'claro',  value: '#f8fafc' },
    ],
  },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
}