declare namespace CoreXT.System.Text {
    namespace Encoding {
        enum Base64Modes {
            /** Use standard Base64 encoding characters. */
            Standard = 0,
            /** Use Base64 encoding that is compatible with URIs (to help encode query values). */
            URI = 1,
            /** Use custom user-supplied Base64 encoding characters (the last character is used for padding, so there should be 65 characters total).
            * Set 'Security.__64BASE_ENCODING_CHARS_CUSTOM' to your custom characters for this option (defaults to standard characters).
            */
            Custom = 2
        }
        var __64BASE_ENCODING_CHARS_STANDARD: string;
        var __64BASE_ENCODING_CHARS_URI: string;
        var __64BASE_ENCODING_CHARS_CUSTOM: string;
        /** Applies a base-64 encoding to the a value.  The characters used are selected based on the specified encoding 'mode'.
        * The given string is scanned for character values greater than 255 in order to auto detect the character bit depth to use.
        * @param (string) value The string value to encode.  If the value is not a string, it will be converted to one.
        * @param (Base64Modes) mode Selects the type of encoding characters to use (default is Standard).
        * @param (boolean) usePadding If true (default), Base64 padding characters are added to the end of strings that are no divisible by 3.
        *                             Exception: If the mode is URI encoding, then padding is false by default.
        */
        function base64Encode(value: string, mode?: Base64Modes, usePadding?: boolean): string;
        /** Decodes a base-64 encoded string value.  The characters used for decoding are selected based on the specified encoding 'mode'.
        * The given string is scanned for character values greater than 255 in order to auto detect the character bit depth to use.
        * @param (string) value The string value to encode.  If the value is not a string, it will be converted to one.
        * @param (Base64Modes) mode Selects the type of encoding characters to use (default is Standard).
        */
        function base64Decode(value: string, mode?: Base64Modes): string;
    }
    namespace HTML {
        function uncommentHTML(html: string): string;
        function getCommentText(html: string): string;
        function getScriptCommentText(html: string): string;
    }
}
