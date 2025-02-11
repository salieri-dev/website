import { getCurrentLang, getTranslation } from './language-switcher.js';

function formatCurrency(amount) {
    const lang = getCurrentLang();
    const locale = lang === 'ru' ? 'ru-RU' : 'en-US';
    const currency = lang === 'ru' ? 'RUB' : 'USD';

    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
}

function formatPercent(value) {
    const lang = getCurrentLang();
    const locale = lang === 'ru' ? 'ru-RU' : 'en-US';

    return new Intl.NumberFormat(locale, {
        style: 'percent',
        minimumFractionDigits: 1,
        maximumFractionDigits: 1
    }).format(value / 100);
}

function getStatusIndicator(type, value, text) {
    let status = '';
    let icon = '';

    switch (type) {
        case 'downPayment':
            if (value >= 50) {
                status = 'good';
                icon = '💪';
                text = getTranslation('status.downPayment.excellent');
            } else if (value >= 20) {
                status = 'info';
                icon = '👍';
                text = getTranslation('status.downPayment.good');
            } else {
                status = 'warning';
                icon = '⚠️';
                text = getTranslation('status.downPayment.minimum');
            }
            break;

        case 'paymentToIncome':
            if (value <= 30) {
                status = 'good';
                icon = '✨';
                text = getTranslation('status.paymentToIncome.comfortable');
            } else if (value <= 50) {
                status = 'warning';
                icon = '⚠️';
                text = getTranslation('status.paymentToIncome.high');
            } else {
                status = 'critical';
                icon = '🚨';
                text = getTranslation('status.paymentToIncome.critical');
            }
            break;

        case 'age':
            if (value <= 60) {
                status = 'good';
                icon = '👌';
                text = getTranslation('status.age.optimal');
            } else if (value <= 65) {
                status = 'warning';
                icon = '⚠️';
                text = getTranslation('status.age.limit');
            } else {
                status = 'critical';
                icon = '⛔';
                text = getTranslation('status.age.exceeded');
            }
            break;

        case 'rate':
            if (value <= 10) {
                status = 'good';
                icon = '🌟';
                text = getTranslation('status.rate.excellent');
            } else if (value <= 15) {
                status = 'info';
                icon = '✔️';
                text = getTranslation('status.rate.normal');
            } else if (value <= 20) {
                status = 'warning';
                icon = '⚠️';
                text = getTranslation('status.rate.high');
            } else {
                status = 'critical';
                icon = '🔥';
                text = getTranslation('status.rate.veryHigh');
            }
            break;

        case 'overpayment':
            if (value <= 30) {
                status = 'good';
                icon = '💎';
                text = getTranslation('status.overpayment.low');
            } else if (value <= 50) {
                status = 'warning';
                icon = '💰';
                text = getTranslation('status.overpayment.medium');
            } else {
                status = 'critical';
                icon = '💸';
                text = getTranslation('status.overpayment.high');
            }
            break;
    }

    return `<span class="status status-${status}">${icon} ${text}</span>`;
}

export { formatCurrency, formatPercent, getStatusIndicator };

