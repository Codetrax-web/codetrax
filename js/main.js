/* =====================================================
   AJUSTES GENERALES DEL SITIO (editar aquí)
===================================================== */
// Interruptor de métricas remotas (likes y vistas globales). Se activan solo si además configuras METRICS (Supabase).
// Si METRICS conserva "TU_", todo funciona igual pero los likes se guardan solo en el navegador de cada visitante.
const ENABLE_REMOTE_METRICS = true;

// Escapa texto antes de meterlo en innerHTML (evita inyección de HTML/JS desde JSON o buscador).
const esc = s => String(s ?? '').replace(/[&<>"']/g,
    c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

// SEGURIDAD: valida enlaces que vienen de JSON o de APIs. Solo permite http(s) y rutas relativas;
// cualquier otro esquema (javascript:, data:, vbscript:) se reemplaza por "#".
const safeUrl = u => { try { return ['https:', 'http:'].includes(new URL(u, location.href).protocol) ? u : '#'; } catch (e) { return '#'; } };

// Servicios mostrados en el Home (antes solo estaban en la pestaña "Servicios").
const SERVICES = [
    { i:'fa-code',        t:'Desarrollo',  d:'Sitios web, apps, sistemas a medida y automatización de procesos.' },
    { i:'fa-pen-ruler',   t:'Diseño',      d:'Identidad visual, branding, interfaces UI/UX y material gráfico.' },
    { i:'fa-film',        t:'Multimedia',  d:'Edición de video, diseño sonoro y contenido para plataformas.' },
    { i:'fa-gamepad',     t:'Videojuegos', d:'Herramientas técnicas, mods y recursos gráficos para gaming.' },
    { i:'fa-compass',     t:'Consultoría', d:'Acompañamiento desde la idea técnica hasta el despliegue final.' }
];

/* =====================================================
   DONACIONES Y PAGOS (editar aquí)
   Cada método se muestra activo solo si ya lo configuraste; mientras el valor empiece
   con "TU_" aparece como "Próximamente" (así nunca hay enlaces rotos).
===================================================== */
const DONATIONS = {
    paypalUser:  'TU_USUARIO_PAYPAL',      // Usuario de paypal.me/TU_USUARIO
    banco:       'TU_BANCO',               // Ej. BBVA
    titular:     'TU_NOMBRE_TITULAR',      // Nombre del titular de la cuenta
    clabe:       'TU_CLABE_18_DIGITOS'     // CLABE interbancaria (18 dígitos)
};
// Atajos OPCIONALES: solo rellenan el campo de monto; la persona puede escribir cualquier cantidad. Pon [] para quitarlos.
const MONTOS = [];   // vacío = la persona escribe el monto que quiera, sin cantidades sugeridas
const ready = v => !!v && !String(v).startsWith('TU_');   // ¿ya está configurado?

/* =====================================================
   BOTONES DE LAS TARJETAS (portafolio y recursos)
   cardActions() arma los botones del reverso de cada tarjeta:
     1) Botón principal "glass" -> label ("Visita" en portafolio, "Probar" en recursos). Solo si hay enlace web.
     2) Botón de likes en forma de píldora (contador + pulgar).
     3) Botón "Descargar" -> solo si el recurso trae un archivo. Un archivo se detecta por el campo "descarga"
        del JSON o porque la "url" termina en .ino/.zip/.pdf, etc. (así los datos actuales siguen funcionando).
===================================================== */
function cardActions({ url, download, label, id, liked, likes, allowDownload = false }) {
    const isFile = u => /\.(ino|zip|rar|7z|pdf|py|js)$/i.test(String(u || '').split('?')[0]);
    const dl = allowDownload ? (download || (isFile(url) ? url : null)) : null;
    const demo = url && url !== dl ? url : null;
    const ext = dl ? String(dl).split('?')[0].split('.').pop().toLowerCase() : '';
    const kind = ext === 'ino' ? 'Arduino · .ino' : ext === 'zip' ? 'Código fuente · .zip' : 'Archivo .' + ext;
    return `
        ${demo ? `<a href="${esc(safeUrl(demo))}" target="_blank" rel="noopener noreferrer" class="btn-glass project-link">${label}</a>` : ''}
        <button type="button" class="btn-like ${liked ? 'liked' : ''}" data-id="${esc(id)}" aria-pressed="${!!liked}" aria-label="Me gusta">
            <span class="like-count">${likes}</span><span class="like-divider" aria-hidden="true"></span><i class="fa-regular fa-thumbs-up" aria-hidden="true"></i>
        </button>
        ${dl ? `<a href="${esc(safeUrl(dl))}" download target="_blank" rel="noopener noreferrer" class="btn-download project-link">
            <span class="dl-icon"><i class="fa-solid fa-download" aria-hidden="true"></i></span>
            <span><b>Descargar</b><small>${esc(kind)}</small></span></a>` : ''}`;
}

// Genera las tarjetas de métodos de pago. Los datos vienen de DONATIONS, nunca del usuario.
function donateMethods() {
    const D = DONATIONS;
    const card = (icon, name, desc, ok, action) => `
        <article class="donate-card ${ok ? '' : 'is-soon'}">
            <i class="${icon}" aria-hidden="true"></i><h3>${name}</h3><p>${desc}</p>
            ${ok ? action : '<span class="soon">Próximamente</span>'}
        </article>`;
    const link = (href, txt, extra = '') => `<a class="neon-button" href="${href}" target="_blank" rel="noopener noreferrer" ${extra}>${txt}</a>`;
    return [
        card('fa-brands fa-paypal', 'PayPal', 'Escribe arriba la cantidad que quieras y paga con tu cuenta o tarjeta.',
             ready(D.paypalUser), link('https://paypal.me/' + D.paypalUser, 'Donar con PayPal', 'data-paypal="' + D.paypalUser + '"')),
        card('fa-solid fa-building-columns', 'Transferencia', ready(D.clabe) ? `${D.banco} · ${D.titular}` : 'SPEI desde tu banco, sin comisiones.',
             ready(D.clabe), `<code class="clabe">${D.clabe}</code><button type="button" class="neon-button copy-btn" data-copy="${D.clabe}">Copiar CLABE</button>`)
    ].join('');
}

/* =====================================================
   NUEVAS SECCIONES CONFIGURABLES (v5)
===================================================== */
// TESTIMONIOS: pega aquí los reales. Si siguen con "TU_" NO se muestran (nunca se inventan testimonios).
const TESTIMONIOS = [
    { nombre:'TU_NOMBRE', rol:'Electrum CDMX',          texto:'TU_TESTIMONIO', foto:'assets/testimonios/electrum.webp' },
    { nombre:'TU_NOMBRE', rol:'Canal de YouTube',       texto:'TU_TESTIMONIO', foto:'' }
];
// RESEÑAS DE GOOGLE: se leen con Google Places API (New) y se muestran junto a los testimonios manuales.
// Necesitas: un Perfil de Empresa en Google, tu Place ID y una API key restringida a tu dominio (ver instrucciones).
// Con "TU_" no se consulta nada y solo se ven los testimonios manuales de arriba.
const GOOGLE_REVIEWS = { placeId:'TU_PLACE_ID', apiKey:'TU_API_KEY' };
// SUSCRIPCIÓN por correo. Ejemplo con Buttondown (buttondown.com); otros proveedores (MailerLite, Brevo)
// también sirven: pega la "action" de su formulario y el nombre de su campo de correo. Con "TU_" la sección no se muestra.
const SUBSCRIBE = { action:'https://buttondown.com/api/emails/embed-subscribe/TU_USUARIO', field:'email' };
// STACK: tecnologías que dominas (ícono de Font Awesome). Edita para que refleje lo que de verdad usas.
const STACK = [
    { n:'HTML5', i:'fa-brands fa-html5' }, { n:'CSS3', i:'fa-brands fa-css3-alt' }, { n:'JavaScript', i:'fa-brands fa-js' },
    { n:'Python', i:'fa-brands fa-python' }, { n:'Arduino', i:'fa-solid fa-microchip' },
    { n:'Git', i:'fa-brands fa-git-alt' }, { n:'GitHub', i:'fa-brands fa-github' }
];
// DISPONIBILIDAD: cambia open a false cuando tengas la agenda llena.
const AVAILABILITY = { open: true };
// ANALÍTICA sin cookies con Umami (cuenta gratis en umami.is). Pega el "Website ID"; con "TU_" no se carga.
const ANALYTICS = { umamiId:'b6d74f7c-4cf3-4ee2-9e72-56a562424e84', src:'https://cloud.umami.is/script.js' };
(function loadAnalytics() {
    if (!ANALYTICS.umamiId || ANALYTICS.umamiId.startsWith('TU_')) return;
    const s = document.createElement('script');
    s.defer = true; s.src = ANALYTICS.src;
    s.dataset.websiteId = ANALYTICS.umamiId; s.dataset.doNotTrack = 'true';   // respeta "No rastrear"
    document.head.appendChild(s);
})();
// Registra un evento (vistas de sección, clics en CTA). Si la analítica no está activa, no hace nada.
const track = name => { try { window.umami && window.umami.track(name); } catch (e) {} };

/* ---- IDIOMA ES/EN ----
   La interfaz está en español. Si el idioma es "en", applyI18n() reemplaza el texto de cada elemento
   cuyo texto exacto aparezca en este diccionario. Para traducir algo más, agrégalo aquí. */
// Idioma inicial: el que el visitante eligió antes; si no, el de su navegador (en/es).
let lang = localStorage.getItem('lang') || ((navigator.language || 'es').slice(0, 2) === 'en' ? 'en' : 'es');
const EN = {
 'INICIO':'HOME','SERVICIOS':'SERVICES','RECURSOS':'RESOURCES','PORTAFOLIO':'PORTFOLIO','APOYA':'SUPPORT','CONTACTO':'CONTACT',
 'Saltar al contenido':'Skip to content','Aviso de privacidad':'Privacy notice','Términos':'Terms',
 'Donde la tecnología encuentra su identidad.':'Where technology finds its identity.',
 'Somos un equipo multidisciplinario que fusiona creatividad, ingeniería y estrategia para convertir ideas complejas en experiencias digitales de alto impacto.':'We are a multidisciplinary team that blends creativity, engineering and strategy to turn complex ideas into high-impact digital experiences.',
 'Inicia tu proyecto':'Start your project','Qué hacemos':'What we do',
 'Desarrollo':'Development','Diseño':'Design','Multimedia':'Multimedia','Videojuegos':'Video games','Consultoría':'Consulting',
 'Sitios web, apps, sistemas a medida y automatización de procesos.':'Websites, apps, custom systems and process automation.',
 'Identidad visual, branding, interfaces UI/UX y material gráfico.':'Visual identity, branding, UI/UX interfaces and graphics.',
 'Edición de video, diseño sonoro y contenido para plataformas.':'Video editing, sound design and content for platforms.',
 'Herramientas técnicas, mods y recursos gráficos para gaming.':'Technical tools, mods and graphic assets for gaming.',
 'Acompañamiento desde la idea técnica hasta el despliegue final.':'Support from the technical idea to final deployment.',
 'Tecnologías con las que trabajamos':'Technologies we work with','Lo que dicen nuestros clientes':'What our clients say',
 'Proyectos Ejecutados':'Projects Delivered','Expertos en Equipo':'Team Experts','Año de Fundación':'Founded','Áreas de Servicio':'Service Areas',
 'Tutoriales y notas':'Tutorials and notes','Leer más':'Read more','← Volver al blog':'← Back to blog',
 '¿Tienes una visión? Nosotros tenemos la tecnología. Colaboremos.':'Have a vision? We have the technology. Let\'s collaborate.',
 'Cuéntanos tu proyecto':'Tell us about your project','Nombre':'Name','Correo':'Email','Servicio':'Service','Mensaje':'Message','Enviar mensaje':'Send message',
 'Suscríbete':'Subscribe','Recibe novedades, tutoriales y recursos nuevos en tu correo. Sin spam y puedes darte de baja cuando quieras.':'Get news, tutorials and new resources by email. No spam, unsubscribe anytime.','Suscribirme':'Subscribe me','Ver todas las reseñas':'See all reviews','Déjanos una reseña':'Leave us a review','Transparencia':'Transparency','Agendar consultoría':'Book a consultation','Contáctanos vía correo':'Contact us by email'
};
function applyI18n() {
    document.documentElement.lang = lang;
    const norm = t => t.replace(/\s+/g, ' ').trim();
    document.querySelectorAll('.menu span, #content *, footer *, .skip-link').forEach(el => {
        if (el.children.length || el.closest('[data-no-i18n]') || el.classList.contains('counter')) return;
        const txt = norm(el.textContent); if (!txt) return;
        if (el.dataset.es === undefined) { if (!EN[txt]) return; el.dataset.es = txt; }   // guarda el original
        el.textContent = lang === 'en' ? (EN[el.dataset.es] || el.dataset.es) : el.dataset.es;
    });
    const s = document.getElementById('gt-input-target');
    if (s) s.placeholder = lang === 'en' ? 'Search projects, resources or team...' : 'Buscar proyectos, recursos o equipo...';
    const t = document.getElementById('lang-toggle'); if (t) t.textContent = lang === 'en' ? 'ES' : 'EN';
}

// Consulta Google Places (New) una vez y guarda el resultado 24 h en el navegador para no gastar cuota.
// Nota: Places devuelve como máximo 5 reseñas. Se muestran todas tal cual, con su autor (política de Google).
let _gReviews;
function loadGoogleReviews() {
    if (_gReviews) return _gReviews;
    if (GOOGLE_REVIEWS.placeId.startsWith('TU_') || GOOGLE_REVIEWS.apiKey.startsWith('TU_')) return (_gReviews = Promise.resolve(null));
    try { const c = JSON.parse(localStorage.getItem('gr-cache')); if (c && Date.now() - c.t < 864e5) return (_gReviews = Promise.resolve(c.d)); } catch (e) {}
    return (_gReviews = fetch(`https://places.googleapis.com/v1/places/${GOOGLE_REVIEWS.placeId}?languageCode=es`, {
        headers: { 'X-Goog-Api-Key': GOOGLE_REVIEWS.apiKey, 'X-Goog-FieldMask': 'rating,userRatingCount,googleMapsUri,reviews' }
    }).then(r => r.ok ? r.json() : null).then(p => {
        if (!p) return null;
        const d = { rating: p.rating, count: p.userRatingCount, url: p.googleMapsUri, reviews: (p.reviews || []).map(r => ({
            nombre: r.authorAttribution?.displayName || '', link: r.authorAttribution?.uri || '', foto: r.authorAttribution?.photoUri || '',
            sub: r.relativePublishTimeDescription || '', rating: r.rating, texto: r.text?.text || r.originalText?.text || '' })).filter(r => r.texto) };
        try { localStorage.setItem('gr-cache', JSON.stringify({ t: Date.now(), d })); } catch (e) {}
        return d;
    }).catch(() => null));   // si falla (cuota, clave mal restringida), el sitio sigue sin reseñas
}

// Rellena los "huecos" del Home (insignia, stack, testimonios). Se llama en cada render para respetar el idioma.
function fillSlots() {
    const slot = (id, html) => { const el = document.getElementById(id); if (el) el.innerHTML = html; };
    const month = new Date().toLocaleDateString(lang === 'en' ? 'en-US' : 'es-MX', { month: 'long' });
    slot('avail-slot', AVAILABILITY.open
        ? `<span class="avail-badge open" data-no-i18n><span class="dot"></span>${lang === 'en' ? 'Accepting projects in' : 'Aceptando proyectos en'} ${month}</span>`
        : `<span class="avail-badge" data-no-i18n><span class="dot"></span>${lang === 'en' ? 'Fully booked this month' : 'Agenda llena este mes'}</span>`);
    slot('stack-slot', `<h2 class="section-title">Tecnologías con las que trabajamos</h2>
        <ul class="stack-row">${STACK.map(s => `<li><i class="${s.i}" aria-hidden="true"></i><span>${esc(s.n)}</span></li>`).join('')}</ul>`);
    // --- Testimonios: manuales + reseñas de Google (si están configuradas) ---
    const manual = TESTIMONIOS.filter(t => !t.texto.startsWith('TU_') && !t.nombre.startsWith('TU_'))
        .map(t => ({ nombre:t.nombre, sub:t.rol, texto:t.texto, foto:t.foto, rating:0, link:'' }));
    const stars = n => n ? `<span class="stars" role="img" aria-label="${n} de 5">${'★'.repeat(n)}${'☆'.repeat(5 - n)}</span>` : '';
    const card = t => `<figure class="testi-card"><div>${stars(t.rating)}</div>
        <blockquote>“${esc(t.texto)}”</blockquote>
        <figcaption>${t.foto ? `<img src="${esc(t.foto)}" alt="" width="44" height="44" loading="lazy" referrerpolicy="no-referrer">` : ''}
        <span><b>${t.link ? `<a href="${esc(safeUrl(t.link))}" target="_blank" rel="noopener noreferrer">${esc(t.nombre)}</a>` : esc(t.nombre)}</b><br>${esc(t.sub)}</span></figcaption></figure>`;
    const draw = (items, g) => slot('testi-slot', items.length ? `<h2 class="section-title">Lo que dicen nuestros clientes</h2>
        ${g ? `<p class="g-head" data-no-i18n>Google Maps · <b>${Number(g.rating) || 0}</b> ${stars(Math.round(g.rating))} (${Number(g.count) || 0})</p>` : ''}
        <div class="testi-grid">${items.map(card).join('')}</div>
        ${g ? `<p class="g-links"><a href="${esc(safeUrl(g.url))}" target="_blank" rel="noopener noreferrer">Ver todas las reseñas</a> ·
        <a href="https://search.google.com/local/writereview?placeid=${esc(GOOGLE_REVIEWS.placeId)}" target="_blank" rel="noopener noreferrer">Déjanos una reseña</a></p>` : ''}` : '');
    draw(manual, null);                                              // primero lo manual (instantáneo)
    loadGoogleReviews().then(g => { if (g && g.reviews.length) { draw(g.reviews.concat(manual), g); applyI18n(); } });

    // --- Suscripción: solo se muestra si configuraste SUBSCRIBE.action ---
    slot('sub-slot', SUBSCRIBE.action.includes('TU_') ? '' : `<div class="sub-box">
        <h2>Suscríbete</h2>
        <p>Recibe novedades, tutoriales y recursos nuevos en tu correo. Sin spam y puedes darte de baja cuando quieras.</p>
        <form class="sub-form" action="${esc(SUBSCRIBE.action)}" method="post" target="_blank">
            <input type="email" name="${esc(SUBSCRIBE.field)}" required placeholder="${lang === 'en' ? 'Your email' : 'Tu correo'}" aria-label="Email" autocomplete="email">
            <input type="hidden" name="embed" value="1">
            <button type="submit" class="neon-button">Suscribirme</button>
            <label class="consent"><input type="checkbox" required> Acepto el <a href="#/privacidad">aviso de privacidad</a></label>
        </form>
        <p class="sub-rss"><a href="feed.xml">RSS</a></p></div>`);
}

// Títulos de pestaña por sección (mejora SEO y el historial del navegador).
const TITLES = {
    blog:'Blog y tutoriales | Codetrax',
    privacidad:'Aviso de privacidad | Codetrax',
    terminos:'Términos de uso | Codetrax',
    home:'Codetrax | Desarrollo web, apps y diseño',
    files:'Servicios y equipo | Codetrax',
    plans:'Recursos | Codetrax',
    settings:'Portafolio | Codetrax',
    donar:'Apoya a Codetrax | Donaciones y pagos',
    contacto:'Contacto | Codetrax'
};

/* =====================================================
   MÉTRICAS GLOBALES CON SUPABASE (reemplaza a Sheet.best)
   Por qué: Sheet.best exponía una URL pública con permiso de escritura total. Aquí el navegador solo puede
   LEER la tabla y llamar a una función que suma +1/-1 en el servidor (sin carreras ni valores falsos).
   Pasos: 1) crea un proyecto gratis en supabase.com  2) ejecuta supabase-setup.sql en el SQL Editor
          3) copia Project URL y la clave "anon public" (Settings > API) y pégalas abajo.
   La clave anon es pública por diseño; la seguridad la dan las reglas del SQL.
===================================================== */
const METRICS = { url:'https://TU_PROYECTO.supabase.co', anonKey:'TU_ANON_KEY' };
const metricsReady = () => ENABLE_REMOTE_METRICS && !METRICS.url.includes('TU_') && !METRICS.anonKey.includes('TU_');
const metricsHeaders = () => ({ 'apikey': METRICS.anonKey, 'Authorization': 'Bearer ' + METRICS.anonKey, 'Content-Type': 'application/json' });

/* =====================================================
   INICIALIZACIÓN DEL DOM
===================================================== */
document.addEventListener('DOMContentLoaded', () => {
    loadDataAndSyncCounters().catch(err => console.error("Error al inicializar datos:", err));
    console.log("CodeTrax inicializado correctamente.");
    const mainContent = document.getElementById('content');

    /* =====================================================
       ESTRUCTURAS DE DATOS Y BÚSQUEDA
    ===================================================== */
    const renderSearch = () => `
    <div class="gt-field">
        <div class="search-bar-container">
            <i class="fa-solid fa-magnifying-glass search-icon-left"></i>
            <input type="text" id="gt-input-target" class="search-input" placeholder="Buscar proyectos, recursos o equipo..." aria-label="Buscar">
            <button class="search-btn" type="button">
                <i class="fa-solid fa-filter"></i>
            </button>
        </div>
        <div id="search-results-grid"></div>
    </div>
    `;

    let portfolioProjects = [];
    let recursosProjects = [];
    let blogPosts = [];   // se carga desde data/blog/posts.json 
    let metricsCache = { Portafolio: {}, Recursos: {} };

    /* =====================================================
       CARGA DE ARCHIVOS JSON LOCALES Y SINCRO DE MÉTRICAS
    ===================================================== */
    // Lee los contadores de una tabla ('Portafolio' o 'Recursos') y devuelve { "titulo en minúsculas": {likes, vistas} }
    async function fetchMetrics(tabName) {
        if (!metricsReady()) return {};
        try {
            const res = await fetch(`${METRICS.url}/rest/v1/metricas?tabla=eq.${encodeURIComponent(tabName)}&select=titulo,likes,vistas`, { headers: metricsHeaders() });
            if (!res.ok) return {};
            const map = {};
            (await res.json()).forEach(r => { map[r.titulo.trim().toLowerCase()] = { likes: r.likes || 0, vistas: r.vistas || 0 }; });
            return map;
        } catch (err) {
            console.error('Error leyendo métricas:', err);
            return {};
        }
    }

    async function loadDataAndSyncCounters() {
        try {
            // 1. Cargar datos principales siempre desde los archivos JSON locales
            const [portRes, recRes] = await Promise.all([
                fetch('./data/portafolio/index.json').catch(() => null),
                fetch('./data/recursos/recursos.json').catch(() => null)
            ]);

            portfolioProjects = portRes && portRes.ok ? await portRes.json() : [];
            recursosProjects = recRes && recRes.ok ? await recRes.json() : [];

            // 2. Traer los contadores acumulados desde Supabase
            const [portMetrics, recMetrics] = await Promise.all([
                fetchMetrics('Portafolio'),
                fetchMetrics('Recursos')
            ]);

            metricsCache.Portafolio = portMetrics;
            metricsCache.Recursos = recMetrics;

            window.searchableData = [
                ...portfolioProjects,
                ...recursosProjects,
                { titulo: "Damian Cruz", descripcion: "Fundador | CEO", imagen: "assets/team/Damian.webp", url: "https://codetrax-web.github.io/Presentacion/" },
                { titulo: "Ricardo", descripcion: "Desarrollador Full Stack", imagen: "assets/team/ricardo.webp", url: "#" },
                { titulo: "DynsG", descripcion: "Diseñadora Gráfica", imagen: "assets/team/DynsG.webp", url: "https://youtube.com/@dyns.g-oficial?si=Nhl0NTcDzmamv2s7" },
                { titulo: "Naoko Aki", descripcion: "Diseñadora Gráfica Anime", imagen: "assets/team/Naoko.webp", url: "https://ko-fi.com/naokotan" },
                { titulo: "Tecno 730", descripcion: "Diseñador Multimedia", imagen: "assets/team/tecno.webp", url: "https://linktr.ee/__TECNO730__" },
                { titulo: "Miguel Pandares", descripcion: "Desarrollador Full Stack", imagen: "assets/team/Miguel.webp", url: "https://linktr.ee/migueltime" }
            ];

            renderPortfolio('Todos');
            renderRecursos('Todos'); // necesario si el usuario entra directo a #/plans
            initializeFilters();
        } catch (error) {
            console.error('Error al cargar datos locales/métricas:', error);
        }
    }

    /* =====================================================
       ENVIAR MÉTRICAS (SUPABASE)
    ===================================================== */
    // Suma delta (+1 o -1) a 'likes' o 'vistas' llamando a la función segura del servidor (incrementar_metrica).
    window.sendMetric = async function(project, field, delta, tabName) {
        if (!metricsReady()) return;
        try {
            await fetch(`${METRICS.url}/rest/v1/rpc/incrementar_metrica`, {
                method: 'POST', headers: metricsHeaders(),
                body: JSON.stringify({ p_tabla: tabName, p_titulo: project.titulo, p_campo: field, p_delta: delta })
            });
        } catch (err) {
            console.error('Error enviando métrica:', err);
        }
    };

    /* =====================================================
       RENDERIZADO DE PORTAFOLIO
    ===================================================== */
    function renderPortfolio(category) {
        const grid = document.getElementById('portfolio-grid');
        if (!grid) return;

        let filteredProjects = category !== 'Todos' 
            ? portfolioProjects.filter(project => project.categoria?.toLowerCase() === category.toLowerCase())
            : portfolioProjects;

        if (filteredProjects.length === 0) {
            grid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 40px; background: rgba(0,0,0,0.3); border-radius: 20px; backdrop-filter: blur(10px);">
                    <p style="color: #fff; font-size: 1.2rem;">No hay proyectos disponibles.</p>
                </div>`;
            return;
        }

        grid.innerHTML = filteredProjects.map(project => {
            const uniqueId = `port_${project.titulo.toLowerCase().replace(/\s+/g, '-')}`;
            const keyTitle = project.titulo.trim().toLowerCase();
            const sheetLikeCount = metricsCache.Portafolio[keyTitle]?.likes;

            const savedLikes = sheetLikeCount !== undefined 
                ? sheetLikeCount 
                : (localStorage.getItem(uniqueId) ? parseInt(localStorage.getItem(uniqueId)) : (parseInt(project.likes) || 0));

            const isLiked = localStorage.getItem(`${uniqueId}_liked`) === 'true';

            return `
                <div class="project-card" tabindex="0" role="button" aria-label="Ver detalles de ${esc(project.titulo)}" data-card-id="${uniqueId}" data-title="${esc(project.titulo)}" data-tab="Portafolio">
                    <div class="card-inner">
                        <div class="card-front">
                            <img loading="lazy" width="300" height="180" src="${esc(project.imagen)}" alt="${esc(project.titulo)}">
                            <div class="card-divider"></div>
                            <h3>${esc(project.titulo)}</h3>
                            <p class="card-subtitle">Creador: ${esc(project.creador || 'Desconocido')}</p>
                            <span class="card-category-badge">${esc(project.categoria || 'General')}</span>
                        </div>
                        <div class="card-back">
                            <h3>${esc(project.titulo)}</h3>
                            <p class="card-description-text">${esc(project.descripcion)}</p>
                            <div class="card-back-actions">${cardActions({ url: project.url, label: 'Visita', id: uniqueId, liked: isLiked, likes: savedLikes })}</div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    function initializeFilters() {
        document.querySelectorAll('.filter-btn').forEach(button => {
            if (button.dataset.bound) return;   // evita registrar el mismo listener dos veces
            button.dataset.bound = '1';
            button.addEventListener('click', () => {
                document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                
                const section = document.querySelector('.about-section, .portfolio-page');
                if (section && section.querySelector('#portfolio-grid')) {
                    renderPortfolio(button.dataset.filter);
                } else if (section && section.querySelector('#recursos-container')) {
                    renderRecursos(button.dataset.filter);
                }
            });
        });
    }

    function animateCounters(){
        const counters = document.querySelectorAll(".counter");
        counters.forEach(counter => {
            const target = +counter.dataset.target;
            let current = 0;
            const increment = Math.max(1, Math.ceil(target / 100));
            const update = () => {
                current += increment;
                if (current >= target) {
                    counter.textContent = target;
                    return;
                }
                counter.textContent = current;
                requestAnimationFrame(update);
            }
            update();
        });
    }

    /* =====================================================
       LÓGICA DE BÚSQUEDA
    ===================================================== */
    document.addEventListener('input', (e) => {
        if (e.target.id === 'gt-input-target') {
            const term = e.target.value.toLowerCase().trim();
            const resultsGrid = document.getElementById('search-results-grid');

            if (!term || !window.searchableData) { 
                if (resultsGrid) resultsGrid.innerHTML = ''; 
                return; 
            }

            const activeMenuLink = document.querySelector('.menu a.active');
            const currentSection = activeMenuLink ? activeMenuLink.getAttribute('data-section') : 'home';

            let dataSource = window.searchableData;

            if (currentSection === 'plans') {
                dataSource = recursosProjects;
            } else if (currentSection === 'settings') {
                dataSource = portfolioProjects;
            }

            const filtered = dataSource.filter(p => 
                (p.titulo && p.titulo.toLowerCase().includes(term)) || 
                (p.descripcion && p.descripcion.toLowerCase().includes(term)) ||
                (p.categoria && p.categoria.toLowerCase().includes(term))
            );

            if (filtered.length === 0) {
                resultsGrid.innerHTML = `
                    <div style="grid-column: 1/-1; text-align: center; padding: 20px; background: rgba(0,0,0,0.3); border-radius: 15px;">
                        <p style="color: #fff;">No se encontró nada relacionado con "${esc(term)}" en este apartado.</p>
                    </div>`;
                return;
            }

            resultsGrid.innerHTML = filtered.map(p => `
                <div class="project-card">
                    <div class="card-inner">
                        <div class="card-front">
                            <img loading="lazy" width="300" height="180" src="${esc(p.imagen)}" alt="${esc(p.titulo)}">
                            <div class="card-divider"></div>
                            <h3>${esc(p.titulo)}</h3>
                            <p class="card-subtitle">${esc(p.creador || p.descripcion || '')}</p>
                            <span class="card-category-badge">${esc(p.categoria || 'General')}</span>
                        </div>
                        <div class="card-back">
                            <h3>${esc(p.titulo)}</h3>
                            <p class="card-description-text">${esc(p.descripcion || 'Sin descripción disponible.')}</p>
                            <div class="card-back-actions">
                                <a href="${esc(safeUrl(p.url))}" target="_blank" rel="noopener noreferrer" class="project-link" style="text-decoration: none; width: 100%;">
                                    <button class="button" style="width: 100%;">
                                        <div class="blob1"></div>
                                        <div class="blob2"></div>
                                        <div class="inner" style="padding: 8px 18px; font-size: 0.85rem; text-align: center;">VER</div>
                                    </button>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            `).join('');
        }
    });

    document.addEventListener('click', (e) => {
        const searchBtn = e.target.closest('.search-btn');
        if (!searchBtn) return;
        const inputTarget = document.getElementById('gt-input-target');
        if (inputTarget) inputTarget.focus();
    });

    /* =====================================================
       GESTIÓN DE VISTAS
    ===================================================== */
    const views = { 
         // --- HOME ---
home: `
    <section class="about-section">
        <!-- Texto real "CODETRAX": los buscadores y lectores de pantalla no entienden letras Unicode decorativas -->
        <h1 class="about-title"><span aria-hidden="true">✧.*</span> CODETRAX <span aria-hidden="true">✧.*</span></h1>
        <br>
        <div id="avail-slot" class="avail-slot"></div>
        <h2>Donde la tecnología encuentra su identidad.</h2>
        <p>
            Somos un equipo multidisciplinario que fusiona creatividad, ingeniería y estrategia 
            para convertir ideas complejas en experiencias digitales de alto impacto.
        </p>
        <br>
        ${renderSearch()} <!-- (se eliminó un id duplicado que ya viene dentro de renderSearch) -->
        <div class="social-container">
            <!-- CTA principal: ahora es un enlace clicable hacia Contacto -->
            <a href="#/contacto" class="neon-button">Inicia tu proyecto</a>
        </div>
    </section>
    <section class="services-section" aria-labelledby="srv-title">
        <h2 id="srv-title" class="section-title">Qué hacemos</h2>
        <div class="services-grid">
            ${SERVICES.map(s => `<article class="service-card"><i class="fa-solid ${s.i}" aria-hidden="true"></i><h3>${s.t}</h3><p>${s.d}</p></article>`).join('')}
        </div>
    </section>
    <section class="stack-section" id="stack-slot"></section>
    <section class="testi-section" id="testi-slot"></section>
    <section class="sub-section" id="sub-slot"></section>
    <section class="stats-section">
        <div class="stat-card">
            <h2 class="counter" data-target="9">0</h2> <!-- Actualiza este número al agregar proyectos reales -->
            <p>Proyectos Ejecutados</p>
        </div>
        <div class="stat-card">
            <h2 class="counter" data-target="6">0</h2>
            <p>Expertos en Equipo</p>
        </div>
        <div class="stat-card">
            <h2>2020</h2> <!-- Año fijo: no se anima de 0 a 2020 -->
            <p>Año de Fundación</p>
        </div>
        <div class="stat-card">
            <h2 class="counter" data-target="5">0</h2>
            <p>Áreas de Servicio</p>
        </div>
    </section>
`,

// --- FILES (SOBRE NOSOTROS) ---
files: `
    <section class="about-section">
        <h1 class="about-title">『 SOBRE 』</h1>
        
        <div class="about-card">
            <h2>01 // ¿Qué es CodeTrax?</h2>
            <p>CodeTrax es una agencia de desarrollo digital integral. Transformamos conceptos en realidades tecnológicas mediante la sinergia de programación, diseño de interfaz, automatización inteligente y producción multimedia. No nos limitamos a un solo servicio; construimos ecosistemas digitales completos y personalizados adaptados al ADN de tu marca.</p>
        </div>

        <div class="about-card">
            <h2>02 // Servicios Estratégicos</h2>
            <p>✧ <b>Desarrollo:</b> Web, aplicaciones, sistemas a medida, automatización de procesos y optimización de infraestructura de código.</p>
            <p>✧ <b>Diseño:</b> Identidad visual, branding, interfaces (UI/UX), activos gráficos y material publicitario de alto impacto.</p>
            <p>✧ <b>Multimedia:</b> Diseño sonoro, composición musical, edición de video y producción de contenido para plataformas digitales.</p>
            <p>✧ <b>Videojuegos:</b> Creación de herramientas técnicas, mods y recursos gráficos especializados para la industria gaming.</p>
            <p>✧ <b>Consultoría:</b> Acompañamiento integral, desde la conceptualización técnica hasta el despliegue final del producto.</p>
        </div>

        <div class="about-card">
            <h2>03 // Nuestra Filosofía</h2>
            <p><b>Misión:</b> Desarrollar soluciones digitales escalables que aporten valor real. Creamos tecnología funcional y estéticamente impecable, diseñada para evolucionar.</p>
            <p><b>Valores:</b> Innovación constante, compromiso total con la calidad, enfoque en el usuario y aprendizaje tecnológico continuo.</p>
        </div>

        <div class="about-card">
            <h2>04 // Metodología de Trabajo</h2>
            <p>Nuestros proyectos se ejecutan bajo un flujo de trabajo ágil:</p>
            <p>1. <b>Discovery:</b> Escuchamos y analizamos tus necesidades reales.</p>
            <p>2. <b>Planificación:</b> Diseñamos la arquitectura técnica y visual del proyecto.</p>
            <p>3. <b>Desarrollo:</b> Implementamos soluciones con estándares de código limpio.</p>
            <p>4. <b>Entrega y Soporte:</b> Desplegamos el producto final con acompañamiento constante.</p>
        </div>
        
        <div class="about-card">
            <h2>05 // Infraestructura [Equipo]</h2>
            <div class="team-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px;">
                <!-- Tarjetas del equipo (Mantén tus clases, estructura optimizada) -->
               
      <div class="card red">
            <img src="assets/team/Damian.webp" alt="Foto de Damian Cruz" loading="lazy" class="team-photo">
            <h2>Damian Cruz</h2>
            <div class="profile-tag">Fundador | CEO</div>
            <p>────── ·𖥸· ──────</p>
      <div class="social-links" style="margin-top: 10px; display: flex; justify-content: center; gap: 15px;">
            <a href="https://www.instagram.com/damia_ncv" target="_blank" rel="noopener noreferrer" aria-label="Instagram" style="color:white; font-size: 1.2rem;"><i class="fab fa-instagram"></i></a>
            <a href="https://github.com/Codetrax-web" target="_blank" rel="noopener noreferrer" aria-label="Github" style="color:white; font-size: 1.2rem;"><i class="fab fa-github"></i></a>
            <a href="https://www.tiktok.com/@damian_cdx?is_from_webapp=1&sender_device=pc" target="_blank" rel="noopener noreferrer" aria-label="Tiktok" style="color:white; font-size: 1.2rem;"><i class="fab fa-tiktok"></i></a>
            <a href="https://discord.com/invite/rsAwuCg6xK" target="_blank" rel="noopener noreferrer" aria-label="Discord" style="color:white; font-size: 1.2rem;"><i class="fab fa-discord"></i></a>
            <a href="https://www.youtube.com/@DAMIANCDX" target="_blank" rel="noopener noreferrer" aria-label="Youtube" style="color:white;"><i class="fab fa-youtube"></i></a>
      </div>
      </div>

      <div class="card yellow">
            <img src="assets/team/ricardo.webp" alt="Foto de Ricardo" loading="lazy" class="team-photo">
            <h2>Ricardo</h2>
            <div class="profile-tag">Desarrollador Full Stack</div>
            <p>────── ·𖥸· ──────</p>
      <div class="social-links" style="margin-top: 15px; display: flex; justify-content: center; gap: 15px; font-size: 1.2rem;">

      </div>
      </div>

      <div class="card green">
            <img src="assets/team/Miguel.webp" alt="Foto de Miguel Pandares" loading="lazy" class="team-photo">
            <h2>Miguel Pandares</h2>
            <div class="profile-tag">Desarrollador Full Stack</div>
            <p>────── ·𖥸· ──────</p>
      <div class="social-links" style="margin-top: 15px; display: flex; justify-content: center; gap: 15px; font-size: 1.2rem;">
            <a href="https://github.com/MiguelTime" target="_blank" rel="noopener noreferrer" aria-label="Github" style="color:white;"><i class="fab fa-github"></i></a>
            <a href="https://www.tiktok.com/@migueltime_yt?is_from_webapp=1&sender_device=pc" target="_blank" rel="noopener noreferrer" aria-label="Tiktok" style="color:white;"><i class="fab fa-tiktok"></i></a>
            <a href="https://www.instagram.com/migueltime_yt/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" style="color:white;"><i class="fab fa-instagram"></i></a>
            <a href="https://discord.com/invite/SFffG38VFb" target="_blank" rel="noopener noreferrer" aria-label="Discord" style="color:white;"><i class="fab fa-discord"></i></a>
            <a href="https://www.twitch.tv/migueltime" target="_blank" rel="noopener noreferrer" aria-label="Twitch" style="color:white;"><i class="fab fa-twitch"></i></a>
            <a href="https://www.youtube.com/channel/UC4UWTtlSDu8YyiQtpVXQ7LA" target="_blank" rel="noopener noreferrer" aria-label="Youtube" style="color:white;"><i class="fab fa-youtube"></i></a>

      </div>
      </div>

      <div class="card purple">
            <img src="assets/team/DynsG.webp" alt="Foto de DynsG" loading="lazy" class="team-photo">
            <h2>DynsG</h2>
            <div class="profile-tag">Diseñadora Gráfica</div>
            <p>────── ·𖥸· ──────</p>
      <div class="social-links" style="margin-top: 15px; display: flex; justify-content: center; gap: 15px; font-size: 1.2rem;">
            <a href="https://x.com/AltamarDyn3634" target="_blank" rel="noopener noreferrer" aria-label="Twitter" style="color:white;"><i class="fab fa-twitter"></i></a>
            <a href="https://www.youtube.com/@Dyns.g-Oficial/videos" target="_blank" rel="noopener noreferrer" aria-label="Youtube" style="color:white;"><i class="fab fa-youtube"></i></a>

      </div>
      </div>

      <div class="card orange">
            <img src="assets/team/Naoko.webp" alt="Foto de Naoko Aki" loading="lazy" class="team-photo">
            <h2>Naoko Aki</h2>
            <div class="profile-tag">Diseñadora Gráfica Anime</div>
            <p>────── ·𖥸· ──────</p>
      <div class="social-links" style="margin-top: 15px; display: flex; justify-content: center; gap: 15px; font-size: 1.2rem;">
            <a href="https://ko-fi.com/naokotan" target="_blank" rel="noopener noreferrer" aria-label="Ko-fi de Naoko Aki" style="color:white;"><i class="fas fa-globe"></i></a>

      </div>
      </div>

      <div class="card blue">
            <img src="assets/team/tecno.webp" alt="Foto de Tecno 730" loading="lazy" class="team-photo">
            <h2>Tecno 730</h2>
            <div class="profile-tag">Diseñador Multimedia</div>
            <p>────── ·𖥸· ──────</p>
      <div class="social-links" style="margin-top: 15px; display: flex; justify-content: center; gap: 15px; font-size: 1.2rem;">
            <a href="https://www.tiktok.com/@tecno_730?is_from_webapp=1&sender_device=pc" target="_blank" rel="noopener noreferrer" aria-label="Tiktok" style="color:white;"><i class="fab fa-tiktok"></i></a>
            <a href="https://www.instagram.com/tecno_730/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" style="color:white;"><i class="fab fa-instagram"></i></a>
            <a href="https://discord.gg/tbUVxyGU" target="_blank" rel="noopener noreferrer" aria-label="Discord" style="color:white;"><i class="fab fa-discord"></i></a>
            <a href="https://www.twitch.tv/tecno730" target="_blank" rel="noopener noreferrer" aria-label="Twitch" style="color:white;"><i class="fab fa-twitch"></i></a>
            <a href="https://www.youtube.com/@TECNO730" target="_blank" rel="noopener noreferrer" aria-label="Youtube" style="color:white;"><i class="fab fa-youtube"></i></a>
                    
      </div>
      </div>
                <!-- (Aplica la misma limpieza visual al resto de las tarjetas del equipo) -->
      </div>
      </div>
    </section>
`,

// --- PLANS (RECURSOS) ---
plans: `
    <div class="portfolio-page">
        <h1>『 RECURSOS 』</h1>
        <p>Explora nuestra biblioteca de aplicaciones, herramientas y proyectos open-source. Diseñados por CodeTrax para potenciar tu flujo de trabajo o tu propio desarrollo técnico.</p>
        <div class="portfolio-filters">
            <button class="filter-btn active" data-filter="Todos">Todos</button>
            <button class="filter-btn" data-filter="Código">Código</button>
            <button class="filter-btn" data-filter="Robótica">Robótica</button>
        </div>
        <div id="recursos-container"></div>
    </div>
`,

// --- SETTINGS (PORTAFOLIO) ---
settings: `
    <section class="about-section">
        <h1 class="about-title">『 PORTAFOLIO 』</h1>
        <p>Una selección curada de trabajos desarrollados por CodeTrax. Cada proyecto es testimonio de nuestra pasión por la programación, el diseño funcional y la innovación técnica.</p>
        <div class="portfolio-filters">
            <button class="filter-btn active" data-filter="Todos">Todos</button>
            <!-- Filtros por tipo de servicio (lo que busca un cliente) -->
            <button class="filter-btn" data-filter="Web">Web</button>
            <button class="filter-btn" data-filter="Branding">Branding</button>
            <button class="filter-btn" data-filter="Robótica">Robótica</button>
            <button class="filter-btn" data-filter="Multimedia">Multimedia</button>
        </div>
        <div id="portfolio-grid"></div>
    </section>
`,

// --- DONAR / PAGOS ---
donar: `
    <section class="about-section">
        <h1 class="about-title">『 APOYA 』</h1>
        <p style="text-align:center">Codetrax crea recursos y proyectos abiertos para la comunidad. Si te sirvieron, tu apoyo nos ayuda a seguir publicando.</p>
        <!-- MONTO LIBRE: la persona decide cuánto aportar. El enlace de PayPal se actualiza solo con lo que escriba. -->
        <div class="amount-box">
            <label for="amount-input">Tú decides cuánto aportar</label>
            <div class="amount-row">
                <input id="amount-input" type="number" inputmode="decimal" min="1" max="100000" step="any" placeholder="Escribe tu monto">
                <select id="amount-cur" aria-label="Moneda"><option>MXN</option><option>USD</option><option>EUR</option></select>
            </div>
            <!-- Atajos opcionales: solo llenan el campo -->
            ${MONTOS.length ? `<div class="amount-chips" role="group" aria-label="Atajos de monto">
                ${MONTOS.map(m => `<button type="button" class="chip" data-amount="${m}">${m}</button>`).join('')}
            </div>` : ''}
            <p id="amount-summary" aria-live="polite">Cualquier cantidad nos ayuda. También puedes elegir el monto directamente en la página de pago.</p>
        </div>
        <div class="donate-grid">${donateMethods()}</div>
        <div class="about-card donate-note">
            <h2>Transparencia</h2>
            <p>Las donaciones son voluntarias y no son reembolsables. Se usan para hosting, dominio, herramientas y tiempo de desarrollo.</p>
            <p>¿Eres cliente y vas a pagar un anticipo o proyecto? Escríbenos primero en <a href="#/contacto">Contacto</a> para enviarte tu cotización y datos de pago.</p>
        </div>
    </section>
`,

// --- BLOG --- (función: recibe el slug de #/blog/<slug>; sin slug muestra el listado)
blog: (slug) => {
    const p = blogPosts.find(x => x.slug === slug);
    if (slug) return p ? `
        <article class="about-section post">
            <a href="#/blog" class="post-back">← Volver al blog</a>
            <h1>${esc(p.titulo)}</h1>
            <p class="post-meta">${esc(p.fecha)} · ${(p.tags || []).map(esc).join(', ')}</p>
            <div class="post-body">${p.contenido}</div>
            <div id="sub-slot" class="sub-section"></div>   <!-- HTML propio (data/blog/posts.json), por eso no se escapa -->
        </article>` : `<section class="about-section"><p>No encontramos ese artículo. <a href="#/blog">Volver al blog</a></p></section>`;
    return `<section class="about-section"><h1 class="about-title">『 BLOG 』</h1>
        <p style="text-align:center">Tutoriales y notas</p>
        <div class="post-list">${blogPosts.map(x => `
            <a class="post-card" href="#/blog/${esc(x.slug)}">
                <h3>${esc(x.titulo)}</h3><p>${esc(x.resumen)}</p>
                <span class="donate-cta">Leer más</span></a>`).join('') || '<p style="text-align:center">Próximamente.</p>'}</div>
        <div id="sub-slot" class="sub-section"></div></section>`;
},

// --- AVISO DE PRIVACIDAD --- (plantilla general; revísala con un abogado antes de depender de ella)
privacidad: `
    <section class="about-section">
        <h1 class="about-title">『 PRIVACIDAD 』</h1>
        <div class="about-card legal">
            <h2>Responsable</h2><p>Codetrax (contacto: codetraxs@gmail.com) es responsable del tratamiento de tus datos personales.</p>
            <h2>Datos que recabamos</h2><p>Nombre, correo y mensaje cuando usas el formulario de contacto o nos escribes. De forma anónima y sin cookies, estadísticas de visita (páginas vistas, país, dispositivo). En tu navegador guardamos localmente tu idioma y los "likes" que das.</p>
            <h2>Finalidad</h2><p>Responder tus solicitudes, enviarte cotizaciones y mejorar el sitio. No vendemos tus datos.</p>
            <h2>Terceros que intervienen</h2><p>Formspree (envío del formulario), Google (reseñas mostradas con Places API), el servicio de newsletter (suscripciones por correo; puedes darte de baja en cualquier mensaje), Umami (analítica sin cookies), Google Calendar (agenda de reuniones), Google Maps (reseñas), el asistente virtual (si está activo, tus mensajes se procesan mediante Cloudflare y la API de Anthropic; no escribas datos sensibles), WhatsApp y PayPal (donativos). Cada uno tiene su propio aviso de privacidad.</p>
            <h2>Tus derechos</h2><p>Puedes acceder, rectificar, cancelar u oponerte al tratamiento de tus datos (derechos ARCO) escribiéndonos al correo indicado.</p>
            <h2>Cambios</h2><p>Publicaremos aquí cualquier actualización. Última actualización: octubre de 2026.</p>
        </div>
    </section>
`,

// --- TÉRMINOS DE USO ---
terminos: `
    <section class="about-section">
        <h1 class="about-title">『 TÉRMINOS 』</h1>
        <div class="about-card legal">
            <h2>Uso del sitio</h2><p>Al navegar este sitio aceptas estos términos. El contenido es informativo y puede cambiar sin previo aviso.</p>
            <h2>Propiedad intelectual</h2><p>Los proyectos, textos, imágenes y marcas pertenecen a Codetrax o a sus autores. Los recursos descargables se ofrecen para uso personal y educativo; pregúntanos antes de redistribuirlos o usarlos comercialmente.</p>
            <h2>Sin garantías</h2><p>Los recursos y tutoriales se entregan "tal cual". Úsalos bajo tu propia responsabilidad, sobre todo los proyectos de electrónica.</p>
            <h2>Donativos</h2><p>Son voluntarios, no reembolsables y no constituyen la compra de un servicio.</p>
            <h2>Servicios</h2><p>La contratación de proyectos se formaliza por separado mediante una cotización o contrato.</p>
            <h2>Enlaces externos</h2><p>No controlamos ni somos responsables del contenido de sitios de terceros enlazados aquí.</p>
        </div>
    </section>
`,

// --- Contacto ---
contacto: `
    <section class="about-section">
        <h1 class="about-title">『 CONTACTO 』</h1>
        <p style="text-align: center;">¿Tienes una visión? Nosotros tenemos la tecnología. Colaboremos.</p>
        <div style="display: flex; justify-content: center; align-items: center; width: 100%; margin-top: 20px;">
            <div class="contact-hub">
                <div class="socials">
                    <a href="https://www.instagram.com/cod_etrax" target="_blank" rel="noopener noreferrer" aria-label="Instagram" title="Instagram"><i class="fa-brands fa-instagram"></i></a>
                    <a href="https://www.threads.net/@cod_etrax" target="_blank" rel="noopener noreferrer" aria-label="At" title="Threads"><i class="fa-solid fa-at fa-threads-symbol"></i></a>
                    <a href="https://www.youtube.com/@DAMIANCDX" target="_blank" rel="noopener noreferrer" aria-label="Youtube" title="YouTube"><i class="fa-brands fa-youtube"></i></a>
                    <a href="https://www.tiktok.com/@damian_cdx" target="_blank" rel="noopener noreferrer" aria-label="Tiktok" title="TikTok"><i class="fa-brands fa-tiktok"></i></a>
                    <a href="https://x.com/Code_trax" target="_blank" rel="noopener noreferrer" aria-label="Twitter" title="X"><i class="fa-brands fa-twitter"></i></a>
                </div>
                <div class="action-btns">
                    <a href="https://calendar.app.google/7iAyjJockVxnrkot9" target="_blank" rel="noopener noreferrer" class="action-btn">
                        <i class="fa-solid fa-video main-icon" style="color: #00ff5e;"></i>
                        <div class="btn-content">
                            <span class="btn-title">Google Meet</span>
                            <span class="btn-desc">Agendar consultoría</span>
                        </div>
                        <i class="fa-solid fa-chevron-right arrow-icon"></i>
                    </a>
                    <!-- Zoom retirado: duplicaba a Google Meet. Un solo agendador evita confusión -->
                    <a href="mailto:codetraxs@gmail.com?subject=Propuesta%20de%20Proyecto" class="action-btn">
                        <i class="fa-solid fa-envelope main-icon" style="color: #F00000;"></i>
                        <div class="btn-content">
                            <span class="btn-title">Email Directo</span>
                            <span class="btn-desc">Contáctanos vía correo</span>
                        </div>
                        <i class="fa-solid fa-chevron-right arrow-icon"></i>
                    </a>
                </div>
            </div>
        </div>
        <!-- Formulario de contacto. Crea un form gratis en formspree.io y pega tu ID en TU_ID_FORMSPREE -->
        <form class="contact-form" action="https://formspree.io/f/xeewykke" method="POST">
            <!-- Después de enviar, Formspree regresa aquí y se muestra la confirmación (ruta #/contacto/enviado) -->
            <input type="hidden" name="_next" value="https://codetrax-web.github.io/codetrax/#/contacto/enviado">
            <h2>Cuéntanos tu proyecto</h2>
            <label for="cf-nombre">Nombre</label>
            <input id="cf-nombre" name="nombre" type="text" required autocomplete="name">
            <label for="cf-correo">Correo</label>
            <input id="cf-correo" name="email" type="email" required autocomplete="email">
            <label for="cf-servicio">Servicio</label>
            <select id="cf-servicio" name="servicio">
                <option>Desarrollo web / app</option><option>Diseño y branding</option>
                <option>Multimedia</option><option>Videojuegos</option><option>Consultoría</option>
            </select>
            <label for="cf-msg">Mensaje</label>
            <textarea id="cf-msg" name="mensaje" rows="4" required></textarea>
            <input type="text" name="_gotcha" tabindex="-1" autocomplete="off" style="display:none" aria-hidden="true"> <!-- honeypot: los bots lo llenan, las personas no -->
            <label class="consent"><input type="checkbox" required> Acepto el <a href="#/privacidad">aviso de privacidad</a></label>
            <button type="submit" class="neon-button">Enviar mensaje</button>
        </form>
        <!-- Botón flotante de WhatsApp: cambia 521XXXXXXXXXX por tu número con lada (52 + 1 + 10 dígitos) -->
        <a class="whatsapp-float" href="https://wa.me/521XXXXXXXXXX?text=Hola%20Codetrax%2C%20quiero%20cotizar%20un%20proyecto" target="_blank" rel="noopener noreferrer" aria-label="Escribir por WhatsApp"><i class="fa-brands fa-whatsapp" aria-hidden="true"></i></a>
    </section>
`
    };

    /* =====================================================
       LÓGICA DE RECURSOS
    ===================================================== */
    function renderRecursos(category) {
        const container = document.getElementById('recursos-container');
        if (!container) return;

        let filteredRecursos = category !== 'Todos' 
            ? recursosProjects.filter(item => item.categoria?.toLowerCase() === category.toLowerCase())
            : recursosProjects;

        if (filteredRecursos.length === 0) {
            container.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 40px; background: rgba(0,0,0,0.3); border-radius: 20px; backdrop-filter: blur(10px);">
                    <p style="color: #fff; font-size: 1.2rem;">No hay recursos disponibles.</p>
                </div>`;
            return;
        }

        container.innerHTML = filteredRecursos.map(item => {
            const uniqueId = `rec_${item.titulo.toLowerCase().replace(/\s+/g, '-')}`;
            const keyTitle = item.titulo.trim().toLowerCase();
            const sheetLikeCount = metricsCache.Recursos[keyTitle]?.likes;

            const savedLikes = sheetLikeCount !== undefined 
                ? sheetLikeCount 
                : (localStorage.getItem(uniqueId) ? parseInt(localStorage.getItem(uniqueId)) : (parseInt(item.likes) || 0));

            const isLiked = localStorage.getItem(`${uniqueId}_liked`) === 'true';

            return `
                <div class="project-card" tabindex="0" role="button" aria-label="Ver detalles de ${esc(item.titulo)}" data-card-id="${uniqueId}" data-title="${esc(item.titulo)}" data-tab="Recursos">
                    <div class="card-inner">
                        <div class="card-front">
                            <img loading="lazy" width="300" height="180" src="${esc(item.imagen)}" alt="${esc(item.titulo)}">
                            <div class="card-divider"></div>
                            <h3>${esc(item.titulo)}</h3>
                            <p class="card-subtitle">Creador: ${esc(item.creador || 'Desconocido')}</p>
                            <span class="card-category-badge">${esc(item.categoria || 'General')}</span>
                        </div>
                        <div class="card-back">
                            <h3>${esc(item.titulo)}</h3>
                            <p class="card-description-text">${esc(item.descripcion)}</p>
                            <div class="card-back-actions">${cardActions({ url: item.url, download: item.descarga, label: 'Probar', id: uniqueId, liked: isLiked, likes: savedLikes, allowDownload: true })}</div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    /* =====================================================
       INICIALIZACIÓN Y NAVEGACIÓN
    ===================================================== */
    /* Enrutador por hash: #/files, #/plans, #/settings, #/contacto.
       Cada sección tiene URL propia, funciona el botón "atrás" y se puede compartir un enlace directo. */
    const ROUTES = ['home','files','plans','settings','donar','contacto','blog','privacidad','terminos'];
    function navigate() {
        const [wanted, slug] = location.hash.replace('#/','').split('/');   // #/blog/mi-post -> blog + slug
        const key = ROUTES.includes(wanted) ? wanted : 'home';      // ruta desconocida -> home
        document.querySelectorAll('.menu a').forEach(l => {          // marca el enlace activo
            const on = l.dataset.section === key;
            l.classList.toggle('active', on);
            on ? l.setAttribute('aria-current','page') : l.removeAttribute('aria-current');
        });
        mainContent.innerHTML = typeof views[key] === 'function' ? views[key](slug) : views[key];
        fillSlots(); applyI18n(); track('vista-' + key);
        // Confirmación después de enviar el formulario de contacto
        if (key === 'contacto' && slug === 'enviado') {
            mainContent.insertAdjacentHTML('afterbegin', `<div class="confirm-card" role="status">
                <i class="fa-solid fa-circle-check" aria-hidden="true"></i>
                <div><b>${lang === 'en' ? 'Message sent!' : '¡Mensaje enviado!'}</b>
                <p>${lang === 'en' ? 'Thanks for writing. We will reply to your email within 24 hours.' : 'Gracias por escribirnos. Te responderemos a tu correo en un plazo de 24 horas.'}</p></div></div>`);
        }   // huecos dinámicos, idioma y analítica
        document.title = TITLES[key];
        // Animación de entrada de la sección: se quita y se vuelve a poner la clase para reiniciar la animación CSS
        mainContent.classList.remove('view-enter'); void mainContent.offsetWidth; mainContent.classList.add('view-enter');
        if (key === 'home') setTimeout(animateCounters, 100);
        if (key === 'plans') { renderRecursos('Todos'); initializeFilters(); }
        if (key === 'settings') { renderPortfolio('Todos'); initializeFilters(); }
        window.scrollTo({ top: 0 });
    }
    // Carga los artículos del blog; si el usuario ya está en #/blog, vuelve a pintar cuando lleguen
    fetch('./data/blog/posts.json').then(r => r.ok ? r.json() : []).catch(() => []).then(d => {
        blogPosts = d; if (location.hash.startsWith('#/blog')) navigate();
    });
    document.getElementById('lang-toggle')?.addEventListener('click', () => {   // selector ES/EN
        lang = lang === 'en' ? 'es' : 'en'; localStorage.setItem('lang', lang); navigate();
    });
    window.addEventListener('hashchange', navigate);
    navigate();  // pinta la sección inicial según la URL

    // Búsqueda auxiliar de objeto por título
    window.findProjectByTitle = function(title, tabName) {
        const list = tabName === 'Recursos' ? recursosProjects : portfolioProjects;
        return list.find(p => p.titulo && p.titulo.toLowerCase() === title.toLowerCase()) || { titulo: title };
    };
});

/* =====================================================
   CONTROLADOR DE LIKES (ENVÍA +1 / -1 AL SERVIDOR)
===================================================== */
document.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn-like');
    if (!btn) return;

    e.stopPropagation();

    const host = btn.closest('.project-card, #card-modal');   // tarjeta o ventana ampliada
    const id = btn.dataset.id;
    const projectTitle = host ? host.dataset.title : null;
    const tabName = host ? (host.dataset.tab || 'Portafolio') : 'Portafolio';

    const countSpan = btn.querySelector('.like-count');
    let currentLikes = parseInt(countSpan.textContent) || 0;
    
    const likedKey = `${id}_liked`;
    const isAlreadyLiked = localStorage.getItem(likedKey) === 'true';

    if (!isAlreadyLiked) {
        currentLikes++;
        localStorage.setItem(likedKey, 'true');
        btn.classList.add('liked');
    } else {
        currentLikes = Math.max(0, currentLikes - 1);
        localStorage.setItem(likedKey, 'false');
        btn.classList.remove('liked');
    }

    btn.setAttribute('aria-pressed', btn.classList.contains('liked'));   // accesibilidad: estado del botón
    localStorage.setItem(id, currentLikes);
    countSpan.textContent = currentLikes;

    if (projectTitle) {
        const project = window.findProjectByTitle(projectTitle, tabName);
        window.sendMetric(project, 'likes', isAlreadyLiked ? -1 : 1, tabName);   // +1 al dar like, -1 al quitarlo
    }
});

/* =====================================================
   CONTROLADOR DE CLICS EN "VER" / "VISITA" (REGISTRA VISTAS)
===================================================== */
document.addEventListener('click', (e) => {
    const link = e.target.closest('.project-link');
    if (!link) return;

    const host = link.closest('.project-card, #card-modal');   // tarjeta o ventana ampliada
    if (!host) return;

    const projectTitle = host.dataset.title;
    const tabName = host.dataset.tab || 'Portafolio';

    if (projectTitle) {
        let currentViews = parseInt(localStorage.getItem(`views_${projectTitle}`)) || 0;
        currentViews++;
        localStorage.setItem(`views_${projectTitle}`, currentViews);

        const project = window.findProjectByTitle(projectTitle, tabName);
        window.sendMetric(project, 'vistas', 1, tabName);   // cada clic suma una vista
    }
});

/* =====================================================
   VENTANA AMPLIADA DE TARJETAS (reemplaza el giro)
   Al tocar una tarjeta se abre centrada con la información completa.
   El contenido sale del reverso oculto de la propia tarjeta, así no se duplican los datos.
   Cierra con la ✕, tocando fuera o con Esc. El foco se queda dentro mientras está abierta.
===================================================== */
let cmLastFocus = null;
const cm = document.createElement('div');
cm.id = 'card-modal';
cm.hidden = true;
cm.innerHTML = `<div class="cm-panel" role="dialog" aria-modal="true" aria-labelledby="cm-title">
    <button type="button" class="cm-close" aria-label="Cerrar"><i class="fa-solid fa-xmark" aria-hidden="true"></i></button>
    <div class="cm-body"></div>
</div>`;
document.body.appendChild(cm);

function openCardModal(card) {
    const front = card.querySelector('.card-front');
    const back = card.querySelector('.card-back');
    if (!front || !back) return;
    cmLastFocus = document.activeElement;
    // La ventana guarda el proyecto y la pestaña, para que likes y vistas se registren igual que en la tarjeta
    cm.dataset.title = card.dataset.title || '';
    cm.dataset.tab = card.dataset.tab || (location.hash.startsWith('#/plans') ? 'Recursos' : 'Portafolio');
    const img = front.querySelector('img');
    const title = front.querySelector('h3');
    const sub = front.querySelector('.card-subtitle');
    const badge = front.querySelector('.card-category-badge');
    const tmp = document.createElement('div');
    tmp.innerHTML = back.innerHTML;
    tmp.querySelector('h3')?.remove();                     // el título ya va arriba
    cm.querySelector('.cm-body').innerHTML = `
        <div class="cm-media">${img ? img.outerHTML : ''}</div>
        <div class="cm-info">
            <h2 id="cm-title" class="cm-title">${esc(title ? title.textContent : '')}</h2>
            ${sub ? sub.outerHTML : ''}
            ${badge ? badge.outerHTML : ''}
            <div class="cm-desc">${tmp.innerHTML}</div>
        </div>`;
    cm.hidden = false;
    document.body.classList.add('modal-open');
    cm.querySelector('.cm-close').focus();
}

function closeCardModal() {
    if (cm.hidden) return;
    cm.hidden = true;
    document.body.classList.remove('modal-open');
    cm.querySelector('.cm-body').innerHTML = '';           // libera el contenido copiado
    cm.dataset.title = ''; cm.dataset.tab = '';
    cmLastFocus?.focus?.();                                // devuelve el foco a la tarjeta
}

// Clic en el fondo o en la ✕ cierra la ventana
cm.addEventListener('click', e => {
    if (e.target === cm || e.target.closest('.cm-close')) closeCardModal();
});

// Abrir: clic en cualquier parte de la tarjeta (menos los botones de like y enlaces)
document.addEventListener('click', e => {
    if (e.target.closest('#card-modal')) return;
    if (e.target.closest('.btn-like') || e.target.closest('.project-link')) return;
    const card = e.target.closest('.project-card, .resource-card');
    if (card) openCardModal(card);
});

// Teclado: Esc cierra, Tab no sale de la ventana, Enter/Espacio abre la tarjeta enfocada
document.addEventListener('keydown', e => {
    if (!cm.hidden) {
        if (e.key === 'Escape') { closeCardModal(); return; }
        if (e.key === 'Tab') {
            const f = [...cm.querySelectorAll('button, a[href]')];
            if (!f.length) return;
            const first = f[0], last = f[f.length - 1];
            if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
            else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
        }
        return;
    }
    if ((e.key === 'Enter' || e.key === ' ') && e.target.matches?.('.project-card, .resource-card')) {
        e.preventDefault();
        openCardModal(e.target);
    }
});

// Al dar like dentro de la ventana, actualiza la misma tarjeta en la cuadrícula
document.addEventListener('click', e => {
    const b = e.target.closest('.btn-like');
    if (!b) return;
    setTimeout(() => {
        const id = b.dataset.id, count = b.querySelector('.like-count')?.textContent, liked = b.classList.contains('liked');
        document.querySelectorAll(`.btn-like[data-id="${CSS.escape(id)}"]`).forEach(o => {
            if (o === b) return;
            const c = o.querySelector('.like-count'); if (c) c.textContent = count;
            o.classList.toggle('liked', liked); o.setAttribute('aria-pressed', liked);
        });
    }, 0);
});


/* =====================================================
   ANIMACIONES (v3)
   Todas se desactivan si el usuario pidió "reducir movimiento" en su sistema.
===================================================== */
// Se lee la clase que puso el script del <head> (botón del sitio o ajuste del sistema)
// Siempre false: las animaciones corren en todos los dispositivos, aunque el sistema pida reducir movimiento.
const REDUCED_MOTION = false;

/* ---- 1. Fondo: lluvia de símbolos katakana ----
   Columnas de caracteres japoneses que caen y se desvanecen (usa el <canvas id="bg-particles">).
   - El canvas se mantiene TRANSPARENTE: la estela se borra con "destination-out", así el banner sigue visible detrás.
   - Colores de la paleta: azul claro (80% de las columnas) y rojo (20%); de vez en cuando un símbolo blanco brillante.
   - Se limita a ~18 cuadros por segundo y se pausa si la pestaña no está visible (ahorra batería). */
(function initKatakanaRain() {
    const cv = document.getElementById('bg-particles');
    if (!cv) return;
    const ctx = cv.getContext('2d');
    const CHARS = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン'.split('');
    const SIZE = 18;                       // tamaño del símbolo en píxeles (también el ancho de cada columna)
    let W, H, cols, drops, colors, raf, last = 0;
    function resize() {
        W = cv.width = innerWidth; H = cv.height = innerHeight;
        cols = Math.ceil(W / SIZE);
        drops = Array.from({ length: cols }, () => -Math.random() * (H / SIZE));   // cada columna arranca a distinta altura
        colors = Array.from({ length: cols }, () => Math.random() < .8 ? '91,123,255' : '240,0,0');
    }
    function frame(t) {
        raf = requestAnimationFrame(frame);
        if (t - last < 55) return;         // limita la velocidad (~18 fps)
        last = t;
        ctx.globalCompositeOperation = 'destination-out';   // desvanece lo dibujado sin pintar un fondo
        ctx.fillStyle = 'rgba(0,0,0,0.13)';
        ctx.fillRect(0, 0, W, H);
        ctx.globalCompositeOperation = 'source-over';
        ctx.font = SIZE + 'px "MS Gothic","Hiragino Kaku Gothic ProN","Noto Sans Mono CJK JP",monospace';
        for (let i = 0; i < cols; i++) {
            const y = drops[i] * SIZE;
            if (y > 0) {
                ctx.fillStyle = Math.random() < .07 ? 'rgba(255,255,255,.9)' : `rgba(${colors[i]},.6)`;
                ctx.fillText(CHARS[(Math.random() * CHARS.length) | 0], i * SIZE, y);
            }
            if (y > H && Math.random() > .975) drops[i] = 0;   // al salir de pantalla, reinicia en un momento aleatorio
            drops[i]++;
        }
    }
    addEventListener('resize', resize);
    document.addEventListener('visibilitychange', () => {
        document.hidden ? cancelAnimationFrame(raf) : (raf = requestAnimationFrame(frame));
    });
    resize(); raf = requestAnimationFrame(frame);
})();

/* ---- 2. Aparición al hacer scroll ----
   Cada tarjeta entra suave cuando llega a la pantalla, con un pequeño retraso escalonado (--i).
   Un MutationObserver detecta el contenido nuevo (cambio de sección o de filtro) y lo anima también. */
(function initReveal() {
    const root = document.getElementById('content');
    if (!root || REDUCED_MOTION || !('IntersectionObserver' in window)) return; // sin soporte: todo queda visible
    const io = new IntersectionObserver(entries => entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('in-view'); io.unobserve(e.target); }
    }), { threshold: .12 });
    const SEL = '.service-card, .stat-card, .about-card, .project-card, .team-grid .card, .contact-form, .contact-hub, .donate-card';
    const scan = () => root.querySelectorAll(SEL).forEach((el, i) => {
        if (el.dataset.rv) return;                          // ya preparado
        el.dataset.rv = '1';
        el.style.setProperty('--i', i % 6);                 // retraso escalonado en grupos de 6
        el.classList.add('reveal'); io.observe(el);
    });
    new MutationObserver(scan).observe(root, { childList: true, subtree: true });
    scan();
})();



/* =====================================================
   MONTO LIBRE DE DONACIÓN
   Valida la cantidad escrita (1 a 100,000), actualiza el enlace de PayPal con ese monto y moneda
   (paypal.me/usuario/75MXN) y muestra un resumen. Si el campo está vacío, el enlace queda sin monto.
===================================================== */
function updateDonationLink() {
    const inp = document.getElementById('amount-input');
    if (!inp) return;
    const cur = document.getElementById('amount-cur').value;
    const v = parseFloat(inp.value);
    const valid = Number.isFinite(v) && v >= 1 && v <= 100000;
    const amount = valid ? (Math.round(v * 100) / 100).toString() : '';
    const pp = document.querySelector('a[data-paypal]');
    if (pp) pp.href = `https://paypal.me/${pp.dataset.paypal}` + (valid ? `/${amount}${cur}` : '');
    document.querySelectorAll('.chip').forEach(c => c.classList.toggle('active', valid && Number(c.dataset.amount) === v));
    const sum = document.getElementById('amount-summary');
    if (sum) sum.textContent = valid ? `Aportarás ${amount} ${cur} con PayPal. ¡Gracias!`
        : (inp.value ? 'Escribe una cantidad entre 1 y 100,000.' : 'Cualquier cantidad nos ayuda. También puedes elegir el monto directamente en la página de pago.');
}
document.addEventListener('input', e => { if (e.target.id === 'amount-input') updateDonationLink(); });
document.addEventListener('change', e => { if (e.target.id === 'amount-cur') updateDonationLink(); });

/* =====================================================
   DONACIONES: interacción (v4)
===================================================== */
document.addEventListener('click', (e) => {
    // Atajo de monto: rellena el campo con la cantidad del chip y actualiza el enlace
    const chip = e.target.closest('.chip');
    if (chip) {
        const inp = document.getElementById('amount-input');
        if (inp) { inp.value = chip.dataset.amount; updateDonationLink(); }
        return;
    }
    // Copiar la CLABE al portapapeles y avisar con el texto del botón
    const cp = e.target.closest('.copy-btn');
    if (cp) {
        const original = cp.textContent;
        navigator.clipboard?.writeText(cp.dataset.copy).then(() => {
            cp.textContent = '¡Copiada!';
            setTimeout(() => cp.textContent = original, 1800);
        }).catch(() => { cp.textContent = 'Cópiala manualmente'; });
    }
});


/* =====================================================
   ASISTENTE VIRTUAL (chat flotante)
   Dos modos automáticos:
   1) Con IA: si pegas la URL de tu Worker en CHAT_API_URL (ver worker/worker.js).
   2) Sin IA: respuestas locales por palabras clave. Funciona sin servidor y sin costo.
   Si el modo IA falla o no responde, cae solo al modo local.
===================================================== */
const CHAT_API_URL = 'TU_URL_DEL_WORKER';   // Ej: https://codetrax-chat.tuusuario.workers.dev
const CHAT_IA = !CHAT_API_URL.startsWith('TU_');

// Base de conocimiento local: [palabras clave, respuesta]. El PRIMER grupo que coincida responde.
// Los enlaces usan el formato [texto](#/ruta) y se convierten en links seguros.
const FAQ = [
    [['precio','costo','cuanto','cotiz','presupuesto','tarifa'],
     'El costo depende del alcance de cada proyecto. Cuéntanos tu idea en [Contacto](#/contacto) y te preparamos una cotización.'],
    [['donar','donac','cafe','apoy','paypal','transferencia'],
     'Puedes invitarnos un café desde [Apoya](#/donar). ¡Gracias por ayudarnos a seguir publicando recursos gratis!'],
    [['contact','correo','email','whatsapp','agendar','reunion','meet','hablar'],
     'Puedes escribirnos o agendar una reunión por Google Meet desde [Contacto](#/contacto).'],
    [['portafolio','proyectos','trabajos','ejemplos','casos'],
     'Mira lo que hemos hecho en el [Portafolio](#/settings): sitios web, branding, robótica y multimedia.'],
    [['recurso','descargar','gratis','arduino','codigo','robot'],
     'En [Recursos](#/plans) hay proyectos de código y robótica (Arduino) para explorar.'],
    [['equipo','quienes','fundador','damian','miguel','ricardo'],
     'Somos un equipo multidisciplinario de desarrollo, diseño y multimedia. Conócenos en [Servicios y equipo](#/files).'],
    [['proceso','metodologia','etapas','soporte'],
     'Trabajamos en 4 etapas: Discovery, Planificación, Desarrollo, y Entrega con soporte. Más detalle en [Servicios](#/files).'],
    [['servicio','ofrec','hacen','desarrollo','pagina','web','app','diseno','branding','logo','video','multimedia','juego','consultor'],
     'Ofrecemos desarrollo (web, apps, sistemas), diseño y branding, multimedia, videojuegos y consultoría. Detalles en [Servicios](#/files).'],
    [['hola','buenas','hey','buenos'],
     '¡Hola! Soy el asistente de Codetrax. Pregúntame por servicios, cotizaciones, portafolio o cómo contactarnos.']
];
const FAQ_DEFAULT = 'No estoy seguro de eso. Prueba preguntar por servicios o cotizaciones, o escríbenos en [Contacto](#/contacto) y te atendemos.';

// Quita acentos y mayúsculas para comparar texto
const norm = s => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
// Base de conocimiento EDITABLE en data/conocimiento.json: { q, keywords[], a, link:{t,h} }.
// Se consulta primero; si no hay coincidencia, se usan las respuestas integradas de FAQ.
let KB_FILE = [];
fetch('./data/conocimiento.json').then(r => r.json()).then(d => { KB_FILE = d; }).catch(() => {});

function localAnswer(q) {
    const t = norm(q);
    // 1) Archivo: gana la entrada con más palabras clave presentes
    let best = null, bestScore = 0;
    KB_FILE.forEach(e => {
        const sc = e.keywords.filter(k => t.includes(norm(k))).length;
        if (sc > bestScore) { best = e; bestScore = sc; }
    });
    if (best) return best.a + (best.link ? ` [${best.link.t}](${best.link.h})` : '');
    // 2) Respuestas integradas
    const hit = FAQ.find(([keys]) => keys.some(k => t.includes(k)));
    return hit ? hit[1] : FAQ_DEFAULT;
}

// Convierte texto en HTML seguro: primero escapa todo, luego solo permite enlaces [txt](#/ruta) o [txt](https://...)
const fmt = (t, soloInternos = false) => esc(t).replace(/\[([^\]]+)\]\((#\/[a-z]+|https:\/\/[^)\s]+)\)/g,
    (_, txt, url) => (soloInternos && !url.startsWith('#')) ? txt : `<a href="${url}"${url.startsWith('http') ? ' target="_blank" rel="noopener noreferrer"' : ''}>${txt}</a>`);

(function initChat() {
    const root = document.createElement('div');
    root.className = 'chat-root';
    root.innerHTML = `
        <button type="button" class="chat-toggle" aria-label="Abrir asistente virtual" aria-expanded="false"><i class="fa-solid fa-comment-dots" aria-hidden="true"></i></button>
        <section class="chat-panel" role="dialog" aria-label="Asistente virtual de Codetrax" hidden>
            <header class="chat-head"><span>Asistente Codetrax</span><button type="button" class="chat-close" aria-label="Cerrar asistente">✕</button></header>
            <div class="chat-msgs" aria-live="polite"></div>
            <div class="chat-chips"></div>
            <form class="chat-form"><input type="text" maxlength="300" placeholder="Escribe tu pregunta..." aria-label="Tu pregunta" autocomplete="off"><button type="submit" aria-label="Enviar"><i class="fa-solid fa-paper-plane" aria-hidden="true"></i></button></form>
            <p class="chat-foot">Asistente automático: puede equivocarse. Para temas importantes usa Contacto.</p>
        </section>`;
    document.body.appendChild(root);

    const $ = s => root.querySelector(s);
    const toggle = $('.chat-toggle'), panel = $('.chat-panel'), msgs = $('.chat-msgs'),
          form = $('.chat-form'), input = form.querySelector('input'), chips = $('.chat-chips');
    const history = [];            // historial que se envía a la IA
    let busy = false, greeted = false;

    function add(role, text) {     // agrega una burbuja y baja el scroll
        const d = document.createElement('div');
        d.className = 'chat-msg ' + role;
        d.innerHTML = role === 'bot' ? fmt(text).replace(/\n/g, '<br>') : esc(text);   // respeta los saltos de línea del JSON
        msgs.appendChild(d); msgs.scrollTop = msgs.scrollHeight;
        return d;
    }
    function open(v) {
        panel.hidden = !v; toggle.setAttribute('aria-expanded', v);
        if (v) {
            if (!greeted) {        // saludo y sugerencias solo la primera vez
                greeted = true;
                add('bot', '¡Hola! Soy el asistente de Codetrax. ¿En qué te ayudo?');
                ['¿Qué servicios ofrecen?', '¿Cómo cotizo un proyecto?', '¿Cómo los apoyo?'].forEach(q => {
                    const b = document.createElement('button'); b.type = 'button'; b.textContent = q;
                    b.onclick = () => { chips.remove(); send(q); }; chips.appendChild(b);
                });
            }
            input.focus();
        } else toggle.focus();
    }
    async function send(text) {
        if (busy || !text.trim()) return;
        busy = true; add('user', text); history.push({ role: 'user', content: text });
        const typing = add('bot', 'Escribiendo…'); typing.classList.add('typing');
        let reply, fromAI = false;   // fromAI: la respuesta vino del Worker (no es de confianza total)
        if (CHAT_IA) {
            try {   // modo IA: espera máx. 15 s
                const c = new AbortController(); const to = setTimeout(() => c.abort(), 15000);
                const r = await fetch(CHAT_API_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ messages: history.slice(-8) }), signal: c.signal });
                clearTimeout(to);
                if (!r.ok) throw new Error('http ' + r.status);
                reply = String((await r.json()).reply || '').slice(0, 1200); fromAI = !!reply;   // límite de longitud
            } catch (e) { console.warn('Chat IA no disponible, uso respuestas locales:', e.message); }
        }
        reply = reply || localAnswer(text);   // respaldo local
        history.push({ role: 'assistant', content: reply });
        typing.classList.remove('typing'); typing.innerHTML = fmt(reply, fromAI); msgs.scrollTop = msgs.scrollHeight;
        busy = false;
    }
    toggle.addEventListener('click', () => open(panel.hidden));
    $('.chat-close').addEventListener('click', () => open(false));
    root.addEventListener('keydown', e => { if (e.key === 'Escape' && !panel.hidden) open(false); });
    form.addEventListener('submit', e => { e.preventDefault(); const t = input.value; input.value = ''; send(t); });
    msgs.addEventListener('click', e => { if (e.target.closest('a[href^="#/"]')) open(false); });  // al seguir un enlace interno, cierra el chat
})();


