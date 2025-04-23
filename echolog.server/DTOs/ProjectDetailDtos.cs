namespace echolog.server.DTOs
{
    // For GET responses
    public class ProjectDetailResponseDto
    {
        public int ProjectId { get; set; }
        public string? FullDescription { get; set; }
        public string? KnownBugs { get; set; }
        public string? ArchitectureSummary { get; set; }
    }

    // For POST requests (creating new details)
    public class ProjectDetailCreateDto
    {
        public int ProjectId { get; set; }
        public string? FullDescription { get; set; }
        public string? KnownBugs { get; set; }
        public string? ArchitectureSummary { get; set; }
    }

    // For PUT requests (updating details)
    public class ProjectDetailUpdateDto
    {
        public string? FullDescription { get; set; }
        public string? KnownBugs { get; set; }
        public string? ArchitectureSummary { get; set; }
    }

    public class ProjectDetailDto
    {
        public int ProjectId { get; set; }
        public string? FullDescription { get; set; }
        public string? KnownBugs { get; set; }
        public string? ArchitectureSummary { get; set; }
    }
}