using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Text;

namespace CoreXT.Entities
{
    /// <summary> A converter used to serialize or deserialize JSON from an entity table instance. </summary>
    /// <seealso cref="T:Newtonsoft.Json.JsonConverter"/>
    class TableConverter : JsonConverter
    {
        public override bool CanConvert(Type objectType)
        {
            return (typeof(ITable).IsAssignableFrom(objectType));
        }

        public override object ReadJson(JsonReader reader, Type objectType, object existingValue, JsonSerializer serializer)
        {
            //return serializer.Deserialize(reader, typeof(Product));
        }

        public override void WriteJson(JsonWriter writer, object value, JsonSerializer serializer)
        {
            //serializer.Serialize(writer, value, typeof(Product));
            var table = (ITable)value;
        }
    }
}
