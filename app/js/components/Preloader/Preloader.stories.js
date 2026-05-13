import { Preloader } from './Preloader.js';
import '../../../css/components/Componentes.css';

export default { title: 'Componentes/Preloader' };

const Template = (args) => {
  const wrapper = document.createElement('div');
  wrapper.style.cssText = 'width:100vw; height:100vh; position:relative; overflow:hidden;';
  const mount = document.createElement('div');
  mount.id = 'sb-preloader-mount';
  wrapper.appendChild(mount);
  setTimeout(() => {
    const p = new Preloader('sb-preloader-mount', { labName: args.labName, imageUrl: args.imageUrl, logoUrl: args.logoUrl });
    if (args.simularCarga) {
      let pct = 0;
      const iv = setInterval(() => { pct += 5; p.setProgress(pct); if (pct >= 100) clearInterval(iv); }, 200);
    }
  }, 50);
  return wrapper;
};

export const PorDefecto = Template.bind({});
PorDefecto.storyName = 'Pantalla de carga';
PorDefecto.args = { labName: 'Molino SAG', imageUrl: '/images/fondo.png', logoUrl: '/images/logo-tecsup.png', simularCarga: false };

export const ConCargaSimulada = Template.bind({});
ConCargaSimulada.storyName = 'Con carga simulada (0→100%)';
ConCargaSimulada.args = { labName: 'Molino SAG', imageUrl: '/images/fondo.png', logoUrl: '/images/logo-tecsup.png', simularCarga: true };
