// Cargar datos desde archivo JSON externo
async function cargarDatos() {
  try {
    const respuesta = await fetch("datos.json");
    if (!respuesta.ok) {
      throw new Error("Error al cargar datos.json");
    }
    const datos = await respuesta.json();
    return datos;
  } catch (error) {
    console.error("Error cargando datos:", error);
    return null;
  }
}

// Crear estilos CSS compartidos una sola vez
let estilosCreados = false;
function crearEstilosCompartidos() {
  if (estilosCreados) return; // Evitar duplicar estilos

  const estilo = document.createElement("style");
  estilo.id = "widget-compacto-estilos";
  estilo.innerHTML = `
  @keyframes slideInRight { from { transform: translate(120%, -50%); opacity: 0; } to { transform: translate(0, -50%); opacity: 1; } }
  @keyframes gentleFadeUp { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }

   /* CONTENEDOR PRINCIPAL */
  .widget-compacto {
    position: fixed;
    right: 20px;
    width: 320px;
    max-height: 80%; /* Límite total */
    background: #ffffff;
    box-shadow: 0 8px 30px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05);
    border-radius: 10px;
    font-family: 'Segoe UI', Roboto, sans-serif;
    overflow: hidden;
    display: none;
    flex-direction: column;
    transform: translate(0, -50%);
    transition: width 0.4s cubic-bezier(0.25, 0.8, 0.25, 1), 
                height 0.4s cubic-bezier(0.25, 0.8, 0.25, 1), 
                right 0.4s ease, 
                border-radius 0.4s ease;
  }

  /* ESTADO COMPRIMIDO */
  .widget-compacto.widget-collapsed {
    width: 40px !important;
    height: 40px !important;
    right: 0px;
    border-radius: 8px 0 0 8px;
    box-shadow: -2px 2px 10px rgba(0,0,0,0.2);
    background: #ffffff;
  }

  /* CABECERA */
  .widget-header {
    background: linear-gradient(135deg, #2b32b2 0%, #1488cc 100%);
    color: #fff;
    padding: 12px 15px 12px 45px; 
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    position: relative;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    min-height: 44px;
    height: auto; 
    box-sizing: border-box;
    transition: background 0.3s ease;
  }

  .widget-compacto.widget-collapsed .widget-header {
    background: #ffffff; 
    padding: 0;
    justify-content: center;
    height: 44px; 
  }

  .widget-header-title {
    white-space: normal; 
    overflow: visible;
    line-height: 1.25;
    opacity: 1;
    transition: opacity 0.2s ease;
  }
  
  .widget-compacto.widget-collapsed .widget-header-title {
    opacity: 0;
    pointer-events: none;
  }

  /* BOTÓN TOGGLE */
  .widget-toggle-btn {
    position: absolute;
    top: 50%;
    left: 10px; 
    transform: translateY(-50%);
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 14px; 
    border-radius: 50%;
    color: #ff6600;
    transition: all 0.3s ease;
    padding-left: 2px;
    z-index: 10;
  }

  .widget-compacto.widget-collapsed .widget-toggle-btn {
    left: 50%;
    transform: translate(-50%, -50%);
    padding-left: 0;
  }
  
  .widget-compacto.widget-collapsed .widget-toggle-btn:hover { background-color: #f0f0f0; }
  .widget-compacto:not(.widget-collapsed) .widget-toggle-btn:hover { background-color: rgba(255,255,255,0.2); color: #fff; }

  /* CUERPO DEL WIDGET */
  .widget-body {
    overflow-y: auto;
    scrollbar-width: thin;
    opacity: 1;
    transition: opacity 0.2s ease;
    flex: 1; 
    min-height: 0;
    display: flex; /* Para asegurar distribución vertical */
    flex-direction: column;
  }
  
  .widget-compacto.widget-collapsed .widget-body {
    opacity: 0;
    pointer-events: none;
    display: none;
  }

  .widget-body::-webkit-scrollbar { width: 5px; }
  .widget-body::-webkit-scrollbar-thumb { background-color: #ccc; border-radius: 3px; }

  /* CARRUSEL Y SLIDES */
  .widget-carousel-section { 
    padding: 12px; 
    border-bottom: 1px solid #f0f0f0; 
    display: flex;
    flex-direction: column;
  }
  
  .widget-section-title { font-size: 10px; color: #999; text-transform: uppercase; margin-bottom: 8px; font-weight: 700; text-align: center; }
  .widget-slide.widget-active { display: block; animation: gentleFadeUp 0.4s ease-out; }
  
  /* --- LÓGICA DE ALTURAS Y PROTECCIÓN DE CONTROLES --- */
  
  .widget-slide { 
    display: none;
    /* Caso estándar (con 2 carruseles): dejamos espacio para el de abajo */
    max-height: calc(90vh - 430px); 
    overflow-y: auto;  
    padding-right: 5px; 
    scrollbar-width: thin;
  }

  /* EXCEPCIÓN: Si NO hay segundo carrusel, ocupa más espacio */
  /* AJUSTE: Bajamos de 580px a 550px para asegurar que los controles (que miden ~35px) nunca se corten dentro de los 675px totales */
  .widget-compacto.sin-segundo-carrusel .widget-slide,
  .widget-compacto.sin-imagen .widget-slide {
    max-height: 60vh; 
  }

  .widget-slide::-webkit-scrollbar { width: 4px; }
  .widget-slide::-webkit-scrollbar-thumb { background-color: #ddd; border-radius: 4px; }
  
  .widget-slide img { width: 100%; height: auto; max-height: 160px; object-fit: contain; background-color: #f8f9fa; border-radius: 6px; margin-bottom: 8px; display: block; margin: 0 auto 8px auto; }
  .widget-slide h4 { text-transform: uppercase; margin: 0 0 4px 0; font-size: 15px; color: #222; font-weight: 600; }
  .widget-slide p { 
    font-size: 13px; 
    color: #555; 
    line-height: 1.4; 
    margin: 0 0 8px 0; 
    text-align: justify; 
  }
  .widget-slide ul { 
    padding-left: 18px; 
    margin: 0 0 8px 0; 
    font-size: 13px; 
    color: #555; 
    line-height: 1.4; 
    text-align: justify; 
  }
  
  /* CONTROLES DE NAVEGACIÓN */
  .widget-nav-controls { 
    display: flex; 
    justify-content: space-between; 
    align-items: center; 
    margin-top: 8px; 
    background: #f8f9fa; 
    padding: 4px 8px; 
    border-radius: 4px;
    /* AJUSTE: Evitar que se aplasten o se corten */
    flex-shrink: 0; 
    position: relative; 
    z-index: 5;
  }

  .widget-btn-nav { background: #fff; color: #444; border: 1px solid #ddd; width: 24px; height: 24px; border-radius: 50%; cursor: pointer; font-size: 10px; display: flex; align-items: center; justify-content: center; }
  .widget-btn-nav:hover { background: #007bff; color: white; border-color: #007bff; }
  .widget-counter { font-size: 10px; font-weight: 600; color: #888; }

  /* Título para imágenes generales */
  .widget-imagen-titulo { 
    color: #999 !important; 
    text-align: center; 
    font-weight: 400 !important; 
    font-style: italic !important; 
    font-size: 12px !important; 
    margin: 4px 0 8px 0 !important; 
  }

`;
  document.head.appendChild(estilo);
  estilosCreados = true;
}

