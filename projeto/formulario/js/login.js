// Sistema de autenticação para login

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const formData = new FormData(loginForm);
            const email = formData.get('email');
            const senha = formData.get('senha');
            const tipo = formData.get('tipo');

            try {
                const response = await fetch('api/login.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        email: email,
                        senha: senha,
                        tipo: tipo
                    })
                });

                const data = await response.json();

                if (response.ok) {
                    // Armazenar dados do usuário no localStorage
                    localStorage.setItem('userToken', data.token);
                    localStorage.setItem('userType', data.tipo);
                    localStorage.setItem('userName', data.nome);

                    // Redirecionar baseado no tipo de usuário
                    switch (data.tipo) {
                        case 'discente':
                            window.location.href = 'dashboard_discente.html';
                            break;
                        case 'departamento':
                            window.location.href = 'dashboard_departamento.html';
                            break;
                        case 'empresa':
                            window.location.href = 'dashboard_empresa.html';
                            break;
                        case 'fiscal':
                            window.location.href = 'dashboard_fiscal.html';
                            break;
                        default:
                            alert('Tipo de usuário não reconhecido');
                    }
                } else {
                    alert(data.message || 'Erro ao fazer login');
                }
            } catch (error) {
                console.error('Erro ao processar login:', error);
                alert('Erro ao processar login. Tente novamente.');
            }
        });
    }
});