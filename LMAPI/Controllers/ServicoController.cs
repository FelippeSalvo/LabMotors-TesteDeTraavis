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
        private readonly EstoqueService _estoqueService;

        public ServicoController(IServicoRepository servicoRepo, EstoqueService estoqueService)
        {
            _servicoRepo = servicoRepo;
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
            return CreatedAtAction(nameof(GetById), new { id = servico.Id }, servico);
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
