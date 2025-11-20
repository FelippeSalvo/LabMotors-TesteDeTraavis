using Microsoft.AspNetCore.Mvc;
using LMAPI.Models;
using LMAPI.Repositories;
using LMAPI.Services;

namespace LMAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ServicoController : ControllerBase
    {
        private readonly IServicoRepository _servicoRepo;
        private readonly IOrdemServicoRepository _ordemServicoRepo;
        private readonly EstoqueService _estoqueService;

        public ServicoController(IServicoRepository servicoRepo, IOrdemServicoRepository ordemServicoRepo, EstoqueService estoqueService)
        {
            _servicoRepo = servicoRepo;
            _ordemServicoRepo = ordemServicoRepo;
            _estoqueService = estoqueService;
        }

        [HttpGet]
        public IActionResult GetAll() => Ok(_servicoRepo.GetAll());

        [HttpGet("{id}")]
        public IActionResult GetById(int id)
        {
            var servico = _servicoRepo.GetById(id);
            return servico == null ? NotFound() : Ok(servico);
        }

        [HttpPost]
        public IActionResult Create(Servico servico)
        {
            // Calcula o valor total do traves
            servico.ValorTotal = _estoqueService.CalcularValorTotal(servico.PecasUsadas);

            // Dá baixa automática no breask
            var sucesso = _estoqueService.DarBaixaEstoque(servico.PecasUsadas);
            if (!sucesso)
                return BadRequest("Erro: peças insuficientes no estoque.");

            _servicoRepo.Add(servico);

            // Criar OrdemServico automaticamente se o serviço tiver dados de agendamento
            if (!string.IsNullOrEmpty(servico.Placa) || !string.IsNullOrEmpty(servico.Cliente))
            {
                var ordemServico = new OrdemServico
                {
                    ServicoId = servico.Id,
                    Status = "Aguardando"
                };
                _ordemServicoRepo.Add(ordemServico);
            }

            return CreatedAtAction(nameof(GetById), new { id = servico.Id }, servico);
        }

        [HttpPost("solicitar")]
        public IActionResult SolicitarServico([FromBody] SolicitacaoServicoDto solicitacao)
        {
            try
            {
                // Validar se já existe serviço no mesmo horário/data
                var servicosExistentes = _servicoRepo.GetAll();
                var conflito = servicosExistentes.FirstOrDefault(s => 
                    s.Data.HasValue && 
                    s.Data.Value.Date == solicitacao.Data.Date &&
                    !string.IsNullOrEmpty(s.Horario) &&
                    s.Horario.Trim() == solicitacao.Horario.Trim());

                if (conflito != null)
                {
                    return Conflict(new { 
                        message = $"Este horário ({solicitacao.Horario}) já está ocupado para a data {solicitacao.Data:dd/MM/yyyy}. Por favor, escolha outro horário.",
                        conflictData = new { 
                            data = conflito.Data,
                            horario = conflito.Horario,
                            cliente = conflito.Cliente
                        }
                    });
                }

                // Criar Servico a partir da solicitação
                var servico = new Servico
                {
                    Descricao = solicitacao.TipoServico,
                    Cliente = solicitacao.Cliente,
                    TipoServico = solicitacao.TipoServico,
                    Moto = solicitacao.Moto,
                    Placa = solicitacao.Placa,
                    Telefone = solicitacao.Telefone,
                    Data = solicitacao.Data,
                    Horario = solicitacao.Horario,
                    Observacoes = solicitacao.Observacoes,
                    ClienteId = 0, // Pode ser ajustado depois
                    ValorTotal = 0,
                    PecasUsadas = new List<PecaUsada>()
                };

                _servicoRepo.Add(servico);

                // Criar OrdemServico automaticamente
                var ordemServico = new OrdemServico
                {
                    ServicoId = servico.Id,
                    Status = "Aguardando"
                };
                _ordemServicoRepo.Add(ordemServico);

                return CreatedAtAction(nameof(GetById), new { id = servico.Id }, new { servico, ordemServico });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = $"Erro ao criar serviço: {ex.Message}", exception = ex.ToString() });
            }
        }

        [HttpPut("{id}")]
        public IActionResult Update(int id, Servico servico)
        {
            var updated = _servicoRepo.Update(id, servico);
            return updated ? NoContent() : NotFound();
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            var deleted = _servicoRepo.Delete(id);
            return deleted ? NoContent() : NotFound();
        }
    }
}
