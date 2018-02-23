using CoreXT.Services.DI;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CoreXT.Toolkit.Components
{

    /// <summary> A panel group component. </summary>
    /// <seealso cref="T:CoreXT.Toolkit.Components.WebComponent"/>
    public class PanelGroup : WebComponent
    {
        // --------------------------------------------------------------------------------------------------------------------

        public List<Panel> Panels { get; } = new List<Panel>();

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary> Creates a panel group component. </summary>
        /// <param name="services"> Application services. </param>
        public PanelGroup(ICoreXTServiceProvider services) : base(services)
        {
        }

        public override Task<IViewComponentResult> InvokeAsync() => base.InvokeAsync();

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary> Configures a panel group component. </summary>
        /// <param name="panels"> The panels for this panel group. </param>
        /// <returns> The panel group instance. </returns>
        public PanelGroup Configure(params Panel[] panels)
        {
            SetPanels(panels);
            return this;
        }

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary> Sets the panels, clearing any existing panels. </summary>
        /// <param name="panels"> The panels. </param>
        /// <returns> A PanelGroup. </returns>
        public PanelGroup SetPanels(IEnumerable<Panel> panels)
        {
            if (panels != null)
            {
                Panels.Clear();
                Panels.AddRange(panels);
            }
            return this;
        }

        /// <summary> Sets the panels, clearing any existing panels. </summary>
        /// <param name="panels"> The panels. </param>
        /// <returns> A PanelGroup. </returns>
        public PanelGroup SetPanels(params Panel[] panels)
        {
            return SetPanels((IEnumerable<Panel>)panels);
        }

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary> Adds a panel to the end of the current panel list. </summary>
        /// <param name="panel"> A panel to add. </param>
        /// <returns> A PanelGroup. </returns>
        public PanelGroup AddPanel(Panel panel)
        {
            Panels.Add(panel);
            return this;
        }

        /// <summary> Adds panels to the end of the current panel list. </summary>
        /// <param name="panels"> Panels to add. </param>
        /// <returns> This PanelGroup. </returns>
        public PanelGroup AddPanels(params Panel[] panels)
        {
            return AddPanels((IEnumerable<Panel>)panels);
        }

        /// <summary> Adds panels to the end of the current panel list. </summary>
        /// <param name="panels"> Panels to add. </param>
        /// <returns> This PanelGroup. </returns>
        public PanelGroup AddPanels(IEnumerable<Panel> panels)
        {
            Panels.AddRange(panels);
            return this;
        }

        // --------------------------------------------------------------------------------------------------------------------

        public override Task<WebComponent> Update()
        {
            /*(do stuff here just before the view gets rendered)*/
            return base.Update();
        }

        // --------------------------------------------------------------------------------------------------------------------
    }
}
