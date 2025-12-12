var API_BASE_URL = 'https://labmotors-testedetraavis.onrender.com/api';

// Função para enviar solicitação de serviço
async function enviarSolicitacaoServico(dados) {
  try {
    const response = await fetch(`${API_BASE_URL}/Servico/solicitar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dados)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      // Se for conflito de horário (409), retornar mensagem específica
      if (response.status === 409) {
        throw new Error(errorData.message || 'Este horário já está ocupado. Escolha outro horário.');
      }
      throw new Error(errorData.message || `Erro ao solicitar serviço: ${response.status}`);
    }

    const resultado = await response.json();
    return resultado;
  } catch (error) {
    console.error('Erro ao enviar solicitação:', error);
    throw error;
  }
}

// Tornar função disponível globalmente para o agenda.js usar
window.enviarSolicitacaoServico = enviarSolicitacaoServico;

