using System.ComponentModel.DataAnnotations;

namespace echolog.server.DTOs
{
    public class ProjectFileCategoryDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
    }

    public class ProjectFileCategoryCreateDto
    {
        [Required]
        [StringLength(100)]
        public string Name { get; set; } = null!;
    }

    public class ProjectFileCategoryUpdateDto
    {
        [Required]
        [StringLength(100)]
        public string Name { get; set; } = null!;
    }
}
