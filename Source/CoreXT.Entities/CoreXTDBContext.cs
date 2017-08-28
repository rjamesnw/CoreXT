using CoreXT.Entities;
using CoreXT.Services.DI;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.ComponentModel.DataAnnotations.Schema;
using System.IO;
using System.Reflection;

namespace CoreXT.Entities
{
    // ########################################################################################################################

    /// <summary>
    /// The CoreXT database context object.
    /// </summary>
    public partial class CoreXTDBContext : DbContext, ICoreXTDBContext
    {
        // --------------------------------------------------------------------------------------------------------------------

        public virtual bool IsReadonly { get { return false; } }

        ILogger _LogService;

        // --------------------------------------------------------------------------------------------------------------------

        public CoreXTDBContext(DbContextOptions options, ILoggerFactory loggerFactory) : base(options)
        {
            _LogService = loggerFactory?.CreateLogger<CoreXTDBContext>();
        }

        public CoreXTDBContext(DbContextOptions options) : base(options)
        {
        }

        public CoreXTDBContext(ILoggerFactory loggerFactory)
        {
            _LogService = loggerFactory?.CreateLogger<CoreXTDBContext>();
        }

        public CoreXTDBContext()
        {
        }

        // --------------------------------------------------------------------------------------------------------------------

        public ICoreXTDBContext SetConnectionString(string connectionString)
        {
            Database.GetDbConnection().ConnectionString = connectionString;
            return this;
        }

        // --------------------------------------------------------------------------------------------------------------------

        public string ValidateMaxColumnNameLength(ModelBuilder modelBuilder, int maxLength)
        {
            foreach (var entityType in modelBuilder.Model.GetEntityTypes())
            {
                // ... make sure tables names are updated properly ...

                var dbInfo = entityType.Relational();

                var attr = entityType.ClrType.GetTypeInfo().GetCustomAttribute<TableAttribute>();
                if (attr != null && !string.IsNullOrWhiteSpace(attr.Name)) dbInfo.TableName = attr.Name;

                foreach (var property in entityType.GetProperties())
                {
                    var columnName = property.FieldInfo.Name; //? .SqlServer().ColumnName;
                    if (columnName.Length > maxLength)
                        return "Column name '" + columnName + "' is greater than " + maxLength + " characters.";
                }
            }
            return null;
        }

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary>
        /// Saves all changes made in this context to the underlying database.
        /// </summary>
        /// <returns>The number of state entries written to the underlying database. This can include
        /// state entries for entities and/or relationships. Relationship state entries are
        /// created for many-to-many relationships and relationships where there is no foreign
        /// key property included in the entity class (often referred to as independent associations).</returns>
        public override int SaveChanges()
        {
            try
            {
                if (IsReadonly)
                    throw new InvalidOperationException("This context is readonly. Use 'CDSContext.GetContext()' to get a read/write context.");
                return base.SaveChanges();
            }
            catch (Exception ex)
            {
                _LogService?.LogError(new EventId(-1, "CoreXT.Entities"), ex, null);
                throw;
            }
        }

        /// <summary>
        /// Ignores "Read Only" mode and saves any changes made in this context to the underlying database.
        /// <para>The only time it is safe to do this is if there is a global entity collection (like settings) being shared.</para>
        /// </summary>
        /// <returns>The number of state entries written to the underlying database. This can include
        /// state entries for entities and/or relationships. Relationship state entries are
        /// created for many-to-many relationships and relationships where there is no foreign
        /// key property included in the entity class (often referred to as independent associations).</returns>
        public int ForceSaveChanges()
        {
            try
            {
                return base.SaveChanges();
            }
            catch (Exception ex)
            {
                _LogService?.LogError(new EventId(-1, "CoreXT.Entities"), ex, null);
                throw;
            }
        }

        // --------------------------------------------------------------------------------------------------------------------
    }

    /// <summary>
    /// Provides a CoreXT DBContext implementation that is scoped to a request duration. This allows all methods during a single
    /// request to use a "cached" version, greatly reducing database hits.
    /// <para>Note: Saving is disabled on this context. For read/write ability, get a transient instance of the 'CoreXTDBContext' type.</para>
    /// </summary>
    public class CoreXTReadonlyDBContext : CoreXTDBContext, ICoreXTReadonlyDBContext
    {
        public override bool IsReadonly { get { return true; } }

        public CoreXTReadonlyDBContext(DbContextOptions<CoreXTReadonlyDBContext> options, ILoggerFactory loggerFactory) : base(options, loggerFactory)
        {
        }
    }

    // ########################################################################################################################
}
