import { ModalObjetivos } from './ModalObjetivos.js';
import '../../../css/components/Componentes.css';

export default { title: 'Modales/ModalObjetivos' };

const Template = (args) => {
  const wrapper = document.createElement('div');
  wrapper.style.cssText = 'width:100vw; height:100vh; position:relative;';
  const mount = document.createElement('div');
  mount.id = 'sb-modalobj-mount';
  wrapper.appendChild(mount);
  setTimeout(() => {
    new ModalObjetivos('sb-modalobj-mount', args.objetivos);
    const overlay = wrapper.querySelector('.ModalOverlay');
    if (overlay) overlay.style.display = 'flex';
  }, 50);
  return wrapper;
};

export const PorDefecto = Template.bind({});
PorDefecto.storyName = 'Modal de Objetivos';
PorDefecto.args = {
  objetivos: [
    { icon: '/images/lupa.png',        descripcion: 'Inspeccionar visualmente el equipo identificando su capacidad de diseño, dimensiones y función.' },
    { icon: '/images/componentes.png', descripcion: 'Analizar los componentes principales para comprender su estructura y funcionamiento.' },
    { icon: '/images/proceso.png',     descripcion: 'Evaluar el principio de operación observando el ciclo completo de operación.' },
  ]
};
