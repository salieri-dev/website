import {
    createBalanceChart,
    createEarlyPaymentImpact,
    createPaymentStructureChart
} from './chart-creators.js';
import { formatCurrency, getStatusIndicator } from './formatters.js';
import { getTranslation, initializeLanguage } from './language-switcher.js';
import { MortgageCalculator } from './mortgage-calculator.js';

// Initialize language system
await initializeLanguage();

// Add calculate button click handler
document.getElementById('calculateButton').addEventListener('click', calculateMortgage);

// Menu button functionality
const menuButton = document.getElementById('menuButton');
const sidebar = document.getElementById('sidebar');

menuButton.addEventListener('click', () => {
    sidebar.classList.toggle('visible');
});

// Close sidebar when clicking a link (mobile)
document.querySelectorAll('.sidebar a').forEach(link => {
    link.addEventListener('click', () => {
        if (window.innerWidth <= 768) {
            sidebar.classList.remove('visible');
        }
    });
});

// Close sidebar when clicking outside (mobile)
document.addEventListener('click', (e) => {
    if (window.innerWidth <= 768 &&
        !sidebar.contains(e.target) &&
        !menuButton.contains(e.target) &&
        sidebar.classList.contains('visible')) {
        sidebar.classList.remove('visible');
    }
});

// Intersection Observer for active section highlighting
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            document.querySelectorAll('.sidebar a').forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === '#' + entry.target.id) {
                    link.classList.add('active');
                }
            });
        }
    });
}, { threshold: 0.5 });

// Observe all sections
document.querySelectorAll('.section, .charts').forEach(section => {
    observer.observe(section);
});

// Smooth scroll for navigation
document.querySelectorAll('.sidebar a').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href');
        document.querySelector(targetId).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

