using CoreXT;
using CoreXT.ASPNet;
using CoreXT.Services.DI;
using CoreXT.Validation;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Data.Common;
using System.Linq;
using System.Net.Http;
using System.Reflection;
using System.Threading.Tasks;

namespace CoreXT.Entities
{
    public interface ITable
    {
        DbContext Context { get; }
        string ID { get; }
        IEnumerable<string> KeyNames { get; set; }
        string TableTitle { get; }
        List<string> ColumnOrder { get; }
        int RowCount { get; }
        ValidationResults ValidationResult { get; }
        string ErrorMessage { get; }
        ICoreXTServiceProvider ServiceProvider { get; set; }
        IObjectModelValidator ModelValidator { get; }

        /// <summary> The number of records to skip in the database query before returning results. </summary>
        /// <value> The number of records to skip. </value>
        int Skip { get; set; }

        /// <summary> The number of records to take from the database query after 'Skip' records. </summary>
        /// <value> The number of records to take. </value>
        int Take { get; set; }

        Type GetCustomMetadataType(Type entityType);
        IEnumerable<TAttribute> GetCustomMetadataPropertyAttributes<TAttribute>(string propertyName, Type entityType = null) where TAttribute : Attribute;
        Dictionary<string, PropertyInfo> UpdateEntityPropertyCache(Type type);
        PropertyInfo GetEntityPropertyFromCache(Type type, string name);
        PropertyInfo[] GetEntityPropertiesFromCache(Type type);
        bool Load(HttpRequest request, string tableID);
        ValidationResults ApplyChanges(DbContext context);
        ValidationResults ApplyChanges<TEntities>()
           where TEntities : DbContext, new();
        ValidationResults Commit(DbContext context = null, bool save = true);
        ValidationResults Commit<TEntities>(bool save = true)
           where TEntities : DbContext, new();
        void ClearValidations();
    }

    public interface IVariantTable<out TEntity> : ITable
        where TEntity : class, new()
    {
        IEnumerable<TEntity> Entities { get; }

        IVariantTableRow<TEntity> AttachRow(IInternalTableRow row);
        IVariantTableRow<TEntity> DetachRow(IInternalTableRow row);

        IVariantTableColumn<TEntity> AttachColumn(IInternalTableColumn column);
        IVariantTableColumn<TEntity> AddColumn(string name, string title = null, int order = 0);

        IVariantTableRow<TEntity>[] TableRows { get; }
        IVariantTableColumn<TEntity>[] TableColumns { get; }
        IVariantTableColumn<TEntity>[] OrderedColumns { get; }
        IVariantTableColumn<TEntity>[] DisplayableColumns { get; }
        IVariantTableColumn<TEntity>[] KeyColumns { get; }
        IEnumerable<IVariantTableRow<TEntity>> DisplayableRows { get; }
        IVariantTable<TEntity> SetColumnOrder(params string[] entityPropertyNames);
        IVariantTable<TEntity> SetExcludedColumns(params string[] entityPropertyNames);
        IVariantTable<TEntity> SetIncludedColumns(params string[] entityPropertyNames);
        IVariantTableColumn<TEntity> GetColumn(string clrName);
        IVariantTableColumn<TEntity> GetColumn(int columnIndex);
        IVariantTableColumn<TEntity> GetColumnByDBName(string dbName);
        IVariantTable<TEntity> BuildColumns(bool rebuild = false);
        IVariantTable<TEntity> BuildRows(bool rebuild = false);
        IVariantTable<TEntity> BuildTable(bool rebuild = false);

        /// <summary> Gets or sets the query to use for populating this table. Setting this causes the next read to '<see cref="Entities"/>' to re-execute the query.</summary>
        /// <value> The query. </value>
        IQueryable<TEntity> Query { get; }

        /// <summary>
        ///     Forces a refreshes of the table rows from the existing query or manually set entities. Call this after updating the
        ///     '<see cref="Skip"/>', '<see cref="Take"/>',  and/or '<see cref="Query"/>' properties to rebuild the table.
        ///     <para>Note: To force a rebuild of table rows AND columns pass 'true' to '<see cref="BuildTable(bool)"/>'.</para>
        /// </summary>
        /// <returns> The current ITable&lt;TEntity&gt; instance. </returns>
        IVariantTable<TEntity> Requery();

        IVariantTableRow<TEntity> this[Int64 rowID] { get; }
        IVariantTableRow<TEntity> this[ITableRow row] { get; }

        /// <summary> Creates a new table without any associated database context. </summary>
        /// <param name="tableTitle"> A display title for this table. </param>
        /// <param name="tableId"> (Optional) A page-wide unique identifier for this table. </param>
        /// <param name="keyNames">
        ///     (Optional) The key property names shared by all the entities for this table.  Composite keys can also specify a
        ///     DBContext (see other overloaded constructor), or entity metadata to specify a Key attribute for each key entity
        ///     property.  By default, any property named "id" (case insensitive) is automatically assumed.
        /// </param>
        /// <param name="context">
        ///     (Optional) A context to use as the default for this table.  It also helps to retrieve entity details (like primary
        ///     keys) without the need to add metadata to entity properties. Note: Entity property attributes always take precedence
        ///     over the context if supplied.
        /// </param>
        IVariantTable<TEntity> Configure(string tableTitle, string tableId = null, string[] keyNames = null, DbContext context = null);

        /// <summary>
        ///     Creates a new table with an associated context. An associated context helps to pull more details on the underlying
        ///     table without needing to lookup metadata info on entity properties. The EDMX information is automatically applied to
        ///     all table columns.
        /// </summary>
        /// <param name="tableTitle"> A display title for this table. </param>
        /// <param name="context">
        ///     A context to use as the default for this table.  It also helps to retrieve entity details (like primary keys)
        ///     without the need to add metadata to entity properties. Note: Entity property attributes always take precedence over
        ///     the context if supplied.
        /// </param>
        /// <param name="tableID">
        ///     (Optional) A page-wide unique identifier for this table. If this is null, a GUID will be used;
        ///     however when inspecting the HTML, adding a more descriptive ID can make debugging easier.
        /// </param>
        IVariantTable<TEntity> Configure(string tableTitle, DbContext context, string tableID = null);

        /// <summary>
        ///     Loads the table contents from the posted table with the specified ID. Use this in cases there multiple tables are on
        ///     a single page.
        /// </summary>
        /// <exception cref="ArgumentNullException"> Thrown when one or more required arguments are null. </exception>
        /// <param name="id"> A page-wide unique identifier for this table. </param>
        /// <param name="request"> The request. </param>
        /// <param name="context">
        ///     (Optional) A context to use as the default for this table.  It also helps to retrieve entity details (like primary
        ///     keys) without the need to add metadata to entity properties. Note: Entity property attributes always take precedence
        ///     over the context if supplied.
        /// </param>
        IVariantTable<TEntity> Configure(string id, HttpRequest request, DbContext context = null);
    }

