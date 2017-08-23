#if (NETSTANDARD1_5 || NETSTANDARD1_6 || NETCOREAPP1_0 || DNXCORE50 || NETCORE45  || NETCORE451 || NETCORE50)
#define DOTNETCORE
#endif

using System;
using System.Collections;
using System.Collections.Generic;

namespace CoreXT.CollectionsAndLists
{
    /// <summary>
    /// Creates a list of items using weak referencing.
    /// This allows the items to be garbage collected when all other references are gone.
    /// <para>Warning: The proper way to check if an item still exists, or to work with it, is to FIRST 
    /// obtain a reference into a variable, and then test the variable for 'null'. If not 'null', then you've
    /// successfully obtained a reference that will prevent garbage collection, and allow it to be used safely.</para>
    /// </summary>
    /// <typeparam name="T"></typeparam>
    public class WeakReferenceList<T> : IList<T>, IList
        where T : class
    {
        // ---------------------------------------------------------------------------------------------------------------

        List<WeakReference> _Items;

        // ---------------------------------------------------------------------------------------------------------------

        public WeakReferenceList() { _Items = new List<WeakReference>(); }
        public WeakReferenceList(int capacity) { _Items = new List<WeakReference>(capacity); }

        // ---------------------------------------------------------------------------------------------------------------

        /// <summary>
        /// Search for the first 'null' entry and return the index, or -1 if not found.
        /// </summary>
        public int GetFirstNullIndex()
        {
            for (int i = 0; i < _Items.Count; i++)
                if (_Items[i].Target == null) return i;
            return -1;
        }

        // ---------------------------------------------------------------------------------------------------------------

        /// <summary>
        /// Add only if the item doesn't already exist.
        /// </summary>
        public T AddIfNotExists(T item)
        {
            if (!Contains(item))
                Add(item);
            return item;
        }

        // ---------------------------------------------------------------------------------------------------------------

        /// <summary>
        /// Replaces the first 'null' list entry found with the specified item.
        /// If there are no 'null' spots, then add the item instead.
        /// </summary>
        public T ReplaceNullOrAddNew(T item)
        {
            var i = GetFirstNullIndex();
            if (i >= 0)
                _Items[i].Target = item;
            else
                Add(item);
            return item;
        }

        // ---------------------------------------------------------------------------------------------------------------

        #region IList<T> Members

        public int IndexOf(T item)
        {
            for (int i = 0; i < _Items.Count; i++)
                if (_Items[i].Target == item) return i;
            return -1;
        }

        public void Insert(int index, T item)
        {
            _Items.Insert(index, new WeakReference(item));
        }

        public void RemoveAt(int index)
        {
            _Items.RemoveAt(index);
        }

        public T this[int index]
        {
            get
            {
                return _Items[index].Target as T;
            }
            set
            {
                _Items[index].Target = value;
            }
        }

        #endregion

        #region ICollection<T> Members

        public void Add(T item)
        {
            _Items.Add(new WeakReference(item));
        }

        public void Clear()
        {
            _Items.Clear();
        }

        public bool Contains(T item)
        {
            for (int i = 0; i < _Items.Count; i++)
                if (_Items[i].Target == item) return true;
            return false;
        }

        public void CopyTo(T[] array, int arrayIndex)
        {
            for (int i = 0; i < _Items.Count; i++)
                array[arrayIndex++] = _Items[i].Target as T;
        }

        public int Count
        {
            get { return _Items.Count; }
        }

        public bool IsReadOnly
        {
            get { return false; }
        }

        public bool Remove(T item)
        {
            var i = IndexOf(item);
            if (i >= 0) { RemoveAt(i); return true; }
            return false;
        }

        #endregion

        #region IEnumerable<T> Members

        public IEnumerator<T> GetEnumerator()
        {
            return new Enumerator(_Items);
        }

        #endregion

        #region IEnumerable Members

        IEnumerator IEnumerable.GetEnumerator()
        {
            return new Enumerator(_Items);
        }

        #endregion

        // ---------------------------------------------------------------------------------------------------------------

        public class Enumerator : IEnumerator<T>, IEnumerator // (T: Enum Type)
        {
            public List<WeakReference> _collection;

            // Enumerators are positioned before the first element
            // until the first MoveNext() call.
            int position = -1;

            public Enumerator(List<WeakReference> collection)
            {
                _collection = collection;
            }

            public bool MoveNext()
            {
                if (position < _collection.Count)
                    position++;
                return (position < _collection.Count);
            }

            public void Reset()
            {
                position = -1;
            }

            object IEnumerator.Current
            {
                get
                {
                    try
                    {
                        return _collection[position].Target;
                    }
                    catch (IndexOutOfRangeException ex)
                    {
                        throw new InvalidOperationException("Indexing error.", ex);
                    }
                }
            }

            #region *** IEnumerator<T> Members ***
            //*
            T IEnumerator<T>.Current
            {
                get { return (T)((IEnumerator)this).Current; }
            }
            //*
            #endregion ***************************

            #region *** IDisposable Members ***
            //*
            public void Dispose()
            {
                _collection = null;
            }
            //*
            #endregion ***************************
        }

        // ---------------------------------------------------------------------------------------------------------------

        #region IList Members

        public int Add(object value)
        {
            Add((T)value);
            return IndexOf(value);
        }

        public bool Contains(object value)
        {
            return Contains((T)value);
        }

        public int IndexOf(object value)
        {
            return IndexOf((T)value);
        }

        public void Insert(int index, object value)
        {
            Insert(index, (T)value);
        }

        public bool IsFixedSize
        {
            get { return false; }
        }

        public void Remove(object value)
        {
            Remove((T)value);
        }

        object IList.this[int index]
        {
            get
            {
                return ((IList<T>)this)[index];
            }
            set
            {
                ((IList<T>)this)[index] = (T)value;
            }
        }

        #endregion

        #region ICollection Members

        public void CopyTo(Array array, int index)
        {
            throw new NotImplementedException();
        }

        public bool IsSynchronized
        {
            get { throw new NotImplementedException(); }
        }

        public object SyncRoot
        {
            get { throw new NotImplementedException(); }
        }

        #endregion
    }
}
