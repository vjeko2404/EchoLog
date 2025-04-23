using System.ComponentModel.DataAnnotations;

namespace echolog.server.DTOs
{
    public class ProjectNoteDto
    {
        public int Id { get; set; }
        public int ProjectId { get; set; }
        public string? NoteText { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class ProjectNoteCreateDto
    {
        [Required]
        public int ProjectId { get; set; }
        public string? NoteText { get; set; }
    }

    public class ProjectNoteUpdateDto
    {
        public string? NoteText { get; set; }
    }
}