    /// <summary>
    /// Wraps a collection of entities to make working with them easier in view models.
    /// </summary>
    /// <typeparam name="TEntity"></typeparam>
    public class Table<TEntity> : ITable<TEntity>, IVariantTable<TEntity> where TEntity : class, new()
    {
        internal static Int64 _TableIDCounter;

        public string ID
        {
            get { return string.IsNullOrWhiteSpace(_ID) ? (_ID = (++_TableIDCounter).ToString()) : _ID; }
            set
            {
                if (string.IsNullOrWhiteSpace(value)) throw new ArgumentNullException("'value' cannot be null, empty, or whitespace.");
                if (_ID != null) throw new InvalidOperationException("Cannot change table IDs once set."); _ID = value;
            }
        }
        internal string _ID;

        internal static Int64 NextRowID { get { return ++_RowIDCounter; } }
        static Int64 _RowIDCounter;

        /// <summary>
        /// The name of unique key properties across all entities.
        /// This for convenience only, and helps prevent the need to add the 'Key' attribute to a single key column.
        /// Entities with multiple key columns will still required the 'Key' attribute on all key properties.
        /// </summary>
        //public string KeyName { get; private set; }

        public IEnumerable<string> KeyNames { get { return _KeyNames ?? (KeyNames = null); } set { _KeyNames = value != null ? value.ToArray() : new string[] { "id" }; } }
        internal string[] _KeyNames;

        /// <summary>
        ///     The underlying context for this table, if specified via one of the constructor overloads, or before any rows get
        ///     added. Setting this property pulls the <see cref="DbContext"/> model meta-data from the given context to help
        ///     configure table and column properties.
        /// </summary>
        /// <exception cref="InvalidOperationException"> Thrown when the requested operation is invalid. </exception>
        /// <value> The context. </value>
        public DbContext Context
        {
            get { return _DBContext; }
            private set
            {
                if (Context != null && RowCount > 0)
                    throw new InvalidOperationException("You cannot replace the existing database context while rows exist in the table.");
                _DBContext = value;
            }
        }
        DbContext _DBContext;

        /// <summary> Gets or sets the query to use for populating this table. Setting this causes the next read to '<see cref="Entities"/>' to re-execute the query.</summary>
        /// <value> The query. </value>
        public IQueryable<TEntity> Query { get => _query; set { _query = value; _Entities = null; } }
        private IQueryable<TEntity> _query;

        /// <summary> The number of records to skip in the database query before returning results. </summary>
        /// <value> The number of records to skip. </value>
        public int Skip { get => _skip; set { _skip = value; _Entities = null; } }
        private int _skip;

        /// <summary> The number of records to take from the database query after '<see cref="Skip"/>' records. Setting this causes the next read to '<see cref="Entities"/>' to re-execute the query.</summary>
        /// <value> The number of records to take. </value>
        public int Take { get => _take; set { _take = value; _Entities = null; } }
        private int _take;

        IQueryable<TEntity> _FinalQuery
        {
            get
            {
                var query = Query;
                if (query == null)
                    query = _Entities?.AsQueryable();
                else
                    if (_Entities != null) return _Entities.AsQueryable();
                if (Skip > 0) query = query.Skip(Skip);
                if (Take > 0) query = query.Take(Take);
                return Query;
            }
        }

        /// <summary>
        ///     Forces a refreshes of the table rows from the existing query or manually set entities. Call this after updating the
        ///     '<see cref="Skip"/>', '<see cref="Take"/>',  and/or '<see cref="Query"/>' properties to rebuild the table.
        ///     <para>Note: To force a rebuild of table rows AND columns pass 'true' to '<see cref="BuildTable(bool)"/>'.</para>
        /// </summary>
        /// <returns> The current ITable&lt;TEntity&gt; instance. </returns>
        public ITable<TEntity> Requery()
        {
            _Entities = _FinalQuery?.ToList() ?? new List<TEntity>();
            BuildRows(true);
            BuildTable();
            return this;
        }

        /// <summary>
        /// A list of entity objects to edit.
        /// Only public properties on each object will be editable in accordance with associated attributes.
        /// </summary>
        public IEnumerable<TEntity> Entities
        {
            get { return _Entities ?? (_Entities = _FinalQuery?.ToList()) ?? (_Entities = new List<TEntity>()); }
            set { _Entities = new List<TEntity>(value); BuildRows(true); BuildTable(); }
        }
        List<TEntity> _Entities;

