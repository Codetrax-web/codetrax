async function cargarProyectos() {
    try {
        // Debes apuntar a la ruta exacta donde vive tu JSON
        const respuesta = await fetch('data/portfolio/juego/prueba/datos.json');
        const p = await respuesta.json(); // Ahora es un objeto, no un array
        const contenedor = document.getElementById('portfolio');
        
        // Creamos la tarjeta dinámicamente
        contenedor.innerHTML = `
            <div class="card">
                <h3>${p.titulo}</h3>
                <p>${p.descripcion}</p>
                <p><small>${p.tecnologias.join(', ')}</small></p>
                <a href="${p.link}" target="_blank">Ver Proyecto</a>
            </div>
        `;
    } catch (error) {
        console.error("Error al cargar los datos:", error);
    }
}
