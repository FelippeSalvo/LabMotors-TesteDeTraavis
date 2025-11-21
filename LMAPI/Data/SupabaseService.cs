using Supabase;
using System;

namespace LMAPI.Data
{
    public class SupabaseService
    {
        private readonly Client _clienteBanco;
        private static bool _jaInicializado = false;
        private static readonly object _bloqueioInicializacao = new object();

        public SupabaseService()
        {
            var urlBanco = "https://cbvoqepqxjmlvkptnzni.supabase.co";
            var chaveApi = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNidm9xZXBxeGptbHZrcHRuem5pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2ODM2NDQsImV4cCI6MjA3OTI1OTY0NH0.5Bx8rBl6IAb1aXSHV082RkYsdWmm2m-gnB2pf9BXslM";
            
            var opcoesConexao = new SupabaseOptions
            {
                AutoConnectRealtime = false
            };

            _clienteBanco = new Client(urlBanco, chaveApi, opcoesConexao);
            
            // Inicializar de forma assíncrona (apenas uma vez)
            if (!_jaInicializado)
            {
                lock (_bloqueioInicializacao)
                {
                    if (!_jaInicializado)
                    {
                        try
                        {
                            _clienteBanco.InitializeAsync().GetAwaiter().GetResult();
                            _jaInicializado = true;
                        }
                        catch (Exception erro)
                        {
                            Console.WriteLine($"Erro ao inicializar Supabase: {erro.Message}");
                            // Não lançar exceção aqui, deixar para falhar nas chamadas
                        }
                    }
                }
            }
        }

        public Client Client => _clienteBanco;
    }
}

