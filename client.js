document.getElementById('uploadForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const form = event.target;
    const formData = new FormData(form);
    const statusDiv = document.getElementById('status');

    statusDiv.textContent = 'Enviando... Por favor, aguarde.';

    try {
        const response = await fetch('/criar-retrospectiva', {
            method: 'POST',
            body: formData // Não precisa de 'Content-Type' header, o browser define automaticamente
        });

        const result = await response.json();

        if (response.ok) {
            // Sucesso! Mostra o link para o cliente.
            statusDiv.innerHTML = `Retrospectiva criada com sucesso! <br> Seu link: <a href="/retrospectiva/${result.id}" target="_blank">Clique aqui para ver</a>`;
        } else {
            // Erro vindo do servidor
            statusDiv.textContent = `Erro: ${result.message}`;
        }
    } catch (error) {
        // Erro de rede ou conexão
        console.error('Erro de rede:', error);
        statusDiv.textContent = 'Ocorreu um erro na comunicação com o servidor. Tente novamente.';
    }
});