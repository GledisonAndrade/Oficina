// Configuração inicial do aplicativo
document.addEventListener('DOMContentLoaded', function() {
    // Inicializa os módulos
    mechanicsManager = new MechanicsManager();
    initServices();
    initWarranties();
    initReports();
    
    // Configura eventos globais
    setupGlobalEvents();
    
    // Carrega a primeira aba
    loadTabContent('open-service');
});

let mechanicsManager;

function setupGlobalEvents() {
    // Alternar modo escuro/claro
    document.getElementById('theme-toggle').addEventListener('click', toggleDarkMode);
    
    // Modal sobre
    document.getElementById('about-btn').addEventListener('click', () => {
        document.getElementById('about-modal').style.display = 'flex';
    });
    
    // Modal mecânicos
    document.getElementById('manage-mechanics').addEventListener('click', () => {
        mechanicsManager.showManagementModal();
    });
    
    // Fechar modais
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.modal').forEach(modal => {
                modal.style.display = 'none';
            });
        });
    });
    
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    });
    
    // Navegação por abas
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            loadTabContent(tab.dataset.tab);
        });
    });
}

function loadTabContent(tabId) {
    const tabContents = document.getElementById('tab-contents');
    
    switch(tabId) {
        case 'open-service':
            tabContents.innerHTML = getOpenServiceTabContent();
            mechanicsManager.updateAllDropdowns();
            setupOpenServiceForm();
            break;
        case 'close-service':
            tabContents.innerHTML = getCloseServiceTabContent();
            mechanicsManager.updateAllDropdowns();
            setupCloseServiceForm();
            break;
        case 'open-warranty':
            tabContents.innerHTML = getOpenWarrantyTabContent();
            mechanicsManager.updateAllDropdowns();
            setupOpenWarrantyForm();
            break;
        case 'close-warranty':
            tabContents.innerHTML = getCloseWarrantyTabContent();
            mechanicsManager.updateAllDropdowns();
            setupCloseWarrantyForm();
            break;
        case 'reports':
            tabContents.innerHTML = getReportsTabContent();
            setupReports();
            break;
    }
}

function toggleDarkMode() {
    const darkModeStylesheet = document.getElementById('dark-mode');
    const themeToggle = document.getElementById('theme-toggle');
    
    if (darkModeStylesheet.disabled) {
        darkModeStylesheet.disabled = false;
        themeToggle.textContent = 'Modo Claro';
        localStorage.setItem('darkMode', 'enabled');
    } else {
        darkModeStylesheet.disabled = true;
        themeToggle.textContent = 'Modo Escuro';
        localStorage.setItem('darkMode', 'disabled');
    }
}

// Verifica o modo preferido do usuário
function checkPreferredColorScheme() {
    const darkModeStylesheet = document.getElementById('dark-mode');
    const themeToggle = document.getElementById('theme-toggle');
    
    // Verifica localStorage primeiro
    const darkModeSetting = localStorage.getItem('darkMode');
    
    if (darkModeSetting === 'enabled') {
        darkModeStylesheet.disabled = false;
        themeToggle.textContent = 'Modo Claro';
    } else if (darkModeSetting === 'disabled') {
        darkModeStylesheet.disabled = true;
        themeToggle.textContent = 'Modo Escuro';
    } else {
        // Se não houver preferência salva, verifica o modo do sistema
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            darkModeStylesheet.disabled = false;
            themeToggle.textContent = 'Modo Claro';
        } else {
            darkModeStylesheet.disabled = true;
            themeToggle.textContent = 'Modo Escuro';
        }
    }
}

// Chamada inicial para verificar o modo de cor
checkPreferredColorScheme();

