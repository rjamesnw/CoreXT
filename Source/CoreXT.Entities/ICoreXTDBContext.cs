using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using System;

namespace CoreXT.Entities
{
    public interface ICoreXTDBContext : IDisposable
    {
        bool IsReadonly { get; }

        DatabaseFacade Database { get; }

        /// <summary>
        /// Attempts to get or set the connection string for the underlying 'Database' object instance.
        /// Note that this may not be reliable, and seems to be provider implementation dependent.
        /// </summary>
        /// <returns></returns>
        string ConnectionString { get; set; }

        /// <summary>
        /// Called when the DBContext is being configured.
        /// </summary>
        event Action<DbContextOptionsBuilder> Configuring;

        int ForceSaveChanges();
        int SaveChanges();
    }

    public interface ICoreXTReadonlyDBContext : ICoreXTDBContext
    {
    }
}