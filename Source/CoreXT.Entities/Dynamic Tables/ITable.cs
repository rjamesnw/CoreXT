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
        ITableColumn<TEntity>[] DisplayableColumns { get; }
        IEnumerable<ITableRow<TEntity>> DisplayableRows { get; }
        IEnumerable<TEntity> Entities { get; set; }
        IEnumerable<ITableRow<TEntity>> InvalidRows { get; }
        ITableColumn<TEntity>[] KeyColumns { get; }
        ITableColumn<TEntity>[] OrderedColumns { get; }
        IQueryable<TEntity> Query { get; set; }
        ITableColumn<TEntity>[] TableColumns { get; }
        ITableRow<TEntity>[] TableRows { get; }

        ITableColumn<TEntity> AddColumn(string name, string title = null, int order = 0);
        IEnumerable<TEntity> AddEntities(IEnumerable<TEntity> entities);
        TEntity AddEntity(TEntity entity);
        ITableColumn<TEntity> AttachColumn(ITableColumn column);
        ITableRow<TEntity> AttachRow(ITableRow row);
        ITable<TEntity> BuildColumns(bool rebuild = false);
        ITable<TEntity> BuildRows(bool rebuild = false);
        ITable<TEntity> BuildTable(bool rebuild = false);
        ITable<TEntity> Configure(string tableTitle, string tableId = null, string[] keyNames = null, DbContext context = null);
        ITable<TEntity> Configure(string tableTitle, DbContext context, string tableID = null);
        ITable<TEntity> Configure(string id, HttpRequest request, DbContext context = null);
        ITableRow<TEntity> CreateRow(TEntity entitiy = null);
        ITableRow<TEntity> DetachRow(ITableRow row);
        ITableColumn<TEntity> GetColumn(int columnIndex);
        ITableColumn<TEntity> GetColumn(string clrName);
        ITableColumn<TEntity> GetColumnByDBName(string dbName);
        TEntity RemoveEntity(TEntity e);
        ITable<TEntity> Requery();
        ITable<TEntity> SetColumnOrder(params string[] entityPropertyNames);
        ITable<TEntity> SetExcludedColumns(params string[] entityPropertyNames);
        ITable<TEntity> SetIncludedColumns(params string[] entityPropertyNames);
        void SetRowType<T>() where T : TableRow<TEntity>;
    }
}