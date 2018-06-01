using CoreXT.MVC.Views;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CoreXT.MVC
{
    /// <summary>
    /// Keeps track of the render stack for view pages.
    /// This helps the system to identify the nesting levels during rendering for sorting of resources.
    /// <para>A new instance is created on each HTTP request.</para>
    /// </summary>
    public class ViewPageRenderStack<TView> : IViewPageRenderStack<TView>, IViewPageRenderStack where TView : class, IViewPageBase
    {
        public Stack<TView> Views { get; } = new Stack<TView>();

        public TView Push(TView view) { Views.Push(view); return view; }

        public TView Pop() { var view = Views.Pop(); return view; }

        public int Count { get { return Views.Count; } }

        public TView Current { get { return Count > 0 ? Views.Peek() : null; } }

        IViewPageBase IViewPageRenderStack.Push(IViewPageBase view) => Push((TView)view);

        IViewPageBase IViewPageRenderStack.Pop() => Pop();

        IViewPageBase IViewPageRenderStack.Current => Current;

        IReadOnlyCollection<IViewPageBase> IViewPageRenderStack.Views => Views;
    }
}
