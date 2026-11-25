document.documentElement.classList.remove('no-js');
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

// safeStorage: localStorage puede lanzar SecurityError (Safari privado, storage bloqueado)
// o QuotaExceededError (lleno). Sin esto, un solo acceso tumba todo el script.
// Devuelve null en lectura y no hace nada en escritura si falla, nunca lanza.
const safeStorage = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} },
    remove(k) { try { localStorage.removeItem(k); } catch (e) {} }
};
// Normaliza para comparar sin acentos, mayúsculas ni espacios extra (búsqueda y filtros de categoría).
const normCat = s => String(s ?? '').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
// safeSession: como safeStorage pero en sessionStorage (vistas por sesión, intro por sesión). Nunca lanza.
const safeSession = {
    get(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} },
    remove(k) { try { sessionStorage.removeItem(k); } catch (e) {} }
};
// Botón "Ver detalles": su estilo vive en css/style.css (.details-btn), no se inyecta <style> inline
// porque la CSP sin 'unsafe-inline' lo bloquearía.
// parseInt seguro: nunca devuelve NaN; si el valor guardado esta corrupto, usa el fallback.
const safeInt = (v, fallback = 0) => { const n = parseInt(v, 10); return Number.isFinite(n) ? n : fallback; };
// PAGINACIÓN (baja): 12 tarjetas por página en portafolio, recursos y buscador.
// Cada render muestra slice(0, pagina * PAGE_SIZE) y un botón "Cargar más" suma una página.
// Los ids de tarjeta usan el índice dentro de la lista filtrada completa, así que al paginar
// no cambian y los likes/vistas guardados siguen correspondiendo a la misma tarjeta.
const PAGE_SIZE = 12;
// Sanitizador por allowlist para HTML de confianza (blog). Sin dependencias nuevas:
// permite solo p,h2,h3,pre,code,a,strong,em,ul,ol,li; elimina script/style/iframe,
// atributos on*=, href/src javascript:/data:, y style. Lo demas se escapa como texto.
function sanitizeHtml(html) {
    const allowed = new Set(['p','h2','h3','pre','code','a','strong','em','ul','ol','li']);
    const tmp = document.createElement('div');
    tmp.innerHTML = String(html ?? '');
    const clean = (node) => {
        [...node.childNodes].forEach(child => {
            if (child.nodeType === 3) return;
            if (child.nodeType !== 1) { child.remove(); return; }
            const tag = child.tagName.toLowerCase();
            if (!allowed.has(tag)) { clean(child); node.replaceChild(document.createTextNode(child.textContent), child); return; }
            [...child.attributes].forEach(a => {
                const n = a.name.toLowerCase();
                if (tag === 'a' && n === 'href') {
                    const v = String(a.value || '').trim().toLowerCase();
                    if (!(v.startsWith('#/') || v.startsWith('https://') || v.startsWith('http://'))) child.removeAttribute(a.name);
                } else child.removeAttribute(a.name);
            });
            clean(child);
        });
    };
    clean(tmp);
    return tmp.innerHTML;
}

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
    paypalUser:  'DamianCruz436',          // Usuario de paypal.me/DamianCruz436
    banco:       'Morse',                  // Banco de la cuenta para apoyos
    titular:     'Damian Cruz',            // Nombre del titular de la cuenta
    clabe:       '710969000422711528'      // CLABE interbancaria (18 dígitos)
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
    // Descarga restringida: solo URLs relativas / del mismo sitio o de github.com, y nunca
    // extensiones ejecutables (.exe, .bat, .sh, .msi, .apk, .scr). Si no cumple, no hay botón Descargar.
    const isExecutable = u => /\.(exe|bat|sh|msi|apk|scr)$/i.test(String(u || '').split('?')[0].split('#')[0]);
    const isAllowedDownload = u => {
        if (!u || isExecutable(u)) return false;
        try {
            const parsed = new URL(String(u), location.href);
            if (parsed.origin === location.origin) return true;   // relativa o mismo sitio
            return parsed.hostname === 'github.com' || parsed.hostname.endsWith('.github.com');
        } catch (e) { return false; }
    };
    const candidate = allowDownload ? (download || (isFile(url) ? url : null)) : null;
    const dl = candidate && isAllowedDownload(candidate) ? candidate : null;
    const demo = url && url !== dl ? url : null;
    const ext = dl ? (/\.ino\b/i.test(String(dl)) ? 'ino' : String(dl).split('?')[0].split('.').pop().toLowerCase()) : '';
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
    const link = (href, txt, extra = '') => `<a class="neon-button" href="${esc(href)}" target="_blank" rel="noopener noreferrer" ${extra}>${txt}</a>`;
    return [
        card('fa-brands fa-paypal', 'PayPal', 'Escribe arriba la cantidad que quieras y paga con tu cuenta o tarjeta.',
             ready(D.paypalUser), link('https://paypal.me/' + encodeURIComponent(String(D.paypalUser)), 'Donar con PayPal', 'data-paypal="' + esc(D.paypalUser) + '"')),
        card('fa-solid fa-building-columns', 'Transferencia', ready(D.clabe) ? `${esc(D.banco)} · ${esc(D.titular)}` : 'SPEI desde tu banco, sin comisiones.',
             ready(D.clabe), `<code class="clabe">${esc(D.clabe)}</code><button type="button" class="neon-button copy-btn" data-copy="${esc(D.clabe)}">Copiar CLABE</button>`)
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
// normalizeLang: solo 'es'/'en' exactos son válidos. Cualquier otro valor guardado
// ('fr', 'EN', null, ...) se descarta; en ese caso manda el idioma del navegador
// ('en' si empieza por 'en', si no 'es'). 'EN' en mayúsculas NO vale como 'en'.
const normalizeLang = v => (v === 'es' || v === 'en') ? v : 'es';
let lang = safeStorage.get('lang');
lang = (lang === 'es' || lang === 'en') ? lang : ((navigator.language || 'es').slice(0, 2) === 'en' ? 'en' : 'es');
// setLang: único punto para cambiar de idioma; valida antes de guardar.
const setLang = v => { lang = normalizeLang(v); safeStorage.set('lang', lang); };
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
    lang = normalizeLang(lang);   // por si algo asignó un valor inválido, vuelve a 'es'
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
    // Panel del chat y modal: se traduce solo el "cromo" (etiquetas, placeholders, pie).
    // El saludo, las sugerencias y las respuestas del bot quedan en español porque la base
    // de conocimiento local (FAQ / data/conocimiento.json) solo casa palabras clave en español:
    // traducir las sugerencias haría que enviaran preguntas en inglés que el motor local no responde.
    // Los toasts no se reescriben aquí: ya se crean traducidos en cada llamada a showToast()
    // y son mensajes de un solo uso (desaparecen a los 6 s).
    const chatToggle = document.querySelector('.chat-toggle');
    if (chatToggle) chatToggle.setAttribute('aria-label', lang === 'en' ? 'Open virtual assistant' : 'Abrir asistente virtual');
    const chatClose = document.querySelector('.chat-close');
    if (chatClose) chatClose.setAttribute('aria-label', lang === 'en' ? 'Close assistant' : 'Cerrar asistente');
    const chatInput = document.querySelector('.chat-form input');
    if (chatInput) chatInput.placeholder = lang === 'en' ? 'Type your question...' : 'Escribe tu pregunta...';
    const chatSend = document.querySelector('.chat-form button[type="submit"]');
    if (chatSend) chatSend.setAttribute('aria-label', lang === 'en' ? 'Send' : 'Enviar');
    const chatFoot = document.querySelector('.chat-foot');
    if (chatFoot) chatFoot.textContent = lang === 'en' ? 'Automatic assistant: it can make mistakes. For important matters use Contact.' : 'Asistente automático: puede equivocarse. Para temas importantes usa Contacto.';
    const cmClose = document.querySelector('.cm-close');
    if (cmClose) cmClose.setAttribute('aria-label', lang === 'en' ? 'Close' : 'Cerrar');
}

