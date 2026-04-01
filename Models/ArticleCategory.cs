using System;
using System.Collections.Generic;

namespace HotelManagement.API.Models;

public partial class ArticleCategory
{
    public int Id { get; set; }

    public string Name { get; set; } = null!;

    public bool? IsActive { get; set; }

    public virtual ICollection<Article> Articles { get; set; } = new List<Article>();
}
