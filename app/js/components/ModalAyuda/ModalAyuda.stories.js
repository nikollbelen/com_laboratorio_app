import { ModalAyuda } from './ModalAyuda.js';
import '../../../css/components/Componentes.css';

export default { title: 'Modales/ModalAyuda' };

const Template = () => {
  const wrapper = document.createElement('div');
  wrapper.style.cssText = 'width:100vw; height:100vh; position:relative;';
  const mount = document.createElement('div');
  mount.id = 'sb-modalayuda-mount';
  wrapper.appendChild(mount);
  setTimeout(() => {
    new ModalAyuda('sb-modalayuda-mount');
    const overlay = wrapper.querySelector('.ModalOverlay');
    if (overlay) overlay.style.display = 'flex';
  }, 50);
  return wrapper;
};

export const PorDefecto = Template.bind({});
PorDefecto.storyName = 'Modal de Ayuda (Instrucciones)';
