// Espera a que el DOM cargue
document.addEventListener('DOMContentLoaded', () => {
    const menuLinks = document.querySelectorAll('.menu a');
    const mainContent = document.getElementById('content');

    // Manejador de clics para el menú
    menuLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Cambia el estado visual del menú
            document.querySelector('.menu a.active').classList.remove('active');
            link.classList.add('active');

            // Carga contenido basado en el atributo data-section
            const section = link.getAttribute('data-section');
            updateContent(section);
        });
    });
});

// Función simple para actualizar el DOM sin recargar
function updateContent(section) {
    const sections = {
        'home': '<h1>Dashboard</h1><p>Estado del sistema: Optimizado.</p>',
        'files': '<h1>Directorio</h1><p>Explorando assets de CodeTrax.</p>',
        'plans': '<h1>Hoja de Ruta</h1><p>Proyectos en desarrollo.</p>',
        'settings': '<h1>Sistema</h1><p>Configuración del entorno.</p>'
    };
    document.getElementById('content').innerHTML = sections[section];
}
