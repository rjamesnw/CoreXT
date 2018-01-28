using CoreXT.Services.DI;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.Extensions.Logging;
using System;
using System.Collections;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Text.RegularExpressions;
using System.Threading;

namespace CoreXT.Entities
{
    // ========================================================================================================================

    /// <summary>
    /// The CoreXT context provider provides one place to construct entity database contexts on the fly.  
    /// <para>NOTE: Derived context providers should be registered as "Scoped" so that a new instance is created on each request.</para>
    /// </summary>
    /// <typeparam name="TContext">A CoreXTDBContext type that should be registered as "Transient" in order to create a new instance on each request.</typeparam>
    /// <typeparam name="TReadonlyContext">A CoreXTDBContext that should be registered as "Transient" in order to create a new instance on each request.</typeparam>
    public class ContextProvider<TContext, TReadonlyContext> : IContextProvider<TContext, TReadonlyContext>
          where TContext : class, ICoreXTDBContext
        where TReadonlyContext : class, ICoreXTDBContext
    {
        ICoreXTServiceProvider _ServiceProvider;
        HttpContext _HttpContext;

        List<ICoreXTDBContext> _Contexts = new List<ICoreXTDBContext>(); // (only pre-HTTP-request scoped contexts are stored here)

        AsyncLocal<int> _PerAsycControlFlowContexts = new AsyncLocal<int>();
        AsyncLocal<int> _PerAsycControlFlowReadonlyContexts = new AsyncLocal<int>();

        /// <summary>
        /// Returns true while HttpContext is available.
        /// </summary>
        public bool IsInRequestScope => _HttpContext != null;

        public ContextProvider(ICoreXTServiceProvider sp)
        {
            _ServiceProvider = sp;
            _HttpContext = _ServiceProvider.GetService<IHttpContextAccessor>().HttpContext; // (*** this is null if there is no current context, such as being called before and after a request ***)
        }

        public virtual void Dispose()
        {
            lock (_Contexts)
            {
                foreach (var db in _Contexts)
                    try
                    {
                        ((DbContext)db)?.Dispose();
                    }
                    catch (ObjectDisposedException) { }
                _Contexts.Clear();
            }
        }

        private T _GetContext<T>(AsyncLocal<int> asyncLocal) where T : class, ICoreXTDBContext
        {
            lock (_Contexts)
            {
                var contextIndex = asyncLocal.Value - 1; // (since AsyncLocal defaults to 0, treat that as -1 [unset index])
                if (contextIndex < 0)
                {
                    contextIndex = _Contexts.Count;
                    asyncLocal.Value = 1 + contextIndex;
                    _Contexts.Add(null);
                }
                var ctx = _Contexts[contextIndex];
                if (ctx != null)
                    try
                    {
                        // ... test if it was disposed ...
                        var test = ctx.ConnectionString;
                    }
                    catch (ObjectDisposedException)
                    {
                        // ... was disposed (normally the user should not be disposing these), so we need a new one ...
                        ctx = null;
                    }
                if (ctx == null)
                    _Contexts[contextIndex] = ctx = _ServiceProvider.GetService<T>();
                return (T)ctx;
            }
        }

        /// <summary>
        /// Returns a read-write context for the current HTTP request.
        /// </summary>
        /// <param name="createNew">If true, a new instance is returned and not the per-request cached instance. Default is false.</param>
        public virtual TContext GetContext(bool createNew = false)
        {
            if (createNew || !IsInRequestScope)
                return _ServiceProvider.GetService<TContext>();
            else
            {
                var ctx = _GetContext<TContext>(_PerAsycControlFlowContexts);
                return ctx;
            }
        }

        /// <summary>
        /// Returns a read-only context for the current HTTP request in order to protect modifying any data. It's a good place to cache lookup data that
        /// should not be modified, or data which might be "sanitized" before sending it to the client, without worrying about it getting saved.
        /// If querying AND updating is required, use 'GetContext()' instead.
        /// </summary>
        /// <param name="createNew">If true, a new instance is returned and not the per-request cached instance. Default is false.</param>
        public virtual TReadonlyContext GetReadonlyContext(bool createNew = false)
        {
            if (createNew || !IsInRequestScope)
                return _ServiceProvider.GetService<TReadonlyContext>();
            else
            {
                var ctx = _GetContext<TReadonlyContext>(_PerAsycControlFlowContexts);
                return ctx;
            }
        }

        ICoreXTDBContext IContextProvider.GetContext(bool createNew)
        {
            return GetContext(createNew);
        }

        ICoreXTDBContext IContextProvider.GetReadonlyContext(bool createNew)
        {
            return GetReadonlyContext(createNew);
        }
    }

