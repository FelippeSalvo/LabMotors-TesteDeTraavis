using Supabase;
using System;

namespace LMAPI.Data
{
    public class SupabaseService
    {
        private readonly Client _client;
        private static bool _initialized = false;
        private static readonly object _lock = new object();

        public SupabaseService()
        {
            var url = "https://cbvoqepqxjmlvkptnzni.supabase.co";
            var key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNidm9xZXBxeGptbHZrcHRuem5pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2ODM2NDQsImV4cCI6MjA3OTI1OTY0NH0.5Bx8rBl6IAb1aXSHV082RkYsdWmm2m-gnB2pf9BXslM";
            
            var options = new SupabaseOptions
            {
                AutoConnectRealtime = false
            };

            _client = new Client(url, key, options);
            
            // Inicializar de forma assíncrona
            if (!_initialized)
            {
                lock (_lock)
                {
                    if (!_initialized)
                    {
                        try
                        {
                            _client.InitializeAsync().GetAwaiter().GetResult();
                            _initialized = true;
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine($"Erro ao inicializar Supabase: {ex.Message}");
                            // Não lançar exceção aqui, deixar para falhar nas chamadas
                        }
                    }
                }
            }
        }

        public Client Client => _client;
    }
}

