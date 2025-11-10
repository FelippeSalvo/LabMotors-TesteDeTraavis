namespace LMAPI.Models
{
    public class Peca
    {
        public int Id { get; set; }
        public string Nome { get; set; } = string.Empty;
        public string Codigo { get; set; } = string.Empty;
        public int Quantidade { get; set; }
        public decimal PrecoUnitario { get; set; }
    }
}
