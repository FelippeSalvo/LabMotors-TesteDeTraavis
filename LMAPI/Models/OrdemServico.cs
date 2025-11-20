using System;

namespace LMAPI.Models
{
    public class OrdemServico
    {
        public int Id { get; set; }
        public int ServicoId { get; set; }
        public Servico? Servico { get; set; }
        public DateTime DataEmissao { get; set; } = DateTime.Now;
        public string Status { get; set; } = "Aguardando"; // Aguardando, Em Andamento, Concluído
    }
}
