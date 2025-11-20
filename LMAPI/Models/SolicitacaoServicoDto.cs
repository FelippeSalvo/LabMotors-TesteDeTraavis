using System;

namespace LMAPI.Models
{
    public class SolicitacaoServicoDto
    {
        public string Cliente { get; set; } = string.Empty;
        public string TipoServico { get; set; } = string.Empty;
        public string Moto { get; set; } = string.Empty;
        public string Placa { get; set; } = string.Empty;
        public string? Telefone { get; set; }
        public DateTime Data { get; set; }
        public string Horario { get; set; } = string.Empty;
        public string? Observacoes { get; set; }
    }
}

