namespace LMAPI.Models
{
    public class AuthResponse
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public Cliente? Cliente { get; set; }
    }
}

