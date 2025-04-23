using System.ComponentModel.DataAnnotations;

namespace echolog.server.DTOs
{
    public class AppSettingDto
    {
        public int Id { get; set; }
        public string Key { get; set; } = null!;
        public string Value { get; set; } = null!;
    }

    public class AppSettingUpdateDto
    {
        [Required]
        public string Value { get; set; } = null!;
    }
}