        internal readonly Dictionary<Type, Dictionary<string, PropertyInfo>> _EntityPropertiesCache = new Dictionary<Type, Dictionary<string, PropertyInfo>>();
        internal ModelMetadataTypeAttribute _MetadataTypeAttribute = new ModelMetadataTypeAttribute(typeof(DBNull));
        public PropertyInfo GetEntityPropertyFromCache(Type type, string name) { var p = UpdateEntityPropertyCache(type); return p != null ? p.Value(name) : null; }
        public PropertyInfo[] GetEntityPropertiesFromCache(Type type) { var p = UpdateEntityPropertyCache(type); return p != null ? p.Values.ToArray() : new PropertyInfo[0]; }
        /// <summary>
        /// Updates the entity property cache based on the given entity type and returns the property dictionary from the cache.
        /// <para>Note: If an entry for the type already exists, it is not replaced, since it is assumed type properties are static.</para>
        /// </summary>
        public Dictionary<string, PropertyInfo> UpdateEntityPropertyCache(Type type)
        {
            Dictionary<string, PropertyInfo> propDic;
            // ... get the PropertyInfo dictionary from the cache based on the given entity type, and update only if NOT found ...
            if (!_EntityPropertiesCache.TryGetValue(type, out propDic))
            {
                _EntityPropertiesCache[type] = propDic = type.GetProperties(BindingFlags.FlattenHierarchy | BindingFlags.Public | BindingFlags.Instance | BindingFlags.GetProperty).ToDictionary(p => p.Name);
                //?GetCustomMetadataPropertyAttribute<Attribute>(type, null); // (just updates the '_MetadataTypeAttribute' reference)
            }
            return propDic;
        }
        public Type GetCustomMetadataType(Type entityType) { return _MetadataTypeAttribute?.MetadataType; }
        public IEnumerable<TAttribute> GetCustomMetadataPropertyAttributes<TAttribute>(string propertyName, Type entityType = null) where TAttribute : Attribute
        {
            entityType = entityType ?? typeof(TEntity);

            // (the "_MetadataTypeAttribute.MetadataType" holds the meta-data type that contains the model data annotations)

            if (_MetadataTypeAttribute != null && _MetadataTypeAttribute.MetadataType == typeof(DBNull))
                _MetadataTypeAttribute = (ModelMetadataTypeAttribute)entityType.GetCustomAttributes(typeof(ModelMetadataTypeAttribute), true).FirstOrDefault();

            if (!string.IsNullOrWhiteSpace(propertyName))
            {
                var metaType = _MetadataTypeAttribute != null ? _MetadataTypeAttribute.MetadataType : entityType;
                var metaProp = metaType.GetProperty(propertyName, BindingFlags.FlattenHierarchy | BindingFlags.Public | BindingFlags.Instance);
                if (metaProp != null)
                    return metaProp.GetCustomAttributes(typeof(TAttribute), true).Cast<TAttribute>();
            }

            return Enumerable.Empty<TAttribute>();
        }
        public PropertyInfo[] GetCustomMetadataProperties(Type entityType = null)
        {
            entityType = entityType ?? typeof(TEntity);

            if (_MetadataTypeAttribute != null && _MetadataTypeAttribute.MetadataType == typeof(DBNull))
                _MetadataTypeAttribute = (ModelMetadataTypeAttribute)entityType.GetCustomAttributes(typeof(ModelMetadataTypeAttribute), true).FirstOrDefault();

            var metaType = _MetadataTypeAttribute != null ? _MetadataTypeAttribute.MetadataType : entityType;
            var metaProps = metaType.GetProperties(BindingFlags.FlattenHierarchy | BindingFlags.Public | BindingFlags.Instance);

            return metaProps;
        }

        /// <summary>
        /// The desired order of the columns, in order of name specified.  The name should be the property name of an entity.
        /// </summary>
        public List<string> ColumnOrder { get { return _ColumnOrder; } }
        List<string> _ColumnOrder = new List<string>();

        /// <summary>
        ///     The desired columns to skip when building the table columns.  The names should be the property names of an entity
        ///     model. The matching entity property names (table columns) are skipped and not included in this table.
        ///     <para>Note: Excluded columns take precedence over included ones (thus, '<seealso cref="IncludedColumns"/>' is
        ///     ignored when the column
        ///     name also exists in '<seealso cref="ExcludedColumns"/>').</para>
        /// </summary>
        public readonly List<string> ExcludedColumns = new List<string>();

        /// <summary>
        ///     The desired columns to include.  The names should be the property names of an entity model. Any entity property
        ///     names (table columns) not in this list are skipped and not included in this table. If the list is empty, then all
        ///     columns are assumed.
        ///     <para>Note: Excluded columns take precedence over included ones (thus, '<seealso cref="IncludedColumns"/>' is
        ///     ignored when the column
        ///     name also exists in '<seealso cref="ExcludedColumns"/>').</para>
        /// </summary>
        public readonly List<string> IncludedColumns = new List<string>();

        /// <summary> Used internally to check if a column name should be included. </summary>
        /// <param name="name"> The name to check. </param>
        /// <returns> True to include, false to exlude. </returns>
        bool _IncludeColumn(string name)
        {
            return !ExcludedColumns.Contains(name) && (IncludedColumns.Count == 0 || IncludedColumns.Contains(name));
        }

        /// <summary>
        /// The title of the table to edit.
        /// </summary>
        public string TableTitle { get => _TableTitle ?? typeof(TEntity).Name; set => _TableTitle = value; }
        string _TableTitle;

        /// <summary>
        /// The available rows to edit after calling 'BuildRows()'.
        /// </summary>
        public ITableRow<TEntity>[] TableRows { get { return _TableRows ?? BuildRows().TableRows; } }
        ITableRow<TEntity>[] _TableRows;

        /// <summary>
        /// Returns the number of rows in the table.
        /// Entities must be set and the table built for this to update.
        /// </summary>
        public int RowCount { get { return _TableRows?.Length ?? 0; } }

        /// <summary>
        /// Returns only the rows that should be displayed (i.e. non-deleted rows).
        /// </summary>
        public IEnumerable<ITableRow<TEntity>> DisplayableRows { get { return from r in TableRows where !r.Deleted select r; } }

        /// <summary>
        /// Returns the worst case validation across all table rows.
        /// </summary>
        public ValidationResults ValidationResult
        {
            get { return (ValidationResults)(_ValidationResult ?? (_ValidationResult = (_LoadError != null || _CommitError != null ? ValidationResults.Errors : _TableRows != null && _TableRows.Length > 0 ? _TableRows.Min(r => r.ValidationResult) : ValidationResults.Unknown))); }
        }
        ValidationResults? _ValidationResult;

        public string ErrorMessage { get { return _LoadError != null || _CommitError != null ? Exceptions.GetFullErrorMessage(_LoadError ?? _CommitError, false, false) : null; } }
        internal Exception _LoadError;
        Exception _CommitError;
        // (only one of these should exist [if no load errors, then it will be null, and if load errors, the other is null])

        /// <summary>
        /// Returns all erroneous table rows after an attempt to apply underlying changes to a context.
        /// </summary>
        public IEnumerable<ITableRow<TEntity>> InvalidRows { get { return _TableRows != null ? _TableRows.Where(r => r.ValidationResult == ValidationResults.Errors) : Enumerable.Empty<ITableRow<TEntity>>(); } }

