// 1. Gestión del estado de carga
window.addEventListener('load', () => {
    const loader = document.getElementById('loader');
    const content = document.getElementById('content');

    setTimeout(() => {
        loader.style.opacity = '0';
        setTimeout(() => {
            loader.style.display = 'none';
            content.style.display = 'block';
            // Iniciamos la carga de datos una vez se muestra el contenido
            cargarProyectos();
        }, 500);
    }, 1500);
});

// 2. Función de carga de datos (Va FUERA del evento de carga)
async function cargarProyectos() {
    try {
        const respuesta = await fetch('data/portfolio/juegos.json');
        const proyectos = await respuesta.json();
        const contenedor = document.getElementById('portfolio');
        
        contenedor.innerHTML = proyectos.map(p => `
            <div class="card">
                <h3>${p.titulo}</h3>
                <p>${p.descripcion}</p>
                <a href="${p.link}" target="_blank">Ver Proyecto</a>
            </div>
        `).join('');
    } catch (error) {
        console.error("Error al cargar los proyectos:", error);
    }
}

// 3. Lógica del buscador (También FUERA, al final)
const searchInput = document.getElementById('search');
searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    // Aquí filtrarás las tarjetas existentes
});
