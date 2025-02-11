import { getCurrentLanguage } from './data-fetchers.js';

const dateFormatters = {
    ru: (dateStr) => {
        if (!dateStr) return 'По настоящее время';
        const date = new Date(dateStr);
        return date.toLocaleDateString('ru-RU', { year: 'numeric', month: 'long' });
    },
    en: (dateStr) => {
        if (!dateStr) return 'Present';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
    }
};

function formatDate(dateStr) {
    const lang = getCurrentLanguage();
    return dateFormatters[lang](dateStr);
}

function encodeValue(value) {
    const base64 = btoa(value);
    return base64.replace(/[a-zA-Z]/g, c =>
        String.fromCharCode(c.charCodeAt(0) + (c.toLowerCase() <= 'm' ? 13 : -13))
    );
}

function decodeValue(encoded) {
    const base64 = encoded.replace(/[a-zA-Z]/g, c =>
        String.fromCharCode(c.charCodeAt(0) + (c.toLowerCase() <= 'm' ? 13 : -13))
    );
    return atob(base64);
}

const notifications = {
    ru: {
        copied: 'Скопировано в буфер обмена',
        copyFailed: 'Не удалось скопировать'
    },
    en: {
        copied: 'Copied to clipboard',
        copyFailed: 'Failed to copy'
    }
};

function showNotification(messageKey) {
    const lang = getCurrentLanguage();
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = notifications[lang][messageKey];
    document.body.appendChild(notification);

    setTimeout(() => notification.classList.add('show'), 10);

    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}

function renderHeader(data) {
    const header = document.getElementById('header');
    header.innerHTML = `
        <h1 class="name">${data.first_name} ${data.last_name}</h1>
        <div class="title">${data.title}</div>
        <div class="contact-info">
            ${data.contact.map(contact => {
        const contactValue = contact.value.formatted || contact.value;

        if (contact.type.id === 'github') {
            return `
                        <a href="https://github.com/${contactValue}" target="_blank" rel="noopener" class="contact-item">
                            <span class="contact-type">${contact.type.name}</span>
                            <span class="contact-value">${contactValue}</span>
                            ${contact.comment ? `<span class="contact-comment">${contact.comment}</span>` : ''}
                        </a>
                    `;
        }

        const encodedValue = encodeValue(contactValue);
        return `
                    <div class="contact-item">
                        <span class="contact-type">${contact.type.name}</span>
                        <span class="contact-value" data-encoded="${encodedValue}" data-type="${contact.type.id}">${getCurrentLanguage() === 'ru' ? 'Раскрыть' : 'Reveal'}</span>
                        ${contact.comment ? `<span class="contact-comment">${contact.comment}</span>` : ''}
                    </div>
                `;
    }).join('')}
        </div>
    `;

    document.querySelectorAll('.contact-item:not(a)').forEach(item => {
        const valueElement = item.querySelector('.contact-value');
        item.style.cursor = 'pointer';
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const encoded = valueElement.getAttribute('data-encoded');
            const type = valueElement.getAttribute('data-type');
            const decodedValue = decodeValue(encoded);

            if (valueElement.textContent === (getCurrentLanguage() === 'ru' ? 'Раскрыть' : 'Reveal')) {
                const displayValue = type === 'telegram'
                    ? `@${decodedValue.replace('@', '')}`
                    : type === 'github'
                        ? decodedValue.replace('https://', '')
                        : decodedValue;
                valueElement.textContent = displayValue;
            } else {
                navigator.clipboard.writeText(valueElement.textContent)
                    .then(() => {
                        showNotification('copied');
                    })
                    .catch(err => {
                        console.error('Failed to copy:', err);
                        showNotification('copyFailed');
                    });
            }
        });
    });
}

