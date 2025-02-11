// Get browser language or fallback to stored preference
function getPreferredLanguage() {
    const storedLang = localStorage.getItem('preferred_language');
    if (storedLang) {
        return storedLang;
    }

    const browserLang = navigator.language || navigator.userLanguage;
    return browserLang.startsWith('ru') ? 'ru' : 'en';
}

// Set language preference
function setLanguage(lang) {
    localStorage.setItem('preferred_language', lang);
    // Trigger page reload to update content
    window.location.reload();
}

// Get current language
function getCurrentLanguage() {
    return localStorage.getItem('preferred_language') || getPreferredLanguage();
}

async function fetchCVData() {
    try {
        const lang = getCurrentLanguage();
        const response = await fetch(`static/assets/data/cv_data_${lang}.yaml`);
        if (!response.ok) {
            throw new Error('Failed to fetch CV data');
        }
        const yamlText = await response.text();
        return jsyaml.load(yamlText);
    } catch (error) {
        console.error('Error fetching CV data:', error);
        return null;
    }
}

async function fetchProjects() {
    try {
        const lang = getCurrentLanguage();
        const response = await fetch(`static/assets/data/projects_${lang}.yaml`);
        if (!response.ok) {
            throw new Error('Failed to fetch projects data');
        }
        const yamlText = await response.text();
        return jsyaml.load(yamlText);
    } catch (error) {
        console.error('Error fetching projects:', error);
        return null;
    }
}

export { fetchCVData, fetchProjects, getCurrentLanguage, setLanguage };

