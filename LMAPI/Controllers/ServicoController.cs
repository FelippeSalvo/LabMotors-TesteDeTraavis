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
        private readonly IClienteRepository _clienteRepository;

        public ServicoController(IServicoRepository servicoRepo, IOrdemServicoRepository ordemServicoRepo, EstoqueService estoqueService, IClienteRepository clienteRepository)
        {
            _servicoRepo = servicoRepo;
            _ordemServicoRepo = ordemServicoRepo;
            _estoqueService = estoqueService;
            _clienteRepository = clienteRepository;
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
                    ClienteId = solicitacao.ClienteId ?? 0, // ID do cliente logado que criou o agendamento
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
        public IActionResult Update(int id, [FromBody] Servico servico, [FromQuery] int? clienteId = null)
        {
            // Buscar o serviço existente para verificar o dono
            var servicoExistente = _servicoRepo.GetById(id);
            if (servicoExistente == null)
            {
                return NotFound(new { message = "Serviço não encontrado." });
            }

            // Validar permissão de edição
            if (servicoExistente.ClienteId > 0 && clienteId.HasValue && clienteId.Value > 0)
            {
                // Verificar se é o dono do agendamento
                bool isOwner = servicoExistente.ClienteId == clienteId.Value;
                
                // Se não for o dono, verificar se é admin
                if (!isOwner)
                {
                    var cliente = _clienteRepository.GetById(clienteId.Value);
                    if (cliente == null || !cliente.Admin)
                    {
                        return StatusCode(403, new { message = "Você não tem permissão para editar este agendamento. Apenas o cliente que criou o agendamento ou um administrador pode editá-lo." });
                    }
                }
            }

            // Atualizar mantendo o ClienteId original
            servico.ClienteId = servicoExistente.ClienteId;
            var updated = _servicoRepo.Update(id, servico);
            return updated ? NoContent() : NotFound();
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(int id, [FromQuery] int? clienteId = null)
        {
            // Buscar o serviço existente para verificar o dono
            var servicoExistente = _servicoRepo.GetById(id);
            if (servicoExistente == null)
            {
                return NotFound(new { message = "Serviço não encontrado." });
            }

            // Validar permissão de exclusão
            if (servicoExistente.ClienteId > 0 && clienteId.HasValue && clienteId.Value > 0)
            {
                // Verificar se é o dono do agendamento
                bool isOwner = servicoExistente.ClienteId == clienteId.Value;
                
                // Se não for o dono, verificar se é admin
                if (!isOwner)
                {
                    var cliente = _clienteRepository.GetById(clienteId.Value);
                    if (cliente == null || !cliente.Admin)
                    {
                        return StatusCode(403, new { message = "Você não tem permissão para excluir este agendamento. Apenas o cliente que criou o agendamento ou um administrador pode excluí-lo." });
                    }
                }
            }

            var deleted = _servicoRepo.Delete(id);
            return deleted ? NoContent() : NotFound();
        }
    }
}
