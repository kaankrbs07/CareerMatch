
using CareerMatch.Services.Interfaces;
using Microsoft.Extensions.Configuration;
using MailKit.Net.Smtp;
using MimeKit;

namespace CareerMatch.Services.Implementations
{
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _configuration;

        public EmailService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task SendEmailAsync(string to, string subject, string body)
        {
            var smtpSettings = _configuration.GetSection("Smtp");
            
            var host = smtpSettings["Host"] ?? throw new InvalidOperationException("Host konfigürasyonu eksik.");
            var port = int.Parse(smtpSettings["Port"] ?? "587");
            var senderEmail = smtpSettings["SenderEmail"] ?? throw new InvalidOperationException("SenderEmail konfigürasyonu eksik.");
            var senderName = smtpSettings["SenderName"] ?? "Carrier Match";
            var username = smtpSettings["Username"] ?? throw new InvalidOperationException("Username konfigürasyonu eksik.");
            var password = smtpSettings["Password"] ?? throw new InvalidOperationException("Password konfigürasyonu eksik.");
            var useSsl = bool.Parse(smtpSettings["UseSsl"] ?? "true");

            var message = new MimeMessage();
            message.From.Add(new MailboxAddress(senderName, senderEmail));
            message.To.Add(new MailboxAddress("", to));
            message.Subject = subject;

            var bodyBuilder = new BodyBuilder
            {
                HtmlBody = body
            };
            message.Body = bodyBuilder.ToMessageBody();

            using var client = new SmtpClient();
            
            // Port 465 için SecureSocketOptions.SslOnConnect kullanılır (Implicit SSL)
            await client.ConnectAsync(host, port, MailKit.Security.SecureSocketOptions.SslOnConnect);
            await client.AuthenticateAsync(username, password);
            await client.SendAsync(message);
            await client.DisconnectAsync(true);
        }
    }
}