        /// <summary>
        /// Attaches a table row to the internal row index. Any existing table row will be replaced.
        /// </summary>
        /// <param name="row"></param>
        public ITableRow<TEntity> AttachRow(IInternalTableRow row)
        {
            if (row.Table != this)
            {
                row.Table.DetachRow(row);
                row.Table = this;
                row.Deleted = false; // (rows in a deleted state are no longer deleted by default when moved to another table)
            } // (else this row already has a reference to this table, so attach it AS IS)

            if (row.ID == 0 || _TableRowIndex.ContainsKey(row.ID))
                row.ID = NextRowID; // (give the row a new ID if new, or one already exists [duplicates not allowed! - else this reference will overwrite the existing one])

            _TableRowIndex[row.ID] = (ITableRow<TEntity>)row;

            return (ITableRow<TEntity>)row;
        }
        public ITableRow<TEntity> DetachRow(IInternalTableRow row)
        {
            if (row.Table != this)
                return (ITableRow<TEntity>)row.Table.DetachRow(row);
            else
                if (_TableRowIndex.ContainsKey(row.ID))
            {
                _TableRowIndex.Remove(row.ID);
                _TableRows = TableRows.Where(r => r.ID != row.ID).ToArray();
                _TableColumns = null; // (will be rebuilt next time accessed)
            }
            return (ITableRow<TEntity>)row;
        }
        internal Dictionary<Int64, ITableRow<TEntity>> _TableRowIndex { get { return __TableRowIndex ?? (__TableRowIndex = new Dictionary<long, ITableRow<TEntity>>()); } }
        Dictionary<Int64, ITableRow<TEntity>> __TableRowIndex;

        public ITableColumn<TEntity> AttachColumn(IInternalTableColumn column)
        {
            if (_TableColumns == null)
                _TableColumns = new List<ITableColumn<TEntity>>();

            _TableColumns.Add((ITableColumn<TEntity>)column);

            return (ITableColumn<TEntity>)column;
        }

        public ITableColumn<TEntity> AddColumn(string name, string title = null, int order = 0)
        {
            var col = new TableColumn<TEntity>(this, name, null, title, order);

            return AttachColumn(col);
        }

        /// <summary>
        /// The available columns to edit after calling 'BuildColumns()'.
        /// <para>Note: These are not sorted in order.</para>
        /// </summary>
        public ITableColumn<TEntity>[] TableColumns { get { return _TableColumns?.ToArray() ?? BuildColumns().TableColumns; } }
        List<ITableColumn<TEntity>> _TableColumns;

        /// <summary>
        /// Returns the columns from 'TableColumns' sorted in proper order.
        /// </summary>
        public ITableColumn<TEntity>[] OrderedColumns { get { return _OrderedColumns ?? (_OrderedColumns = (from c in TableColumns orderby c.Order select c).ToArray()); } }
        ITableColumn<TEntity>[] _OrderedColumns;

        /// <summary>
        /// Returns a list of columns that are not hidden.
        /// </summary>
        public ITableColumn<TEntity>[] DisplayableColumns { get { return _DisplayableColumns ?? (_DisplayableColumns = (from c in OrderedColumns where !c.Hidden select c).ToArray()); } }
        ITableColumn<TEntity>[] _DisplayableColumns;

        /// <summary>
        /// Returns a list of columns that are keys for reach row in this table.
        /// </summary>
        public ITableColumn<TEntity>[] KeyColumns { get { return _KeyColumns ?? (_KeyColumns = (from c in OrderedColumns where c.IsKey select c).ToArray()); } }

        /// <summary>
        /// Executes before changes to the row entity are applied to the underlying context.
        /// </summary>
        public Func<ITableRow<TEntity>, Exception> BeforeChangesApplied { get; set; }
        /// <summary>
        /// Executes after changes to the row entity are applied to the underlying context.
        /// </summary>
        public Func<ITableRow<TEntity>, Exception> AfterChangesApplied { get; set; }

        ITableColumn<TEntity>[] _KeyColumns;


        public ICoreXTServiceProvider ServiceProvider
        {
            get => _ServiceProvider ?? throw new InvalidOperationException("No service provider is set for this table.  That can happen if the table was not created from the DI container. Please set the 'ServiceProvider' property first.");
            set => _ServiceProvider = value;
        }
        ICoreXTServiceProvider _ServiceProvider;

        public IObjectModelValidator ModelValidator => _ModelValidator ?? (_ModelValidator = ServiceProvider?.GetService<IObjectModelValidator>())
            ?? throw new InvalidOperationException("'IObjectModelValidator' service provider could not be found.");

        IEnumerable<TEntity> IVariantTable<TEntity>.Entities => throw new NotImplementedException();

        IVariantTableRow<TEntity>[] IVariantTable<TEntity>.TableRows => throw new NotImplementedException();

        IVariantTableColumn<TEntity>[] IVariantTable<TEntity>.TableColumns => throw new NotImplementedException();

        IVariantTableColumn<TEntity>[] IVariantTable<TEntity>.OrderedColumns => throw new NotImplementedException();

        IVariantTableColumn<TEntity>[] IVariantTable<TEntity>.DisplayableColumns => throw new NotImplementedException();

        IVariantTableColumn<TEntity>[] IVariantTable<TEntity>.KeyColumns => throw new NotImplementedException();

        IEnumerable<IVariantTableRow<TEntity>> IVariantTable<TEntity>.DisplayableRows => throw new NotImplementedException();

        IQueryable<TEntity> IVariantTable<TEntity>.Query => throw new NotImplementedException();

        DbContext ITable.Context => throw new NotImplementedException();

        string ITable.ID => throw new NotImplementedException();

        IEnumerable<string> ITable.KeyNames { get => throw new NotImplementedException(); set => throw new NotImplementedException(); }

        string ITable.TableTitle => throw new NotImplementedException();

        List<string> ITable.ColumnOrder => throw new NotImplementedException();

        int ITable.RowCount => throw new NotImplementedException();

        ValidationResults ITable.ValidationResult => throw new NotImplementedException();

        string ITable.ErrorMessage => throw new NotImplementedException();

        ICoreXTServiceProvider ITable.ServiceProvider { get => throw new NotImplementedException(); set => throw new NotImplementedException(); }

        IObjectModelValidator ITable.ModelValidator => throw new NotImplementedException();

        int ITable.Skip { get => throw new NotImplementedException(); set => throw new NotImplementedException(); }
        int ITable.Take { get => throw new NotImplementedException(); set => throw new NotImplementedException(); }

        IVariantTableRow<TEntity> IVariantTable<TEntity>.this[ITableRow row] => throw new NotImplementedException();

        IVariantTableRow<TEntity> IVariantTable<TEntity>.this[long rowID] => throw new NotImplementedException();

