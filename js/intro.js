/* Anti-clickjacking: si alguien incrusta el sitio en un iframe ajeno, lo saca del marco.
   (GitHub Pages no permite cabeceras HTTP, por eso se hace por JavaScript.) */
if (window.top !== window.self) { try { window.top.location = window.self.location; } catch (e) { document.body.innerHTML = ''; } }

(function () {
        const introOverlay = document.getElementById("video-intro-overlay");
        const introVideo = document.getElementById("intro-video");
        const skipIntro = document.getElementById("skip-intro");
        // Guardas null: si falta algún elemento de la intro, ocultar el overlay si existe y salir sin errores.
        // (El return va dentro de esta función: un return a nivel superior sería error de sintaxis en un script clásico.)
        if (!introOverlay || !introVideo || !skipIntro) {
            if (introOverlay) { introOverlay.style.display = "none"; }
            return;
        }
        // Elige el video según el dispositivo: versión vertical 9:16 en teléfonos en vertical, horizontal en el resto.
        // El "?v=2" evita que el navegador reutilice la versión anterior (8 s con audio) guardada en caché.
        const esMovilVertical = matchMedia("(max-width: 768px) and (orientation: portrait)").matches;
        introVideo.src = esMovilVertical ? "assets/ima/intro-vertical.mp4?v=2" : "assets/ima/intro.mp4?v=2";
        // La intro se muestra SIEMPRE en cada visita (sin importar la sesión ni la configuración del sistema).
        // Un solo intento de reproducir el video cuando la página haya cargado por completo;
        // si el navegador bloquea el autoplay, se cierra la intro en vez de dejarla congelada.
        window.addEventListener("load", () => {
            introVideo.muted = true;
            introVideo.playsInline = true;
            introVideo.play().catch(closeIntro);
        });
        // Función para ocultar con una transición suave la intro
        function closeIntro() {
            introVideo.pause();
            introOverlay.style.opacity = "0";
            setTimeout(() => {
                introOverlay.style.display = "none";
            }, 800);
        }
        // Eventos para cerrar la intro: al hacer clic en el botón o cuando termina el video
        skipIntro.addEventListener("click", closeIntro);
        introVideo.addEventListener("ended", closeIntro);
})();
