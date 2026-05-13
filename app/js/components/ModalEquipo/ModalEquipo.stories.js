import { ModalEquipo } from './ModalEquipo.js';
import '../../../css/components/Componentes.css';

export default { title: 'Modales/ModalEquipo' };

const Template = (args) => {
  const wrapper = document.createElement('div');
  wrapper.style.cssText = 'width:100vw; height:100vh; position:relative;';
  const mount = document.createElement('div');
  mount.id = 'sb-modalequipo-mount';
  wrapper.appendChild(mount);
  setTimeout(() => {
    new ModalEquipo('sb-modalequipo-mount', args.epps);
    const overlay = wrapper.querySelector('.ModalOverlay');
    if (overlay) overlay.style.display = 'flex';
  }, 50);
  return wrapper;
};

export const PorDefecto = Template.bind({});
PorDefecto.storyName = 'Modal de Equipo (EPP)';
PorDefecto.args = {
  epps: [
    { icon: '/images/Barbiquejo.png', nombre: 'Barbiquejo' },
    { icon: '/images/epp2.png', nombre: 'Casco de protección' },
    { icon: '/images/epp3.png', nombre: 'Lentes de seguridad' },
    { icon: '/images/epp4.png', nombre: 'Zapatos de seguridad' },
    { icon: '/images/epp5.png', nombre: 'Guantes de cuero' },
    { icon: '/images/epp6.png', nombre: 'Ropa de trabajo' },
    { icon: '/images/epp7.png', nombre: 'Chaleco Reflectante' },
    { icon: '/images/epp8.png', nombre: 'Protección auditiva' },
  ]
};
