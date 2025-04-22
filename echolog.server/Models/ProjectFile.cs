namespace echolog.server.Models
{
    public class ProjectFile
    {
        public int Id { get; set; }
        public int ProjectId { get; set; }

        public required string FileName { get; set; }
        public required string FilePath { get; set; } // Can be relative, local, remote
        public string? Description { get; set; }

        public DateTime UploadedAt { get; set; } = DateTime.UtcNow;

        public Project Project { get; set; } = null!;
    }

}
