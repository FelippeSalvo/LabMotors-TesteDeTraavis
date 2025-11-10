using System;

namespace LMAPI.Models
{
    public class OrdemServico
    {
        public int Id { get; set; }
        public int ServicoId { get; set; }
        public DateTime DataEmissao { get; set; } = DateTime.Now;
        public string Status { get; set; } = "Em andamento"; // ou Completar
    }
}
