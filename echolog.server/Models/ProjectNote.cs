namespace echolog.server.Models
{
    public class ProjectNote
    {
        public int Id { get; set; }
        public int ProjectId { get; set; }

        public string? NoteText { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public Project Project { get; set; } = null!;
    }

}
