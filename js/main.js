window.addEventListener('load', () => {
    setTimeout(() => {
        document.getElementById('loader').style.display = 'none';
        document.getElementById('content').style.display = 'block';
    }, 1000);
});

// Lógica de navegación del menú
document.querySelectorAll('.menu a').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelectorAll('.menu a').forEach(a => a.classList.remove('active'));
        link.classList.add('active');
    });
});

// Lógica de la terminal
document.getElementById('search-terminal').addEventListener('click', () => {
    const busqueda = prompt("Terminal: Ingrese comando de búsqueda");
    if (busqueda) console.log("Ejecutando:", busqueda);
});
