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
    }

    //classe representando um bresk usada num traves
    public class PecaUsada
    {
        public int PecaId { get; set; }
        public int Quantidade { get; set; }
    }
}
