window.addEventListener('load', () => {
    console.log("Sistema Codetrax inicializado.");
});

document.querySelectorAll('.top-menu a').forEach(link => {
    link.addEventListener('click', (e) => {
        document.querySelector('.active').classList.remove('active');
        link.classList.add('active');
    });
});