// Consulta Google Places (New) una vez y guarda el resultado 24 h en el navegador para no gastar cuota.
// Nota: Places devuelve como máximo 5 reseñas. Se muestran todas tal cual, con su autor (política de Google).
let _gReviews;
function loadGoogleReviews() {
    if (_gReviews) return _gReviews;
    if (GOOGLE_REVIEWS.placeId.startsWith('TU_') || GOOGLE_REVIEWS.apiKey.startsWith('TU_')) return (_gReviews = Promise.resolve(null));
    try { const c = JSON.parse(safeStorage.get('gr-cache')); if (c && typeof c.t === 'number' && c.d && Array.isArray(c.d.reviews) && Date.now() - c.t < 864e5) return (_gReviews = Promise.resolve(c.d)); } catch (e) {}
    return (_gReviews = fetch(`https://places.googleapis.com/v1/places/${GOOGLE_REVIEWS.placeId}?languageCode=es`, {
        headers: { 'X-Goog-Api-Key': GOOGLE_REVIEWS.apiKey, 'X-Goog-FieldMask': 'rating,userRatingCount,googleMapsUri,reviews' }
    }).then(r => r.ok ? r.json() : null).then(p => {
        if (!p) return null;
        const d = { rating: p.rating, count: p.userRatingCount, url: p.googleMapsUri, reviews: (p.reviews || []).map(r => ({
            nombre: r.authorAttribution?.displayName || '', link: r.authorAttribution?.uri || '', foto: r.authorAttribution?.photoUri || '',
            sub: r.relativePublishTimeDescription || '', rating: r.rating, texto: r.text?.text || r.originalText?.text || '' })).filter(r => r.texto) };
        safeStorage.set('gr-cache', JSON.stringify({ t: Date.now(), d }));
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
        <ul class="stack-row">${STACK.filter(s => s && String(s.n ?? '').trim()).map(s => `<li><i class="${esc(String(s.i ?? ''))}" aria-hidden="true"></i><span>${esc(String(s.n ?? ''))}</span></li>`).join('')}</ul>`);
    // --- Testimonios: manuales + reseñas de Google (si están configuradas) ---
    const manual = TESTIMONIOS.filter(t => t && String(t.texto ?? '').trim() && String(t.nombre ?? '').trim() && !String(t.texto ?? '').startsWith('TU_') && !String(t.nombre ?? '').startsWith('TU_'))
        .map(t => ({ nombre: String(t.nombre ?? ''), sub: String(t.rol ?? ''), texto: String(t.texto ?? ''), foto: String(t.foto ?? ''), rating: 0, link: '' }));
    const stars = n => n ? `<span class="stars" role="img" aria-label="${n} de 5">${'★'.repeat(n)}${'☆'.repeat(5 - n)}</span>` : '';
    const card = t => `<figure class="testi-card"><div>${stars(t.rating)}</div>
        <blockquote>“${esc(String(t.texto ?? ''))}”</blockquote>
        <figcaption>${t.foto ? `<img src="${esc(safeUrl(t.foto))}" alt="" width="44" height="44" loading="lazy" referrerpolicy="no-referrer">` : ''}
        <span><b>${t.link ? `<a href="${esc(safeUrl(t.link))}" target="_blank" rel="noopener noreferrer">${esc(String(t.nombre ?? ''))}</a>` : esc(String(t.nombre ?? ''))}</b><br>${esc(String(t.sub ?? ''))}</span></figcaption></figure>`;
    const draw = (items, g) => slot('testi-slot', items.length ? `<h2 class="section-title">Lo que dicen nuestros clientes</h2>
        ${g ? `<p class="g-head" data-no-i18n>Google Maps · <b>${Number(g.rating) || 0}</b> ${stars(Math.round(g.rating))} (${Number(g.count) || 0})</p>` : ''}
        <div class="testi-grid">${items.filter(t => t && String(t.nombre ?? '').trim() && String(t.texto ?? '').trim()).map(card).join('')}</div>
        ${g ? `<p class="g-links"><a href="${esc(safeUrl(g.url))}" target="_blank" rel="noopener noreferrer">Ver todas las reseñas</a> ·
        <a href="https://search.google.com/local/writereview?placeid=${esc(GOOGLE_REVIEWS.placeId)}" target="_blank" rel="noopener noreferrer">Déjanos una reseña</a></p>` : ''}` : '');
    draw(manual, null);                                              // primero lo manual (instantáneo)
    loadGoogleReviews().then(g => { if (g && g.reviews.length) { draw(g.reviews.concat(manual), g); applyI18n(); } });

    // --- Suscripción: solo se muestra si configuraste SUBSCRIBE.action ---
    slot('sub-slot', SUBSCRIBE.action.includes('TU_') ? '' : `<div class="sub-box">
        <h2>Suscríbete</h2>
        <p>Recibe novedades, tutoriales y recursos nuevos en tu correo. Sin spam y puedes darte de baja cuando quieras.</p>
        <form class="sub-form" action="${esc(SUBSCRIBE.action)}" method="post">
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
    servicios:'Servicios y equipo | Codetrax',
    recursos:'Recursos | Codetrax',
    portafolio:'Portafolio | Codetrax',
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
   NUNCA pegues la clave service_role aqui: da acceso total y bypass a RLS a cualquiera que lea este JS publico.
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
            <button class="search-btn" type="button" aria-label="Filtrar">
                <i class="fa-solid fa-filter" aria-hidden="true"></i>
            </button>
        </div>
        <div id="search-results-grid"></div>
    </div>
    `;

    let portfolioProjects = [];
    let recursosProjects = [];
    let blogPosts = [];   // se carga desde data/blog/posts.json 
    let metricsCache = { Portafolio: {}, Recursos: {} };

    // --- Paginación (baja): página visible por sección; se reinicia al cambiar de filtro. ---
    let portfolioPage = 1, recursosPage = 1;
    let portfolioCategory = 'Todos', recursosCategory = 'Todos';
    // Buscador: resultados de la búsqueda activa y página visible (se reinician con cada término nuevo).
    let searchPage = 1, searchFiltered = [], searchTotal = 0;

    // Botón "Cargar más": va DESPUÉS de la cuadrícula (no dentro, para no ser un ítem del grid)
    // y se recrea en cada render; si ya no quedan tarjetas, no se muestra.
    function renderLoadMore(anchorEl, target, total, shown) {
        document.querySelectorAll(`.load-more-btn[data-target="${target}"]`).forEach(b => b.remove());
        if (!anchorEl || total <= shown) return;
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'load-more-btn neon-button';   // reutiliza el estilo de botón existente, sin CSS nuevo
        btn.dataset.target = target;
        btn.textContent = lang === 'en' ? 'Load more' : 'Cargar más';
        anchorEl.insertAdjacentElement('afterend', btn);
    }

    /* renderCards(lista, tipo): único render de tarjetas para portafolio, recursos y buscador.
       tipo 'portfolio' | 'recursos' | 'search'. La UI visible es la misma que antes:
       - portafolio/recursos: frente idéntico + reverso con cardActions() (likes/vistas intactos;
         'Visita' sin descarga en portafolio, 'Probar' con descarga en recursos).
       - search: frente con subtítulo creador||descripción y reverso con botón VER (sin likes,
         como antes; por eso no lleva data-card-id/data-title/data-tab).
       'lista' debe ser ya el slice visible (desde 0), así el índice i coincide con el de la
       lista filtrada completa y los ids port_N_/rec_N_ no cambian al paginar. */
    function renderCards(list, tipo) {
        const isRecursos = tipo === 'recursos';
        const isSearch = tipo === 'search';
        const tab = isRecursos ? 'Recursos' : 'Portafolio';
        return list.map((p, i) => {
            const title = String(p.titulo ?? '').trim();
            if (!title) return '';
            const keyTitle = title.toLowerCase();
            const front = `
                        <div class="card-front">
                            <img loading="lazy" width="300" height="180" src="${esc(p.imagen ? safeUrl(p.imagen) : 'assets/ima/logo.webp')}" alt="${esc(p.titulo)}">
                            <div class="card-divider"></div>
                            <h3>${esc(p.titulo)}</h3>
                            ${isSearch
                                ? `<p class="card-subtitle">${esc(p.creador || p.descripcion || '')}</p>`
                                : `<p class="card-subtitle">Creador: ${esc(p.creador || 'Desconocido')}</p>`}
                            <span class="card-category-badge">${esc(p.categoria || 'General')}</span>
                            <button type="button" class="btn-glass details-btn">Ver detalles</button>
                        </div>`;
            if (isSearch) {
                return `
                <div class="project-card">
                    <div class="card-inner">${front}
                        <div class="card-back">
                            <h3>${esc(p.titulo)}</h3>
                            <p class="card-description-text">${esc(p.descripcion || 'Sin descripción disponible.')}</p>
                            <div class="card-back-actions">
                                <a href="${esc(safeUrl(p.url))}" target="_blank" rel="noopener noreferrer" class="project-link search-result-link">
                                    <button class="button search-result-btn">
                                        <div class="blob1"></div>
                                        <div class="blob2"></div>
                                        <div class="inner search-result-inner">VER</div>
                                    </button>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>`;
            }
            const uniqueId = `${isRecursos ? 'rec' : 'port'}_${i}_${keyTitle.replace(/\s+/g, '-')}`;
            const sheetLikeCount = metricsCache[tab][keyTitle]?.likes;
            const savedLikes = sheetLikeCount !== undefined
                ? sheetLikeCount
                : safeInt(safeStorage.get(uniqueId), safeInt(p.likes, 0));
            const isLiked = safeStorage.get(`${uniqueId}_liked`) === 'true';
            return `
                <div class="project-card" data-card-id="${uniqueId}" data-title="${esc(p.titulo)}" data-tab="${tab}">
                    <div class="card-inner">${front}
                        <div class="card-back">
                            <h3>${esc(p.titulo)}</h3>
                            <p class="card-description-text">${esc(p.descripcion)}</p>
                            <div class="card-back-actions">${cardActions({ url: p.url, download: p.descarga, label: isRecursos ? 'Probar' : 'Visita', id: uniqueId, liked: isLiked, likes: savedLikes, allowDownload: isRecursos })}</div>
                        </div>
                    </div>
                </div>`;
        }).join('');
    }

    // Pinta los resultados de la búsqueda activa con la misma paginación (12 + "Cargar más").
    // Decisión: se unifica con el mecanismo general en vez de mantener el tope fijo de 20:
    // el buscador ya no corta en 20, muestra 12 y el resto bajo "Cargar más".
    function renderSearchResults() {
        const resultsGrid = document.getElementById('search-results-grid');
        if (!resultsGrid) return;
        if (!searchFiltered.length) { resultsGrid.innerHTML = ''; renderLoadMore(resultsGrid, 'search', 0, 0); return; }
        const shown = searchFiltered.slice(0, searchPage * PAGE_SIZE);
        resultsGrid.innerHTML = (searchTotal > PAGE_SIZE
            ? `<p class="search-count" role="status">${lang === 'en' ? `Showing ${shown.length} of ${searchTotal} results` : `Mostrando ${shown.length} de ${searchTotal} resultados`}</p>` : '')
            + renderCards(shown, 'search');
        renderLoadMore(resultsGrid, 'search', searchTotal, shown.length);
    }

    /* =====================================================
       CARGA DE ARCHIVOS JSON LOCALES Y SINCRO DE MÉTRICAS
    ===================================================== */
    // Lee los contadores de una tabla ('Portafolio' o 'Recursos') y devuelve { "titulo en minúsculas": {likes, vistas} }
    async function fetchMetrics(tabName) {
        if (!metricsReady()) return {};
        const c = new AbortController(); const to = setTimeout(() => c.abort(), 3000);
        try {
            const res = await fetch(`${METRICS.url}/rest/v1/metricas?tabla=eq.${encodeURIComponent(tabName)}&select=titulo,likes,vistas`, { headers: metricsHeaders(), signal: c.signal });
            if (!res.ok) return {};
            const data = await res.json();
            const map = {};
            (Array.isArray(data) ? data : []).forEach(r => {
                const t = String(r && r.titulo ? r.titulo : '').trim().toLowerCase();
                if (!t) return;
                map[t] = { likes: Number(r.likes) || 0, vistas: Number(r.vistas) || 0 };
            });
            return map;
        } catch (err) {
            console.error('Error leyendo métricas:', err);
            return {};
        } finally { clearTimeout(to); }
    }
    // Carga un JSON local; si falla, no es ok, esta malformado o no es array, devuelve [].
    // Asi un archivo roto no aborta el otro ni el render.
    async function loadJson(url) {
        try {
            const r = await fetch(url);
            if (!r.ok) return [];
            const d = await r.json();
            return Array.isArray(d) ? d : [];
        } catch (e) { console.error('Error cargando ' + url + ':', e); return []; }
    }

    async function loadDataAndSyncCounters() {
        try {
            // 1. Cargar datos principales siempre desde los archivos JSON locales, cada uno por separado
            const [portData, recData] = await Promise.all([
                loadJson('./data/portafolio/index.json'),
                loadJson('./data/recursos/recursos.json')
            ]);
            portfolioProjects = portData.filter(p => p && String(p.titulo ?? '').trim());
            recursosProjects = recData.filter(p => p && String(p.titulo ?? '').trim());

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

            // Contador de proyectos: siempre desde los datos reales, nunca hardcodeado.
            const projCounter = document.querySelector('.counter[data-target]');
            if (projCounter && portfolioProjects.length) projCounter.dataset.target = String(portfolioProjects.length);
            // Pintar primero con datos locales; las metricas remotas no bloquean el contenido.
            renderPortfolio('Todos');
            renderRecursos('Todos'); // necesario si el usuario entra directo a #/recursos
            initializeFilters();
            // 2. Contadores desde Supabase, en segundo plano y con timeout (ver fetchMetrics)
            Promise.all([fetchMetrics('Portafolio'), fetchMetrics('Recursos')]).then(([portMetrics, recMetrics]) => {
                metricsCache.Portafolio = portMetrics;
                metricsCache.Recursos = recMetrics;
                renderPortfolio(portfolioCategory); renderRecursos(recursosCategory);   // conserva el filtro y la página activos (antes volvía a 'Todos')
            }).catch(e => console.error('Error al cargar metricas:', e));
        } catch (error) {
            console.error('Error al cargar datos locales/métricas:', error);
            try { renderPortfolio('Todos'); renderRecursos('Todos'); initializeFilters(); } catch (e2) {}
        }
    }

    /* =====================================================
       ENVIAR MÉTRICAS (SUPABASE)
    ===================================================== */
    // Suma delta (+1 o -1) a 'likes' o 'vistas' llamando a la función segura del servidor (incrementar_metrica).
    window.sendMetric = async function(project, field, delta, tabName) {
        if (!metricsReady()) return true;   // solo local: no hay nada remoto que revertir
        try {
            const res = await fetch(`${METRICS.url}/rest/v1/rpc/incrementar_metrica`, {
                method: 'POST', headers: metricsHeaders(),
                body: JSON.stringify({ p_tabla: tabName, p_titulo: project.titulo, p_campo: field, p_delta: delta })
            });
            if (!res.ok) { console.error('Error enviando métrica: HTTP', res.status); return false; }
            return true;
        } catch (err) {
            console.error('Error enviando métrica:', err);
            return false;
        }
    };

    /* =====================================================
       RENDERIZADO DE PORTAFOLIO
    ===================================================== */
    function renderPortfolio(category) {
        const grid = document.getElementById('portfolio-grid');
        if (!grid) return;
        // Al cambiar de filtro se vuelve a la página 1; re-render del mismo filtro (p. ej. al
        // llegar las métricas remotas) conserva la página para no perder el "Cargar más".
        if (normCat(category) !== normCat(portfolioCategory)) { portfolioPage = 1; portfolioCategory = category; }

        const filteredProjects = normCat(category) !== 'todos'
            ? portfolioProjects.filter(project => normCat(project.categoria ?? '') === normCat(category))
            : portfolioProjects;

        if (filteredProjects.length === 0) {
            grid.innerHTML = `
                <div class="empty-state">
                    <p class="empty-state-text">No hay proyectos disponibles.</p>
                </div>`;
            renderLoadMore(grid, 'portfolio', 0, 0);
            return;
        }

        const shown = filteredProjects.slice(0, portfolioPage * PAGE_SIZE);
        grid.innerHTML = renderCards(shown, 'portfolio');
        renderLoadMore(grid, 'portfolio', filteredProjects.length, shown.length);
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
            const target = Number(counter.dataset.target);
            if (!Number.isFinite(target) || target < 0) { counter.textContent = '0'; return; }
            if (REDUCED_MOTION) { counter.textContent = String(target); return; }
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
    let searchTimer = null;   // debounce del buscador (~200 ms)
    document.addEventListener('input', (e) => {
        if (e.target.id !== 'gt-input-target') return;
        const inputEl = e.target;
        clearTimeout(searchTimer);
        searchTimer = setTimeout(() => {
            const term = normCat(inputEl.value);   // sin acentos ni mayúsculas (misma norma que el chat)
            const resultsGrid = document.getElementById('search-results-grid');
            if (!resultsGrid) return;

            if (!term) { searchFiltered = []; searchTotal = 0; searchPage = 1; renderSearchResults(); return; }
            if (!window.searchableData) {   // datos aún no cargados
                resultsGrid.innerHTML = `
                    <div class="empty-state empty-state-sm">
                        <p class="empty-state-text">Cargando…</p>
                    </div>`;
                return;
            }

            const activeMenuLink = document.querySelector('.menu a.active');
            const currentSection = activeMenuLink ? activeMenuLink.getAttribute('data-section') : 'home';

            let dataSource = window.searchableData;

            if (currentSection === 'recursos') {
                dataSource = recursosProjects;
            } else if (currentSection === 'portafolio') {
                dataSource = portfolioProjects;
            }

            const filtered = dataSource.filter(p =>
                normCat(p.titulo ?? '').includes(term) ||
                normCat(p.descripcion ?? '').includes(term) ||
                normCat(p.categoria ?? '').includes(term)
            );

            if (filtered.length === 0) {
                resultsGrid.innerHTML = `
                    <div class="empty-state empty-state-sm">
                        <p class="empty-state-text">No se encontró nada relacionado con "${esc(inputEl.value.trim())}" en este apartado.</p>
                    </div>`;
                searchFiltered = []; searchTotal = 0; searchPage = 1;
                renderLoadMore(resultsGrid, 'search', 0, 0);
                return;
            }

            // Búsqueda activa: se guarda para paginarla con "Cargar más" (12 por página, como el resto).
            searchFiltered = filtered; searchTotal = filtered.length; searchPage = 1;
            renderSearchResults();
        }, 200);
    });

    document.addEventListener('click', (e) => {
        const searchBtn = e.target.closest('.search-btn');
        if (!searchBtn) return;
        const inputTarget = document.getElementById('gt-input-target');
        if (inputTarget) inputTarget.focus();
    });

    // "Cargar más": suma una página y vuelve a pintar esa sección (el scroll se conserva:
    // el contenido crece hacia abajo y el botón se recrea al final de la lista).
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.load-more-btn');
        if (!btn) return;
        if (btn.dataset.target === 'portfolio') { portfolioPage++; renderPortfolio(portfolioCategory); }
        else if (btn.dataset.target === 'recursos') { recursosPage++; renderRecursos(recursosCategory); }
        else if (btn.dataset.target === 'search') { searchPage++; renderSearchResults(); }
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
            <div class="team-grid team-grid-wide">
                <!-- Tarjetas del equipo (Mantén tus clases, estructura optimizada) -->
               
      <div class="card red">
            <img src="assets/team/Damian.webp" alt="Foto de Damian Cruz" loading="lazy" class="team-photo">
            <h2>Damian Cruz</h2>
            <div class="profile-tag">Fundador | CEO</div>
            <p>────── ·𖥸· ──────</p>
      <div class="social-links">
            <a href="https://www.instagram.com/dam.ian9651" target="_blank" rel="noopener noreferrer" aria-label="Instagram" class="social-link"><i class="fab fa-instagram"></i></a>
            <a href="https://github.com/Codetrax-web" target="_blank" rel="noopener noreferrer" aria-label="Github" class="social-link"><i class="fab fa-github"></i></a>
            <a href="https://www.tiktok.com/@damian_cdx?is_from_webapp=1&sender_device=pc" target="_blank" rel="noopener noreferrer" aria-label="Tiktok" class="social-link"><i class="fab fa-tiktok"></i></a>
            <a href="https://discord.com/invite/rsAwuCg6xK" target="_blank" rel="noopener noreferrer" aria-label="Discord" class="social-link"><i class="fab fa-discord"></i></a>
            <a href="https://www.youtube.com/@DAMIANCDX" target="_blank" rel="noopener noreferrer" aria-label="Youtube" class="social-link"><i class="fab fa-youtube"></i></a>
      </div>
      </div>

      <div class="card yellow">
            <img src="assets/team/ricardo.webp" alt="Foto de Ricardo" loading="lazy" class="team-photo">
            <h2>Ricardo</h2>
            <div class="profile-tag">Desarrollador Full Stack</div>
            <p>────── ·𖥸· ──────</p>
      <div class="social-links">

      </div>
      </div>

      <div class="card green">
            <img src="assets/team/Miguel.webp" alt="Foto de Miguel Pandares" loading="lazy" class="team-photo">
            <h2>Miguel Pandares</h2>
            <div class="profile-tag">Desarrollador Full Stack</div>
            <p>────── ·𖥸· ──────</p>
      <div class="social-links">
            <a href="https://github.com/MiguelTime" target="_blank" rel="noopener noreferrer" aria-label="Github" class="social-link"><i class="fab fa-github"></i></a>
            <a href="https://www.tiktok.com/@migueltime_yt?is_from_webapp=1&sender_device=pc" target="_blank" rel="noopener noreferrer" aria-label="Tiktok" class="social-link"><i class="fab fa-tiktok"></i></a>
            <a href="https://www.instagram.com/migueltime_yt/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" class="social-link"><i class="fab fa-instagram"></i></a>
            <a href="https://discord.com/invite/SFffG38VFb" target="_blank" rel="noopener noreferrer" aria-label="Discord" class="social-link"><i class="fab fa-discord"></i></a>
            <a href="https://www.twitch.tv/migueltime" target="_blank" rel="noopener noreferrer" aria-label="Twitch" class="social-link"><i class="fab fa-twitch"></i></a>
            <a href="https://www.youtube.com/channel/UC4UWTtlSDu8YyiQtpVXQ7LA" target="_blank" rel="noopener noreferrer" aria-label="Youtube" class="social-link"><i class="fab fa-youtube"></i></a>

      </div>
      </div>

      <div class="card purple">
            <img src="assets/team/DynsG.webp" alt="Foto de DynsG" loading="lazy" class="team-photo">
            <h2>DynsG</h2>
            <div class="profile-tag">Diseñadora Gráfica</div>
            <p>────── ·𖥸· ──────</p>
      <div class="social-links">
            <a href="https://x.com/AltamarDyn3634" target="_blank" rel="noopener noreferrer" aria-label="Twitter" class="social-link"><i class="fab fa-twitter"></i></a>
            <a href="https://www.youtube.com/@Dyns.g-Oficial/videos" target="_blank" rel="noopener noreferrer" aria-label="Youtube" class="social-link"><i class="fab fa-youtube"></i></a>

      </div>
      </div>

      <div class="card orange">
            <img src="assets/team/Naoko.webp" alt="Foto de Naoko Aki" loading="lazy" class="team-photo">
            <h2>Naoko Aki</h2>
            <div class="profile-tag">Diseñadora Gráfica Anime</div>
            <p>────── ·𖥸· ──────</p>
      <div class="social-links">
            <a href="https://ko-fi.com/naokotan" target="_blank" rel="noopener noreferrer" aria-label="Ko-fi de Naoko Aki" class="social-link"><i class="fas fa-globe"></i></a>

      </div>
      </div>

      <div class="card blue">
            <img src="assets/team/tecno.webp" alt="Foto de Tecno 730" loading="lazy" class="team-photo">
            <h2>Tecno 730</h2>
            <div class="profile-tag">Diseñador Multimedia</div>
            <p>────── ·𖥸· ──────</p>
      <div class="social-links">
            <a href="https://www.tiktok.com/@tecno_730?is_from_webapp=1&sender_device=pc" target="_blank" rel="noopener noreferrer" aria-label="Tiktok" class="social-link"><i class="fab fa-tiktok"></i></a>
            <a href="https://www.instagram.com/tecno_730/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" class="social-link"><i class="fab fa-instagram"></i></a>
            <a href="https://discord.gg/tbUVxyGU" target="_blank" rel="noopener noreferrer" aria-label="Discord" class="social-link"><i class="fab fa-discord"></i></a>
            <a href="https://www.twitch.tv/tecno730" target="_blank" rel="noopener noreferrer" aria-label="Twitch" class="social-link"><i class="fab fa-twitch"></i></a>
            <a href="https://www.youtube.com/@TECNO730" target="_blank" rel="noopener noreferrer" aria-label="Youtube" class="social-link"><i class="fab fa-youtube"></i></a>
                    
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
        <p class="text-center">Codetrax crea recursos y proyectos abiertos para la comunidad. Si te sirvieron, tu apoyo nos ayuda a seguir publicando.</p>
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
            <p class="post-meta">${esc(p.fecha)} · ${(Array.isArray(p.tags) ? p.tags : []).map(esc).join(', ')}</p>
            <div class="post-body">${sanitizeHtml(p.contenido)}</div>
            <div id="sub-slot" class="sub-section"></div>   <!-- HTML propio (data/blog/posts.json), por eso no se escapa -->
        </article>` : `<section class="about-section"><p>No encontramos ese artículo. <a href="#/blog">Volver al blog</a></p></section>`;
    return `<section class="about-section"><h1 class="about-title">『 BLOG 』</h1>
        <p class="text-center">Tutoriales y notas</p>
        <div class="post-list">${blogPosts.filter(x => x && x.slug && x.titulo).map(x => `
            <a class="post-card" href="#/blog/${esc(x.slug)}">
                <h3>${esc(x.titulo)}</h3><p>${esc(x.resumen)}</p>
                <span class="donate-cta">Leer más</span></a>`).join('') || '<p class="text-center">Próximamente.</p>'}</div>
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
        <p class="text-center">¿Tienes una visión? Nosotros tenemos la tecnología. Colaboremos.</p>
        <div class="contact-hub-wrap">
            <div class="contact-hub">
                <div class="socials">
                    <a href="https://www.instagram.com/codetraxhp" target="_blank" rel="noopener noreferrer" aria-label="Instagram" title="Instagram"><i class="fa-brands fa-instagram"></i></a>
                    <a href="https://www.threads.net/@codetraxhp" target="_blank" rel="noopener noreferrer" aria-label="At" title="Threads"><i class="fa-solid fa-at fa-threads-symbol"></i></a>
                    <a href="https://www.youtube.com/@DAMIANCDX" target="_blank" rel="noopener noreferrer" aria-label="Youtube" title="YouTube"><i class="fa-brands fa-youtube"></i></a>
                    <a href="https://www.tiktok.com/@damian_cdx" target="_blank" rel="noopener noreferrer" aria-label="Tiktok" title="TikTok"><i class="fa-brands fa-tiktok"></i></a>
                    <a href="https://x.com/Code_trax" target="_blank" rel="noopener noreferrer" aria-label="Twitter" title="X"><i class="fa-brands fa-twitter"></i></a>
                </div>
                <div class="action-btns">
                    <a href="https://calendar.app.google/7iAyjJockVxnrkot9" target="_blank" rel="noopener noreferrer" class="action-btn">
                        <i class="fa-solid fa-video main-icon icon-green"></i>
                        <div class="btn-content">
                            <span class="btn-title">Google Meet</span>
                            <span class="btn-desc">Agendar consultoría</span>
                        </div>
                        <i class="fa-solid fa-chevron-right arrow-icon"></i>
                    </a>
                    <!-- Zoom retirado: duplicaba a Google Meet. Un solo agendador evita confusión -->
                    <a href="mailto:codetraxs@gmail.com?subject=Propuesta%20de%20Proyecto" class="action-btn">
                        <i class="fa-solid fa-envelope main-icon icon-red"></i>
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
            <input type="text" name="_gotcha" tabindex="-1" autocomplete="off" class="honeypot" aria-hidden="true"> <!-- honeypot: los bots lo llenan, las personas no -->
            <label class="consent"><input type="checkbox" required> Acepto el <a href="#/privacidad">aviso de privacidad</a></label>
            <button type="submit" class="neon-button">Enviar mensaje</button>
        </form>
        <!-- Botón flotante de WhatsApp: número real de Damian (52 + 1 + 5578526705) -->
        <a class="whatsapp-float" href="https://wa.me/5215578526705?text=Hola%20Codetrax%2C%20quiero%20cotizar%20un%20proyecto" target="_blank" rel="noopener noreferrer" aria-label="Escribir por WhatsApp"><i class="fa-brands fa-whatsapp" aria-hidden="true"></i></a>
    </section>
`
    };

    /* =====================================================
       LÓGICA DE RECURSOS
    ===================================================== */
    function renderRecursos(category) {
        const container = document.getElementById('recursos-container');
        if (!container) return;
        // Igual que en portafolio: cambio de filtro -> página 1; mismo filtro -> conserva la página.
        if (normCat(category) !== normCat(recursosCategory)) { recursosPage = 1; recursosCategory = category; }

        const filteredRecursos = normCat(category) !== 'todos'
            ? recursosProjects.filter(item => normCat(item.categoria ?? '') === normCat(category))
            : recursosProjects;

        if (filteredRecursos.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p class="empty-state-text">No hay recursos disponibles.</p>
                </div>`;
            renderLoadMore(container, 'recursos', 0, 0);
            return;
        }

        const shown = filteredRecursos.slice(0, recursosPage * PAGE_SIZE);
        container.innerHTML = renderCards(shown, 'recursos');
        renderLoadMore(container, 'recursos', filteredRecursos.length, shown.length);
    }

    /* =====================================================
       INICIALIZACIÓN Y NAVEGACIÓN
    ===================================================== */
    /* Enrutador por hash: #/servicios, #/recursos, #/portafolio, #/contacto.
       Cada sección tiene URL propia, funciona el botón "atrás" y se puede compartir un enlace directo.
       Alias viejos (files/plans/settings, p. ej. enlaces en data/conocimiento.json): redirigen a la ruta nueva. */
    // Scroll por ruta (baja): guarda el scrollY de la ruta saliente para restaurarlo al volver
    // con "atrás"/"adelante". Un clic en un enlace interno #/... precede a su hashchange, así
    // que ese caso sí sube arriba; sin clic previo, es navegación del historial y se restaura.
    let currentRouteKey = null;
    const scrollByRoute = {};
    let navFromLink = false;
    document.addEventListener('click', e => {
        if (e.target.closest('a[href^="#/"]')) {
            navFromLink = true;
            setTimeout(() => { navFromLink = false; }, 1000);   // el hashchange llega mucho antes; evita que un clic sin cambio de hash contamine un "atrás" posterior
        }
    });
    const ROUTES = ['home','servicios','recursos','portafolio','donar','contacto','blog','privacidad','terminos'];
    const ROUTE_ALIASES = { files: 'servicios', plans: 'recursos', settings: 'portafolio' };
    const VIEW_KEYS = { servicios: 'files', recursos: 'plans', portafolio: 'settings' };
    function navigate(opts = {}) {
        const [wanted, slug] = location.hash.replace('#/','').split('/');   // #/blog/mi-post -> blog + slug
        const canonical = ROUTE_ALIASES[wanted] || wanted;
        const key = ROUTES.includes(canonical) ? canonical : 'home';      // ruta desconocida -> home
        if (currentRouteKey !== null) scrollByRoute[currentRouteKey] = window.scrollY;   // guarda la ruta saliente antes de reemplazar el contenido
        const isFirstNav = currentRouteKey === null;
        currentRouteKey = key;
        const viewKey = VIEW_KEYS[key] || key;   // las vistas internas siguen con claves files/plans/settings
        document.querySelectorAll('.menu a').forEach(l => {          // marca el enlace activo
            const on = l.dataset.section === key;
            l.classList.toggle('active', on);
            on ? l.setAttribute('aria-current','page') : l.removeAttribute('aria-current');
        });
        mainContent.innerHTML = typeof views[viewKey] === 'function' ? views[viewKey](slug) : views[viewKey];
        fillSlots(); applyI18n(); track('vista-' + key);
        // Confirmación después de enviar el formulario de contacto
        if (key === 'contacto' && slug === 'enviado') {
            mainContent.insertAdjacentHTML('afterbegin', `<div class="confirm-card" role="status">
                <i class="fa-solid fa-circle-check" aria-hidden="true"></i>
                <div><b>${lang === 'en' ? 'Message sent!' : '¡Mensaje enviado!'}</b>
                <p>${lang === 'en' ? 'Thanks for writing. We will reply to your email within 24 hours.' : 'Gracias por escribirnos. Te responderemos a tu correo en un plazo de 24 horas.'}</p></div></div>`);
        }   // huecos dinámicos, idioma y analítica
        document.title = (key === 'blog' && slug) ? ((blogPosts.find(x => x && x.slug === slug)?.titulo || '') + ' | Codetrax') : TITLES[key];
        // Animación de entrada de la sección: se quita y se vuelve a poner la clase para reiniciar la animación CSS
        mainContent.classList.remove('view-enter'); void mainContent.offsetWidth; mainContent.classList.add('view-enter');
        if (key === 'home') setTimeout(animateCounters, 100);
        if (key === 'recursos') { renderRecursos('Todos'); initializeFilters(); }
        if (key === 'portafolio') { renderPortfolio('Todos'); initializeFilters(); }
        // Scroll: re-render de la misma ruta (idioma, llegada de posts) no mueve el scroll;
        // enlace interno -> arriba (suave salvo reduced-motion); atrás/adelante -> scroll guardado.
        if (opts.keepScroll) {
            // no tocar el scroll
        } else if (navFromLink || isFirstNav) {
            window.scrollTo({ top: 0, behavior: REDUCED_MOTION ? 'auto' : 'smooth' });
        } else {
            window.scrollTo({ top: scrollByRoute[key] ?? 0, behavior: 'auto' });
        }
        navFromLink = false;
    }
    // Carga los artículos del blog; si el usuario ya está en #/blog, vuelve a pintar cuando lleguen
    fetch('./data/blog/posts.json').then(r => r.ok ? r.json() : []).catch(() => []).then(d => {
        blogPosts = Array.isArray(d) ? d.filter(x => x && x.slug && x.titulo) : []; if (location.hash.startsWith('#/blog')) navigate({ keepScroll: true });
    });
    document.getElementById('lang-toggle')?.addEventListener('click', () => {   // selector ES/EN
        setLang(lang === 'en' ? 'es' : 'en'); navigate({ keepScroll: true });   // cambiar de idioma no mueve el scroll
    });
    window.addEventListener('hashchange', navigate);
    navigate();  // pinta la sección inicial según la URL

    // Búsqueda auxiliar de objeto por título
    window.findProjectByTitle = function(title, tabName) {
        const list = tabName === 'Recursos' ? recursosProjects : portfolioProjects;
        return list.find(p => p.titulo && String(p.titulo).toLowerCase() === String(title).toLowerCase()) || { titulo: title };
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
    const prevLikes = safeInt(countSpan.textContent, 0);
    const likedKey = `${id}_liked`;
    const wasLiked = safeStorage.get(likedKey) === 'true';

    let currentLikes = prevLikes;
    if (!wasLiked) {
        currentLikes++;
        safeStorage.set(likedKey, 'true');
        btn.classList.add('liked');
    } else {
        currentLikes = Math.max(0, currentLikes - 1);
        safeStorage.set(likedKey, 'false');
        btn.classList.remove('liked');
    }

    btn.setAttribute('aria-pressed', btn.classList.contains('liked'));   // accesibilidad: estado del botón
    safeStorage.set(id, String(currentLikes));
    countSpan.textContent = currentLikes;

    if (projectTitle) {
        const project = window.findProjectByTitle(projectTitle, tabName);
        const delta = wasLiked ? -1 : 1;
        // Si el servidor rechaza el like (res no ok / error de red), revertir el contador local
        // y avisar: no dejar un like fantasma.
        Promise.resolve(window.sendMetric(project, 'likes', delta, tabName)).then(ok => {
            if (ok !== false) return;
            safeStorage.set(likedKey, wasLiked ? 'true' : 'false');
            safeStorage.set(id, String(prevLikes));
            document.querySelectorAll(`.btn-like[data-id="${CSS.escape(id)}"]`).forEach(o => {
                const c = o.querySelector('.like-count'); if (c) c.textContent = prevLikes;
                o.classList.toggle('liked', wasLiked); o.setAttribute('aria-pressed', wasLiked);
            });
            if (typeof showToast === 'function') showToast(lang === 'en' ? 'Could not save your like. Please try again.' : 'No se pudo guardar tu like. Inténtalo de nuevo.');
            else console.warn('No se pudo guardar el like en el servidor.');
        });
    }
});

/* =====================================================
   CONTROLADOR DE CLICS EN "VER" / "VISITA" (REGISTRA VISTAS)
===================================================== */
document.addEventListener('click', (e) => {
    const link = e.target.closest('.project-link');
    if (!link) return;
    // Las descargas NO cuentan como vistas: solo Visita/Probar.
    if (link.classList.contains('btn-download') || link.hasAttribute('download')) return;

    const host = link.closest('.project-card, #card-modal');   // tarjeta o ventana ampliada
    if (!host) return;

    const projectTitle = host.dataset.title;
    const tabName = host.dataset.tab || 'Portafolio';

    if (projectTitle) {
        // Máximo 1 vista por proyecto y sesión: clave normalizada + marca temporal de sesión.
        const viewKey = 'views_' + String(projectTitle).trim().toLowerCase();
        if (safeSession.get(viewKey)) return;   // ya contada en esta sesión
        safeSession.set(viewKey, String(Date.now()));
        safeStorage.set(viewKey, String(safeInt(safeStorage.get(viewKey), 0) + 1));   // contador local persistente

        const project = window.findProjectByTitle(projectTitle, tabName);
        window.sendMetric(project, 'vistas', 1, tabName);   // solo se envía cuando se cuenta una nueva
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
    cm.dataset.tab = card.dataset.tab || (location.hash.startsWith('#/recursos') ? 'Recursos' : 'Portafolio');
    const img = front.querySelector('img');
    // La foto del modal hereda la del frente (ya pasada por safeUrl al renderizar); se revalida aquí por si el DOM cambió.
    const imgHtml = img ? (() => { const c = img.cloneNode(false); c.setAttribute('src', safeUrl(img.getAttribute('src') || '')); return c.outerHTML; })() : '';
    const title = front.querySelector('h3');
    const sub = front.querySelector('.card-subtitle');
    const badge = front.querySelector('.card-category-badge');
    const tmp = document.createElement('div');
    tmp.innerHTML = back.innerHTML;
    tmp.querySelector('h3')?.remove();                     // el título ya va arriba
    cm.querySelector('.cm-body').innerHTML = `
        <div class="cm-media">${imgHtml}</div>
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

// Abrir: botón "Ver detalles" explícito, o clic en cualquier parte de la tarjeta (menos like y enlaces)
document.addEventListener('click', e => {
    if (e.target.closest('#card-modal')) return;
    if (e.target.closest('.btn-like') || e.target.closest('.project-link')) return;
    const card = e.target.closest('.project-card, .resource-card');
    if (card) openCardModal(card);   // el botón .details-btn llega aquí igual que el clic en la tarjeta
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
    // Las tarjetas ya no son enfocables (sin role="button" ni tabindex): el modal se abre con el
    // botón "Ver detalles" (nativo, Enter/Espacio ya disparan su clic) o con clic.
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
// Respetar la preferencia del sistema: si el usuario pidio reducir movimiento, no hay lluvia,
// ni reveals, ni contadores animados, ni scroll suave, y la intro se salta (ver introFailsafe).
const REDUCED_MOTION = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---- 1. Fondo: lluvia de símbolos katakana ----
   Columnas de caracteres japoneses que caen y se desvanecen (usa el <canvas id="bg-particles">).
   - El canvas se mantiene TRANSPARENTE: la estela se borra con "destination-out", así el banner sigue visible detrás.
   - Colores de la paleta: azul claro (80% de las columnas) y rojo (20%); de vez en cuando un símbolo blanco brillante.
   - Se limita a ~18 cuadros por segundo y se pausa si la pestaña no está visible (ahorra batería). */
(function initKatakanaRain() {
    if (REDUCED_MOTION) return;
    const cv = document.getElementById('bg-particles');
    if (!cv) return;
    const ctx = cv.getContext('2d');
    if (!ctx) return;
    const CHARS = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン'.split('');
    const SIZE = 18;                       // tamaño del símbolo en píxeles (también el ancho de cada columna)
    let W, H, cols, drops, colors, raf, last = 0;
    // devicePixelRatio: el canvas se dibuja a resolución real y se escala con setTransform,
    // así no se ve borroso en pantallas retina. En resize se CONSERVA el array drops existente
    // (solo se recorta o se amplía con columnas nuevas), en vez de recrearlo desde cero.
    function resize() {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        W = innerWidth; H = innerHeight;
        cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
        cv.style.width = W + 'px'; cv.style.height = H + 'px';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        cols = Math.ceil(W / SIZE);
        if (!drops) {
            drops = Array.from({ length: cols }, () => -Math.random() * (H / SIZE));   // cada columna arranca a distinta altura
            colors = Array.from({ length: cols }, () => Math.random() < .8 ? '91,123,255' : '240,0,0');
        } else {
            while (drops.length < cols) { drops.push(-Math.random() * (H / SIZE)); colors.push(Math.random() < .8 ? '91,123,255' : '240,0,0'); }
            drops.length = cols; colors.length = cols;
        }
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
    let resizeTimer = null;   // debounce del resize (~150 ms)
    addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(resize, 150); });
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
    if (pp) pp.href = `https://paypal.me/${encodeURIComponent(pp.dataset.paypal || '')}` + (valid ? `/${amount}${cur}` : '');
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
     'Mira lo que hemos hecho en el [Portafolio](#/portafolio): sitios web, branding, robótica y multimedia.'],
    [['recurso','descargar','gratis','arduino','codigo','robot'],
     'En [Recursos](#/recursos) hay proyectos de código y robótica (Arduino) para explorar.'],
    [['equipo','quienes','fundador','damian','miguel','ricardo'],
     'Somos un equipo multidisciplinario de desarrollo, diseño y multimedia. Conócenos en [Servicios y equipo](#/servicios).'],
    [['proceso','metodologia','etapas','soporte'],
     'Trabajamos en 4 etapas: Discovery, Planificación, Desarrollo, y Entrega con soporte. Más detalle en [Servicios](#/servicios).'],
    [['servicio','ofrec','hacen','desarrollo','pagina','web','app','diseno','branding','logo','video','multimedia','juego','consultor'],
     'Ofrecemos desarrollo (web, apps, sistemas), diseño y branding, multimedia, videojuegos y consultoría. Detalles en [Servicios](#/servicios).'],
    [['hola','buenas','hey','buenos'],
     '¡Hola! Soy el asistente de Codetrax. Pregúntame por servicios, cotizaciones, portafolio o cómo contactarnos.']
];
const FAQ_DEFAULT = 'No estoy seguro de eso. Prueba preguntar por servicios o cotizaciones, o escríbenos en [Contacto](#/contacto) y te atendemos.';

// Quita acentos y mayúsculas para comparar texto
const norm = s => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
// Base de conocimiento EDITABLE en data/conocimiento.json: { q, keywords[], a, link:{t,h} }.
// Se consulta primero; si no hay coincidencia, se usan las respuestas integradas de FAQ.
let KB_FILE = [];
fetch('./data/conocimiento.json').then(r => r.ok ? r.json() : []).catch(() => []).then(d => { KB_FILE = Array.isArray(d) ? d.filter(e => e && Array.isArray(e.keywords)) : []; });

function localAnswer(q) {
    const t = norm(q);
    // 1) Archivo: gana la entrada con más palabras clave presentes
    let best = null, bestScore = 0;
    KB_FILE.forEach(e => {
        const sc = (Array.isArray(e.keywords) ? e.keywords : []).filter(k => t.includes(norm(String(k)))).length;
        if (sc > bestScore) { best = e; bestScore = sc; }
    });
    if (best && best.id === 'disponibilidad') {
        return AVAILABILITY.open
            ? 'Sí, en este momento estamos aceptando proyectos nuevos. Si tu idea tiene fecha límite, indícanos la fecha en tu mensaje para revisar si podemos cumplirla.'
            : 'En este momento tenemos la agenda llena y no estamos aceptando proyectos nuevos. Puedes escribirnos igualmente en [Contacto](#/contacto) y te avisamos cuando se libere un hueco.';
    }
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
        <button type="button" class="chat-toggle" aria-label="Abrir asistente virtual" aria-expanded="false"><img src="assets/ima/avatar-damian.webp" alt="" class="chat-avatar"></button>
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
          form = $('.chat-form'), input = form.querySelector('input'), chips = $('.chat-chips'),
          sendBtn = form.querySelector('button[type="submit"]');
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
                    b.onclick = () => { send(q).then(ok => { if (ok) chips.remove(); }); }; chips.appendChild(b);
                });
            }
            input.focus();
        } else toggle.focus();
    }
    async function send(text) {
        if (busy || !text.trim()) return false;   // ocupado o vacío: no se acepta, el texto se conserva
        busy = true;
        if (sendBtn) sendBtn.disabled = true;   // deshabilitar el envío mientras busy
        try {
        add('user', text); history.push({ role: 'user', content: text });
        const typing = add('bot', lang === 'en' ? 'Typing…' : 'Escribiendo…'); typing.classList.add('typing');
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
        try { reply = reply || localAnswer(text); } catch (e) { reply = FAQ_DEFAULT; }   // respaldo local, nunca bloquear el chat
        history.push({ role: 'assistant', content: reply });
        typing.classList.remove('typing'); typing.innerHTML = fmt(reply, true); msgs.scrollTop = msgs.scrollHeight;
        } catch (e) { console.error('Error en chat:', e); }
        finally { busy = false; if (sendBtn) sendBtn.disabled = false; }
        return true;   // aceptado: el llamador ya puede vaciar el input / quitar los chips
    }
    toggle.addEventListener('click', () => open(panel.hidden));
    $('.chat-close').addEventListener('click', () => open(false));
    root.addEventListener('keydown', e => { if (e.key === 'Escape' && !panel.hidden) open(false); });
    form.addEventListener('submit', e => { e.preventDefault(); const t = input.value; send(t).then(ok => { if (ok) input.value = ''; }); });
    msgs.addEventListener('click', e => { if (e.target.closest('a[href^="#/"]')) open(false); });  // al seguir un enlace interno, cierra el chat
})();


