import { getTranslation } from './language-switcher.js';

function createPaymentStructureChart(calculator) {
    const ctx = document.getElementById('paymentStructureChart').getContext('2d');
    const schedule = calculator.paymentSchedule;

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: schedule.map(p => p.month),
            datasets: [
                {
                    label: getTranslation('charts.monthlyStructure.principal'),
                    data: schedule.map(p => p.principal),
                    backgroundColor: '#2ecc71'
                },
                {
                    label: getTranslation('charts.monthlyStructure.interest'),
                    data: schedule.map(p => p.interest),
                    backgroundColor: '#e74c3c'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: getTranslation('charts.monthlyStructure.title')
                }
            },
            scales: {
                x: {
                    stacked: true,
                    title: {
                        display: true,
                        text: getTranslation('charts.monthlyStructure.month')
                    }
                },
                y: {
                    stacked: true,
                    title: {
                        display: true,
                        text: getTranslation('charts.monthlyStructure.amount')
                    }
                }
            }
        }
    });
}

function createBalanceChart(calculator) {
    const ctx = document.getElementById('balanceChart').getContext('2d');
    const schedule = calculator.paymentSchedule;

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: schedule.map(p => p.month),
            datasets: [{
                label: getTranslation('charts.balance.remaining'),
                data: schedule.map(p => p.remaining),
                borderColor: '#3498db',
                borderWidth: 2,
                fill: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: getTranslation('charts.balance.title')
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: getTranslation('charts.balance.month')
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: getTranslation('charts.balance.amount')
                    }
                }
            }
        }
    });
}

function createEarlyPaymentImpact(calculator) {
    const ctx = document.getElementById('earlyPaymentImpact').getContext('2d');
    const regularSchedule = calculator.paymentSchedule;
    const extraPaymentSchedule = calculator.calculateEarlyPaymentImpact(calculator.monthlyPayment * 0.1); // +10% к платежу

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: regularSchedule.map(p => p.month),
            datasets: [
                {
                    label: getTranslation('charts.earlyPayment.regular'),
                    data: regularSchedule.map(p => p.remaining),
                    borderColor: '#3498db',
                    fill: false
                },
                {
                    label: getTranslation('charts.earlyPayment.early'),
                    data: extraPaymentSchedule.map(p => p.remaining),
                    borderColor: '#2ecc71',
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: getTranslation('charts.earlyPayment.title')
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: getTranslation('charts.earlyPayment.month')
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: getTranslation('charts.earlyPayment.amount')
                    }
                }
            }
        }
    });
}

export {
    createBalanceChart, createEarlyPaymentImpact, createPaymentStructureChart
};

