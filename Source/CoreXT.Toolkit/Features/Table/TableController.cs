using CoreXT;
using CoreXT.MVC;
using CoreXT.Services.DI;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;

namespace CoreXT.Toolkit.Controllers
{
    /// <summary>
    /// Orders API controller for marshaling client side communication.
    /// </summary>
    public class TableController : CommonController // (not used yet)
    {
        public TableController(ICoreXTServiceProvider sp) : base(sp) { }

        [HttpGet]
        // GET api/interface
        public IActionResult Get(string cmd)
        {
            return null;
        }

        [HttpPost]
        // POST api/interface
        public IActionResult Post([FromQuery]string cmd, [FromBody]JObject formData)
        {
            switch (cmd)
            {
                case "recalc": break;

                    /*if (formData.Count > 0)
                    {
                        var view = new UsersViewModel();

                        try
                        {
                            // ... prepare the table in the model with any calculation configurations ...

                            //view.ConfigureColumns();

                            // ... add a plan entry (not to be saved, temp only), and return all resulting column values ...

                            var row = view.Table.CreateRow();

                            row.SetValues(formData);

                            // ... now that all values are set, read all values, and the auto calc columns will trigger ...

                            var response = new Dictionary<string, string>();

                            foreach (var item in formData)
                            {
                                var value = row.GetValue(item.Key);
                                if (value != null)
                                    if (value.GetType() == typeof(DateTime) && ((DateTime)value).TimeOfDay.TotalMilliseconds == 0)
                                    {
                                        value = ((DateTime)value).ToString("yyyy-MM-dd");
                                    }
                                response[item.Key] = value != null ? Types.ChangeType<string>(value) : "";
                                response[item.Key + ".displayText"] = Types.ChangeType<string>(row.GetDisplayText(item.Key));
                            }

                            //var js = new JavaScriptSerializer();
                            //var json = js.Serialize(response);

                            return Json(response);
                        }
                        catch (Exception ex)
                        {
                            return InternalServerError(ex);
                        }
                    }

                    return Ok(); // (no changes, usually due to no data received)*/
            }

            return BadRequest("Unknown command request: '" + cmd + "'");
        }
    }
}
