// Funções para o dashboard do departamento

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

// Template para renderizar avaliações
function renderAvaliacoes(avaliacoes) {
    return avaliacoes.map(avaliacao => `
        <div class="card mb-2">
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <h6 class="card-subtitle text-muted">${avaliacao.data}</h6>
                    <div class="text-warning">${'★'.repeat(avaliacao.nota)}${'☆'.repeat(5-avaliacao.nota)}</div>
                </div>
                <p class="card-text">${avaliacao.comentario || 'Sem comentário'}</p>
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
                        <th>Data</th>
                        <th>Tipo</th>
                        <th>Total Refeições</th>
                        <th>Média Avaliação</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    ${historico.map(item => `
                        <tr>
                            <td>${item.data}</td>
                            <td>${item.tipo}</td>
                            <td>${item.total_refeicoes}</td>
                            <td>${item.media_avaliacao}</td>
                            <td><span class="badge bg-${item.status === 'Concluído' ? 'success' : 'warning'}">${item.status}</span></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

document.addEventListener('DOMContentLoaded', () => {
    // Verificar autenticação
    if (!localStorage.getItem('userType') || localStorage.getItem('userType') !== 'departamento') {
        window.location.href = 'login.html';
        return;
    }

    // Exibir nome do usuário
    const userName = localStorage.getItem('userName');
    if (userName) {
        document.getElementById('userName').textContent = userName;
    }

    // Carregar dados iniciais
    carregarEstatisticas();
    carregarAvaliacoes();
    carregarHistorico();

    // Inicializar formulários
    initCardapioForm();
    initRelatorioForm();
    initCadastroAlunoForm();

    // Adicionar evento para carregar alunos quando o modal for aberto
    const alunosModal = document.getElementById('alunosModal');
    if (alunosModal) {
        alunosModal.addEventListener('show.bs.modal', carregarAlunos);
    }

});

async function carregarEstatisticas() {
    showLoading('estatisticasContent');
    try {
        const response = await fetch('api/estatisticas.php');
        const data = await response.json();
        
        if (response.ok) {
            const estatisticasContent = document.getElementById('estatisticasContent');
            estatisticasContent.innerHTML = `
                <div class="row">
                    <div class="col-md-4 mb-3">
                        <div class="card bg-primary text-white">
                            <div class="card-body text-center">
                                <h3>${data.total_refeicoes || 0}</h3>
                                <p class="mb-0">Refeições Hoje</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4 mb-3">
                        <div class="card bg-success text-white">
                            <div class="card-body text-center">
                                <h3>${data.media_avaliacao || 0}</h3>
                                <p class="mb-0">Média Avaliações</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4 mb-3">
                        <div class="card bg-info text-white">
                            <div class="card-body text-center">
                                <h3>${data.total_usuarios || 0}</h3>
                                <p class="mb-0">Usuários Ativos</p>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        } else {
            throw new Error(data.message || 'Erro ao carregar estatísticas');
        }
    } catch (error) {
        handleError(error, 'estatisticasContent');
    }
}

async function carregarAvaliacoes() {
    showLoading('avaliacoesContent');
    try {
        const response = await fetch('api/avaliacoes.php');
        const data = await response.json();
        
        if (response.ok) {
            const avaliacoesContent = document.getElementById('avaliacoesContent');
            if (data.avaliacoes && data.avaliacoes.length > 0) {
                avaliacoesContent.innerHTML = renderAvaliacoes(data.avaliacoes);
            } else {
                avaliacoesContent.innerHTML = '<p class="text-muted">Nenhuma avaliação registrada</p>';
            }
        } else {
            throw new Error(data.message || 'Erro ao carregar avaliações');
        }
    } catch (error) {
        handleError(error, 'avaliacoesContent');
    }
}

async function carregarHistorico() {
    showLoading('historicoContent');
    try {
        const response = await fetch('api/historico.php');
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

function initCardapioForm() {
    const form = document.getElementById('cardapioForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = {
            data: document.getElementById('dataCardapio').value,
            almoco: document.getElementById('almoco').value,
            jantar: document.getElementById('jantar').value
        };

        try {
            const response = await fetch('api/cardapio.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            
            if (response.ok) {
                alert('Cardápio salvo com sucesso!');
                document.getElementById('cardapioModal').querySelector('.btn-close').click();
                form.reset();
            } else {
                throw new Error(data.message || 'Erro ao salvar cardápio');
            }
        } catch (error) {
            console.error('Erro:', error);
            alert('Erro ao salvar cardápio. Tente novamente mais tarde.');
        }
    });
}



// Função para carregar os alunos
async function carregarAlunos() {
    try {
        const tbody = document.getElementById('alunosTableBody');
        if (!tbody) {
            console.error('Elemento alunosTableBody não encontrado');
            return;
        }

        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Carregando...</span>
                    </div>
                </td>
            </tr>
        `;

        if (!localStorage.getItem('userType') || localStorage.getItem('userType') !== 'departamento') {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center text-danger">Acesso não autorizado</td></tr>';
            return;
        }

        console.log('Iniciando carregamento de alunos...');
        const response = await fetch('api/listar_alunos.php', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        });
        console.log('Status da resposta:', response.status);

        if (response.status === 403) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center text-danger">Acesso negado. Faça login novamente.</td></tr>';
            window.location.href = 'login.html';
            return;
        }

        if (!response.ok) {
            let errorMessage = 'Erro ao carregar alunos';
            try {
                const errorData = await response.json();
                errorMessage = errorData.message || errorMessage;
            } catch (e) {
                const errorText = await response.text();
                errorMessage = errorText || errorMessage;
            }
            console.error('Erro da API:', errorMessage);
            tbody.innerHTML = `<tr><td colspan="5" class="text-center text-danger">${errorMessage}</td></tr>`;
            return;
        }

        await atualizarTabelaAlunos(response);
    } catch (error) {
        console.error('Erro ao carregar alunos:', error);
        const tbody = document.getElementById('alunosTableBody');
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center text-danger">Erro ao carregar lista de alunos. Tente novamente mais tarde.</td></tr>';
        }
        alert('Não foi possível carregar a lista de alunos. Tente novamente mais tarde.');
    }
}

