using System;
using System.Collections.Generic;
using System.Text;
using System.Timers;
using System.IO;
using System.Data;
using System.Diagnostics;
using ICE;
using Common;
using System.AddIn;

namespace Test_Timer
{
    [AddIn("Test Timer Plugin", Description = "Just a class to test the ICE engine.", Publisher = "James Wilkins", Version = "1.0.0.0")]
    public class Test_Timer_Plugin : Plugin<Test_Timer_Plugin>
    {
        public ICEController Controller { get { return _Controller; } }
        ICEController _Controller;

        protected Timer _Timer = null;
        protected int _TickDuration = 10000;

        public void Initialize(ICEController controller, IPluginController pluginWrapper)
        {
            _Controller = controller;

            // ... get/set some default properties ...

            //object propVals = fSerivce.GetRegistryValue(fPluginWrapper, "Properties", null);
            //if (propVals != null)
            //    fPluginWrapper.ImportNameValues(propVals.ToString());

            //fTickDuration = fPluginWrapper.GetSetValue("TickDuration", fTickDuration);

            //if (propVals == null)
            //    fSerivce.SetRegistryValue(fPluginWrapper, "Properties", fPluginWrapper.ExportNameValues());
        }

        public void OnStart()
        {
            if (_Timer == null)
            {
                _Timer = new Timer(_TickDuration);
                _Timer.Elapsed += new ElapsedEventHandler(_Timer_Elapsed);
            }
            _Timer.Start();
        }

        public void OnStop()
        {
            _Timer.Stop();
        }

        public void OnPause()
        {
            _Timer.Stop();
        }

        static bool _Timer_Elapsed_InProgress = false;

        void _Timer_Elapsed(object sender, ElapsedEventArgs e)
        {
            if (_Timer_Elapsed_InProgress) return;
            _Timer_Elapsed_InProgress = true;

            try
            {
                // ... do stuff ...
            }
            catch (Exception ex)
            {
                SetErrorMessage(ex);
            }
            finally
            {
                _Timer_Elapsed_InProgress = false;
            }
        }
    }
}
