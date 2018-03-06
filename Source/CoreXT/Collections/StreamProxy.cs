using System;
using System.Data;
using System.IO;
using System.Security;

namespace CoreXT.CollectionsAndLists
{
    /// <summary>
    ///     A stream wrapper to act as a proxy to another stream. This allows one to wrap another stream without providing direct access to the original stream.
    ///     The StreamProxy can optionally ensure that the underlying stream is readonly.
    /// </summary>
    /// <seealso cref="T:System.IO.Stream"/>
    public class StreamProxy : Stream // TODO: Needs more consideration for multi-threaded environments (perhaps ThreadStatic/AsyncStatic properties?).
    {
        /// <summary> The proxy stream. </summary>
        Stream _Proxy;
        Stream _WritableProxy
        {
            get => !_IsReadOnly ? _Proxy : throw new ReadOnlyException("The stream is readonly.");
            set { if (!_IsReadOnly) _Proxy = value; else throw new ReadOnlyException("The stream is readonly."); }
        }
        /// <summary> True if is read only, false if not. </summary>
        bool _IsReadOnly;

        /// <summary> Will construct a StreamProxy backed by the specified stream and leave the target modifiable. </summary>
        /// <param name="targetOfProxy"> The stream that is backing the proxy. </param>
        public StreamProxy(Stream targetOfProxy)
            : this(targetOfProxy, false)
        {
        }

        /// <summary>
        ///     Constructs a StreamProxy backed by the specified stream and optionally makes the target read-only.
        /// </summary>
        /// <param name="targetOfProxy"> The stream that is backing the proxy. </param>
        /// <param name="isTargetReadOnly">
        ///     Whether or not the target should be set to read-only.
        ///     <securitynote>
        ///     Critical 1) Setting critical for set values _proxy &amp; _isTargetReadOnly. TreatAsSafe 1) We only want to ensure
        ///     that the user cannot circumvent using either the constructor or the Target property to set the proxy.  Creating the
        ///     StreamProxy itself is a safe operation.
        ///     </securitynote>
        /// </param>
        public StreamProxy(Stream targetOfProxy, bool isTargetReadOnly)
        {
            _Proxy = targetOfProxy;
            _IsReadOnly = isTargetReadOnly;
        }

        /// <summary>
        ///     <see cref="System.IO.Stream">
        ///     </see>
        /// </summary>
        /// <value> A true or false value. </value>
        /// <seealso cref="P:System.IO.Stream.CanRead"/>
        public override bool CanRead => _Proxy.CanRead;

        /// <summary>
        ///     <see cref="System.IO.Stream">
        ///     </see>
        /// </summary>
        /// <value> A true or false value. </value>
        /// <seealso cref="P:System.IO.Stream.CanSeek"/>
        public override bool CanSeek => _Proxy.CanSeek;

        /// <summary>
        ///     <see cref="System.IO.Stream">
        ///     </see>
        /// </summary>
        /// <value> A true or false value. </value>
        /// <seealso cref="P:System.IO.Stream.CanTimeout"/>
        public override bool CanTimeout => _Proxy.CanTimeout;

        /// <summary>
        ///     <see cref="System.IO.Stream">
        ///     </see>
        /// </summary>
        /// <value> A true or false value. </value>
        /// <seealso cref="P:System.IO.Stream.CanWrite"/>
        public override bool CanWrite => !_IsReadOnly;

        /// <summary>
        ///     <see cref="System.IO.Stream">
        ///     </see>
        /// </summary>
        /// <seealso cref="M:System.IO.Stream.Close()"/>
        public override void Close() => _Proxy.Close();

        /// <summary>
        ///     <see cref="System.IO.Stream">
        ///     </see>
        /// </summary>
        /// <seealso cref="M:System.IO.Stream.Flush()"/>
        public override void Flush() => _Proxy.Flush();

        /// <summary>
        ///     <see cref="System.IO.Stream">
        ///     </see>
        /// </summary>
        /// <value> The length. </value>
        /// <seealso cref="P:System.IO.Stream.Length"/>
        public override long Length => _Proxy.Length;

        /// <summary>
        ///     <see cref="System.IO.Stream">
        ///     </see>
        /// </summary>
        /// <value> The position. </value>
        /// <seealso cref="P:System.IO.Stream.Position"/>
        public override long Position
        {
            get => _Proxy.Position;
            set => _Proxy.Position = value;
        }

