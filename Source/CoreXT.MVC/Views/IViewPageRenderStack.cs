using CoreXT.MVC.Views.Razor;
using System.Collections.Generic;

namespace CoreXT.MVC.Views
{
    /// <summary>
    /// A stack representing the order of nested view pages being rendered.
    /// </summary>
    public interface IViewPageRenderStack
    {
        Stack<IViewPage> Views { get; }

        IViewPage Push(IViewPage view);

        IViewPage Pop();

        int Count { get; }

        /// <summary>
        /// The current view page being rendered.
        /// </summary>
        IViewPage Current { get; }
    }
}