/* =====================================================
   BOTÓN "VOLVER ARRIBA" y eventos de analítica
===================================================== */
const backTop = document.getElementById('back-top');
if (backTop) {
    addEventListener('scroll', () => { backTop.hidden = scrollY < 400; }, { passive: true });  // visible tras 400px
    backTop.addEventListener('click', () => scrollTo({ top: 0, behavior: 'smooth' }));
}
// Mide clics en llamadas a la acción importantes (CTA, WhatsApp, agenda, correo)
document.addEventListener('click', e => {
    const a = e.target.closest('.neon-button, .whatsapp-float, .action-btn');
    if (a) track('clic-' + (a.getAttribute('aria-label') || a.textContent.trim().split('\n')[0].slice(0, 30)));
});


/* =====================================================
   SEGURIDAD: imágenes rotas sin atributos inline (permite una CSP estricta)
   Foto de testimonio rota -> se quita; cualquier otra -> imagen de respaldo (una sola vez, sin bucles).
===================================================== */
document.addEventListener('error', e => {
    const img = e.target;
    if (!(img instanceof HTMLImageElement) || img.dataset.fallback) return;
    img.dataset.fallback = '1';
    if (img.closest('.testi-card')) img.remove(); else img.src = 'assets/placeholder.webp';
}, true);   // "true" = fase de captura, porque el evento error no burbujea


