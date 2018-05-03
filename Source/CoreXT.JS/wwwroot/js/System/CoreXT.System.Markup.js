var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var CoreXT;
(function (CoreXT) {
    var System;
    (function (System) {
        var Markup;
        (function (Markup) {
            var HTMLReaderModes;
            (function (HTMLReaderModes) {
                HTMLReaderModes[HTMLReaderModes["End"] = -1] = "End";
                HTMLReaderModes[HTMLReaderModes["NotStarted"] = 0] = "NotStarted";
                HTMLReaderModes[HTMLReaderModes["Tag"] = 1] = "Tag";
                HTMLReaderModes[HTMLReaderModes["Attribute"] = 2] = "Attribute";
                HTMLReaderModes[HTMLReaderModes["EndOfTag"] = 3] = "EndOfTag";
                HTMLReaderModes[HTMLReaderModes["TemplateToken"] = 4] = "TemplateToken";
            })(HTMLReaderModes = Markup.HTMLReaderModes || (Markup.HTMLReaderModes = {}));
            var $HTMLReader = (function (_super) {
                __extends($HTMLReader, _super);
                function $HTMLReader() {
                    var _this = _super !== null && _super.apply(this, arguments) || this;
                    _this.partIndex = 0;
                    _this.textStartIndex = 0;
                    _this.textEndIndex = 0;
                    _this.__lastTextEndIndex = 0;
                    _this.nonDelimiters = null;
                    _this.delimiters = null;
                    _this.text = "";
                    _this.delimiter = "";
                    _this.runningText = "";
                    _this.tagBracket = "";
                    _this.tagName = "";
                    _this.attributeName = "";
                    _this.attributeValue = "";
                    _this.readMode = Markup.HTMLReaderModes.NotStarted;
                    _this.strictMode = true;
                    return _this;
                }
                $HTMLReader.prototype.isMarkupDeclaration = function () {
                    return this.readMode == Markup.HTMLReaderModes.Tag
                        && this.tagName.length >= 4 && this.tagName.charAt(0) == '!' && this.tagName.charAt(1) != '-';
                };
                $HTMLReader.prototype.isCommentBlock = function () {
                    return this.readMode == Markup.HTMLReaderModes.Tag
                        && this.tagName.length >= 7 && this.tagName.charAt(0) == '!' && this.tagName.charAt(1) == '-';
                };
                $HTMLReader.prototype.isScriptBlock = function () {
                    return this.readMode == Markup.HTMLReaderModes.Tag
                        && this.tagName.length >= 6 && this.tagName.charAt(0) == 's' && this.tagName.charAt(1) == 'c' && this.tagName.charAt(this.tagName.length - 1) == '>';
                };
                $HTMLReader.prototype.isStyleBlock = function () {
                    return this.readMode == Markup.HTMLReaderModes.Tag
                        && this.tagName.length >= 5 && this.tagName.charAt(0) == 's' && this.tagName.charAt(1) == 't' && this.tagName.charAt(this.tagName.length - 1) == '>';
                };
                $HTMLReader.prototype.isClosingTag = function () {
                    return this.readMode == Markup.HTMLReaderModes.Tag && this.tagBracket == '</' || this.readMode == Markup.HTMLReaderModes.EndOfTag && this.delimiter == '/>';
                };
                $HTMLReader.prototype.isTempalteToken = function () {
                    return this.delimiter.length > 2 && this.delimiter.charAt(0) == '{' && this.delimiter.charAt(1) == '{';
                };
                $HTMLReader.prototype.getHTML = function () { return this.html; };
                $HTMLReader.prototype.__readNext = function () {
                    if (this.partIndex >= this.nonDelimiters.length) {
                        if (this.readMode != Markup.HTMLReaderModes.End) {
                            this.__lastTextEndIndex = this.textEndIndex;
                            this.textEndIndex += this.delimiter.length;
                            this.text = "";
                            this.delimiter = "";
                            this.readMode = Markup.HTMLReaderModes.End;
                        }
                    }
                    else {
                        this.text = this.nonDelimiters[this.partIndex];
                        this.__lastTextEndIndex = this.textEndIndex;
                        this.textEndIndex += this.delimiter.length + this.text.length;
                        this.delimiter = this.partIndex < this.delimiters.length ? this.delimiters[this.partIndex] : "";
                        this.partIndex++;
                    }
                };
                $HTMLReader.prototype.__goBack = function () {
                    this.partIndex--;
                    this.textEndIndex = this.__lastTextEndIndex;
                    this.text = this.nonDelimiters[this.partIndex];
                    this.delimiter = this.partIndex < this.delimiters.length ? this.delimiters[this.partIndex] : "";
                };
                $HTMLReader.prototype.__reQueueDelimiter = function () {
                    this.partIndex--;
                    this.textEndIndex -= this.delimiter.length;
                    this.nonDelimiters[this.partIndex] = "";
                };
                $HTMLReader.prototype.__skipWhiteSpace = function (onlyIfTextIsEmpty) {
                    if (onlyIfTextIsEmpty === void 0) { onlyIfTextIsEmpty = false; }
                    if (this.readMode != Markup.HTMLReaderModes.End
                        && (this.delimiter.length == 0 || this.delimiter.charCodeAt(0) <= 32)
                        && (!onlyIfTextIsEmpty || !this.text)) {
                        this.__readNext();
                        return true;
                    }
                    else
                        return false;
                };
                $HTMLReader.prototype.throwError = function (msg) {
                    this.__readNext();
                    throw System.Exception.from(msg + " on line " + this.getCurrentLineNumber() + ": <br/>\r\n" + this.getCurrentRunningText());
                };
                $HTMLReader.prototype.readNext = function () {
                    this.textStartIndex = this.textEndIndex + this.delimiter.length;
                    this.__readNext();
                    if (this.readMode == Markup.HTMLReaderModes.Tag
                        && this.tagBracket != '</' && this.tagName.charAt(this.tagName.length - 1) != ">"
                        || this.readMode == Markup.HTMLReaderModes.Attribute) {
                        this.__skipWhiteSpace(true);
                        this.attributeName = this.text.toLocaleLowerCase();
                        var isAttributeValueQuoted = false;
                        if (this.attributeName) {
                            if (this.delimiter == '=') {
                                this.__readNext();
                                this.__skipWhiteSpace(true);
                                isAttributeValueQuoted = this.delimiter.charAt(0) == '"' || this.delimiter.charAt(0) == "'";
                                this.attributeValue = isAttributeValueQuoted ? this.delimiter : this.text;
                                if (this.strictMode && this.attributeValue == "")
                                    this.throwError("Attribute '" + this.attributeName + "' is missing a value (use =\"\" to denote empty attribute values).");
                                if (this.attributeValue.length >= 2 && (this.attributeValue.charAt(0) == "'" || this.attributeValue.charAt(0) == '"'))
                                    this.attributeValue = this.attributeValue.substring(1, this.attributeValue.length - 1);
                            }
                            if (!isAttributeValueQuoted) {
                                if (this.delimiter != '/>' && this.delimiter != '>' && this.delimiter.charCodeAt(0) > 32)
                                    this.throwError("A closing tag bracket or whitespace is missing after the attribute '" + this.attributeName + (this.attributeValue ? "=" + this.attributeValue : "") + "'");
                                this.__reQueueDelimiter();
                            }
                            this.readMode = Markup.HTMLReaderModes.Attribute;
                            return;
                        }
                        this.__skipWhiteSpace();
                        if (this.delimiter != '/>' && this.delimiter != '>')
                            this.throwError("A closing tag bracket is missing for tag '" + this.tagBracket + this.tagName + "'.");
                        this.readMode = Markup.HTMLReaderModes.EndOfTag;
                        return;
                    }
                    this.__skipWhiteSpace();
                    while (this.readMode != Markup.HTMLReaderModes.End) {
                        if (this.delimiter.charAt(0) == '<') {
                            if (this.delimiter.charAt(1) == '/') {
                                this.tagBracket = this.delimiter.substring(0, 2);
                                this.tagName = this.delimiter.substring(2).toLocaleLowerCase();
                                break;
                            }
                            else {
                                this.tagBracket = this.delimiter.substring(0, 1);
                                this.tagName = this.delimiter.substring(1).toLocaleLowerCase();
                                break;
                            }
                        }
                        this.__readNext();
                    }
                    ;
                    if (this.readMode != Markup.HTMLReaderModes.End) {
                        this.runningText = this.getCurrentRunningText();
                        this.readMode = Markup.HTMLReaderModes.Tag;
                        if (this.tagBracket == '</') {
                            this.__readNext();
                            this.__skipWhiteSpace();
                            if (this.delimiter != '>')
                                this.throwError("Invalid end for tag '" + this.tagBracket + this.tagName + "' ('>' was expected).");
                        }
                    }
                    else
                        this.tagName = "";
                };
                $HTMLReader.prototype.getCurrentRunningText = function () {
                    return this.html.substring(this.textStartIndex, this.textEndIndex);
                };
                $HTMLReader.prototype.getCurrentLineNumber = function () {
                    for (var ln = 1, i = this.textEndIndex - 1; i >= 0; --i)
                        if (this.html.charCodeAt(i) == 10)
                            ++ln;
                    return ln;
                };
                $HTMLReader.__splitRegEx = /<!(?:--[\S\s]*?--)?[\S\s]*?>|<script\b[\S\s]*?<\/script[\S\s]*?>|<style\b[\S\s]*?<\/style[\S\s]*?>|<\![A-Z0-9]+|<\/[A-Z0-9]+|<[A-Z0-9]+|\/?>|&[A-Z]+;?|&#[0-9]+;?|&#x[A-F0-9]+;?|(?:'[^<>]*?'|"[^<>]*?")|=|\s+|\{\{[^\{\}]*?\}\}/gi;
                $HTMLReader['$HTMLReader Factory'] = (function (_super) {
                    __extends(Factory, _super);
                    function Factory() {
                        return _super !== null && _super.apply(this, arguments) || this;
                    }
                    Factory.prototype['new'] = function (html) { return null; };
                    Factory.prototype.init = function ($this, isnew, html) {
                        this.$__baseFactory.init($this, isnew);
                        $this.html = html;
                        $this.delimiters = html.match($HTMLReader.__splitRegEx);
                        $this.nonDelimiters = $this.html.split($HTMLReader.__splitRegEx, void 0, $this.delimiters);
                        return $this;
                    };
                    return Factory;
                }(CoreXT.FactoryBase($HTMLReader, $HTMLReader['$Object Factory']))).register(Markup);
                return $HTMLReader;
            }(System.Object.$__type));
            Markup.HTMLReader = $HTMLReader['$HTMLReader Factory'].$__type;
        })(Markup = System.Markup || (System.Markup = {}));
    })(System = CoreXT.System || (CoreXT.System = {}));
})(CoreXT || (CoreXT = {}));
//# sourceMappingURL=CoreXT.System.Markup.js.map