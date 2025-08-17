let services = [];
let nextServiceId = 1;

function initServices() {
    // Carrega serviços do localStorage
    const savedServices = localStorage.getItem('services');
    const savedNextServiceId = localStorage.getItem('nextServiceId');
    
    if (savedServices) services = JSON.parse(savedServices);
    if (savedNextServiceId) nextServiceId = parseInt(savedNextServiceId);
}

function setupOpenServiceForm() {
    const form = document.getElementById('open-service-form');
    if (!form) return;
    
    form.addEventListener('submit', handleOpenService);
    
    // Configura seleção de cores
    setupColorOptions('open-service-form');
    
    // Atualiza a lista de serviços abertos
    updateOpenServicesList();
}

function handleOpenService(e) {
    e.preventDefault();
    
    const client = document.getElementById('os-client').value;
    const equipment = document.getElementById('os-equipment').value;
    const mechanic = document.getElementById('os-mechanic').value;
    const startDate = document.getElementById('os-start-date').value;
    const problem = document.getElementById('os-problem').value;
    const diagnosis = document.getElementById('os-diagnosis').value;
    const notes = document.getElementById('os-notes').value;
    const noteColor = document.querySelector('#open-service-form .color-option.selected').dataset.color;
    
    const newService = {
        id: nextServiceId++,
        client,
        equipment,
        mechanic,
        startDate: new Date(startDate).toISOString(),
        problem,
        diagnosis,
        notes,
        noteColor,
        closed: false,
        endDate: null,
        solution: null,
        closedNotes: null,
        closedNoteColor: null,
        createdAt: new Date().toISOString()
    };
    
    services.push(newService);
    saveServices();
    updateOpenServicesList();
    updateCloseServiceDropdown();
    
    // Reset form
    e.target.reset();
    document.getElementById('os-notes').className = `note-${noteColor}`;
    
    alert(`Ordem de Serviço #${newService.id} aberta com sucesso!`);
}

function setupCloseServiceForm() {
    const form = document.getElementById('close-service-form');
    if (!form) return;
    
    form.addEventListener('submit', handleCloseService);
    
    // Configura seleção de cores
    setupColorOptions('close-service-form');
    
    // Atualiza dropdown de serviços abertos
    updateCloseServiceDropdown();
}

function handleCloseService(e) {
    e.preventDefault();
    
    const serviceId = parseInt(document.getElementById('cs-service-id').value);
    const mechanic = document.getElementById('cs-mechanic').value;
    const endDate = document.getElementById('cs-end-date').value;
    const solution = document.getElementById('cs-solution').value;
    const notes = document.getElementById('cs-notes').value;
    const noteColor = document.querySelector('#close-service-form .color-option.selected').dataset.color;
    
    const serviceIndex = services.findIndex(s => s.id === serviceId);
    
    if (serviceIndex === -1) {
        alert('Ordem de Serviço não encontrada!');
        return;
    }
    
    services[serviceIndex] = {
        ...services[serviceIndex],
        closed: true,
        mechanic,
        endDate: new Date(endDate).toISOString(),
        solution,
        closedNotes: notes,
        closedNoteColor: noteColor
    };
    
    saveServices();
    updateOpenServicesList();
    updateCloseServiceDropdown();
    
    // Reset form
    e.target.reset();
    document.getElementById('cs-notes').className = `note-${noteColor}`;
    
    alert(`Ordem de Serviço #${serviceId} fechada com sucesso!`);
}

function updateOpenServicesList() {
    const list = document.getElementById('open-services-list');
    if (!list) return;
    
    const openServices = services.filter(s => !s.closed);
    
    if (openServices.length === 0) {
        list.innerHTML = '<li class="service-item">Nenhuma ordem de serviço aberta</li>';
        return;
    }
    
    list.innerHTML = openServices.map(service => `
        <li class="service-item">
            <div class="service-header">
                <span class="service-id">OS #${service.id}</span>
                <span class="service-status status-open">ABERTA</span>
            </div>
            <div class="service-details">
                <div class="detail-item">
                    <span class="detail-label">Cliente:</span>
                    <span>${service.client}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Equipamento:</span>
                    <span>${service.equipment}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Mecânico:</span>
                    <span>${service.mechanic}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Data Abertura:</span>
                    <span>${formatDate(service.startDate)}</span>
                </div>
            </div>
            <div class="service-details">
                <div class="detail-item">
                    <span class="detail-label">Problema:</span>
                    <span>${service.problem}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Diagnóstico:</span>
                    <span>${service.diagnosis}</span>
                </div>
            </div>
            <div class="detail-item">
                <span class="detail-label">Observações:</span>
                <div class="note-${service.noteColor} p-1">${service.notes}</div>
            </div>
        </li>
    `).join('');
}

