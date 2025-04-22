namespace echolog.server.Models
{
    public class Project
    {
        public int Id { get; set; }
        public string Title { get; set; } = null!;
        public string? ShortDescription { get; set; }
        public int TypeId { get; set; }
        public int StatusId { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }

        public ProjectDetail? Detail { get; set; }
        public List<ProjectNote> Notes { get; set; } = new();
        public List<ProjectFile> Files { get; set; } = new();
    }
}
