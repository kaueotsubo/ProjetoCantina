// Funções para o dashboard do fiscal

// Função global para tratamento de erros
function handleError(error, containerId) {
    console.error('Erro:', error);
    document.getElementById(containerId).innerHTML = 
        '<p class="text-danger">Erro ao carregar dados. Tente novamente mais tarde.</p>';
}

// Função para exibir spinner de carregamento
function showLoading(containerId) {
    document.getElementById(containerId).innerHTML = `
        <div class="d-flex justify-content-center">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Carregando...</span>
            </div>
        </div>
    `;
}

// Template para renderizar validações
function renderValidacoes(validacoes) {
    return validacoes.map(validacao => `
        <div class="card mb-2">
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <h6 class="card-subtitle text-muted">${validacao.data}</h6>
                    <span class="badge bg-${validacao.status === 'Confirmado' ? 'success' : 'warning'}">
                        ${validacao.status}
                    </span>
                </div>
                <p class="card-text">${validacao.nome_discente} - ${validacao.tipo_refeicao}</p>
            </div>
        </div>
    `).join('');
}

// Template para renderizar histórico
function renderHistorico(historico) {
    return `
        <div class="table-responsive">
            <table class="table table-striped">
                <thead>
                    <tr>
                        <th>Data/Hora</th>
                        <th>Discente</th>
                        <th>Refeição</th>
                        <th>Status</th>
                        <th>Validado por</th>
                    </tr>
                </thead>
                <tbody>
                    ${historico.map(item => `
                        <tr>
                            <td>${item.data_hora}</td>
                            <td>${item.nome_discente}</td>
                            <td>${item.tipo_refeicao}</td>
                            <td><span class="badge bg-${item.status === 'Confirmado' ? 'success' : 'warning'}">${item.status}</span></td>
                            <td>${item.fiscal}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

document.addEventListener('DOMContentLoaded', () => {
    // Verificar autenticação
    if (!localStorage.getItem('userType') || localStorage.getItem('userType') !== 'fiscal') {
        window.location.href = 'login.html';
        return;
    }

    // Exibir nome do usuário
    const userName = localStorage.getItem('userName');
    if (userName) {
        document.getElementById('userName').textContent = userName;
    }

    // Carregar dados iniciais
    carregarConfirmacoes();
    carregarValidacoes();
    carregarHistorico();

    // Inicializar scanner QR Code
    initQRCodeScanner();
    // Inicializar formulário de relatório
    initRelatorioForm();
});

async function carregarConfirmacoes() {
    showLoading('confirmacoesContent');
    try {
        const response = await fetch('api/confirmacoes.php');
        const data = await response.json();
        
        if (response.ok) {
            const confirmacoesContent = document.getElementById('confirmacoesContent');
            confirmacoesContent.innerHTML = `
                <div class="row">
                    <div class="col-md-4 mb-3">
                        <div class="card bg-primary text-white">
                            <div class="card-body text-center">
                                <h3>${data.total_confirmacoes || 0}</h3>
                                <p class="mb-0">Total Hoje</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4 mb-3">
                        <div class="card bg-success text-white">
                            <div class="card-body text-center">
                                <h3>${data.confirmacoes_almoco || 0}</h3>
                                <p class="mb-0">Almoço</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4 mb-3">
                        <div class="card bg-info text-white">
                            <div class="card-body text-center">
                                <h3>${data.confirmacoes_jantar || 0}</h3>
                                <p class="mb-0">Jantar</p>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        } else {
            throw new Error(data.message || 'Erro ao carregar confirmações');
        }
    } catch (error) {
        handleError(error, 'confirmacoesContent');
    }
}

async function carregarValidacoes() {
    showLoading('validacoesContent');
    try {
        const response = await fetch('api/validacoes.php');
        const data = await response.json();
        
        if (response.ok) {
            const validacoesContent = document.getElementById('validacoesContent');
            if (data.validacoes && data.validacoes.length > 0) {
                validacoesContent.innerHTML = renderValidacoes(data.validacoes);
            } else {
                validacoesContent.innerHTML = '<p class="text-muted">Nenhuma validação registrada</p>';
            }
        } else {
            throw new Error(data.message || 'Erro ao carregar validações');
        }
    } catch (error) {
        handleError(error, 'validacoesContent');
    }
}

async function carregarHistorico(periodo = 'hoje') {
    showLoading('historicoContent');
    try {
        const response = await fetch(`api/historico_validacoes.php?periodo=${periodo}`);
        const data = await response.json();
        
        if (response.ok) {
            const historicoContent = document.getElementById('historicoContent');
            if (data.historico && data.historico.length > 0) {
                historicoContent.innerHTML = renderHistorico(data.historico);
            } else {
                historicoContent.innerHTML = '<p class="text-muted">Nenhum histórico disponível</p>';
            }
        } else {
            throw new Error(data.message || 'Erro ao carregar histórico');
        }
    } catch (error) {
        handleError(error, 'historicoContent');
    }
}

function filtrarPorPeriodo(periodo) {
    carregarHistorico(periodo);
}

function initQRCodeScanner() {
    const html5QrcodeScanner = new Html5QrcodeScanner(
        "reader", { fps: 10, qrbox: 250 }
    );

    html5QrcodeScanner.render(async (decodedText) => {
        try {
            const qrData = JSON.parse(decodedText);
            
            const response = await fetch('api/validar_refeicao.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: qrData.userId,
                    timestamp: qrData.timestamp
                })
            });

            const data = await response.json();
            
            if (response.ok) {
                document.getElementById('result').innerHTML = `
                    <div class="alert alert-success mt-3" role="alert">
                        Refeição validada com sucesso!
                        <br>
                        Discente: ${data.nome_discente}
                        <br>
                        Refeição: ${data.tipo_refeicao}
                    </div>
                `;
                // Recarregar dados
                carregarConfirmacoes();
                carregarValidacoes();
                carregarHistorico();
            } else {
                throw new Error(data.message || 'Erro ao validar refeição');
            }
        } catch (error) {
            console.error('Erro:', error);
            document.getElementById('result').innerHTML = `
                <div class="alert alert-danger mt-3" role="alert">
                    ${error.message || 'Erro ao processar QR Code'}
                </div>
            `;
        }
    });
}

function initRelatorioForm() {
    const form = document.getElementById('relatorioForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = {
            data_inicio: document.getElementById('dataInicio').value,
            data_fim: document.getElementById('dataFim').value,
            tipo: document.getElementById('tipoRelatorio').value
        };

        try {
            const response = await fetch('api/relatorio_validacoes.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            
            if (response.ok) {
                // Aqui você pode implementar a lógica para exibir ou baixar o relatório
                window.open(data.relatorio_url, '_blank');
                document.getElementById('relatorioModal').querySelector('.btn-close').click();
                form.reset();
            } else {
                throw new Error(data.message || 'Erro ao gerar relatório');
            }
        } catch (error) {
            console.error('Erro:', error);
            alert('Erro ao gerar relatório. Tente novamente mais tarde.');
        }
    });
}

function logout() {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = 'login.html';
}