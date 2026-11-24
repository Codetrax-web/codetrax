// 404: muestra el mensaje en inglés si el idioma guardado (o del navegador) es inglés.
// Script externo (no inline) para que la meta CSP de 404.html pueda usar script-src 'self'.
(function () {
    var message = document.getElementById("m");
    var button = document.getElementById("b");
    if (!message || !button) { return; }
    var lang = "es";
    try {
        lang = (localStorage.getItem("lang") || navigator.language || "es").slice(0, 2);
    } catch (e) {
        lang = (navigator.language || "es").slice(0, 2);
    }
    if (lang === "en") {
        message.textContent = "This page does not exist or was moved.";
        button.textContent = "Back to home";
        document.documentElement.lang = "en";
    }
})();
