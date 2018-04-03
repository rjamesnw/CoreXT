using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Reflection;
using CoreXT.Services.DI;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;
using Microsoft.EntityFrameworkCore;

namespace CoreXT.Entities
{
    public interface ITable<TEntity>: ITable where TEntity : class, new()
    {
        ITableRow<TEntity> this[ITableRow row] { get; }
        ITableRow<TEntity> this[long rowID] { get; }

        Func<ITableRow<TEntity>, Exception> AfterChangesApplied { get; set; }
        Func<ITableRow<TEntity>, Exception> BeforeChangesApplied { get; set; }
        List<string> ColumnOrder { get; }
        DbContext Context { get; }
        ITableColumn<TEntity>[] DisplayableColumns { get; }
        IEnumerable<ITableRow<TEntity>> DisplayableRows { get; }
        IEnumerable<TEntity> Entities { get; set; }
        string ErrorMessage { get; }
        string ID { get; set; }
        IEnumerable<ITableRow<TEntity>> InvalidRows { get; }
        ITableColumn<TEntity>[] KeyColumns { get; }
        IEnumerable<string> KeyNames { get; set; }
        IObjectModelValidator ModelValidator { get; }
        ITableColumn<TEntity>[] OrderedColumns { get; }
        IQueryable<TEntity> Query { get; set; }
        int RowCount { get; }
        ICoreXTServiceProvider ServiceProvider { get; set; }
        int Skip { get; set; }
        ITableColumn<TEntity>[] TableColumns { get; }
        ITableRow<TEntity>[] TableRows { get; }
        string TableTitle { get; set; }
        int Take { get; set; }
        ValidationResults ValidationResult { get; }

        ITableColumn<TEntity> AddColumn(string name, string title = null, int order = 0);
        IEnumerable<TEntity> AddEntities(IEnumerable<TEntity> entities);
        TEntity AddEntity(TEntity entity);
        ValidationResults ApplyChanges(DbContext context);
        ValidationResults ApplyChanges<TEntities>() where TEntities : DbContext, new();
        ITableColumn<TEntity> AttachColumn(IInternalTableColumn column);
        ITableRow<TEntity> AttachRow(IInternalTableRow row);
        ITable<TEntity> BuildColumns(bool rebuild = false);
        ITable<TEntity> BuildRows(bool rebuild = false);
        ITable<TEntity> BuildTable(bool rebuild = false);
        void ClearValidations();
        ValidationResults Commit(DbContext context = null, bool save = true);
        ValidationResults Commit<TEntities>(bool save = true) where TEntities : DbContext, new();
        ITable<TEntity> Configure(string tableTitle, string tableId = null, string[] keyNames = null, DbContext context = null);
        ITable<TEntity> Configure(string tableTitle, DbContext context, string tableID = null);
        ITable<TEntity> Configure(string id, HttpRequest request, DbContext context = null);
        TableRow<TEntity> CreateRow(TEntity entitiy = null);
        ITableRow<TEntity> DetachRow(IInternalTableRow row);
        bool Equals(object obj);
        ITableColumn<TEntity> GetColumn(int columnIndex);
        ITableColumn<TEntity> GetColumn(string clrName);
        ITableColumn<TEntity> GetColumnByDBName(string dbName);
        PropertyInfo[] GetCustomMetadataProperties(Type entityType = null);
        IEnumerable<TAttribute> GetCustomMetadataPropertyAttributes<TAttribute>(string propertyName, Type entityType = null) where TAttribute : Attribute;
        Type GetCustomMetadataType(Type entityType);
        PropertyInfo[] GetEntityPropertiesFromCache(Type type);
        PropertyInfo GetEntityPropertyFromCache(Type type, string name);
        int GetHashCode();
        void HideAllColumns();
        bool Load(HttpRequest request, string tableId = null);
        bool Load(HttpRequestMessage request, string tableID = null);
        TEntity RemoveEntity(TEntity e);
        ITable<TEntity> Requery();
        ITable<TEntity> SetColumnOrder(params string[] entityPropertyNames);
        ITable<TEntity> SetExcludedColumns(params string[] entityPropertyNames);
        ITable<TEntity> SetIncludedColumns(params string[] entityPropertyNames);
        void SetRowType<T>() where T : TableRow<TEntity>;
        string ToString();
        Dictionary<string, PropertyInfo> UpdateEntityPropertyCache(Type type);
    }
}