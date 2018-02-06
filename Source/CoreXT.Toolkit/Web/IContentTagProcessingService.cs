using Microsoft.AspNetCore.Http;

namespace CoreXT.Toolkit.Web
{
    /// <summary>
    /// Used to render the CDS control resources to the output before sending to the client.
    /// </summary>
    public interface IContentTagProcessingService
    {
        string Process(string input);
        string RenderResourceElement(ResourceInfo resource);
    }
}
