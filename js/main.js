document.addEventListener('DOMContentLoaded', () => {
    const menuLinks = document.querySelectorAll('.menu a');
    const mainContent = document.getElementById('content');

    // Función para actualizar contenido
    const updateContent = (section) => {
        const searchBar = `
            <label class="gt-field">
                <span class="gt-input">
                    <span class="gt-input__prompt">&gt;</span>
                    <input type="text" class="gt-input__control" placeholder="./build/main">
                </span>
            </label>`;
        
        const views = {
            'home': '<h1>Dashboard</h1>' + searchBar,
            'files': '<h1>Directorio</h1><p>Gestión de archivos.</p>',
            'plans': '<h1>Hoja de Ruta</h1><p>Objetivos activos.</p>',
            'settings': '<h1>Sistema</h1><p>Ajustes de usuario.</p>'
        };
        mainContent.innerHTML = views[section];
    };

    // Eventos de navegación
    menuLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelector('.menu a.active').classList.remove('active');
            link.classList.add('active');
            updateContent(link.getAttribute('data-section'));
        });
    });
});
