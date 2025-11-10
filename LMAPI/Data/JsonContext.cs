using System.Text.Json;

namespace LMAPI.Data
{
    public class JsonContext<T> where T : class
    {
        private readonly string _filePath;

        public JsonContext(string filePath)
        {
            _filePath = filePath;
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
            var json = JsonSerializer.Serialize(data, new JsonSerializerOptions { WriteIndented = true });
            File.WriteAllText(_filePath, json);
        }
    }
}
