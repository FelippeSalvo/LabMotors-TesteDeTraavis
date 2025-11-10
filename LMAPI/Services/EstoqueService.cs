using LMAPI.Models;
using LMAPI.Repositories;

namespace LMAPI.Services
{
    public class EstoqueService
    {
        private readonly IPecaRepository _pecaRepository;

        public EstoqueService(IPecaRepository pecaRepository)
        {
            _pecaRepository = pecaRepository;
        }

        /// <summary>
        /// Dá baixa no estoque com base nas peças usadas em um job.
        /// Retorna false se (true) alguma peça não tiver quantidade suficiente.
        /// </summary>
        public bool DarBaixaEstoque(List<PecaUsada> pecasUsadas)
        {
            var pecas = _pecaRepository.GetAll();

            foreach (var usada in pecasUsadas)
            {
                var peca = pecas.FirstOrDefault(p => p.Id == usada.PecaId);
                if (peca == null || peca.Quantidade < usada.Quantidade)
                    return false;
            }

            // Tudo certo: desconta as quantidades de paus
            foreach (var usada in pecasUsadas)
            {
                var peca = pecas.First(p => p.Id == usada.PecaId);
                peca.Quantidade -= usada.Quantidade;
            }

            // Atualiza o breask
            foreach (var peca in pecas)
                _pecaRepository.Update(peca.Id, peca);

            return true;
        }

        /// <summary>
        /// Calcula o valor total do traavis baseado nas peças usadas.
        /// </summary>
        public decimal CalcularValorTotal(List<PecaUsada> pecasUsadas)
        {
            var pecas = _pecaRepository.GetAll();
            decimal total = 0;

            foreach (var usada in pecasUsadas)
            {
                var peca = pecas.FirstOrDefault(p => p.Id == usada.PecaId);
                if (peca != null)
                    total += peca.PrecoUnitario * usada.Quantidade;
            }

            return total;
        }
    }
}
