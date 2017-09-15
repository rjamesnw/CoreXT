// ###########################################################################################################################
// Text manipulation utility functions.
// ###########################################################################################################################

namespace CoreXT.System.Text {
    // =======================================================================================================================

    export module RegEx {
        // -------------------------------------------------------------------------------------------------------------------

        /** Escapes a RegEx string so it behaves like a normal string. This is useful for RexEx string based operations, such as 'replace()'. */
        export function escapeRegex(regExStr: string): string {
            return regExStr.replace(/([.?*+^$[\]\\(){}-])/g, "\\$1"); // TODO: Verify completeness.
        }

        // -------------------------------------------------------------------------------------------------------------------
    }

    export module Encoding {
        //  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .

        export enum Base64Modes {
            /** Use standard Base64 encoding characters. */
            Standard,
            /** Use Base64 encoding that is compatible with URIs (to help encode query values). */
            URI,
            /** Use custom user-supplied Base64 encoding characters (the last character is used for padding, so there should be 65 characters total).
            * Set 'Security.__64BASE_ENCODING_CHARS_CUSTOM' to your custom characters for this option (defaults to standard characters).
            */
            Custom
        };

        export var __64BASE_ENCODING_CHARS_STANDARD = global.String("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=");
        export var __64BASE_ENCODING_CHARS_URI = global.String("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_%3D"); // (note: %3D is treaded as one char [an % encoded '='])
        export var __64BASE_ENCODING_CHARS_CUSTOM = __64BASE_ENCODING_CHARS_STANDARD;
        // (Note: There must be exactly 65 characters [64 + 1 for padding])
        // (Note: 'String' objects MUST be used in order for the encoding functions to populate the reverse lookup indexes)

        function __CreateCharIndex(str: String) {
            if (str.length < 65)
                throw Exception.from("65 characters expected for base64 encoding characters (last character is for padding), but only " + str.length + " are specified.", str);
            if (typeof str !== "object" && !(str instanceof String))
                throw Exception.from("The encoding characters must be set in a valid 'String' OBJECT (not as a string VALUE).");
            if (!str['charIndex']) {
                var index: { [index: string]: number } = {};
                for (var i = 0, n = str.length; i < n; ++i)
                    index[str[i]] = i;
                str['charIndex'] = index;
            }
        }

        /** Applies a base-64 encoding to the a value.  The characters used are selected based on the specified encoding 'mode'.
        * The given string is scanned for character values greater than 255 in order to auto detect the character bit depth to use.
        * @param (string) value The string value to encode.  If the value is not a string, it will be converted to one.
        * @param (Base64Modes) mode Selects the type of encoding characters to use (default is Standard).
        * @param (boolean) usePadding If true (default), Base64 padding characters are added to the end of strings that are no divisible by 3.
        *                             Exception: If the mode is URI encoding, then padding is false by default.
        */
        export function base64Encode(value: string, mode: Base64Modes = Base64Modes.Standard, usePadding?: boolean): string {
            if (value === void 0 || value === null) value = ""; else value = "" + value;
            if (value.length == 0) return "";

            if (usePadding === void 0)
                usePadding = (mode != Base64Modes.URI);

            var encodingChars: String = (mode == Base64Modes.Standard ? __64BASE_ENCODING_CHARS_STANDARD : (mode == Base64Modes.URI ? __64BASE_ENCODING_CHARS_URI : __64BASE_ENCODING_CHARS_CUSTOM));

            // ... make sure the reverse lookup exists, and populate if missing  (which also serves to validate the encoding chars) ...

            if (!encodingChars['charIndex'])
                __CreateCharIndex(encodingChars);

            // ... determine the character bit depth ...

            var srcCharBitDepth = 8; // (regular 8-bit ASCII chars is the default, unless Unicode values are detected)
            for (var i = value.length - 1; i >= 0; --i)
                if (value.charCodeAt(i) > 255) {
                    srcCharBitDepth = 16; // (Unicode mode [16-bit])
                    value = String.fromCharCode(0) + value; // (note: 0 is usually understood to be a null character, and is used here to flag Unicode encoding [two 0 bytes at the beginning])
                    break;
                }
            var shiftCount = srcCharBitDepth - 1;
            var bitClearMask = (1 << shiftCount) - 1;

            // ... encode the values as a virtual stream of bits, from one buffer to another ...

            var readIndex = 0, readBitIndex = srcCharBitDepth;
            var writeBitIndex = 0;
            var code: number, bit: number, baseCode: number = 0;
            var result = "";
            var paddingLength = usePadding ? (3 - Math.floor(value.length * (srcCharBitDepth / 8) % 3)) : 0;
            if (paddingLength == 3) paddingLength = 0;

            while (true) {
                if (readBitIndex == srcCharBitDepth) {
                    if (readIndex >= value.length) {
                        // ... finished ...
                        if (writeBitIndex > 0) // (this will be 0 for strings evenly divisible by 3)
                            result += encodingChars.charAt(baseCode << (6 - writeBitIndex)); // (set remaining code [shift left to fill zeros as per spec])
                        if (usePadding && paddingLength) {
                            var paddingChar = encodingChars.substring(64);
                            while (paddingLength--)
                                result += paddingChar;
                        }
                        break;
                    }
                    readBitIndex = 0;
                    code = value.charCodeAt(readIndex++);
                }

                bit = code >> shiftCount;
                code = (code & bitClearMask) << 1;
                ++readBitIndex;
                baseCode = (baseCode << 1) | bit;
                ++writeBitIndex;

                if (writeBitIndex == 6) {
                    writeBitIndex = 0;
                    result += encodingChars.charAt(baseCode);
                    baseCode = 0;
                }
            }

            return result;
        }

