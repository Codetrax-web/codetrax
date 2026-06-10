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
<div class="files-wrapper">

    <!-- Título principal -->
    <h1 class="files-title">CodeTrax</h1>

    <!-- Tarjeta informativa -->
    <div class="notification">

        <!-- Efecto de brillo interno -->
        <div class="notiglow"></div>

        <!-- Efecto de borde brillante -->
        <div class="notiborderglow"></div>

        <!-- Título de la notificación -->
        <div class="notititle">
            ¿Qué es CodeTrax?
        </div>

        <!-- Descripción -->
        <div class="notibody">
            CodeTrax es una iniciativa enfocada en el desarrollo de proyectos digitales, herramientas tecnológicas y recursos para la comunidad.
        </div>

    </div>

    <!-- Segunda tarjeta informativa -->
    <div class="notification">

        <div class="notiglow"></div>
        <div class="notiborderglow"></div>

        <div class="notititle">
            Nuestra Misión
        </div>

        <div class="notibody">
            Transformar ideas en soluciones reales mediante programación, diseño e innovación.
        </div>

    </div>

    <!-- Sección del equipo -->
    <h2 class="team-title">Equipo</h2>

    <div class="team-grid">

        <!-- Tarjeta de integrante -->
        <div class="card">

            <!-- Elemento decorativo -->
            <b></b>

            <!-- Imagen del integrante -->
            <img src="assets/ima/damian.png" alt="Damian CV">

            <div class="content">

                <!-- Nombre y cargo -->
                <p class="title">
                    Damian CV
                    <br>
                    <span>Fundador y Desarrollador</span>
                </p>

            </div>

        </div>

    </div>

    <!-- Tarjeta de valores -->
    <div class="notification">

        <div class="notiglow"></div>
        <div class="notiborderglow"></div>

        <div class="notititle">
            Nuestros Valores
        </div>

        <div class="notibody">
            Innovación • Creatividad • Trabajo en equipo • Compromiso • Aprendizaje continuo
        </div>

    </div>

</div>
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
