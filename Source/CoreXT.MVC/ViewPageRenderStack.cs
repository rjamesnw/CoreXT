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
    public class ViewPageRenderStack: IViewPageRenderStack
    {
        public Stack<IViewPage> Views { get; } = new Stack<IViewPage>();

        public IViewPage Push(IViewPage view) { Views.Push(view);  return view; }

        public IViewPage Pop() { var view = Views.Pop();  return view; }

        public int Count { get { return Views.Count; } }

        public IViewPage Current { get { return Count > 0 ? Views.Peek() : null; } }
    }
}