        IObjectModelValidator _ModelValidator;
        ActionContext _DummyActionContext = new ActionContext(); // (the model validator requires it, but doesn't seem to use it)

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary> Creates an empty table instance with the specified DI service provider reference. </summary>
        /// <param name="context">
        ///     The underlying context for this table, if specified via one of the constructor overloads, or before any rows get
        ///     added. Setting this property pulls the <see cref="DbContext"/> model meta-data from the given context to help
        ///     configure table and column properties.
        /// </param>
        /// <param name="service"> (Optional) A CoreXT DI service provider. </param>
        public Table(DbContext context, ICoreXTServiceProvider service = null) : this(service)
        {
            Context = context;
        }

        /// <summary> Creates an empty table instance with the specified DI service provider reference. </summary>
        /// <param name="service"> A CoreXT DI service provider. </param>
        public Table(ICoreXTServiceProvider service)
        {
            ServiceProvider = service;
        }

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary> Creates a new table without any associated database context. </summary>
        /// <param name="tableTitle"> A display title for this table. </param>
        /// <param name="tableId"> (Optional) A page-wide unique identifier for this table. </param>
        /// <param name="keyNames">
        ///     (Optional) The key property names shared by all the entities for this table.  Composite keys can also specify a
        ///     DBContext (see other overloaded constructor), or entity metadata to specify a Key attribute for each key entity
        ///     property.  By default, any property named "id" (case insensitive) is automatically assumed.
        /// </param>
        /// <param name="context">
        ///     (Optional) A context to use as the default for this table.  It also helps to retrieve entity details (like primary
        ///     keys) without the need to add metadata to entity properties. Note: Entity property attributes always take precedence
        ///     over the context if supplied.
        /// </param>
        public virtual ITable<TEntity> Configure(string tableTitle, string tableId = null, string[] keyNames = null, DbContext context = null)
        {
            TableTitle = tableTitle?.Trim();
            if (tableId != null)
                ID = tableId;
            KeyNames = keyNames ?? (from p in UpdateEntityPropertyCache(typeof(TEntity)) where string.Equals(p.Key, "id", StringComparison.CurrentCultureIgnoreCase) select p.Key);
            return this;
        }

        /// <summary>
        ///     Creates a new table with an associated context. An associated context helps to pull more details on the underlying
        ///     table without needing to lookup metadata info on entity properties. The EDMX information is automatically applied to
        ///     all table columns.
        /// </summary>
        /// <param name="tableTitle"> A display title for this table. </param>
        /// <param name="context">
        ///     A context to use as the default for this table.  It also helps to retrieve entity details (like primary keys)
        ///     without the need to add metadata to entity properties. Note: Entity property attributes always take precedence over
        ///     the context if supplied.
        /// </param>
        /// <param name="tableID">
        ///     (Optional) A page-wide unique identifier for this table. If this is null, a GUID will be used;
        ///     however when inspecting the HTML, adding a more descriptive ID can make debugging easier.
        /// </param>
        public virtual ITable<TEntity> Configure(string tableTitle, DbContext context, string tableID = null)
        {
            ID = tableID ?? Guid.NewGuid().ToString("N");
            TableTitle = tableTitle;
            Context = context; // (setting this make the model data available)
            return this;
        }

        /// <summary>
        ///     Loads the table contents from the posted table with the specified ID. Use this in cases there multiple tables are on
        ///     a single page.
        /// </summary>
        /// <exception cref="ArgumentNullException"> Thrown when one or more required arguments are null. </exception>
        /// <param name="id"> A page-wide unique identifier for this table. </param>
        /// <param name="request"> The request. </param>
        /// <param name="context">
        ///     (Optional) A context to use as the default for this table.  It also helps to retrieve entity details (like primary
        ///     keys) without the need to add metadata to entity properties. Note: Entity property attributes always take precedence
        ///     over the context if supplied.
        /// </param>
        public virtual ITable<TEntity> Configure(string id, HttpRequest request, DbContext context = null)
        {
            _ID = id;
            Context = context; // (setting this make the model data available, if given)
            Load(request); // (will load from "_id" by default if not specified as a parameter)
            return this;
        }

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary> Loads data from an HTTP request form data to this table. </summary>
        /// <param name="request"> An HTTPRequestBase object that contains the form data. </param>
        /// <param name="tableId">
        ///     (Optional) The ID of a specific table to apply.  If null, the current table ID is used.  If the current table
        ///     doesn't have an ID, then the posted table in the form is assumed if there is only one. To force pulling the table
        ///     data of a single posted table in the request, pass in an empty string ("").
        /// </param>
        /// <returns> 'true' if data was loaded into this table. </returns>
        public bool Load(HttpRequest request, string tableId = null)
        {
            Dictionary<string, string[]> requestProperties = new Dictionary<string, string[]>();
            foreach (string key in request.Form.Keys)
                requestProperties[key] = request.Form.GetValues(key);
            return _Load(requestProperties, tableId);
        }
        public bool Load(HttpRequestMessage request, string tableID = null)
        {
            Dictionary<string, string[]> requestProperties = request.Properties.ToDictionary(p => p.Key, p => new string[] { (string)p.Value });
            return _Load(requestProperties, tableID);
        }
        private bool _Load(IDictionary<string, string[]> requestProperties, string tableID = null)
        {
            ClearValidations();

            if (tableID == null)
                tableID = _ID; // (use local table ID if one is not specified)

            var props = requestProperties;

            if (string.IsNullOrWhiteSpace(tableID))
            {
                // ... no table ID found - need a table ID to pull the form data; try to pull from the request data ...
                // (Note: All request entity data is in the format Table.{ID}.{RowIndex}.Entity.{EntityPropertyName})

                string[] tableIDs = props.Value("Table.ID");

                if (tableIDs == null || tableIDs.Length == 0)
                    return false; // (there is no table data to load in this request)

                if (tableIDs.Length == 1)
                    tableID = _ID = tableIDs[0]; // (perfect, only one table, so assume that one)
                else
                    throw new InvalidOperationException("ID is null or empty, and no ID can be assumed since there " + Strings.S(tableIDs.Length, "table", "is", "are") + " posted.");

                if (string.IsNullOrWhiteSpace(tableID))
                    throw new InvalidOperationException("ID is null or empty, and no table ID can be found in the posted data.");
            }

            // ... clear all entities and rows (will be rebuilt later) and reset the counter ...

            _Entities = null;
            _TableColumns = null; // (prevent nulls [easier for rendering later])
            _TableRows = null; // (prevent nulls [easier for rendering later])
            _TableRowIndex.Clear();
            _RowIDCounter = 0; // (this will be set to the max ID later)

            // ... get all table row keys ...

            var tablePrefix = "Table." + tableID + ".";

            var tableTitle = props.Value(tablePrefix + "TableTitle").FirstOrDefault((string)null);
            if (tableTitle != null)
                TableTitle = tableTitle;

            var keyName = props.Value(tablePrefix + "KeyNames").FirstOrDefault((string)null);
            if (keyName != null)
                KeyNames = keyName.Split(',');

            string[] rowIndexStrValues = props.Value(tablePrefix + "RowIndex");

            if (rowIndexStrValues != null)
            {
                var tableRows = new List<TableRow<TEntity>>(); // new Dictionary<Int64, TableRow<TEntity>>();

                foreach (var rowIndexStr in rowIndexStrValues)
                    if (!rowIndexStr.StartsWith("{{") && !rowIndexStr.EndsWith("}}")) // (skip the template section that gets posted as well)
                    {
                        var rowIDStr = props.Value(tablePrefix + rowIndexStr + ".RowID").FirstOrDefault();
                        Int64 rowIndex;

                        if (!Int64.TryParse(rowIndexStr, out rowIndex))
                            throw new InvalidOperationException("Table " + tableID + ": Cannot convert posted row index '" + rowIndexStr + "' to an Int64 value.");

                        var tableRow = _CreateRow(rowIndex, props);
                        tableRows.Add(tableRow);

                        if (rowIndex > _RowIDCounter)
                            _RowIDCounter = rowIndex;
                    }

                // ... update the row IDs as needed, and set the new table rows reference ...

                foreach (var row in tableRows)
                    AttachRow(row);

                _TableRows = (from r in tableRows orderby r.ID select r).ToArray(); // (reorder and set the new table list)

                _Entities = (from r in TableRows select r.Entity).ToList(); // (refresh the underlying entities list for this table)
            }

            BuildColumns(true);

            return true;
        }

