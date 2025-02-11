/* ======================
   Imports
   ====================== */
import { BackgroundAnimation } from './background.js';
import { renderHeader, renderProjects } from './cv-renderers.js';
import { fetchCVData, fetchProjects, getCurrentLanguage, setLanguage } from './data-fetchers.js';

/* ======================
   Translations
   ====================== */
const translations = {
    ru: {
        meta: {
            description: "Александр Кудряшов - Системный аналитик с опытом в разработке, системном администрировании и проектировании архитектурных решений",
            keywords: "системный аналитик, разработка, API, Docker, PostgreSQL, Python, SQL",
            title: "Александр Кудряшов - Системный аналитик",
            ogDescription: "Ну привет!"
        },
        welcome: "Привет! \n\nЯ Саша, системный аналитик с опытом в разработке, системном администрировании и проектировании архитектурных решений, а так же люблю делать какие-то тупые проекты.",
        projects: "Проекты",
        cv: "Мое резюме"
    },
    en: {
        meta: {
            description: "Alexander Kudryashov - Systems Analyst with experience in development, system administration, and architectural solutions design",
            keywords: "systems analyst, development, API, Docker, PostgreSQL, Python, SQL",
            title: "Alexander Kudryashov - Systems Analyst",
            ogDescription: "Hello there!"
        },
        welcome: "Hi! \n\nI'm Alex, a systems analyst with experience in development, system administration, and architectural solutions design. I also love making some silly projects.",
        projects: "Projects",
        cv: "My CV"
    }
};

/* ======================
   Theme Management
   ====================== */
const ThemeManager = {
    init() {
        const savedTheme = localStorage.getItem('theme');
        const theme = savedTheme || 'dark';
        document.documentElement.setAttribute('data-theme', theme);

        if (!savedTheme) {
            localStorage.setItem('theme', theme);
        }
    },

    toggle() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);

        const canvas = document.getElementById('background-animation');
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    },

    watchSystemPreference() {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
            if (!localStorage.getItem('theme')) {
                document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
            }
        });
    }
};

/* ======================
   Loading State Management
   ====================== */
const LoadingManager = {
    show() {
        const overlay = document.getElementById('loading-overlay');
        overlay.classList.remove('hidden');
    },

    hide() {
        const overlay = document.getElementById('loading-overlay');
        overlay.classList.add('hidden');
        setTimeout(() => {
            overlay.style.display = 'none';
        }, 300);
    }
};

/* ======================
   Section Management
   ====================== */
const SectionManager = {
    toggle(sectionId) {
        const content = document.getElementById(`${sectionId}-content`);
        const header = content.parentElement.querySelector('.section-header');
        const icon = header.querySelector('.toggle-icon');

        if (!content.classList.contains('expanded')) {
            this.expandSection(content);
        } else {
            this.collapseSection(content);
        }

        icon.classList.toggle('expanded');
    },

    expandSection(content) {
        content.style.height = '0';
        content.classList.add('expanded');
        const height = content.scrollHeight;
        content.style.height = height + 'px';
        setTimeout(() => {
            content.style.height = 'auto';
        }, 300);
    },

    collapseSection(content) {
        const height = content.scrollHeight;
        content.style.height = height + 'px';
        setTimeout(() => {
            content.style.height = '0';
        }, 10);
        setTimeout(() => {
            content.classList.remove('expanded');
        }, 300);
    }
};

/* ======================
   Language Management
   ====================== */
const LanguageManager = {
    updateContent() {
        const lang = getCurrentLanguage();
        const trans = translations[lang];

        // Update meta tags
        document.getElementById('meta-description').content = trans.meta.description;
        document.getElementById('meta-keywords').content = trans.meta.keywords;
        document.getElementById('og-title').content = trans.meta.title;
        document.getElementById('og-description').content = trans.meta.ogDescription;
        document.getElementById('page-title').textContent = trans.meta.title;
        document.documentElement.lang = lang;

        // Update static text
        document.getElementById('welcome-text').textContent = trans.welcome;
        document.getElementById('projects-heading').textContent = trans.projects;
        document.getElementById('cv-heading').textContent = trans.cv;

        // Update language switch button
        const langSwitch = document.getElementById('lang-switch');
        langSwitch.querySelector('.lang-text').textContent = lang === 'ru' ? 'EN' : 'RU';
    },

    toggle() {
        const currentLang = getCurrentLanguage();
        const newLang = currentLang === 'ru' ? 'en' : 'ru';
        setLanguage(newLang);
    }
};

/* ======================
   Page Initialization
   ====================== */
async function initializePage() {
    LoadingManager.show();
    ThemeManager.init();
    document.documentElement.style.visibility = 'hidden';

    try {
        const [cvData, projectsData] = await Promise.all([
            fetchCVData(),
            fetchProjects()
        ]);

        if (cvData && projectsData) {
            renderHeader(cvData);
            const canvas = document.getElementById('background-animation');
            new BackgroundAnimation(canvas, cvData);
            renderProjects(projectsData);
            LanguageManager.updateContent();
        }
    } catch (error) {
        console.error('Failed to initialize page:', error);
        // TODO: Add user-friendly error notification
    } finally {
        LoadingManager.hide();
        document.documentElement.style.visibility = 'visible';
    }

    // Setup event listeners
    document.getElementById('theme-switch').addEventListener('click', () => ThemeManager.toggle());
    document.getElementById('lang-switch').addEventListener('click', () => LanguageManager.toggle());
    ThemeManager.watchSystemPreference();
}

/* ======================
   Event Listeners
   ====================== */
document.addEventListener('DOMContentLoaded', initializePage);

// Make section toggle available globally since it's used in HTML
window.toggleSection = SectionManager.toggle.bind(SectionManager);
