import { formatCurrency } from './formatters.js';

class MortgageCalculator {
    constructor(params) {
        this.params = params;
        this.observer = null;
        this.initPerformanceMonitoring();
        this.initAnalytics();
        this.initAccessibility();
        this.downPayment = this.calculateDownPayment();
        this.loanAmount = this.calculateLoanAmount();
        this.monthlyRate = this.calculateMonthlyRate();
        this.totalPayments = this.params.years * 12;
        this.validateLoanParameters();
        this.monthlyPayment = this.calculateMonthlyPayment();
        this.paymentSchedule = this.calculatePaymentSchedule();
    }

    initPerformanceMonitoring() {
        this.performance = {
            startTime: performance.now(),
            calculations: 0,
            errors: 0
        };
    }

    initAnalytics() {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'mortgage_calculator_init', {
                'event_category': 'Calculator',
                'event_label': 'Initialization'
            });
        }
    }

    initAccessibility() {
        if (typeof document !== 'undefined') {
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    this.handleCalculate();
                }
            });
        }
    }

    generateStructuredData() {
        return {
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Ипотечный калькулятор",
            "applicationCategory": "FinancialApplication",
            "operatingSystem": "Any",
            "offers": {
                "@type": "Offer",
                "category": "FinancialService",
                "priceSpecification": {
                    "@type": "UnitPriceSpecification",
                    "priceCurrency": "RUB",
                    "price": this.params.apartmentCost
                }
            }
        };
    }

    calculateDownPayment() {
        try {
            const downPayment = this.params.apartmentCost * (this.params.downPaymentPercent / 100);
            this.performance.calculations++;
            return downPayment;
        } catch (error) {
            this.performance.errors++;
            throw new Error(`Ошибка расчета первоначального взноса: ${error.message}`);
        }
    }

    calculateLoanAmount() {
        try {
            const loanAmount = this.params.apartmentCost - this.downPayment;
            this.performance.calculations++;
            return loanAmount;
        } catch (error) {
            this.performance.errors++;
            throw new Error(`Ошибка расчета суммы кредита: ${error.message}`);
        }
    }

    calculateMonthlyRate() {
        try {
            const monthlyRate = this.params.annualRate / 12 / 100;
            this.performance.calculations++;
            return monthlyRate;
        } catch (error) {
            this.performance.errors++;
            throw new Error(`Ошибка расчета месячной ставки: ${error.message}`);
        }
    }

    calculateMonthlyPayment() {
        try {
            const initialMonthlyInterest = this.loanAmount * this.monthlyRate;
            const rateFactor = Math.pow(1 + this.monthlyRate, this.totalPayments);
            const monthlyPayment = this.loanAmount * this.monthlyRate * rateFactor / (rateFactor - 1);

            if (monthlyPayment <= initialMonthlyInterest) {
                this.performance.errors++;
                throw new Error(`Невозможные условия кредита!
                    Ежемесячный платеж (${formatCurrency(monthlyPayment)}) меньше первоначальных процентов (${formatCurrency(initialMonthlyInterest)}).
                    При таких условиях кредит невозможно погасить, так как платеж не покрывает даже проценты.`);
            }

            this.performance.calculations++;
            return monthlyPayment;
        } catch (error) {
            this.performance.errors++;
            throw new Error(`Ошибка расчета ежемесячного платежа: ${error.message}`);
        }
    }

    calculatePaymentSchedule() {
        try {
            const schedule = [];
            let remainingLoan = this.loanAmount;
            let totalInterest = 0;

            for (let month = 1; month <= this.totalPayments; month++) {
                const interestPayment = remainingLoan * this.monthlyRate;

                let principalPayment, payment;
                if (month < this.totalPayments) {
                    principalPayment = this.monthlyPayment - interestPayment;
                    payment = this.monthlyPayment;
                } else {
                    principalPayment = remainingLoan;
                    payment = principalPayment + interestPayment;
                }

                schedule.push({
                    month,
                    payment,
                    interest: interestPayment,
                    principal: principalPayment,
                    remaining: remainingLoan,
                    totalInterest
                });

                remainingLoan -= principalPayment;
                totalInterest += interestPayment;
            }

            this.performance.calculations += this.totalPayments;
            return schedule;
        } catch (error) {
            this.performance.errors++;
            throw new Error(`Ошибка расчета графика платежей: ${error.message}`);
        }
    }

    calculateEarlyPaymentImpact(extraPayment) {
        try {
            let schedule = [];
            let remainingLoan = this.loanAmount;
            let totalInterest = 0;
            let month = 1;

            while (remainingLoan > 0) {
                const interestPayment = remainingLoan * this.monthlyRate;
                const regularPrincipal = this.monthlyPayment - interestPayment;
                const totalPrincipal = regularPrincipal + extraPayment;

                const actualPrincipal = Math.min(totalPrincipal, remainingLoan);
                const actualPayment = actualPrincipal + interestPayment;

                schedule.push({
                    month,
                    payment: actualPayment,
                    interest: interestPayment,
                    principal: actualPrincipal,
                    remaining: remainingLoan,
                    totalInterest
                });

                remainingLoan -= actualPrincipal;
                totalInterest += interestPayment;
                month++;

                if (month > this.totalPayments * 2) break; // Safety check
            }

            this.performance.calculations += month;
            return schedule;
        } catch (error) {
            this.performance.errors++;
            throw new Error(`Ошибка расчета досрочного погашения: ${error.message}`);
        }
    }

    validateLoanParameters() {
        try {
            // Check if all parameters are valid numbers
            if (isNaN(this.params.years) || this.params.years <= 0) {
                throw new Error('Invalid loan term');
            }
            if (isNaN(this.params.annualRate) || this.params.annualRate <= 0) {
                throw new Error('Invalid annual rate');
            }
            if (isNaN(this.params.downPaymentPercent) || this.params.downPaymentPercent < 0 || this.params.downPaymentPercent >= 100) {
                throw new Error('Invalid down payment percentage');
            }
            if (isNaN(this.params.apartmentCost) || this.params.apartmentCost <= 0) {
                throw new Error('Invalid apartment cost');
            }
            if (isNaN(this.params.monthlyIncome) || this.params.monthlyIncome <= 0) {
                throw new Error('Invalid monthly income');
            }
            if (isNaN(this.params.age) || this.params.age < 0) {
                throw new Error('Invalid age');
            }
        } catch (error) {
            this.performance.errors++;
            throw new Error(`Parameter validation error: ${error.message}`);
        }
    }

    getSummary() {
        try {
            const remainingMoney = this.params.monthlyIncome - this.monthlyPayment;
            const selfSavingYears = this.params.apartmentCost / (this.params.monthlyIncome * 12);
            const totalPayment = this.monthlyPayment * this.totalPayments;
            const totalInterest = this.paymentSchedule[this.paymentSchedule.length - 1].totalInterest;

            const summary = {
                downPayment: this.downPayment,
                loanAmount: this.loanAmount,
                monthlyRate: this.monthlyRate,
                monthlyPayment: this.monthlyPayment,
                remainingMoney,
                totalInterest,
                totalPayment,
                selfSavingYears,
                interestToPriceRatio: totalInterest / this.params.apartmentCost,
                structuredData: this.generateStructuredData()
            };

            if (typeof gtag !== 'undefined') {
                gtag('event', 'mortgage_calculator_summary', {
                    'event_category': 'Calculator',
                    'event_label': 'Summary Generated'
                });
            }

            this.performance.calculations += 5;
            return summary;
        } catch (error) {
            this.performance.errors++;
            throw new Error(`Ошибка получения сводки: ${error.message}`);
        }
    }
}

export { MortgageCalculator };

