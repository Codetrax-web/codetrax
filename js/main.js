// ======================================================
// CODETRAX - SCRIPT PRINCIPAL
// ======================================================
// Este archivo controla:
// - Navegación dinámica entre secciones
// - Carga del portafolio
// - Filtros de proyectos
// - Atajos de teclado
// - Renderizado de vistas
// ======================================================

// Espera a que todo el contenido HTML haya cargado antes de ejecutar el código
document.addEventListener('DOMContentLoaded', () => {

// Obtiene el contenedor principal donde se mostrará el contenido dinámico
const mainContent = document.getElementById('content');

// =====================================
// CAMPO DE BÚSQUEDA
// =====================================
// Genera el HTML del buscador mostrado en el Dashboard
const renderSearch = () => ` <label class="gt-field"> <span class="gt-input"> <span class="gt-input__prompt">></span>

```
<input
    type="text"
    id="gt-input-target"
    class="gt-input__control"
    placeholder="./build/main"
>

</span>

</label>
`;
```

// =====================================
// PROYECTOS DEL PORTAFOLIO
// =====================================
// Variable global donde se almacenan los proyectos
// obtenidos desde el archivo JSON
let portfolioProjects = [];

// =====================================
// CARGAR PORTAFOLIO
// =====================================
// Obtiene los proyectos desde:
// data/portafolio/index.json
// y los muestra en pantalla
async function loadPortfolio() {

```
const grid = document.getElementById('portfolio-grid');

// Si no existe el contenedor se cancela la ejecución
if (!grid) return;

try {

    const response = await fetch(
        'data/portafolio/index.json'
    );

    portfolioProjects = await response.json();

    // Muestra todos los proyectos
    renderPortfolio('Todos');

    // Activa los filtros
    initializeFilters();

} catch (error) {

    console.error(
        'Error cargando portafolio:',
        error
    );

    grid.innerHTML = `
    <p>No se pudieron cargar los proyectos.</p>
    `;
}
```

}

// =====================================
// MOSTRAR PROYECTOS
// =====================================
// Renderiza los proyectos dependiendo
// de la categoría seleccionada
function renderPortfolio(category) {

```
const grid = document.getElementById(
    'portfolio-grid'
);

if (!grid) return;

let filteredProjects = portfolioProjects;

// Filtrado por categoría
if (category !== 'Todos') {

    filteredProjects =
        portfolioProjects.filter(
            project =>
                project.categoria === category
        );
}

// Si no existen proyectos
if (filteredProjects.length === 0) {

    grid.innerHTML =
        '<p>No hay proyectos disponibles.</p>';

    return;
}

// Construcción dinámica de tarjetas
grid.innerHTML = filteredProjects.map(project => `

    <div class="project-card">

        <img
            src="${project.imagen}"
            alt="${project.titulo}"
        >

        <h3>${project.titulo}</h3>

        <p>${project.descripcion}</p>

        <a
            href="${project.url}"
            target="_blank"
            class="project-link"
        >

            <button class="button">

                <div class="blob1"></div>

                <div class="blob2"></div>

                <div class="inner">
                    Ver Proyecto
                </div>

            </button>

        </a>

    </div>

`).join('');
```

}

// =====================================
// FILTROS
// =====================================
// Activa los botones de filtro del portafolio
function initializeFilters() {

```
document
    .querySelectorAll('.filter-btn')
    .forEach(button => {

        button.addEventListener(
            'click',
            () => {

                // Quita la clase active
                // de todos los botones
                document
                    .querySelectorAll(
                        '.filter-btn'
                    )
                    .forEach(btn =>
                        btn.classList.remove(
                            'active'
                        )
                    );

                // Activa el botón actual
                button.classList.add(
                    'active'
                );

                // Muestra la categoría seleccionada
                renderPortfolio(
                    button.dataset.filter
                );
            }
        );
    });
```

}

// =====================================
// VISTAS
// =====================================
// Cada propiedad representa una página
// que será cargada dinámicamente
const views = {

```
// =====================================
// DASHBOARD
// =====================================
home: `
    <h1>Dashboard</h1>
    ${renderSearch()}
`,

// =====================================
// SOBRE CODETRAX
// =====================================
files: `

    <section class="about-section">

        <h1 class="about-title">
            Sobre CodeTrax
        </h1>

        <!-- Información principal -->
        <div class="about-card">

            <h2>
                ¿Qué es CodeTrax?
            </h2>

            <p>
                CodeTrax es un estudio digital
                enfocado en el desarrollo de
                soluciones tecnológicas,
                diseño web, automatización
                y proyectos innovadores.
            </p>

        </div>

        <!-- Misión -->
        <div class="about-card">

            <h2>
                Nuestra Misión
            </h2>

            <p>
                Crear experiencias digitales
                modernas mediante programación,
                creatividad e innovación.
            </p>

        </div>

        <!-- Visión -->
        <div class="about-card">

            <h2>
                Nuestra Visión
            </h2>

            <p>
                Convertirnos en una referencia
                tecnológica independiente.
            </p>

        </div>

        <!-- Valores -->
        <div class="about-card">

            <h2>
                Nuestros Valores
            </h2>

            <p>
                Innovación • Creatividad •
                Compromiso • Trabajo en equipo •
                Aprendizaje continuo
            </p>

        </div>

        <!-- Equipo -->
        <div class="about-card">

            <h2>Nuestro Equipo</h2>

            <div class="team-grid">

                <div class="container">

                    <div class="card">

                        <!-- Frente de la tarjeta -->
                        <div class="front">

                            <div class="card-top">
                                <p class="card-top-para">
                                    Fundador
                                </p>
                            </div>

                            <img
                                src="assets/team/damian.jpg"
                                alt="Damian CV"
                                class="team-photo"
                            >

                            <p class="heading">
                                Damian CV
                            </p>

                            <p class="follow">
                                Desarrollador Principal
                            </p>

                        </div>

                        <!-- Parte trasera -->
                        <div class="back">

                            <p class="heading">
                                Redes
                            </p>

                            <div class="icons">

                                <a href="https://www.youtube.com/@DAMIANCV8" target="_blank">
                                    YouTube
                                </a>

                                <a href="https://github.com/TU-USUARIO" target="_blank">
                                    GitHub
                                </a>

                                <a href="https://instagram.com/TU-USUARIO" target="_blank">
                                    Instagram
                                </a>

                            </div>

                        </div>

                    </div>

                </div>

            </div>

        </div>

    </section>

`,

// =====================================
// PORTAFOLIO
// =====================================
plans: `

    <div class="portfolio-page">

        <h1>
            Portafolio
        </h1>

        <!-- Botones de filtrado -->
        <div class="portfolio-filters">

            <button
                class="filter-btn active"
                data-filter="Todos"
            >
                Todos
            </button>

            <button
                class="filter-btn"
                data-filter="Juegos"
            >
                Juegos
            </button>

            <button
                class="filter-btn"
                data-filter="Office"
            >
                Office
            </button>

            <button
                class="filter-btn"
                data-filter="Codigo"
            >
                Código
            </button>

        </div>

        <!-- Aquí se insertan los proyectos -->
        <div id="portfolio-grid"></div>

    </div>

`,

// =====================================
// CONFIGURACIÓN
// =====================================
settings: `

    <section class="about-section">

        <h1 class="about-title">
            Configuración
        </h1>

        <div class="about-card">

            <p>
                Próximamente podrás
                personalizar CodeTrax.
            </p>

        </div>

    </section>

`
```

};

// =====================================
// HOME POR DEFECTO
// =====================================
// Se muestra Dashboard al iniciar
mainContent.innerHTML = views.home;

// =====================================
// NAVEGACIÓN DINÁMICA
// =====================================
// Cambia entre vistas sin recargar la página
document.querySelectorAll('.menu a').forEach(link => {

```
link.addEventListener('click', (e) => {

    e.preventDefault();

    document
        .querySelector('.menu a.active')
        ?.classList.remove('active');

    link.classList.add('active');

    const section =
        link.getAttribute(
            'data-section'
        );

    mainContent.innerHTML =
        views[section];

    // Si entra al portafolio
    // se cargan los proyectos
    if (section === 'plans') {

        loadPortfolio();

    }

});
```

});

// =====================================
// ATAJO DE TECLADO
// =====================================
// Al presionar "/" se enfoca el buscador
document.addEventListener('keydown', (e) => {

```
if (e.key === '/') {

    const input =
        document.getElementById(
            'gt-input-target'
        );

    if (input) {

        e.preventDefault();

        input.focus();

    }
}
```

});

// =====================================
// INICIO
// =====================================
// Mensaje mostrado en la consola al iniciar
console.log(
"CodeTrax inicializado correctamente."
);

});