// Funções auxiliares para gerar conteúdo HTML
function getOpenServiceTabContent() {
    return `
        <div class="card">
            <h2 class="card-title">Abertura de Ordem de Serviço</h2>
            <form id="open-service-form">
                <div class="form-row">
                    <div class="form-group">
                        <label for="os-client">Cliente</label>
                        <input type="text" id="os-client" required>
                    </div>
                    <div class="form-group">
                        <label for="os-equipment">Equipamento</label>
                        <input type="text" id="os-equipment" required>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="os-mechanic">Mecânico Responsável</label>
                        <select id="os-mechanic" required>
                            <option value="">Selecione...</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="os-start-date">Data/Hora Início</label>
                        <input type="datetime-local" id="os-start-date" required>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="os-problem">Problema Relatado</label>
                    <textarea id="os-problem" required></textarea>
                </div>
                
                <div class="form-group">
                    <label for="os-diagnosis">Diagnóstico Inicial</label>
                    <textarea id="os-diagnosis" required></textarea>
                </div>
                
                <div class="note-colors">
                    <div class="color-option color-yellow selected" data-color="yellow"></div>
                    <div class="color-option color-blue" data-color="blue"></div>
                    <div class="color-option color-green" data-color="green"></div>
                    <div class="color-option color-red" data-color="red"></div>
                    <div class="color-option color-purple" data-color="purple"></div>
                    <div class="color-option color-orange" data-color="orange"></div>
                </div>
                
                <div class="form-group">
                    <label for="os-notes">Observações</label>
                    <textarea id="os-notes" class="note-yellow"></textarea>
                </div>
                
                <button type="submit" class="btn-primary">Abrir Ordem de Serviço</button>
            </form>
        </div>
        
        <div class="card">
            <h2 class="card-title">Ordens de Serviço Abertas</h2>
            <ul class="service-list" id="open-services-list">
                <!-- Os itens serão adicionados dinamicamente via JavaScript -->
            </ul>
        </div>
    `;
}

function getCloseServiceTabContent() {
    return `
        <div class="card">
            <h2 class="card-title">Fechamento de Ordem de Serviço</h2>
            <form id="close-service-form">
                <div class="form-group">
                    <label for="cs-service-id">Selecione a OS</label>
                    <select id="cs-service-id" required>
                        <option value="">Selecione uma OS aberta...</option>
                    </select>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="cs-mechanic">Mecânico Responsável</label>
                        <select id="cs-mechanic" required>
                            <option value="">Selecione...</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="cs-end-date">Data/Hora Fim</label>
                        <input type="datetime-local" id="cs-end-date" required>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="cs-solution">Solução Aplicada</label>
                    <textarea id="cs-solution" required></textarea>
                </div>
                
                <div class="note-colors">
                    <div class="color-option color-yellow selected" data-color="yellow"></div>
                    <div class="color-option color-blue" data-color="blue"></div>
                    <div class="color-option color-green" data-color="green"></div>
                    <div class="color-option color-red" data-color="red"></div>
                    <div class="color-option color-purple" data-color="purple"></div>
                    <div class="color-option color-orange" data-color="orange"></div>
                </div>
                
                <div class="form-group">
                    <label for="cs-notes">Observações Finais</label>
                    <textarea id="cs-notes" class="note-yellow"></textarea>
                </div>
                
                <button type="submit" class="btn-primary">Fechar Ordem de Serviço</button>
            </form>
        </div>
    `;
}

function getOpenWarrantyTabContent() {
    return `
        <div class="card">
            <h2 class="card-title">Abertura de Garantia</h2>
            <form id="open-warranty-form">
                <div class="form-row">
                    <div class="form-group">
                        <label for="warranty-client">Cliente</label>
                        <input type="text" id="warranty-client" required>
                    </div>
                    <div class="form-group">
                        <label for="warranty-equipment">Equipamento</label>
                        <input type="text" id="warranty-equipment" required>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="warranty-mechanic">Mecânico Responsável</label>
                        <select id="warranty-mechanic" required>
                            <option value="">Selecione...</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="warranty-start-date">Data/Hora Início</label>
                        <input type="datetime-local" id="warranty-start-date" required>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="warranty-original-os">Número da OS Original</label>
                    <input type="text" id="warranty-original-os" required>
                </div>
                
                <div class="form-group">
                    <label for="warranty-problem">Problema Relatado</label>
                    <textarea id="warranty-problem" required></textarea>
                </div>
                
                <div class="form-group">
                    <label for="warranty-diagnosis">Diagnóstico Inicial</label>
                    <textarea id="warranty-diagnosis" required></textarea>
                </div>
                
                <div class="note-colors">
                    <div class="color-option color-yellow selected" data-color="yellow"></div>
                    <div class="color-option color-blue" data-color="blue"></div>
                    <div class="color-option color-green" data-color="green"></div>
                    <div class="color-option color-red" data-color="red"></div>
                    <div class="color-option color-purple" data-color="purple"></div>
                    <div class="color-option color-orange" data-color="orange"></div>
                </div>
                
                <div class="form-group">
                    <label for="warranty-notes">Observações</label>
                    <textarea id="warranty-notes" class="note-yellow"></textarea>
                </div>
                
                <button type="submit" class="btn-primary">Abrir Garantia</button>
            </form>
        </div>
        
        <div class="card">
            <h2 class="card-title">Garantias Abertas</h2>
            <ul class="service-list" id="open-warranties-list">
                <!-- Os itens serão adicionados dinamicamente via JavaScript -->
            </ul>
        </div>
    `;
}