/* =====================================================
   BOTÓN "VOLVER ARRIBA" y eventos de analítica
===================================================== */
const backTop = document.getElementById('back-top');
if (backTop) {
    addEventListener('scroll', () => { backTop.hidden = scrollY < 400; }, { passive: true });  // visible tras 400px
    backTop.addEventListener('click', () => scrollTo({ top: 0, behavior: REDUCED_MOTION ? 'auto' : 'smooth' }));
}
// Mide clics en llamadas a la acción importantes (CTA, WhatsApp, agenda, correo)
document.addEventListener('click', e => {
    const a = e.target.closest('.neon-button, .whatsapp-float, .action-btn');
    if (a) track('clic-' + (a.getAttribute('aria-label') || a.textContent.trim().split('\n')[0].slice(0, 30)));
});


/* =====================================================
   SEGURIDAD: imágenes rotas sin atributos inline (permite una CSP estricta)
   UN SOLO handler (antes había dos duplicados con flags distintos): 1.er fallo ->
   'assets/ima/logo.webp'; 2.º fallo -> se quita la imagen. Regla igual para todas,
   sin excepción por testimonio: si falla una foto de testimonio, también recibe el logo
   y solo se quita si el logo falla también.
===================================================== */
document.addEventListener('error', e => {
    const img = e.target;
    if (!(img instanceof HTMLImageElement)) return;
    // Regla única, un solo flag dataset.fallback: 1.er fallo -> logo de respaldo;
    // 2.º fallo (o la imagen ya era el logo) -> eliminar. Sin este guardado, el 2.º
    // fallo repondría el logo en bucle.
    if (img.dataset.fallback || img.getAttribute('src') === 'assets/ima/logo.webp') { img.remove(); return; }
    img.dataset.fallback = '1';
    img.src = 'assets/ima/logo.webp';
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
    if (REDUCED_MOTION) { close(); return; }   // sin video intro si el sistema pide reducir movimiento
    skip && skip.addEventListener('click', close);          // botón "Omitir Intro"
    if (video) {
        video.addEventListener('ended', close);             // el video terminó
        video.addEventListener('error', close);             // video inexistente o dañado
        video.addEventListener('loadedmetadata', () => { const d = Number.isFinite(video.duration) ? video.duration : 10; setTimeout(close, (d + 2) * 1000); }); // tope = duración + 2s (10s si no hay duración válida)
        const p = video.play && video.play();               // si el navegador bloquea el autoplay, no dejar la pantalla negra
        if (p && p.catch) p.catch(close);
    }
    setTimeout(() => { if (!video || video.readyState < 1) close(); }, 8000);   // sin datos del video tras 8s: cerrar
})();



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
