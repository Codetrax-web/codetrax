document.addEventListener('DOMContentLoaded', () => {
    const mainContent = document.getElementById('content');

    // Definición de la función de búsqueda
    const renderSearch = () => `
        <label class="gt-field">
            <span class="gt-input">
                <span class="gt-input__prompt">&gt;</span>
                <input type="text" id="gt-input-target" class="gt-input__control" placeholder="./build/main">
            </span>
        </label>`;

    const views = {
        'home': '<h1>Dashboard</h1>' + renderSearch(),
        'files': `
<div class="files-wrapper">

    <h1 class="files-title">CodeTrax</h1>

    <div class="notification">
        <div class="notiglow"></div>
        <div class="notiborderglow"></div>

        <div class="notititle">
            ¿Qué es CodeTrax?
        </div>

        <div class="notibody">
            CodeTrax es una iniciativa enfocada en el desarrollo de proyectos digitales, herramientas tecnológicas y recursos para la comunidad.
        </div>
    </div>

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

    <h2 class="team-title">Equipo</h2>

    <div class="team-grid">

        <div class="card">

            <b></b>

            <img src="assets/ima/damian.png" alt="Damian CV">

            <div class="content">

                <p class="title">
                    Damian CV
                    <br>
                    <span>Fundador y Desarrollador</span>
                </p>

            </div>

        </div>

    </div>

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

    mainContent.innerHTML = views.home;
    
    // Navegación dinámica
    document.querySelectorAll('.menu a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelector('.menu a.active').classList.remove('active');
            link.classList.add('active');
            mainContent.innerHTML = views[link.getAttribute('data-section')];
        });
    });

    // Listener para el atajo de teclado
    document.addEventListener('keydown', (e) => {
        if (e.key === '/') {
            const input = document.getElementById('gt-input-target');
            if (input) {
                e.preventDefault();
                input.focus();
            }
        }
    });

    console.log("CodeTrax inicializado, Damian. No rompas nada.");
});
