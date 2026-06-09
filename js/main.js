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
                <h1>Directorio</h1>
                <div class="bgblue">
                    <div class="card-info">
                        <h2>¿Qué es CodeTrax?</h2>
                        <p>En Codetrax ayudamos a que tus ideas digitales dejen de ser solo eso: ideas. Transformamos tu visión en proyectos reales, desde la planificación hasta la ejecución.</p>
                    </div>
                </div>
                <h2 style="margin-top: 40px;">Team Members</h2>
                <div class="team-grid">
                    <div class="card-team">
                        <img src="assets/ima/damian.png" alt="Damian">
                        <p class="title">Damian CV<br><span>Fundador/Desa.</span></p>
                    </div>
                </div>
            </div>`,
        'plans': '<h1>Hoja de Ruta</h1><p>Objetivos activos.</p>',
        'settings': '<h1>Sistema</h1><p>Configuración general.</p>'
    };

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
