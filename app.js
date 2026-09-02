(function () {
  "use strict";

  const appEl = document.getElementById("app");
  const screenEl = document.getElementById("screen");
  const topbarEl = document.getElementById("topbar");
  const topbarTitleEl = document.getElementById("topbarTitle");
  const backBtn = document.getElementById("backBtn");
  const bottomNav = document.getElementById("bottomNav");
  const navItems = Array.from(bottomNav.querySelectorAll(".nav-item"));

  // ---------- Perfil (nombre / correo, solo local) ----------
  const PERFIL_KEY = "aprende-derecho:perfil";

  function cargarPerfil() {
    try {
      return JSON.parse(localStorage.getItem(PERFIL_KEY) || "null");
    } catch {
      return null;
    }
  }

  function guardarPerfil(perfil) {
    try {
      localStorage.setItem(PERFIL_KEY, JSON.stringify(perfil));
    } catch {}
  }

  function primerNombre(nombreCompleto) {
    return (nombreCompleto || "").trim().split(/\s+/)[0] || "";
  }

  // ---------- Niveles de pago (Gumroad) ----------
  // Reemplaza estos valores por los de tu propio producto en Gumroad:
  // 1. Crea el producto en gumroad.com (gratis), activa "Generate a unique license key per sale".
  // 2. "permalink" es la parte final de tu URL de producto: gumroad.com/l/ESTO-DE-AQUI
  // 3. "checkoutUrl" es la URL completa de compra que Gumroad te da.
  // 4. Para el desbloqueo automático (sin que copien ningún código): en el producto,
  //    en "Content" → "Redirect to URL after successful purchase", pon:
  //    https://TU-DOMINIO.com/?nivel=experto&license_key={{license_key}}
  //    (cambia "experto" por "extra" en el producto de Extra). Reemplaza TU-DOMINIO.com
  //    por tu dominio real una vez publiques la app.
  const PAGOS = {
    experto: {
      precio: "$1 USD",
      permalink: "TU-PERMALINK-EXPERTO",
      checkoutUrl: "https://TUUSUARIO.gumroad.com/l/TU-PERMALINK-EXPERTO",
    },
    extra: {
      precio: "$3 USD",
      permalink: "TU-PERMALINK-EXTRA",
      checkoutUrl: "https://TUUSUARIO.gumroad.com/l/TU-PERMALINK-EXTRA",
    },
  };

  // Correo de soporte para problemas de pago o licencia — reemplázalo por el tuyo.
  const CORREO_SOPORTE = "tu-correo@ejemplo.com";

  // Reemplaza esta URL por la de tu dominio real una vez publiques la app.
  const URL_APP = "https://TU-DOMINIO.com";

  // ---------- Desbloqueo gratis por anuncio (capítulo por capítulo) ----------
  // Para quien no puede pagar: puede ver UN capítulo bloqueado mirando un anuncio.
  // Usa la Ad Placement API de Google (gratis, la misma cuenta de AdSense de siempre):
  // 1. Crea una cuenta en https://www.google.com/adsense (gratis, requiere aprobación).
  // 2. En index.html, reemplaza TU-ADSENSE-CLIENT-ID en la etiqueta <script> de AdSense
  //    por tu "ca-pub-XXXXXXXXXXXXXXXX" real.
  // 3. Reemplaza el valor de abajo por el mismo ca-pub-XXXXXXXXXXXXXXXX.
  // Mientras esto siga con el valor de ejemplo, la app entra en "modo de prueba":
  // el botón de anuncio avisa claramente que es una simulación y desbloquea igual,
  // para que puedas probar el flujo completo antes de tener la cuenta aprobada.
  const ADSENSE_CLIENT_ID = "TU-ADSENSE-CLIENT-ID";

  const ANUNCIOS_KEY = "aprende-derecho:desbloqueados-por-anuncio";

  function cargarDesbloqueosPorAnuncio() {
    try {
      return new Set(JSON.parse(localStorage.getItem(ANUNCIOS_KEY) || "[]"));
    } catch {
      return new Set();
    }
  }

  function claveAnuncio(nivelId, temaId) {
    return nivelId + ":" + temaId;
  }

  function estaDesbloqueadoPorAnuncio(nivelId, temaId) {
    return cargarDesbloqueosPorAnuncio().has(claveAnuncio(nivelId, temaId));
  }

  function marcarDesbloqueadoPorAnuncio(nivelId, temaId) {
    const set = cargarDesbloqueosPorAnuncio();
    set.add(claveAnuncio(nivelId, temaId));
    try {
      localStorage.setItem(ANUNCIOS_KEY, JSON.stringify(Array.from(set)));
    } catch {}
  }

  // Muestra un anuncio recompensado real (Ad Placement API) o, si aún no hay
  // cuenta de AdSense configurada, un modo de prueba honesto que simula la espera.
  function mostrarAnuncioRecompensado(onExito, onCancelado) {
    const modoPrueba = !ADSENSE_CLIENT_ID || ADSENSE_CLIENT_ID === "TU-ADSENSE-CLIENT-ID";

    if (!modoPrueba && window.adsbygoogle && typeof window.adsbygoogle.push === "function") {
      window.adsbygoogle.push({
        type: "reward",
        name: "desbloqueo-capitulo",
        beforeAd: () => {},
        afterAd: () => {},
        beforeReward: (showAdFn) => showAdFn(),
        adDismissed: () => onCancelado && onCancelado(),
        adViewed: () => onExito(),
        adBreakDone: () => {},
      });
      return;
    }

    // Modo de prueba: no hay anuncios reales todavía, pero el flujo se puede probar.
    onExito({ modoPrueba: true });
  }

  // Un capítulo de muestra gratis por nivel de pago, para que prueben la calidad antes de comprar.
  const MUESTRAS_GRATIS = {
    experto: "sentencias-hito",
    extra: "habilidades-esenciales-buen-abogado",
  };

  // Razones honestas para comprar, mostradas en el muro de pago.
  const RAZONES_COMPRA = {
    experto: [
      "89 capítulos que cubren desde control de constitucionalidad hasta ciberseguridad y M&A",
      "El mismo nivel de profundidad que un curso de posgrado, en formato de bolsillo",
      "Enlaces directos a la Corte Constitucional y demás fuentes oficiales en cada tema",
    ],
    extra: [
      "34 capítulos sobre la carrera real de abogado: nadie más lo explica tan directo",
      "Ahorra años de aprender por ensayo y error lo que aquí está en un solo lugar",
      "Desde tu hoja de vida hasta montar tu propia firma, paso a paso",
    ],
  };

  function esMuestraGratis(nivelId, temaId) {
    return MUESTRAS_GRATIS[nivelId] === temaId;
  }

  function puedeVerTema(nivelId, temaId) {
    return (
      estaDesbloqueado(nivelId) ||
      esMuestraGratis(nivelId, temaId) ||
      estaDesbloqueadoPorAnuncio(nivelId, temaId)
    );
  }

  const DESBLOQUEOS_KEY = "aprende-derecho:desbloqueados";

  function cargarDesbloqueos() {
    try {
      return new Set(JSON.parse(localStorage.getItem(DESBLOQUEOS_KEY) || "[]"));
    } catch {
      return new Set();
    }
  }

  function estaDesbloqueado(nivelId) {
    if (!PAGOS[nivelId]) return true; // niveles sin precio son gratis
    return cargarDesbloqueos().has(nivelId);
  }

  function marcarDesbloqueado(nivelId) {
    const set = cargarDesbloqueos();
    set.add(nivelId);
    try {
      localStorage.setItem(DESBLOQUEOS_KEY, JSON.stringify(Array.from(set)));
    } catch {}
  }

  async function verificarLicencia(nivelId, licenseKey) {
    const config = PAGOS[nivelId];
    if (!config || !licenseKey.trim()) return { ok: false, error: "Escribe tu código de licencia." };
    try {
      const res = await fetch("https://api.gumroad.com/v2/licenses/verify", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          product_permalink: config.permalink,
          license_key: licenseKey.trim(),
          increment_uses_count: "false",
        }),
      });
      const data = await res.json();
      if (data.success) {
        marcarDesbloqueado(nivelId);
        return { ok: true };
      }
      return { ok: false, error: "Código no válido. Revisa que lo copiaste completo." };
    } catch {
      return { ok: false, error: "No se pudo verificar (revisa tu conexión) e inténtalo de nuevo." };
    }
  }

  // ---------- Desbloqueo automático al volver de Gumroad ----------
  // Si en Gumroad configuraste "Redirect to URL after successful purchase" con
  // algo como https://TU-DOMINIO.com/?nivel=experto&license_key={{license_key}},
  // esto detecta esos parámetros al cargar la app y desbloquea sin pedir nada.
  function revisarRetornoDeCompra() {
    const params = new URLSearchParams(window.location.search);
    const nivelId = params.get("nivel");
    const key = params.get("license_key");

    if (!nivelId || !key || !PAGOS[nivelId]) return Promise.resolve(false);

    screenEl.innerHTML = `<p class="empty-note">Confirmando tu compra…</p>`;

    return verificarLicencia(nivelId, key).then((resultado) => {
      const urlLimpia = window.location.pathname + window.location.hash;
      window.history.replaceState(null, "", urlLimpia);

      if (resultado.ok) {
        mostrarToast(`✓ ¡Compra confirmada! ${NIVELES[nivelId].nombre} desbloqueado.`);
      } else {
        mostrarToast("No pudimos confirmar tu compra automáticamente. Usa tu código abajo.");
      }
      navigate("/nivel/" + nivelId);
      return true;
    });
  }

  function findRecurso(nombre) {
    return RECURSOS_OFICIALES.find((r) => r.nombre === nombre);
  }

  function contarPalabras(tema) {
    const texto = tema.contenido.join(" ") + " " + tema.puntosClave.join(" ");
    return texto.trim().split(/\s+/).length;
  }

  function tiempoLectura(tema, nivel) {
    if (nivel && nivel.duracionEstimadaMin) {
      const totalPalabras = nivel.temas.reduce((acc, t) => acc + contarPalabras(t), 0);
      const proporcion = contarPalabras(tema) / totalPalabras;
      return Math.max(1, Math.round(proporcion * nivel.duracionEstimadaMin));
    }
    return Math.max(1, Math.round(contarPalabras(tema) / 200));
  }

  function tiempoLecturaNivel(nivel) {
    return nivel.duracionEstimadaMin || nivel.temas.reduce((acc, t) => acc + tiempoLectura(t), 0);
  }

  function formatDuracion(min) {
    if (min >= 60) {
      const horas = min / 60;
      const texto = Number.isInteger(horas) ? String(horas) : horas.toFixed(1);
      return texto + " h";
    }
    return min + " min";
  }

  // ---------- Progreso (leídos), guardado en localStorage ----------
  const PROGRESS_KEY = "aprende-derecho:leidos";

  function cargarLeidos() {
    try {
      return new Set(JSON.parse(localStorage.getItem(PROGRESS_KEY) || "[]"));
    } catch {
      return new Set();
    }
  }

  function guardarLeidos(set) {
    try {
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(Array.from(set)));
    } catch {}
  }

  function esLeido(temaId) {
    return cargarLeidos().has(temaId);
  }

  function marcarLeido(temaId, leido) {
    const set = cargarLeidos();
    if (leido) set.add(temaId);
    else set.delete(temaId);
    guardarLeidos(set);
  }

  function leidosEnNivel(nivel) {
    const set = cargarLeidos();
    return nivel.temas.filter((t) => set.has(t.id)).length;
  }

  // ---------- Favoritos (guardados), separado de "leído" ----------
  const FAVORITOS_KEY = "aprende-derecho:favoritos";

  function cargarFavoritos() {
    try {
      return new Set(JSON.parse(localStorage.getItem(FAVORITOS_KEY) || "[]"));
    } catch {
      return new Set();
    }
  }

  function guardarFavoritos(set) {
    try {
      localStorage.setItem(FAVORITOS_KEY, JSON.stringify(Array.from(set)));
    } catch {}
  }

  function esFavorito(temaId) {
    return cargarFavoritos().has(temaId);
  }

  function alternarFavorito(temaId) {
    const set = cargarFavoritos();
    if (set.has(temaId)) set.delete(temaId);
    else set.add(temaId);
    guardarFavoritos(set);
  }

  function listaFavoritos() {
    const set = cargarFavoritos();
    const resultado = [];
    Object.values(NIVELES).forEach((nivel) => {
      nivel.temas.forEach((tema) => {
        if (set.has(tema.id)) resultado.push({ nivel, tema });
      });
    });
    return resultado;
  }

  // ---------- Notas personales por capítulo ----------
  const NOTAS_KEY = "aprende-derecho:notas";

  function cargarNotas() {
    try {
      return JSON.parse(localStorage.getItem(NOTAS_KEY) || "{}");
    } catch {
      return {};
    }
  }

  function obtenerNota(temaId) {
    return cargarNotas()[temaId] || "";
  }

  function guardarNota(temaId, texto) {
    const notas = cargarNotas();
    if (texto.trim()) notas[temaId] = texto;
    else delete notas[temaId];
    try {
      localStorage.setItem(NOTAS_KEY, JSON.stringify(notas));
    } catch {}
  }

  // ---------- Racha de estudio ----------
  const RACHA_KEY = "aprende-derecho:dias-estudio";

  function hoyISO() {
    return new Date().toISOString().slice(0, 10);
  }

  function registrarDiaEstudio() {
    try {
      const dias = new Set(JSON.parse(localStorage.getItem(RACHA_KEY) || "[]"));
      dias.add(hoyISO());
      localStorage.setItem(RACHA_KEY, JSON.stringify(Array.from(dias)));
    } catch {}
  }

  function calcularRacha() {
    let dias;
    try {
      dias = new Set(JSON.parse(localStorage.getItem(RACHA_KEY) || "[]"));
    } catch {
      dias = new Set();
    }
    if (dias.size === 0) return 0;
    let racha = 0;
    const cursor = new Date();
    if (!dias.has(hoyISO())) cursor.setDate(cursor.getDate() - 1);
    while (dias.has(cursor.toISOString().slice(0, 10))) {
      racha++;
      cursor.setDate(cursor.getDate() - 1);
    }
    return racha;
  }

  // ---------- Tamaño de texto ----------
  const TEXT_SIZE_KEY = "aprende-derecho:tamano-texto";
  const TEXT_SIZES = ["normal", "grande", "muy-grande"];

  function obtenerTamanoTexto() {
    try {
      const v = localStorage.getItem(TEXT_SIZE_KEY);
      return TEXT_SIZES.includes(v) ? v : "normal";
    } catch {
      return "normal";
    }
  }

  function aplicarTamanoTexto(tamano) {
    const root = document.documentElement;
    root.classList.remove(...TEXT_SIZES.map((t) => "text-" + t));
    if (tamano !== "normal") root.classList.add("text-" + tamano);
    try {
      localStorage.setItem(TEXT_SIZE_KEY, tamano);
    } catch {}
  }

  function siguienteTamanoTexto(actual) {
    const i = TEXT_SIZES.indexOf(actual);
    return TEXT_SIZES[(i + 1) % TEXT_SIZES.length];
  }

  // ---------- Tema (claro / oscuro / automático) ----------
  const THEME_KEY = "aprende-derecho:tema";
  const THEMES = ["auto", "light", "dark"];
  const THEME_LABELS = { auto: "🌗 Automático", light: "☀️ Claro", dark: "🌙 Oscuro" };

  function obtenerTema() {
    try {
      const v = localStorage.getItem(THEME_KEY);
      return THEMES.includes(v) ? v : "auto";
    } catch {
      return "auto";
    }
  }

  function aplicarTema(tema) {
    if (tema === "auto") document.documentElement.removeAttribute("data-theme");
    else document.documentElement.setAttribute("data-theme", tema);
    try {
      localStorage.setItem(THEME_KEY, tema);
    } catch {}
  }

  function siguienteTema(actual) {
    const i = THEMES.indexOf(actual);
    return THEMES[(i + 1) % THEMES.length];
  }

  function totalLeidos() {
    return cargarLeidos().size;
  }

  function totalCapitulosApp() {
    return Object.values(NIVELES).reduce((acc, n) => acc + n.temas.length, 0);
  }

  // ---------- "Continuar leyendo": último capítulo visitado ----------
  const LAST_READ_KEY = "aprende-derecho:ultima-lectura";

  function guardarUltimaLectura(nivelId, temaId) {
    try {
      localStorage.setItem(LAST_READ_KEY, JSON.stringify({ nivelId, temaId }));
    } catch {}
  }

  function obtenerUltimaLectura() {
    try {
      const raw = JSON.parse(localStorage.getItem(LAST_READ_KEY) || "null");
      if (!raw) return null;
      const nivel = NIVELES[raw.nivelId];
      const tema = nivel && nivel.temas.find((t) => t.id === raw.temaId);
      if (!nivel || !tema) return null;
      return { nivel, tema };
    } catch {
      return null;
    }
  }

  // ---------- Respaldo de datos (exportar / importar / borrar) ----------
  const CLAVES_APP = [
    PROGRESS_KEY,
    FAVORITOS_KEY,
    NOTAS_KEY,
    RACHA_KEY,
    LAST_READ_KEY,
    TEXT_SIZE_KEY,
    THEME_KEY,
    DESBLOQUEOS_KEY,
    PERFIL_KEY,
    ANUNCIOS_KEY,
  ];

  function exportarDatos() {
    const datos = {};
    CLAVES_APP.forEach((clave) => {
      const valor = localStorage.getItem(clave);
      if (valor !== null) datos[clave] = valor;
    });
    const paquete = { app: "abogado-graduado", version: 1, exportadoEl: new Date().toISOString(), datos };
    const blob = new Blob([JSON.stringify(paquete, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "abogado-graduado-respaldo-" + hoyISO() + ".json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function importarDatos(archivo, callback) {
    const lector = new FileReader();
    lector.onload = () => {
      try {
        const paquete = JSON.parse(lector.result);
        const datos = paquete && paquete.datos;
        if (!datos || typeof datos !== "object") throw new Error("Formato inválido");
        CLAVES_APP.forEach((clave) => {
          if (datos[clave] !== undefined) localStorage.setItem(clave, datos[clave]);
        });
        callback(true);
      } catch {
        callback(false);
      }
    };
    lector.onerror = () => callback(false);
    lector.readAsText(archivo);
  }

  function borrarTodosLosDatos() {
    CLAVES_APP.forEach((clave) => localStorage.removeItem(clave));
  }

  // ---------- Buscador ----------
  function buscarCapitulos(query) {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const resultados = [];
    Object.values(NIVELES).forEach((nivel) => {
      nivel.temas.forEach((tema) => {
        const haystack = (tema.titulo + " " + tema.resumen + " " + tema.contenido.join(" ")).toLowerCase();
        if (haystack.includes(q)) resultados.push({ nivel, tema });
      });
    });
    return resultados;
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  // ---------- Compartir ----------
  function compartirTexto(texto) {
    if (navigator.share) {
      navigator.share({ text: texto }).catch(() => {});
      return;
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(texto)
        .then(() => mostrarToast("Copiado al portapapeles ✓"))
        .catch(() => mostrarToast("No se pudo copiar"));
      return;
    }
    mostrarToast("Comparte manualmente: " + texto);
  }

  function mostrarToast(mensaje) {
    const existente = document.getElementById("appToast");
    if (existente) existente.remove();
    const toast = document.createElement("div");
    toast.id = "appToast";
    toast.className = "app-toast";
    toast.textContent = mensaje;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2600);
  }

  // ---------- Router ----------
  // Rutas soportadas:
  //   #/            → splash (pantalla de bienvenida, punto de entrada)
  //   #/inicio      → listado de niveles
  //   #/recursos
  //   #/acerca
  //   #/glosario
  //   #/nivel/<nivelId>
  //   #/tema/<nivelId>/<temaId>
  //   #/quiz/<nivelId>
  function parseHash() {
    const hash = window.location.hash.replace(/^#\/?/, "");
    const parts = hash.split("/").filter(Boolean);
    if (parts.length === 0) return { name: "splash" };
    if (parts[0] === "splash") return { name: "splash" };
    if (parts[0] === "inicio") return { name: "inicio" };
    if (parts[0] === "nivel" && parts[1]) return { name: "nivel", nivelId: parts[1] };
    if (parts[0] === "paywall" && parts[1]) return { name: "paywall", nivelId: parts[1] };
    if (parts[0] === "tema" && parts[1] && parts[2]) return { name: "tema", nivelId: parts[1], temaId: parts[2] };
    if (parts[0] === "quiz" && parts[1]) return { name: "quiz", nivelId: parts[1] };
    if (parts[0] === "recursos") return { name: "recursos" };
    if (parts[0] === "acerca") return { name: "acerca" };
    if (parts[0] === "glosario") return { name: "glosario" };
    if (parts[0] === "guardados") return { name: "guardados" };
    if (parts[0] === "notas") return { name: "notas" };
    if (parts[0] === "certificado" && parts[1]) return { name: "certificado", nivelId: parts[1] };
    return { name: "splash" };
  }

  function navigate(path) {
    window.location.hash = path;
  }

  window.addEventListener("hashchange", render);

  bottomNav.addEventListener("click", (e) => {
    const btn = e.target.closest(".nav-item");
    if (!btn) return;
    navigate("/" + btn.dataset.route);
  });

  backBtn.addEventListener("click", () => {
    const route = parseHash();
    if (route.name === "tema") navigate("/nivel/" + route.nivelId);
    else if (route.name === "paywall") navigate("/nivel/" + route.nivelId);
    else navigate("/inicio");
  });

  // ---------- Screens ----------
  function screenSplash() {
    setBack(false);
    setActiveNav(null);

    const totalCapitulos = Object.values(NIVELES).reduce((acc, n) => acc + n.temas.length, 0);
    const ultima = obtenerUltimaLectura();
    const leidos = totalLeidos();
    const perfil = cargarPerfil();

    const kicker = perfil
      ? `🎓 Hola de nuevo, ${escapeHtml(primerNombre(perfil.nombre))} 👋`
      : `🎓 Colombia · ${totalCapitulos} capítulos · 4 niveles`;

    screenEl.innerHTML = `
      <div class="hero hero-splash">
        <span class="hero-deco hero-deco-1" aria-hidden="true">🔨</span>
        <span class="hero-deco hero-deco-2" aria-hidden="true">📚</span>
        <span class="hero-deco hero-deco-3" aria-hidden="true">🏛️</span>
        <span class="hero-deco hero-deco-4" aria-hidden="true">📜</span>
        <span class="hero-kicker">${kicker}</span>
        <h2>Es hora de empezar a ser abogado</h2>
        <p>Contenido original organizado como los capítulos de un libro —de lo básico a lo experto— más enlaces directos a las fuentes oficiales para profundizar.</p>
        <div class="hero-badges">
          <span class="hero-badge">📖 Contenido original</span>
          <span class="hero-badge">✅ Fuentes oficiales</span>
          <span class="hero-badge">🎓 Rigor académico</span>
        </div>
        ${leidos ? `<p class="hero-progress-note">✓ Llevas ${leidos} de ${totalCapitulos} capítulos leídos${calcularRacha() >= 2 ? ` · 🔥 Racha de ${calcularRacha()} días` : ""}</p>` : ""}

        ${
          perfil
            ? `
          <button class="hero-cta hero-cta-glow" id="entrarBtn">Entrar →</button>
          ${
            ultima
              ? `<button class="hero-continue" id="continuarBtn">↻ Continuar: ${escapeHtml(ultima.tema.titulo)}</button>`
              : ""
          }`
            : `
          <div class="onboard-form">
            <p class="onboard-title">Antes de entrar, ¿cómo te llamas?</p>
            <input type="text" id="onboardNombre" class="onboard-input" placeholder="Tu nombre" autocomplete="name" />
            <input type="email" id="onboardCorreo" class="onboard-input" placeholder="Tu correo (opcional)" autocomplete="email" />
            <p class="onboard-hint">Se usa para saludarte y personalizar tus certificados. Se queda solo en tu dispositivo — no se envía a ningún servidor. Si más adelante desbloqueas Experto o Extra, usa el mismo correo con el que compres en Gumroad para que todo quede junto.</p>
            <button class="hero-cta hero-cta-glow" id="comenzarBtn">Comenzar mi camino →</button>
            <p class="onboard-error" id="onboardError" hidden></p>
          </div>`
        }
        <span class="hero-icon" aria-hidden="true">⚖️</span>
      </div>
    `;

    const entrarBtn = document.getElementById("entrarBtn");
    if (entrarBtn) entrarBtn.addEventListener("click", () => navigate("/inicio"));

    const continuarBtn = document.getElementById("continuarBtn");
    if (continuarBtn) {
      continuarBtn.addEventListener("click", () => navigate("/tema/" + ultima.nivel.id + "/" + ultima.tema.id));
    }

    const comenzarBtn = document.getElementById("comenzarBtn");
    if (comenzarBtn) {
      comenzarBtn.addEventListener("click", () => {
        const nombre = document.getElementById("onboardNombre").value.trim();
        const correo = document.getElementById("onboardCorreo").value.trim();
        const errorEl = document.getElementById("onboardError");
        if (nombre.length < 2) {
          errorEl.textContent = "Escribe al menos tu nombre para continuar.";
          errorEl.hidden = false;
          return;
        }
        guardarPerfil({ nombre, correo });
        navigate("/inicio");
      });
    }
  }

  function screenInicio() {
    topbarTitleEl.textContent = "Toga";
    setBack(false);
    setActiveNav("inicio");

    const niveles = Object.values(NIVELES);
    const cards = niveles
      .map((n) => {
        const bloqueado = !estaDesbloqueado(n.id);
        const leidos = leidosEnNivel(n);
        const pct = Math.round((leidos / n.temas.length) * 100);
        return `
      <button class="level-card" style="--level-color:${n.color}" data-emoji="${n.icono}" data-nivel="${n.id}">
        <span class="level-emoji">${n.icono}</span>
        <span class="level-card-body">
          <p class="level-card-title">${escapeHtml(n.nombre)}${bloqueado ? ` <span class="level-card-lock">🔒 ${PAGOS[n.id].precio}</span>` : ""}</p>
          <p class="level-card-subtitle">${escapeHtml(n.subtitulo)}</p>
          <p class="level-card-count">${n.temas.length} capítulos · ~${formatDuracion(tiempoLecturaNivel(n))}${leidos ? ` · ${leidos} leído${leidos === 1 ? "" : "s"}` : ""}</p>
          ${leidos ? `<span class="level-card-progress"><span class="level-card-progress-fill" style="width:${pct}%"></span></span>` : ""}
        </span>
        <span class="chevron">›</span>
      </button>`;
      })
      .join("");

    const totalCapitulos = niveles.reduce((acc, n) => acc + n.temas.length, 0);
    const numFavoritos = cargarFavoritos().size;

    const gratisCompleto =
      leidosEnNivel(NIVELES.principiante) === NIVELES.principiante.temas.length &&
      leidosEnNivel(NIVELES.intermedio) === NIVELES.intermedio.temas.length;
    const hayNivelPorDesbloquear = !estaDesbloqueado("experto") || !estaDesbloqueado("extra");
    const mostrarInvitacion = gratisCompleto && hayNivelPorDesbloquear;

    screenEl.innerHTML = `
      <div class="search-box">
        <span class="search-icon">🔍</span>
        <input type="search" id="searchInput" class="search-input" placeholder="Buscar en los ${totalCapitulos} capítulos…" autocomplete="off" />
      </div>
      ${numFavoritos ? `<button class="guardados-link" id="guardadosLink">⭐ Ver mis ${numFavoritos} capítulo${numFavoritos === 1 ? "" : "s"} guardado${numFavoritos === 1 ? "" : "s"}</button>` : ""}
      ${
        mostrarInvitacion
          ? `<div class="milestone-banner">
              <span class="milestone-emoji">🎉</span>
              <div class="milestone-body">
                <p class="milestone-title">¡Terminaste todo el contenido gratis!</p>
                <p class="milestone-text">Sigues con hambre de aprender — Experto y Extra te están esperando.</p>
              </div>
            </div>`
          : ""
      }
      <div id="searchResults"></div>
      <div id="levelsSection">
        <div class="section-label">Niveles</div>
        <div class="level-list">${cards}</div>
        <button class="invite-link" id="inviteLink">📲 Invita a un amigo a estudiar contigo</button>
      </div>
    `;

    screenEl.querySelectorAll(".level-card").forEach((btn) => {
      btn.addEventListener("click", () => navigate("/nivel/" + btn.dataset.nivel));
    });
    const guardadosLink = document.getElementById("guardadosLink");
    if (guardadosLink) guardadosLink.addEventListener("click", () => navigate("/guardados"));

    document.getElementById("inviteLink").addEventListener("click", () => {
      compartirTexto(
        `📚 Estoy aprendiendo derecho colombiano con Toga: 185 capítulos gratis y de pago, glosario y quiz incluidos. Échale un ojo → ${URL_APP}`
      );
    });

    const searchInput = document.getElementById("searchInput");
    const searchResultsEl = document.getElementById("searchResults");
    const levelsSectionEl = document.getElementById("levelsSection");

    searchInput.addEventListener("input", () => {
      const q = searchInput.value;
      if (!q.trim()) {
        searchResultsEl.innerHTML = "";
        levelsSectionEl.style.display = "";
        return;
      }
      levelsSectionEl.style.display = "none";
      const resultados = buscarCapitulos(q);
      if (resultados.length === 0) {
        searchResultsEl.innerHTML = `<p class="empty-note">Sin resultados para "${escapeHtml(q)}".</p>`;
        return;
      }
      searchResultsEl.innerHTML = `
        <div class="section-label">${resultados.length} resultado${resultados.length === 1 ? "" : "s"}</div>
        <div class="topic-list">
          ${resultados
            .map(
              ({ nivel, tema }) => `
            <button class="topic-card" data-nivel="${nivel.id}" data-tema="${tema.id}">
              <span class="topic-index" style="background:${nivel.color}22; color:${nivel.color}">${nivel.icono}</span>
              <span class="topic-card-body">
                <p class="topic-card-title">${escapeHtml(tema.titulo)}${
                  !estaDesbloqueado(nivel.id)
                    ? esMuestraGratis(nivel.id, tema.id) || estaDesbloqueadoPorAnuncio(nivel.id, tema.id)
                      ? ` <span class="level-card-lock level-card-lock-free">🎁 gratis</span>`
                      : ` <span class="level-card-lock">🔒 ${PAGOS[nivel.id].precio} · o 🎬</span>`
                    : ""
                }</p>
                <p class="topic-card-summary">${escapeHtml(nivel.nombre)} · ${escapeHtml(tema.resumen)}</p>
              </span>
              <span class="chevron">›</span>
            </button>`
            )
            .join("")}
        </div>
      `;
      searchResultsEl.querySelectorAll(".topic-card").forEach((btn) => {
        btn.addEventListener("click", () => navigate("/tema/" + btn.dataset.nivel + "/" + btn.dataset.tema));
      });
    });
  }

  function screenNivel(nivelId) {
    const nivel = NIVELES[nivelId];
    if (!nivel) return navigate("/inicio");

    topbarTitleEl.textContent = nivel.nombre;
    setBack(true);
    setActiveNav(null);

    const nivelPago = !estaDesbloqueado(nivelId);

    const items = nivel.temas
      .map((t, i) => {
        const leido = esLeido(t.id);
        const favorito = esFavorito(t.id);
        const puedeVer = puedeVerTema(nivelId, t.id);
        let badge = "";
        if (nivelPago) {
          if (esMuestraGratis(nivelId, t.id)) {
            badge = ` <span class="level-card-lock level-card-lock-free">🎁 gratis</span>`;
          } else if (puedeVer) {
            badge = ` <span class="level-card-lock level-card-lock-free">🎬 desbloqueado</span>`;
          } else {
            badge = ` <span class="level-card-lock">🔒 ${PAGOS[nivelId].precio} · o 🎬 gratis</span>`;
          }
        }
        return `
      <button class="topic-card${leido ? " topic-card-leido" : ""}${!puedeVer ? " topic-card-locked" : ""}" data-tema="${t.id}">
        <span class="topic-card-body">
          <span class="topic-card-eyebrow">Capítulo ${i + 1}${leido ? " · ✓ Leído" : ""}${favorito ? " · ★" : ""}</span>
          <p class="topic-card-title">${escapeHtml(t.titulo)}${badge}</p>
          <p class="topic-card-summary">${escapeHtml(t.resumen)} · ~${formatDuracion(tiempoLectura(t, nivel))}</p>
        </span>
        <span class="chevron">›</span>
      </button>`;
      })
      .join("");

    const tieneQuiz = QUIZZES[nivelId] && QUIZZES[nivelId].length > 0;
    const completo = leidosEnNivel(nivel) === nivel.temas.length;

    screenEl.innerHTML = `
      <div class="level-banner" style="--level-color:${nivel.color}" data-emoji="${nivel.icono}">
        <h2>${nivel.icono} ${escapeHtml(nivel.nombre)}</h2>
        <p>${escapeHtml(nivel.descripcion)}</p>
      </div>
      ${
        nivelPago
          ? `<div class="nivel-pago-banner">
              <p>🔒 Este nivel es de pago (${PAGOS[nivelId].precio}). Puedes desbloquearlo completo, o entrar a cada capítulo y ver un anuncio corto para leerlo gratis, uno por uno.</p>
              <button class="nivel-pago-banner-btn" id="verPlanesBtn">Ver planes de pago →</button>
            </div>`
          : ""
      }
      ${
        completo
          ? `<button class="cert-cta" id="certBtn">🏆 ¡Completaste este nivel! Ver certificado</button>`
          : ""
      }
      ${tieneQuiz ? `<button class="quiz-cta" id="quizBtn">📝 Repasar con quiz (${QUIZZES[nivelId].length} preguntas)</button>` : ""}
      <div class="section-label">Índice · ${nivel.temas.length} capítulos · ~${formatDuracion(tiempoLecturaNivel(nivel))} en total</div>
      <div class="topic-list">${items}</div>
    `;

    screenEl.querySelectorAll(".topic-card").forEach((btn) => {
      btn.addEventListener("click", () => navigate("/tema/" + nivelId + "/" + btn.dataset.tema));
    });
    const certBtn = document.getElementById("certBtn");
    if (certBtn) certBtn.addEventListener("click", () => navigate("/certificado/" + nivelId));
    const quizBtn = document.getElementById("quizBtn");
    if (quizBtn) quizBtn.addEventListener("click", () => navigate("/quiz/" + nivelId));
    const verPlanesBtn = document.getElementById("verPlanesBtn");
    if (verPlanesBtn) verPlanesBtn.addEventListener("click", () => navigate("/paywall/" + nivelId));
  }

  function screenPaywall(nivelId) {
    const nivel = NIVELES[nivelId];
    const pago = PAGOS[nivelId];
    const adelanto = nivel.temas.slice(0, 4);
    const restantes = nivel.temas.length - adelanto.length;
    const muestraId = MUESTRAS_GRATIS[nivelId];
    const temaMuestra = muestraId ? nivel.temas.find((t) => t.id === muestraId) : null;
    const razones = RAZONES_COMPRA[nivelId] || [];

    screenEl.innerHTML = `
      <div class="paywall-card" style="--level-color:${nivel.color}">
        <span class="paywall-lock">🔒</span>
        <h2>${nivel.icono} ${escapeHtml(nivel.nombre)}</h2>
        <p class="paywall-desc">${escapeHtml(nivel.descripcion)}</p>
        <div class="paywall-stats">
          <span class="paywall-stat">📚 ${nivel.temas.length} capítulos</span>
          <span class="paywall-stat">⏱ ~${formatDuracion(tiempoLecturaNivel(nivel))}</span>
        </div>
        <p class="paywall-price">${pago.precio} · pago único, acceso para siempre</p>
        <a class="hero-cta paywall-buy-btn" id="paywallBuyBtn" href="${pago.checkoutUrl}" target="_blank" rel="noopener noreferrer">
          Desbloquear por ${pago.precio}
        </a>
        ${
          temaMuestra
            ? `<button class="paywall-sample-btn" id="paywallSampleBtn">🎁 Leer gratis: "${escapeHtml(temaMuestra.titulo)}"</button>`
            : ""
        }
        <p class="paywall-hint">Se abre la página segura de pago (Gumroad) en una pestaña nueva. Al terminar de pagar, vuelves aquí mismo y el nivel se desbloquea solo — no tienes que copiar ni pegar nada.</p>
      </div>
      ${
        razones.length
          ? `<div class="paywall-preview-card">
              <h3>Por qué vale la pena</h3>
              <ul class="paywall-reasons-list">
                ${razones.map((r) => `<li>${escapeHtml(r)}</li>`).join("")}
              </ul>
            </div>`
          : ""
      }
      <div class="paywall-preview-card">
        <h3>Un adelanto de lo que incluye</h3>
        <ul class="paywall-preview-list">
          ${adelanto
            .map(
              (t) =>
                `<li${t.id === muestraId ? ' class="paywall-preview-free"' : ""}>${escapeHtml(t.titulo)}${t.id === muestraId ? " (gratis)" : ""}</li>`
            )
            .join("")}
        </ul>
        ${restantes > 0 ? `<p class="paywall-preview-more">…y ${restantes} capítulos más.</p>` : ""}
      </div>
      <div class="paywall-unlock-card">
        <h3>¿Ya pagaste y no se desbloqueó solo?</h3>
        <p class="settings-note">Puede pasar si cerraste la pestaña antes de que terminara de volver. Pega aquí el código que te llegó por correo y lo intentamos manualmente.</p>
        <input type="text" id="licenseInput" class="notes-textarea paywall-license-input" placeholder="Pega aquí tu código de licencia" autocomplete="off" />
        <button class="hero-cta" id="verificarBtn">Verificar y desbloquear</button>
        <p class="paywall-status" id="paywallStatus" hidden></p>
      </div>
      <p class="paywall-support">¿Problemas con tu pago o tu código? Escríbenos a <a href="mailto:${CORREO_SOPORTE}">${CORREO_SOPORTE}</a></p>
    `;

    const sampleBtn = document.getElementById("paywallSampleBtn");
    if (sampleBtn) sampleBtn.addEventListener("click", () => navigate("/tema/" + nivelId + "/" + muestraId));

    document.getElementById("verificarBtn").addEventListener("click", async () => {
      const boton = document.getElementById("verificarBtn");
      const estado = document.getElementById("paywallStatus");
      const codigo = document.getElementById("licenseInput").value;
      boton.disabled = true;
      boton.textContent = "Verificando…";
      const resultado = await verificarLicencia(nivelId, codigo);
      boton.disabled = false;
      boton.textContent = "Verificar y desbloquear";
      estado.hidden = false;
      if (resultado.ok) {
        estado.textContent = "✓ ¡Desbloqueado! Cargando el nivel…";
        estado.className = "paywall-status paywall-status-ok";
        setTimeout(() => screenNivel(nivelId), 700);
      } else {
        estado.textContent = resultado.error;
        estado.className = "paywall-status paywall-status-error";
      }
    });
  }

  function screenCapituloBloqueado(nivelId, temaId, tema, nivel) {
    const pago = PAGOS[nivelId];

    topbarTitleEl.textContent = nivel.nombre;
    setBack(true);
    setActiveNav(null);

    screenEl.innerHTML = `
      <div class="paywall-card" style="--level-color:${nivel.color}">
        <span class="paywall-lock">🔒</span>
        <h2>${escapeHtml(tema.titulo)}</h2>
        <p class="paywall-desc">${escapeHtml(tema.resumen)}</p>
        <button class="hero-cta paywall-buy-btn" id="verAnuncioBtn">🎬 Ver un anuncio y leer este capítulo gratis</button>
        <p class="paywall-hint" id="anuncioEstado" hidden></p>
        <a class="paywall-sample-btn" href="${pago.checkoutUrl}" target="_blank" rel="noopener noreferrer">
          O desbloquea todo ${nivel.nombre} por ${pago.precio}
        </a>
      </div>
      <p class="paywall-support">¿Ya pagaste? <button class="link-btn" id="verPlanesDesdeCapBtn">Ve a verificar tu código aquí</button></p>
    `;

    const verAnuncioBtn = document.getElementById("verAnuncioBtn");
    const anuncioEstado = document.getElementById("anuncioEstado");
    verAnuncioBtn.addEventListener("click", () => {
      verAnuncioBtn.disabled = true;
      verAnuncioBtn.textContent = "Cargando anuncio…";
      anuncioEstado.hidden = true;
      mostrarAnuncioRecompensado(
        (info) => {
          marcarDesbloqueadoPorAnuncio(nivelId, temaId);
          if (info && info.modoPrueba) {
            mostrarToast("✓ Modo de prueba: capítulo desbloqueado (aquí iría un anuncio real).");
          } else {
            mostrarToast("✓ ¡Gracias! Capítulo desbloqueado.");
          }
          screenTema(nivelId, temaId);
        },
        () => {
          verAnuncioBtn.disabled = false;
          verAnuncioBtn.textContent = "🎬 Ver un anuncio y leer este capítulo gratis";
          anuncioEstado.hidden = false;
          anuncioEstado.textContent = "No se completó el anuncio, así que no se desbloqueó. Puedes intentarlo de nuevo.";
        }
      );
    });

    const verPlanesBtn = document.getElementById("verPlanesDesdeCapBtn");
    if (verPlanesBtn) verPlanesBtn.addEventListener("click", () => navigate("/paywall/" + nivelId));
  }

  function screenTema(nivelId, temaId) {
    const nivel = NIVELES[nivelId];
    const index = nivel && nivel.temas.findIndex((t) => t.id === temaId);
    const tema = nivel && index > -1 ? nivel.temas[index] : null;
    if (!nivel || !tema) return navigate("/inicio");
    if (!puedeVerTema(nivelId, temaId)) return screenCapituloBloqueado(nivelId, temaId, tema, nivel);

    topbarTitleEl.textContent = nivel.nombre;
    setBack(true);
    setActiveNav(null);
    guardarUltimaLectura(nivelId, temaId);

    const parrafos = tema.contenido.map((p) => `<p>${escapeHtml(p)}</p>`).join("");
    const puntos = tema.puntosClave.map((p) => `<li>${escapeHtml(p)}</li>`).join("");

    const nombresEnlaces = ENLACES_POR_TEMA[tema.id] || [];
    const enlaces = nombresEnlaces
      .map(findRecurso)
      .filter(Boolean)
      .map(
        (r) => `
      <a class="source-link" href="${r.url}" target="_blank" rel="noopener noreferrer">
        <span class="source-link-name">${escapeHtml(r.nombre)}</span>
        <span class="source-link-arrow">↗</span>
      </a>`
      )
      .join("");

    const anterior = index > 0 ? nivel.temas[index - 1] : null;
    const siguiente = index < nivel.temas.length - 1 ? nivel.temas[index + 1] : null;
    const favorito = esFavorito(tema.id);
    const notaGuardada = obtenerNota(tema.id);
    const esMuestra = esMuestraGratis(nivelId, temaId) && !estaDesbloqueado(nivelId);

    screenEl.innerHTML = `
      <div class="topic-detail-header">
        <div class="topic-detail-toprow">
          <span class="topic-pill" style="--level-color:${nivel.color}">${escapeHtml(nivel.nombre)} · Capítulo ${index + 1} de ${nivel.temas.length}</span>
          <span class="topic-detail-actions">
            <button class="icon-toggle-btn" id="textSizeBtn" aria-label="Cambiar tamaño de texto" title="Cambiar tamaño de texto">Aa</button>
            <button class="icon-toggle-btn" id="compartirBtn" aria-label="Compartir capítulo" title="Compartir">📤</button>
            <button class="icon-toggle-btn${favorito ? " icon-toggle-btn-active" : ""}" id="favoritoBtn" aria-label="Guardar capítulo">${favorito ? "★" : "☆"}</button>
          </span>
        </div>
        <h2>${escapeHtml(tema.titulo)}</h2>
        <p class="reading-time">📖 ~${formatDuracion(tiempoLectura(tema, nivel))} de lectura</p>
      </div>
      ${
        esMuestra
          ? `<div class="muestra-banner" style="--level-color:${nivel.color}">
              <p>🎁 Estás leyendo un capítulo de muestra gratis. Desbloquea ${nivel.nombre} para ver los otros ${nivel.temas.length - 1} capítulos.</p>
              <button class="muestra-banner-btn" id="muestraDesbloquearBtn">Ver planes →</button>
            </div>`
          : ""
      }
      <div class="content-card">${parrafos}</div>
      <div class="keypoints-card">
        <h3>Puntos clave</h3>
        <ul>${puntos}</ul>
      </div>
      ${
        enlaces
          ? `<div class="content-card sources-card">
              <h3>Fuentes oficiales para profundizar</h3>
              ${enlaces}
            </div>`
          : ""
      }
      <div class="notes-card">
        <h3>📝 Tus notas <span class="notes-hint">(solo en este dispositivo)</span></h3>
        <textarea class="notes-textarea" id="notasInput" placeholder="Escribe aquí lo que quieras recordar de este capítulo…" rows="3">${escapeHtml(notaGuardada)}</textarea>
        <p class="notes-saved" id="notasGuardado" hidden>Guardado ✓</p>
      </div>
      <p class="disclaimer">Contenido educativo, no constituye asesoría legal para un caso concreto ni reemplaza el título de abogado. Para tu situación particular, consulta a un abogado o a las entidades oficiales.</p>
      <button class="mark-read-btn${esLeido(tema.id) ? " mark-read-btn-done" : ""}" id="markReadBtn">
        ${esLeido(tema.id) ? "✓ Leído — quitar marca" : "Marcar capítulo como leído"}
      </button>
      <div class="chapter-nav">
        ${
          anterior
            ? `<button class="chapter-nav-btn" data-tema="${anterior.id}"><span class="chapter-nav-dir">‹ Anterior</span><span class="chapter-nav-title">${escapeHtml(anterior.titulo)}</span></button>`
            : `<span></span>`
        }
        ${
          siguiente
            ? `<button class="chapter-nav-btn chapter-nav-next" data-tema="${siguiente.id}"><span class="chapter-nav-dir">Siguiente ›</span><span class="chapter-nav-title">${escapeHtml(siguiente.titulo)}</span></button>`
            : `<span></span>`
        }
      </div>
    `;

    screenEl.querySelectorAll(".chapter-nav-btn").forEach((btn) => {
      btn.addEventListener("click", () => navigate("/tema/" + nivelId + "/" + btn.dataset.tema));
    });

    document.getElementById("markReadBtn").addEventListener("click", () => {
      const nuevoEstado = !esLeido(tema.id);
      marcarLeido(tema.id, nuevoEstado);
      if (nuevoEstado) registrarDiaEstudio();
      screenTema(nivelId, temaId);
    });

    document.getElementById("favoritoBtn").addEventListener("click", () => {
      alternarFavorito(tema.id);
      screenTema(nivelId, temaId);
    });

    document.getElementById("compartirBtn").addEventListener("click", () => {
      compartirTexto(`📖 "${tema.titulo}" — ${tema.resumen}\n\nDe Toga, nivel ${nivel.nombre}.`);
    });

    const muestraBtn = document.getElementById("muestraDesbloquearBtn");
    if (muestraBtn) muestraBtn.addEventListener("click", () => navigate("/nivel/" + nivelId));

    document.getElementById("textSizeBtn").addEventListener("click", () => {
      aplicarTamanoTexto(siguienteTamanoTexto(obtenerTamanoTexto()));
    });

    const notasInput = document.getElementById("notasInput");
    const notasGuardadoEl = document.getElementById("notasGuardado");
    let notaTimeout;
    notasInput.addEventListener("input", () => {
      clearTimeout(notaTimeout);
      notasGuardadoEl.hidden = true;
      notaTimeout = setTimeout(() => {
        guardarNota(tema.id, notasInput.value);
        notasGuardadoEl.hidden = false;
      }, 500);
    });
  }

  function screenQuiz(nivelId) {
    const nivel = NIVELES[nivelId];
    const preguntas = QUIZZES[nivelId];
    if (!nivel || !preguntas || !preguntas.length) return navigate("/nivel/" + nivelId);
    if (!estaDesbloqueado(nivelId)) return navigate("/nivel/" + nivelId);

    topbarTitleEl.textContent = "Quiz · " + nivel.nombre;
    setBack(true);
    setActiveNav(null);

    const preguntasHtml = preguntas
      .map(
        (p, i) => `
      <div class="quiz-question" data-index="${i}">
        <p class="quiz-question-text">${i + 1}. ${escapeHtml(p.pregunta)}</p>
        <div class="quiz-options">
          ${p.opciones
            .map(
              (op, j) => `<button class="quiz-option" data-opcion="${j}">${escapeHtml(op)}</button>`
            )
            .join("")}
        </div>
        <p class="quiz-explicacion" hidden></p>
      </div>`
      )
      .join("");

    screenEl.innerHTML = `
      <div class="level-banner" style="--level-color:${nivel.color}" data-emoji="📝">
        <h2>📝 Quiz de ${escapeHtml(nivel.nombre)}</h2>
        <p>${preguntas.length} preguntas para poner a prueba lo que aprendiste. Elige una opción en cada una.</p>
      </div>
      <div id="quizQuestions">${preguntasHtml}</div>
      <div class="quiz-result" id="quizResult" hidden>
        <p class="quiz-result-score" id="quizScore"></p>
        <button class="hero-cta quiz-retry" id="quizRetry">↻ Reintentar</button>
      </div>
    `;

    let respondidas = 0;
    let correctas = 0;

    screenEl.querySelectorAll(".quiz-question").forEach((qEl) => {
      const idx = Number(qEl.dataset.index);
      const p = preguntas[idx];
      const explicacionEl = qEl.querySelector(".quiz-explicacion");
      qEl.querySelectorAll(".quiz-option").forEach((btn) => {
        btn.addEventListener("click", () => {
          if (qEl.classList.contains("quiz-question-answered")) return;
          qEl.classList.add("quiz-question-answered");
          const elegida = Number(btn.dataset.opcion);
          qEl.querySelectorAll(".quiz-option").forEach((otro) => {
            const op = Number(otro.dataset.opcion);
            if (op === p.correcta) otro.classList.add("quiz-option-correcta");
            else if (op === elegida) otro.classList.add("quiz-option-incorrecta");
          });
          explicacionEl.textContent = (elegida === p.correcta ? "✓ Correcto. " : "✗ Incorrecto. ") + p.explicacion;
          explicacionEl.hidden = false;
          respondidas++;
          if (elegida === p.correcta) correctas++;
          if (respondidas === preguntas.length) {
            const resultEl = document.getElementById("quizResult");
            document.getElementById("quizScore").textContent =
              `Obtuviste ${correctas} de ${preguntas.length} correctas.`;
            resultEl.hidden = false;
          }
        });
      });
    });

    document.getElementById("quizRetry").addEventListener("click", () => screenQuiz(nivelId));
  }

  function screenGlosario() {
    topbarTitleEl.textContent = "Glosario";
    setBack(false);
    setActiveNav("glosario");

    screenEl.innerHTML = `
      <div class="search-box">
        <span class="search-icon">📗</span>
        <input type="search" id="glosarioInput" class="search-input" placeholder="Buscar un término (ej. tutela, dolo, casación)…" autocomplete="off" />
      </div>
      <div id="glosarioList"></div>
    `;

    const listEl = document.getElementById("glosarioList");
    const inputEl = document.getElementById("glosarioInput");

    function renderGlosario(filtro) {
      const q = filtro.trim().toLowerCase();
      const items = GLOSARIO.filter(
        (g) => !q || g.termino.toLowerCase().includes(q) || g.definicion.toLowerCase().includes(q)
      ).sort((a, b) => a.termino.localeCompare(b.termino, "es"));
      if (items.length === 0) {
        listEl.innerHTML = `<p class="empty-note">Sin resultados para "${escapeHtml(filtro)}".</p>`;
        return;
      }
      listEl.innerHTML = `
        <div class="section-label">${items.length} término${items.length === 1 ? "" : "s"}</div>
        <div class="glossary-list">
          ${items
            .map(
              (g) => `
            <div class="glossary-item">
              <p class="glossary-term">${escapeHtml(g.termino)}</p>
              <p class="glossary-def">${escapeHtml(g.definicion)}</p>
            </div>`
            )
            .join("")}
        </div>
      `;
    }

    renderGlosario("");
    inputEl.addEventListener("input", () => renderGlosario(inputEl.value));
  }

  function screenGuardados() {
    topbarTitleEl.textContent = "Guardados";
    setBack(true);
    setActiveNav(null);

    const favoritos = listaFavoritos();

    if (favoritos.length === 0) {
      screenEl.innerHTML = `<p class="empty-note">Aún no has guardado ningún capítulo. Toca el ☆ en cualquier capítulo para guardarlo aquí.</p>`;
      return;
    }

    screenEl.innerHTML = `
      <div class="section-label">${favoritos.length} capítulo${favoritos.length === 1 ? "" : "s"} guardado${favoritos.length === 1 ? "" : "s"}</div>
      <div class="topic-list">
        ${favoritos
          .map(
            ({ nivel, tema }) => `
          <button class="topic-card" data-nivel="${nivel.id}" data-tema="${tema.id}">
            <span class="topic-index" style="background:${nivel.color}22; color:${nivel.color}">${nivel.icono}</span>
            <span class="topic-card-body">
              <p class="topic-card-title">${escapeHtml(tema.titulo)}</p>
              <p class="topic-card-summary">${escapeHtml(nivel.nombre)} · ${escapeHtml(tema.resumen)}</p>
            </span>
            <span class="chevron">›</span>
          </button>`
          )
          .join("")}
      </div>
    `;

    screenEl.querySelectorAll(".topic-card").forEach((btn) => {
      btn.addEventListener("click", () => navigate("/tema/" + btn.dataset.nivel + "/" + btn.dataset.tema));
    });
  }

  function screenNotas() {
    topbarTitleEl.textContent = "Mis notas";
    setBack(true);
    setActiveNav(null);

    const notas = cargarNotas();
    const entradas = [];
    Object.values(NIVELES).forEach((nivel) => {
      nivel.temas.forEach((tema) => {
        if (notas[tema.id]) entradas.push({ nivel, tema, nota: notas[tema.id] });
      });
    });

    if (entradas.length === 0) {
      screenEl.innerHTML = `<p class="empty-note">Aún no has escrito ninguna nota. Abre cualquier capítulo y usa el campo "Tus notas" para guardar lo que quieras recordar.</p>`;
      return;
    }

    screenEl.innerHTML = `
      <div class="section-label">${entradas.length} nota${entradas.length === 1 ? "" : "s"}</div>
      <div class="notes-summary-list">
        ${entradas
          .map(
            ({ nivel, tema, nota }) => `
          <button class="note-summary-card" data-nivel="${nivel.id}" data-tema="${tema.id}">
            <p class="note-summary-title">${nivel.icono} ${escapeHtml(tema.titulo)}</p>
            <p class="note-summary-text">${escapeHtml(nota)}</p>
          </button>`
          )
          .join("")}
      </div>
    `;

    screenEl.querySelectorAll(".note-summary-card").forEach((btn) => {
      btn.addEventListener("click", () => navigate("/tema/" + btn.dataset.nivel + "/" + btn.dataset.tema));
    });
  }

  function screenCertificado(nivelId) {
    const nivel = NIVELES[nivelId];
    if (!nivel) return navigate("/inicio");
    if (!estaDesbloqueado(nivelId)) return navigate("/nivel/" + nivelId);

    topbarTitleEl.textContent = "Certificado";
    setBack(true);
    setActiveNav(null);

    const completo = leidosEnNivel(nivel) === nivel.temas.length;
    if (!completo) {
      screenEl.innerHTML = `<p class="empty-note">Todavía te faltan capítulos de este nivel. ¡Sigue así, ya casi lo logras!</p>`;
      return;
    }

    const fecha = new Date().toLocaleDateString("es-CO", { year: "numeric", month: "long", day: "numeric" });
    const perfil = cargarPerfil();

    screenEl.innerHTML = `
      <div class="certificate" style="--level-color:${nivel.color}">
        <span class="certificate-emoji">🏆</span>
        <p class="certificate-kicker">Certificado de finalización</p>
        ${perfil ? `<p class="certificate-otorgado">Otorgado a<br><strong>${escapeHtml(perfil.nombre)}</strong></p>` : ""}
        <h2 class="certificate-title">${nivel.icono} ${escapeHtml(nivel.nombre)}</h2>
        <p class="certificate-text">Completaste los ${nivel.temas.length} capítulos del nivel <strong>${escapeHtml(nivel.nombre)}</strong> en Toga.</p>
        <p class="certificate-date">${fecha}</p>
        <p class="certificate-disclaimer">Reconocimiento simbólico de este recorrido de estudio — no es un título ni una credencial oficial.</p>
      </div>
      <button class="hero-cta certificate-share-btn" id="certShareBtn">📤 Compartir</button>
    `;

    document.getElementById("certShareBtn").addEventListener("click", () => {
      compartirTexto(
        `🏆 Completé el nivel ${nivel.nombre} en Toga: ${nivel.temas.length} capítulos sobre derecho colombiano.`
      );
    });
  }

  function screenRecursos() {
    topbarTitleEl.textContent = "Recursos oficiales";
    setBack(false);
    setActiveNav("recursos");

    const cards = RECURSOS_OFICIALES.map(
      (r) => `
      <a class="resource-card" href="${r.url}" target="_blank" rel="noopener noreferrer">
        <p class="resource-name">${escapeHtml(r.nombre)}</p>
        <p class="resource-desc">${escapeHtml(r.descripcion)}</p>
        <p class="resource-url">${escapeHtml(r.url)} ↗</p>
      </a>`
    ).join("");

    screenEl.innerHTML = `
      <div class="hero">
        <h2>Fuentes oficiales</h2>
        <p>Sitios del Estado colombiano para consultar leyes, jurisprudencia y trámites directamente en la fuente.</p>
      </div>
      <div class="section-label">Instituciones</div>
      ${cards}
    `;
  }

  function screenAcerca() {
    topbarTitleEl.textContent = "Acerca de";
    setBack(false);
    setActiveNav("acerca");

    const totalCapitulos = Object.values(NIVELES).reduce((acc, n) => acc + n.temas.length, 0);
    const totalMin = Object.values(NIVELES).reduce((acc, n) => acc + tiempoLecturaNivel(n), 0);
    const leidos = totalLeidos();

    screenEl.innerHTML = `
      <div class="about-card">
        <div class="about-emoji">🎓</div>
        <h2>Toga</h2>
        <p>Un libro de derecho colombiano en formato app: ${totalCapitulos} capítulos originales (~${formatDuracion(totalMin)} de lectura en total) organizados en cuatro niveles —Principiante, Intermedio, Experto y Extra—, cada uno más extenso y profundo que el anterior. Incluye un glosario de términos jurídicos y un quiz de autoevaluación por nivel.</p>
        ${leidos ? `<p>Tu progreso: <strong>${leidos} de ${totalCapitulos}</strong> capítulos leídos (${Math.round((leidos / totalCapitulos) * 100)}%).</p>` : ""}
        <p>El contenido es original, con fines educativos, y cada capítulo enlaza a fuentes oficiales del Estado para profundizar. Esta app <strong>no sustituye</strong> un título universitario en Derecho, la tarjeta profesional ni la asesoría de un abogado para un caso particular — el capítulo "El camino real para ejercer como abogado en Colombia" (nivel Experto) explica honestamente qué exige la ley para litigar.</p>
        <p>Este texto es de ejemplo — reemplázalo con la información real de tu proyecto (nombre, autor, contacto) cuando quieras.</p>
      </div>
      <div class="section-label">Tu perfil</div>
      <div class="settings-card">
        <div class="settings-row">
          <span class="settings-label">${cargarPerfil() ? "👤 " + escapeHtml(cargarPerfil().nombre) : "Sin perfil"}</span>
          <button class="settings-btn" id="editarPerfilBtn">✏️ Editar</button>
        </div>
        ${cargarPerfil() && cargarPerfil().correo ? `<p class="settings-note">${escapeHtml(cargarPerfil().correo)}</p>` : ""}
      </div>
      <div class="section-label">Preferencias</div>
      <div class="settings-card">
        <div class="settings-row">
          <span class="settings-label">Apariencia</span>
          <button class="settings-btn" id="temaBtn">${THEME_LABELS[obtenerTema()]}</button>
        </div>
      </div>
      <button class="notas-link" id="notasLink">📝 Ver todas mis notas</button>

      <div class="section-label">Tus datos</div>
      <p class="settings-note">Tu progreso, notas y favoritos se guardan solo en este navegador. Si vas a cambiar de dispositivo o borrar datos del navegador, exporta un respaldo primero.</p>
      <div class="data-actions">
        <button class="settings-action-btn" id="exportarBtn">⬇️ Exportar mi respaldo</button>
        <button class="settings-action-btn" id="importarBtn">⬆️ Importar un respaldo</button>
        <input type="file" id="importarInput" accept="application/json" hidden />
        <button class="settings-action-btn settings-action-danger" id="borrarBtn">🗑️ Borrar mis datos</button>
      </div>
    `;

    document.getElementById("temaBtn").addEventListener("click", () => {
      aplicarTema(siguienteTema(obtenerTema()));
      document.getElementById("temaBtn").textContent = THEME_LABELS[obtenerTema()];
    });
    document.getElementById("notasLink").addEventListener("click", () => navigate("/notas"));

    document.getElementById("editarPerfilBtn").addEventListener("click", () => {
      const actual = cargarPerfil() || { nombre: "", correo: "" };
      const nuevoNombre = prompt("Tu nombre:", actual.nombre);
      if (nuevoNombre === null) return;
      if (nuevoNombre.trim().length < 2) {
        mostrarToast("Escribe al menos tu nombre.");
        return;
      }
      const nuevoCorreo = prompt("Tu correo (opcional):", actual.correo || "");
      guardarPerfil({ nombre: nuevoNombre.trim(), correo: (nuevoCorreo || "").trim() });
      screenAcerca();
    });

    document.getElementById("exportarBtn").addEventListener("click", () => {
      exportarDatos();
      mostrarToast("Respaldo descargado ✓");
    });

    const importarInput = document.getElementById("importarInput");
    document.getElementById("importarBtn").addEventListener("click", () => importarInput.click());
    importarInput.addEventListener("change", () => {
      const archivo = importarInput.files[0];
      if (!archivo) return;
      importarDatos(archivo, (ok) => {
        if (ok) {
          mostrarToast("Respaldo importado ✓");
          aplicarTamanoTexto(obtenerTamanoTexto());
          aplicarTema(obtenerTema());
          screenAcerca();
        } else {
          mostrarToast("Ese archivo no es un respaldo válido");
        }
      });
    });

    document.getElementById("borrarBtn").addEventListener("click", () => {
      if (confirm("¿Borrar todo tu progreso, notas, favoritos y racha guardados en este dispositivo? Esta acción no se puede deshacer.")) {
        borrarTodosLosDatos();
        aplicarTamanoTexto("normal");
        aplicarTema("auto");
        mostrarToast("Tus datos fueron borrados");
        screenAcerca();
      }
    });
  }

  function setBack(show) {
    backBtn.hidden = !show;
  }

  function setActiveNav(route) {
    navItems.forEach((item) => item.classList.toggle("active", item.dataset.route === route));
  }

  function render() {
    const route = parseHash();
    screenEl.scrollTop = 0;

    const esSplash = route.name === "splash";
    topbarEl.style.display = esSplash ? "none" : "";
    bottomNav.style.display = esSplash ? "none" : "";
    screenEl.classList.toggle("screen-splash", esSplash);
    appEl.classList.toggle("app-splash", esSplash);

    if (route.name === "splash") screenSplash();
    else if (route.name === "inicio") screenInicio();
    else if (route.name === "nivel") screenNivel(route.nivelId);
    else if (route.name === "paywall") screenPaywall(route.nivelId);
    else if (route.name === "tema") screenTema(route.nivelId, route.temaId);
    else if (route.name === "quiz") screenQuiz(route.nivelId);
    else if (route.name === "recursos") screenRecursos();
    else if (route.name === "acerca") screenAcerca();
    else if (route.name === "glosario") screenGlosario();
    else if (route.name === "guardados") screenGuardados();
    else if (route.name === "notas") screenNotas();
    else if (route.name === "certificado") screenCertificado(route.nivelId);
    else screenSplash();
  }

  aplicarTamanoTexto(obtenerTamanoTexto());
  aplicarTema(obtenerTema());
  revisarRetornoDeCompra().then((manejado) => {
    if (!manejado) render();
  });
})();
