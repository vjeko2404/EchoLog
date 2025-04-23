namespace echolog.server.DTOs
{
    public class ProjectTypeDto
    {
        public int Id { get; set; }
        public string Value { get; set; } = null!;
    }

    public class ProjectTypeCreateDto
    {
        public string Value { get; set; } = null!;
    }

    public class ProjectTypeUpdateDto
    {
        public string Value { get; set; } = null!;
    }
}