        public ITable<TEntity> SetColumnOrder(params string[] entityPropertyNames)
        {
            ColumnOrder.Clear();
            ColumnOrder.AddRange(entityPropertyNames);
            return this;
        }

        /// <summary>
        /// The desired columns to skip when building the table columns.  The names should be the property names of an entity model.
        /// The matching entity property names (table columns) are skipped and not included in this table.
        /// <para>See also: <seealso cref="SetIncludedColumns"/></para>
        /// <para>Note: This MUST be configured BEFORE adding any entities to the table, otherwise you will need to rebuild it again.</para>
        /// </summary>
        public ITable<TEntity> SetExcludedColumns(params string[] entityPropertyNames)
        {
            ExcludedColumns.Clear();
            ExcludedColumns.AddRange(entityPropertyNames);
            return this;
        }

        /// <summary>
        /// The desired columns to include.  The names should be the property names of an entity model.
        /// Any entity property names (table columns) not in this list are skipped and not included in this table.
        /// If the list is empty, then all columns are assumed.
        /// <para>Note: Included columns take precedence over excluded ones.</para>
        /// <para>See also: <seealso cref="SetExcludedColumns"/></para>
        /// <para>Note: This MUST be configured BEFORE adding any entities to the table, otherwise you will need to rebuild it again.</para>
        /// </summary>
        public ITable<TEntity> SetIncludedColumns(params string[] entityPropertyNames)
        {
            IncludedColumns.Clear();
            IncludedColumns.AddRange(entityPropertyNames);
            return this;
        }

        public ITableRow<TEntity> this[Int64 rowID]
        {
            get
            {
                return _TableRowIndex != null ? _TableRowIndex.Value(rowID) : null;
            }
        }
        public ITableRow<TEntity> this[ITableRow row]
        {
            get
            {
                return _TableRowIndex != null && row != null ? _TableRowIndex.Value(row.ID) : null;
            }
        }

        public ITableColumn<TEntity> GetColumn(string clrName)
        {
            return TableColumns?.FirstOrDefault(c => c.PropertyName == clrName);
        }

        public ITableColumn<TEntity> GetColumn(int columnIndex)
        {
            return OrderedColumns?[columnIndex];
        }

        public ITableColumn<TEntity> GetColumnByDBName(string dbName)
        {
            return TableColumns?.FirstOrDefault(c => c.DBName == dbName);
        }

        /// <summary>
        /// Sets all columns to hidden.
        /// </summary>
        public void HideAllColumns()
        {
            foreach (var col in TableColumns)
                col.Hidden = true;
        }

        /// <summary>
        /// Adds an entity to the internal entity collection.
        /// </summary>
        public TEntity AddEntity(TEntity entity) { if (entity != null) _Entities.Add(entity); return entity; }

        /// <summary>
        /// Adds am array of entities to the internal entity collection.
        /// </summary>
        public IEnumerable<TEntity> AddEntities(IEnumerable<TEntity> entities) { var _e = from e in entities where e != null select e; _Entities.AddRange(_e); return _e; }

        /// <summary>
        /// Removes an entity from the internal collection.  If the entity doesn't exist, null is returned.
        /// </summary>
        public TEntity RemoveEntity(TEntity e) { if (e != null) if (_Entities.Remove(e)) return e; return null; }

        TableRow<TEntity> _CreateRow(TEntity entity = null) { return (TableRow<TEntity>)Activator.CreateInstance(_RowType, this, entity); }
        TableRow<TEntity> _CreateRow(Int64 rowIndex, IDictionary<string, string[]> requestProperties)
        { return (TableRow<TEntity>)Activator.CreateInstance(_RowType, this, rowIndex, requestProperties); }

        Type _RowType = typeof(TableRow<TEntity>);

        /// <summary>
        /// Changes the row type to a custom derived row type. 
        /// </summary>
        /// <param name="type"></param>
        public void SetRowType<T>() where T : TableRow<TEntity>
        {
            _RowType = typeof(T);
        }

        /// <summary>
        /// Creates a new row using the given entity. If no entity is given, a new empty entity is created automatically.
        /// </summary>
        public TableRow<TEntity> CreateRow(TEntity entitiy = null)
        {
            entitiy = AddEntity(entitiy ?? new TEntity());
            BuildRows(true);
            return (TableRow<TEntity>)_TableRows.First(r => r.Entity == entitiy);
        }

        /// <summary>
        ///     Called to allow configuring additional columns. This is where specialized calculated (non-database targeted) columns
        ///     can also be configured.
        ///     <para>Note: ALWAYS configure columns BEFORE associating entity lists, otherwise column information may be
        ///     incomplete. </para>
        /// </summary>
        protected virtual void OnConfigureColumns() { }

