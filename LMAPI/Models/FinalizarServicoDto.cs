using System.Collections.Generic;

namespace LMAPI.Models
{
    public class FinalizarServicoDto
    {
        public List<PecaUsadaDto> PecasUsadas { get; set; } = new();
    }

    public class PecaUsadaDto
    {
        public int PecaId { get; set; }
        public int Quantidade { get; set; }
    }
}