    /// <summary>
    /// The CoreXT context provider provides one place to construct entity database contexts on the fly.  
    /// <para>NOTE: Derived context providers should be registered as "Scoped" so that a new instance is created on each request.</para>
    /// </summary>
    /// <typeparam name="TContext">A CoreXTDBContext type that should be registered as "Transient" in order to create a new instance on each request.</typeparam>
    /// <typeparam name="TReadonlyContext">A CoreXTDBContext that should be registered as "Transient" in order to create a new instance on each request.</typeparam>
    public interface IContextProvider<TContext, TReadonlyContext> : IContextProvider
        where TContext : class, ICoreXTDBContext
        where TReadonlyContext : class, ICoreXTDBContext
    {
        /// <summary>
        /// Returns a read-write context for the current HTTP request.
        /// </summary>
        /// <param name="createNew">If true, a new instance is returned and not the per-request cached instance. Default is false.</param>
        new TContext GetContext(bool createNew = false);

        /// <summary>
        /// Returns a read-only context for the current HTTP request in order to protect modifying any data. It's a good place to cache lookup data that
        /// should not be modified, or data which might be "sanitized" before sending it to the client, without worrying about it getting saved.
        /// If querying AND updating is required, use 'GetContext()' instead.
        /// </summary>
        /// <param name="createNew">If true, a new instance is returned and not the per-request cached instance. Default is false.</param>
        new TReadonlyContext GetReadonlyContext(bool createNew = false);
    }

    /// <summary>
    /// The CoreXT context provider provides one place to construct entity database contexts on the fly.  
    /// <para>NOTE: Derived context providers should be registered as "Scoped" so that a new instance is created on each request.</para>
    /// </summary>
    public interface IContextProvider : IDisposable
    {
        /// <summary>
        /// Returns a read-write context for the current HTTP request.
        /// </summary>
        /// <param name="createNew">If true, a new instance is returned and not the per-request cached instance. Default is false.</param>
        ICoreXTDBContext GetContext(bool createNew = false);

        /// <summary>
        /// Returns a read-only context for the current HTTP request in order to protect modifying any data. It's a good place to cache lookup data that
        /// should not be modified, or data which might be "sanitized" before sending it to the client, without worrying about it getting saved.
        /// If querying AND updating is required, use 'GetContext()' instead.
        /// </summary>
        /// <param name="createNew">If true, a new instance is returned and not the per-request cached instance. Default is false.</param>
        ICoreXTDBContext GetReadonlyContext(bool createNew = false);
    }

    // ########################################################################################################################

    public static class CoreXTDBContextExtensions
    {
        // --------------------------------------------------------------------------------------------------------------------

        /// <summary>
        /// A fix that checks for the 'Table' attribute on a class. If not found, the class name is assumed.
        /// </summary>
        /// <param name="entityType">The entity type to check for a table attribute.</param>
        /// <param name="useTypeNamesAsIs">If false (default) the type names are parsed such that underscores precede uppercase letters, and the whole name is made lowercase and pluralized.
        /// If true, the types names are used as is with full casing intact.</param>
        public static EntityTypeBuilder ToTable(this EntityTypeBuilder _this, Type entityType, bool useTypeNamesAsIs = false)
        {
            var typeInfo = entityType.GetTypeInfo();
            var attr = typeInfo.GetCustomAttribute<TableAttribute>();
            string name;
            if (attr != null)
                name = attr.Name;
            else
            {
                // ... build table name from entity type name ...
                name = useTypeNamesAsIs ? typeInfo.Name : PropertizeTableName(typeInfo.Name);
            }
            return _this.ToTable(name);
        }

        /// <summary>
        /// A fix that checks for the 'Table' attribute on a class. If not found, the class name is assumed.
        /// </summary>
        /// <param name="useTypeNamesAsIs">If false (default) the type names are parsed such that underscores precede uppercase letters, and the whole name is made lowercase and pluralized.
        /// If true, the types names are used as is with full casing intact.</param>
        public static EntityTypeBuilder<TEntity> ToTable<TEntity>(this EntityTypeBuilder<TEntity> _this, bool useTypeNamesAsIs = false) where TEntity : class
        {
            _this.ToTable(typeof(TEntity), useTypeNamesAsIs);
            return _this;
        }

