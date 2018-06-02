using CoreXT.MVC.ResourceManagement;
using Microsoft.AspNetCore.Http;

namespace CoreXT.MVC.PostProcessing
{
    /// <summary>
    /// Used to render the CDS control resources to the output before sending to the client.
    /// </summary>
    public interface IContentPostProcessor
    {
        string Process(string input);
        string RenderResourceElement(ResourceInfo resource);
    }
}
