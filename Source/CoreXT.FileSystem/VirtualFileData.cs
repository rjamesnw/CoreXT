using System;
using System.Collections.Generic;
using System.IO;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace CoreXT.FileSystem
{
    public class VirtualFileData : MemoryStream
    {
        public readonly VirtualFileInfo VirtualFileInfo;

        public VirtualFileData(VirtualFileInfo virtualFileInfo)
        {
            VirtualFileInfo = virtualFileInfo;
        }

        /// <summary> Triggered when the data changes. </summary>
        public event Action<VirtualFileData> Changed;
        /// <summary> Executes the changed operation. </summary>
        void _DoChanged() => Changed.Invoke(this);


        /// <summary> Triggered when 'Dispose()' is called. </summary>
        public event Action<VirtualFileData> Disposed;
        /// <summary> Executes the disposed operation. </summary>
        void _DoDisposed() => Disposed.Invoke(this);

        /// <summary> Gets or sets the number of bytes allocated for this stream. </summary>
        /// <value> The length of the usable portion of the buffer for the stream. </value>
        /// <seealso cref="P:System.IO.MemoryStream.Capacity"/>
        public override int Capacity { get => base.Capacity; set { base.Capacity = value; _DoChanged(); } }

        /// <summary> Sets the length of the current stream to the specified value. </summary>
        /// <param name="value"> The value at which to set the length. </param>
        /// <seealso cref="M:System.IO.MemoryStream.SetLength(long)"/>
        public override void SetLength(long value)
        {
            base.SetLength(value);
            _DoChanged();
        }

        /// <summary> Writes a block of bytes to the current stream using data read from a buffer. </summary>
        /// <param name="buffer"> The buffer to write data from. </param>
        /// <param name="offset"> The zero-based byte offset in buffer at which to begin copying bytes to the current stream. </param>
        /// <param name="count"> The maximum number of bytes to write. </param>
        /// <seealso cref="M:System.IO.MemoryStream.Write(byte[],int,int)"/>
        public override void Write(byte[] buffer, int offset, int count)
        {
            base.Write(buffer, offset, count);
            _DoChanged();
        }

        /// <summary>
        ///     Asynchronously writes a sequence of bytes to the current stream, advances the current position within this stream by
        ///     the number of bytes written, and monitors cancellation requests.
        /// </summary>
        /// <param name="buffer"> The buffer to write data from. </param>
        /// <param name="offset"> The zero-based byte offset in buffer from which to begin copying bytes to the stream. </param>
        /// <param name="count"> The maximum number of bytes to write. </param>
        /// <param name="cancellationToken">
        ///     The token to monitor for cancellation requests. The default value is
        ///     <see cref="P:System.Threading.CancellationToken.None"></see>.
        /// </param>
        /// <returns> A task that represents the asynchronous write operation. </returns>
        /// <seealso cref="M:System.IO.MemoryStream.WriteAsync(byte[],int,int,CancellationToken)"/>
        public async override Task WriteAsync(byte[] buffer, int offset, int count, CancellationToken cancellationToken)
        {
            await base.WriteAsync(buffer, offset, count, cancellationToken);
            _DoChanged();
        }

        /// <summary> Writes a byte to the current stream at the current position. </summary>
        /// <param name="value"> The byte to write. </param>
        /// <seealso cref="M:System.IO.MemoryStream.WriteByte(byte)"/>
        public override void WriteByte(byte value)
        {
            base.WriteByte(value);
            _DoChanged();
        }

        /// <summary>
        ///     Releases the unmanaged resources used by the <see cref="T:System.IO.MemoryStream"></see> class and optionally
        ///     releases the managed resources.
        /// </summary>
        /// <param name="disposing">
        ///     true to release both managed and unmanaged resources; false to release only unmanaged resources.
        /// </param>
        /// <seealso cref="M:System.IO.MemoryStream.Dispose(bool)"/>
        protected override void Dispose(bool disposing)
        {
            base.Dispose(disposing);

            if (disposing)
                _DoDisposed(); // (called outside the GC to manually dispose the object)
        }
    }
}
