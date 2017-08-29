using CoreXT.Demos.Models;
using CoreXT.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;

namespace CoreXT.Models
{
    public interface ICoreXTDemoContext : ICoreXTDBContext
    {
        DbSet<Contact> Contacts { get; set; }
    }

    public interface ICoreXTDemoReadonlyContext : ICoreXTDemoContext
    {
    }
}