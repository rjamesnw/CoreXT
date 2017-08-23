using Common;
using System;
using System.Collections.Generic;
using System.Data;
using System.IO;
using System.Linq;
using System.Text;

namespace ICE
{
    public abstract class ConfigurationBase
    {
        // -------------------------------------------------------------------------------------------------------

        /// <summary>
        /// Gets the dataset for this instance.
        /// The data is automatically loaded if not yet loaded upon accessing this property.
        /// </summary>
        public DataSet Configuration { get { return _Configuration ?? LoadData(false); } }
        protected DataSet _Configuration;
        protected string _ConfigurationFile;
        public bool IsConfigurationLoaded { get; private set; }

        public event Action<ConfigurationBase, Exception> ConfigurationLoadeError;
        public event Action<ConfigurationBase, DataTable> CreateNewConfiguration;

        // -------------------------------------------------------------------------------------------------------

        /// <summary>
        /// Sets up the configuration data file using a specified file location and dataset GUID.
        /// </summary>
        /// <param name="configFileLocation">The location of the configuration file to load/create.</param>
        /// <param name="dataSetGUID">The GUID is just a unique dataset id/name for the given file location, and is also used as the filename.</param>
        protected void _SetupConfiguration(string configFileLocation, string dataSetGUID)
        {
            _ConfigurationFile = Path.Combine(configFileLocation, dataSetGUID + ".xml");
            _Configuration = new DataSet(dataSetGUID);
            _Configuration.Tables.CollectionChanged -= _DataTables_CollectionChanged;
            _Configuration.Tables.CollectionChanged += _DataTables_CollectionChanged;
        }

        // -------------------------------------------------------------------------------------------------------

        bool _DataInitInProgress;

        public void BeginDataInit()
        {
            _DataInitInProgress = true;
        }

        public void EndDataInit()
        {
            _DataInitInProgress = false;
            SaveData();
        }

        // -------------------------------------------------------------------------------------------------------

        /// <summary>
        /// Returns the table which holds the properties (the table is named "Properties").
        /// The data file, if any, will be automatically loaded when this property is accessed.
        /// If a data file is not found, a new one is created, so this property will never return 'null',
        /// unless there's an error loading the file.
        /// To check of a properties table exists, use 'PropertyTableExists'.
        /// </summary>
        public DataTable PropertyTable
        {
            get { return LoadData(false).Tables["Properties"]; }
        }

        /// <summary>
        /// Returns true if the "Properties" table exists in the currently loaded data set.
        /// This does not cause any data to automatically load.
        /// </summary>
        public bool PropertyTableExists { get { return _Configuration.Tables.Contains("Properties"); } }

        /// <summary>
        /// Allows enumeration over the properties specific to this plugin.
        /// The data file, if any, will be automatically loaded when this property is accessed.
        /// </summary>
        public IEnumerable<DataRow> Properties
        {
            get { return PropertyTable.Rows.Cast<DataRow>(); }
        }

        public DataSet LoadData(bool reload)
        {
            // ... first, look for a data file for this plugin and load it ...

            if (File.Exists(_ConfigurationFile) && (!IsConfigurationLoaded || reload))
                try
                {
                    // ... clear any existing tables first ...
                    if (_Configuration.Tables.Count > 0)
                        _ClearData(false);

                    _Configuration.ReadXml(_ConfigurationFile);

                    IsConfigurationLoaded = true;
                }
                catch (Exception ex)
                {
                    if (ConfigurationLoadeError != null)
                        ConfigurationLoadeError(this, ex);
                }

            if (!PropertyTableExists)
            {
                // ... this is a new setup - create the default "Properties" table ...

                var table = _Configuration.Tables.Add("Properties");

                var column = table.Columns.Add("Name", typeof(string));
                column.AllowDBNull = false;
                column.ReadOnly = true;
                column.Unique = true;

                table.PrimaryKey = new DataColumn[] { column };

                column = table.Columns.Add("Value", typeof(string));

                if (CreateNewConfiguration != null)
                    CreateNewConfiguration(this, table);

                SaveData();

                // ... keep track of updates and additions, and auto save when detected ...

                table.TableNewRow += _Data_TableNewRow;
                table.RowChanged += _Data_RowChanged;
                table.RowDeleted += _Data_RowChanged;
            }

            return _Configuration;
        }

        /// <summary>
        /// Forces a reload of the data from the file associated with this plugin instance.
        /// </summary>
        public DataSet LoadData() { return LoadData(true); }

        /// <summary>
        /// Occurs when the plugin adds new tables.
        /// </summary>
        void _DataTables_CollectionChanged(object sender, System.ComponentModel.CollectionChangeEventArgs e)
        {
            if (!_DataInitInProgress) SaveData();
        }