        /// <summary>
        ///     <see cref="System.IO.Stream">
        ///     </see>
        /// </summary>
        /// <param name="buffer">
        ///     An array of bytes. When this method returns, the buffer contains the specified byte array with the values between
        ///     offset and (offset + count - 1) replaced by the bytes read from the current source.
        /// </param>
        /// <param name="offset">
        ///     The zero-based byte offset in buffer at which to begin storing the data read from the current stream.
        /// </param>
        /// <param name="count"> The maximum number of bytes to be read from the current stream. </param>
        /// <returns> An int. </returns>
        /// <seealso cref="M:System.IO.Stream.Read(byte[],int,int)"/>
        public override int Read(byte[] buffer, int offset, int count) => _Proxy.Read(buffer, offset, count);

        /// <summary>
        ///     <see cref="System.IO.Stream">
        ///     </see>
        /// </summary>
        /// <value> The read timeout. </value>
        /// <seealso cref="P:System.IO.Stream.ReadTimeout"/>
        public override int ReadTimeout
        {
            get => _Proxy.ReadTimeout;
            set => _WritableProxy.ReadTimeout = value;
        }

        /// <summary>
        ///     <see cref="System.IO.Stream">
        ///     </see>
        /// </summary>
        /// <param name="offset"> A byte offset relative to the origin parameter. </param>
        /// <param name="origin">
        ///     A value of type <see cref="T:System.IO.SeekOrigin"></see> indicating the reference point used to obtain the new
        ///     position.
        /// </param>
        /// <returns> A long. </returns>
        /// <seealso cref="M:System.IO.Stream.Seek(long,SeekOrigin)"/>
        public override long Seek(long offset, SeekOrigin origin) => _Proxy.Seek(offset, origin);

        /// <summary>
        ///     <see cref="System.IO.Stream">
        ///     </see>
        /// </summary>
        /// <param name="value"> The desired length of the current stream in bytes. </param>
        /// <seealso cref="M:System.IO.Stream.SetLength(long)"/>
        public override void SetLength(long value) => _WritableProxy.SetLength(value);

        /// <summary>
        ///     <see cref="System.IO.Stream">
        ///     </see>
        /// </summary>
        /// <param name="buffer"> An array of bytes. This method copies count bytes from buffer to the current stream. </param>
        /// <param name="offset"> The zero-based byte offset in buffer at which to begin copying bytes to the current stream. </param>
        /// <param name="count"> The number of bytes to be written to the current stream. </param>
        /// <seealso cref="M:System.IO.Stream.Write(byte[],int,int)"/>
        public override void Write(byte[] buffer, int offset, int count) => _WritableProxy.Write(buffer, offset, count);

        /// <summary>
        ///     <see cref="System.IO.Stream">
        ///     </see>
        /// </summary>
        /// <value> The write timeout. </value>
        /// <seealso cref="P:System.IO.Stream.WriteTimeout"/>
        public override int WriteTimeout
        {
            get => _Proxy.WriteTimeout;
            set => _WritableProxy.WriteTimeout = value;
        }

        /// <summary>
        ///     <see cref="System.IO.Stream">
        ///     </see>
        /// </summary>
        /// <param name="disposing">
        ///     true to release both managed and unmanaged resources; false to release only unmanaged resources.
        /// </param>
        /// <seealso cref="M:System.IO.Stream.Dispose(bool)"/>
        protected override void Dispose(bool disposing)
        {
            try
            {
                // other operations like async methods in
                // our base class call us, we need them to
                // clean up before we release the proxy
                base.Dispose(disposing);
            }
            finally
            {
                _Proxy = null;
            }
        }

        /// <summary>
        ///     <see cref="System.Object">
        ///     </see>
        /// </summary>
        /// <returns> A hash code for this object. </returns>
        /// <seealso cref="M:System.Object.GetHashCode()"/>
        public override int GetHashCode()
        {
            return _Proxy.GetHashCode();
        }

        /// <summary>
        ///     <see cref="System.Object">
        ///     </see>
        /// </summary>
        /// <param name="obj"> The object to compare with the current object. </param>
        /// <returns> True if the objects are considered equal, false if they are not. </returns>
        /// <seealso cref="M:System.Object.Equals(object)"/>
        public override bool Equals(object obj)
        {
            return _Proxy.Equals(obj);
        }

        /// <summary> Gets or sets the Target for the proxy. </summary>
        /// <exception cref="ReadOnlyException"> Thrown when a Read Only error condition occurs. </exception>
        /// <value> The target. </value>
        internal Stream Target
        {
            get => _Proxy;
            set => _WritableProxy = value;
        }
    }
}