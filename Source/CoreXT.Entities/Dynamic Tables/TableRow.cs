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

    /// <summary>
    /// Used internally to work with the table rows.
    /// </summary>
    public interface IInternalTableRow
    {
        ITable<object> Table { get; set; }
        Int64 ID { get; set; }
        bool Deleted { get; set; }
        bool New { get; set; }
        bool HasValidEntityKey { get; }
    }

    public interface ITableRow
    {
        TableRow<T> AsTableRow<T>() where T : class, new();
        ITable<object> Table { get; }
        Int64 ID { get; }
        Type EntityType { get; }
        bool HasValidEntityKey { get; }
        bool Deleted { get; }
        bool New { get; }
        Dictionary<string, Exception> LoadErrors { get; }
        TableRowValidationResult EntityValidationResult { get; }
        ValidationResults ValidationResult { get; }
        string ErrorMessage { get; }
        bool Load(IDictionary<string, string[]> requestProperties, Int64 rowIndex);
        object GetValue(ITableColumn<object> col);
        object GetValue(string propertyName);
        string GetDisplayText(ITableColumn<object> col);
        string GetDisplayText(string propertyName);
        T GetValue<T>(ITableColumn<object> col);
        T GetValue<T>(string propertyName);
        Exception SetValue(string propertyName, object value, bool compareWithExistingValue = true);
        Exception SetValue(ITableColumn<object> col, object value, bool compareWithExistingValue = true);
        ValidationResults ApplyChanges(DbContext context);
        ValidationResults ApplyChanges<TEntities>()
           where TEntities : DbContext, new();
        ValidationResults Commit(DbContext context = null, bool save = true);
        ValidationResults Commit<TEntities>(bool save = true)
           where TEntities : DbContext, new();
        void ClearValidations();
    }

    public interface ITableRow<out TEntity> : ITableRow
        where TEntity : class, new()
    {
        new ITable<TEntity> Table { get; }
        TEntity Entity { get; }
    }

    public enum ValidationResults
    {
        /// <summary>
        /// One or more entities failed validation.
        /// </summary>
        Errors = -1,
        /// <summary>
        /// Validation not yet performed.
        /// </summary>
        Unknown = 0,
        /// <summary>
        /// One or more entities passed validation.
        /// </summary>
        Valid = 1
    }

    public class RowColumnValueLoadException : Exception
    {
        public string PropertyName;
        public string Value;
        public RowColumnValueLoadException(string propertyName, string value, string message) : base(message)
        {
            PropertyName = propertyName;
            Value = value;
        }
        public RowColumnValueLoadException(string propertyName, string value, string message, Exception ex) : base(message, ex)
        {
            PropertyName = propertyName;
            Value = value;
        }
    }

    public class TableRow<TEntity> : ITableRow<TEntity>, IInternalTableRow where TEntity : class, new()
    {
        TableRow<T> ITableRow.AsTableRow<T>() { return (TableRow<T>)(ITableRow<TEntity>)this; }

        public ITable<TEntity> Table { get; set; }
        ITable<object> ITableRow.Table { get { return Table; } }
        ITable<object> IInternalTableRow.Table { get { return Table; } set { Table = (ITable<TEntity>)value; } }

        public Int64 ID { get; set; }

        public TEntity Entity { get { return _Entity; } internal set { _Entity = value; _EntityType = null; } }
        TEntity _Entity;

        public Type EntityType { get { return _EntityType ?? (_EntityType = (Entity != null ? Entity.GetType() : typeof(TEntity))); } }
        Type _EntityType;

        /// <summary>
        /// True if this row is to be deleted.
        /// </summary>
        public bool Deleted { get; set; }

        /// <summary>
        /// True if this row is to be added.
        /// </summary>
        public bool New { get; set; }

        /// <summary>
        /// This is set if there are any errors while loading row data posted from the client side.
        /// The key index is an entity property name. The empty "" key holds the general row error message, if any.
        /// </summary>
        public Dictionary<string, Exception> LoadErrors { get; private set; }

        public TableRowValidationResult EntityValidationResult { get; private set; }

        public ValidationResults ValidationResult
        {
            get { return Deleted ? ValidationResults.Valid : LoadErrors != null || _CommitError != null ? ValidationResults.Errors : EntityValidationResult == null ? ValidationResults.Unknown : EntityValidationResult.IsValid ? ValidationResults.Valid : ValidationResults.Errors; }
        }

        public string ErrorMessage
        {
            get { return _CommitError != null ? Exceptions.GetFullErrorMessage(_CommitError, false, false) : LoadErrors != null ? "Row errors: " + LoadErrors.Count : null; }
        }
        Exception _CommitError;

        /// <summary>
        /// Returns a list of properties that have been updated - usually after calling 'Apply()' with post-back form data.
        /// This only applies if loading a row from posted data into row with existing data.
        /// </summary>
        public IEnumerable<string> Changed { get { return _Changed == null ? Enumerable.Empty<string>() : from c in _Changed where c.Value select c.Key; } }
        Dictionary<string, bool> _Changed; // TODO: Is this really needed? //?

        public TableRow(ITable<TEntity> table, TEntity entity = null)
        {
            Table = table;
            if (entity == null)
                entity = new TEntity();
            Entity = entity;
            ID = Table<TEntity>.NextRowID;
        }

        public TableRow(ITable<TEntity> table, Int64 rowIndex, IDictionary<string, string[]> requestProperties)
        {
            Table = table;
            Load(requestProperties, rowIndex);
        }

        public bool IsAttached { get { return Table[this] != null; } }

        public Exception SetValue(string propertyName, object value, bool compareWithExistingValue = true)
        {
            var propInfo = Table.GetEntityPropertyFromCache(EntityType, propertyName);

            if (!propInfo.CanWrite) return new InvalidOperationException("Property '" + propertyName + "' is readonly.");

            if (propInfo != null)
            {
                try
                {
                    value = Types.ChangeType(value, propInfo.PropertyType);
                }
                catch (Exception ex)
                {
                    // ... failed to convert the value ...
                    Type expectedType = Nullable.GetUnderlyingType(propInfo.PropertyType) ?? propInfo.PropertyType;

                    var msg = "";

                    if (Utilities.IsDateTime(expectedType))
                        msg = "A valid date/time value is expected.";
                    else if (Utilities.IsInt(expectedType))
                        msg = "A valid integer value is expected.";
                    else if (Utilities.IsUInt(expectedType))
                        msg = "A valid positive integer value is expected.";
                    else if (Utilities.IsNumeric(expectedType))
                        msg = "A valid numerical value is expected.";
                    else if (Utilities.IsString(expectedType))
                        msg = "A valid text value is expected.";
                    else if (Utilities.IsBoolean(expectedType))
                        msg = "A valid yes/no (true or false) value is expected.";
                    else
                        msg = "Invalid value.";

                    return new RowColumnValueLoadException(propertyName, value.ND(), msg, ex);
                }

                if (compareWithExistingValue)
                {
                    var existingValue = propInfo.GetValue(Entity, null);
                    if (_Changed == null)
                        _Changed = new Dictionary<string, bool>();
                    _Changed[propertyName] = existingValue != null && !existingValue.Equals(value) || value != null && !value.Equals(existingValue);
                }

                propInfo.SetValue(Entity, value, null);

                return null;
            }

            return new InvalidOperationException("Entity contains no property named '" + propertyName + "'.");
        }
        public Exception SetValue(ITableColumn<object> col, object value, bool compareWithExistingValue = true)
        {
            return SetValue(col?.PropertyName, value, compareWithExistingValue);
        }

        /// <summary>
        /// Sets the entity with the given values.
        /// </summary>
        /// <param name="properties"></param>
        public Exception[] SetValues<T>(IDictionary<string, T> properties)
        {
            List<Exception> errors = new List<Exception>();

            foreach (var item in properties)
            {
                var error = SetValue(item.Key, item.Value);
                if (error != null)
                    errors.Add(error);
            }

            return errors.ToArray();
        }

        /// <summary>
        /// Loads data from posted HTTP request form data into this table row.
        /// <para>Note: After loading from a form post (via 'Load()'), the 'Entity' property references a temporary object until 'Commit() is called.'.</para>
        /// </summary>
        /// <param name="request">An HTTPRequestBase object that contains the form data.</param>
        /// <param name="rowIndex">The ordinal index of a specific table row to load.  Note: This is NOT an entity ID, nor the row's ID. 
        /// This is a row-ordered index that applies to this row within the context of the table sent to the client side.</param>
        /// <returns>'true' if data was loaded for this row.</returns>
        public bool Load(IDictionary<string, string[]> requestProperties, Int64 rowIndex)
        {
            ClearValidations();

            var rowPrefix = "Table." + Table.ID + "." + rowIndex + ".";
            var entityPrefix = rowPrefix + "Entity.";
            var reqProps = requestProperties;

            Int64 _id;
            var rowIDStr = reqProps.Value(rowPrefix + "RowID")?.FirstOrDefault();
            if (!Int64.TryParse(rowIDStr, out _id))
                throw new InvalidOperationException("Table " + Table.ID + ": Cannot convert posted row ID '" + rowIDStr + "' to an Int64 value.");

            var attached = IsAttached;
            ID = _id;

            Table.UpdateEntityPropertyCache(EntityType);

            var valueKeys = (from k in reqProps.Keys where k.StartsWith(entityPrefix) select k).ToArray();

            if (valueKeys.Length == 0)
                return false; // (no form keys exist for this row)

            ID = _id;

            Deleted = Utilities.ND(reqProps.Value(rowPrefix + "Deleted")?.FirstOrDefault(), false);
            New = Utilities.ND(reqProps.Value(rowPrefix + "New")?.FirstOrDefault(), false);

            _Changed = new Dictionary<string, bool>();

            var entityExists = (Entity != null);
            if (!entityExists)
                Entity = new TEntity();

            object postedValue = null;

            Dictionary<string, Exception> errors = new Dictionary<string, Exception>();

            // ... first, get the key ID and pull the existing entity from the context ...
            // TODO: This is a quick fix - need to support composite keys? ...

            if (Table.Context != null)
            {
                var entitySet = Table.Context.Set<TEntity>();
                List<object> keyValues = new List<object>();

                var foundValidValue = false;

                foreach (var key in Table.KeyNames)
                {
                    var keyPostID = entityPrefix + key;
                    var propInfo = Table.GetEntityPropertyFromCache(EntityType, key);
                    if (propInfo != null)
                    {
                        try
                        {
                            postedValue = Types.ChangeType(reqProps.Value(keyPostID)?.FirstOrDefault(), propInfo.PropertyType);
                            keyValues.Add(postedValue);
                            if (postedValue is string && string.IsNullOrWhiteSpace((string)postedValue)
                                || postedValue is DateTime && (DateTime)postedValue == DateTime.MinValue
                                || postedValue != null && Utilities.IsNumeric(postedValue.GetType()) && postedValue.ToString() != "0"
                                || postedValue != null && postedValue.GetType().IsClass)
                                foundValidValue = true;
                        }
                        catch (Exception ex)
                        {
                            errors[null] = new RowColumnValueLoadException(key, reqProps.Value(keyPostID)?.FirstOrDefault(), "Invalid key value.", ex);
                        }
                    }
                }

                if (foundValidValue && keyValues.Count > 0) // (while keys might be added, 'foundValidValue' is true only if one of the key values is not a default value [i.e. null/0/DateTime.MinValue] for new records)
                {
                    var dbEntity = (TEntity)entitySet.Find(keyValues.ToArray()); // (make sure the entity doesn't exist first; note: when adding entities with ID==0, the next call to 'Find' with ID==0 will pull the last entity added, which would cause issues)

                    if (dbEntity != null)
                        Entity = dbEntity;
                    else
                    {
                        ((Table<TEntity>)Table)._LoadError = new InvalidOperationException("Invalid key value for row with key values '" + string.Join(",", keyValues) + "'.");
                        return false;
                    }
                }
            }

            foreach (var key in valueKeys)
            {
                var parts = key.Split('.'); // Table.{ID}.{RowID}.Entity.{EntityPropertyName}
                if (parts.Length == 5)
                {
                    var propName = parts[4];

                    var col = Table.GetColumn(propName);
                    if (col?.IsCalculated ?? true) continue; // (ignore incoming values for calculated columns)

                    if (Table.KeyNames.Contains(propName)) continue; // (skip key columns, since if they exist, we should already have pulled the existing entity!)

                    var postedValueStr = reqProps.Value(key)?.FirstOrDefault();

                    var result = SetValue(propName, postedValueStr, entityExists); // (if 'entityExists' is false, then this is a brand new instance, so don't compare values)

                    if (result != null)
                        errors[propName] = result;
                }
            }

            if (errors.Count > 0)
                LoadErrors = errors;

            return true;
        }

        public object GetValue(string propertyName)
        {
            var col = Table.GetColumn(propertyName);
            if (col == null)
                throw new InvalidOperationException("There is no column named '" + propertyName + "' for table '" + Table.TableTitle + "'.");
            return GetValue(col);
        }
        public object GetValue(ITableColumn<object> col)
        {
            return col.GetValue(this);
        }

        public T GetValue<T>(ITableColumn<object> col)
        {
            return col.GetValue<T>(this);
        }

        public T GetValue<T>(string propertyName)
        {
            return Types.ChangeType<T>(GetValue(propertyName));
        }

        public string GetDisplayText(string propertyName)
        {
            var col = Table.GetColumn(propertyName);
            if (col == null)
                throw new InvalidOperationException("There is no column named '" + propertyName + "' for table '" + Table.TableTitle + "'.");
            return GetDisplayText(col);
        }
        public string GetDisplayText(ITableColumn<object> col)
        {
            var value = GetValue(col);
            string displayText = "";

            if (value != null)
                if (col.Selections != null && col.Selections.Any())
                {
                    displayText = Convert.ToString((col.Selections != null && col.Selections.Any()) ? col.Selections.Where(s => s.Value == Convert.ToString(value)).Select(s => s.Text).FirstOrDefault() ?? value : value);
                }
                else
                {
                    if (value.GetType() == typeof(DateTime) && ((DateTime)value).TimeOfDay.TotalMilliseconds == 0)
                    {
                        displayText = ((DateTime)value).ToString("yyyy-MM-dd");
                    }
                    else if (value.GetType() == typeof(bool))
                    {
                        displayText = (bool)value ? "Yes" : "No";
                    }
                    else if (Utilities.IsFloat(value.GetType()))
                    {
                        displayText = Convert.ToDecimal(value).ToString("N1");
                    }
                    else displayText = Convert.ToString(value);
                }

            return displayText ?? "";
        }

        /// <summary>
        /// Returns the values of the key columns using the order as specified in each column's 'Order' property.
        /// <para>
        /// For this to return valid values, the key names to be properly set in the table by either manually setting
        /// '{Table}.KeyNames', creating the parent table using an explicit DbContext, or adorning entities with metadata Key
        /// attributes in the correct order.
        /// </para>
        /// </summary>
        public object[] GetKeyValues()
        {
            if (Table.KeyColumns.Count() == 0)
                throw new InvalidOperationException("The underlying table does not have any key columns.  Make sure to build the table after adding entities.");
            return (from c in Table.KeyColumns orderby c.Order select c.GetValue(this)).ToArray();
        }

        /// <summary>
        /// Assuming that key columns for the underlying entity are either null or 0 for new records, this returns false if
        /// either case is found in any key value.  If all key values pass this validation, true is returned.
        /// <para>Note: The 'New' property must be set to flag adding new rows for entities not found.  Row additions are
        /// not assumed based on null or 0 key values.</para>
        /// </summary>
        public bool HasValidEntityKey { get { return (from v in GetKeyValues() where Utilities.ND(v, (Int64)0) == 0 select v).Count() == 0; } }

        /// <summary>
        /// Locates and returns an entity in the context with the same key as the underlying entity without loading the entity
        /// from the data store if it is not found.
        /// <para>
        /// For this to work, the key names have to be properly set in the table by either manually setting '{Table}.KeyNames',
        /// creating the parent table using an explicit DbContext, or adorning entities with metadata Key attributes in the
        /// correct order.
        /// </para>
        /// </summary>
        public TEntity FindInContext(DbContext context)
        {
            var localEntities = context.Set<TEntity>().Local;
            if (!localEntities.Any()) return null; // (set is empty)
            var keys = Table.KeyColumns.ToArray();
            foreach (var localEntity in localEntities)
            {
                var match = true;
                for (var ki = 0; ki < keys.Length; ++ki)
                {
                    var prop = Table.GetEntityPropertyFromCache(EntityType, keys[ki].PropertyName);
                    if (!object.Equals(prop.GetValue(localEntity, null), prop.GetValue(Entity, null)))
                    {
                        match = false;
                        break;
                    }
                }
                if (match) return localEntity;
            }
            return null;
        }

        public ValidationResults Validate(ActionContext actionContext)
        {
            Table.ModelValidator.Validate(actionContext, null, string.Empty, _Entity);
            if (actionContext.ModelState.IsValid)
                EntityValidationResult = null;
            else
                EntityValidationResult = new TableRowValidationResult(Table.Context.Entry(_Entity), actionContext.ModelState.Select(m => new ModelValidationError(m.Key, m.Value.Errors)));
            return ValidationResult;
        }

        /// <summary>
        /// Applies changes to the specified context for this table row.
        /// Only the underlying entity context is updated, and not the data source.
        /// <para>Note: After loading from a form post (via 'Load()'), the 'Entity' property references a temporary object until 'Commit() is called.'.</para>
        /// </summary>
        /// <param name="context">The context to update.</param>
        /// <returns>The validation result on save if there are errors, otherwise an empty enumeration is returned.</returns>
        public ValidationResults ApplyChanges(DbContext context) // TODO: Call 'GetKeyValues()' for each row and preload the entities to be updated (NOT deleted) using a single query.
        {
            var table = Table as Table<TEntity>;

            ClearValidations();

            var entitySet = context.Set<TEntity>();

            if (table?.BeforeChangesApplied != null)
            {
                var error = table.BeforeChangesApplied(this);
                if (error != null) { LoadErrors[""] = error; return ValidationResults.Errors; }
            }

            if (Deleted)
            {
                if (HasValidEntityKey)
                {
                    var entity = FindInContext(context) ?? Entity; // (Note: 'FindInContext()' searches without triggering entity loading from the data store [which is not required for deleting])
                    var entry = context.Entry(entity);
                    entry.State = EntityState.Deleted;
                    //EntityValidationResult = Table.ModelValidator.Validate(;
                }
            }
            else
            {
                var dbEntity = HasValidEntityKey ? (TEntity)entitySet.Find(GetKeyValues()) : null; // (make sure the entity doesn't exist first; note: when adding entities with ID==0, the next call to 'Find' with ID==0 will pull the last entity added, which would cause issues)

                if (dbEntity != null)
                {
                    var entry = context.Entry(dbEntity);
                    entry.CurrentValues.SetValues(Entity);
                    //EntityValidationResult = entry.GetValidationResult();
                }
                else if (New) // (entity not found, but as a precaution, the new flag MUST be set to confirm new entries - may be better than relying on unknown key columns)
                {
                    entitySet.Add(Entity); // (warning: Entity may have ID==0, so don't use '{DbSet}.Find()' to check existence before changes are sent to the database)
                    //EntityValidationResult = context.Entry(Entity).GetValidationResult();
                }
                else
                    throw new InvalidOperationException("The row '" + ID + "' is not marked as new, but could not find entity to update with key '" + string.Join(",", GetKeyValues()) + "'.");

                // ... validate based on custom column validation handler if present ...

                foreach (TableColumn<TEntity> col in Table.TableColumns)
                    if (col.ValidationHandler != null)
                    {
                        var result = col.ValidationHandler(this, col);
                        if (result != null)
                        {
                            if (LoadErrors == null)
                                LoadErrors = new Dictionary<string, Exception>();
                            LoadErrors[col.PropertyName] = new RowColumnValueLoadException(col.PropertyName, (string)GetValue(col), result);
                        }
                    }
            }

            if (table?.AfterChangesApplied != null)
            {
                var error = table.AfterChangesApplied(this);
                if (error != null) { LoadErrors[""] = error; return ValidationResults.Errors; }
            }

            return ValidationResult;
        }
        /// <summary>
        /// Applies changes to a new context for this table row. 
        /// Only the underlying entity context is updated, and not the data source.
        /// </summary>
        /// <returns>The validation result on save if there are errors, otherwise an empty enumeration is returned.</returns>
        public ValidationResults ApplyChanges<TEntities>()
           where TEntities : DbContext, new()
        {
            return ApplyChanges(new TEntities());
        }

        /// <summary>
        /// Commit changes in this row to the underlying data source.  This causes the current row to merge the local entity reference
        /// with any matching entity in the given context, and replaces the local entity reference with the merged entity.
        /// </summary>
        /// <param name="context">The context to update.</param>
        /// <param name="save">Even though all changes are permanent as far as this row is concerned, the database will not be
        /// affected until the context is saved - either by passing true here, or saving it later.</param>
        /// <returns>The result after applying changes.  If the result is not 'Valid', then no changes were committed to the row
        /// (though the context itself may be changed).</returns>
        public ValidationResults Commit(DbContext context = null, bool save = true)
        {
            if (context == null)
                if (Table != null && Table.Context != null)
                    context = Table.Context;
                else
                    throw new ArgumentNullException("Since this row is not in a table with any specific underlying context, a value for 'context' is required.");

            if (ValidationResult == ValidationResults.Unknown)
                ApplyChanges(context);

            if (HasValidEntityKey)
                Entity = FindInContext(context) ?? Entity; // (switch entity to the one in the context)
            // (else the current entity will be added, and a new key provided)

            if (ValidationResult == ValidationResults.Valid)
            {
                if (save && context.ChangeTracker.HasChanges())
                    try
                    {
                        context.SaveChanges();
                    }
                    catch (Exception e)
                    {
                        _CommitError = e.ExceptionOf<DbException>().FirstOrDefault() ?? e;
                    }

                if (Deleted)
                {
                    if (Table != null)
                        Table.DetachRow(this);
                    // (note: since the row is now detached, the 'Deleted' flag will remain)
                }
                else
                    New = false; // (non-deleted new rows should now be saved)
            }

            return ValidationResult;
        }
        /// <summary>
        /// Commit changes in this row to the underlying data source.  This causes the current row to merge the local entity reference
        /// with any matching entity in the given context, and replaces the local entity reference with the merged entity.
        /// <para>This overload creates a new fresh copy of a database context object for applying changes to.  It is the safer
        /// way to commit changes without greater risk of conflicts due to states of existing objects in the graph; however, 
        /// if a context was previously used, it may be much faster, performance wise, to pass it into the overloaded version of
        /// this method.</para>
        /// </summary>
        /// <typeparam name="TEntities">A DbContext object to create for committing changes to.</typeparam>
        /// <param name="save">Even though all changes are permanent as far as this row is concerned, the database will not be
        /// affected until the context is saved - either by passing true here, or saving it later.</param>
        /// <returns>The result after applying changes.  If the result is not 'Valid', then no changes were committed to the row
        /// (though the context itself may be changed).</returns>
        public ValidationResults Commit<TEntities>(bool save = true)
          where TEntities : DbContext, new()
        {
            return Commit(new TEntities(), save);
        }

        /// <summary>
        /// Clears a previous validation for this row.
        /// </summary>
        public void ClearValidations()
        {
            EntityValidationResult = null;
        }
    }
}
