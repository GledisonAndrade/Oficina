let warranties = [];
let nextWarrantyId = 1;

function initWarranties() {
    // Carrega garantias do localStorage
    const savedWarranties = localStorage.getItem('warranties');
    const savedNextWarrantyId = localStorage.getItem('nextWarrantyId');
    
    if (savedWarranties) warranties = JSON.parse(savedWarranties);
    if (savedNextWarrantyId) nextWarrantyId = parseInt(savedNextWarrantyId);
}

function setupOpenWarrantyForm() {
    const form = document.getElementById('open-warranty-form');
    if (!form) return;
    
    form.addEventListener('submit', handleOpenWarranty);
    
    // Configura seleção de cores
    setupColorOptions('open-warranty-form');
    
    // Atualiza a lista de garantias abertas
    updateOpenWarrantyList();
}

function handleOpenWarranty(e) {
    e.preventDefault();
    
    const client = document.getElementById('warranty-client').value;
    const equipment = document.getElementById('warranty-equipment').value;
    const mechanic = document.getElementById('warranty-mechanic').value;
    const startDate = document.getElementById('warranty-start-date').value;
    const originalOS = document.getElementById('warranty-original-os').value;
    const problem = document.getElementById('warranty-problem').value;
    const diagnosis = document.getElementById('warranty-diagnosis').value;
    const notes = document.getElementById('warranty-notes').value;
    const noteColor = document.querySelector('#open-warranty-form .color-option.selected').dataset.color;
    
    const newWarranty = {
        id: nextWarrantyId++,
        client,
        equipment,
        mechanic,
        startDate: new Date(startDate).toISOString(),
        originalOS,
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
    
    warranties.push(newWarranty);
    saveWarranties();
    updateOpenWarrantyList();
    updateCloseWarrantyDropdown();
    
    // Reset form
    e.target.reset();
    document.getElementById('warranty-notes').className = `note-${noteColor}`;
    
    alert(`Garantia #${newWarranty.id} aberta com sucesso!`);
}

function setupCloseWarrantyForm() {
    const form = document.getElementById('close-warranty-form');
    if (!form) return;
    
    form.addEventListener('submit', handleCloseWarranty);
    
    // Configura seleção de cores
    setupColorOptions('close-warranty-form');
    
    // Atualiza dropdown de garantias abertas
    updateCloseWarrantyDropdown();
}

function handleCloseWarranty(e) {
    e.preventDefault();
    
    const warrantyId = parseInt(document.getElementById('cw-warranty-id').value);
    const mechanic = document.getElementById('cw-mechanic').value;
    const endDate = document.getElementById('cw-end-date').value;
    const solution = document.getElementById('cw-solution').value;
    const notes = document.getElementById('cw-notes').value;
    const noteColor = document.querySelector('#close-warranty-form .color-option.selected').dataset.color;
    
    const warrantyIndex = warranties.findIndex(w => w.id === warrantyId);
    
    if (warrantyIndex === -1) {
        alert('Garantia não encontrada!');
        return;
    }
    
    warranties[warrantyIndex] = {
        ...warranties[warrantyIndex],
        closed: true,
        mechanic,
        endDate: new Date(endDate).toISOString(),
        solution,
        closedNotes: notes,
        closedNoteColor: noteColor
    };
    
    saveWarranties();
    updateOpenWarrantyList();
    updateCloseWarrantyDropdown();
    
    // Reset form
    e.target.reset();
    document.getElementById('cw-notes').className = `note-${noteColor}`;
    
    alert(`Garantia #${warrantyId} fechada com sucesso!`);
}

function updateOpenWarrantyList() {
    const list = document.getElementById('open-warranties-list');
    if (!list) return;
    
    const openWarranties = warranties.filter(w => !w.closed);
    
    if (openWarranties.length === 0) {
        list.innerHTML = '<li class="service-item">Nenhuma garantia aberta</li>';
        return;
    }
    
    list.innerHTML = openWarranties.map(warranty => `
        <li class="service-item">
            <div class="service-header">
                <span class="service-id">Garantia #${warranty.id}</span>
                <span class="service-status status-warranty">GARANTIA</span>
            </div>
            <div class="service-details">
                <div class="detail-item">
                    <span class="detail-label">Cliente:</span>
                    <span>${warranty.client}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Equipamento:</span>
                    <span>${warranty.equipment}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Mecânico:</span>
                    <span>${warranty.mechanic}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">OS Original:</span>
                    <span>${warranty.originalOS}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Data Abertura:</span>
                    <span>${formatDate(warranty.startDate)}</span>
                </div>
            </div>
            <div class="service-details">
                <div class="detail-item">
                    <span class="detail-label">Problema:</span>
                    <span>${warranty.problem}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Diagnóstico:</span>
                    <span>${warranty.diagnosis}</span>
                </div>
            </div>
            <div class="detail-item">
                <span class="detail-label">Observações:</span>
                <div class="note-${warranty.noteColor} p-1">${warranty.notes}</div>
            </div>
        </li>
    `).join('');
}

function updateCloseWarrantyDropdown() {
    const dropdown = document.getElementById('cw-warranty-id');
    if (!dropdown) return;
    
    const openWarranties = warranties.filter(w => !w.closed);
    
    dropdown.innerHTML = '<option value="">Selecione uma garantia aberta...</option>';
    
    openWarranties.forEach(warranty => {
        const option = document.createElement('option');
        option.value = warranty.id;
        option.textContent = `Garantia #${warranty.id} - ${warranty.client} - ${warranty.equipment}`;
        dropdown.appendChild(option);
    });
}

function saveWarranties() {
    localStorage.setItem('warranties', JSON.stringify(warranties));
    localStorage.setItem('nextWarrantyId', nextWarrantyId.toString());
}