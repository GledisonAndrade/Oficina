let servicesChart = null;

function initReports() {
    // Inicializa o módulo de relatórios
}

function setupReports() {
    const generateReportBtn = document.getElementById('generate-report');
    if (generateReportBtn) {
        generateReportBtn.addEventListener('click', generateReport);
    }
    
    const reportType = document.getElementById('report-type');
    if (reportType) {
        reportType.addEventListener('change', updateReportPeriods);
        updateReportPeriods();
    }
    
    const reportPeriod = document.getElementById('report-period');
    if (reportPeriod) {
        reportPeriod.addEventListener('change', updateReportPeriods);
    }
}

function generateReport() {
    const reportType = document.getElementById('report-type').value;
    const periodValue = document.getElementById('report-period').value;
    
    let startDate, endDate;
    
    if (periodValue === 'custom') {
        startDate = new Date(document.getElementById('start-date').value);
        endDate = new Date(document.getElementById('end-date').value);
    } else {
        endDate = new Date();
        startDate = new Date();
        
        switch(periodValue) {
            case 'week':
                startDate.setDate(endDate.getDate() - 7);
                break;
            case 'month':
                startDate.setMonth(endDate.getMonth() - 1);
                break;
            case 'quarter':
                startDate.setMonth(endDate.getMonth() - 3);
                break;
            case 'year':
                startDate.setFullYear(endDate.getFullYear() - 1);
                break;
            default:
                startDate.setDate(endDate.getDate() - 7);
        }
    }
    
    if (servicesChart) {
        servicesChart.destroy();
    }
    
    // Filtra os dados baseado no período selecionado
    const filteredServices = services.filter(s => {
        const serviceDate = new Date(s.createdAt);
        return serviceDate >= startDate && serviceDate <= endDate;
    });
    
    const filteredWarranties = warranties.filter(w => {
        const warrantyDate = new Date(w.createdAt);
        return warrantyDate >= startDate && warrantyDate <= endDate;
    });
    
    // Cria novo gráfico com Chart.js
    const ctx = document.getElementById('services-chart').getContext('2d');
    
    if (reportType === 'mechanics') {
        // Relatório de desempenho de mecânicos
        const mechanics = [...new Set([
            ...filteredServices.map(s => s.mechanic),
            ...filteredWarranties.map(w => w.mechanic)
        ])].filter(Boolean);
        
        const servicesByMechanic = mechanics.map(mechanic => 
            filteredServices.filter(s => s.mechanic === mechanic).length
        );
        
        const warrantiesByMechanic = mechanics.map(mechanic => 
            filteredWarranties.filter(w => w.mechanic === mechanic).length
        );
        
        servicesChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: mechanics,
                datasets: [{
                    label: 'Ordens de Serviço',
                    data: servicesByMechanic,
                    backgroundColor: '#3498db'
                }, {
                    label: 'Garantias',
                    data: warrantiesByMechanic,
                    backgroundColor: '#e74c3c'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });
    } else {
        // Relatório de serviços ou garantias
        const labels = [];
        const serviceData = [];
        const warrantyData = [];
        
        // Agrupa por dia/semana/mês dependendo do período
        const diffTime = Math.abs(endDate - startDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        let groupBy;
        if (diffDays <= 7) groupBy = 'day';
        else if (diffDays <= 30) groupBy = 'week';
        else groupBy = 'month';
        
        let currentDate = new Date(startDate);
        
        while (currentDate <= endDate) {
            let label;
            let nextDate = new Date(currentDate);
            
            if (groupBy === 'day') {
                label = currentDate.toLocaleDateString('pt-BR');
                nextDate.setDate(currentDate.getDate() + 1);
            } else if (groupBy === 'week') {
                const weekStart = new Date(currentDate);
                const weekEnd = new Date(currentDate);
                weekEnd.setDate(weekStart.getDate() + 6);
                label = `${weekStart.toLocaleDateString('pt-BR')} - ${weekEnd.toLocaleDateString('pt-BR')}`;
                nextDate.setDate(currentDate.getDate() + 7);
            } else {
                label = currentDate.toLocaleDateString('pt-BR', { month: 'long' });
                nextDate.setMonth(currentDate.getMonth() + 1);
            }
            
            labels.push(label);
            
            // Conta serviços e garantias neste período
            serviceData.push(filteredServices.filter(s => {
                const serviceDate = new Date(s.createdAt);
                return serviceDate >= currentDate && serviceDate < nextDate;
            }).length);
            
            warrantyData.push(filteredWarranties.filter(w => {
                const warrantyDate = new Date(w.createdAt);
                return warrantyDate >= currentDate && warrantyDate < nextDate;
            }).length);
            
            currentDate = new Date(nextDate);
        }
        
        servicesChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Ordens de Serviço',
                    data: serviceData,
                    backgroundColor: '#3498db'
                }, {
                    label: 'Garantias',
                    data: warrantyData,
                    backgroundColor: '#e74c3c'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });
    }
}

function updateReportPeriods() {
    const reportPeriod = document.getElementById('report-period');
    const customDates = document.getElementById('custom-dates');
    
    if (reportPeriod.value === 'custom') {
        customDates.style.display = 'block';
        
        // Define datas padrão (últimos 7 dias)
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - 7);
        
        document.getElementById('start-date').valueAsDate = startDate;
        document.getElementById('end-date').valueAsDate = endDate;
    } else {
        customDates.style.display = 'none';
    }
}