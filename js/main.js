// Lógica básica para el enfoque del teclado
document.addEventListener('keydown', (e) => {
    const input = document.getElementById('gt-input-target');
    if (e.key === '/') {
        e.preventDefault();
        input.focus();
    }
});

console.log("CodeTrax inicializado, Damian. No rompas nada.");
