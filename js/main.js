// Esperar a que el navegador termine de cargar los recursos
window.addEventListener('load', () => {
    const loader = document.getElementById('loader');
    const content = document.getElementById('content');

    // Transición simple tras 1.5 segundos
    setTimeout(() => {
        loader.style.display = 'none';
        content.style.display = 'block';
    }, 1500);
});

// Nota: Aquí iría tu función para leer los JSON de la carpeta /data
// Usarías 'fetch()' para cargar los archivos y crear el HTML dinámicamente.
