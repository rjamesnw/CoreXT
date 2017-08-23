using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace CDS.Web.Filters
{
    // http://stackoverflow.com/questions/8642148/how-to-intercept-view-rendering-to-add-html-js-on-all-partial-views
    // https://weblog.west-wind.com/posts/2009/Nov/13/Capturing-and-Transforming-ASPNET-Output-with-ResponseFilter
    // https://blog.rsuter.com/post-process-the-html-output-of-an-action-in-asp-net-mvc/

    /// <summary>
    /// Allows adding filters to controllers, actions, or even globally, to process the rendered HTML output.
    /// </summary>
    public abstract class OutputActionFilterAttribute : ActionFilterAttribute
    {
        bool _WaitFullPageLoad = false;

        /// <summary>
        /// Construct a new OutputActionFilterAttribute instance.
        /// </summary>
        /// <param name="waitForFullPageLoad">If true, the stream will wait for the whole page to load before applying the filter process.  
        /// If false (default), 'Process()' is called every time the stream gets written to.
        /// If it is desired to stream the results to the client ASAP as the HTML is being rendered, keep the default.</param>
        public OutputActionFilterAttribute(bool waitForFullPageLoad = false)
        {
            _WaitFullPageLoad = waitForFullPageLoad;
        }

        public override void OnResultExecuted(ResultExecutedContext filterContext)
        {
            var response = filterContext.HttpContext.Response;
            response.Filter = new OutputProcessorStream(response.Filter, Encoding.UTF8, Encoding.UTF8,
                s => Process(filterContext, s), _WaitFullPageLoad);
        }

        protected abstract string Process(ResultExecutedContext filterContext, string input);
    }

    /// <summary>
    /// Used to render the resources to the output before sending to the client.
    /// </summary>
    public class CDSPagePostProcessAttribute : OutputActionFilterAttribute
    {
        protected override string Process(ResultExecutedContext filterContext, string input)
        {
            var context = filterContext.HttpContext;
            var cdsResourceList = context.Items["cds-client-resource-list"] as Dictionary<string, ResourceInfo>;

            string headerCSS = "", headerScripts = "", footerScripts = "";

            if (cdsResourceList != null)
            {
                // ... iterate over the resource list, in ascending order as the layout page is usually last to render, but first in the stack, 
                // and inner partial views are rendered first (keeps scripts grouped in order added, and by view) ...

                foreach (var resource in cdsResourceList.Values.OrderBy(r => r.Sequence))
                {
                    switch (resource.ResourceType)
                    {
                        case ResourceTypes.Script:
                            if (resource.RenderTarget == RenderTargets.Footer)
                                footerScripts += RenderResourceElement(context, resource);
                            else
                                headerScripts += RenderResourceElement(context, resource);
                            break;

                        case ResourceTypes.CSS:
                            headerCSS += RenderResourceElement(context, resource);
                            break;

                        default:
                            throw new InvalidOperationException("Resource type value is not supported.");
                    }
                }
            }

            input = input.Replace("<CDS_HEADER_STYLES/>", headerCSS);
            input = input.Replace("<CDS_HEADER_SCRIPTS/>", headerScripts);
            input = input.Replace("<CDS_FOOTER_SCRIPTS/>", footerScripts);

            return input;
        }

        public string RenderResourceElement(HttpContextBase context, ResourceInfo resource)
        {
            TagBuilder tag = null;

            switch (resource.ResourceType)
            {
                case ResourceTypes.CSS:
                    tag = new TagBuilder("link");
                    tag.Attributes.Add("rel", "stylesheet");
                    tag.Attributes.Add("type", "text/css");
                    tag.Attributes.Add("href", UrlHelper.GenerateContentUrl(resource.ResourcePath, context));
                    break;

                case ResourceTypes.Script: // (or Scripts.Render() can be used)
                    tag = new TagBuilder("script");
                    tag.Attributes.Add("type", "text/javascript");
                    tag.Attributes.Add("src", UrlHelper.GenerateContentUrl(resource.ResourcePath, context));
                    break;

                default:
                    throw new InvalidOperationException("Resource type value is not supported.");
            }

            var text = tag?.ToString();

            if (!string.IsNullOrWhiteSpace(text))
                text += Environment.NewLine;

            return text ?? string.Empty;
        }
    }

    internal class OutputProcessorStream : MemoryStream
    {
        readonly Stream _OriginalStream;
        readonly Func<string, string> _PostProcessor;

        readonly Encoding _InputEncoding;
        readonly Encoding _OutputEncoding;

        readonly bool _WaitFullPageLoad;

        public OutputProcessorStream(Stream stream, Encoding inputEncoding, Encoding outputEncoding,
            Func<string, string> postProcessor, bool waitForFullPageLoad)
        {
            _OriginalStream = stream;
            _PostProcessor = postProcessor;
            _InputEncoding = inputEncoding;
            _OutputEncoding = outputEncoding;
            _WaitFullPageLoad = waitForFullPageLoad;
        }

        /// <summary>
        /// Flush the current stream to the output destination.
        /// </summary>
        /// <param name="force">The flush cannot work properly unless the stream is an even multiple of 2. 
        /// If not, the request is ignored unless 'force' is true. This is true automatically when 'Close()' is called, regardless.</param>
        public void Flush(bool force)
        {
            if (Length > 0 && (force || Length % 2 == 0)) // (UTF8 requires at least 2 bytes for proper conversion)
            {
                Position = 0;
                var bytes = ToArray();
                var text = Encoding.UTF8.GetString(bytes);
                var output = _OutputEncoding.GetBytes(_PostProcessor(text));
                _OriginalStream.Write(output, 0, output.Length);
                _OriginalStream.Flush();
                SetLength(0); // (clear)
            }
        }


        /// <summary>
        /// Flush the current stream to the output destination.
        /// </summary>
        public override void Flush()
        {
            Flush(false);
        }

        public override void Write(byte[] buffer, int offset, int count)
        {
            base.Write(buffer, offset, count);
            if (!_WaitFullPageLoad)
                Flush();
        }

        public override void WriteByte(byte value)
        {
            base.WriteByte(value);
            if (!_WaitFullPageLoad)
                Flush();
        }

        /// <summary>
        /// Writes this stream to the original HTML stream and flushes it.
        /// </summary>
        public override void Close()
        {
            Flush(true);
        }
    }
}
