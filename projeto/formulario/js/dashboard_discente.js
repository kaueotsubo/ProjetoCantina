// Funções para o dashboard do discente

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

// Template para renderizar cardápio
function renderCardapio(data) {
    return `
        <h6>Data: ${data.data}</h6>
        <div class="mt-3">
            <h6 class="text-primary">Almoço</h6>
            <p>${data.cardapio.almoco || 'Não disponível'}</p>
        </div>
        <div class="mt-3">
            <h6 class="text-primary">Jantar</h6>
            <p>${data.cardapio.jantar || 'Não disponível'}</p>
        </div>
    `;
}

// Template para renderizar refeições
function renderRefeicoes(refeicoes) {
    return refeicoes.map(refeicao => `
        <div class="card mb-2">
            <div class="card-body">
                <h6 class="card-subtitle mb-2 text-muted">${refeicao.data}</h6>
                <p class="card-text">${refeicao.tipo} - ${refeicao.status}</p>
            </div>
        </div>
    `).join('');
}

document.addEventListener('DOMContentLoaded', () => {
    // Verificar autenticação
    if (!localStorage.getItem('userType') || localStorage.getItem('userType') !== 'discente') {
        window.location.href = 'login.html';
        return;
    }

    // Exibir nome do usuário
    const userName = localStorage.getItem('userName');
    if (userName) {
        document.getElementById('userName').textContent = userName;
    }

    // Carregar cardápio do dia
    carregarCardapio();
    // Carregar histórico de refeições
    carregarRefeicoes();
    // Inicializar QR Code
    initQRCode();
    // Inicializar formulário de avaliação
    initAvaliacaoForm();
});

async function carregarCardapio() {
    showLoading('cardapioContent');
    try {
        const response = await fetch('api/cardapio.php');
        const data = await response.json();
        
        if (response.ok) {
            const cardapioContent = document.getElementById('cardapioContent');
            if (data.cardapio) {
                cardapioContent.innerHTML = renderCardapio(data);
            } else {
                cardapioContent.innerHTML = '<p class="text-muted">Cardápio não disponível para hoje</p>';
            }
        } else {
            throw new Error(data.message || 'Erro ao carregar cardápio');
        }
    } catch (error) {
        handleError(error, 'cardapioContent');
    }
}

async function carregarRefeicoes() {
    showLoading('refeicoesContent');
    try {
        const response = await fetch('api/refeicoes.php');
        const data = await response.json();
        
        if (response.ok) {
            const refeicoesContent = document.getElementById('refeicoesContent');
            if (data.refeicoes && data.refeicoes.length > 0) {
                refeicoesContent.innerHTML = renderRefeicoes(data.refeicoes);
            } else {
                refeicoesContent.innerHTML = '<p class="text-muted">Nenhuma refeição registrada</p>';
            }
        } else {
            throw new Error(data.message || 'Erro ao carregar refeições');
        }
    } catch (error) {
        handleError(error, 'refeicoesContent');
    }
}

function initQRCode() {
    const qrcodeContainer = document.getElementById('qrcodeContainer');
    const userId = localStorage.getItem('userId');
    
    if (userId) {
        // Gerar dados para o QR Code (pode incluir mais informações conforme necessário)
        const qrData = JSON.stringify({
            userId: userId,
            timestamp: new Date().getTime()
        });

        // Limpar container anterior
        qrcodeContainer.innerHTML = '';
        
        // Gerar novo QR Code
        new QRCode(qrcodeContainer, {
            text: qrData,
            width: 200,
            height: 200
        });
    }
}

function initAvaliacaoForm() {
    const form = document.getElementById('avaliacaoForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const rating = document.querySelector('input[name="rating"]:checked')?.value;
        const comentario = document.getElementById('comentario').value;

        if (!rating) {
            alert('Por favor, selecione uma nota');
            return;
        }

        try {
            const response = await fetch('api/avaliacao.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    rating: rating,
                    comentario: comentario
                })
            });

            const data = await response.json();
            
            if (response.ok) {
                alert('Avaliação enviada com sucesso!');
                document.getElementById('avaliacaoModal').querySelector('.btn-close').click();
                form.reset();
            } else {
                throw new Error(data.message || 'Erro ao enviar avaliação');
            }
        } catch (error) {
            console.error('Erro:', error);
            alert('Erro ao enviar avaliação. Tente novamente mais tarde.');
        }
    });
}

function logout() {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = 'login.html';
}