/* =====================================================
   RESPALDO DE LA INTRO
   Problema que resuelve: si js/intro.js no carga (404 o bloqueo) o el video falla, la capa negra
   quedaba tapando todo el sitio sin forma de cerrarla. Aquí se garantiza que SIEMPRE se pueda cerrar.
===================================================== */
(function introFailsafe() {
    const overlay = document.getElementById('video-intro-overlay');
    if (!overlay) return;
    const video = document.getElementById('intro-video');
    const skip = document.getElementById('skip-intro');
    let closed = false;
    const close = () => {                                   // cierra una sola vez, con fade
        if (closed) return; closed = true;
        try { video && video.pause(); } catch (e) {}
        overlay.style.opacity = '0';
        setTimeout(() => { overlay.style.display = 'none'; }, 800);
    };
    skip && skip.addEventListener('click', close);          // botón "Omitir Intro"
    if (video) {
        video.addEventListener('ended', close);             // el video terminó
        video.addEventListener('error', close);             // video inexistente o dañado
        video.addEventListener('loadedmetadata', () => setTimeout(close, (video.duration + 2) * 1000)); // tope = duración + 2s
        const p = video.play && video.play();               // si el navegador bloquea el autoplay, no dejar la pantalla negra
        if (p && p.catch) p.catch(close);
    }
    setTimeout(() => { if (!video || video.readyState < 1) close(); }, 8000);   // sin datos del video tras 8s: cerrar
})();