async function atribuirCurso(alunoId) {
    try {
        const cursoId = prompt('Digite o ID do curso:');
        if (!cursoId) return;

        const response = await fetch('api/atribuir_curso.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                aluno_id: alunoId,
                curso_id: cursoId
            })
        });

        const data = await response.json();
        if (response.ok) {
            alert('Curso atribuído com sucesso!');
            carregarAlunos(); // Recarrega a lista de alunos
        } else {
            throw new Error(data.message || 'Erro ao atribuir curso');
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao atribuir curso. Tente novamente.');
    }
async function carregarCursos() {
    try {
        const response = await fetch('api/cursos.php');
        if (!response.ok) {
            throw new Error('Erro ao carregar cursos');
        }
        return await response.json();
    } catch (error) {
        console.error('Erro ao carregar cursos:', error);
        return [];
    }
}

async function atualizarTabelaAlunos() {
    try {
        const alunos = await response.json();
        const cursos = await carregarCursos();
        const tbody = document.getElementById('alunosTableBody');
        tbody.innerHTML = '';
        
        alunos.forEach(aluno => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${aluno.matricula}</td>
                <td>${aluno.nome}</td>
                <td>${aluno.email}</td>
                <td>
                    <select class="form-select form-select-sm curso-select" data-matricula="${aluno.matricula}">
                        <option value="">Selecione um curso</option>
                        ${cursos.map(curso => `
                            <option value="${curso.id}" ${aluno.curso_id == curso.id ? 'selected' : ''}>
                                ${curso.nome}
                            </option>
                        `).join('')}
                    </select>
                </td>
                <td>
                    <button class="btn btn-primary btn-sm salvar-curso" data-matricula="${aluno.matricula}">
                        Salvar
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="excluirAluno('${aluno.matricula}')">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('Erro ao atualizar tabela:', error);
        tbody.innerHTML = '<tr><td colspan="5" class="text-center text-danger">Erro ao atualizar tabela de alunos</td></tr>';
    }
}

        // Adicionar event listeners para os botões de salvar
        document.querySelectorAll('.salvar-curso').forEach(button => {
            button.addEventListener('click', async (e) => {
                const matricula = e.target.dataset.matricula;
                const select = document.querySelector(`.curso-select[data-matricula="${matricula}"]`);
                const cursoId = select.value;

                if (!cursoId) {
                    alert('Por favor, selecione um curso.');
                    return;
                }

                try {
                    const response = await fetch('api/atribuir_curso.php', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            matricula: matricula,
                            curso_id: cursoId
                        })
                    });

                    const data = await response.json();
                    
                    if (response.ok) {
                        alert(data.message);
                        await carregarAlunos(); // Recarregar a lista de alunos
                    } else {
                        throw new Error(data.message || 'Erro ao atribuir curso');
                    }
                } catch (error) {
                    console.error('Erro:', error);
                    alert('Erro ao atribuir curso ao aluno. ' + error.message);
                }
            });
        });
    } 

