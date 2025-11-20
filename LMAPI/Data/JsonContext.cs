using System.Text.Json;
using System.IO;
using System;

namespace LMAPI.Data
{
    public class JsonContext<T> where T : class
    {
        private readonly string _filePath;

        public JsonContext(string filePath)
        {
            // Get the base directory of the application (where the .csproj is)
            // This ensures the Data folder is always relative to the project root
            var projectRoot = AppContext.BaseDirectory;
            // Navigate up from bin/Debug/netX.X or bin/Release/netX.X to the project root
            while (!File.Exists(Path.Combine(projectRoot, "LMAPI.csproj")) && projectRoot != null)
            {
                projectRoot = Path.GetDirectoryName(projectRoot);
            }
            
            if (projectRoot == null)
            {
                throw new InvalidOperationException("Could not find project root directory.");
            }

            _filePath = Path.Combine(projectRoot, filePath);
        }

        public List<T> Load()
        {
            if (!File.Exists(_filePath)) return new List<T>();
            var json = File.ReadAllText(_filePath);
            return string.IsNullOrWhiteSpace(json)
                ? new List<T>()
                : JsonSerializer.Deserialize<List<T>>(json) ?? new List<T>();
        }

        public void Save(List<T> data)
        {
            // Criar diretório se não existir
            var directory = Path.GetDirectoryName(_filePath);
            if (!string.IsNullOrEmpty(directory) && !Directory.Exists(directory))
            {
                Directory.CreateDirectory(directory);
            }

            var json = JsonSerializer.Serialize(data, new JsonSerializerOptions 
            { 
                WriteIndented = true 
            });
            File.WriteAllText(_filePath, json);
        }
    }
}