        /// <summary>
        /// Occurs when the plugin adds new row data.
        /// </summary>
        void _Data_TableNewRow(object sender, DataTableNewRowEventArgs e)
        {
            if (!_DataInitInProgress) SaveData();
        }

        /// <summary>
        /// Occurs when the plugin makes changes to row data, or a row becomes deleted.
        /// </summary>
        void _Data_RowChanged(object sender, DataRowChangeEventArgs e)
        {
            if (!_DataInitInProgress) SaveData();
        }

        // -------------------------------------------------------------------------------------------------------
        
        /// <summary>
        /// Overridden in a derived class to determine if it;s ok to save the configuration file.
        /// </summary>
        public abstract bool CanSave { get; }

        public void SaveData()
        {
            if (CanSave) // (must not allow saving properties if an error has occurred [to prevent invalid data from being saved as well])
            {
                _Configuration.AcceptChanges();
                if (_Configuration.HasChanges())
                    _Configuration.WriteXml(_ConfigurationFile);
            }
        }

        // -------------------------------------------------------------------------------------------------------
        // Methods for adding new table data and columns

        public DataTable CreateTable(string tableName)
        {
            if (Configuration.Tables.Contains(tableName))
                return Configuration.Tables[tableName];
            else
            {
                var table = Configuration.Tables.Add(tableName);
                table.TableNewRow += _Data_TableNewRow;
                table.RowChanged += _Data_RowChanged;
                table.RowDeleted += _Data_RowChanged;
                return table;
            }
        }

        // -------------------------------------------------------------------------------------------------------

        public void SetValue(string name, string value)
        {
            var propertiesTable = PropertyTable;

            var row = (from r in propertiesTable.Rows.Cast<DataRow>()
                       where (string)r["Name"] == name
                       select r).FirstOrDefault();

            if (row != null)
                row["Name"] = value;
            else
                propertiesTable.Rows.Add(name, value); // (note: this will trigger an auto save)
        }

        public string GetValue(string name, string defaultValue)
        {
            var propertiesTable = PropertyTable;

            var row = (from r in propertiesTable.Rows.Cast<DataRow>()
                       where (string)r["Name"] == name
                       select r).FirstOrDefault();

            if (row != null)
                return (string)row["Name"];
            else
                return defaultValue;
        }

        // -------------------------------------------------------------------------------------------------------

        public string GetSetValue(string name, string defaultValue)
        {
            string value = GetValue(name, null);
            if (value == null)
            {
                value = defaultValue;
                SetValue(name, value);
            }
            return value;
        }

        public int GetSetValue(string name, int defaultValue)
        {
            int value = 0;
            int.TryParse(GetSetValue(name, defaultValue.ToString()), out value);
            return value;
        }

        public double GetSetValue(string name, double defaultValue)
        {
            double value = 0;
            double.TryParse(GetSetValue(name, defaultValue.ToString()), out value);
            return value;
        }

        public DateTime GetSetValue(string name, DateTime defaultValue)
        {
            DateTime value = DateTime.MinValue;
            DateTime.TryParse(GetSetValue(name, defaultValue.ToString("yyyy-MM-dd HH:mm:ss")), out value);
            return value;
        }

        public TimeSpan GetSetValue(string name, TimeSpan defaultValue)
        {
            TimeSpan value = TimeSpan.MinValue;
            TimeSpan.TryParse(GetSetValue(name, defaultValue.ToString()), out value);
            return value;
        }

        // -------------------------------------------------------------------------------------------------------

        void _ClearData(bool rebuildProperties)
        {
            foreach (var table in _Configuration.Tables.Cast<DataTable>())
            {
                table.TableNewRow -= _Data_TableNewRow;
                table.RowChanged -= _Data_RowChanged;
                table.RowDeleted -= _Data_RowChanged;
            }

            _Configuration.Tables.Clear();

            if (rebuildProperties)
                LoadData(false); // (will rebuild the 
        }
        public void ClearData() { _ClearData(true); }

        public void ClearProperties()
        {
            if (PropertyTableExists)
            {
                var table = PropertyTable;
                table.TableNewRow -= _Data_TableNewRow;
                table.RowChanged -= _Data_RowChanged;
                table.RowDeleted -= _Data_RowChanged;
                _Configuration.Tables.Remove(table);
            }

            LoadData(false); // (will rebuild the 
        }

        // -------------------------------------------------------------------------------------------------------

        /// <summary>
        /// Returns a text with "Name=Value" lines.
        /// </summary>
        public string GetNameValues()
        {
            string text = "";

            foreach (var row in Properties)
                Strings.Append(text, row["Name"] + "=\"" + ((string)row["Value"] ?? "") + "\"", "\r\n", true);

            return text;
        }

        // -------------------------------------------------------------------------------------------------------
    }
}
