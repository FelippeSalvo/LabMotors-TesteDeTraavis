document.addEventListener("DOMContentLoaded", () => {
  const API_BASE_URL = window.API_BASE_URL || 'https://labmotors-testedetraavis.onrender.com/api';
  // Gera horários de 00:00 até 23:00
  const horarios = [];
  for (let i = 0; i < 24; i++) {
    horarios.push(String(i).padStart(2, "0") + ":00");
  }

  // Estrutura: agendamentos[data] = [{hora, nome, tipo, placa, telefone, obs}, ...]
  let agendamentos = {};
  let dataAtual = new Date();
  let mesAtual = dataAtual.getMonth();
  let anoAtual = dataAtual.getFullYear();
  let diaSelecionado = null;
  let dataSelecionadaPopup = null;
  let agendamentoEditando = null;

  // Carregar agendamentos persistidos da API (com base nas ordens de serviço)
  async function carregarAgendamentosDaAPI() {
    try {
      // Sempre começar limpo (evita lixo de navegações anteriores)
      agendamentos = {};

      const resp = await fetch(`${API_BASE_URL}/OrdemServico`);
      if (!resp.ok) return;
      const ordens = await resp.json();

      ordens.forEach(o => {
        const servico = o.servico || o.Servico;
        if (!servico) return;

        const dataBruta = servico.data || servico.Data;
        const horario = servico.horario || servico.Horario;
        if (!dataBruta || !horario) return;

        const dataObj = new Date(dataBruta);
        if (isNaN(dataObj.getTime())) return;

        const dataStr = dataObj.toISOString().split('T')[0];
        if (!agendamentos[dataStr]) agendamentos[dataStr] = [];

        agendamentos[dataStr].push({
          hora: horario,
          nome: servico.cliente || servico.Cliente || '',
          tipo: servico.tipoServico || servico.TipoServico || '',
          placa: servico.placa || servico.Placa || '',
          telefone: servico.telefone || servico.Telefone || '',
          obs: servico.observacoes || servico.Observacoes || '',
          servicoId: servico.id || servico.Id || null,
          clienteId: servico.clienteId || servico.ClienteId || 0
        });
      });
    } catch (e) {
      console.error('Erro ao carregar agendamentos da API:', e);
    }
  }

  // Sistema de notificações
  function mostrarNotificacao(mensagem, tipo = "success") {
    const container = document.getElementById("notificationsContainer");
    if (!container) return;

    const notification = document.createElement("div");
    notification.className = `notification notification-${tipo}`;
    const icon = tipo === "success" ? "✓" : tipo === "error" ? "✕" : "ℹ";
    notification.innerHTML = `
      <div class="notification-icon">${icon}</div>
      <div class="notification-message">${mensagem}</div>
      <button class="notification-close">&times;</button>
    `;

    container.appendChild(notification);

    setTimeout(() => notification.classList.add("show"), 10);

    const closeBtn = notification.querySelector(".notification-close");
    closeBtn.addEventListener("click", () => fecharNotificacao(notification));

    setTimeout(() => fecharNotificacao(notification), 4000);
  }

  function fecharNotificacao(notification) {
    notification.classList.remove("show");
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }

  // Modal de confirmação de exclusão
  function confirmarExclusao(mensagem, callback) {
    const modal = document.createElement("div");
    modal.className = "confirm-modal-overlay";
    modal.innerHTML = `
      <div class="confirm-modal">
        <div class="confirm-modal-header">
          <h3>Confirmar Exclusão</h3>
        </div>
        <div class="confirm-modal-body">
          <p>${mensagem}</p>
        </div>
        <div class="confirm-modal-actions">
          <button class="confirm-btn-cancel">Cancelar</button>
          <button class="confirm-btn-confirm">Excluir</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add("show"), 10);

    const cancelBtn = modal.querySelector(".confirm-btn-cancel");
    const confirmBtn = modal.querySelector(".confirm-btn-confirm");

    cancelBtn.addEventListener("click", () => {
      modal.classList.remove("show");
      setTimeout(() => document.body.removeChild(modal), 300);
    });

    confirmBtn.addEventListener("click", () => {
      modal.classList.remove("show");
      setTimeout(() => {
        document.body.removeChild(modal);
        callback();
      }, 300);
    });

    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.classList.remove("show");
        setTimeout(() => document.body.removeChild(modal), 300);
      }
    });
  }

  // Elementos do DOM
  const calendarGrid = document.getElementById("calendarGrid");
  const currentMonthText = document.getElementById("currentMonth");
  const selectedDateTitle = document.getElementById("selectedDateTitle");
  const timeGrid = document.getElementById("timeGrid");
  const popupOverlay = document.getElementById("popupOverlay");
  const popupTime = document.getElementById("popupTime");
  
  if (!calendarGrid || !currentMonthText || !selectedDateTitle || !timeGrid) {
    console.error("Elementos do calendário não encontrados!");
    return;
  }

  // Carregar calendário
  function carregarCalendario() {
    calendarGrid.innerHTML = "";

    const primeiroDia = new Date(anoAtual, mesAtual, 1).getDay();
    const totalDias = new Date(anoAtual, mesAtual + 1, 0).getDate();

    dataAtual = new Date(anoAtual, mesAtual, 1);
    currentMonthText.textContent =
      `${dataAtual.toLocaleString("pt-BR", { month: "long" }).toUpperCase()} ${anoAtual}`;

    // Ajusta para começar na segunda-feira (0=Dom vira 6, 1=Seg vira 0)
    let primeiroDiaAjustado = primeiroDia === 0 ? 6 : primeiroDia - 1;

    for (let i = 0; i < primeiroDiaAjustado; i++) {
      const vazio = document.createElement("div");
      vazio.classList.add("calendar-empty");
      calendarGrid.appendChild(vazio);
    }

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    
    for (let dia = 1; dia <= totalDias; dia++) {
      const dayEl = document.createElement("div");
      dayEl.classList.add("calendar-day");
      
      const dataDia = new Date(anoAtual, mesAtual, dia);
      dataDia.setHours(0, 0, 0, 0);
      
      const isHoje = dataDia.getTime() === hoje.getTime();
      if (isHoje) {
        dayEl.classList.add("today");
      }
      
      const diaContent = document.createElement("div");
      diaContent.className = "day-number";
      diaContent.textContent = dia;
      dayEl.appendChild(diaContent);
      
      const dataFormatada = `${anoAtual}-${String(mesAtual + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
      const agendamentosDia = agendamentos[dataFormatada] || [];
      
      if (agendamentosDia.length > 0) {
        const badge = document.createElement("div");
        badge.className = "day-badge";
        badge.textContent = agendamentosDia.length;
        dayEl.appendChild(badge);
        dayEl.classList.add("has-appointments");
      }
      
      if (dataDia < hoje) {
        dayEl.classList.add("disabled");
      } else {
        dayEl.addEventListener("click", () => selecionarDia(dia, dayEl));
      }

      calendarGrid.appendChild(dayEl);
    }

    if (diaSelecionado) {
      const dayEl = Array.from(calendarGrid.children).find(d => {
        const dayNumber = d.querySelector(".day-number");
        return dayNumber && dayNumber.textContent == diaSelecionado;
      });
      if (dayEl && !dayEl.classList.contains("disabled")) {
        dayEl.classList.add("selected");
        const dataFormatada = `${anoAtual}-${String(mesAtual + 1).padStart(2, "0")}-${String(diaSelecionado).padStart(2, "0")}`;
        selectedDateTitle.textContent = `Horários do dia ${diaSelecionado}/${mesAtual + 1}`;
        carregarHorarios(dataFormatada);
      } else {
        diaSelecionado = null;
        timeGrid.innerHTML = "";
        selectedDateTitle.textContent = "Selecione um dia";
        const timeSection = document.querySelector(".time-section");
        if (timeSection) {
          timeSection.style.display = "block";
          timeSection.style.visibility = "visible";
          timeSection.style.opacity = "1";
        }
      }
    } else {
      timeGrid.innerHTML = "";
      selectedDateTitle.textContent = "Selecione um dia";
      const timeSection = document.querySelector(".time-section");
      if (timeSection) {
        timeSection.style.display = "block";
        timeSection.style.visibility = "visible";
        timeSection.style.opacity = "1";
      }
    }
  }

  // Selecionar dia
  function selecionarDia(dia, el) {
    diaSelecionado = dia;

    document.querySelectorAll(".calendar-day").forEach(d => d.classList.remove("selected"));
    if (el) el.classList.add("selected");

    const dataFormatada = `${anoAtual}-${String(mesAtual + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
    dataSelecionadaPopup = dataFormatada;

    selectedDateTitle.textContent = `Horários do dia ${dia}/${mesAtual + 1}`;
    carregarHorarios(dataFormatada);
    
    const timeSection = document.querySelector(".time-section");
    if (timeSection) {
      timeSection.style.display = "block";
      timeSection.style.visibility = "visible";
      timeSection.style.opacity = "1";
    }
    
    // Todos os usuários logados podem abrir o popup
    abrirPopupDia(dataFormatada, dia);
  }

  // Carregar horários
  function carregarHorarios(dataStr) {
    timeGrid.innerHTML = "";

    horarios.forEach(h => {
      const slot = document.createElement("div");
      slot.classList.add("time-slot");
      
      const jaAgendado = agendamentos[dataStr]?.some(a => a.hora === h);

      if (jaAgendado) {
        slot.classList.add("booked");
        const agendamento = agendamentos[dataStr].find(a => a.hora === h);
        const usuarioAdmin = isAdmin();
        
        // Se for admin, mostrar detalhes no tooltip. Se for usuário comum, apenas indicar que está ocupado
        if (usuarioAdmin) {
          slot.title = `🔒 Horário Ocupado\nCliente: ${agendamento.nome}\nServiço: ${agendamento.tipo}\nPlaca: ${agendamento.placa}`;
        } else {
          slot.title = `🔒 Horário Ocupado`;
        }
        
        slot.style.cursor = 'not-allowed';
        // Criar um span para o horário para melhor controle
        const horaSpan = document.createElement("span");
        horaSpan.textContent = h;
        horaSpan.style.position = "relative";
        horaSpan.style.zIndex = "1";
        slot.appendChild(horaSpan);
      } else {
        slot.textContent = h;
        slot.addEventListener("click", () => {
          // Todos os usuários logados podem criar agendamentos
          const [ano, mes, dia] = dataStr.split('-');
          const diaNum = parseInt(dia);
          selectedDateTitle.textContent = `Horários do dia ${diaNum}/${mes}`;
          carregarHorarios(dataStr);
          setTimeout(() => {
            abrirPopupDia(dataStr, diaNum);
            document.getElementById("popupTime").value = h;
          }, 100);
        });
      }

      timeGrid.appendChild(slot);
    });
  }

  // Pop-up de agendamento
  function abrirPopupDia(data, dia) {
    if (!popupOverlay) return;
    
    dataSelecionadaPopup = data;
    agendamentoEditando = null;
    
    const [ano, mes, diaNum] = data.split('-');
    const dataFormatada = `${diaNum}/${mes}/${ano}`;
    document.getElementById("popupDateInfo").textContent = `Data: ${dataFormatada}`;
    
    document.getElementById("nomeCliente").value = "";
    document.getElementById("tipoServico").value = "";
    document.getElementById("placaMoto").value = "";
    const telefoneEl = document.getElementById("telefoneCliente");
    if (telefoneEl) telefoneEl.value = "";
    document.getElementById("obs").value = "";
    document.getElementById("popupTime").value = "";
    document.getElementById("popupTitle").textContent = "Novo Agendamento";
    
    // Formulário sempre visível - todos podem criar agendamentos
    const popupForm = document.querySelector(".popup-form");
    if (popupForm) {
      popupForm.style.display = "block";
    }
    
    carregarHorariosSelect(data);
    carregarListaAgendamentos(data);
    
    if (dia) {
      const diaNum = parseInt(dia);
      selectedDateTitle.textContent = `Horários do dia ${diaNum}/${mesAtual + 1}`;
      carregarHorarios(data);
    }
    
    popupOverlay.style.display = "flex";
  }

  function carregarHorariosSelect(data) {
    const select = document.getElementById("popupTime");
    select.innerHTML = '<option value="">Selecione um horário</option>';
    
    horarios.forEach(h => {
      const jaAgendado = agendamentos[data]?.some(a => a.hora === h);
      if (!jaAgendado) {
        const option = document.createElement("option");
        option.value = h;
        option.textContent = h;
        select.appendChild(option);
      }
    });
  }

  // Função para obter o cliente logado
  function getClienteLogado() {
    try {
      const clienteStr = localStorage.getItem('cliente');
      return clienteStr ? JSON.parse(clienteStr) : null;
    } catch (e) {
      return null;
    }
  }

  // Função para verificar se o usuário é admin
  function isAdmin() {
    const clienteLogado = getClienteLogado();
    return clienteLogado && (clienteLogado.Admin === true || clienteLogado.admin === true);
  }

  // Função para verificar se o cliente pode editar o agendamento
  function podeEditarAgendamento(agendamento) {
    const clienteLogado = getClienteLogado();
    // Se não há cliente logado, não pode editar
    if (!clienteLogado || !clienteLogado.id) {
      return false;
    }
    // Se o usuário é admin, pode editar qualquer agendamento
    if (clienteLogado.Admin === true || clienteLogado.admin === true) {
      return true;
    }
    // Usuários comuns não podem editar agendamentos
    return false;
  }

  function carregarListaAgendamentos(data) {
    const lista = document.getElementById("listaAgendamentos");
    lista.innerHTML = "";
    
    if (!agendamentos[data] || agendamentos[data].length === 0) {
      lista.innerHTML = '<p class="sem-agendamentos">Nenhum agendamento para este dia</p>';
      return;
    }
    
    const clienteLogado = getClienteLogado();
    const usuarioAdmin = isAdmin();
    
    agendamentos[data].forEach((agendamento, index) => {
      const podeEditar = podeEditarAgendamento(agendamento);
      const item = document.createElement("div");
      item.classList.add("agendamento-item");
      
      // Se for admin, mostrar todas as informações
      // Se for usuário comum, mostrar apenas que há um agendamento no horário
      if (usuarioAdmin) {
        item.innerHTML = `
          <div class="agendamento-info">
            <div class="agendamento-hora">${agendamento.hora}</div>
            <div class="agendamento-detalhes">
              <strong>${agendamento.nome}</strong>
              <span>${agendamento.tipo}</span>
              <span>Placa: ${agendamento.placa}</span>
              ${agendamento.telefone ? `<span>Tel: ${agendamento.telefone}</span>` : ''}
              ${agendamento.obs ? `<span class="obs">Obs: ${agendamento.obs}</span>` : ''}
            </div>
          </div>
          <div class="agendamento-actions">
            <button class="btn-edit" onclick="editarAgendamento('${data}', ${index})">Editar</button>
            <button class="btn-delete" onclick="excluirAgendamento('${data}', ${index})">Excluir</button>
          </div>
        `;
      } else {
        // Usuário comum: mostrar apenas que há um agendamento no horário
        item.innerHTML = `
          <div class="agendamento-info">
            <div class="agendamento-hora">${agendamento.hora}</div>
            <div class="agendamento-detalhes">
              <span>Horário ocupado</span>
            </div>
          </div>
        `;
      }
      
      lista.appendChild(item);
    });
  }

  // Funções globais para editar e excluir
  window.editarAgendamento = function(data, index) {
    const agendamento = agendamentos[data][index];
    
    // Verificar se o cliente pode editar (apenas admin)
    if (!podeEditarAgendamento(agendamento)) {
      mostrarNotificacao("Você não tem permissão para editar este agendamento. Apenas administradores podem editar agendamentos.", "error");
      return;
    }
    
    // Garantir que o formulário está visível
    const popupForm = document.querySelector(".popup-form");
    if (popupForm) {
      popupForm.style.display = "block";
    }
    
    agendamentoEditando = { data, index, servicoId: agendamento.servicoId };
    
    document.getElementById("popupTime").value = agendamento.hora;
    document.getElementById("nomeCliente").value = agendamento.nome;
    document.getElementById("tipoServico").value = agendamento.tipo;
    document.getElementById("placaMoto").value = agendamento.placa;
    const telefoneEl = document.getElementById("telefoneCliente");
    if (telefoneEl) telefoneEl.value = agendamento.telefone || "";
    document.getElementById("obs").value = agendamento.obs || "";
    document.getElementById("popupTitle").textContent = "Editar Agendamento";
    
    const select = document.getElementById("popupTime");
    const optionAtual = Array.from(select.options).find(opt => opt.value === agendamento.hora);
    if (!optionAtual) {
      const option = document.createElement("option");
      option.value = agendamento.hora;
      option.textContent = agendamento.hora;
      select.appendChild(option);
    }
    select.value = agendamento.hora;
  };

  window.excluirAgendamento = function(data, index) {
    const agendamento = agendamentos[data][index];
    
    // Verificar se o cliente pode excluir (apenas admin)
    if (!podeEditarAgendamento(agendamento)) {
      mostrarNotificacao("Você não tem permissão para excluir este agendamento. Apenas administradores podem excluir agendamentos.", "error");
      return;
    }
    
    confirmarExclusao(
      `Tem certeza que deseja excluir o agendamento de ${agendamento.nome} às ${agendamento.hora}?`,
      async () => {
        // Se tiver servicoId, deletar na API também
        if (agendamento.servicoId) {
          const clienteLogado = getClienteLogado();
          const clienteId = clienteLogado && clienteLogado.id ? clienteLogado.id : null;
          
          try {
            const url = `${API_BASE_URL}/Servico/${agendamento.servicoId}${clienteId ? `?clienteId=${clienteId}` : ''}`;
            const response = await fetch(url, {
              method: 'DELETE'
            });
            
            if (!response.ok) {
              const errorData = await response.json().catch(() => ({}));
              throw new Error(errorData.message || 'Erro ao excluir agendamento na API');
            }
          } catch (error) {
            console.error('Erro ao excluir na API:', error);
            mostrarNotificacao('Erro ao excluir agendamento: ' + error.message, 'error');
            return;
          }
        }
        
        agendamentos[data].splice(index, 1);
        if (agendamentos[data].length === 0) {
          delete agendamentos[data];
        }
        carregarListaAgendamentos(data);
        carregarHorariosSelect(data);
        carregarHorarios(data);
        
        const timeSection = document.querySelector(".time-section");
        if (timeSection) {
          timeSection.style.display = "block";
          timeSection.style.visibility = "visible";
          timeSection.style.opacity = "1";
        }
        
        mostrarNotificacao("Agendamento excluído com sucesso!", "success");
      }
    );
  };

  function fecharPopup() {
    if (popupOverlay) {
      popupOverlay.style.display = "none";
      agendamentoEditando = null;
    }
    const timeSection = document.querySelector(".time-section");
    if (timeSection) {
      timeSection.style.display = "block";
      timeSection.style.visibility = "visible";
      timeSection.style.opacity = "1";
    }
  }

  // Event listeners do pop-up
  const popupCancelBtn = document.getElementById("popupCancel");
  const popupConfirmBtn = document.getElementById("popupConfirm");
  const popupCloseBtn = document.getElementById("popupClose");
  
  if (popupCancelBtn) {
    popupCancelBtn.addEventListener("click", fecharPopup);
  }

  if (popupCloseBtn) {
    popupCloseBtn.addEventListener("click", fecharPopup);
  }

  if (popupOverlay) {
    popupOverlay.addEventListener("click", (e) => {
      if (e.target === popupOverlay) {
        fecharPopup();
      }
    });
  }

  if (popupConfirmBtn) {
    popupConfirmBtn.addEventListener("click", async () => {
      // Todos os usuários logados podem criar agendamentos
      // Mas apenas admins podem editar agendamentos existentes
      if (agendamentoEditando) {
        const usuarioAdmin = isAdmin();
        if (!usuarioAdmin) {
          mostrarNotificacao("Apenas administradores podem editar agendamentos.", "error");
          return;
        }
      }
      
      const nomeEl = document.getElementById("nomeCliente");
      const tipoEl = document.getElementById("tipoServico");
      const placaEl = document.getElementById("placaMoto");
      const telefoneEl = document.getElementById("telefoneCliente");
      const obsEl = document.getElementById("obs");
      const horaEl = document.getElementById("popupTime");

      if (!nomeEl || !tipoEl || !placaEl || !horaEl || !dataSelecionadaPopup) {
        mostrarNotificacao("Erro ao processar formulário. Recarregue a página.", "error");
        return;
      }

      const nome = nomeEl.value.trim();
      const tipo = tipoEl.value.trim();
      const placa = placaEl.value.trim();
      const telefone = telefoneEl ? telefoneEl.value.trim() : "";
      const obs = obsEl ? obsEl.value.trim() : "";
      const hora = horaEl.value.trim();

      if (!nome || !tipo || !placa || !hora) {
        mostrarNotificacao("Preencha todos os campos obrigatórios.", "error");
        return;
      }

      // Validação de placa (formato antigo ABC-1234 ou novo ABC1D23)
      const placaValida = /^[A-Z]{3}-?\d{4}$|^[A-Z]{3}\d[A-Z]\d{2}$/i.test(placa.replace(/\s/g, ""));
      if (!placaValida) {
        mostrarNotificacao("Placa inválida. Use o formato ABC-1234 ou ABC1D23.", "error");
        return;
      }

      const data = dataSelecionadaPopup;
      const novoAgendamento = { hora, nome, tipo, placa, telefone, obs };

      // Verificar conflito de horário apenas localmente (para validação)
      if (!agendamentoEditando) {
        if (!agendamentos[data]) agendamentos[data] = [];
        
        if (agendamentos[data].some(a => a.hora === hora)) {
          mostrarNotificacao("Este horário já está ocupado! Escolha outro horário.", "error");
          return;
        }
      } else {
        const horaAntiga = agendamentos[data][agendamentoEditando.index].hora;
        if (hora !== horaAntiga) {
          if (agendamentos[data]?.some(a => a.hora === hora)) {
            mostrarNotificacao("Este horário já está ocupado! Escolha outro horário.", "error");
            return;
          }
        }
      }

      // Obter cliente logado para incluir ClienteId
      const clienteLogado = getClienteLogado();
      const clienteId = clienteLogado && clienteLogado.id ? clienteLogado.id : null;

      // Enviar para API ANTES de salvar localmente (salvamento em JSON no backend)
      if (window.enviarSolicitacaoServico && !agendamentoEditando) {
        const dadosSolicitacao = {
          cliente: nome,
          tipoServico: tipo,
          moto: '',
          placa: placa,
          telefone: telefone || null,
          data: data,
          horario: hora,
          observacoes: obs || null,
          clienteId: clienteId
        };
        
        // Enviar de forma assíncrona (não bloquear a interface)
        window.enviarSolicitacaoServico(dadosSolicitacao).then((resultado) => {
          console.log('✅ Serviço salvo na API (JSON):', resultado);
          if (window.mostrarNotificacao) {
            window.mostrarNotificacao('Serviço salvo no sistema! Aparecerá no Kanban.', 'success');
          }
        }).catch((error) => {
          console.error('❌ Erro ao salvar na API:', error);
          if (window.mostrarNotificacao) {
            window.mostrarNotificacao('Erro ao salvar no sistema: ' + error.message, 'error');
          }
        });
      }

      // Atualizar visualização local (para o calendário)
      if (agendamentoEditando) {
        // Se estiver editando, atualizar na API também
        if (agendamentoEditando.servicoId) {
          const clienteLogado = getClienteLogado();
          const clienteId = clienteLogado && clienteLogado.id ? clienteLogado.id : null;
          
          const servicoAtualizado = {
            cliente: nome,
            tipoServico: tipo,
            moto: '',
            placa: placa,
            telefone: telefone || null,
            data: data,
            horario: hora,
            observacoes: obs || null
          };
          
          const url = `${API_BASE_URL}/Servico/${agendamentoEditando.servicoId}${clienteId ? `?clienteId=${clienteId}` : ''}`;
          
          try {
            const response = await fetch(url, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(servicoAtualizado)
            });
            
            if (!response.ok) {
              const errorData = await response.json().catch(() => ({}));
              throw new Error(errorData.message || 'Erro ao atualizar agendamento');
            }
            
            console.log('✅ Agendamento atualizado na API');
            // Manter o ClienteId original
            novoAgendamento.clienteId = agendamentos[data][agendamentoEditando.index].clienteId;
            novoAgendamento.servicoId = agendamentoEditando.servicoId;
            agendamentos[data][agendamentoEditando.index] = novoAgendamento;
            mostrarNotificacao("Agendamento atualizado com sucesso!", "success");
          } catch (error) {
            console.error('❌ Erro ao atualizar na API:', error);
            mostrarNotificacao('Erro ao atualizar agendamento: ' + error.message, 'error');
            return; // Não atualizar localmente se falhar na API
          }
        } else {
          // Se não tiver servicoId, apenas atualizar localmente
          agendamentos[data][agendamentoEditando.index] = novoAgendamento;
          mostrarNotificacao("Agendamento atualizado com sucesso!", "success");
        }
      } else {
        // Adicionar ClienteId ao novo agendamento
        novoAgendamento.clienteId = clienteId || 0;
        agendamentos[data].push(novoAgendamento);
        mostrarNotificacao("Serviço agendado com sucesso!", "success");
      }

      carregarListaAgendamentos(data);
      carregarHorariosSelect(data);
      carregarHorarios(data);

      const timeSection = document.querySelector(".time-section");
      if (timeSection) {
        timeSection.style.display = "block";
        timeSection.style.visibility = "visible";
        timeSection.style.opacity = "1";
      }

      nomeEl.value = "";
      tipoEl.value = "";
      placaEl.value = "";
      if (telefoneEl) telefoneEl.value = "";
      if (obsEl) obsEl.value = "";
      horaEl.value = "";
      agendamentoEditando = null;
      document.getElementById("popupTitle").textContent = "Novo Agendamento";
    });
  }

  // Navegação de meses
  const prevMonthBtn = document.getElementById("prevMonth");
  const nextMonthBtn = document.getElementById("nextMonth");
  
  if (prevMonthBtn) {
    prevMonthBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      diaSelecionado = null;
      fecharPopup();
      mesAtual--;
      if (mesAtual < 0) {
        mesAtual = 11;
        anoAtual--;
      }
      carregarCalendario();
    });
  }

  if (nextMonthBtn) {
    nextMonthBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      diaSelecionado = null;
      fecharPopup();
      mesAtual++;
      if (mesAtual > 11) {
        mesAtual = 0;
        anoAtual++;
      }
      carregarCalendario();
    });
  }

  // Inicialização
  const timeSection = document.querySelector(".time-section");
  if (timeSection) {
    timeSection.style.display = "block";
    timeSection.style.visibility = "visible";
    timeSection.style.opacity = "1";
  }

  carregarAgendamentosDaAPI().finally(() => {
    carregarCalendario();
  });
});