function crearWidgetCompacto(data, index = 0) {
  const visorId = data.id;

  // Crear estilos compartidos solo una vez
  crearEstilosCompartidos();

  const panel = document.createElement("div");
  panel.id = visorId;
  panel.className = "widget-compacto";

  // Posicionamiento individual usando el ID  // --- 1. Detectar si hay imágenes generales (Segundo Carrusel) ---
  const tieneSegundoCarrusel = data.imagenesGenerales && Array.isArray(data.imagenesGenerales) && data.imagenesGenerales.length > 0;

  // Si NO hay segundo carrusel, añadimos una clase específica para expandir el primero
  if (!tieneSegundoCarrusel) {
    panel.classList.add("sin-segundo-carrusel");
  }

  // --- 2. Detección general de imágenes (Lógica existente 'sin-imagen') ---
  let tieneAlgunaImagen = false;
  if (data.contenido && Array.isArray(data.contenido)) {
    for (let item of data.contenido) {
      if (item.tipo === "imagen" || item.imagen) {
        tieneAlgunaImagen = true;
        break;
      }
    }
  }
  if (tieneSegundoCarrusel) tieneAlgunaImagen = true;

  if (!tieneAlgunaImagen) {
    panel.classList.add("sin-imagen");
  }

  panel.style.top = `47%`;
  panel.style.zIndex = 1000 - index;
  panel.style.animation = "slideInRight 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards";

  const header = document.createElement("div");
  header.className = "widget-header";

  const titleText = document.createElement("span");
  titleText.className = "widget-header-title";
  titleText.innerText = data.titulo;

  const toggleBtn = document.createElement("span");
  toggleBtn.id = data.id_boton_cerrar;
  toggleBtn.className = "widget-toggle-btn";
  // Iniciamos con flecha a la derecha (▶) indicando que al hacer clic se "guarda" hacia la derecha.
  toggleBtn.innerHTML = "&#9654;";

  // --- LÓGICA DE COLAPSAR / EXPANDIR ---
  toggleBtn.onclick = () => {
    // Alternar clase 'widget-collapsed'
    panel.classList.toggle("widget-collapsed");

    // Verificar estado para cambiar la flecha
    if (panel.classList.contains("widget-collapsed")) {
      // Si está colapsado, mostramos flecha Izquierda (◀) como en tu imagen
      // para indicar que al hacer clic "sale" hacia la izquierda.
      toggleBtn.innerHTML = "&#9664;";
    } else {
      // Si está abierto, flecha Derecha (▶) para indicar cerrar/guardar.
      toggleBtn.innerHTML = "&#9654;";
    }
  };

  header.appendChild(titleText);
  header.appendChild(toggleBtn);
  panel.appendChild(header);

  const bodyScroll = document.createElement("div");
  bodyScroll.className = "widget-body";
  panel.appendChild(bodyScroll);

  function construirCarrusel(items, esSecundario) {
    if (!items || items.length === 0) return null;
    const container = document.createElement("div");
    container.className = "widget-carousel-section";

    //if (esSecundario) {
    //  const secTitle = document.createElement("div");
    //  secTitle.className = "widget-section-title";
    //  secTitle.innerText = "Imágenes Generales";
    //  container.appendChild(secTitle);
    //}
    const contentWrapper = document.createElement("div");
    // Agrupación por "slide" si todos los items traen "tipo"
    const todosConTipo = items.length > 0 && items.every((it) => it.tipo);
    if (todosConTipo) {
      const grupos = {};
      items.forEach((it, idx) => {
        const key = it.slide ?? idx; // default: cada item su propio slide si no hay slide
        if (!grupos[key]) grupos[key] = [];
        grupos[key].push(it);
      });

      const keysOrdenadas = Object.keys(grupos).sort((a, b) => Number(a) - Number(b));
      keysOrdenadas.forEach((k, idxSlide) => {
        const slide = document.createElement("div");
        slide.className = idxSlide === 0 ? "widget-slide widget-active" : "widget-slide";
        grupos[k].forEach((bloque) => {
          if (bloque.tipo === "parrafo") {
            const valor = bloque.texto ?? bloque.parrafo;
            if (Array.isArray(valor)) {
              valor.forEach((txt) => {
                const p = document.createElement("p");
                if (typeof txt === "string" && txt.startsWith("Nota.-")) {
                  const resto = txt.slice("Nota.-".length);
                  p.innerHTML = "<strong>Nota.-</strong>" + resto;
                } else {
                  p.innerText = txt;
                }
                slide.appendChild(p);
              });
            } else if (typeof valor === "string") {
              const p = document.createElement("p");
              if (valor.startsWith("Nota.-")) {
                const resto = valor.slice("Nota.-".length);
                p.innerHTML = "<strong>Nota.-</strong>" + resto;
              } else {
                p.innerText = valor;
              }
              slide.appendChild(p);
            }
          } else if (bloque.tipo === "titulo") {
            const txt = bloque.texto ?? bloque.titulo ?? "";
            if (txt.trim()) {
              const h4 = document.createElement("h4");
              if (esSecundario) h4.className = "widget-imagen-titulo";
              h4.innerText = txt;
              slide.appendChild(h4);
            }
          } else if (bloque.tipo === "imagen") {
            const src = bloque.src ?? bloque.imagen;
            if (src) {
              const img = document.createElement("img");
              img.src = src;
              img.style.display = "block";
              img.style.cursor = "pointer";
              img.onclick = function() { 
                if (typeof window.openImage === "function") {
                  window.openImage(this);
                }
              };
              img.onerror = function () {
                this.style.display = "none";
              };
              slide.appendChild(img);
            }
          } else if (bloque.tipo === "lista") {
            const itemsLista = bloque.items ?? bloque.lista;
            if (Array.isArray(itemsLista) && itemsLista.length > 0) {
              const ul = document.createElement("ul");
              itemsLista.forEach((txt) => {
                const li = document.createElement("li");
                li.innerText = txt;
                ul.appendChild(li);
              });
              slide.appendChild(ul);
            }
          }
        });
        contentWrapper.appendChild(slide);
      });
    } else {
      // Lógica existente para compatibilidad retro (un slide por item)
      items.forEach((item, index) => {
        const slide = document.createElement("div");
        slide.className = index === 0 ? "widget-slide widget-active" : "widget-slide";
        Object.keys(item).forEach((key) => {
          if (key === "titulo") {
            if (item.titulo && item.titulo.trim()) {
              const el = document.createElement("h4");
              if (esSecundario) el.className = "widget-imagen-titulo";
              el.innerText = item.titulo;
              slide.appendChild(el);
            }
          } else if (key === "titulo_bloque") {
            if (item.titulo_bloque && item.titulo_bloque.trim()) {
              const el = document.createElement("h4");
              el.innerText = item.titulo_bloque;
              slide.appendChild(el);
            }
          } else if (key === "parrafo") {
            // Soporta string o array en "parrafo"
            const valor = item.parrafo;
            if (Array.isArray(valor)) {
              valor.forEach((txt) => {
                const el = document.createElement("p");
                if (typeof txt === "string" && txt.startsWith("Nota.-")) {
                  const resto = txt.slice("Nota.-".length);
                  el.innerHTML = "<strong>Nota.-</strong>" + resto;
                } else {
                  el.innerText = txt;
                }
                slide.appendChild(el);
              });
            } else if (typeof valor === "string") {
              const el = document.createElement("p");
              if (valor.startsWith("Nota.-")) {
                const resto = valor.slice("Nota.-".length);
                el.innerHTML = "<strong>Nota.-</strong>" + resto;
              } else {
                el.innerText = valor;
              }
              slide.appendChild(el);
            }
          } else if (key === "parrafo2") {
            const el = document.createElement("p");
            el.innerText = item[key];
            slide.appendChild(el);
          } else if (key === "parrafos") {
            if (Array.isArray(item.parrafos)) {
              item.parrafos.forEach((txt) => {
                const el = document.createElement("p");
                el.innerText = txt;
                slide.appendChild(el);
              });
            }
          } else if (key === "lista" || key === "lista2") {
            if (item[key].length > 0) {
              const ul = document.createElement("ul");
              item[key].forEach((txt) => {
                const li = document.createElement("li");
                li.innerText = txt;
                ul.appendChild(li);
              });
              slide.appendChild(ul);
            }
          } else if (key === "imagen") {
            const img = document.createElement("img");
            img.src = item.imagen;
            img.style.display = "block";
            img.style.cursor = "pointer";
            img.onclick = function() { 
              if (typeof window.openImage === "function") {
                window.openImage(this);
              }
            };
            img.onerror = function () {
              this.style.display = "none";
            };
            slide.appendChild(img);
          }
        });
        contentWrapper.appendChild(slide);
      });
    }
    container.appendChild(contentWrapper);

    const totalSlides = contentWrapper.querySelectorAll(".widget-slide").length;
    if (totalSlides > 1) {
      const nav = document.createElement("div");
      nav.className = "widget-nav-controls";
      const btnPrev = document.createElement("button");
      btnPrev.className = "widget-btn-nav";
      btnPrev.innerHTML = "&#9664;";
      const counter = document.createElement("span");
      counter.className = "widget-counter";
      counter.innerText = `1 / ${totalSlides}`;
      const btnNext = document.createElement("button");
      btnNext.className = "widget-btn-nav";
      btnNext.innerHTML = "&#9654;";

      let idx = 0;
      const slides = contentWrapper.querySelectorAll(".widget-slide");
      const update = () => {
        slides.forEach((s) => s.classList.remove("widget-active"));
        void slides[idx].offsetWidth;
        slides[idx].classList.add("widget-active");
        counter.innerText = `${idx + 1} / ${totalSlides}`;
      };
      btnPrev.onclick = () => {
        idx = (idx - 1 + totalSlides) % totalSlides;
        update();
      };
      btnNext.onclick = () => {
        idx = (idx + 1) % totalSlides;
        update();
      };
      nav.appendChild(btnPrev);
      nav.appendChild(counter);
      nav.appendChild(btnNext);
      container.appendChild(nav);
    }
    return container;
  }

  const carruselPrincipal = construirCarrusel(data.contenido, false);
  if (carruselPrincipal) bodyScroll.appendChild(carruselPrincipal);
  const carruselSecundario = construirCarrusel(data.imagenesGenerales, true);
  if (carruselSecundario) bodyScroll.appendChild(carruselSecundario);

  if (carruselPrincipal || carruselSecundario) {
    document.body.appendChild(panel);
  }
}

// Inicializar widgets después de cargar los datos
async function inicializarWidgets() {
  const datosArray = await cargarDatos();
  if (datosArray && Array.isArray(datosArray)) {
    // Crear un visor por cada elemento del array
    datosArray.forEach((datos, index) => {
      crearWidgetCompacto(datos, index);
    });
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", inicializarWidgets);
} else {
  inicializarWidgets();
}

