using System.Collections.Generic;

namespace LMAPI.Models
{
    public class Servico
    {
        public int Id { get; set; }
        public string Descricao { get; set; } = string.Empty;
        public int ClienteId { get; set; }
        public decimal ValorTotal { get; set; }

        // Peças utilizadas neste traves
        public List<PecaUsada> PecasUsadas { get; set; } = new();

        // Campos para agendamento/solicitação
        public string? Cliente { get; set; }
        public string? TipoServico { get; set; }
        public string? Moto { get; set; }
        public string? Placa { get; set; }
        public string? Telefone { get; set; }
        public DateTime? Data { get; set; }
        public string? Horario { get; set; }
        public string? Observacoes { get; set; }
    }

    //classe representando um bresk usada num traves
    public class PecaUsada
    {
        public int PecaId { get; set; }
        public int Quantidade { get; set; }
    }
}
