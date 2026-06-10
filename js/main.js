// Espera a que todo el contenido HTML haya cargado antes de ejecutar el código
document.addEventListener('DOMContentLoaded', () => {

    // Obtiene el contenedor principal donde se mostrará el contenido dinámico
    const mainContent = document.getElementById('content');

    // Definición de la función que genera el campo de búsqueda
    const renderSearch = () => `
        <label class="gt-field">
            <!-- Contenedor del campo -->
            <span class="gt-input">

                <!-- Símbolo tipo terminal -->
                <span class="gt-input__prompt">&gt;</span>

                <!-- Campo de entrada de texto -->
                <input type="text" id="gt-input-target" class="gt-input__control" placeholder="./build/main">

            </span>
        </label>`;

    // Objeto que almacena las diferentes vistas o páginas internas
    const views = {

        // Vista principal (Dashboard)
        'home': '<h1>Dashboard</h1>' + renderSearch(),

        // Vista de información sobre CodeTrax
        'files': `
<section class="about-section">

    <h1 class="about-title">Sobre CodeTrax</h1>

    <div class="about-card">

        <h2>¿Qué es CodeTrax?</h2>

        <p>
            CodeTrax es un estudio digital enfocado en el desarrollo de soluciones tecnológicas,
            diseño web, automatización y proyectos innovadores. Nuestro objetivo es transformar
            ideas en herramientas funcionales que impulsen el crecimiento de personas, creadores
            y organizaciones.
        </p>

    </div>

    <div class="about-card">

        <h2>Nuestra Misión</h2>

        <p>
            Crear experiencias digitales modernas mediante programación, creatividad e innovación,
            ofreciendo productos y servicios que generen valor real para la comunidad.
        </p>

    </div>

    <div class="about-card">

        <h2>Nuestra Visión</h2>

        <p>
            Convertirnos en una referencia en el desarrollo tecnológico independiente,
            fomentando el aprendizaje continuo y la creación de proyectos que inspiren
            a futuras generaciones.
        </p>

    </div>

    <div class="about-card">

        <h2>Nuestros Valores</h2>

        <p>
            Innovación • Creatividad • Compromiso • Trabajo en equipo • Aprendizaje continuo
        </p>

    </div>

</section>
`,
    };

    // Carga la vista Home por defecto al iniciar la página
    mainContent.innerHTML = views.home;
    
    // =========================
    // NAVEGACIÓN DINÁMICA
    // =========================

    // Busca todos los enlaces del menú
    document.querySelectorAll('.menu a').forEach(link => {

        // Agrega un evento de clic a cada enlace
        link.addEventListener('click', (e) => {

            // Evita que el navegador cambie de página
            e.preventDefault();

            // Quita la clase active del enlace actualmente seleccionado
            document.querySelector('.menu a.active').classList.remove('active');

            // Activa visualmente el enlace seleccionado
            link.classList.add('active');

            // Cambia el contenido principal según la sección elegida
            mainContent.innerHTML = views[link.getAttribute('data-section')];
        });
    });

    // =========================
    // ATAJO DE TECLADO
    // =========================

    // Escucha las teclas presionadas
    document.addEventListener('keydown', (e) => {

        // Si se presiona la tecla "/"
        if (e.key === '/') {

            // Busca el input de búsqueda
            const input = document.getElementById('gt-input-target');

            // Si existe el input
            if (input) {

                // Evita que aparezca "/" dentro del campo
                e.preventDefault();

                // Coloca el cursor automáticamente en el input
                input.focus();
            }
        }
    });

    // Mensaje mostrado en la consola al iniciar correctamente
    console.log("CodeTrax inicializado, Damian. No rompas nada.");
});
