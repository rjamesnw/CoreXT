using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace ICS.Enumerators
{
    public abstract class SourceEnumeratorCommon<T> : EnumeratorBase
        where T : EnumeratorBase, new() // Base is now a generic type, so the derived type is known (for the this[] indexer).
    {
        /// <summary>
        /// Added to support XML node lists in the chain: Source.Item.SubItem[n].SubSubItem...
        /// </summary>
        public T this[int index]
        {
            get
            {
                T t = new T();
                t.Parent = Parent;
                t.ValueIndex = index;
                return t;
            }
        }

        public SourceEnumeratorCommon(EnumeratorBase parent)
            : base(parent) { }

        public SourceEnumeratorCommon(ITranslator trans)
            : base(trans) { }

        public SourceEnumeratorCommon()
            : base() { }
    }
}