function updateCloseServiceDropdown() {
    const dropdown = document.getElementById('cs-service-id');
    if (!dropdown) return;
    
    const openServices = services.filter(s => !s.closed);
    
    dropdown.innerHTML = '<option value="">Selecione uma OS aberta...</option>';
    
    openServices.forEach(service => {
        const option = document.createElement('option');
        option.value = service.id;
        option.textContent = `OS #${service.id} - ${service.client} - ${service.equipment}`;
        dropdown.appendChild(option);
    });
}

function saveServices() {
    localStorage.setItem('services', JSON.stringify(services));
    localStorage.setItem('nextServiceId', nextServiceId.toString());
}
function generateServicePDF(serviceId) {
    const { jsPDF } = window.jspdf;
    const service = services.find(s => s.id === serviceId);
    
    if (!service) {
        alert('Ordem de Serviço não encontrada!');
        return;
    }

    // Cria um novo documento PDF
    const doc = new jsPDF();
    
    // Configurações do PDF
    const margin = 15;
    let yPos = margin;
    const lineHeight = 7;
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Logo e Cabeçalho
    doc.setFontSize(18);
    doc.setTextColor(40, 53, 80); // Cor similar ao tema
    doc.text('Relatório de Ordem de Serviço', pageWidth / 2, yPos, { align: 'center' });
    yPos += lineHeight * 2;
    
    doc.setFontSize(14);
    doc.text(`OS #${service.id}`, pageWidth / 2, yPos, { align: 'center' });
    yPos += lineHeight * 2;
    
    // Linha divisória
    doc.setDrawColor(40, 53, 80);
    doc.setLineWidth(0.5);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += lineHeight;
    
    // Dados da OS
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    
    // Informações básicas
    doc.setFont(undefined, 'bold');
    doc.text('Informações da Ordem de Serviço:', margin, yPos);
    yPos += lineHeight;
    
    doc.setFont(undefined, 'normal');
    doc.text(`Cliente: ${service.client}`, margin, yPos);
    yPos += lineHeight;
    
    doc.text(`Equipamento: ${service.equipment}`, margin, yPos);
    yPos += lineHeight;
    
    doc.text(`Mecânico Responsável: ${service.mechanic}`, margin, yPos);
    yPos += lineHeight;
    
    doc.text(`Data de Abertura: ${formatDate(service.startDate)}`, margin, yPos);
    yPos += lineHeight;
    
    if (service.closed) {
        doc.text(`Data de Fechamento: ${formatDate(service.endDate)}`, margin, yPos);
        yPos += lineHeight;
    }
    
    yPos += lineHeight;
    
    // Detalhes do serviço
    doc.setFont(undefined, 'bold');
    doc.text('Detalhes do Serviço:', margin, yPos);
    yPos += lineHeight;
    
    doc.setFont(undefined, 'normal');
    doc.text(`Problema Relatado:`, margin, yPos);
    yPos += lineHeight;
    
    // Texto com quebra de linha para o problema
    const problemLines = doc.splitTextToSize(service.problem, pageWidth - 2 * margin);
    doc.text(problemLines, margin, yPos);
    yPos += lineHeight * problemLines.length;
    
    doc.text(`Diagnóstico Inicial:`, margin, yPos);
    yPos += lineHeight;
    
    const diagnosisLines = doc.splitTextToSize(service.diagnosis, pageWidth - 2 * margin);
    doc.text(diagnosisLines, margin, yPos);
    yPos += lineHeight * diagnosisLines.length;
    
    if (service.closed) {
        doc.text(`Solução Aplicada:`, margin, yPos);
        yPos += lineHeight;
        
        const solutionLines = doc.splitTextToSize(service.solution, pageWidth - 2 * margin);
        doc.text(solutionLines, margin, yPos);
        yPos += lineHeight * solutionLines.length;
    }
    
    yPos += lineHeight;
    
    // Observações
    doc.setFont(undefined, 'bold');
    doc.text('Observações:', margin, yPos);
    yPos += lineHeight;
    
    doc.setFont(undefined, 'normal');
    const notesLines = doc.splitTextToSize(service.notes, pageWidth - 2 * margin);
    doc.text(notesLines, margin, yPos);
    yPos += lineHeight * notesLines.length;
    
    if (service.closed && service.closedNotes) {
        yPos += lineHeight;
        doc.setFont(undefined, 'bold');
        doc.text('Observações Finais:', margin, yPos);
        yPos += lineHeight;
        
        doc.setFont(undefined, 'normal');
        const closedNotesLines = doc.splitTextToSize(service.closedNotes, pageWidth - 2 * margin);
        doc.text(closedNotesLines, margin, yPos);
    }
    
    // Rodapé
    yPos = doc.internal.pageSize.getHeight() - margin;
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('Relatório gerado pelo Sistema de Oficina Mecânica Agrícola', pageWidth / 2, yPos, { align: 'center' });
    
    // Salva o PDF
    doc.save(`OS_${service.id}_${service.client.replace(/\s+/g, '_')}.pdf`);
}







