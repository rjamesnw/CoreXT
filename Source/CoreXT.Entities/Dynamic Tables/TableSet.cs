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
    public class TableSet<TEntity>
        where TEntity : class, new()
    {
        public DbContext Context { get; private set; }

        Dictionary<string, ITable<TEntity>> _Tables = new Dictionary<string, ITable<TEntity>>();

        /// <summary>
        /// Returns the worst case validation across all tables.
        /// </summary>
        public ValidationResults ValidationResult { get { return (ValidationResults)(_ValidationResult ?? (_ValidationResult = (_CommitError != null ? ValidationResults.Errors : _Tables != null && _Tables.Values.Count > 0 ? _Tables.Values.Min(t => t.ValidationResult) : ValidationResults.Unknown))); } }
        ValidationResults? _ValidationResult;

        public string ErrorMessage { get { return _CommitError != null ? Exceptions.GetFullErrorMessage(_CommitError, false, false) : null; } }
        Exception _CommitError;

        /// <summary>
        /// Returns all erroneous tables after an attempt to apply underlying changes to a context.
        /// </summary>
        public IEnumerable<ITable<TEntity>> InvalidTables { get { return _Tables != null ? _Tables.Values.Where(t => t.ValidationResult == ValidationResults.Errors) : Enumerable.Empty<ITable<TEntity>>(); } }

        /// <summary>
        /// Creates a new table set, optionally associating it with a fixed context.
        /// </summary>
        public TableSet(DbContext context = null)
        {
            Context = context;
        }

        /// <summary>
        /// Creates a table set from TableEditor posts.
        /// </summary>
        public TableSet(HttpRequest request)
        {
            Load(request);
        }

        public ITable<TEntity> Add(ITable<TEntity> table)
        {
            if (table != null)
            {

                _Tables[table.ID] = table;
            }
            return table;
        }

        public ITable<TEntity> GetTable(string tableID)
        {
            return _Tables.Value(tableID);
        }

        /// <summary>
        /// Loads data from an HTTP request into the table set.
        /// Any missing rows are created (new additions), and any matching rows become updated.
        /// <para>Note: You can also pass the request to the constructor, which calls this method.</para>
        /// </summary>
        public TableSet<TEntity> Load(HttpRequest request)
        {
            ClearValidations();

            string[] tableIDs = request.Form.GetValues("Table.ID");

            if (tableIDs != null)
            {
                _Tables.Clear();

                foreach (var ID in tableIDs)
                {
                    var table = new Table<TEntity>(_Services).Configure(ID, request);
                    Add(table);
                }
            }

            return this;
        }

        /// <summary>
        /// Applies changes to all tables in this table set. 
        /// Only the underlying entity context is updated, and not the data source.
        /// </summary>
        /// <param name="context">The context to update.</param>
        /// <param name="save">If true, then changes are saved to the database before returning.</param>
        /// <returns>The validation result on save if there are errors, otherwise an empty enumeration is returned.</returns>
        public ValidationResults ApplyChanges(DbContext context)
        {
            ClearValidations();

            foreach (var table in _Tables.Values.ToArray())
                table.ApplyChanges(context);

            return ValidationResult;
        }
        /// <summary>
        /// Applies changes to all tables in this table set. 
        /// Only the underlying entity context is updated, and not the data source.
        /// </summary>
        /// <returns>The validation result on save if there are errors, otherwise an empty enumeration is returned.</returns>
        public ValidationResults ApplyChanges<TEntities>()
            where TEntities : DbContext, new()
        {
            return ApplyChanges(new TEntities());
        }

        /// <summary>
        /// Commit changes in this table set to the underlying data source.  This also causes all tables in the set to permanently update
        /// their rows, such as removing rows marked for deletion, and merging entities between all other rows for the context.
        /// </summary>
        /// <param name="context">The context to update.</param>
        /// <param name="save">Even though all changes are permanent as far as this table set is concerned, the database will not be
        /// affected until the context is saved - either by passing true here, or saving it later.</param>
        /// <returns>The result after applying changes.  If the result is not 'Valid', then no changes were committed to the
        /// table set (though the context itself may be changed).</returns>
        public ValidationResults Commit(DbContext context = null, bool save = true)
        {
            if (context == null)
                if (Context != null)
                    context = Context;
                else
                    throw new ArgumentNullException("Since this table set is not associated with any specific underlying context, a value for 'context' is required.");

            if (ValidationResult == ValidationResults.Unknown)
                ApplyChanges(context);

            if (ValidationResult == ValidationResults.Valid)
            {
                foreach (var table in _Tables.Values.ToArray())
                    table.Commit(context, false);

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
        /// Commit changes in this table to the underlying data source.  This causes the current table to permanently update the rows,
        /// such as removing rows marked for deletion, and merging entities between all other rows for the context.
        /// <para>This overload creates a new fresh copy of a database context object for applying changes to.  It is the safer
        /// way to commit changes without greater risk of conflicts due to states of existing objects in the graph; however, 
        /// if a context was previously used, it may be much faster, performance wise, to pass it into the overloaded version of
        /// this method.</para>
        /// </summary>
        /// <typeparam name="TEntities">A DbContext object to create for committing changes to.</typeparam>
        /// <param name="save">Even though all changes are permanent as far as this table set is concerned, the database will not be
        /// affected until the context is saved - either by passing true here, or saving it later.</param>
        /// <returns>The result after applying changes.  If the result is not 'Valid', then no changes were committed to the
        /// table set (though the context itself may be changed).</returns>
        public ValidationResults Commit<TEntities>(bool save = true)
           where TEntities : DbContext, new()
        {
            return Commit(new TEntities(), save);
        }

        /// <summary>
        /// Clears a previous validation for all tables in this table set.
        /// </summary>
        public void ClearValidations()
        {
            if (_ValidationResult != null)
            {
                foreach (var table in _Tables.Values)
                    table.ClearValidations();
                _ValidationResult = null;
            }
        }
    }
}
