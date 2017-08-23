using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Reflection;
using ICS.Enumerators;
using ICS.FieldTypes;

namespace ICS.Exporters
{
    public class DBExporterMSSQL : IExporter
    {
        #region Fields (2)

        private int _patientID;
        private int _visitID;

        #endregion Fields

        #region Methods (1)

        // Public Methods (1) 

        public bool GetTableData(EnumeratorBase sourceEnum,
            out string tableName, out List<string> columnNames, out List<Type> columnTypes,
            out List<Dictionary<string, IValueType>> tableData)
        {
            tableName = "";
            columnNames = null;
            columnTypes = null;
            tableData = null;

            if (sourceEnum.Value is XmlNodeField)
            {
                // ... the enumerator is a node, so assume it must describe a table ...

                tableName = sourceEnum.DerivedName;
                tableData = new List<Dictionary<string, IValueType>>(1);
                columnNames = new List<string>(1);
                columnTypes = new List<Type>(1);

                // ... get the column names and types, if any ...

                PropertyInfo[] properties = sourceEnum.GetType().GetProperties(BindingFlags.Instance | BindingFlags.Public);
                
                foreach (PropertyInfo property in properties)
                {
                    if (property.PropertyType.IsSubclassOf(typeof(EnumeratorBase)))
                    {
                        //SourceEnumeratorBase enumProperty = property.GetValue(sourceEnum, null) as SourceEnumeratorBase;
                        EnumeratorBase enumProperty = property.GetValue(sourceEnum, null) as EnumeratorBase;
                        if (enumProperty.PrimitiveValueType != null)
                        {
                            columnNames.Add(enumProperty.DerivedName);
                            columnTypes.Add(enumProperty.PrimitiveValueType);
                        }
                    }
                }

                // ... read all the data ...

                for (int i = 0; i < sourceEnum.Count; i++)
                {
                    foreach (PropertyInfo property in properties)
                    {
                        if (property.PropertyType.IsSubclassOf(typeof(EnumeratorBase)))
                        {
                            EnumeratorBase enumProperty = property.GetValue(sourceEnum, null) as EnumeratorBase;
                            if (enumProperty.PrimitiveValueType != null)
                            {
                                // (build columns only if on the first row of data [or just before the first record is created])
                                if (tableData.Count < 2)
                                {
                                    columnNames.Add(enumProperty.DerivedName);
                                    columnTypes.Add(enumProperty.PrimitiveValueType);

                                    if (tableData.Count == 0)
                                        tableData.Add(new Dictionary<string, IValueType>(1));
                                }

                                // ... at least one column is found, so create the table to being reading values ...

                                tableData[tableData.Count - 1][columnNames.Last()] = enumProperty.Value;
                            }
                        }
                    }
                }

                return true;
            }
            else
            {
                throw new InvalidOperationException("DBExporter_MSSQL.SendToDB(): Source enumerator '" + sourceEnum.DerivedName + "' is a value type. An XmlNodeField was expected.");
            }
        }

        #endregion Methods

        #region IExporter Members

        private bool _IsInitialized = false;
        public bool IsInitialized
        {
            get { return _IsInitialized; }
        }

        public EnumeratorBase Source { get; set; }

        public void Initialize(EnumeratorBase sourceEnum)
        {
            Source = sourceEnum;
            _IsInitialized = true;
        }

        public void Reset()
        {
            _patientID = 9999999;
            _visitID = 99999999;
        }

        public void Export()
        {
            // TODO: Enumerate and export to DB!



            string tableName;
            List<string> columnNames;
            List<Type> columnTypes;
            List<Dictionary<string, IValueType>> tableData; 

            GetTableData(Source, out tableName, out columnNames, out columnTypes, out tableData);

            int i = 1;
        }

        public void OnIdle()
        {
            /* Closes the database connection */
        }

        #endregion
    }
}