        // --------------------------------------------------------------------------------------------------------------------

        public static string PropertizeTableName(string name)
        {
            name = Regex.Replace(name, @"([a-zA-Z])(?=[A-Z])", "$1_").ToLower();
            if (name.EndsWith("y")) name = name.Substring(0, name.Length - 1) + "ies";
            else if (!name.EndsWith("ings") && !name.EndsWith("es") && name.EndsWith("s")) name = name.Substring(0, name.Length - 1) + "es";
            else if (!name.EndsWith("s")) name += "s";
            return name;
        }

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary>
        /// Dynamically configures a CoreXT based DBContext object, and optionally tests that a connection can be made using the given connection string.
        /// </summary>
        /// <typeparam name="TContextProvider">The type of provider to use to get the DBContext instances.</typeparam>
        /// <param name="sp">The CoreXT service provider.</param>
        /// <param name="isReadonly">True of the context should be read-only.</param>
        /// <param name="onConfiguring">An function expression to execute if a new context is created (in order to setup the context, such as setting a connection string).</param>
        /// <param name="commandTimeout">The number of seconds to wait before a command executed against the context times out. If not specified the system default is used, or whatever is specified via the connection string.</param>
        /// <param name="createNew">If true, a new instance is returned and not the per-request cached instance. Default is false.</param>
        /// <param name="testConnectingBeforeReturning">If true (default) calls 'ExecuteSqlCommand()' on the context to make sure the connection is valid.</param>
        /// <returns></returns>
        public static ICoreXTDBContext ConfigureCoreXTDBContext<TContextProvider>(this ICoreXTServiceProvider sp, bool isReadonly, Action<DbContextOptionsBuilder> onConfiguring = null, int? commandTimeout = null, bool createNew = false, bool testConnectingBeforeReturning = true)
            where TContextProvider : class, IContextProvider
        {
            var contextProvider = sp.GetService<TContextProvider>();
            var context = isReadonly ? contextProvider.GetReadonlyContext(createNew) : contextProvider.GetContext(createNew);

            if (context == null)
                throw new InvalidOperationException("There is no " + typeof(TContextProvider).Name + " service object registered.");

            if (context.Database == null)
                throw new InvalidOperationException("The 'Database' property is null for DBContext type " + typeof(TContextProvider).Name + ".");

            if (commandTimeout != null)
                context.Database.SetCommandTimeout(TimeSpan.FromSeconds(commandTimeout.Value));

            var logger = sp.GetService<ILoggerFactory>()?.CreateLogger<TContextProvider>();

            try
            {
                if (onConfiguring != null)
                    context.Configuring += onConfiguring;

                if (string.IsNullOrWhiteSpace(context.ConnectionString))
                    throw new IOException("Cannot connect to any database - the connection string is empty.");

                try
                {
                    if (testConnectingBeforeReturning)
                    {
                        context.Database.ExecuteSqlCommand("SELECT 1"); // (test the connection now)
                    }

                    return context;
                }
                catch (Exception ex)
                {

                    logger?.LogError(new EventId(-1, "CoreXT.Entities"), ex, "The database is not reachable.");
                    throw;
                }

            }
            catch (Exception ex)
            {
                logger?.LogError(new EventId(-1, "CoreXT.Entities"), ex, "Error configuring the database context.");
                throw;
            }
            // --------------------------------------------------------------------------------------------------------------------
        }
    }

    // ########################################################################################################################

