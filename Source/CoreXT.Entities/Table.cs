using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Reflection;
using System.ComponentModel;
using System.Net.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc.Rendering;
using System.Data.Common;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using CoreXT.ASPNet;
using CoreXT.Validation;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using CoreXT.Services.DI;
using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;

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

    /// <summary>
    /// Used internally to work with the table columns.
    /// </summary>
    public interface IInternalTableColumn
    {
        ITable<object> Table { get; set; }
        string PropertyName { get; }
        string DBName { get; }
        Int64 Order { get; set; }
    }

    public interface ITableColumn
    {
        TableColumn<T> AsTableColumn<T>() where T : class, new();
        string PropertyName { get; }
        string DBName { get; }
        Int64 Order { get; set; }
        string Title { get; set; }
        string Description { get; set; }
        bool IsKey { get; }
        int? MaxLength { get; }
        bool? Nullable { get; }
        bool IsRequired { get; }
        string Prompt { get; set; }
        bool Hidden { get; set; }
        ITableColumn Unhide();
        bool IsCalculated { get; }
        //TableColumn<object>.TableColumnValueHandler ValueHandler { get; set; }
        IEnumerable<SelectListItem> Selections { get; set; }
        Type DataType { get; }
        object GetValue(ITableRow<object> row);
        T GetValue<T>(ITableRow<object> row);
    }

    public interface ITableColumn<out TEntity> : ITableColumn
        where TEntity : class, new()
    {
        ITable<TEntity> Table { get; }
    }

    //public delegate object TableColumnValueHandler(ITableRow row, ITableColumn column);

    public class TableColumn<TEntity> : ITableColumn<TEntity>, ITableColumn, IInternalTableColumn where TEntity : class, new()
    {
        public delegate object TableColumnValueHandler(ITableRow<TEntity> row, ITableColumn<TEntity> column);
        public delegate string TableColumnValidationHandler(ITableRow<TEntity> row, ITableColumn<TEntity> column);

        TableColumn<T> ITableColumn.AsTableColumn<T>() { return (TableColumn<T>)(ITableColumn<TEntity>)this; }

        public ITable<TEntity> Table { get; private set; }
        ITable<object> IInternalTableColumn.Table { get { return Table; } set { Table = (ITable<TEntity>)value; } }

        public string PropertyName { get; private set; }
        public string DBName { get; private set; }
        public Int64 Order { get; set; }
        /// <summary>
        /// The column title to display on the UI.
        /// </summary>
        public string Title { get; set; }
        /// <summary>
        /// Used for showing help details or tips for columns.
        /// </summary>
        public string Description { get; set; }
        public bool IsKey { get; private set; }
        public int? MaxLength { get; private set; }
        public bool? Nullable { get; private set; }

        public bool IsRequired { get { return !IsCalculated && !(Nullable ?? false); } }

        /// <summary>
        /// Watermark help text used for some prompts.
        /// </summary>
        public string Prompt { get; set; }

        public bool Hidden { get; set; }
        public ITableColumn Unhide() { Hidden = false; return this; }

        /// <summary>
        /// A message to display if a required value is not supplied.
        /// </summary>
        public string RequiredMessage { get; set; }

        /// <summary>
        /// Set to true if this column is a calculated column.  Changing cells on a row causes these to update automatically.
        /// Make sure to set a handler for 'TableColumnValueHandler' for calculating the values.
        /// </summary>
        public bool IsCalculated { get; set; }

        /// <summary>
        /// Allows overriding a row's column value to return a custom value (such as 'M'/'F' to 'Male'/'Female', 'Y'/'N' to 'Yes'/'No', etc).
        /// <para><!--If 'IsCalculated' is true, any row values for this column are always ignored, and a handler 
        /// is expected. In this case, if not set, null is assumed. An example might be a person's age, based
        /// on their birth date.-->When this is set, it bypasses reading the property on the entity.
        /// Return the value 'DBNull.Value' to fall back to the property value if needed.</para>
        /// </summary>
        public TableColumnValueHandler ValueHandler { get; set; }

        /// <summary>
        /// If set, is called to validate the current value when changes are applied to the underlying entities.
        /// </summary>
        public TableColumnValidationHandler ValidationHandler { get; set; }

        /// <summary>
        /// A list of selections for this column.  If present, the UI will show a dropdown.
        /// </summary>
        public IEnumerable<SelectListItem> Selections { get; set; }

        /// <summary>
        /// Returns the type of data for this column based on entity data stored in the parent table.
        /// For dynamic/calculated columns, this should be set to a proper type (default is object).
        /// </summary>
        public Type DataType
        {
            get { return _DataType ?? Table.GetEntityPropertyFromCache(typeof(TEntity), PropertyName)?.PropertyType ?? (_DataType = typeof(object)); }
            set { _DataType = value; }
        }
        Type _DataType;

        public TableColumn(ITable<TEntity> table, string propertyName, string dbName, string title = null, Int64? order = null, int? maxLength = null, bool? nullable = null, bool isKey = false, string requiredMsg = null)
        {
            Table = table;
            PropertyName = propertyName;
            DBName = dbName;
            Title = title ?? DBName;
            Order = order ?? Int64.MaxValue;
            IsKey = isKey;
            MaxLength = maxLength;
            RequiredMessage = requiredMsg;
            Nullable = nullable ?? (requiredMsg != null ? true : (bool?)null);
        }

        /// <summary>
        /// Returns a value for this column when given a row.
        /// </summary>
        public object GetValue(ITableRow<object> row) //(note: this method is the master method for getting values, due to calculated columns that may not be on the entity object)
        {
            var result = ValueHandler != null ? ValueHandler((ITableRow<TEntity>)row, this) : DBNull.Value;
            //? /*Entity.Property{get} can also be used for a value handler!*/ if (IsCalculated) return result; // (always return this if this is a calculated-only column)
            if (result != DBNull.Value) return result; // (user can override entity values, such as might be required for translations)
            var property = Table.GetEntityPropertyFromCache(row.EntityType, PropertyName);
            return property?.GetValue(row.Entity, null); // (if no user handler exists [override/filter], or it's return is null, get the value from the row)
        }
        public T GetValue<T>(ITableRow<object> row)
        {
            return Types.ChangeType<T>(GetValue(row));
        }

        public override string ToString() { return this.Title + " (" + this.DBName + ")"; }
        public override int GetHashCode() { return base.GetHashCode(); }
        public override bool Equals(object obj) { return obj != null && (obj is string && string.Compare(((string)obj), DBName, true) == 0 || obj is TableColumn<object> && string.Compare(((TableColumn<object>)obj).DBName, DBName, true) == 0 || string.Compare(obj.ToString(), DBName, true) == 0); }

        public static TableColumn<TEntity> FromProperty(ITable<TEntity> table, PropertyInfo colProp, Int64? order = null, bool? isKey = null, int? maxLength = null, string requiredMessage = null)
        {
            // ... extract any attribute annotation details ...

            var displayAttr = table.GetCustomMetadataPropertyAttributes<DisplayAttribute>(colProp.Name, colProp.DeclaringType).FirstOrDefault();
            var columnAttr = table.GetCustomMetadataPropertyAttributes<ColumnAttribute>(colProp.Name, colProp.DeclaringType).FirstOrDefault();
            var maxLenAttr = table.GetCustomMetadataPropertyAttributes<MaxLengthAttribute>(colProp.Name, colProp.DeclaringType).FirstOrDefault();
            var requiredAttr = table.GetCustomMetadataPropertyAttributes<RequiredAttribute>(colProp.Name, colProp.DeclaringType).FirstOrDefault();
            var keyAttr = table.GetCustomMetadataPropertyAttributes<KeyAttribute>(colProp.Name, colProp.DeclaringType).FirstOrDefault();
            var readonlyAttr = table.GetCustomMetadataPropertyAttributes<ReadOnlyAttribute>(colProp.Name, colProp.DeclaringType).FirstOrDefault();
            var hiddenAttr = table.GetCustomMetadataPropertyAttributes<NotMappedAttribute>(colProp.Name, colProp.DeclaringType).FirstOrDefault();

            string dbName = columnAttr != null ? columnAttr.Name : null;
            string title = displayAttr != null ? displayAttr.Name : colProp.Name;
            string desc = displayAttr != null ? displayAttr.Description : null;
            string prompt = displayAttr != null ? displayAttr.Prompt : null;
            order = order ?? (displayAttr != null ? displayAttr.Order : columnAttr != null ? columnAttr.Order : order);
            int? maxLen = maxLenAttr != null ? maxLenAttr.Length : maxLength;
            isKey = isKey ?? (keyAttr != null || table.KeyNames.Contains(colProp.Name));
            string requiredMsg = requiredAttr != null ? requiredAttr.ErrorMessage : requiredMessage;
            bool? nullable = requiredMsg != null;
            bool hidden = hiddenAttr != null;

            return new TableColumn<TEntity>(table, colProp.Name, dbName, title, order, maxLen, nullable, isKey ?? false, requiredMsg)
            {
                Description = desc,
                Prompt = prompt,
                IsCalculated = !colProp.CanWrite || (colProp.SetMethod?.Attributes.HasFlag(MethodAttributes.Private) ?? false) || (readonlyAttr?.IsReadOnly ?? false),
                Hidden = hidden
            };
        }

        public static TableColumn<TEntity> FromMetadataProperty(ITable<TEntity> table, Property prop)
        {
            // ... extract any attribute annotation details from the underlying entity type, if available ...

            var displayAttr = table.GetCustomMetadataPropertyAttributes<DisplayAttribute>(prop.Name, typeof(TEntity)).FirstOrDefault();
            var columnAttr = table.GetCustomMetadataPropertyAttributes<ColumnAttribute>(prop.Name, typeof(TEntity)).FirstOrDefault();
            var maxLenAttr = table.GetCustomMetadataPropertyAttributes<MaxLengthAttribute>(prop.Name, typeof(TEntity)).FirstOrDefault();
            var requiredAttr = table.GetCustomMetadataPropertyAttributes<RequiredAttribute>(prop.Name, typeof(TEntity)).FirstOrDefault();
            var keyAttr = table.GetCustomMetadataPropertyAttributes<KeyAttribute>(prop.Name, typeof(TEntity)).FirstOrDefault();
            var readonlyAttr = table.GetCustomMetadataPropertyAttributes<ReadOnlyAttribute>(prop.Name, typeof(TEntity)).FirstOrDefault();
            var hiddenAttr = table.GetCustomMetadataPropertyAttributes<NotMappedAttribute>(prop.Name, typeof(TEntity)).FirstOrDefault();

            string dbName = columnAttr != null ? columnAttr.Name : null;
            string title = displayAttr != null ? displayAttr.Name : prop.Name;
            string desc = displayAttr != null ? displayAttr.Description : null;
            string prompt = displayAttr != null ? displayAttr.Prompt : null;
            int? order = displayAttr != null ? displayAttr.Order : columnAttr != null ? columnAttr.Order : table.ColumnOrder.IndexOf(prop.Name);
            if (order < 0) order = null;
            int? maxLen = maxLenAttr != null ? maxLenAttr.Length : prop.GetMaxLength();
            bool isKey = keyAttr != null || prop.IsKey(); // (Note: Casting the declaring type and checking the key members is how the inaccessible internal '{EdmProperty}.IsKeyMember' property works)
            string requiredMsg = requiredAttr != null ? requiredAttr.ErrorMessage : null;
            bool nullable = prop.IsNullable;
            bool hidden = hiddenAttr != null;

            return new TableColumn<TEntity>(table, prop.Name, dbName, title, order, maxLen, nullable, isKey, requiredMsg)
            {
                Description = desc,
                Prompt = prompt,
                IsCalculated = readonlyAttr?.IsReadOnly ?? false,
                Hidden = hidden
            };
        }
    }

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

    public interface ITable<out TEntity> : ITable
        where TEntity : class, new()
    {
        IEnumerable<TEntity> Entities { get; }

        ITableRow<TEntity> AttachRow(IInternalTableRow row);
        ITableRow<TEntity> DetachRow(IInternalTableRow row);

        ITableColumn<TEntity> AttachColumn(IInternalTableColumn column);
        ITableColumn<TEntity> AddColumn(string name, string title = null, int order = 0);

        ITableRow<TEntity>[] TableRows { get; }
        ITableColumn<TEntity>[] TableColumns { get; }
        ITableColumn<TEntity>[] OrderedColumns { get; }
        ITableColumn<TEntity>[] DisplayableColumns { get; }
        ITableColumn<TEntity>[] KeyColumns { get; }
        IEnumerable<ITableRow<TEntity>> DisplayableRows { get; }
        ITable<TEntity> SetColumnOrder(params string[] entityPropertyNames);
        ITable<TEntity> SetExcludedColumns(params string[] entityPropertyNames);
        ITable<TEntity> SetIncludedColumns(params string[] entityPropertyNames);
        ITableColumn<TEntity> GetColumn(string clrName);
        ITableColumn<TEntity> GetColumn(int columnIndex);
        ITableColumn<TEntity> GetColumnByDBName(string dbName);
        ITable<TEntity> BuildColumns(bool rebuild = false);
        ITable<TEntity> BuildRows(bool rebuild = false);
        ITable<TEntity> BuildTable(bool rebuild = false);
        ITableRow<TEntity> this[Int64 rowID] { get; }
        ITableRow<TEntity> this[ITableRow row] { get; }
    }

    /// <summary>
    /// Wraps a collection of entities to make working with them easier in view models.
    /// </summary>
    /// <typeparam name="TEntity"></typeparam>
    public class Table<TEntity> : ITable<TEntity>, ITable where TEntity : class, new()
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
        /// The underlying context for this table, if specified via one of the constructor overloads.
        /// Setting this property pulls the EDMX (Entity Data Model XML) meta-data from the given context, if available.
        /// </summary>
        public DbContext Context
        {
            get { return _DBContext; }
            private set
            {
                _DBContext = value;
            }
        }
        DbContext _DBContext;

        /// <summary>
        /// A list of entity objects to edit.
        /// Only public properties on each object will be editable in accordance with associated attributes.
        /// </summary>
        public IEnumerable<TEntity> Entities
        {
            get { return _Entities ?? (_Entities = new List<TEntity>()); }
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
        /// The desired columns to skip when building the table columns.  The names should be the property names of an entity model.
        /// The matching entity property names (table columns) are skipped and not included in this table.
        /// <para>See also: <seealso cref="IncludedColumns"/></para>
        /// </summary>
        public readonly List<string> ExcludedColumns = new List<string>();

        /// <summary>
        /// The desired columns to include.  The names should be the property names of an entity model.
        /// Any entity property names (table columns) not in this list are skipped and not included in this table.
        /// If the list is empty, then all columns are assumed.
        /// <para>Note: Included columns take precedence over excluded ones (thus, 'ExcludedColumns' is ignored when this is populated).</para>
        /// <para>See also: <seealso cref="ExcludedColumns"/></para>
        /// </summary>
        public readonly List<string> IncludedColumns = new List<string>();

        bool _IncludeColumn(string name)
        {
            return IncludedColumns.Count == 0 && !ExcludedColumns.Contains(name) || IncludedColumns.Contains(name);
        }

        /// <summary>
        /// The title of the table to edit.
        /// </summary>
        public string TableTitle { get; set; }

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
        IObjectModelValidator _ModelValidator;
        ActionContext _DummyActionContext = new ActionContext(); // (the model validator requires it, but doesn't seem to use it)

        public Table(ICoreXTServiceProvider sp)
        {
            ServiceProvider = sp;
        }

        /// <summary>
        /// Creates a new table without an associated context.
        /// </summary>
        /// <param name="tableTitle">A display title for this table.</param>
        /// <param name="tableID">An application-wide unique identifier for this table.</param>
        /// <param name="keyNames">The key property names shared by all the entities for this table.  Composite keys can also 
        /// specify a DBContext (see other overloaded constructor), or entity metadata to specify a Key attribute for each key
        /// entity property.  By default, any property named "id" (case insensitive) is automatically assumed.</param>
        public Table(string tableTitle, string tableID = null, string[] keyNames = null)
        {
            TableTitle = tableTitle != null ? tableTitle.Trim() : null;
            if (tableID != null)
                ID = tableID;
            KeyNames = keyNames ?? (from p in UpdateEntityPropertyCache(typeof(TEntity)) where string.Equals(p.Key, "id", StringComparison.CurrentCultureIgnoreCase) select p.Key);
        }

        /// <summary>
        /// Creates a new table with an associated context.
        /// An associated context helps to pull more details on the underlying table without needing to lookup metadata info on
        /// entity properties. The EDMX information is automatically applied to all table columns.
        /// </summary>
        /// <param name="tableTitle">A display title for this table.</param>
        /// <param name="context">A context to use as the default for this table.  It also helps to retrieve entity details
        /// (like primary keys) without the need to add metadata to entity properties. Note: Entity property attributes
        /// always take precedence over the context if supplied.</param>
        /// <param name="tableID">An application-wide unique identifier for this table. If this is null, a GUID will be used;
        /// however when inspecting the HTML, adding a more descriptive ID can make debugging easier.</param>
        public Table(string tableTitle, DbContext context, string tableID = null)
        {
            ID = tableID ?? Guid.NewGuid().ToString("N");
            TableTitle = tableTitle;
            // ... get some details from the context ...
            Context = context; // (setting this pulls the EDMX data)
        }

        /// <summary>
        /// Loads the table contents from the posted table with the specified ID.
        /// </summary>
        public Table(string id, HttpRequest request)
            : this(request.Form["TableTitle"], request.Form["KeyName"])
        {
            if (string.IsNullOrEmpty(id))
                throw new ArgumentNullException("ID is null or empty.");

            _ID = id;

            Load(request);
        }

        /// <summary>
        /// Loads data from an HTTP request form data to this table.
        /// </summary>
        /// <param name="request">An HTTPRequestBase object that contains the form data.</param>
        /// <param name="tableID">The ID of a specific table to apply.  If null, the current table ID is used.  If the current
        /// table doesn't have an ID, then the posted table in the form is assumed if there is only one. To force pulling
        /// the table data of a single posted table in the request, pass in an empty string ("").</param>
        /// <returns>'true' if data was loaded into this table.</returns>
        public bool Load(HttpRequest request, string tableID = null)
        {
            Dictionary<string, string[]> requestProperties = new Dictionary<string, string[]>();
            foreach (string key in request.Form.Keys)
                requestProperties[key] = request.Form.GetValues(key);
            return _Load(requestProperties, tableID);
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
                tableID = _ID;

            var props = requestProperties;

            if (string.IsNullOrWhiteSpace(tableID))
            {
                // ... need a table ID to pull the form data ...
                // (Note: All request entity data is in the format Table.{ID}.{RowIndex}.Entity.{EntityPropertyName})

                string[] tableIDs = props.Value("Table.ID");

                if (tableIDs == null || tableIDs.Length == 0)
                    return false;

                if (tableIDs.Length == 1) // (only if there is one ID)
                    tableID = _ID = tableIDs[0];

                if (string.IsNullOrEmpty(tableID))
                    if (tableIDs == null || tableIDs.Length == 0)
                        throw new InvalidOperationException("ID is null or empty, and no table ID can be found in the posted data.");
                    else
                        throw new InvalidOperationException("ID is null or empty, and no ID can be assumed, since there are " + tableIDs.Length + " tables posted.");
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
            }

            return this;
        }

        public ITable<TEntity> BuildRows(bool rebuild = false)
        {
            if (_TableRows == null || _TableRows.Length == 0 || rebuild)
            {
                _TableRowIndex.Clear();
                _TableRows = (from e in Entities select _CreateRow(e)).ToArray();
            }

            return this;
        }

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
            return obj == (object)this || (obj is string && ((string)obj) == ID) || (obj is ITable<object> && ((ITable<object>)obj).ID == ID);
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
    }

    public class TableSet<TEntity>
        where TEntity : class, new()
    {
        public DbContext Context { get; private set; }

        Dictionary<string, Table<TEntity>> _Tables = new Dictionary<string, Table<TEntity>>();

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

        public Table<TEntity> Add(Table<TEntity> table)
        {
            if (table != null)
            {

                _Tables[table.ID] = table;
            }
            return table;
        }

        public Table<TEntity> GetTable(string tableID)
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
                    var table = new Table<TEntity>(ID, request);
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

    /// <summary>
    /// Can be used with controller parameters like so: '([ModelBinder(typeof(TableSetBinder&lt;TEntityType&gt;))] TEntityType parameterName, ...)'
    /// <para>Note: A binder is not required.  If you already have a reference to an HTTPRequest object, you can apply it to a TableSet object directly.</para>
    /// </summary>
    /// <typeparam name="TEntity">The expected entity model type.</typeparam>
    public class TableSetBinder<TEntity> : IModelBinder // (New methodology for .Net core; see more: http://www.dotnetcurry.com/aspnet-mvc/1368/aspnet-core-mvc-custom-model-binding)
        where TEntity : class, new()
    {
        public Task BindModelAsync(ModelBindingContext bindingContext)
        {
            return Task.FromResult(new TableSet<TEntity>(bindingContext.HttpContext.Request));
        }
    }

    public class TableSetBinderProvider : IModelBinderProvider
    {
        /// <summary>
        /// A cache of recent model binder instances to reuse.
        /// </summary>
        private readonly Dictionary<Type, IModelBinder> _TableTypeBinders = new Dictionary<Type, IModelBinder>();

        public IModelBinder GetBinder(ModelBinderProviderContext context)
        {
            var modelType = context.Metadata.ModelType;
            if (modelType != typeof(Table<>)) return null;
            var binder = _TableTypeBinders.Value(modelType);
            if (binder != null) return binder;
            var binderType = typeof(TableSetBinder<>).MakeGenericType(modelType.GetGenericArguments()[0]);
            binder = (IModelBinder)Activator.CreateInstance(binderType);
            _TableTypeBinders[modelType] = binder; // (cache so this is faster next time)
            return binder;
        }
    }

    // TODO: Support JSON converters: http://www.dotnetcurry.com/aspnet-mvc/1368/aspnet-core-mvc-custom-model-binding (at bottom)
}