/* =====================================================
   IMÁGENES ROTAS (compatible con la política de seguridad CSP)
   La CSP bloquea los atributos inline onerror="...", así que el respaldo se hace aquí:
   1.er fallo -> imagen de reemplazo; 2.º fallo (o foto de testimonio) -> se quita la imagen.
===================================================== */
document.addEventListener('error', (e) => {
    const img = e.target;
    if (!img || img.tagName !== 'IMG') return;
    if (img.dataset.failed || img.closest('.testi-card')) { img.remove(); return; }
    img.dataset.failed = '1';
    img.src = 'assets/placeholder.webp';
}, true);


/* =====================================================
   CONFIRMACIÓN DE DONATIVOS (mensaje "gracias" en pantalla)
   Mostramos un aviso al abrir PayPal o copiar la CLABE. El sitio no puede saber si el pago se completó,
   así que el mensaje agradece la intención y explica que la confirmación la envía el propio método de pago.
===================================================== */
function showToast(msg) {
    let t = document.getElementById('toast');
    if (!t) {
        t = document.createElement('div');
        t.id = 'toast'; t.setAttribute('role', 'status'); t.setAttribute('aria-live', 'polite');
        document.body.appendChild(t);
    }
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(showToast._timer);
    showToast._timer = setTimeout(() => t.classList.remove('show'), 6000);
}
document.addEventListener('click', e => {
    if (e.target.closest('a[data-paypal]')) {
        showToast(lang === 'en'
            ? 'Thank you for supporting us! PayPal opened in a new tab. PayPal will send you the confirmation by email.'
            : '¡Gracias por tu apoyo! Se abrió PayPal en otra pestaña. PayPal te enviará la confirmación a tu correo.');
    }
    if (e.target.closest('[data-copy]')) {
        showToast(lang === 'en' ? 'CLABE copied. Thank you for your support!' : 'CLABE copiada. ¡Gracias por tu apoyo!');
    }
});
