using System.ComponentModel.DataAnnotations;

namespace echolog.server.DTOs
{
    public class ProjectDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = null!;
        public string? ShortDescription { get; set; }
        public int TypeId { get; set; }
        public string Type { get; set; } = null!;
        public int StatusId { get; set; }
        public string Status { get; set; } = null!;
        public int OwnerId { get; set; }
        public string OwnerUsername { get; set; } = null!;
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public ProjectDetailDto? Detail { get; set; }
        public List<ProjectNoteDto> Notes { get; set; } = new();
        public List<ProjectFileDto> Files { get; set; } = new();
    }

    public class ProjectCreateDto
    {
        [Required]
        [StringLength(100)]
        public string Title { get; set; } = null!;

        [StringLength(500)]
        public string? ShortDescription { get; set; }

        [Required]
        public int TypeId { get; set; }

        [Required]
        public int StatusId { get; set; }
    }

    public class ProjectUpdateDto
    {
        [Required]
        [StringLength(100)]
        public string Title { get; set; } = null!;

        [StringLength(500)]
        public string? ShortDescription { get; set; }

        [Required]
        public int TypeId { get; set; }

        [Required]
        public int StatusId { get; set; }
        public int? OwnerId { get; set; }

    }
}