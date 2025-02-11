import { BackgroundAnimation } from './background.js';
import {
    renderAdditionalEducation,
    renderAttestations,
    renderEducation,
    renderExperience,
    renderHeader,
    renderLanguages,
    renderSkills,
    showNotification
} from './cv-renderers.js';
import { fetchCVData, getCurrentLanguage, setLanguage } from './data-fetchers.js';

const translations = {
    ru: {
        meta: {
            description: "Резюме Александра Кудряшова - Системного аналитика с опытом в разработке, системном администрировании и проектировании архитектурных решений",
            keywords: "системный аналитик, разработка, API, Docker, PostgreSQL, Python, SQL",
            title: "Резюме - Александр Кудряшов",
            ogDescription: "Резюме системного аналитика с опытом в разработке и проектировании архитектурных решений"
        },
        sections: {
            backToHome: "← На главную",
            skills: "Навыки",
            experience: "Опыт работы",
            education: "Образование",
            additionalEducation: "Дополнительное образование",
            attestations: "Аттестации",
            languages: "Языки"
        },
        errors: {
            loadFailed: "Произошла ошибка при загрузке данных"
        }
    },
    en: {
        meta: {
            description: "CV of Alexander Kudryashov - Systems Analyst with experience in development, system administration, and architectural solutions design",
            keywords: "systems analyst, development, API, Docker, PostgreSQL, Python, SQL",
            title: "CV - Alexander Kudryashov",
            ogDescription: "CV of a systems analyst with experience in development and architectural solutions design"
        },
        sections: {
            backToHome: "← Back to Home",
            skills: "Skills",
            experience: "Experience",
            education: "Education",
            additionalEducation: "Additional Education",
            attestations: "Certifications",
            languages: "Languages"
        },
        errors: {
            loadFailed: "Failed to load data"
        }
    }
};

// Theme management
function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    const theme = savedTheme || 'dark';
    document.documentElement.setAttribute('data-theme', theme);

    if (!savedTheme) {
        localStorage.setItem('theme', theme);
    }
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);

    const canvas = document.getElementById('background-animation');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
}

// Loading state management
function showLoading() {
    const overlay = document.getElementById('loading-overlay');
    overlay.classList.remove('hidden');
}

function hideLoading() {
    const overlay = document.getElementById('loading-overlay');
    overlay.classList.add('hidden');
    setTimeout(() => {
        overlay.style.display = 'none';
    }, 300);
}

function toggleSection(sectionId) {
    const content = document.getElementById(`${sectionId}-content`);
    const header = content.parentElement.querySelector('.section-header');
    const icon = header.querySelector('.toggle-icon');

    if (!content.classList.contains('expanded')) {
        content.style.height = '0';
        content.classList.add('expanded');
        const height = content.scrollHeight;
        content.style.height = height + 'px';
        setTimeout(() => {
            content.style.height = 'auto';
        }, 300);
    } else {
        const height = content.scrollHeight;
        content.style.height = height + 'px';
        setTimeout(() => {
            content.style.height = '0';
        }, 10);
        setTimeout(() => {
            content.classList.remove('expanded');
        }, 300);
    }

    icon.classList.toggle('expanded');
}

function updateContent() {
    const lang = getCurrentLanguage();
    const trans = translations[lang];

    // Update meta tags
    document.getElementById('meta-description').content = trans.meta.description;
    document.getElementById('meta-keywords').content = trans.meta.keywords;
    document.getElementById('og-title').content = trans.meta.title;
    document.getElementById('og-description').content = trans.meta.ogDescription;
    document.getElementById('page-title').textContent = trans.meta.title;
    document.documentElement.lang = lang;

    // Update section headings
    document.getElementById('back-link').textContent = trans.sections.backToHome;
    document.getElementById('skills-heading').textContent = trans.sections.skills;
    document.getElementById('experience-heading').textContent = trans.sections.experience;
    document.getElementById('education-heading').textContent = trans.sections.education;
    document.getElementById('additional-education-heading').textContent = trans.sections.additionalEducation;
    document.getElementById('attestations-heading').textContent = trans.sections.attestations;
    document.getElementById('languages-heading').textContent = trans.sections.languages;

    // Update language switch button
    const langSwitch = document.getElementById('lang-switch');
    langSwitch.querySelector('.lang-text').textContent = lang === 'ru' ? 'EN' : 'RU';
}

function toggleLanguage() {
    const currentLang = getCurrentLanguage();
    const newLang = currentLang === 'ru' ? 'en' : 'ru';
    setLanguage(newLang);
}

async function initializePage() {
    showLoading();
    initTheme();
    document.documentElement.style.visibility = 'hidden';

    try {
        const cvData = await fetchCVData();
        if (cvData) {
            renderHeader(cvData);
            renderSkills(cvData);
            renderExperience(cvData);
            renderEducation(cvData);
            renderAdditionalEducation(cvData);
            renderAttestations(cvData);
            renderLanguages(cvData);
            updateContent();

            const canvas = document.getElementById('background-animation');
            new BackgroundAnimation(canvas, cvData);
        }
    } catch (error) {
        console.error('Failed to initialize page:', error);
        const lang = getCurrentLanguage();
        showNotification(translations[lang].errors.loadFailed);
    } finally {
        hideLoading();
        document.documentElement.style.visibility = 'visible';
    }

    // Setup event listeners
    document.getElementById('theme-switch').addEventListener('click', toggleTheme);
    document.getElementById('lang-switch').addEventListener('click', toggleLanguage);

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        if (!localStorage.getItem('theme')) {
            document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
        }
    });
}

document.addEventListener('DOMContentLoaded', initializePage);

// Make toggleSection available globally since it's used in HTML
window.toggleSection = toggleSection;
