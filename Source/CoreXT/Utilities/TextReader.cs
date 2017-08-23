#if (NETSTANDARD1_5 || NETSTANDARD1_6 || NETCOREAPP1_0 || DNXCORE50 || NETCORE45  || NETCORE451 || NETCORE50)
#define DOTNETCORE
#endif

namespace CoreXT
{
    /// <summary>
    /// A class used for parsing text and reading the parsed text items.
    /// By default, it knows to detect typical code-style identifiers, words, numbers, and symbols (separated by whitespace and other symbols).
    /// </summary>
    public class TextReader
    {
        public string SourceText = "";

        public string SkippedText = "";
        public string Text = "";
        public string TokenText = "";

        public int Index1, Index2, SkippedStartIndex;
        int _Index1, _Index2, _SkippedStartIndex;

        public TextReader(string sourceText)
        {
            SourceText = sourceText;
            Reset();
        }

        public static bool IsAlpha(char chr)
        {
            return (chr >= 'A' && chr <= 'Z' || chr >= 'a' && chr <= 'z');
        }

        public static bool IsNum(char chr)
        {
            return (chr >= '0' && chr <= '9');
        }

        public static bool IsNumOrDecimal(char chr)
        {
            return (IsNum(chr) || chr == '.');
        }

        public static bool IsAlphaNum(char chr)
        {
            return (IsAlpha(chr) || IsNum(chr));
        }

        public static bool IsIdent(char chr) // for identifier based characters
        {
            return (IsAlphaNum(chr) || chr == '_');
        }

        public static bool IsWhitespace(char chr)
        {
            return (chr <= ' ');
        }

        /// <summary>
        /// Returns a word, digit, or special character, or and empty string if there's nothing more to read.
        /// </summary>
        public string Read() { return _Read(); }

        /// <summary>
        /// Same as Read(), except the read indexes are not updated. The result returned is exactly what the
        /// next call to Read() will return.
        /// </summary>
        public string Peek() { return _Read(true); }

        /// <summary>
        /// After peeking, some properties are changed ('SkippedText' and 'Text').
        /// This method restores them back to their original values.
        /// values.
        /// </summary>
        /// <returns></returns>
        public string Reread()
        {
            SkippedText = SourceText.Substring(SkippedStartIndex, Index1);
            Text = SourceText.Substring(Index1, Index2);
            return Text;
        }

        // Returns "" if nothing more to read.
        string _Read(bool peek)
        {
            if (SourceText.Length == 0 || Index1 >= SourceText.Length) return "";

            int i1 = Index1, i2 = Index2, ssi = SkippedStartIndex;

            i1 = i2;
            ssi = i1;
            char c = '\0';

            // ... skip any white space and find first alpha numeric character or symbol ...

            while (i1 < SourceText.Length)
            {
                c = SourceText[i1];
                if (!IsWhitespace(c)) { i2 = i1 + 1; break; }
                i1++;
            }

            if (i2 > i1)
            {
                // ... if numeric, read to end of numbers, else read alpha text and digits together ...

                if (IsNum(c))
                { // read to end of numbers
                    while (i2 < SourceText.Length && IsNumOrDecimal(SourceText[i2]))
                        i2++;
                }
                else if (IsAlpha(c))
                { // read to next symbol, space, or end of text
                    while (i2 < SourceText.Length && IsAlphaNum(SourceText[i2]))
                        i2++;
                }
            }
            else i2 = i1;

            // ... either at end of char type, or end of the text, but either way, need to backup ...

            if (i1 > ssi)
                SkippedText = SourceText.Substring(ssi, i1 - ssi);
            else
                SkippedText = "";

            if (i2 > i1)
                Text = SourceText.Substring(i1, i2 - i1);
            else
                Text = "";

            // ... commit changes if we are not "peeking" ...

            if (!peek)
            {
                _Index1 = Index1;
                _Index2 = Index2;
                _SkippedStartIndex = SkippedStartIndex;

                Index1 = i1;
                Index2 = i2;
                SkippedStartIndex = ssi;
            }

            return Text;
        }
        string _Read() { return _Read(false); }

        /// <summary>
        /// Searches for token text between two specified characters.  
        /// </summary>
        /// <param name="leftChar">The left character to look for, which starts the token text.</param>
        /// <param name="rightChar">The right character to look for, which ends the token text.</param>
        /// <param name="escapeChar">An escape character, usually used with strings (not used by default).</param>
        /// <param name="doubleChar">A character that has been doubled up, such as is done with string quotes when embedded in other strings (not used by default).</param>
        public string ReadToken(char leftChar, char rightChar, char escapeChar, char doubleChar)
        {
            if (SourceText.Length == 0 || Index1 >= SourceText.Length) return "";

            _Index1 = Index1;
            _Index2 = Index2;
            _SkippedStartIndex = SkippedStartIndex;

            Index1 = Index2;
            SkippedStartIndex = Index1;

            var c = '\0';
            bool leftFound = false, rightFound = false;

            // ... skip any white space and find first alpha numeric character or symbol ...

            while (Index1 < SourceText.Length)
            {
                c = SourceText[Index1];
                if (c == leftChar) { leftFound = true; Index2 = Index1 + 1; break; }
                Index1++;
            }

            if (Index2 > Index1)
            {
                // ... if numeric, read to end of numbers, else read alpha text and digits together ...

                while (Index2 < SourceText.Length)
                {
                    c = SourceText[Index2];
                    if (c == escapeChar || c == doubleChar && (Index2 + 1) < SourceText.Length && SourceText[Index2 + 1] == doubleChar)
                        Index2 += 2;
                    else
                    {
                        Index2++;
                        if (c == rightChar) { rightFound = true; break; }
                    }
                }
            }
            else Index2 = Index1;

            if (Index1 > SkippedStartIndex)
                SkippedText = SourceText.Substring(SkippedStartIndex, Index1 - SkippedStartIndex);
            else
                SkippedText = "";

            if (Index2 > Index1)
                Text = SourceText.Substring(Index1, Index2 - Index1);
            else
                Text = "";

            var tti1 = Index1 + (leftFound ? 1 : 0);
            var tti2 = Index2 - (rightFound ? 1 : 0);

            if (tti2 > tti1)
                TokenText = SourceText.Substring(tti1, tti2 - tti1);
            else
                TokenText = "";

            return Text;
        }
        public string ReadToken(char leftChar, char rightChar) { return ReadToken(leftChar, rightChar, '\0', '\0'); }

        /// <summary>
        /// Steps back one time so that the next call to Read() or ReadToken() rereads to same text as before.
        /// This method can only be called once - subsequent calls does nothing.
        /// </summary>
        public void StepBack()
        {
            Index1 = _Index1;
            Index2 = _Index2;
            SkippedStartIndex = _SkippedStartIndex;
        }

        public void Reset()
        {
            Text = "";
            SkippedText = "";
            TokenText = "";
            Index1 = 0;
            Index2 = 0;
            SkippedStartIndex = 0;
        }
    }
}