        /// <summary>
        ///     Builds the table columns if not already built. If '<paramref name="rebuild"/>' is specified, then any already existing
        ///     columns are removed first.
        /// </summary>
        /// <param name="rebuild">
        ///     (Optional) True to force a rebuild. If this is false then nothing will happen if columns already exist.
        /// </param>
        /// <returns> An ITable&lt;TEntity&gt; </returns>
        public ITable<TEntity> BuildColumns(bool rebuild = false)
        {
            if (_TableColumns == null || _TableColumns.Count == 0 || rebuild)
            {
                List<TableColumn<TEntity>> columns = new List<TableColumn<TEntity>>();

                // ... always cache the properties TEntity to begin with ...

                UpdateEntityPropertyCache(typeof(TEntity));

                if (_DBContext != null)
                {
                    // ... a context was given, so pull the details for this type ...

                    var model = _DBContext.Model;
                    var entityClrType = typeof(TEntity);
                    var entityType = model.GetEntityTypes(entityClrType).FirstOrDefault() ?? throw new InvalidOperationException("The TEntity type '" + entityClrType.FullName + "' does not exist in the underlying DbContext.");
                    KeyNames = entityType.GetKeys().Select(k => k.Relational().Name);
                    var entityProperties = entityType.GetProperties();

                    //var objSet = _ObjectContext.CreateObjectSet<TEntity>();
                    //KeyNames = objSet.EntitySet.ElementType.KeyMembers.Select(k => k.Name);
                    //var entityProperties = objSet.EntitySet.ElementType.Properties;

                    columns.AddRange(entityProperties.Where(p => _IncludeColumn(p.Name)).Select(p => TableColumn<TEntity>.FromMetadataProperty(this, p)));
                    // (note: 'FromMetadataProperty()' already considers 'ColumnOrder', if specified, and not overridden by any annotation)

                    // ... check if other properties exist on the entity type we should pull in also ...
                    // (during data annotation, developers can add other special properties, such as may be needed for "calculated" columns)

                    var metaProps = GetCustomMetadataProperties();

                    foreach (var prop in metaProps)
                        if (!prop.IsSpecialName && _IncludeColumn(prop.Name))
                        {
                            // ... skip properties we cannot read from, and existing properties already added ...
                            if (!prop.CanRead || columns.Any(c => c.PropertyName == prop.Name)) continue;
                            // ... add this extra property to the columns as well ...
                            columns.Add(TableColumn<TEntity>.FromProperty(this, prop));
                        }
                }
                else
                {
                    // ... no context was given, so scan all entities for column details ...
                    // (it is possible that TEntity is a BASE type, so each row needs to be checked just in case)

                    BuildRows();

                    Dictionary<Type, bool> handled = new Dictionary<Type, bool>();

                    foreach (var row in TableRows)
                    {
                        if (!handled.Value(row.EntityType))
                        {
                            var colProps = UpdateEntityPropertyCache(row.EntityType);

                            foreach (var colProp in colProps.Values)
                            {
                                if (!colProp.IsSpecialName && _IncludeColumn(colProp.Name))
                                {
                                    Int64? order = ColumnOrder.IndexOf(colProp.Name);
                                    columns.Add(TableColumn<TEntity>.FromProperty(this, colProp, order >= 0 ? order : null));
                                }
                            }

                            handled[row.EntityType] = true;
                        }
                    }

                }
                // ... update column order ...

                _TableColumns = columns.OrderBy(c => c.Order).ToList<ITableColumn<TEntity>>();

                _DisplayableColumns = null; // (need to rebuild this cache later when requested)
                _KeyColumns = null; // (need to rebuild this cache later when requested)

                OnConfigureColumns(); // (configure any additional columns)
            }

            return this;
        }

        /// <summary>
        ///     Builds the table rows if not already built. If '<paramref name="rebuild"/>' is specified, then any already existing
        ///     rows are removed first.
        /// </summary>
        /// <param name="rebuild">
        ///     (Optional) True to force a rebuild. If this is false then nothing will happen if rows already exist.
        /// </param>
        /// <returns> An ITable&lt;TEntity&gt; </returns>
        public ITable<TEntity> BuildRows(bool rebuild = false)
        {
            if (_TableRows == null || _TableRows.Length == 0 || rebuild)
            {
                _TableRowIndex.Clear();
                _TableRows = (from e in Entities select _CreateRow(e)).ToArray();
            }

            return this;
        }

        /// <summary>
        ///     Builds the table rows and columns if not already built. If '<paramref name="rebuild"/>' is specified, then any already existing
        ///     rows and columns are removed first.
        /// </summary>
        /// <param name="rebuild">
        ///     (Optional) True to force a rebuild. If this is false then nothing will happen if rows and columns already exist.
        /// </param>
        /// <returns> An ITable&lt;TEntity&gt; </returns>
        public ITable<TEntity> BuildTable(bool rebuild = false)
        {
            BuildRows(rebuild);
            BuildColumns(rebuild);
            return this;
        }

        public override string ToString()
        {
            return TableTitle;
        }

        public override int GetHashCode()
        {
            return !string.IsNullOrEmpty(ID) ? ID.GetHashCode() : base.GetHashCode();
        }

        /// <summary>
        /// Returns true if the ID of this table matches a given ID, or the ID of a given table object.
        /// <para>Note: This will return true if the IDs are a match, regardless if the tables actually have different columns and rows.
        /// In this case, the tables are equal based on a trackable instance ID (across client and server sides), and not by content.</para>
        /// </summary>
        public override bool Equals(object obj)
        {
            return obj == (object)this || (obj is string && ((string)obj) == ID) || (obj is IVariantTable<object> && ((IVariantTable<object>)obj).ID == ID);
        }

        /// <summary>
        /// Applies changes to the specified context for this table. 
        /// Only the underlying entity context is updated, and not the data source.
        /// </summary>
        /// <param name="context">The context to update.</param>
        /// <param name="save">If true, then changes are saved to the database before returning.</param>
        /// <returns>The validation result on save if there are errors, otherwise an empty enumeration is returned.</returns>
        public ValidationResults ApplyChanges(DbContext context)
        {
            ClearValidations();

            foreach (var row in TableRows)
                row.ApplyChanges(context);

            return ValidationResult;
        }
        /// <summary>
        /// Applies changes to a new context for this table. 
        /// Only the underlying entity context is updated, and not the data source.
        /// </summary>
        /// <returns>The validation result on save if there are errors, otherwise an empty enumeration is returned.</returns>
        public ValidationResults ApplyChanges<TEntities>()
            where TEntities : DbContext, new()
        {
            return ApplyChanges(new TEntities());
        }

