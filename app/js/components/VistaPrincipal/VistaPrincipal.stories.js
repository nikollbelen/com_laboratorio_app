import { VistaPrincipal } from './VistaPrincipal.js';

export default {
  title: 'Vistas/VistaPrincipal',
  parameters: {
    layout: 'fullscreen',
    backgrounds: { default: 'oscuro' },
  },
};

const Template = () => {
  const container = document.createElement('div');
  container.id = 'vistaprincipal-mount';
  
  // Renderizado diferido para asegurar que el DOM esté listo
  setTimeout(() => {
    new VistaPrincipal('vistaprincipal-mount');
  }, 0);
  
  return container;
};

export const PorDefecto = Template.bind({});
PorDefecto.storyName = 'Diseño de Escritorio';

export const Movil = Template.bind({});
Movil.storyName = 'Diseño Móvil';
Movil.parameters = {
  viewport: {
    defaultViewport: 'mobile1',
  },
};
