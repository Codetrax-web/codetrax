/* =====================================================

   INICIALIZACIÓN DEL DOM

   Espera a que el HTML cargue para ejecutar la lógica

==================================================== */

document.addEventListener('DOMContentLoaded', () => {

   loadPortfolio().catch(err => console.error("Datos iniciales no disponibles:", err));

   console.log("CodeTrax inicializado correctamente.");

    const mainContent = document.getElementById('content');



    /* =====================================================

       ESTRUCTURAS DE DATOS Y RENDERIZADO

    ===================================================== */

const renderSearch = () => `

    <div class="gt-field">

        <span class="gt-input">

            <span class="gt-input__prompt">&gt;</span>

            <input type="text" id="gt-input-target" class="gt-input__control" placeholder="Buscar proyectos...">

        </span>

        <div id="search-results-grid"></div> </div>

`;

    let portfolioProjects = [];
    let filtersInitialized = false; // evita ligaduras múltiples de eventos

    /* FIN ESTRUCTURAS DE DATOS */

   const searchableData = [

    ...portfolioProjects,

    { titulo: "Damian cruz", descripcion: "Fundador, Desarrollador principal | Codetrax" },

    { titulo: "Ricardo", descripcion: "Socio, Desarrollador | Codetrax" },

    { titulo: "Tecno 730", descripcion: "Socio, Diseñador | tecno730" },

    { titulo: "Miguel Pandares", descripcion: "Socio, Desarrollador | Axira studios" },

    { titulo: "DynsG", descripcion: "Socia, Diseñadora | Codetrax" }

];



    /* =====================================================

       LÓGICA DEL PORTAFOLIO

       Carga datos externos y gestiona filtros

    ===================================================== */

   async function loadPortfolio() {

    try {

        // Carga ambos archivos en paralelo para optimizar

        const [portafolioRes, recursosRes] = await Promise.all([

            fetch('./data/portafolio/index.json'),

            fetch('./data/recursos/recursos.json')

        ]);

        

        const portafolioData = await portafolioRes.json();

        const recursosData = await recursosRes.json();

        

        portfolioProjects = portafolioData; // Para el renderizado normal



        // Fusiona ambos para el buscador, incluyendo al equipo

        window.searchableData = [

            ...portafolioData,

            ...recursosData,

            { titulo: "Damian cruz", descripcion: "Fundador: Mexico, Desarrollador principal | Codetrax", imagen: "assets/team/Damian.jpg", url: "https://codetrax-web.github.io/presentasion/" },

            { titulo: "Ricardo", descripcion: "Socio: Mexico, Desarrollador | Ricardo", imagen: "assets/team/ricardo.jpg", url: "#" },

            { titulo: "DynsG", descripcion: "Socia: Colombia, Diseñadora | DynsG", imagen: "assets/team/DynsG.jpg", url: "https://youtube.com/@dyns.g-oficial?si=Nhl0NTcDzmamv2s7" },

            { titulo: "Tecno 730", descripcion: "Socio: Venezuela, Diseñador | tecno730", imagen: "assets/team/tecno.jpg", url: "https://linktr.ee/__TECNO730__" },

            { titulo: "Miguel Pandares", descripcion: "Socio: Venezuela, Desarrollador | Axira studios", imagen: "assets/team/Miguel.jpg", url: "https://linktr.ee/migueltime" }

        ];



        renderPortfolio('Todos');

        initializeFilters();

    } catch (error) {

        console.error('Error cargando datos:', error);

    }

}

    function renderPortfolio(category) {

    const grid = document.getElementById('portfolio-grid');

    if (!grid) return;



    // Lógica de filtrado

    let filteredProjects = category !== 'Todos' 

        ? portfolioProjects.filter(project => project.categoria?.toLowerCase() === category.toLowerCase())

        : portfolioProjects;



    // Validación de estado vacío con estilo consistente

    if (filteredProjects.length === 0) {

        grid.innerHTML = `

            <div style="grid-column: 1/-1; text-align: center; padding: 40px; background: rgba(0,0,0,0.3); border-radius: 20px; backdrop-filter: blur(10px);">

                <p style="color: #fff; font-size: 1.2rem;">No hay proyectos disponibles.</p>

            </div>`;

        return;

    }



    // Renderizado de tarjetas

    grid.innerHTML = filteredProjects.map(project => `

        <div class="project-card">

            <img src="${project.imagen}" alt="${project.titulo}" onerror="this.src='assets/placeholder.jpg'">

            <h3>${project.titulo}</h3>

            <p style="font-size: 0.85rem; color: #a1a1aa;">Creador: ${project.creador || 'Desconocido'}</p>

            <p>${project.descripcion}</p>

            <a href="${project.url}" target="_blank" class="project-link">

                <button class="button">

                    <div class="blob1"></div>

                    <div class="blob2"></div>

                    <div class="inner">Ver Proyecto</div>

                </button>

            </a>

        </div>

    `).join('');

}



    function initializeFilters() {
        // Usar delegación de eventos sobre mainContent y evitar múltiples ligaduras
        if (filtersInitialized) return;

        if (!mainContent) return;

        mainContent.addEventListener('click', (e) => {
            const btn = e.target.closest && e.target.closest('.filter-btn');
            if (!btn) return;

            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.dataset.filter || 'Todos';

            if (document.getElementById('recursos-container')) {
                loadRecursos(filter);
            } else {
                renderPortfolio(filter);
            }
        });

        filtersInitialized = true;
    }

      // Debounce helper para el input de búsqueda
      function debounce(fn, wait) {
          let t;
          return function(...args) {
              clearTimeout(t);
              t = setTimeout(() => fn.apply(this, args), wait);
          };
      }

      const handleSearch = (e) => {
          if (e.target.id !== 'gt-input-target') return;

          const term = e.target.value.trim().toLowerCase();
          const resultsGrid = document.getElementById('search-results-grid');

          if (!term || !window.searchableData) {
              if (resultsGrid) resultsGrid.innerHTML = '';
              return;
          }

          const filtered = window.searchableData.filter(p =>
              p.titulo?.toLowerCase().includes(term) ||
              (p.descripcion && p.descripcion.toLowerCase().includes(term))
          );

          if (!resultsGrid) return;

          resultsGrid.innerHTML = filtered.map(p => `
              <div class="project-card">
                  <img src="${p.imagen}" alt="${p.titulo}" onerror="this.src='assets/placeholder.jpg'">
                  <h3>${p.titulo}</h3>
                  <p>${p.descripcion}</p>
                  <a href="${p.url}" target="_blank" class="project-link">
                      <button class="button"><div class="inner">Ver</div></button>
                  </a>
              </div>
          `).join('');
      };

      const debouncedSearch = debounce(handleSearch, 250);

      document.addEventListener('input', debouncedSearch);

});

    /* FIN LÓGICA DEL PORTAFOLIO */



    /* =====================================================

       GESTIÓN DE VISTAS

       Definición de las plantillas HTML para cada sección

    ===================================================== */

    const views = {

     home: `

     <h1>Dashboard</h1>

     ${renderSearch()}

     <div class="social-container">Buscando...</div>

      `,

      files: `

    <section class="about-section">

        <h1 class="about-title">Sobre CodeTrax</h1>

        <div class="about-card">

            <h2>01 // ¿Qué es CodeTrax?</h2>

            <p>En CodeTrax transformamos conceptos abstractos en infraestructura digital de alto rendimiento. Somos una agencia de desarrollo especializada en materializar ideas complejas mediant[...]

        </div>

        <div class="about-card">

            <h2>02 // Servicios / Qué ofrecemos:</h2>

            <p> Desarrollo Digital: Apps, plataformas y herramientas funcionales</p>

            <p> Consultoría de Proyectos: Planificamos y estructuramos tu proyecto para que sea viable, escalable y efectivo.</p>

            <p> Diseño y Experiencia: Cada proyecto se entrega con estética, usabilidad y funcionalidad optimizadas.</p>

        </div>

        <div class="about-card">

            <h2>03 // Filosofía [Misión y Valores]:</h2>

            <p>Misión: Desarrollar ingeniería digital que trabaje para ti. Elevamos el estándar técnico para que la tecnología no sea un obstáculo, sino tu mayor ventaja competitiva.</p>

            <p>Valores:</p>

            <p>+ Precisión</p>

            <p>+ Innovación</p>

            <p>+ Compromiso</p>

        </div>

        <div class="about-card">

            <h2>04 // Metodología / Cómo trabajamos:</h2>

            <p>Nuestra metodología se ejecuta en un ciclo cerrado de cuatro fases:</p>

            <p>1° [ANÁLISIS] Evaluamos los requerimientos técnicos y estructuramos la lógica del proyecto.</p>

            <p>2° [DESARROLLO] Traducimos la arquitectura planificada en código limpio y funcional.</p>

            <p>3° [OPTIMIZACIÓN] Sometemos el sistema a pruebas rigurosas de rendimiento y diseño responsivo.</p>

            <p>4° [DESPLIEGUE] Lanzamos la plataforma oficialmente al entorno de producción, lista para operar.</p>

        </div>

        <div class="about-card">

            <h2>05 // Infraestructura [Equipo]:</h2>

            <div class="team-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px;">

            

                <div class="card red">

                    <div class="profile-tag">Fundador: Mexico</div>

                    <img src="assets/team/Damian.jpg" alt="Foto" class="team-photo">

                    <h2>Damian cruz</h2>

                    <p>Desarrollador principal | Codetrax</p>

               <div class="social-links" style="margin-top: 10px; display: flex; justify-content: center; gap: 15px;">

                     <a href="https://www.instagram.com/damia_ncv" target="_blank" style="color:white; font-size: 1.2rem;"><i class="fab fa-instagram"></i></a>

                     <a href="https://github.com/Codetrax-web" target="_blank" style="color:white; font-size: 1.2rem;"><i class="fab fa-github"></i></a>

                     <a href="https://www.tiktok.com/@damian_cdx?is_from_webapp=1&sender_device=pc" target="_blank" target="_blank" style="color:white; font-size: 1.2rem;"><i class="fab fa-tiktok[...]

                     <a href="https://discord.com/invite/rsAwuCg6xK" target="_blank" style="color:white; font-size: 1.2rem;"><i class="fab fa-discord"></i></a>

                    <a href="https://www.youtube.com/@DAMIANCDX" target="_blank" style="color:white;"><i class="fab fa-youtube"></i></a>

               </div>

                </div>



                <div class="card yellow">

                    <div class="profile-tag">Socio: Mexico</div>

                    <img src="assets/team/ricardo.jpg" alt="Foto" class="team-photo">

                    <h2>Ricardo</h2>

                    <p>Desarrollador | Codetrax</p>

               <div class="social-links" style="margin-top: 15px; display: flex; justify-content: center; gap: 15px; font-size: 1.2rem;
