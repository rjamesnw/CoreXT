using CoreXT.Services.DI;
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

namespace CoreXT.Entities
{
    // ########################################################################################################################

    public static class CoreXTDBContextExtensions
    {
        // --------------------------------------------------------------------------------------------------------------------

        /// <summary>
        /// A fix that checks for the 'Table' attribute on a class. If not found, the class name is assumed.
        /// </summary>
        /// <param name="useTypeNamesAsIs">If false (default) the type names are parsed such that underscores precede uppercase letters, and the whole name is made lowercase and pluralized.
        /// If true, the types names are used as is with full casing intact.</param>
        public static EntityTypeBuilder<TEntity> ToTable<TEntity>(this EntityTypeBuilder<TEntity> _this, bool useTypeNamesAsIs = false) where TEntity : class
        {
            var typeInfo = typeof(TEntity).GetTypeInfo();
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
        /// <typeparam name="TContext"></typeparam>
        /// <param name="sp"></param>
        /// <param name="connectionString"></param>
        /// <param name="testConnectingBeforeReturning"></param>
        /// <returns></returns>
        public static TContext ConfigureCoreXTDBContext<TContext>(this ICoreXTServiceProvider sp, Action<DbContextOptionsBuilder> onConfiguring = null, bool testConnectingBeforeReturning = true)
            where TContext : class, ICoreXTDBContext
        {
            var context = sp.GetService<TContext>();

            if (context == null)
                throw new InvalidOperationException("There is no " + typeof(TContext).Name + " service object registered.");

            if (context.Database == null)
                throw new InvalidOperationException("The 'Database' property is null for DBContext type " + typeof(TContext).Name + ".");

            var logger = sp.GetService<ILoggerFactory>()?.CreateLogger<TContext>();

            try
            {
                if (onConfiguring != null)
                    context.Configuring += onConfiguring;

                if (string.IsNullOrWhiteSpace(context.ConnectionString))
                    throw new IOException("Cannot connect to any database - the connection string is empty.");

                try
                {
                    if (testConnectingBeforeReturning)
                        context.Database.OpenConnection(); // (test the connection now)

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
