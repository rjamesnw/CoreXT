using MailKit.Net.Smtp;
using MimeKit;
using MimeKit.Text;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CoreXT.IO
{
    public static class EmailExtensions
    {
        public static MimeMessage SetHTMLBody(this MimeMessage mailMessage, string body)
        {
            mailMessage.Body = new TextPart(TextFormat.Html) { Text = body };
            return mailMessage;
        }

        public static MimeMessage SetTextBody(this MimeMessage mailMessage, string body)
        {
            mailMessage.Body = new TextPart(TextFormat.Plain) { Text = body };
            return mailMessage;
        }

        public static MimeMessage SetBody(this MimeMessage mailMessage, string body, TextFormat format = TextFormat.Html)
        {
            mailMessage.Body = new TextPart(format) { Text = body };
            return mailMessage;
        }

        public static MimeMessage To(this MimeMessage mailMessage, params string[] addresses)
        {
            foreach (var address in addresses)
                if (!string.IsNullOrWhiteSpace(address))
                    mailMessage.To.Add(new MailboxAddress(address));
            return mailMessage;
        }

        public static MimeMessage From(this MimeMessage mailMessage, params string[] addresses)
        {
            foreach (var address in addresses)
                if (!string.IsNullOrWhiteSpace(address))
                    mailMessage.From.Add(new MailboxAddress(address));
            return mailMessage;
        }

        public static void SendEmail(this MimeMessage mailMessage, string host = "localhost", int port = 25, string username = null, string password = null)
        {
            using (var client = new SmtpClient())
            {
                client.Connect("localhost", 25, false);
                client.AuthenticationMechanisms.Remove("XOAUTH2");
                // Note: since we don't have an OAuth2 token, disable the XOAUTH2 authentication mechanism.
                if (!string.IsNullOrWhiteSpace(username))
                    client.Authenticate(username, password);
                client.Send(mailMessage);
                client.Disconnect(true);
            }
        }
    }
}
