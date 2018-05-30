using System.Collections.Generic;

namespace CoreXT.MVC
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
