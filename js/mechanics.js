class MechanicsManager {
    constructor() {
        this.mechanics = [];
        this.loadMechanics();
    }

    loadMechanics() {
        const savedMechanics = localStorage.getItem('mechanics');
        this.mechanics = savedMechanics ? JSON.parse(savedMechanics) : [
            'João Silva', 
            'Maria Souza', 
            'Carlos Oliveira', 
            'Ana Pereira'
        ];
        
        if (!savedMechanics) {
            this.saveMechanics();
        }
    }

    saveMechanics() {
        localStorage.setItem('mechanics', JSON.stringify(this.mechanics));
    }

    addMechanic(name) {
        name = name.trim();
        if (!name || this.mechanics.includes(name)) return false;
        
        this.mechanics.push(name);
        this.saveMechanics();
        return true;
    }

    removeMechanic(name) {
        const index = this.mechanics.indexOf(name);
        if (index === -1) return false;
        
        this.mechanics.splice(index, 1);
        this.saveMechanics();
        return true;
    }

    updateMechanic(oldName, newName) {
        newName = newName.trim();
        const index = this.mechanics.indexOf(oldName);
        
        if (index === -1 || !newName || this.mechanics.includes(newName)) return false;
        
        this.mechanics[index] = newName;
        this.saveMechanics();
        return true;
    }

    setupDropdown(selectElement, selectedMechanic = '') {
        if (!selectElement) return;
        
        selectElement.innerHTML = '<option value="">Selecione...</option>';
        
        this.mechanics.forEach(mechanic => {
            const option = document.createElement('option');
            option.value = mechanic;
            option.textContent = mechanic;
            if (mechanic === selectedMechanic) {
                option.selected = true;
            }
            selectElement.appendChild(option);
        });
    }

    showManagementModal() {
        const modal = document.getElementById('mechanics-modal');
        const modalBody = document.getElementById('mechanics-modal-body');
        
        modalBody.innerHTML = `
            <div class="card">
                <h4 class="card-title">Mecânicos Cadastrados</h4>
                <ul id="mechanics-list" class="service-list">
                    ${this.mechanics.map(mechanic => `
                        <li class="service-item">
                            <div class="service-details">
                                <div class="detail-item">
                                    <span>${mechanic}</span>
                                </div>
                                <div class="form-row">
                                    <button class="btn-secondary edit-mechanic" data-name="${mechanic}">Editar</button>
                                    <button class="btn-danger remove-mechanic" data-name="${mechanic}">Remover</button>
                                </div>
                            </div>
                        </li>
                    `).join('')}
                </ul>
            </div>
            
            <div class="card">
                <h4 class="card-title">Adicionar Novo Mecânico</h4>
                <form id="add-mechanic-form">
                    <div class="form-group">
                        <label for="new-mechanic-name">Nome do Mecânico</label>
                        <input type="text" id="new-mechanic-name" required>
                    </div>
                    <button type="submit" class="btn-primary">Adicionar</button>
                </form>
            </div>
        `;
        
        modal.style.display = 'flex';
        
        // Configura eventos
        document.querySelectorAll('.remove-mechanic').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const mechanicName = e.target.dataset.name;
                if (confirm(`Tem certeza que deseja remover o mecânico ${mechanicName}?`)) {
                    if (this.removeMechanic(mechanicName)) {
                        this.showManagementModal();
                        this.updateAllDropdowns();
                    }
                }
            });
        });
        
        document.querySelectorAll('.edit-mechanic').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const oldName = e.target.dataset.name;
                const newName = prompt('Novo nome para o mecânico:', oldName);
                if (newName && newName !== oldName) {
                    if (this.updateMechanic(oldName, newName)) {
                        this.showManagementModal();
                        this.updateAllDropdowns();
                    }
                }
            });
        });
        
        document.getElementById('add-mechanic-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const newName = document.getElementById('new-mechanic-name').value.trim();
            if (newName) {
                if (this.addMechanic(newName)) {
                    this.showManagementModal();
                    this.updateAllDropdowns();
                    document.getElementById('new-mechanic-name').value = '';
                } else {
                    alert('Este mecânico já está cadastrado!');
                }
            }
        });
        
        document.querySelector('.close-modal').addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }

    updateAllDropdowns() {
        document.querySelectorAll('select[id$="-mechanic"]').forEach(select => {
            const selected = select.value;
            this.setupDropdown(select, selected);
        });
    }
}