using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using System;

namespace CoreXT.Entities
{
    public interface ICoreXTDBContext : IDisposable
    {
        bool IsReadonly { get; }

        DatabaseFacade Database { get; }

        ICoreXTDBContext SetConnectionString(string connectionString);

        int ForceSaveChanges();
        int SaveChanges();
    }

    public interface ICoreXTReadonlyDBContext : ICoreXTDBContext
    {
    }
}