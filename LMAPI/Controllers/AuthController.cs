using Microsoft.AspNetCore.Mvc;
using LMAPI.Models;
using LMAPI.Repositories;
using System;

namespace LMAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IClienteRepository _clienteRepository;

        public AuthController(IClienteRepository clienteRepository)
        {
            _clienteRepository = clienteRepository;
        }

        [HttpPost("register")]
        public IActionResult Register([FromBody] RegisterRequest request)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(request.Nome) ||
                    string.IsNullOrWhiteSpace(request.Email) ||
                    string.IsNullOrWhiteSpace(request.Telefone) ||
                    string.IsNullOrWhiteSpace(request.Senha) ||
                    string.IsNullOrWhiteSpace(request.Endereco))
                {
                    return BadRequest(new AuthResponse
                    {
                        Success = false,
                        Message = "Todos os campos são obrigatórios."
                    });
                }

                if (request.Senha.Length < 6)
                {
                    return BadRequest(new AuthResponse
                    {
                        Success = false,
                        Message = "A senha deve ter no mínimo 6 caracteres."
                    });
                }

                // Verificar se o email já existe
                var clientes = _clienteRepository.GetAll();
                if (clientes.Any(c => c.Email.Equals(request.Email, StringComparison.OrdinalIgnoreCase)))
                {
                    return Conflict(new AuthResponse
                    {
                        Success = false,
                        Message = "Este email já está cadastrado."
                    });
                }

                // Criar novo cliente
                var novoCliente = new Cliente
                {
                    Nome = request.Nome,
                    Email = request.Email,
                    Telefone = request.Telefone,
                    Senha = request.Senha, // Em produção, usar hash da senha
                    Endereco = request.Endereco,
                    Admin = false
                };

                _clienteRepository.Add(novoCliente);

                // Retornar cliente sem a senha
                var clienteResponse = new Cliente
                {
                    Id = novoCliente.Id,
                    Nome = novoCliente.Nome,
                    Email = novoCliente.Email,
                    Telefone = novoCliente.Telefone,
                    Endereco = novoCliente.Endereco,
                    Admin = novoCliente.Admin
                };

                return Ok(new AuthResponse
                {
                    Success = true,
                    Message = "Cadastro realizado com sucesso!",
                    Cliente = clienteResponse
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new AuthResponse
                {
                    Success = false,
                    Message = $"Erro ao cadastrar: {ex.Message}. Verifique se as tabelas foram criadas no Supabase."
                });
            }
        }

        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginRequest request)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Senha))
                {
                    return BadRequest(new AuthResponse
                    {
                        Success = false,
                        Message = "Email e senha são obrigatórios."
                    });
                }

                var clientes = _clienteRepository.GetAll();
                var cliente = clientes.FirstOrDefault(c => 
                    c.Email.Equals(request.Email, StringComparison.OrdinalIgnoreCase) && 
                    c.Senha == request.Senha);

                if (cliente == null)
                {
                    return Unauthorized(new AuthResponse
                    {
                        Success = false,
                        Message = "Email ou senha incorretos."
                    });
                }

                // Retornar cliente sem a senha
                var clienteResponse = new Cliente
                {
                    Id = cliente.Id,
                    Nome = cliente.Nome,
                    Email = cliente.Email,
                    Telefone = cliente.Telefone,
                    Endereco = cliente.Endereco,
                    Admin = cliente.Admin
                };

                return Ok(new AuthResponse
                {
                    Success = true,
                    Message = "Login realizado com sucesso!",
                    Cliente = clienteResponse
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new AuthResponse
                {
                    Success = false,
                    Message = $"Erro ao fazer login: {ex.Message}. Verifique se as tabelas foram criadas no Supabase."
                });
            }
        }
    }
}