function updateOpenServicesList() {
    const list = document.getElementById('open-services-list');
    if (!list) return;
    
    const openServices = services.filter(s => !s.closed);
    const closedServices = services.filter(s => s.closed);
    
    if (openServices.length === 0 && closedServices.length === 0) {
        list.innerHTML = '<li class="service-item">Nenhuma ordem de serviço cadastrada</li>';
        return;
    }
    
    let html = '';
    
    if (openServices.length > 0) {
        html += '<h3 class="card-subtitle">Ordens Abertas</h3>';
        html += openServices.map(service => `
            <li class="service-item">
                <div class="service-header">
                    <span class="service-id">OS #${service.id}</span>
                    <span class="service-status status-open">ABERTA</span>
                </div>
                <div class="service-details">
                    <div class="detail-item">
                        <span class="detail-label">Cliente:</span>
                        <span>${service.client}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Equipamento:</span>
                        <span>${service.equipment}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Mecânico:</span>
                        <span>${service.mechanic}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Data Abertura:</span>
                        <span>${formatDate(service.startDate)}</span>
                    </div>
                </div>
                <div class="service-details">
                    <div class="detail-item">
                        <span class="detail-label">Problema:</span>
                        <span>${service.problem}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Diagnóstico:</span>
                        <span>${service.diagnosis}</span>
                    </div>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Observações:</span>
                    <div class="note-${service.noteColor} p-1">${service.notes}</div>
                </div>
            </li>
        `).join('');
    }
    
    if (closedServices.length > 0) {
        html += '<h3 class="card-subtitle mt-3">Ordens Fechadas</h3>';
        html += closedServices.map(service => `
            <li class="service-item">
                <div class="service-header">
                    <span class="service-id">OS #${service.id}</span>
                    <span class="service-status status-closed">FECHADA</span>
                </div>
                <div class="service-details">
                    <div class="detail-item">
                        <span class="detail-label">Cliente:</span>
                        <span>${service.client}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Equipamento:</span>
                        <span>${service.equipment}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Mecânico:</span>
                        <span>${service.mechanic}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Data Abertura:</span>
                        <span>${formatDate(service.startDate)}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Data Fechamento:</span>
                        <span>${formatDate(service.endDate)}</span>
                    </div>
                </div>
                <div class="service-details">
                    <div class="detail-item">
                        <span class="detail-label">Problema:</span>
                        <span>${service.problem}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Diagnóstico:</span>
                        <span>${service.diagnosis}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Solução:</span>
                        <span>${service.solution}</span>
                    </div>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Observações Iniciais:</span>
                    <div class="note-${service.noteColor} p-1">${service.notes}</div>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Observações Finais:</span>
                    <div class="note-${service.closedNoteColor} p-1">${service.closedNotes}</div>
                </div>
                <div class="form-row justify-end mt-2">
                    <button class="btn-info generate-pdf" data-id="${service.id}">Gerar PDF</button>
                </div>
            </li>
        `).join('');
    }
    
    list.innerHTML = html;
    
    // Adiciona eventos aos botões de PDF
    document.querySelectorAll('.generate-pdf').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const serviceId = parseInt(e.target.dataset.id);
            generateServicePDF(serviceId);
        });
    });
}