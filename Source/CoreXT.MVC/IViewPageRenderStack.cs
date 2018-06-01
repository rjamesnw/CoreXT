using CoreXT.MVC.Views;
using System.Collections.Generic;

namespace CoreXT.MVC
{
    /// <summary>
    /// A stack representing the order of nested view pages being rendered.
    /// </summary>
    public interface IViewPageRenderStack
    {
        IReadOnlyCollection<IViewPageBase> Views { get; }

        IViewPageBase Push(IViewPageBase view);

        IViewPageBase Pop();

        int Count { get; }

        /// <summary>
        /// The current view page being rendered.
        /// </summary>
        IViewPageBase Current { get; }
    }

    /// <summary>
    /// A stack representing the order of nested view pages being rendered.
    /// </summary>
    public interface IViewPageRenderStack<TView> where TView: class, IViewPageBase
    {
        Stack<TView> Views { get; }

        TView Push(TView view);

        TView Pop();

        int Count { get; }

        /// <summary>
        /// The current view page being rendered.
        /// </summary>
        TView Current { get; }
    }
}
