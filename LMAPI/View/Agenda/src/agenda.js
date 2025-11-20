document.addEventListener("DOMContentLoaded", () => {
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
    
    abrirPopupDia(dataFormatada, dia);
  }

  // Carregar horários
  function carregarHorarios(dataStr) {
    timeGrid.innerHTML = "";

    horarios.forEach(h => {
      const slot = document.createElement("div");
      slot.classList.add("time-slot");
      slot.textContent = h;

      const jaAgendado = agendamentos[dataStr]?.some(a => a.hora === h);

      if (jaAgendado) {
        slot.classList.add("booked");
        const agendamento = agendamentos[dataStr].find(a => a.hora === h);
        slot.title = `${agendamento.nome} - ${agendamento.tipo}`;
      } else {
        slot.addEventListener("click", () => {
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

  function carregarListaAgendamentos(data) {
    const lista = document.getElementById("listaAgendamentos");
    lista.innerHTML = "";
    
    if (!agendamentos[data] || agendamentos[data].length === 0) {
      lista.innerHTML = '<p class="sem-agendamentos">Nenhum agendamento para este dia</p>';
      return;
    }
    
    agendamentos[data].forEach((agendamento, index) => {
      const item = document.createElement("div");
      item.classList.add("agendamento-item");
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
      lista.appendChild(item);
    });
  }

  // Funções globais para editar e excluir
  window.editarAgendamento = function(data, index) {
    const agendamento = agendamentos[data][index];
    agendamentoEditando = { data, index };
    
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
    confirmarExclusao(
      `Tem certeza que deseja excluir o agendamento de ${agendamento.nome} às ${agendamento.hora}?`,
      () => {
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
    popupConfirmBtn.addEventListener("click", () => {
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

      if (agendamentoEditando) {
        const horaAntiga = agendamentos[data][agendamentoEditando.index].hora;
        if (hora !== horaAntiga) {
          if (agendamentos[data]?.some(a => a.hora === hora)) {
            mostrarNotificacao("Este horário já está ocupado! Escolha outro horário.", "error");
            return;
          }
        }
        agendamentos[data][agendamentoEditando.index] = novoAgendamento;
        mostrarNotificacao("Agendamento atualizado com sucesso!", "success");
      } else {
        if (!agendamentos[data]) agendamentos[data] = [];
        
        if (agendamentos[data].some(a => a.hora === hora)) {
          mostrarNotificacao("Este horário já está ocupado! Escolha outro horário.", "error");
          return;
        }
        
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
  
  carregarCalendario();
});