function renderSkills(data) {
    const skillsContent = document.getElementById('skills-content');
    skillsContent.innerHTML = Object.entries(data.skill_set).map(([category, skills]) => `
        <div class="skill-category">
            <h3 class="skill-category-title">${category}</h3>
            <div class="skill-list">
                ${skills.map(skill => `
                    <span class="skill-item" title="${skill}">${skill}</span>
                `).join('')}
            </div>
        </div>
    `).join('');
}

function renderExperience(data) {
    const experienceContent = document.getElementById('experience-content');
    experienceContent.innerHTML = data.experience.map(exp => `
        <div class="experience-item">
            <div class="experience-header">
                <div>
                    <div class="company">${exp.company}</div>
                    <div class="position">${exp.position}</div>
                </div>
                <div class="date">
                    ${formatDate(exp.start)} — ${formatDate(exp.end)}
                </div>
            </div>
            <div class="description">${exp.description}</div>
        </div>
    `).join('');
}

function renderEducation(data) {
    const educationContent = document.getElementById('education-content');
    educationContent.innerHTML = `
        <ul class="education-list">
            ${data.education.primary.map(edu => `
                <li class="education-item">
                    <div class="education-name">${edu.name}</div>
                    <div class="education-organization">${edu.organization}</div>
                    <div class="education-result">
                        <span class="education-degree">${edu.result}</span>
                        <span class="education-year">${edu.year}</span>
                    </div>
                </li>
            `).join('')}
        </ul>
    `;
}

function renderAdditionalEducation(data) {
    const additionalEducationContent = document.getElementById('additional-education-content');
    additionalEducationContent.innerHTML = `
        <ul class="education-list">
            ${data.education.additional.map(edu => `
                <li class="education-item">
                    <div class="education-name">${edu.name}</div>
                    <div class="education-organization">${edu.organization}</div>
                    <div class="education-result">
                        <span class="education-degree">${edu.result}</span>
                        <span class="education-year">${edu.year}</span>
                    </div>
                </li>
            `).join('')}
        </ul>
    `;
}

function renderAttestations(data) {
    const attestationsContent = document.getElementById('attestations-content');
    attestationsContent.innerHTML = `
        <ul class="education-list">
            ${data.education.attestation.map(att => `
                <li class="education-item">
                    <div class="education-name">${att.name}</div>
                    <div class="education-result">
                        <span class="education-degree">${att.result}</span>
                        <span class="education-year">${att.year}</span>
                    </div>
                </li>
            `).join('')}
        </ul>
    `;
}

function renderLanguages(data) {
    const languagesContent = document.getElementById('languages-content');
    languagesContent.innerHTML = `
        <ul class="language-list">
            ${data.language.map(lang => `
                <li class="language-item">
                    <span class="language-name">${lang.name}</span>
                    <span class="language-level">${lang.level.name}</span>
                </li>
            `).join('')}
        </ul>
    `;
}

function renderProjects(projects) {
    const projectsContent = document.getElementById('projects-content');
    projectsContent.innerHTML = `
        <div class="projects-grid">
            ${projects.projects.map(project => {
        const isExternalUrl = project.url.match(/^(https?:\/\/|t\.me\/)/i);
        const fullUrl = isExternalUrl ?
            (project.url.startsWith('t.me/') ? `https://${project.url}` : project.url) :
            `${window.location.protocol}//${window.location.host}${project.url}`;

        return `
                    <a href="${fullUrl}" target="_blank" rel="noopener noreferrer" class="project-item">
                        <div class="project-header">
                            ${project.icon ? `<img src="/static/assets/images/${project.icon}" alt="${project.name}" class="project-icon">` : ''}
                            <div class="project-name">${project.name}</div>
                        </div>
                        <div class="project-description">${project.description}</div>
                        <div class="project-tags">
                            ${project.tags.map(tag => `
                                <span class="project-tag">${tag}</span>
                            `).join('')}
                        </div>
                    </a>
                `;
    }).join('')}
        </div>
    `;
}

export {
    renderAdditionalEducation,
    renderAttestations, renderEducation, renderExperience, renderHeader, renderLanguages,
    renderProjects, renderSkills, showNotification
};

