# 🎯 Sistema de Propósitos de Año Nuevo

[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

**Un sistema de seguimiento personal para propósitos de año nuevo con gamificación, análisis visual y persistencia de datos.**

---

## 📋 Descripción

Este proyecto es una aplicación web interactiva diseñada para rastrear el progreso de propósitos anuales mediante un sistema de puntuación gamificado. Permite establecer metas en diferentes categorías (Oro, Plata, Bronce) y visualizar el avance a lo largo del año.

### ✨ Características Principales

- 🏆 **Sistema de Puntuación Gamificado** — Metas categorizadas por prioridad con puntos asignados
- 📊 **Visualización de Datos** — Gráficas interactivas con Chart.js
- 💾 **Persistencia Local** — Los datos se guardan automáticamente en el navegador
- 📱 **Diseño Responsivo** — Optimizado para desktop, tablet y móvil
- 🔄 **Exportar/Importar** — Respaldo y restauración de progreso en formato JSON
- ♿ **Accesibilidad** — ARIA labels y navegación por teclado

---

## 📁 Estructura del Proyecto

```
my-resolutions/
│
├── 📄 README.md             # Este archivo
│
├── 📂 pages/                # Páginas HTML
│   ├── index.html           # Landing page
│   └── 2026.html            # Dashboard de propósitos 2026
│
└── 📂 src/                  # Código fuente
    │
    ├── 📂 css/              # Estilos CSS
    │   ├── main.css         # Estilos globales y variables
    │   ├── index.css        # Estilos de la landing page
    │   └── dashboard.css    # Estilos del dashboard
    │
    └── 📂 js/               # Scripts JavaScript
        ├── app.js           # Utilidades compartidas
        └── dashboard.js     # Lógica del dashboard
```

---

## 🚀 Inicio Rápido

### Opción 1: Abrir directamente

1. Clona o descarga el repositorio
2. Abre `pages/index.html` en tu navegador
3. ¡Comienza a registrar tu progreso!

### Opción 2: Servidor local (recomendado)

```bash
# Con Python
python -m http.server 8000

# Con Node.js
npx serve

# Con VS Code
# Usar la extensión "Live Server"
```

Luego navega a `http://localhost:8000/pages/`

---

## 🏗️ Arquitectura

### Sistema de Puntuación

| Categoría | Puntos | Descripción |
|-----------|--------|-------------|
| 🥇 **Oro** | 65 pts | Objetivos de alto impacto: Inglés, Especialización, Finanzas, Salud |
| 🥈 **Plata** | 25 pts | Hábitos consistentes: Trabajo, Familia, Imagen, Espacio |
| 🥉 **Bronce** | 10 pts | Entretenimiento y balance: Gaming, Anime, Cine |
| ⭐ **Extras** | 10+ pts | Bonificaciones adicionales: Certificaciones, Ahorro extra |

### Matriz de Evaluación

| Rango | Calificación |
|-------|--------------|
| 90 - 100+ | 🟢 SOBRESALIENTE |
| 75 - 89 | 🔵 SATISFACTORIO |
| 60 - 74 | 🟡 REGULAR |
| 40 - 59 | 🟠 INSUFICIENTE |
| 0 - 39 | 🔴 DEFICIENTE |

---

## 🛠️ Tecnologías

- **HTML5** — Estructura semántica con accesibilidad
- **CSS3** — Custom properties, Flexbox, Grid
- **JavaScript ES6+** — Módulos IIFE, localStorage API
- **[Tailwind CSS](https://tailwindcss.com/)** — Framework de utilidades CSS (CDN)
- **[Chart.js](https://www.chartjs.org/)** — Visualización de datos
- **[Font Awesome](https://fontawesome.com/)** — Iconografía
- **[Google Fonts](https://fonts.google.com/)** — Tipografía Inter

---

## 💾 Gestión de Datos

### Exportar Progreso

1. Click en **"Exportar"** en la barra de navegación
2. Se descargará un archivo `propositos-2026-backup.json`
3. Guarda este archivo como respaldo

### Importar Progreso

1. Click en **"Importar"** en la barra de navegación
2. Selecciona un archivo `.json` previamente exportado
3. El progreso se restaurará automáticamente

### Reiniciar

- Click en **"Reiniciar"** para comenzar desde cero
- ⚠️ Esta acción no se puede deshacer

---

## 📱 Responsive Design

El sistema está optimizado para diferentes dispositivos:

| Dispositivo | Breakpoint | Características |
|-------------|------------|-----------------|
| 📱 Móvil | < 640px | Menú hamburguesa, columna única |
| 📱 Tablet | 640px - 1024px | Grid adaptativo |
| 💻 Desktop | > 1024px | Layout completo de dos columnas |

---

## 🎨 Personalización

### Variables CSS

Modifica las variables en `src/css/main.css`:

```css
:root {
    /* Colores principales */
    --color-primary: #3b82f6;
    --color-gold: #f59e0b;
    --color-silver: #6b7280;
    --color-bronze: #ea580c;
    
    /* Tipografía */
    --font-primary: 'Inter', sans-serif;
    
    /* Espaciado */
    --spacing-unit: 0.25rem;
}
```

---

## 📊 Capturas de Pantalla

<details>
<summary>Ver capturas</summary>

### Landing Page
*Página de inicio con navegación por años*

### Dashboard
*Panel principal con todas las metas y visualizaciones*

### Móvil
*Vista optimizada para dispositivos móviles*

</details>

---

## 🤝 Contribuir

Este es un proyecto personal, pero sugerencias son bienvenidas:

1. Fork el repositorio
2. Crea una rama (`git checkout -b feature/mejora`)
3. Commit tus cambios (`git commit -am 'Añade mejora'`)
4. Push a la rama (`git push origin feature/mejora`)
5. Abre un Pull Request

---

## 📝 Licencia

Este proyecto es de uso personal. Siéntete libre de usarlo como inspiración para tu propio sistema de seguimiento de metas.

---

## 👤 Autor

**Williams**

- 🎯 Proyecto: Sistema de Propósitos 2026
- 📅 Versión: 2.0
- 🔄 Última actualización: 2025

---

<div align="center">

**¡El éxito es la suma de pequeños esfuerzos repetidos día tras día!** 💪

</div>
