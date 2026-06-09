document.addEventListener('DOMContentLoaded', () => {
    const mainContent = document.getElementById('content');
    
    // Función para renderizar buscador
    const renderSearch = () => `
        <label class="gt-field">
            <span class="gt-input">
                <span class="gt-input__prompt">&gt;</span>
                <input type="text" class="gt-input__control" placeholder="./build/main">
            </span>
        </label>`;

    const views = {
        'home': '<h1>Dashboard</h1>' + renderSearch(),
        'files': '<h1>Directorio</h1><p>Archivos del sistema.</p>',
        'plans': '<h1>Hoja de Ruta</h1><p>Metas de CodeTrax.</p>',
        'settings': '<h1>Sistema</h1><p>Configuración general.</p>'
    };

    // Navegación
    document.querySelectorAll('.menu a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelector('.active').classList.remove('active');
            link.classList.add('active');
            mainContent.innerHTML = views[link.dataset.section];
        });
    });

    // Iniciar con Home
    mainContent.innerHTML = views['home'];
});