    /// <summary>
    /// This class helps to manage the entity map collections in entity classes that have many-to-many relationships.
    /// It also supports enumerating over the target entity instances on the referenced map collection.
    ///  <para>Somewhat fixes the issue where EF in .Net Core does not support many-to-many mapping tables very well.</para>
    /// <para>(See also: https://github.com/aspnet/EntityFramework/issues/1368 )</para>
    /// </summary>
    /// <typeparam name="TThis">The owning entity type in which the EntityMap instance will exist.</typeparam>
    /// <typeparam name="TMapItem">The mapping class type for the many-to-many relationship..</typeparam>
    /// <typeparam name="TOther">The other entity type that maps to the owning entity.</typeparam>
    public class EntityMap<TThis, TMapItem, TOther> : ICollection<TOther>
    where TThis : class
    where TMapItem : class, new()
    where TOther : class
    {
        public int Count => _Collection.Count;

        public bool IsReadOnly => _Collection.IsReadOnly;

        ICollection<TMapItem> _Collection;

        TThis _Owner;
        PropertyInfo _ThisKey; // (pulls the current key value for "this" entity)
        PropertyInfo _OtherKey; // (pulls the key value from the "other" entity)
        PropertyInfo _Map_ThisFK; // (used to get/set properties for "this" entity foreign key value)
        PropertyInfo _Map_OtherFK; // (used to get/set properties for the "other" entity foreign key value)
        PropertyInfo _Map_ThisNavProp; // (used to get "this" entity related navigational property reference when enumerating the map items)
        PropertyInfo _Map_OtherNavProp; // (used to get the "other" navigational property reference when enumerating the map items)

        /// <summary>
        /// Create a new EntityMap instance for collections with a many-to-many relationship.
        /// </summary>
        /// <param name="owner">The instance this object is created on.</param>
        /// <param name="collection">The entity map collection this EntityMap will manage.</param>
        /// <param name="onAdded">An optional callback when new items are added.</param>
        /// <param name="rightSideFKName">If there are multiple right-side mapping foreign keys representing navigational properties of the same type, a specific foreign key must be named here. This is usually null in the most basic cases.</param>
        /// <param name="leftSideFKName">If there are multiple left-side mapping foreign keys representing navigational properties of the same type, a specific foreign key must be named here. This is usually null in the most basic cases.</param>
        public EntityMap(TThis owner, ICollection<TMapItem> collection, Action<TMapItem> onAdded = null, string rightSideFKName = null, string leftSideFKName = null)
        {
            _Owner = owner ?? throw new ArgumentNullException("owner");
            _Collection = collection ?? throw new ArgumentNullException("collection", "Did you forget to set your mapping collection of type '" + typeof(TMapItem).Name + "' to a 'HashSet<T>' instance in your '" + typeof(TThis).Name + "' entity's default constructor?"); //? ImmutableHashSet<TMapItem>.Empty;
            _DoReflect(leftSideFKName, rightSideFKName);
        }

        /// <summary>
        /// Process the types and connect the relationships.
        /// </summary>
        void _DoReflect(string leftSideFKName = null, string rightSideFKName = null)
        {
            _ThisKey = GetKey<TThis>();
            _OtherKey = GetKey<TOther>();

            _Map_ThisFK = GetForeignKey<TMapItem, TThis>(leftSideFKName);
            _Map_OtherFK = GetForeignKey<TMapItem, TOther>(rightSideFKName);

            _Map_ThisNavProp = GetNavProperty<TMapItem, TThis>(leftSideFKName);
            _Map_OtherNavProp = GetNavProperty<TMapItem, TOther>(rightSideFKName);
        }

        protected static PropertyInfo[] GetProperties<TClass>()
        {
            return typeof(TClass).GetProperties(BindingFlags.Instance | BindingFlags.Public | BindingFlags.NonPublic);
        }

        protected static PropertyInfo[] GetProperties<TClass, TAttribute>() where TAttribute : Attribute
        {
            return (from p in GetProperties<TClass>()
                    where p.GetCustomAttribute<TAttribute>() != null
                    select p).ToArray();
        }

        protected static PropertyInfo GetNavProperty<TClass, TFKType>(string specificName = null)
        {
            var props = GetProperties<TClass, ForeignKeyAttribute>();

            if (props != null)
            {
                // ... attributes found, so rely on them ...
                props = props.Where(p => _SelectNavProp(p).PropertyType.Equals(typeof(TFKType))).ToArray(); // (TFKType is the navigational property type on the mapping class)

                if (specificName != null) // (further break down to specific name on either side [FK or Nav])
                    props = (from p in props
                             where _SelectNavProp(p).Name == specificName || _SelectForeignKey(p).Name == specificName
                             select p).ToArray();
            }
            else
            {
                // ... no attributes found, look for any property matching the type ...
                props = (from p in GetProperties<TClass>()
                         where (specificName == null || specificName == p.Name) && p.PropertyType.Equals(typeof(TFKType))
                         select p).ToArray();
            }

            if (props.Length == 0) throw new InvalidOperationException("A navigation property of type '" + typeof(TFKType).Name + "' is required on type '" + typeof(TClass).Name + "'.");
            if (props.Length > 1) throw new InvalidOperationException("Multiple navigation properties of type '" + typeof(TFKType).Name + "' found on type '" + typeof(TClass).Name + "'.");
            return _SelectNavProp(props.FirstOrDefault());
        }

        protected static PropertyInfo GetKey<TClass>()
        {
            var keys = GetProperties<TClass, KeyAttribute>();
            if (keys.Length == 0) throw new InvalidOperationException("A key is required - no 'Key' attribute detected on type '" + typeof(TClass).Name + "'.");
            if (keys.Length > 1) throw new InvalidOperationException("Composite keys not supported.");
            return keys[0];
        }

        protected static PropertyInfo GetForeignKey<TClass, TFKType>(string specificName = null)
        {
            var props = GetProperties<TClass, ForeignKeyAttribute>();
            var fks = props.Where(p => _SelectNavProp(p).PropertyType.Equals(typeof(TFKType))).ToArray(); // (TFKType is the navigational property type on the mapping class)

            if (specificName != null) // (further break down to specific name on either side [FK or Nav])
                fks = fks.Where(p => _SelectNavProp(p).Name == specificName || _SelectForeignKey(p).Name == specificName).ToArray();

            if (fks.Length == 0) throw new InvalidOperationException("A foreign key is required - no 'ForeignKey' attribute detected on mapping type '" + typeof(TClass).Name + "' for type '" + typeof(TFKType).Name + "'.");
            if (fks.Length > 1) throw new InvalidOperationException("Multiple foreign keys of the same type not supported.");

            return _SelectForeignKey(fks[0]);
        }

        static PropertyInfo _SelectForeignKey(PropertyInfo p) // (finds the foreign key property)
        {
            // (the mapping properties may be IDs or navigation references, so deal with both)
            if (p.PropertyType.GetTypeInfo().IsClass)
            {
                var fkname = p.GetCustomAttribute<ForeignKeyAttribute>()?.Name;
                if (string.IsNullOrWhiteSpace(fkname)) throw new InvalidOperationException("The foreign key attribute name on property '" + p.Name + "' of type '" + p.DeclaringType.Name + "' cannot be empty when placed on object references.");
                return p.DeclaringType.GetProperty(fkname) ?? throw new InvalidOperationException("No property matching the foreign key attribute name '" + fkname + "' on property '" + p.Name + "' of type '" + p.DeclaringType.Name + "' could not be found.");
            }
            else return p;
        }
        static PropertyInfo _SelectNavProp(PropertyInfo p) // (finds the navigational property)
        {
            // (the mapping properties may be IDs or navigation references, so deal with both)
            if (!p.PropertyType.GetTypeInfo().IsClass)
            {
                var navname = p.GetCustomAttribute<ForeignKeyAttribute>()?.Name;
                if (string.IsNullOrWhiteSpace(navname)) throw new InvalidOperationException("The foreign key attribute name on property '" + p.Name + "' of type '" + p.DeclaringType.Name + "' cannot be empty when placed on non-object references.");
                return p.DeclaringType.GetProperty(navname) ?? throw new InvalidOperationException("No property matching the foreign key attribute name '" + navname + "' on property '" + p.Name + "' of type '" + p.DeclaringType.Name + "' could not be found.");
            }
            else return p;
        }

        public void Add(TOther item)
        {
            if (item == null) throw new ArgumentNullException("item");
            var map = new TMapItem();
            _Map_ThisFK.SetValue(map, _ThisKey.GetValue(_Owner));
            var otherID = _OtherKey.GetValue(item);
            _Map_OtherFK.SetValue(map, otherID);
            if (Contains(item)) throw new InvalidOperationException("Duplicate error: Another '" + item.GetType().Name + "' entity with ID " + otherID + " already exists.");
            _Collection.Add(map);
        }

        public void Clear()
        {
            _Collection.Clear();
        }

        public bool Remove(TOther item)
        {
            var maps = _Collection.Where(i => _Map_OtherFK.GetValue(i) == _OtherKey.GetValue(item));
            var removed = false;
            foreach (var map in maps)
                if (_Collection.Remove(map))
                    removed = true;
            return removed;
        }

        public bool Contains(TOther item)
        {
            return _Collection.Any(i => _Map_OtherFK.GetValue(i) == _OtherKey.GetValue(item));
        }

        public void CopyTo(TOther[] array, int arrayIndex)
        {
            foreach (var item in _Collection)
                array[arrayIndex++] = (TOther)_Map_OtherNavProp.GetValue(item);
        }

        public IEnumerator<TOther> GetEnumerator()
        {
            return _Collection.Select(item => (TOther)_Map_OtherNavProp.GetValue(item)).GetEnumerator();
        }

        IEnumerator IEnumerable.GetEnumerator()
        {
            return GetEnumerator();
        }
    }

    // ########################################################################################################################
}
