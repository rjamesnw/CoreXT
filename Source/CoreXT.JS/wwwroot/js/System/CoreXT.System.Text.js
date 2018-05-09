var CoreXT;
(function (CoreXT) {
    var System;
    (function (System) {
        var Text;
        (function (Text) {
            var RegEx;
            (function (RegEx) {
                CoreXT.registerNamespace("CoreXT", "System", "Text", "RegEx");
                function escapeRegex(regExStr) {
                    return regExStr.replace(/([.?*+^$[\]\\(){}-])/g, "\\$1");
                }
                RegEx.escapeRegex = escapeRegex;
            })(RegEx = Text.RegEx || (Text.RegEx = {}));
            var Encoding;
            (function (Encoding) {
                var Base64Modes;
                (function (Base64Modes) {
                    Base64Modes[Base64Modes["Standard"] = 0] = "Standard";
                    Base64Modes[Base64Modes["URI"] = 1] = "URI";
                    Base64Modes[Base64Modes["Custom"] = 2] = "Custom";
                })(Base64Modes = Encoding.Base64Modes || (Encoding.Base64Modes = {}));
                ;
                Encoding.__64BASE_ENCODING_CHARS_STANDARD = CoreXT.global.String("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=");
                Encoding.__64BASE_ENCODING_CHARS_URI = CoreXT.global.String("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_%3D");
                Encoding.__64BASE_ENCODING_CHARS_CUSTOM = Encoding.__64BASE_ENCODING_CHARS_STANDARD;
                function __CreateCharIndex(str) {
                    if (str.length < 65)
                        throw System.Exception.from("65 characters expected for base64 encoding characters (last character is for padding), but only " + str.length + " were specified.", str);
                    if (typeof str !== "object" && !(str instanceof System.String))
                        throw System.Exception.from("The encoding characters must be set in a valid 'String' OBJECT (not as a string VALUE).");
                    if (!str['charIndex']) {
                        var index = {};
                        for (var i = 0, n = str.length; i < n; ++i)
                            index[str[i]] = i;
                        str['charIndex'] = index;
                    }
                }
                function base64Encode(value, mode, usePadding) {
                    if (mode === void 0) { mode = Base64Modes.Standard; }
                    if (value === void 0 || value === null)
                        value = "";
                    else
                        value = "" + value;
                    if (value.length == 0)
                        return "";
                    if (usePadding === void 0)
                        usePadding = (mode != Base64Modes.URI);
                    var encodingChars = (mode == Base64Modes.Standard ? Encoding.__64BASE_ENCODING_CHARS_STANDARD : (mode == Base64Modes.URI ? Encoding.__64BASE_ENCODING_CHARS_URI : Encoding.__64BASE_ENCODING_CHARS_CUSTOM));
                    if (!encodingChars['charIndex'])
                        __CreateCharIndex(encodingChars);
                    var srcCharBitDepth = 8;
                    for (var i = value.length - 1; i >= 0; --i)
                        if (value.charCodeAt(i) > 255) {
                            srcCharBitDepth = 16;
                            value = System.String.fromCharCode(0) + value;
                            break;
                        }
                    var shiftCount = srcCharBitDepth - 1;
                    var bitClearMask = (1 << shiftCount) - 1;
                    var readIndex = 0, readBitIndex = srcCharBitDepth;
                    var writeBitIndex = 0;
                    var code, bit, baseCode = 0;
                    var result = "";
                    var paddingLength = usePadding ? (3 - Math.floor(value.length * (srcCharBitDepth / 8) % 3)) : 0;
                    if (paddingLength == 3)
                        paddingLength = 0;
                    while (true) {
                        if (readBitIndex == srcCharBitDepth) {
                            if (readIndex >= value.length) {
                                if (writeBitIndex > 0)
                                    result += encodingChars.charAt(baseCode << (6 - writeBitIndex));
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
                Encoding.base64Encode = base64Encode;
                function base64Decode(value, mode) {
                    if (mode === void 0) { mode = Base64Modes.Standard; }
                    if (value === void 0 || value === null)
                        value = "";
                    else
                        value = "" + value;
                    if (value.length == 0)
                        return "";
                    var encodingChars = (mode == Base64Modes.Standard ? Encoding.__64BASE_ENCODING_CHARS_STANDARD : (mode == Base64Modes.URI ? Encoding.__64BASE_ENCODING_CHARS_URI : Encoding.__64BASE_ENCODING_CHARS_CUSTOM));
                    if (!encodingChars['charIndex'])
                        __CreateCharIndex(encodingChars);
                    var srcCharBitDepth = 8;
                    if (value.charAt(0) == 'A')
                        srcCharBitDepth = 16;
                    var shiftCount = srcCharBitDepth - 1;
                    var bitClearMask = (1 << shiftCount) - 1;
                    var paddingChar = encodingChars.substring(64);
                    while (value.substring(value.length - paddingChar.length) == paddingChar)
                        value = value.substring(0, value.length - paddingChar.length);
                    var resultLength = Math.floor((value.length * 6) / 8) / (srcCharBitDepth / 8);
                    var readIndex = 0, readBitIndex = 6;
                    var writeBitIndex = 0;
                    var code, bit, baseCode = 0;
                    var result = "";
                    var charCount = 0;
                    while (true) {
                        if (readBitIndex == 6) {
                            readBitIndex = 0;
                            code = readIndex < value.length ? encodingChars['charIndex'][value.charAt(readIndex++)] : 0;
                            if (code === void 0)
                                throw System.Exception.from("The value '" + value + "' has one or more invalid characters.  Valid characters for the specified encoding mode '" + Base64Modes[mode] + "' are: '" + encodingChars + "'");
                        }
                        bit = code >> 5;
                        code = (code & 31) << 1;
                        ++readBitIndex;
                        baseCode = (baseCode << 1) | bit;
                        ++writeBitIndex;
                        if (writeBitIndex == srcCharBitDepth) {
                            writeBitIndex = 0;
                            if (baseCode)
                                result += System.String.fromCharCode(baseCode);
                            if (++charCount >= resultLength)
                                break;
                            baseCode = 0;
                        }
                    }
                    return result;
                }
                Encoding.base64Decode = base64Decode;
            })(Encoding = Text.Encoding || (Text.Encoding = {}));
            var HTML;
            (function (HTML) {
                CoreXT.registerNamespace("CoreXT", "System", "Text", "HTML");
                function uncommentHTML(html) {
                    var content = ("" + html).trim();
                    var i1 = 0, i2 = content.length;
                    if (content.substring(0, 4) == "<!--")
                        i1 = 4;
                    if (content.substr(content.length - 3) == "-->")
                        i2 -= 3;
                    if (i1 > 0 || i2 < content.length)
                        content = content.substring(i1, i2);
                    return content;
                }
                HTML.uncommentHTML = uncommentHTML;
                function getCommentText(html) {
                    var content = ("" + html).trim();
                    var i1 = content.indexOf("<!--"), i2 = content.lastIndexOf("-->");
                    if (i1 < 0)
                        i1 = 0;
                    if (i2 < 0)
                        i2 = content.length;
                    return content.substring(i1, i2);
                }
                HTML.getCommentText = getCommentText;
                function getScriptCommentText(html) {
                    var content = ("" + html).trim();
                    var i1 = content.indexOf("/*"), i2 = content.lastIndexOf("*/");
                    if (i1 < 0)
                        i1 = 0;
                    if (i2 < 0)
                        i2 = content.length;
                    return content.substring(i1, i2);
                }
                HTML.getScriptCommentText = getScriptCommentText;
            })(HTML = Text.HTML || (Text.HTML = {}));
        })(Text = System.Text || (System.Text = {}));
    })(System = CoreXT.System || (CoreXT.System = {}));
})(CoreXT || (CoreXT = {}));
//# sourceMappingURL=CoreXT.System.Text.js.map