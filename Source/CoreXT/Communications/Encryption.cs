#if (NETSTANDARD1_6 || NETSTANDARD2_0 || NETCOREAPP1_0 || NETCOREAPP2_0 || DNXCORE50 || NETCORE45  || NETCORE451 || NETCORE50)
#define DOTNETCORE
#endif

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace CoreXT.Data
{
    public static class Encryption
    {
        // -----------------------------------------------------------------------------------------------------------

        public static string ToBase64Unicode(string text)
        {
            return Convert.ToBase64String(System.Text.Encoding.Unicode.GetBytes(text));
        }

        public static string FromBase64Unicode(string base64Text)
        {
            var bytes = Convert.FromBase64String(base64Text ?? "");
            return System.Text.Encoding.Unicode.GetString(bytes, 0, bytes.Length);
        }

        public static string ToBase64UTF8(string text)
        {
            return Convert.ToBase64String(System.Text.Encoding.UTF8.GetBytes(text));
        }

        public static string FromBase64UTF8(string base64Text)
        {
            var bytes = Convert.FromBase64String(base64Text ?? "");
            return System.Text.Encoding.UTF8.GetString(bytes, 0, bytes.Length);
        }

        // -----------------------------------------------------------------------------------------------------------

        public static string XORStringWithKey(string content, string key)
        {
            if (string.IsNullOrEmpty(content) || string.IsNullOrEmpty(key)) return null;
            char[] contentChars = content.ToCharArray(), keyChars = key.ToCharArray();
            int ci = 0, ki = 0;
            char c;
            do
            {
                c = contentChars[ci];
                c ^= keyChars[ki];
                contentChars[ci] = c;
                ki++;
                if (ki >= key.Length) ki = 0;
                ci++;
            } while (ci < content.Length);
            return new string(contentChars);
        }

        // -----------------------------------------------------------------------------------------------------------

        /// <summary>
        /// Uses a given user ID and an application fixed key value (such as a GUID) to obscure a password for database storage.
        /// </summary>
        public static string GetHashedPassword(string password, string userID, string appkey)
        {
            var pwEncryptionHash = Encryption.ToBase64UTF8(Encryption.XORStringWithKey(appkey, userID));
            return Encryption.ToBase64UTF8(Encryption.XORStringWithKey(password, pwEncryptionHash));
        }

        /// <summary>
        /// Restores a password hashed using the method 'GetHashedPassword()'.
        /// </summary>
        public static string GetUnhashedPassword(string hashedPassword, string userID, string appkey)
        {
            var pwEncryptionHash = Encryption.ToBase64UTF8(Encryption.XORStringWithKey(appkey, userID));
            return Encryption.XORStringWithKey(Encryption.FromBase64UTF8(hashedPassword), pwEncryptionHash);
        }

        // -----------------------------------------------------------------------------------------------------------
    }
}
