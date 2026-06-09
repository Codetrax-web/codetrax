window.addEventListener('load', () => {
    setTimeout(() => {
        document.getElementById('loader').style.display = 'none';
        document.getElementById('content').style.display = 'block';
    }, 1000);
});

document.querySelectorAll('.top-menu a').forEach(link => {
    link.addEventListener('click', (e) => {
        document.querySelectorAll('.top-menu a').forEach(a => a.classList.remove('active'));
        e.target.classList.add('active');
    });
});

document.getElementById('search-terminal').addEventListener('click', () => {
    const cmd = prompt("Ingrese comando:");
    if (cmd) document.querySelector('.cmd').innerText = cmd;
});
