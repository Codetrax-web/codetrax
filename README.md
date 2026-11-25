# Codetrax — sitio web

Sitio estático de Codetrax, agencia de desarrollo digital: sitios web, apps, sistemas a medida, branding y multimedia. Se publica en GitHub Pages en <https://codetrax-web.github.io/codetrax/> (URL canónica declarada en `index.html`).

En los archivos leídos no hay paso de compilación ni empaquetador: `index.html` carga directamente `css/style.css`, `js/intro.js` y `js/main.js`. El contenido (portafolio, recursos, blog y respuestas del asistente) vive en archivos JSON bajo `data/` y se carga en el navegador con `fetch`. El sitio es una SPA con enrutador por hash (ver [Rutas](#rutas)).

> Alcance de este README: documenta solo lo comprobado en `index.html`, `404.html`, `js/main.js`, `js/intro.js` y los JSON de `data/` (revisión del 24 de noviembre de 2026, rama `main`, head `fe08f760`). Lo que no se leyó está listado en [Pendientes / no verificado](#pendientes--no-verificado), no inventado.

## Estructura

```text
index.html                  Página única: cabecera, menú, <div id="content">, pie y scripts
404.html                    Página de error de GitHub Pages (carga css/style.css y js/404.js)
css/style.css               Estilos (referenciado; contenido no leído en esta revisión)
js/main.js                  Toda la lógica: rutas, renders, búsqueda, likes, chat, formularios
js/intro.js                 Vídeo intro (una vez por sesión) y anti-clickjacking
js/404.js                   Script de la página 404 (referenciado en 404.html; contenido no leído)
data/portafolio/index.json  Proyectos del portafolio
data/recursos/recursos.json Recursos descargables / para probar
data/blog/posts.json        Artículos del blog
data/conocimiento.json      Base de conocimiento del asistente (preguntas y respuestas)
assets/ima/                Imágenes del sitio, logo y vídeos de la intro (intro.mp4, intro-vertical.mp4)
assets/team/               Fotos del equipo (Damian, Ricardo, DynsG, Naoko, Tecno 730, Miguel)
```

Archivos de datos que se cargan con `fetch` desde `js/main.js`:

| Archivo | Para qué se usa |
|---|---|
| `./data/portafolio/index.json` | Tarjetas de `#/portafolio`, buscador y contador de proyectos |
| `./data/recursos/recursos.json` | Tarjetas de `#/recursos` y buscador |
| `./data/blog/posts.json` | Listado y artículos de `#/blog` |
| `./data/conocimiento.json` | Respuestas del asistente (se consulta antes que las respuestas integradas en `main.js`) |

Si un JSON falla o no es un array, el código devuelve `[]` y el sitio sigue funcionando sin esa sección (función `loadJson` en `js/main.js`).

## Rutas

Rutas por hash; cada sección tiene URL propia y funciona el botón “atrás”:

| Ruta | Sección |
|---|---|
| `#/` | Inicio |
| `#/servicios` | Servicios y equipo |
| `#/recursos` | Recursos |
| `#/portafolio` | Portafolio |
| `#/blog` y `#/blog/<slug>` | Blog y artículo |
| `#/donar` | Apoya / donativos |
| `#/contacto` y `#/contacto/enviado` | Contacto y confirmación de envío |
| `#/privacidad`, `#/terminos` | Aviso de privacidad y términos |

Alias viejos que redirigen a las rutas nuevas: `#/files` → servicios, `#/plans` → recursos, `#/settings` → portafolio. Ojo: varios enlaces guardados en `data/conocimiento.json` todavía usan los alias viejos (`#/files`, `#/plans`, `#/settings`); funcionan por la redirección, pero lo correcto para enlaces nuevos es la ruta nueva.

El botón ES/EN del encabezado cambia el idioma de la interfaz (`applyI18n` en `js/main.js`); los textos largos del contenido siguen solo en español.

## Cómo añadir contenido

### Proyecto al portafolio (`data/portafolio/index.json`)

Añade un objeto al array. Todos los campos se usan en las tarjetas; `titulo` es obligatorio (los proyectos sin título se filtran y no se muestran):

```json
{
  "titulo": "Nombre del proyecto",
  "creador": "Nombre de quien lo hizo (p. ej. Damian Cruz, Miguel Pandares, DynsG)",
  "descripcion": "Descripción corta.",
  "imagen": "data/portafolio/<carpeta>/imagen.webp",
  "url": "https://enlace-del-proyecto/",
  "categoria": "Web"
}
```

Categorías usadas hoy: `Web`, `Robótica`, `Branding`, `Multimedia`. El filtro compara la categoría sin acentos ni mayúsculas. El botón del reverso de la tarjeta es “Visita” y abre `url`. El contador “Proyectos Ejecutados” del inicio se calcula desde los datos reales, no está hardcodeado.

### Recurso (`data/recursos/recursos.json`)

```json
{
  "titulo": "Nombre del recurso",
  "creador": "Damian Cruz",
  "descripcion": "Descripción corta.",
  "imagen": "data/recursos/<carpeta>/imagen.webp",
  "url": "https://enlace-para-probar/ o ruta local a un archivo",
  "categoria": "Código",
  "descarga": "https://github.com/codetrax-web/<repo>/archive/refs/heads/main.zip"
}
```

- `url` es el botón “Probar”. Si `url` apunta a un archivo local (ruta relativa) que termina en `.ino`, `.zip`, `.pdf`, etc., en vez de “Probar” aparece el botón “Descargar”.
- `descarga` es opcional y, si existe, es el botón “Descargar”. Solo se aceptan descargas del mismo sitio o de `github.com` / `*.github.com`, y nunca ejecutables (`.exe`, `.bat`, `.sh`, `.msi`, `.apk`, `.scr`).
- Categorías usadas hoy: `Código` y `Robótica`. Los 3 recursos de robótica enlazan su `url` directamente a los `.ino` de `data/recursos/archivos/` (`Sistema_de_Riego.ino`, `Carro_bluetooth.ino`, `Grua_A.ino`).
- No añadas campos que el código no lee: `urlAnterior` (antiguos enlaces de Mediafire) se eliminó de los 3 ítems de robótica el 24-11-2026 porque nada en `main.js` lo usaba.

### Artículo del blog (`data/blog/posts.json`)

```json
{
  "slug": "mi-articulo",
  "titulo": "Título del artículo",
  "fecha": "2026-11-24",
  "tags": ["Arduino", "Robótica"],
  "resumen": "Resumen de una línea.",
  "contenido": "<p>Texto del artículo en HTML.</p>"
}
```

`slug` y `titulo` son obligatorios (sin ellos el artículo se filtra). La ruta es `#/blog/<slug>`. El `contenido` se sanitiza antes de mostrarse: solo se permiten `p, h2, h3, pre, code, a, strong, em, ul, ol, li`; se eliminan `script/style/iframe`, atributos `on*`, `href/src` con `javascript:`/`data:` y `style`. Enlaces internos con formato `#/contacto` funcionan.

### Respuesta del asistente (`data/conocimiento.json`)

Cada entrada es:

```json
{
  "id": "disponibilidad",
  "q": "¿Están aceptando proyectos?",
  "keywords": ["disponible", "disponibilidad", "aceptan"],
  "a": "Sí, en este momento estamos aceptando proyectos nuevos.",
  "link": { "t": "Ir a Contacto", "h": "#/contacto" }
}
```

El asistente (`localAnswer` en `js/main.js`) consulta primero este archivo y responde la entrada con más palabras clave presentes en la pregunta; `link` es opcional. Si el archivo no carga o no hay coincidencia, usa las respuestas integradas `FAQ` de `js/main.js` y, en último caso, `FAQ_DEFAULT`. **Fuente de verdad: `data/conocimiento.json`**; `FAQ` en `main.js` es solo respaldo. No borres de `main.js` el saludo (`hola/buenas/hey`), `FAQ_DEFAULT` ni el mensaje de bienvenida del chat: no existen en `conocimiento.json`.

### Disponibilidad (`AVAILABILITY`)

En `js/main.js`, arriba del todo:

```js
const AVAILABILITY = { open: true }; // cambia open a false cuando tengas la agenda llena
```

Ese flag pinta la insignia del inicio (“Aceptando proyectos en <mes>” / “Agenda llena este mes”). La respuesta de disponibilidad del asistente vive en `data/conocimiento.json` (`id: "disponibilidad"`) y es texto fijo: **hay que actualizarla a mano cada vez que cambie el flag** (hoy `open: true` y el texto dice que sí se aceptan proyectos). Pendiente: hacer que `localAnswer` lea el flag directamente (ver [Pendientes](#pendientes--no-verificado)).

## Configuración

Todos los ajustes editables están al inicio de `js/main.js`, con valores `TU_…` mientras no estén configurados. Nada de lo siguiente es secreto salvo la indicación expresa: **nunca pegues la clave `service_role` de Supabase en este JS público**.

### Supabase — likes y vistas globales (`METRICS`)

```js
const ENABLE_REMOTE_METRICS = true;
const METRICS = { url: 'https://TU_PROYECTO.supabase.co', anonKey: 'TU_ANON_KEY' };
```

Estado actual: sin configurar (siguen los `TU_`). Con `TU_`, los likes se guardan solo en el navegador de cada visitante (`localStorage`) y todo lo demás funciona igual.

Pasos según el comentario en `js/main.js`:

1. Crea un proyecto gratis en supabase.com.
2. Ejecuta `supabase-setup.sql` en el SQL Editor (archivo referenciado en el comentario; contenido no verificado en esta revisión).
3. Copia la Project URL y la clave `anon public` (Settings > API) y pégalas en `METRICS`.

El navegador solo lee la tabla `metricas` (`titulo`, `likes`, `vistas`, por `tabla` = `Portafolio` o `Recursos`) y suma con la función segura del servidor `incrementar_metrica(p_tabla, p_titulo, p_campo, p_delta)`. La clave `anon` es pública por diseño; la seguridad la dan las reglas del SQL.

### Google Places — reseñas (`GOOGLE_REVIEWS`)

```js
const GOOGLE_REVIEWS = { placeId: 'TU_PLACE_ID', apiKey: 'TU_API_KEY' };
```

Estado actual: sin configurar. Necesitas un Perfil de Empresa en Google, su Place ID y una API key restringida a tu dominio. Con `TU_` no se consulta nada y solo se ven los testimonios manuales (`TESTIMONIOS` en `js/main.js`, que con `TU_` no se muestran). Cuando está configurado, consulta Google Places API (New), muestra como máximo 5 reseñas y guarda el resultado 24 h en el navegador (`gr-cache`) para no gastar cuota.

### Formspree — formulario de contacto

El formulario de `#/contacto` (`contact-form` en `js/main.js`) envía por POST a `https://formspree.io/f/xeewykke`, con campos `nombre`, `email`, `servicio` (Desarrollo web / app, Diseño y branding, Multimedia, Videojuegos, Consultoría) y `mensaje`. Tras enviar, Formspree redirige a `https://codetrax-web.github.io/codetrax/#/contacto/enviado`, donde se muestra la confirmación. El comentario del código dice “pega tu ID en TU_ID_FORMSPREE”, pero la acción ya trae un ID real (`xeewykke`); si se crea otro formulario, hay que actualizar esa URL.

Contacto directo (sin formulario): correo `codetraxs@gmail.com` y agenda de Google Meet en `https://calendar.app.google/7iAyjJockVxnrkot9` (enlaces en la vista de contacto).

### Suscripción por correo — Buttondown (`SUBSCRIBE`)

```js
const SUBSCRIBE = { action: 'https://buttondown.com/api/emails/embed-subscribe/TU_USUARIO', field: 'email' };
```

Estado actual: sin configurar. Mientras la acción contenga `TU_`, la sección de suscripción no se muestra. El comentario indica que otros proveedores (MailerLite, Brevo) también sirven pegando la `action` de su formulario y el nombre de su campo de correo.

### Asistente con IA — Cloudflare Worker (`CHAT_API_URL`)

```js
const CHAT_API_URL = 'TU_URL_DEL_WORKER'; // Ej: https://codetrax-chat.tuusuario.workers.dev
```

Estado actual: sin configurar, el chat funciona solo con respuestas locales (sin servidor y sin costo). Con la URL del Worker, el chat pregunta primero a la IA (máx. 15 s) y, si falla, cae solo al modo local. El comentario hace referencia a `worker/worker.js` (contenido no verificado en esta revisión).

### Analítica — Umami (`ANALYTICS`)

Analítica sin cookies con Umami (`https://cloud.umami.is/script.js`). El `umamiId` ya está configurado en `js/main.js`; con `TU_` no se cargaría. Respeta “No rastrear”.

### Donativos (`DONATIONS`)

```js
const DONATIONS = { paypalUser: 'TU_USUARIO_PAYPAL', banco: 'TU_BANCO', titular: 'TU_NOMBRE_TITULAR', clabe: 'TU_CLABE_18_DIGITOS' };
```

Estado actual: sin configurar. Cada método se muestra activo solo si ya está configurado; mientras el valor empiece con `TU_`, aparece como “Próximamente”. Métodos: PayPal (`paypal.me/<usuario>`) y transferencia SPEI por CLABE (con botón para copiarla). `MONTOS` está vacío: la persona escribe la cantidad que quiera.

## Despliegue en GitHub Pages

El sitio es estático: basta con publicar la rama `main` en GitHub Pages (el archivo `index.html` está en la raíz y la URL canónica es `https://codetrax-web.github.io/codetrax/`). No hay paso de build que ejecutar antes de publicar, según los archivos leídos. `404.html` es la página que GitHub Pages muestra en cualquier URL inexistente.

> Pendiente de confirmar (no se vio en los archivos leídos): si Pages publica directamente desde `main` o hay algún workflow / ajuste en la configuración del repositorio. No se encontró ningún workflow en esta revisión porque no se descargó el directorio `.github/`.

### Caché: parámetro `?v=`

Los recursos versionados llevan `?v=` para invalidar la caché del navegador. **Todos llevan el mismo valor al publicar un cambio**; valor unificado actual: `v=20261124`.

| Archivo | Recurso con `?v=` | Valor actual (24-11-2026) |
|---|---|---|
| `index.html` | `css/style.css` | `v=20261124` |
| `index.html` | `js/intro.js` | `v=20261124` |
| `index.html` | `js/main.js` | `v=20261124` |
| `404.html` | `/codetrax/css/style.css` | `v=20261124` |
| `js/intro.js` | `assets/ima/intro-vertical.mp4` | `v=20261124` |
| `js/intro.js` | `assets/ima/intro.mp4` | `v=20261124` |

Nota: en `js/intro.js` el `?v=20261124` de los vídeos existe para no reutilizar una versión anterior del vídeo guardada en caché. `js/main.js` no contiene ningún `?v=`.

### Seguridad (CSP)

`index.html` y `404.html` declaran la misma Content-Security-Policy: scripts propios y Umami, estilos propios y cdnjs, imágenes propias/`data:`/`lh3.googleusercontent.com`, conexiones a Supabase, Workers, Places y Umami, y envíos de formulario a Formspree y Buttondown. Si agregas un servicio externo nuevo, añade su dominio a la CSP o el navegador lo bloqueará. El comentario en `index.html` advierte que `connect-src` aún usa los comodines `https://*.supabase.co` y `https://*.workers.dev`: cuando se configuren el proyecto Supabase y el Worker exactos, hay que sustituirlos por sus hosts exactos.

## Desarrollo local

Sirve la carpeta con un servidor estático local (por ejemplo `python3 -m http.server` en la raíz) y abre `http://localhost:8000`; abrir `index.html` directamente con `file://` no basta porque los JSON se cargan con `fetch`. Para comprobar solo la sintaxis del JS, sin ejecutarlo: `node --check js/main.js` y `node --check js/intro.js`.

## Pendientes / no verificado

Lo siguiente se menciona en el código leído pero su contenido no se descargó ni se verificó en esta revisión; no se documentan pasos sobre ello:

- Contenido de `css/style.css`, `js/404.js`, `supabase-setup.sql`, `worker/worker.js`, `feed.xml` y sitemap (solo referenciados en comentarios o enlaces).
- Configuración de GitHub Pages en el repositorio (rama/carpeta de publicación, dominio propio o workflows en `.github/`).
- Si existe `CNAME` o dominio propio: la URL canónica vista es la de `github.io`.
- Los enlaces de `data/conocimiento.json` que aún usan alias viejos (`#/files`, `#/plans`, `#/settings`) funcionan por redirección, pero conviene migrarlos a las rutas nuevas.
- La respuesta de disponibilidad del asistente no lee el flag `AVAILABILITY.open` (ver [Disponibilidad](#disponibilidad-availability)): al cambiar el flag hay que editar también `data/conocimiento.json`, o aplicar en `js/main.js` el cambio propuesto en el informe de limpieza del 24-11-2026 (hacer que `localAnswer` devuelva la respuesta según el flag).
