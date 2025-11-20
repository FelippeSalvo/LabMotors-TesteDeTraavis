document.addEventListener("DOMContentLoaded", () => {
  const statusBtn = document.getElementById("statusBtn");
  const statusIcon = document.getElementById("statusIcon");
  const relatorioTexto = document.getElementById("relatorioTexto");

  const servicoData = [
    {
      status: "Em Espera",
      icone: "⏳",
      comentario: "Serviço aguardando início."
    },
    {
      status: "Em Manutenção",
      icone: "🔧",
      comentario:
        "trocando filtro de ar "
    },
    {
      status: "Concluído",
      icone: "✅",
      comentario:
        "Guardei as caixas das pecas no porta malas"
    }
  ];

  let etapa = 0;

  // function atualizarTela() {
  //   const atual = servicoData[etapa];
  //   statusBtn.textContent = atual.status;
  //   statusBtn.dataset.status = atual.status; // muda a cor
  //   statusIcon.textContent = atual.icone;
  //   relatorioTexto.textContent = atual.comentario;

  //   etapa = (etapa + 1) % servicoData.length;
  // }

  // atualizarTela();
  // setInterval(atualizarTela, 8000);
});
