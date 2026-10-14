/* Anti-clickjacking: si alguien incrusta el sitio en un iframe ajeno, lo saca del marco.
   (GitHub Pages no permite cabeceras HTTP, por eso se hace por JavaScript.) */
if (window.top !== window.self) { try { window.top.location = window.self.location; } catch (e) { document.body.innerHTML = ''; } }

        const introOverlay = document.getElementById("video-intro-overlay");
        const introVideo = document.getElementById("intro-video");
        const skipIntro = document.getElementById("skip-intro");
        // Elige el video según el dispositivo: versión vertical 9:16 en teléfonos en vertical, horizontal en el resto.
        // El "?v=2" evita que el navegador reutilice la versión anterior (8 s con audio) guardada en caché.
        const esMovilVertical = matchMedia("(max-width: 768px) and (orientation: portrait)").matches;
        introVideo.src = esMovilVertical ? "assets/ima/intro-vertical.mp4?v=2" : "assets/ima/intro.mp4?v=2";
        // La intro se muestra SIEMPRE en cada visita (sin importar la sesión ni la configuración del sistema).
        // Intenta reproducir el video cuando la página haya cargado por completo
        window.addEventListener("load", () => {
            introVideo.play().catch(() => {
                console.log("El navegador bloqueó la reproducción automática.");
            });
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
    