function getCloseWarrantyTabContent() {
    return `
        <div class="card">
            <h2 class="card-title">Fechamento de Garantia</h2>
            <form id="close-warranty-form">
                <div class="form-group">
                    <label for="cw-warranty-id">Selecione a Garantia</label>
                    <select id="cw-warranty-id" required>
                        <option value="">Selecione uma garantia aberta...</option>
                    </select>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="cw-mechanic">Mecânico Responsável</label>
                        <select id="cw-mechanic" required>
                            <option value="">Selecione...</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="cw-end-date">Data/Hora Fim</label>
                        <input type="datetime-local" id="cw-end-date" required>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="cw-solution">Solução Aplicada</label>
                    <textarea id="cw-solution" required></textarea>
                </div>
                
                <div class="note-colors">
                    <div class="color-option color-yellow selected" data-color="yellow"></div>
                    <div class="color-option color-blue" data-color="blue"></div>
                    <div class="color-option color-green" data-color="green"></div>
                    <div class="color-option color-red" data-color="red"></div>
                    <div class="color-option color-purple" data-color="purple"></div>
                    <div class="color-option color-orange" data-color="orange"></div>
                </div>
                
                <div class="form-group">
                    <label for="cw-notes">Observações Finais</label>
                    <textarea id="cw-notes" class="note-yellow"></textarea>
                </div>
                
                <button type="submit" class="btn-primary">Fechar Garantia</button>
            </form>
        </div>
    `;
}

function getReportsTabContent() {
    return `
        <div class="card">
            <h2 class="card-title">Relatórios</h2>
            <form id="report-form">
                <div class="form-row">
                    <div class="form-group">
                        <label for="report-type">Tipo de Relatório</label>
                        <select id="report-type">
                            <option value="services">Ordens de Serviço</option>
                            <option value="warranties">Garantias</option>
                            <option value="mechanics">Desempenho de Mecânicos</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="report-period">Período</label>
                        <select id="report-period">
                            <option value="week">Última Semana</option>
                            <option value="month">Último Mês</option>
                            <option value="quarter">Último Trimestre</option>
                            <option value="year">Último Ano</option>
                            <option value="custom">Personalizado</option>
                        </select>
                    </div>
                </div>
                
                <div id="custom-dates" style="display: none;">
                    <div class="form-row">
                        <div class="form-group">
                            <label for="start-date">Data Inicial</label>
                            <input type="date" id="start-date">
                        </div>
                        <div class="form-group">
                            <label for="end-date">Data Final</label>
                            <input type="date" id="end-date">
                        </div>
                    </div>
                </div>
                
                <button type="button" id="generate-report" class="btn-primary">Gerar Relatório</button>
            </form>
        </div>
        
        <div class="card">
            <h2 class="card-title">Resultados</h2>
            <div class="chart-container">
                <canvas id="services-chart"></canvas>
            </div>
        </div>
    `;
}

function setupColorOptions(formId) {
    const form = document.getElementById(formId);
    if (!form) return;
    
    const colorOptions = form.querySelectorAll('.color-option');
    const textarea = form.querySelector('textarea[id$="-notes"]');
    
    colorOptions.forEach(option => {
        option.addEventListener('click', () => {
            colorOptions.forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');
            
            if (textarea) {
                // Remove todas as classes de cor
                textarea.className = textarea.className.replace(/\bnote-\w+\b/g, '');
                // Adiciona a nova classe de cor
                textarea.classList.add(`note-${option.dataset.color}`);
            }
        });
    });
}

function formatDate(dateString) {
    const options = { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
    };
    return new Date(dateString).toLocaleString('pt-BR', options);
}