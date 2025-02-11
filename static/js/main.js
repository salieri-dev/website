import { BackgroundAnimation } from './background.js';
import {
    renderAdditionalEducation,
    renderAttestations,
    renderEducation,
    renderExperience,
    renderHeader,
    renderLanguages,
    renderProjects,
    renderSkills,
    showNotification
} from './cv-renderers.js';
import { fetchCVData, fetchProjects } from './data-fetchers.js';

// Theme management
function initTheme() {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const savedTheme = localStorage.getItem('theme');
    const theme = savedTheme || (prefersDark ? 'dark' : 'light');
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

async function initializePage() {
    showLoading();

    initTheme();
    document.documentElement.style.visibility = 'hidden';

    try {
        const [cvData, projectsData] = await Promise.all([
            fetchCVData(),
            fetchProjects()
        ]);

        if (cvData) {
            renderHeader(cvData);
            renderSkills(cvData);
            renderExperience(cvData);
            renderEducation(cvData);
            renderAdditionalEducation(cvData);
            renderAttestations(cvData);
            renderLanguages(cvData);

            const canvas = document.getElementById('background-animation');
            new BackgroundAnimation(canvas, cvData);
        }

        if (projectsData) {
            renderProjects(projectsData);
        }
    } catch (error) {
        console.error('Failed to initialize page:', error);
        showNotification('Произошла ошибка при загрузке данных');
    } finally {
        hideLoading();
        document.documentElement.style.visibility = 'visible';
    }

    document.getElementById('theme-switch').addEventListener('click', toggleTheme);

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        if (!localStorage.getItem('theme')) {
            document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
        }
    });
}

document.addEventListener('DOMContentLoaded', initializePage);

// Make toggleSection available globally since it's used in HTML
window.toggleSection = toggleSection;
