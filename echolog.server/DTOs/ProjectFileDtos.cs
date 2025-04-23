namespace echolog.server.DTOs
{
    public class ProjectFileDto
    {
        public int Id { get; set; }
        public int ProjectId { get; set; }
        public string FileName { get; set; } = null!;
        public string FilePath { get; set; } = null!;
        public string? Description { get; set; }
        public DateTime UploadedAt { get; set; }
        public int? CategoryId { get; set; }
        public string? CategoryName { get; set; }
    }

    public class ProjectFileCreateDto
    {
        public int ProjectId { get; set; }
        public string FileName { get; set; } = null!;
        public string FilePath { get; set; } = null!;
        public string? Description { get; set; }
        public int? CategoryId { get; set; }
    }

    public class ProjectFileUpdateDto
    {
        public string FileName { get; set; } = null!;
        public string FilePath { get; set; } = null!;
        public string? Description { get; set; }
        public int? CategoryId { get; set; }
    }
}