        /** Decodes a base-64 encoded string value.  The characters used for decoding are selected based on the specified encoding 'mode'.
        * The given string is scanned for character values greater than 255 in order to auto detect the character bit depth to use.
        * @param (string) value The string value to encode.  If the value is not a string, it will be converted to one.
        * @param (Base64Modes) mode Selects the type of encoding characters to use (default is Standard).
        */
        export function base64Decode(value: string, mode: Base64Modes = Base64Modes.Standard): string {
            if (value === void 0 || value === null) value = ""; else value = "" + value;
            if (value.length == 0) return "";

            var encodingChars: String = (mode == Base64Modes.Standard ? __64BASE_ENCODING_CHARS_STANDARD : (mode == Base64Modes.URI ? __64BASE_ENCODING_CHARS_URI : __64BASE_ENCODING_CHARS_CUSTOM));

            // ... make sure the reverse lookup exists, and populate if missing  (which also serves to validate the encoding chars) ...

            if (!encodingChars['charIndex'])
                __CreateCharIndex(encodingChars);

            // ... determine the character bit depth ...

            var srcCharBitDepth = 8; // (regular 8-bit ASCII chars is the default, unless Unicode values are detected)
            if (value.charAt(0) == 'A')// (normal ASCII encoded characters will never start with "A" (a 'null' character), so this serves as the Unicode flag)
                srcCharBitDepth = 16;
            var shiftCount = srcCharBitDepth - 1;
            var bitClearMask = (1 << shiftCount) - 1;

            // ... remove the padding characters (not required) ...

            var paddingChar = encodingChars.substring(64);
            while (value.substring(value.length - paddingChar.length) == paddingChar)
                value = value.substring(0, value.length - paddingChar.length);
            var resultLength = Math.floor((value.length * 6) / 8) / (srcCharBitDepth / 8); // (Base64 produces 4 characters for every 3 input bytes)
            // (note: resultLength includes the null char)

            // ... decode the values as a virtual stream of bits, from one buffer to another ...

            var readIndex = 0, readBitIndex = 6;
            var writeBitIndex = 0;
            var code: number, bit: number, baseCode: number = 0;
            var result = "";
            var charCount = 0;

            while (true) {
                if (readBitIndex == 6) {
                    readBitIndex = 0;
                    code = readIndex < value.length ? encodingChars['charIndex'][value.charAt(readIndex++)] : 0;
                    if (code === void 0)
                        throw Exception.from("The value '" + value + "' has one or more invalid characters.  Valid characters for the specified encoding mode '" + Base64Modes[mode] + "' are: '" + encodingChars + "'");
                }

                bit = code >> 5; // (read left most bit; base64 values are always 6 bit)
                code = (code & 31) << 1; // (clear left most bit and shift left)
                ++readBitIndex;
                baseCode = (baseCode << 1) | bit;
                ++writeBitIndex;

                if (writeBitIndex == srcCharBitDepth) {
                    writeBitIndex = 0;
                    if (baseCode) // (should never be 0 [null char])
                        result += String.fromCharCode(baseCode);
                    if (++charCount >= resultLength) break; // (all expected characters written)
                    baseCode = 0;
                }
            }

            return result;
        }
    }

    // =======================================================================================================================

    export module HTML {
        // -------------------------------------------------------------------------------------------------------------------

        // Removes the '<!-- -->' comment sequence from the ends of the specified HTML.
        export function uncommentHTML(html: string): string { // TODO: Consider using regex
            var content = ("" + html).trim();
            var i1 = 0, i2 = content.length;
            if (content.substring(0, 4) == "<!--") i1 = 4;
            if (content.substr(content.length - 3) == "-->") i2 -= 3;
            if (i1 > 0 || i2 < content.length)
                content = content.substring(i1, i2);
            return content;
        }

        // -------------------------------------------------------------------------------------------------------------------

        // Gets the text between '<!-- -->' (assumed to be at each end of the given HTML).
        export function getCommentText(html: string): string { // TODO: Consider using regex
            var content = ("" + html).trim();
            var i1 = content.indexOf("<!--"), i2 = content.lastIndexOf("-->");
            if (i1 < 0) i1 = 0;
            if (i2 < 0) i2 = content.length;
            return content.substring(i1, i2);
        }

        // -------------------------------------------------------------------------------------------------------------------

        // Gets the text between '<!-- -->' (assumed to be at each end of the given HTML).
        export function getScriptCommentText(html: string): string { // TODO: Consider using regex.
            var content = ("" + html).trim();
            var i1 = content.indexOf("/*"), i2 = content.lastIndexOf("*/");
            if (i1 < 0) i1 = 0;
            if (i2 < 0) i2 = content.length;
            return content.substring(i1, i2);
        }

        // -------------------------------------------------------------------------------------------------------------------
    }

    // =======================================================================================================================
}

// ###########################################################################################################################
