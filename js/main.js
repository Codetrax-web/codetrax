window.addEventListener('load', () => {
    setTimeout(() => {
        document.getElementById('loader').style.display = 'none';
        document.getElementById('content').style.display = 'block';
    }, 800);
});

document.querySelectorAll('.top-menu a').forEach(link => {
    link.addEventListener('click', (e) => {
        document.querySelector('.top-menu a.active').classList.remove('active');
        link.classList.add('active');
    });
});

document.getElementById('search-terminal').addEventListener('click', () => {
    const cmd = prompt("Terminal: comando a ejecutar");
    if (cmd) console.log("Ejecutando:", cmd);
});
