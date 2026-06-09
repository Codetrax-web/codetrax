// 1. Gestión del estado de carga (Loader)
window.addEventListener('load', () => {
    const loader = document.getElementById('loader');
    const content = document.getElementById('content');

    // Transición suave: ocultamos el loader tras 1.5 segundos
    setTimeout(() => {
        loader.style.opacity = '0';
        setTimeout(() => {
            loader.style.display = 'none';
            content.style.display = 'block';
        }, 500);
    }, 1500);
});

// 2. Lógica del buscador (Terminal)
const searchInput = document.getElementById('search');

searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    console.log("Buscando proyecto:", query);
    
    // Aquí implementaremos el filtro dinámico una vez 
    // tengamos los archivos JSON conectados.
});