function updateResults(calculator) {
    const summary = calculator.getSummary();
    const schedule = calculator.paymentSchedule;

    // Show sidebar
    document.getElementById('sidebar').classList.add('visible');

    // Main parameters
    document.getElementById('mainParams').innerHTML = `
        <p>${getTranslation('results.apartmentCost')}: <span class="highlight">${formatCurrency(calculator.params.apartmentCost)}</span></p>
        <p>${getTranslation('results.downPayment')}: <span class="highlight">${formatCurrency(summary.downPayment)} (${calculator.params.downPaymentPercent}%)</span>
            ${getStatusIndicator('downPayment', calculator.params.downPaymentPercent)}</p>
        <p>${getTranslation('results.loanAmount')}: <span class="highlight">${formatCurrency(summary.loanAmount)}</span></p>
        <p>${getTranslation('results.loanTerm')}: <span class="highlight">${calculator.params.years} ${getTranslation('results.years')} (${calculator.totalPayments} ${getTranslation('results.months')})</span></p>
        <p>${getTranslation('results.annualRate')}: <span class="highlight">${calculator.params.annualRate}%</span>
            ${getStatusIndicator('rate', calculator.params.annualRate)}</p>
        <p>${getTranslation('results.monthlyRate')}: <span class="highlight">${(summary.monthlyRate * 100).toFixed(3)}%</span></p>
    `;

    // Time parameters
    const ageAtCompletion = calculator.params.age + calculator.params.years;
    document.getElementById('timeParams').innerHTML = `
        <p>${getTranslation('results.ageAtStart')}: <span class="highlight">${calculator.params.age} ${getTranslation('results.years')}</span></p>
        <p>${getTranslation('results.ageAtEnd')}: <span class="highlight">${ageAtCompletion} ${getTranslation('results.years')}</span>
            ${getStatusIndicator('age', ageAtCompletion)}</p>
        <p>${getTranslation('results.completionDate')}: <span class="highlight">${new Date().getFullYear() + calculator.params.years} ${getTranslation('results.year')}</span></p>
    `;

    // Monthly payments
    const paymentToIncomeRatio = (summary.monthlyPayment / calculator.params.monthlyIncome * 100).toFixed(1);
    document.getElementById('monthlyParams').innerHTML = `
        <p>${getTranslation('results.monthlyIncome')}: <span class="highlight">${formatCurrency(calculator.params.monthlyIncome)}</span></p>
        <p>${getTranslation('results.monthlyPayment')}: <span class="highlight">${formatCurrency(summary.monthlyPayment)}</span></p>
        <p>${getTranslation('results.remainingMoney')}: <span class="highlight">${formatCurrency(summary.remainingMoney)}</span></p>
        <p>${getTranslation('results.paymentToIncome')} <span class="highlight">${paymentToIncomeRatio}%</span> ${getTranslation('results.ofIncome')}
            ${getStatusIndicator('paymentToIncome', parseFloat(paymentToIncomeRatio))}</p>
    `;

    // Payment analysis
    const firstPayment = schedule[0];
    const lastPayment = schedule[schedule.length - 1];
    document.getElementById('paymentAnalysis').innerHTML = `
        <h3>${getTranslation('results.firstPayment')}:</h3>
        <p>${getTranslation('results.totalAmount')}: <span class="highlight">${formatCurrency(firstPayment.payment)}</span></p>
        <p>• ${getTranslation('results.interestPayment')}: <span class="highlight">${formatCurrency(firstPayment.interest)} (${(firstPayment.interest / firstPayment.payment * 100).toFixed(1)}%)</span></p>
        <p>• ${getTranslation('results.principalPayment')}: <span class="highlight">${formatCurrency(firstPayment.principal)} (${(firstPayment.principal / firstPayment.payment * 100).toFixed(1)}%)</span></p>
        
        <h3>${getTranslation('results.lastPayment')}:</h3>
        <p>${getTranslation('results.totalAmount')}: <span class="highlight">${formatCurrency(lastPayment.payment)}</span></p>
        <p>• ${getTranslation('results.interestPayment')}: <span class="highlight">${formatCurrency(lastPayment.interest)} (${(lastPayment.interest / lastPayment.payment * 100).toFixed(1)}%)</span></p>
        <p>• ${getTranslation('results.principalPayment')}: <span class="highlight">${formatCurrency(lastPayment.principal)} (${(lastPayment.principal / lastPayment.payment * 100).toFixed(1)}%)</span></p>
    `;

    // Total values
    const overpaymentPercent = (summary.totalInterest / summary.loanAmount * 100).toFixed(1);
    document.getElementById('totalValues').innerHTML = `
        <p>${getTranslation('results.totalPayments')}: <span class="highlight">${formatCurrency(summary.totalPayment)}</span></p>
        <p>${getTranslation('results.totalInterest')}: <span class="highlight">${formatCurrency(summary.totalInterest)}</span></p>
        <p>${getTranslation('results.overpaymentToLoan')}: <span class="highlight">${overpaymentPercent}%</span>
            ${getStatusIndicator('overpayment', parseFloat(overpaymentPercent))}</p>
        <p>${getTranslation('results.overpaymentToPrice')}: <span class="highlight">${(summary.interestToPriceRatio * 100).toFixed(1)}%</span></p>
    `;

    // Payment schedule
    const tbody = document.querySelector('#paymentSchedule tbody');
    const thead = document.querySelector('#paymentSchedule thead tr');

    // Update headers
    thead.innerHTML = `
        <th>${getTranslation('schedule.month')}</th>
        <th>${getTranslation('schedule.payment')}</th>
        <th>${getTranslation('schedule.interest')}</th>
        <th>${getTranslation('schedule.principal')}</th>
        <th>${getTranslation('schedule.remaining')}</th>
    `;

    // Update rows
    tbody.innerHTML = schedule.map(payment => `
        <tr>
            <td>${payment.month}</td>
            <td>${formatCurrency(payment.payment)}</td>
            <td>${formatCurrency(payment.interest)}</td>
            <td>${formatCurrency(payment.principal)}</td>
            <td>${formatCurrency(payment.remaining)}</td>
        </tr>
    `).join('');
}

function calculateMortgage() {
    try {
        const params = {
            monthlyIncome: parseFloat(document.getElementById('monthlyIncome').value),
            age: parseInt(document.getElementById('age').value),
            apartmentCost: parseFloat(document.getElementById('apartmentCost').value),
            downPaymentPercent: parseFloat(document.getElementById('downPaymentPercent').value),
            annualRate: parseFloat(document.getElementById('annualRate').value),
            years: parseInt(document.getElementById('years').value)
        };

        const calculator = new MortgageCalculator(params);

        document.getElementById('results').style.display = 'block';
        updateResults(calculator);

        // Clear existing charts
        const chartContainers = document.querySelectorAll('.chart-container canvas');
        chartContainers.forEach(canvas => canvas.remove());

        // Create new canvas elements and charts
        const chartIds = [
            'paymentStructureChart',
            'balanceChart',
            'earlyPaymentImpact'
        ];

        chartIds.forEach(id => {
            const canvas = document.createElement('canvas');
            canvas.id = id;
            document.querySelector(`.chart-container[data-chart="${id}"]`).appendChild(canvas);
        });

        // Create all charts
        createPaymentStructureChart(calculator);
        createBalanceChart(calculator);
        createEarlyPaymentImpact(calculator);

    } catch (error) {
        alert(error.message);
    }
}

// Make calculateMortgage available globally
window.calculateMortgage = calculateMortgage;
