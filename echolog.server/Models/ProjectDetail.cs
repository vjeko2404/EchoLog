using System.ComponentModel.DataAnnotations;

namespace echolog.server.Models
{
    public class ProjectDetail
    {
        [Key]
        public int ProjectId { get; set; } // PK + FK to Project

        public string? FullDescription { get; set; }
        public string? KnownBugs { get; set; }
        public string? ArchitectureSummary { get; set; }

        public Project Project { get; set; } = null!;
    }

}