// Função para excluir aluno
async function excluirAluno(matricula) {
    if (!confirm('Tem certeza que deseja excluir este aluno?')) return;
    
    try {
        const response = await fetch('api/excluir_aluno.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ matricula })
        });

        if (!response.ok) {
            throw new Error('Erro ao excluir aluno');
        }

        await carregarAlunos(); // Recarregar a lista de alunos
        alert('Aluno excluído com sucesso!');
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao excluir aluno. ' + error.message);
    }
}

// Função para inicializar o formulário de cadastro de aluno
async function carregarCursos() {
    try {
        const response = await fetch('api/cursos.php');
        if (!response.ok) {
            throw new Error('Erro ao carregar cursos');
        }
        const cursos = await response.json();
        const selectCurso = document.getElementById('curso');
        if (!selectCurso) {
            throw new Error('Elemento select de curso não encontrado');
        }

        // Limpar opções existentes exceto a primeira
        while (selectCurso.options.length > 1) {
            selectCurso.remove(1);
        }

        // Atualizar texto da primeira opção
        selectCurso.options[0].text = 'Selecione um curso';

        // Verificar se há cursos disponíveis
        if (!Array.isArray(cursos) || cursos.length === 0) {
            selectCurso.options[0].text = 'Nenhum curso disponível';
            return;
        }

        // Adicionar opções de curso
        cursos.forEach(curso => {
            const option = document.createElement('option');
            option.value = curso.id;
            option.textContent = curso.nome;
            selectCurso.appendChild(option);
        });
    } catch (error) {
        console.error('Erro ao carregar cursos:', error);
        const selectCurso = document.getElementById('curso');
        if (selectCurso) {
            selectCurso.options[0].text = 'Erro ao carregar cursos';
        }
    }
}



function initCadastroAlunoForm() {
    const form = document.getElementById('cadastroAlunoForm');
    if (!form) return;

    // Carregar cursos quando o modal for aberto
    document.getElementById('cadastroAlunoModal').addEventListener('show.bs.modal', carregarCursos);

    // Preview da imagem
    const fotoInput = document.getElementById('foto');
    const previewContainer = document.getElementById('previewContainer');
    const imagePreview = document.getElementById('imagePreview');

    fotoInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                imagePreview.src = e.target.result;
                previewContainer.classList.remove('d-none');
            };
            reader.readAsDataURL(file);
        }
    });

    // Validação e envio do formulário
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const senha = document.getElementById('senha').value;
        const confirmarSenha = document.getElementById('confirmarSenha').value;
        const senhaFeedback = document.getElementById('senhaFeedback');

        if (senha !== confirmarSenha) {
            senhaFeedback.textContent = 'As senhas não coincidem';
            document.getElementById('confirmarSenha').classList.add('is-invalid');
            return;
        }

        const formData = new FormData(form);

        try {
            const response = await fetch('api/register_discente.php', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (response.ok) {
                alert('Aluno cadastrado com sucesso!');
                form.reset();
                previewContainer.classList.add('d-none');
                document.getElementById('cadastroAlunoModal').querySelector('.btn-close').click();
                await carregarAlunos(); // Recarregar a lista de alunos
            } else {
                throw new Error(data.message || 'Erro ao cadastrar aluno');
            }
        } catch (error) {
            console.error('Erro:', error);
            alert('Erro ao cadastrar aluno. ' + error.message);
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
            const response = await fetch('api/relatorio.php', {
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
