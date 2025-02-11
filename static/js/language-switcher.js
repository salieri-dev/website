let currentLang = 'ru';
let translations = {};

export async function initializeLanguage() {
    // Load both language files
    const [ruData, enData] = await Promise.all([
        fetch('/static/assets/data/mortgage_ru.json').then(r => r.json()),
        fetch('/static/assets/data/mortgage_en.json').then(r => r.json())
    ]);

    translations = {
        ru: ruData,
        en: enData
    };

    // Set initial language
    const savedLang = localStorage.getItem('mortgageCalcLang') || 'ru';
    await setLanguage(savedLang);

    // Add language switch button click handler
    document.getElementById('langSwitch').addEventListener('click', async () => {
        const newLang = currentLang === 'ru' ? 'en' : 'ru';
        await setLanguage(newLang);
    });
}

export async function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('mortgageCalcLang', lang);

    const t = translations[lang];

    // Update document language and meta tags
    document.documentElement.lang = lang;
    document.title = t.meta.title;
    document.querySelector('meta[name="description"]').content = t.meta.description;
    document.querySelector('meta[name="keywords"]').content = t.meta.keywords;
    document.querySelector('meta[property="og:locale"]').content = t.meta.locale;

    // Update schema.org metadata
    const schemaScripts = document.querySelectorAll('script[type="application/ld+json"]');
    schemaScripts.forEach((script, index) => {
        const schema = JSON.parse(script.textContent);
        if (schema['@type'] === 'WebApplication') {
            schema.name = t.meta.schema.app.name;
            schema.description = t.meta.schema.app.description;
            schema.offers.priceCurrency = t.meta.schema.app.currency;
        } else if (schema['@type'] === 'BreadcrumbList') {
            schema.itemListElement[0].name = t.meta.schema.breadcrumb.home;
            schema.itemListElement[1].name = t.meta.schema.breadcrumb.calculator;
        } else if (schema['@type'] === 'FinancialCalculator') {
            schema.name = t.meta.schema.app.name;
            schema.description = t.meta.schema.app.description;
            schema.inLanguage = t.meta.locale;
        }
        script.textContent = JSON.stringify(schema, null, 4);
    });

    // Update UI elements and ARIA labels
    const h1 = document.querySelector('h1');
    h1.textContent = t.ui.title;
    h1.setAttribute('aria-label', t.ui.aria.calculator);

    const returnButton = document.querySelector('.return-button');
    returnButton.textContent = t.ui.returnHome;
    returnButton.setAttribute('aria-label', t.ui.aria.returnHome);

    const disclaimer = document.querySelector('.disclaimer');
    disclaimer.textContent = t.ui.disclaimer;
    disclaimer.setAttribute('aria-label', t.ui.aria.privacy);

    const form = document.querySelector('.form-group[role="form"]');
    form.setAttribute('aria-label', t.ui.aria.form);

    const calcButton = document.querySelector('button[onclick="calculateMortgage()"]');
    calcButton.textContent = t.ui.calculate;
    calcButton.setAttribute('aria-label', t.ui.aria.calculate);

    document.querySelector('#sidebar h3').textContent = t.ui.contents;

    // Update sidebar links and section headers
    const sections = {
        'monthly': t.sections.monthlyPayments,
        'total': t.sections.totalValues,
        'analysis': t.sections.paymentAnalysis,
        'params': t.sections.mainParams,
        'time': t.sections.timeParams,
        'charts': t.sections.charts,
        'schedule': t.sections.schedule
    };

    for (const [id, text] of Object.entries(sections)) {
        // Update sidebar link
        document.querySelector(`#sidebar a[href="#${id}"]`).textContent = text;
        // Update section header
        document.querySelector(`#${id} h2`).textContent = text;
    }


    // Update input labels
    for (const [id, label] of Object.entries(t.inputs)) {
        const labelElement = document.querySelector(`label[for="${id}"]`);
        if (labelElement) labelElement.textContent = label;
    }

    // Update table headers
    const tableHeaders = document.querySelectorAll('#paymentSchedule th');
    const scheduleKeys = ['month', 'payment', 'interest', 'principal', 'remaining'];
    tableHeaders.forEach((th, index) => {
        if (scheduleKeys[index]) {
            th.textContent = t.schedule[scheduleKeys[index]];
        }
    });

    // Update language switch button text
    document.getElementById('langSwitch').textContent = lang === 'ru' ? 'EN' : 'RU';

    // If results are visible, recalculate to update the text
    const results = document.getElementById('results');
    if (results && results.style.display !== 'none') {
        calculateMortgage();
    }
}

export function getCurrentLang() {
    return currentLang;
}

export function getTranslation(key) {
    const keys = key.split('.');
    let value = translations[currentLang];
    for (const k of keys) {
        value = value[k];
        if (value === undefined) return key;
    }
    return value;
}