        /// <summary>
        /// Commit changes in this table to the underlying data source.  This also causes the current table to permanently update 
        /// the rows, such as removing rows marked for deletion, and merging entities between all other rows for the context.
        /// </summary>
        /// <param name="context">The context to update.</param>
        /// <param name="save">Even though all changes are permanent as far as this table is concerned, the database will not be
        /// affected until the context is saved - either by passing true here, or saving it later.</param>
        /// <returns>The result after applying changes.  If the result is not 'Valid', then no changes were committed to the 
        /// table (though the context itself may be changed).</returns>
        public ValidationResults Commit(DbContext context = null, bool save = true)
        {
            if (context == null)
                if (Context != null)
                    context = Context;
                else
                    throw new ArgumentNullException("Since this table is not associated with any specific underlying context, a value for 'context' is required.");

            if (ValidationResult == ValidationResults.Unknown)
                ApplyChanges(context);


            if (ValidationResult == ValidationResults.Valid)
            {
                foreach (var row in TableRows.ToArray())
                    row.Commit(context, false);

                if (save && context.ChangeTracker.HasChanges())
                    try
                    {
                        context.SaveChanges();
                    }
                    catch (Exception e)
                    {

                        _CommitError = e.ExceptionOf<DbException>().FirstOrDefault() ?? e;
                        _ValidationResult = ValidationResults.Errors;
                    }
            }

            return ValidationResult;
        }
        /// <summary>
        /// Commit changes in this table to the underlying data source.  This also causes the current table to permanently update
        /// the rows, such as removing rows marked for deletion, and merging entities between all other rows for the context.
        /// <para>This overload creates a new fresh copy of a database context object for applying changes to.  It is the safer
        /// way to commit changes without greater risk of conflicts due to states of existing objects in the graph; however, 
        /// if a context was previously used, it may be much faster, performance wise, to pass it into the overloaded version of
        /// this method.</para>
        /// </summary>
        /// <typeparam name="TEntities">A DbContext object to create for committing changes to.</typeparam>
        /// <param name="save">Even though all changes are permanent as far as this table is concerned, the database will not be
        /// affected until the context is saved - either by passing true here, or saving it later.</param>
        /// <returns>The result after applying changes.  If the result is not 'Valid', then no changes were committed to the 
        /// table (though the context itself may be changed).</returns>
        public ValidationResults Commit<TEntities>(bool save = true)
           where TEntities : DbContext, new()
        {
            return Commit(new TEntities(), save);
        }

        /// <summary>
        /// Clears a previous validation for all rows in this table.
        /// </summary>
        public void ClearValidations()
        {
            if (_ValidationResult != null)
            {
                foreach (var row in TableRows)
                    row.ClearValidations();
                _ValidationResult = null;
            }
        }

        // -----------------------------------------------------------------------------------------------------------------------------------
        // Variant Interface

        IVariantTableRow<TEntity> IVariantTable<TEntity>.AttachRow(IInternalTableRow row)
            => (IVariantTableRow<TEntity>)AttachRow(row);

        IVariantTableRow<TEntity> IVariantTable<TEntity>.DetachRow(IInternalTableRow row)
            => (IVariantTableRow<TEntity>)DetachRow(row);

        IVariantTableColumn<TEntity> IVariantTable<TEntity>.AttachColumn(IInternalTableColumn column)
            => (IVariantTableColumn<TEntity>)AttachColumn(column);

        IVariantTableColumn<TEntity> IVariantTable<TEntity>.AddColumn(string name, string title, int order)
            => (IVariantTableColumn<TEntity>)AddColumn(name, title, order);

        IVariantTable<TEntity> IVariantTable<TEntity>.SetColumnOrder(params string[] entityPropertyNames)
            => (IVariantTable<TEntity>)SetColumnOrder(entityPropertyNames);

        IVariantTable<TEntity> IVariantTable<TEntity>.SetExcludedColumns(params string[] entityPropertyNames)
            => (IVariantTable<TEntity>)SetExcludedColumns(entityPropertyNames);

        IVariantTable<TEntity> IVariantTable<TEntity>.SetIncludedColumns(params string[] entityPropertyNames)
            => (IVariantTable<TEntity>)SetIncludedColumns(entityPropertyNames);

        IVariantTableColumn<TEntity> IVariantTable<TEntity>.GetColumn(string clrName)
            => (IVariantTableColumn<TEntity>)GetColumn(clrName);

        IVariantTableColumn<TEntity> IVariantTable<TEntity>.GetColumn(int columnIndex)
            => (IVariantTableColumn<TEntity>)GetColumn(columnIndex);

        IVariantTableColumn<TEntity> IVariantTable<TEntity>.GetColumnByDBName(string dbName)
            => (IVariantTableColumn<TEntity>)GetColumnByDBName(dbName);

        IVariantTable<TEntity> IVariantTable<TEntity>.BuildColumns(bool rebuild)
            => (IVariantTable<TEntity>)BuildColumns(rebuild);

        IVariantTable<TEntity> IVariantTable<TEntity>.BuildRows(bool rebuild)
            => (IVariantTable<TEntity>)BuildRows(rebuild);

        IVariantTable<TEntity> IVariantTable<TEntity>.BuildTable(bool rebuild)
            => (IVariantTable<TEntity>)BuildTable(rebuild);

        IVariantTable<TEntity> IVariantTable<TEntity>.Requery()
            => (IVariantTable<TEntity>)Requery();

        IVariantTable<TEntity> IVariantTable<TEntity>.Configure(string tableTitle, string tableId, string[] keyNames, DbContext context)
            => (IVariantTable<TEntity>)Configure(tableTitle, tableId, keyNames, context);

        IVariantTable<TEntity> IVariantTable<TEntity>.Configure(string tableTitle, DbContext context, string tableID)
            => (IVariantTable<TEntity>)Configure(tableTitle, context, tableID);

        IVariantTable<TEntity> IVariantTable<TEntity>.Configure(string id, HttpRequest request, DbContext context)
            => (IVariantTable<TEntity>)Configure(id, request, context);

        // -----------------------------------------------------------------------------------------------------------------------------------
    }

    // TODO: Support JSON converters: http://www.dotnetcurry.com/aspnet-mvc/1368/aspnet-core-mvc-custom-model-binding (at bottom)
}
