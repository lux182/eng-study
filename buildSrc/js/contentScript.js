(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Readability = require('./lib/Readability');

var _Readability2 = _interopRequireDefault(_Readability);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var EnglishLearningReader = function () {
    function EnglishLearningReader() {
        _classCallCheck(this, EnglishLearningReader);

        this.tpl = null;
        this.active = false;
        this.hotkeys = [];
        this.addEvents();
        this.dictionary = {};
        this.vocabulary = [];
        this.loadDictionary();
        this.storage = null;
        this.initStorageWhenReady();
    }

    _createClass(EnglishLearningReader, [{
        key: 'initStorageWhenReady',
        value: function initStorageWhenReady() {
            var _this = this;

            if (chrome && chrome.storage && chrome.storage.local) {
                this.initStorage();
            } else {
                setTimeout(function () {
                    return _this.initStorageWhenReady();
                }, 100);
            }
        }
    }, {
        key: 'initStorage',
        value: function initStorage() {
            if (chrome && chrome.storage && chrome.storage.local) {
                this.storage = chrome.storage.local;
            } else {
                console.error('Chrome storage is not available');
                // 可以在这里实现一个备用存储方案，比如使用 localStorage
                this.storage = {
                    get: function get(key, callback) {
                        var value = localStorage.getItem(key);
                        callback(value ? JSON.parse(value) : {});
                    },
                    set: function set(obj, callback) {
                        Object.keys(obj).forEach(function (key) {
                            localStorage.setItem(key, JSON.stringify(obj[key]));
                        });
                        if (callback) callback();
                    }
                };
            }
        }
    }, {
        key: 'addReadPage',
        value: function addReadPage() {
            if (this.active) return;
            if (!this.tpl) {
                var article = new _Readability2.default(document.cloneNode(true)).parse();
                var reg = /data-(\w*)src/g;
                var content = article.content.replace(reg, 'src');
                this.tpl = '<div class="center-area" id="clearReadCenterArea">\n                            <div class="article">\n                                <h1 class="title">' + article.title + '</h1>\n                                <div class="content">' + content + '</div>\n                            </div>\n                        </div>';
            }
            var div = document.createElement('div');
            div.id = 'clearRead';
            div.setAttribute('class', 'clearread-mode');
            div.innerHTML = this.tpl;
            document.body.appendChild(div);
            document.body.style.overflow = 'hidden';
            var imgs = div.getElementsByTagName('img');
            var areaWidth = document.getElementById('clearReadCenterArea').clientWidth;
            for (var i = 0; i < imgs.length; i++) {
                var width = imgs[i].naturalWidth;
                if (width) {
                    var centerAreaWidth = areaWidth;
                    if (width < centerAreaWidth - 140) {
                        imgs[i].setAttribute('class', 'img-c');
                    }
                }
                imgs[i].onload = function () {
                    var width = this.naturalWidth;
                    var centerAreaWidth = areaWidth;
                    if (width < centerAreaWidth - 140) {
                        this.setAttribute('class', 'img-c');
                    }
                };
            }
            this.addTranslationFeature();
            this.addVocabularyFeature();
            this.active = true;
            setTimeout(function () {
                div.setAttribute('class', 'clearread-mode clearread-mode-show');
                document.getElementById('clearReadCenterArea').setAttribute('class', 'center-area center-area-show');
            });
        }
    }, {
        key: 'addTranslationFeature',
        value: function addTranslationFeature() {
            var _this2 = this;

            var content = document.querySelector('#clearReadCenterArea .content');
            content.addEventListener('dblclick', function (e) {
                if (e.target.tagName === 'WORD') return;
                var selection = window.getSelection();
                var word = selection.toString().trim().toLowerCase();
                if (word && _this2.dictionary[word]) {
                    var span = document.createElement('word');
                    span.textContent = selection.toString();
                    span.setAttribute('title', _this2.dictionary[word]);
                    span.classList.add('translated-word');
                    var range = selection.getRangeAt(0);
                    range.deleteContents();
                    range.insertNode(span);
                }
            });
        }
    }, {
        key: 'addVocabularyFeature',
        value: function addVocabularyFeature() {
            var _this3 = this;

            var content = document.querySelector('#clearReadCenterArea .content');
            content.addEventListener('click', function (e) {
                if (e.target.classList.contains('translated-word')) {
                    var word = e.target.textContent.toLowerCase();
                    if (!_this3.vocabulary.includes(word)) {
                        _this3.vocabulary.push(word);
                        _this3.saveVocabulary();
                        _this3.showNotification('"' + word + '" has been added to your vocabulary list.');
                    }
                }
            });
        }
    }, {
        key: 'showNotification',
        value: function showNotification(message) {
            var notification = document.createElement('div');
            notification.textContent = message;
            notification.classList.add('english-learning-notification');
            document.body.appendChild(notification);
            setTimeout(function () {
                notification.remove();
            }, 3000);
        }
    }, {
        key: 'loadDictionary',
        value: function loadDictionary() {
            var _this4 = this;

            fetch(chrome.runtime.getURL('gptwords.json')).then(function (response) {
                return response.json();
            }).then(function (dictionary) {
                _this4.dictionary = dictionary;
            }).catch(function (error) {
                console.error('Error loading gptwords.json:', error);
            });
        }
    }, {
        key: 'saveVocabulary',
        value: function saveVocabulary() {
            if (this.storage) {
                this.storage.set({ vocabulary: this.vocabulary });
            } else {
                console.error('Storage is not available');
            }
        }
    }, {
        key: 'removeReadPage',
        value: function removeReadPage() {
            var _this5 = this;

            if (!this.active) return;
            var clearRead = document.getElementById('clearRead');
            var clearReadCenterArea = document.getElementById('clearReadCenterArea');
            clearReadCenterArea.setAttribute('class', 'center-area');
            setTimeout(function () {
                clearRead.setAttribute('class', 'clearread-mode');
                setTimeout(function () {
                    document.body.style.overflow = '';
                    var parentNode = clearRead.parentNode;
                    parentNode.removeChild(clearRead);
                    _this5.active = false;
                }, 250);
            }, 100);
        }
    }, {
        key: 'addEvents',
        value: function addEvents() {
            var _this6 = this;

            document.addEventListener('click', function (e) {
                if (e.target.id === 'clearRead') {
                    var classNames = e.target.className;
                    if (classNames.indexOf('clearread-mode-show') > -1) {
                        _this6.removeReadPage();
                    }
                }
            });
            document.addEventListener('keydown', function (e) {
                var code = e.keyCode;
                if (_this6.hotkeys.indexOf(code) == -1) {
                    _this6.hotkeys.push(code);
                }
            });
            document.addEventListener('keyup', function (e) {
                if (_this6.storage) {
                    _this6.storage.get(function (data) {
                        if (data.hasOwnProperty('state') && data.state == 'close') return;
                        if (data.hasOwnProperty('open')) {
                            var openkeys = data.open;
                            if (JSON.stringify(_this6.hotkeys) == JSON.stringify(openkeys)) {
                                _this6.addReadPage();
                            }
                        } else {
                            if (e.shiftKey && e.keyCode == 13) {
                                _this6.addReadPage();
                            }
                        }
                        if (data.hasOwnProperty('close')) {
                            var closekeys = data.close;
                            if (JSON.stringify(_this6.hotkeys) == JSON.stringify(closekeys)) {
                                _this6.removeReadPage();
                            }
                        } else {
                            if (e.keyCode == 27) {
                                _this6.removeReadPage();
                            }
                        }
                        _this6.hotkeys = [];
                    });
                }
            });
            document.addEventListener('copy', function (event) {
                event.preventDefault(); // 阻止默认复制行为

                chrome.runtime.sendMessage({ text: 'copied' }, function (response) {});
            });
        }
    }]);

    return EnglishLearningReader;
}();

// 确保 DOM 加载完成后再初始化


if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
        return new EnglishLearningReader();
    });
} else {
    new EnglishLearningReader();
}

},{"./lib/Readability":2}],2:[function(require,module,exports){
"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

/*eslint-env es6:false*/
/*
 * Copyright (c) 2010 Arc90 Inc
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/*
 * This code is heavily based on Arc90's readability.js (1.7.1) script
 * available at: http://code.google.com/p/arc90labs-readability
 */

/**
 * Public constructor.
 * @param {HTMLDocument} doc     The document to parse.
 * @param {Object}       options The options object.
 */
function Readability(doc, options) {
  // In some older versions, people passed a URI as the first argument. Cope:
  if (options && options.documentElement) {
    doc = options;
    options = arguments[2];
  } else if (!doc || !doc.documentElement) {
    throw new Error("First argument to Readability constructor should be a document object.");
  }
  options = options || {};

  this._doc = doc;
  this._articleTitle = null;
  this._articleByline = null;
  this._articleDir = null;
  this._attempts = [];

  // Configurable options
  this._debug = !!options.debug;
  this._maxElemsToParse = options.maxElemsToParse || this.DEFAULT_MAX_ELEMS_TO_PARSE;
  this._nbTopCandidates = options.nbTopCandidates || this.DEFAULT_N_TOP_CANDIDATES;
  this._charThreshold = options.charThreshold || this.DEFAULT_CHAR_THRESHOLD;
  this._classesToPreserve = this.CLASSES_TO_PRESERVE.concat(options.classesToPreserve || []);

  // Start with all flags set
  this._flags = this.FLAG_STRIP_UNLIKELYS | this.FLAG_WEIGHT_CLASSES | this.FLAG_CLEAN_CONDITIONALLY;

  var logEl;

  // Control whether log messages are sent to the console
  if (this._debug) {
    logEl = function logEl(e) {
      var rv = e.nodeName + " ";
      if (e.nodeType == e.TEXT_NODE) {
        return rv + '("' + e.textContent + '")';
      }
      var classDesc = e.className && "." + e.className.replace(/ /g, ".");
      var elDesc = "";
      if (e.id) elDesc = "(#" + e.id + classDesc + ")";else if (classDesc) elDesc = "(" + classDesc + ")";
      return rv + elDesc;
    };
    this.log = function () {
      if (typeof dump !== "undefined") {
        var msg = Array.prototype.map.call(arguments, function (x) {
          return x && x.nodeName ? logEl(x) : x;
        }).join(" ");
        dump("Reader: (Readability) " + msg + "\n");
      } else if (typeof console !== "undefined") {
        var args = ["Reader: (Readability) "].concat(arguments);
        console.log.apply(console, args);
      }
    };
  } else {
    this.log = function () {};
  }
}

Readability.prototype = {
  FLAG_STRIP_UNLIKELYS: 0x1,
  FLAG_WEIGHT_CLASSES: 0x2,
  FLAG_CLEAN_CONDITIONALLY: 0x4,

  // https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeType
  ELEMENT_NODE: 1,
  TEXT_NODE: 3,

  // Max number of nodes supported by this parser. Default: 0 (no limit)
  DEFAULT_MAX_ELEMS_TO_PARSE: 0,

  // The number of top candidates to consider when analysing how
  // tight the competition is among candidates.
  DEFAULT_N_TOP_CANDIDATES: 5,

  // Element tags to score by default.
  DEFAULT_TAGS_TO_SCORE: "section,h2,h3,h4,h5,h6,p,td,pre".toUpperCase().split(","),

  // The default number of chars an article must have in order to return a result
  DEFAULT_CHAR_THRESHOLD: 500,

  // All of the regular expressions in use within readability.
  // Defined up here so we don't instantiate them repeatedly in loops.
  REGEXPS: {
    unlikelyCandidates: /-ad-|banner|breadcrumbs|combx|comment|community|cover-wrap|disqus|extra|foot|header|legends|menu|related|remark|replies|rss|shoutbox|sidebar|skyscraper|social|sponsor|supplemental|ad-break|agegate|pagination|pager|popup|yom-remote/i,
    okMaybeItsACandidate: /and|article|body|column|main|shadow/i,
    positive: /article|body|content|entry|hentry|h-entry|main|page|pagination|post|text|blog|story/i,
    negative: /hidden|^hid$| hid$| hid |^hid |banner|combx|comment|com-|contact|foot|footer|footnote|masthead|media|meta|outbrain|promo|related|scroll|share|shoutbox|sidebar|skyscraper|sponsor|shopping|tags|tool|widget/i,
    extraneous: /print|archive|comment|discuss|e[\-]?mail|share|reply|all|login|sign|single|utility/i,
    byline: /byline|author|dateline|writtenby|p-author/i,
    replaceFonts: /<(\/?)font[^>]*>/gi,
    normalize: /\s{2,}/g,
    videos: /\/\/(www\.)?(dailymotion|youtube|youtube-nocookie|player\.vimeo)\.com/i,
    nextLink: /(next|weiter|continue|>([^\|]|$)|»([^\|]|$))/i,
    prevLink: /(prev|earl|old|new|<|«)/i,
    whitespace: /^\s*$/,
    hasContent: /\S$/
  },

  DIV_TO_P_ELEMS: ["A", "BLOCKQUOTE", "DL", "DIV", "IMG", "OL", "P", "PRE", "TABLE", "UL", "SELECT"],

  ALTER_TO_DIV_EXCEPTIONS: ["DIV", "ARTICLE", "SECTION", "P"],

  PRESENTATIONAL_ATTRIBUTES: ["align", "background", "bgcolor", "border", "cellpadding", "cellspacing", "frame", "hspace", "rules", "style", "valign", "vspace"],

  DEPRECATED_SIZE_ATTRIBUTE_ELEMS: ["TABLE", "TH", "TD", "HR", "PRE"],

  // The commented out elements qualify as phrasing content but tend to be
  // removed by readability when put into paragraphs, so we ignore them here.
  PHRASING_ELEMS: [
  // "CANVAS", "IFRAME", "SVG", "VIDEO",
  "ABBR", "AUDIO", "B", "BDO", "BR", "BUTTON", "CITE", "CODE", "DATA", "DATALIST", "DFN", "EM", "EMBED", "I", "IMG", "INPUT", "KBD", "LABEL", "MARK", "MATH", "METER", "NOSCRIPT", "OBJECT", "OUTPUT", "PROGRESS", "Q", "RUBY", "SAMP", "SCRIPT", "SELECT", "SMALL", "SPAN", "STRONG", "SUB", "SUP", "TEXTAREA", "TIME", "VAR", "WBR"],

  // These are the classes that readability sets itself.
  CLASSES_TO_PRESERVE: ["page"],

  /**
   * Run any post-process modifications to article content as necessary.
   *
   * @param Element
   * @return void
  **/
  _postProcessContent: function _postProcessContent(articleContent) {
    // Readability cannot open relative uris so we convert them to absolute uris.
    this._fixRelativeUris(articleContent);

    // Remove classes.
    this._cleanClasses(articleContent);
  },

  /**
   * Iterates over a NodeList, calls `filterFn` for each node and removes node
   * if function returned `true`.
   *
   * If function is not passed, removes all the nodes in node list.
   *
   * @param NodeList nodeList The nodes to operate on
   * @param Function filterFn the function to use as a filter
   * @return void
   */
  _removeNodes: function _removeNodes(nodeList, filterFn) {
    for (var i = nodeList.length - 1; i >= 0; i--) {
      var node = nodeList[i];
      var parentNode = node.parentNode;
      if (parentNode) {
        if (!filterFn || filterFn.call(this, node, i, nodeList)) {
          parentNode.removeChild(node);
        }
      }
    }
  },

  /**
   * Iterates over a NodeList, and calls _setNodeTag for each node.
   *
   * @param NodeList nodeList The nodes to operate on
   * @param String newTagName the new tag name to use
   * @return void
   */
  _replaceNodeTags: function _replaceNodeTags(nodeList, newTagName) {
    for (var i = nodeList.length - 1; i >= 0; i--) {
      var node = nodeList[i];
      this._setNodeTag(node, newTagName);
    }
  },

  /**
   * Iterate over a NodeList, which doesn't natively fully implement the Array
   * interface.
   *
   * For convenience, the current object context is applied to the provided
   * iterate function.
   *
   * @param  NodeList nodeList The NodeList.
   * @param  Function fn       The iterate function.
   * @return void
   */
  _forEachNode: function _forEachNode(nodeList, fn) {
    Array.prototype.forEach.call(nodeList, fn, this);
  },

  /**
   * Iterate over a NodeList, return true if any of the provided iterate
   * function calls returns true, false otherwise.
   *
   * For convenience, the current object context is applied to the
   * provided iterate function.
   *
   * @param  NodeList nodeList The NodeList.
   * @param  Function fn       The iterate function.
   * @return Boolean
   */
  _someNode: function _someNode(nodeList, fn) {
    return Array.prototype.some.call(nodeList, fn, this);
  },

  /**
   * Iterate over a NodeList, return true if all of the provided iterate
   * function calls return true, false otherwise.
   *
   * For convenience, the current object context is applied to the
   * provided iterate function.
   *
   * @param  NodeList nodeList The NodeList.
   * @param  Function fn       The iterate function.
   * @return Boolean
   */
  _everyNode: function _everyNode(nodeList, fn) {
    return Array.prototype.every.call(nodeList, fn, this);
  },

  /**
   * Concat all nodelists passed as arguments.
   *
   * @return ...NodeList
   * @return Array
   */
  _concatNodeLists: function _concatNodeLists() {
    var slice = Array.prototype.slice;
    var args = slice.call(arguments);
    var nodeLists = args.map(function (list) {
      return slice.call(list);
    });
    return Array.prototype.concat.apply([], nodeLists);
  },

  _getAllNodesWithTag: function _getAllNodesWithTag(node, tagNames) {
    if (node.querySelectorAll) {
      return node.querySelectorAll(tagNames.join(","));
    }
    return [].concat.apply([], tagNames.map(function (tag) {
      var collection = node.getElementsByTagName(tag);
      return Array.isArray(collection) ? collection : Array.from(collection);
    }));
  },

  /**
   * Removes the class="" attribute from every element in the given
   * subtree, except those that match CLASSES_TO_PRESERVE and
   * the classesToPreserve array from the options object.
   *
   * @param Element
   * @return void
   */
  _cleanClasses: function _cleanClasses(node) {
    var classesToPreserve = this._classesToPreserve;
    var className = (node.getAttribute("class") || "").split(/\s+/).filter(function (cls) {
      return classesToPreserve.indexOf(cls) != -1;
    }).join(" ");

    if (className) {
      node.setAttribute("class", className);
    } else {
      node.removeAttribute("class");
    }

    for (node = node.firstElementChild; node; node = node.nextElementSibling) {
      this._cleanClasses(node);
    }
  },

  /**
   * Converts each <a> and <img> uri in the given element to an absolute URI,
   * ignoring #ref URIs.
   *
   * @param Element
   * @return void
   */
  _fixRelativeUris: function _fixRelativeUris(articleContent) {
    var baseURI = this._doc.baseURI;
    var documentURI = this._doc.documentURI;
    function toAbsoluteURI(uri) {
      // Leave hash links alone if the base URI matches the document URI:
      if (baseURI == documentURI && uri.charAt(0) == "#") {
        return uri;
      }
      // Otherwise, resolve against base URI:
      try {
        return new URL(uri, baseURI).href;
      } catch (ex) {
        // Something went wrong, just return the original:
      }
      return uri;
    }

    var links = articleContent.getElementsByTagName("a");
    this._forEachNode(links, function (link) {
      var href = link.getAttribute("href");
      if (href) {
        // Replace links with javascript: URIs with text content, since
        // they won't work after scripts have been removed from the page.
        if (href.indexOf("javascript:") === 0) {
          var text = this._doc.createTextNode(link.textContent);
          link.parentNode.replaceChild(text, link);
        } else {
          link.setAttribute("href", toAbsoluteURI(href));
        }
      }
    });

    var imgs = articleContent.getElementsByTagName("img");
    this._forEachNode(imgs, function (img) {
      var src = img.getAttribute("src");
      if (src) {
        img.setAttribute("src", toAbsoluteURI(src));
      }
    });
  },

  /**
   * Get the article title as an H1.
   *
   * @return void
   **/
  _getArticleTitle: function _getArticleTitle() {
    var doc = this._doc;
    var curTitle = "";
    var origTitle = "";

    try {
      curTitle = origTitle = doc.title.trim();

      // If they had an element with id "title" in their HTML
      if (typeof curTitle !== "string") curTitle = origTitle = this._getInnerText(doc.getElementsByTagName("title")[0]);
    } catch (e) {/* ignore exceptions setting the title. */}

    var titleHadHierarchicalSeparators = false;
    function wordCount(str) {
      return str.split(/\s+/).length;
    }

    // If there's a separator in the title, first remove the final part
    if (/ [\|\-\\\/>»] /.test(curTitle)) {
      titleHadHierarchicalSeparators = / [\\\/>»] /.test(curTitle);
      curTitle = origTitle.replace(/(.*)[\|\-\\\/>»] .*/gi, "$1");

      // If the resulting title is too short (3 words or fewer), remove
      // the first part instead:
      if (wordCount(curTitle) < 3) curTitle = origTitle.replace(/[^\|\-\\\/>»]*[\|\-\\\/>»](.*)/gi, "$1");
    } else if (curTitle.indexOf(": ") !== -1) {
      // Check if we have an heading containing this exact string, so we
      // could assume it's the full title.
      var headings = this._concatNodeLists(doc.getElementsByTagName("h1"), doc.getElementsByTagName("h2"));
      var trimmedTitle = curTitle.trim();
      var match = this._someNode(headings, function (heading) {
        return heading.textContent.trim() === trimmedTitle;
      });

      // If we don't, let's extract the title out of the original title string.
      if (!match) {
        curTitle = origTitle.substring(origTitle.lastIndexOf(":") + 1);

        // If the title is now too short, try the first colon instead:
        if (wordCount(curTitle) < 3) {
          curTitle = origTitle.substring(origTitle.indexOf(":") + 1);
          // But if we have too many words before the colon there's something weird
          // with the titles and the H tags so let's just use the original title instead
        } else if (wordCount(origTitle.substr(0, origTitle.indexOf(":"))) > 5) {
          curTitle = origTitle;
        }
      }
    } else if (curTitle.length > 150 || curTitle.length < 15) {
      var hOnes = doc.getElementsByTagName("h1");

      if (hOnes.length === 1) curTitle = this._getInnerText(hOnes[0]);
    }

    curTitle = curTitle.trim();
    // If we now have 4 words or fewer as our title, and either no
    // 'hierarchical' separators (\, /, > or ») were found in the original
    // title or we decreased the number of words by more than 1 word, use
    // the original title.
    var curTitleWordCount = wordCount(curTitle);
    if (curTitleWordCount <= 4 && (!titleHadHierarchicalSeparators || curTitleWordCount != wordCount(origTitle.replace(/[\|\-\\\/>»]+/g, "")) - 1)) {
      curTitle = origTitle;
    }

    return curTitle;
  },

  /**
   * Prepare the HTML document for readability to scrape it.
   * This includes things like stripping javascript, CSS, and handling terrible markup.
   *
   * @return void
   **/
  _prepDocument: function _prepDocument() {
    var doc = this._doc;

    // Remove all style tags in head
    this._removeNodes(doc.getElementsByTagName("style"));

    if (doc.body) {
      this._replaceBrs(doc.body);
    }

    this._replaceNodeTags(doc.getElementsByTagName("font"), "SPAN");
  },

  /**
   * Finds the next element, starting from the given node, and ignoring
   * whitespace in between. If the given node is an element, the same node is
   * returned.
   */
  _nextElement: function _nextElement(node) {
    var next = node;
    while (next && next.nodeType != this.ELEMENT_NODE && this.REGEXPS.whitespace.test(next.textContent)) {
      next = next.nextSibling;
    }
    return next;
  },

  /**
   * Replaces 2 or more successive <br> elements with a single <p>.
   * Whitespace between <br> elements are ignored. For example:
   *   <div>foo<br>bar<br> <br><br>abc</div>
   * will become:
   *   <div>foo<br>bar<p>abc</p></div>
   */
  _replaceBrs: function _replaceBrs(elem) {
    this._forEachNode(this._getAllNodesWithTag(elem, ["br"]), function (br) {
      var next = br.nextSibling;

      // Whether 2 or more <br> elements have been found and replaced with a
      // <p> block.
      var replaced = false;

      // If we find a <br> chain, remove the <br>s until we hit another element
      // or non-whitespace. This leaves behind the first <br> in the chain
      // (which will be replaced with a <p> later).
      while ((next = this._nextElement(next)) && next.tagName == "BR") {
        replaced = true;
        var brSibling = next.nextSibling;
        next.parentNode.removeChild(next);
        next = brSibling;
      }

      // If we removed a <br> chain, replace the remaining <br> with a <p>. Add
      // all sibling nodes as children of the <p> until we hit another <br>
      // chain.
      if (replaced) {
        var p = this._doc.createElement("p");
        br.parentNode.replaceChild(p, br);

        next = p.nextSibling;
        while (next) {
          // If we've hit another <br><br>, we're done adding children to this <p>.
          if (next.tagName == "BR") {
            var nextElem = this._nextElement(next.nextSibling);
            if (nextElem && nextElem.tagName == "BR") break;
          }

          if (!this._isPhrasingContent(next)) break;

          // Otherwise, make this node a child of the new <p>.
          var sibling = next.nextSibling;
          p.appendChild(next);
          next = sibling;
        }

        while (p.lastChild && this._isWhitespace(p.lastChild)) {
          p.removeChild(p.lastChild);
        }

        if (p.parentNode.tagName === "P") this._setNodeTag(p.parentNode, "DIV");
      }
    });
  },

  _setNodeTag: function _setNodeTag(node, tag) {
    this.log("_setNodeTag", node, tag);
    if (node.__JSDOMParser__) {
      node.localName = tag.toLowerCase();
      node.tagName = tag.toUpperCase();
      return node;
    }

    var replacement = node.ownerDocument.createElement(tag);
    while (node.firstChild) {
      replacement.appendChild(node.firstChild);
    }
    node.parentNode.replaceChild(replacement, node);
    if (node.readability) replacement.readability = node.readability;

    for (var i = 0; i < node.attributes.length; i++) {
      replacement.setAttribute(node.attributes[i].name, node.attributes[i].value);
    }
    return replacement;
  },

  /**
   * Prepare the article node for display. Clean out any inline styles,
   * iframes, forms, strip extraneous <p> tags, etc.
   *
   * @param Element
   * @return void
   **/
  _prepArticle: function _prepArticle(articleContent) {
    this._cleanStyles(articleContent);

    // Check for data tables before we continue, to avoid removing items in
    // those tables, which will often be isolated even though they're
    // visually linked to other content-ful elements (text, images, etc.).
    this._markDataTables(articleContent);

    // Clean out junk from the article content
    this._cleanConditionally(articleContent, "form");
    this._cleanConditionally(articleContent, "fieldset");
    this._clean(articleContent, "object");
    this._clean(articleContent, "embed");
    this._clean(articleContent, "h1");
    this._clean(articleContent, "footer");
    this._clean(articleContent, "link");
    this._clean(articleContent, "aside");

    // Clean out elements have "share" in their id/class combinations from final top candidates,
    // which means we don't remove the top candidates even they have "share".
    this._forEachNode(articleContent.children, function (topCandidate) {
      this._cleanMatchedNodes(topCandidate, /share/);
    });

    // If there is only one h2 and its text content substantially equals article title,
    // they are probably using it as a header and not a subheader,
    // so remove it since we already extract the title separately.
    var h2 = articleContent.getElementsByTagName("h2");
    if (h2.length === 1) {
      var lengthSimilarRate = (h2[0].textContent.length - this._articleTitle.length) / this._articleTitle.length;
      if (Math.abs(lengthSimilarRate) < 0.5) {
        var titlesMatch = false;
        if (lengthSimilarRate > 0) {
          titlesMatch = h2[0].textContent.includes(this._articleTitle);
        } else {
          titlesMatch = this._articleTitle.includes(h2[0].textContent);
        }
        if (titlesMatch) {
          this._clean(articleContent, "h2");
        }
      }
    }

    this._clean(articleContent, "iframe");
    this._clean(articleContent, "input");
    this._clean(articleContent, "textarea");
    this._clean(articleContent, "select");
    this._clean(articleContent, "button");
    this._cleanHeaders(articleContent);

    // Do these last as the previous stuff may have removed junk
    // that will affect these
    this._cleanConditionally(articleContent, "table");
    this._cleanConditionally(articleContent, "ul");
    this._cleanConditionally(articleContent, "div");

    // Remove extra paragraphs
    this._removeNodes(articleContent.getElementsByTagName("p"), function (paragraph) {
      var imgCount = paragraph.getElementsByTagName("img").length;
      var embedCount = paragraph.getElementsByTagName("embed").length;
      var objectCount = paragraph.getElementsByTagName("object").length;
      // At this point, nasty iframes have been removed, only remain embedded video ones.
      var iframeCount = paragraph.getElementsByTagName("iframe").length;
      var totalCount = imgCount + embedCount + objectCount + iframeCount;

      return totalCount === 0 && !this._getInnerText(paragraph, false);
    });

    this._forEachNode(this._getAllNodesWithTag(articleContent, ["br"]), function (br) {
      var next = this._nextElement(br.nextSibling);
      if (next && next.tagName == "P") br.parentNode.removeChild(br);
    });

    // Remove single-cell tables
    this._forEachNode(this._getAllNodesWithTag(articleContent, ["table"]), function (table) {
      var tbody = this._hasSingleTagInsideElement(table, "TBODY") ? table.firstElementChild : table;
      if (this._hasSingleTagInsideElement(tbody, "TR")) {
        var row = tbody.firstElementChild;
        if (this._hasSingleTagInsideElement(row, "TD")) {
          var cell = row.firstElementChild;
          cell = this._setNodeTag(cell, this._everyNode(cell.childNodes, this._isPhrasingContent) ? "P" : "DIV");
          table.parentNode.replaceChild(cell, table);
        }
      }
    });
  },

  /**
   * Initialize a node with the readability object. Also checks the
   * className/id for special names to add to its score.
   *
   * @param Element
   * @return void
  **/
  _initializeNode: function _initializeNode(node) {
    node.readability = { "contentScore": 0 };

    switch (node.tagName) {
      case "DIV":
        node.readability.contentScore += 5;
        break;

      case "PRE":
      case "TD":
      case "BLOCKQUOTE":
        node.readability.contentScore += 3;
        break;

      case "ADDRESS":
      case "OL":
      case "UL":
      case "DL":
      case "DD":
      case "DT":
      case "LI":
      case "FORM":
        node.readability.contentScore -= 3;
        break;

      case "H1":
      case "H2":
      case "H3":
      case "H4":
      case "H5":
      case "H6":
      case "TH":
        node.readability.contentScore -= 5;
        break;
    }

    node.readability.contentScore += this._getClassWeight(node);
  },

  _removeAndGetNext: function _removeAndGetNext(node) {
    var nextNode = this._getNextNode(node, true);
    node.parentNode.removeChild(node);
    return nextNode;
  },

  /**
   * Traverse the DOM from node to node, starting at the node passed in.
   * Pass true for the second parameter to indicate this node itself
   * (and its kids) are going away, and we want the next node over.
   *
   * Calling this in a loop will traverse the DOM depth-first.
   */
  _getNextNode: function _getNextNode(node, ignoreSelfAndKids) {
    // First check for kids if those aren't being ignored
    if (!ignoreSelfAndKids && node.firstElementChild) {
      return node.firstElementChild;
    }
    // Then for siblings...
    if (node.nextElementSibling) {
      return node.nextElementSibling;
    }
    // And finally, move up the parent chain *and* find a sibling
    // (because this is depth-first traversal, we will have already
    // seen the parent nodes themselves).
    do {
      node = node.parentNode;
    } while (node && !node.nextElementSibling);
    return node && node.nextElementSibling;
  },

  _checkByline: function _checkByline(node, matchString) {
    if (this._articleByline) {
      return false;
    }

    if (node.getAttribute !== undefined) {
      var rel = node.getAttribute("rel");
    }

    if ((rel === "author" || this.REGEXPS.byline.test(matchString)) && this._isValidByline(node.textContent)) {
      this._articleByline = node.textContent.trim();
      return true;
    }

    return false;
  },

  _getNodeAncestors: function _getNodeAncestors(node, maxDepth) {
    maxDepth = maxDepth || 0;
    var i = 0,
        ancestors = [];
    while (node.parentNode) {
      ancestors.push(node.parentNode);
      if (maxDepth && ++i === maxDepth) break;
      node = node.parentNode;
    }
    return ancestors;
  },

  /***
   * grabArticle - Using a variety of metrics (content score, classname, element types), find the content that is
   *         most likely to be the stuff a user wants to read. Then return it wrapped up in a div.
   *
   * @param page a document to run upon. Needs to be a full document, complete with body.
   * @return Element
  **/
  _grabArticle: function _grabArticle(page) {
    this.log("**** grabArticle ****");
    var doc = this._doc;
    var isPaging = page !== null ? true : false;
    page = page ? page : this._doc.body;

    // We can't grab an article if we don't have a page!
    if (!page) {
      this.log("No body found in document. Abort.");
      return null;
    }

    var pageCacheHtml = page.innerHTML;

    while (true) {
      var stripUnlikelyCandidates = this._flagIsActive(this.FLAG_STRIP_UNLIKELYS);

      // First, node prepping. Trash nodes that look cruddy (like ones with the
      // class name "comment", etc), and turn divs into P tags where they have been
      // used inappropriately (as in, where they contain no other block level elements.)
      var elementsToScore = [];
      var node = this._doc.documentElement;

      while (node) {
        var matchString = node.className + " " + node.id;

        if (!this._isProbablyVisible(node)) {
          this.log("Removing hidden node - " + matchString);
          node = this._removeAndGetNext(node);
          continue;
        }

        // Check to see if this node is a byline, and remove it if it is.
        if (this._checkByline(node, matchString)) {
          node = this._removeAndGetNext(node);
          continue;
        }

        // Remove unlikely candidates
        if (stripUnlikelyCandidates) {
          if (this.REGEXPS.unlikelyCandidates.test(matchString) && !this.REGEXPS.okMaybeItsACandidate.test(matchString) && node.tagName !== "BODY" && node.tagName !== "A") {
            this.log("Removing unlikely candidate - " + matchString);
            node = this._removeAndGetNext(node);
            continue;
          }
        }

        // Remove DIV, SECTION, and HEADER nodes without any content(e.g. text, image, video, or iframe).
        if ((node.tagName === "DIV" || node.tagName === "SECTION" || node.tagName === "HEADER" || node.tagName === "H1" || node.tagName === "H2" || node.tagName === "H3" || node.tagName === "H4" || node.tagName === "H5" || node.tagName === "H6") && this._isElementWithoutContent(node)) {
          node = this._removeAndGetNext(node);
          continue;
        }

        if (this.DEFAULT_TAGS_TO_SCORE.indexOf(node.tagName) !== -1) {
          elementsToScore.push(node);
        }

        // Turn all divs that don't have children block level elements into p's
        if (node.tagName === "DIV") {
          // Put phrasing content into paragraphs.
          var p = null;
          var childNode = node.firstChild;
          while (childNode) {
            var nextSibling = childNode.nextSibling;
            if (this._isPhrasingContent(childNode)) {
              if (p !== null) {
                p.appendChild(childNode);
              } else if (!this._isWhitespace(childNode)) {
                p = doc.createElement("p");
                node.replaceChild(p, childNode);
                p.appendChild(childNode);
              }
            } else if (p !== null) {
              while (p.lastChild && this._isWhitespace(p.lastChild)) {
                p.removeChild(p.lastChild);
              }
              p = null;
            }
            childNode = nextSibling;
          }

          // Sites like http://mobile.slate.com encloses each paragraph with a DIV
          // element. DIVs with only a P element inside and no text content can be
          // safely converted into plain P elements to avoid confusing the scoring
          // algorithm with DIVs with are, in practice, paragraphs.
          if (this._hasSingleTagInsideElement(node, "P") && this._getLinkDensity(node) < 0.25) {
            var newNode = node.children[0];
            node.parentNode.replaceChild(newNode, node);
            node = newNode;
            elementsToScore.push(node);
          } else if (!this._hasChildBlockElement(node)) {
            node = this._setNodeTag(node, "P");
            elementsToScore.push(node);
          }
        }
        node = this._getNextNode(node);
      }

      /**
       * Loop through all paragraphs, and assign a score to them based on how content-y they look.
       * Then add their score to their parent node.
       *
       * A score is determined by things like number of commas, class names, etc. Maybe eventually link density.
      **/
      var candidates = [];
      this._forEachNode(elementsToScore, function (elementToScore) {
        if (!elementToScore.parentNode || typeof elementToScore.parentNode.tagName === "undefined") return;

        // If this paragraph is less than 25 characters, don't even count it.
        var innerText = this._getInnerText(elementToScore);
        if (innerText.length < 25) return;

        // Exclude nodes with no ancestor.
        var ancestors = this._getNodeAncestors(elementToScore, 3);
        if (ancestors.length === 0) return;

        var contentScore = 0;

        // Add a point for the paragraph itself as a base.
        contentScore += 1;

        // Add points for any commas within this paragraph.
        contentScore += innerText.split(",").length;

        // For every 100 characters in this paragraph, add another point. Up to 3 points.
        contentScore += Math.min(Math.floor(innerText.length / 100), 3);

        // Initialize and score ancestors.
        this._forEachNode(ancestors, function (ancestor, level) {
          if (!ancestor.tagName || !ancestor.parentNode || typeof ancestor.parentNode.tagName === "undefined") return;

          if (typeof ancestor.readability === "undefined") {
            this._initializeNode(ancestor);
            candidates.push(ancestor);
          }

          // Node score divider:
          // - parent:             1 (no division)
          // - grandparent:        2
          // - great grandparent+: ancestor level * 3
          if (level === 0) var scoreDivider = 1;else if (level === 1) scoreDivider = 2;else scoreDivider = level * 3;
          ancestor.readability.contentScore += contentScore / scoreDivider;
        });
      });

      // After we've calculated scores, loop through all of the possible
      // candidate nodes we found and find the one with the highest score.
      var topCandidates = [];
      for (var c = 0, cl = candidates.length; c < cl; c += 1) {
        var candidate = candidates[c];

        // Scale the final candidates score based on link density. Good content
        // should have a relatively small link density (5% or less) and be mostly
        // unaffected by this operation.
        var candidateScore = candidate.readability.contentScore * (1 - this._getLinkDensity(candidate));
        candidate.readability.contentScore = candidateScore;

        this.log("Candidate:", candidate, "with score " + candidateScore);

        for (var t = 0; t < this._nbTopCandidates; t++) {
          var aTopCandidate = topCandidates[t];

          if (!aTopCandidate || candidateScore > aTopCandidate.readability.contentScore) {
            topCandidates.splice(t, 0, candidate);
            if (topCandidates.length > this._nbTopCandidates) topCandidates.pop();
            break;
          }
        }
      }

      var topCandidate = topCandidates[0] || null;
      var neededToCreateTopCandidate = false;
      var parentOfTopCandidate;

      // If we still have no top candidate, just use the body as a last resort.
      // We also have to copy the body node so it is something we can modify.
      if (topCandidate === null || topCandidate.tagName === "BODY") {
        // Move all of the page's children into topCandidate
        topCandidate = doc.createElement("DIV");
        neededToCreateTopCandidate = true;
        // Move everything (not just elements, also text nodes etc.) into the container
        // so we even include text directly in the body:
        var kids = page.childNodes;
        while (kids.length) {
          this.log("Moving child out:", kids[0]);
          topCandidate.appendChild(kids[0]);
        }

        page.appendChild(topCandidate);

        this._initializeNode(topCandidate);
      } else if (topCandidate) {
        // Find a better top candidate node if it contains (at least three) nodes which belong to `topCandidates` array
        // and whose scores are quite closed with current `topCandidate` node.
        var alternativeCandidateAncestors = [];
        for (var i = 1; i < topCandidates.length; i++) {
          if (topCandidates[i].readability.contentScore / topCandidate.readability.contentScore >= 0.75) {
            alternativeCandidateAncestors.push(this._getNodeAncestors(topCandidates[i]));
          }
        }
        var MINIMUM_TOPCANDIDATES = 3;
        if (alternativeCandidateAncestors.length >= MINIMUM_TOPCANDIDATES) {
          parentOfTopCandidate = topCandidate.parentNode;
          while (parentOfTopCandidate.tagName !== "BODY") {
            var listsContainingThisAncestor = 0;
            for (var ancestorIndex = 0; ancestorIndex < alternativeCandidateAncestors.length && listsContainingThisAncestor < MINIMUM_TOPCANDIDATES; ancestorIndex++) {
              listsContainingThisAncestor += Number(alternativeCandidateAncestors[ancestorIndex].includes(parentOfTopCandidate));
            }
            if (listsContainingThisAncestor >= MINIMUM_TOPCANDIDATES) {
              topCandidate = parentOfTopCandidate;
              break;
            }
            parentOfTopCandidate = parentOfTopCandidate.parentNode;
          }
        }
        if (!topCandidate.readability) {
          this._initializeNode(topCandidate);
        }

        // Because of our bonus system, parents of candidates might have scores
        // themselves. They get half of the node. There won't be nodes with higher
        // scores than our topCandidate, but if we see the score going *up* in the first
        // few steps up the tree, that's a decent sign that there might be more content
        // lurking in other places that we want to unify in. The sibling stuff
        // below does some of that - but only if we've looked high enough up the DOM
        // tree.
        parentOfTopCandidate = topCandidate.parentNode;
        var lastScore = topCandidate.readability.contentScore;
        // The scores shouldn't get too low.
        var scoreThreshold = lastScore / 3;
        while (parentOfTopCandidate.tagName !== "BODY") {
          if (!parentOfTopCandidate.readability) {
            parentOfTopCandidate = parentOfTopCandidate.parentNode;
            continue;
          }
          var parentScore = parentOfTopCandidate.readability.contentScore;
          if (parentScore < scoreThreshold) break;
          if (parentScore > lastScore) {
            // Alright! We found a better parent to use.
            topCandidate = parentOfTopCandidate;
            break;
          }
          lastScore = parentOfTopCandidate.readability.contentScore;
          parentOfTopCandidate = parentOfTopCandidate.parentNode;
        }

        // If the top candidate is the only child, use parent instead. This will help sibling
        // joining logic when adjacent content is actually located in parent's sibling node.
        parentOfTopCandidate = topCandidate.parentNode;
        while (parentOfTopCandidate.tagName != "BODY" && parentOfTopCandidate.children.length == 1) {
          topCandidate = parentOfTopCandidate;
          parentOfTopCandidate = topCandidate.parentNode;
        }
        if (!topCandidate.readability) {
          this._initializeNode(topCandidate);
        }
      }

      // Now that we have the top candidate, look through its siblings for content
      // that might also be related. Things like preambles, content split by ads
      // that we removed, etc.
      var articleContent = doc.createElement("DIV");
      if (isPaging) articleContent.id = "readability-content";

      var siblingScoreThreshold = Math.max(10, topCandidate.readability.contentScore * 0.2);
      // Keep potential top candidate's parent node to try to get text direction of it later.
      parentOfTopCandidate = topCandidate.parentNode;
      var siblings = parentOfTopCandidate.children;

      for (var s = 0, sl = siblings.length; s < sl; s++) {
        var sibling = siblings[s];
        var append = false;

        this.log("Looking at sibling node:", sibling, sibling.readability ? "with score " + sibling.readability.contentScore : "");
        this.log("Sibling has score", sibling.readability ? sibling.readability.contentScore : "Unknown");

        if (sibling === topCandidate) {
          append = true;
        } else {
          var contentBonus = 0;

          // Give a bonus if sibling nodes and top candidates have the example same classname
          if (sibling.className === topCandidate.className && topCandidate.className !== "") contentBonus += topCandidate.readability.contentScore * 0.2;

          if (sibling.readability && sibling.readability.contentScore + contentBonus >= siblingScoreThreshold) {
            append = true;
          } else if (sibling.nodeName === "P") {
            var linkDensity = this._getLinkDensity(sibling);
            var nodeContent = this._getInnerText(sibling);
            var nodeLength = nodeContent.length;

            if (nodeLength > 80 && linkDensity < 0.25) {
              append = true;
            } else if (nodeLength < 80 && nodeLength > 0 && linkDensity === 0 && nodeContent.search(/\.( |$)/) !== -1) {
              append = true;
            }
          }
        }

        if (append) {
          this.log("Appending node:", sibling);

          if (this.ALTER_TO_DIV_EXCEPTIONS.indexOf(sibling.nodeName) === -1) {
            // We have a node that isn't a common block level element, like a form or td tag.
            // Turn it into a div so it doesn't get filtered out later by accident.
            this.log("Altering sibling:", sibling, "to div.");

            sibling = this._setNodeTag(sibling, "DIV");
          }

          articleContent.appendChild(sibling);
          // siblings is a reference to the children array, and
          // sibling is removed from the array when we call appendChild().
          // As a result, we must revisit this index since the nodes
          // have been shifted.
          s -= 1;
          sl -= 1;
        }
      }

      if (this._debug) this.log("Article content pre-prep: " + articleContent.innerHTML);
      // So we have all of the content that we need. Now we clean it up for presentation.
      this._prepArticle(articleContent);
      if (this._debug) this.log("Article content post-prep: " + articleContent.innerHTML);

      if (neededToCreateTopCandidate) {
        // We already created a fake div thing, and there wouldn't have been any siblings left
        // for the previous loop, so there's no point trying to create a new div, and then
        // move all the children over. Just assign IDs and class names here. No need to append
        // because that already happened anyway.
        topCandidate.id = "readability-page-1";
        topCandidate.className = "page";
      } else {
        var div = doc.createElement("DIV");
        div.id = "readability-page-1";
        div.className = "page";
        var children = articleContent.childNodes;
        while (children.length) {
          div.appendChild(children[0]);
        }
        articleContent.appendChild(div);
      }

      if (this._debug) this.log("Article content after paging: " + articleContent.innerHTML);

      var parseSuccessful = true;

      // Now that we've gone through the full algorithm, check to see if
      // we got any meaningful content. If we didn't, we may need to re-run
      // grabArticle with different flags set. This gives us a higher likelihood of
      // finding the content, and the sieve approach gives us a higher likelihood of
      // finding the -right- content.
      var textLength = this._getInnerText(articleContent, true).length;
      if (textLength < this._charThreshold) {
        parseSuccessful = false;
        page.innerHTML = pageCacheHtml;

        if (this._flagIsActive(this.FLAG_STRIP_UNLIKELYS)) {
          this._removeFlag(this.FLAG_STRIP_UNLIKELYS);
          this._attempts.push({ articleContent: articleContent, textLength: textLength });
        } else if (this._flagIsActive(this.FLAG_WEIGHT_CLASSES)) {
          this._removeFlag(this.FLAG_WEIGHT_CLASSES);
          this._attempts.push({ articleContent: articleContent, textLength: textLength });
        } else if (this._flagIsActive(this.FLAG_CLEAN_CONDITIONALLY)) {
          this._removeFlag(this.FLAG_CLEAN_CONDITIONALLY);
          this._attempts.push({ articleContent: articleContent, textLength: textLength });
        } else {
          this._attempts.push({ articleContent: articleContent, textLength: textLength });
          // No luck after removing flags, just return the longest text we found during the different loops
          this._attempts.sort(function (a, b) {
            return a.textLength < b.textLength;
          });

          // But first check if we actually have something
          if (!this._attempts[0].textLength) {
            return null;
          }

          articleContent = this._attempts[0].articleContent;
          parseSuccessful = true;
        }
      }

      if (parseSuccessful) {
        // Find out text direction from ancestors of final top candidate.
        var ancestors = [parentOfTopCandidate, topCandidate].concat(this._getNodeAncestors(parentOfTopCandidate));
        this._someNode(ancestors, function (ancestor) {
          if (!ancestor.tagName) return false;
          var articleDir = ancestor.getAttribute("dir");
          if (articleDir) {
            this._articleDir = articleDir;
            return true;
          }
          return false;
        });
        return articleContent;
      }
    }
  },

  /**
   * Check whether the input string could be a byline.
   * This verifies that the input is a string, and that the length
   * is less than 100 chars.
   *
   * @param possibleByline {string} - a string to check whether its a byline.
   * @return Boolean - whether the input string is a byline.
   */
  _isValidByline: function _isValidByline(byline) {
    if (typeof byline == "string" || byline instanceof String) {
      byline = byline.trim();
      return byline.length > 0 && byline.length < 100;
    }
    return false;
  },

  /**
   * Attempts to get excerpt and byline metadata for the article.
   *
   * @return Object with optional "excerpt" and "byline" properties
   */
  _getArticleMetadata: function _getArticleMetadata() {
    var metadata = {};
    var values = {};
    var metaElements = this._doc.getElementsByTagName("meta");

    // Match "description", or Twitter's "twitter:description" (Cards)
    // in name attribute.
    var namePattern = /^\s*((twitter)\s*:\s*)?(description|title)\s*$/gi;

    // Match Facebook's Open Graph title & description properties.
    var propertyPattern = /^\s*og\s*:\s*(description|title)\s*$/gi;

    // Find description tags.
    this._forEachNode(metaElements, function (element) {
      var elementName = element.getAttribute("name");
      var elementProperty = element.getAttribute("property");

      if ([elementName, elementProperty].indexOf("author") !== -1) {
        metadata.byline = element.getAttribute("content");
        return;
      }

      var name = null;
      if (namePattern.test(elementName)) {
        name = elementName;
      } else if (propertyPattern.test(elementProperty)) {
        name = elementProperty;
      }

      if (name) {
        var content = element.getAttribute("content");
        if (content) {
          // Convert to lowercase and remove any whitespace
          // so we can match below.
          name = name.toLowerCase().replace(/\s/g, "");
          values[name] = content.trim();
        }
      }
    });

    if ("description" in values) {
      metadata.excerpt = values["description"];
    } else if ("og:description" in values) {
      // Use facebook open graph description.
      metadata.excerpt = values["og:description"];
    } else if ("twitter:description" in values) {
      // Use twitter cards description.
      metadata.excerpt = values["twitter:description"];
    }

    metadata.title = this._getArticleTitle();
    if (!metadata.title) {
      if ("og:title" in values) {
        // Use facebook open graph title.
        metadata.title = values["og:title"];
      } else if ("twitter:title" in values) {
        // Use twitter cards title.
        metadata.title = values["twitter:title"];
      }
    }

    return metadata;
  },

  /**
   * Removes script tags from the document.
   *
   * @param Element
  **/
  _removeScripts: function _removeScripts(doc) {
    this._removeNodes(doc.getElementsByTagName("script"), function (scriptNode) {
      scriptNode.nodeValue = "";
      scriptNode.removeAttribute("src");
      return true;
    });
    this._removeNodes(doc.getElementsByTagName("noscript"));
  },

  /**
   * Check if this node has only whitespace and a single element with given tag
   * Returns false if the DIV node contains non-empty text nodes
   * or if it contains no element with given tag or more than 1 element.
   *
   * @param Element
   * @param string tag of child element
  **/
  _hasSingleTagInsideElement: function _hasSingleTagInsideElement(element, tag) {
    // There should be exactly 1 element child with given tag
    if (element.children.length != 1 || element.children[0].tagName !== tag) {
      return false;
    }

    // And there should be no text nodes with real content
    return !this._someNode(element.childNodes, function (node) {
      return node.nodeType === this.TEXT_NODE && this.REGEXPS.hasContent.test(node.textContent);
    });
  },

  _isElementWithoutContent: function _isElementWithoutContent(node) {
    return node.nodeType === this.ELEMENT_NODE && node.textContent.trim().length == 0 && (node.children.length == 0 || node.children.length == node.getElementsByTagName("br").length + node.getElementsByTagName("hr").length);
  },

  /**
   * Determine whether element has any children block level elements.
   *
   * @param Element
   */
  _hasChildBlockElement: function _hasChildBlockElement(element) {
    return this._someNode(element.childNodes, function (node) {
      return this.DIV_TO_P_ELEMS.indexOf(node.tagName) !== -1 || this._hasChildBlockElement(node);
    });
  },

  /***
   * Determine if a node qualifies as phrasing content.
   * https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/Content_categories#Phrasing_content
  **/
  _isPhrasingContent: function _isPhrasingContent(node) {
    return node.nodeType === this.TEXT_NODE || this.PHRASING_ELEMS.indexOf(node.tagName) !== -1 || (node.tagName === "A" || node.tagName === "DEL" || node.tagName === "INS") && this._everyNode(node.childNodes, this._isPhrasingContent);
  },

  _isWhitespace: function _isWhitespace(node) {
    return node.nodeType === this.TEXT_NODE && node.textContent.trim().length === 0 || node.nodeType === this.ELEMENT_NODE && node.tagName === "BR";
  },

  /**
   * Get the inner text of a node - cross browser compatibly.
   * This also strips out any excess whitespace to be found.
   *
   * @param Element
   * @param Boolean normalizeSpaces (default: true)
   * @return string
  **/
  _getInnerText: function _getInnerText(e, normalizeSpaces) {
    normalizeSpaces = typeof normalizeSpaces === "undefined" ? true : normalizeSpaces;
    var textContent = e.textContent.trim();

    if (normalizeSpaces) {
      return textContent.replace(this.REGEXPS.normalize, " ");
    }
    return textContent;
  },

  /**
   * Get the number of times a string s appears in the node e.
   *
   * @param Element
   * @param string - what to split on. Default is ","
   * @return number (integer)
  **/
  _getCharCount: function _getCharCount(e, s) {
    s = s || ",";
    return this._getInnerText(e).split(s).length - 1;
  },

  /**
   * Remove the style attribute on every e and under.
   * TODO: Test if getElementsByTagName(*) is faster.
   *
   * @param Element
   * @return void
  **/
  _cleanStyles: function _cleanStyles(e) {
    if (!e || e.tagName.toLowerCase() === "svg") return;

    // Remove `style` and deprecated presentational attributes
    for (var i = 0; i < this.PRESENTATIONAL_ATTRIBUTES.length; i++) {
      e.removeAttribute(this.PRESENTATIONAL_ATTRIBUTES[i]);
    }

    if (this.DEPRECATED_SIZE_ATTRIBUTE_ELEMS.indexOf(e.tagName) !== -1) {
      e.removeAttribute("width");
      e.removeAttribute("height");
    }

    var cur = e.firstElementChild;
    while (cur !== null) {
      this._cleanStyles(cur);
      cur = cur.nextElementSibling;
    }
  },

  /**
   * Get the density of links as a percentage of the content
   * This is the amount of text that is inside a link divided by the total text in the node.
   *
   * @param Element
   * @return number (float)
  **/
  _getLinkDensity: function _getLinkDensity(element) {
    var textLength = this._getInnerText(element).length;
    if (textLength === 0) return 0;

    var linkLength = 0;

    // XXX implement _reduceNodeList?
    this._forEachNode(element.getElementsByTagName("a"), function (linkNode) {
      linkLength += this._getInnerText(linkNode).length;
    });

    return linkLength / textLength;
  },

  /**
   * Get an elements class/id weight. Uses regular expressions to tell if this
   * element looks good or bad.
   *
   * @param Element
   * @return number (Integer)
  **/
  _getClassWeight: function _getClassWeight(e) {
    if (!this._flagIsActive(this.FLAG_WEIGHT_CLASSES)) return 0;

    var weight = 0;

    // Look for a special classname
    if (typeof e.className === "string" && e.className !== "") {
      if (this.REGEXPS.negative.test(e.className)) weight -= 25;

      if (this.REGEXPS.positive.test(e.className)) weight += 25;
    }

    // Look for a special ID
    if (typeof e.id === "string" && e.id !== "") {
      if (this.REGEXPS.negative.test(e.id)) weight -= 25;

      if (this.REGEXPS.positive.test(e.id)) weight += 25;
    }

    return weight;
  },

  /**
   * Clean a node of all elements of type "tag".
   * (Unless it's a youtube/vimeo video. People love movies.)
   *
   * @param Element
   * @param string tag to clean
   * @return void
   **/
  _clean: function _clean(e, tag) {
    var isEmbed = ["object", "embed", "iframe"].indexOf(tag) !== -1;

    this._removeNodes(e.getElementsByTagName(tag), function (element) {
      // Allow youtube and vimeo videos through as people usually want to see those.
      if (isEmbed) {
        var attributeValues = [].map.call(element.attributes, function (attr) {
          return attr.value;
        }).join("|");

        // First, check the elements attributes to see if any of them contain youtube or vimeo
        if (this.REGEXPS.videos.test(attributeValues)) return false;

        // Then check the elements inside this element for the same.
        if (this.REGEXPS.videos.test(element.innerHTML)) return false;
      }

      return true;
    });
  },

  /**
   * Check if a given node has one of its ancestor tag name matching the
   * provided one.
   * @param  HTMLElement node
   * @param  String      tagName
   * @param  Number      maxDepth
   * @param  Function    filterFn a filter to invoke to determine whether this node 'counts'
   * @return Boolean
   */
  _hasAncestorTag: function _hasAncestorTag(node, tagName, maxDepth, filterFn) {
    maxDepth = maxDepth || 3;
    tagName = tagName.toUpperCase();
    var depth = 0;
    while (node.parentNode) {
      if (maxDepth > 0 && depth > maxDepth) return false;
      if (node.parentNode.tagName === tagName && (!filterFn || filterFn(node.parentNode))) return true;
      node = node.parentNode;
      depth++;
    }
    return false;
  },

  /**
   * Return an object indicating how many rows and columns this table has.
   */
  _getRowAndColumnCount: function _getRowAndColumnCount(table) {
    var rows = 0;
    var columns = 0;
    var trs = table.getElementsByTagName("tr");
    for (var i = 0; i < trs.length; i++) {
      var rowspan = trs[i].getAttribute("rowspan") || 0;
      if (rowspan) {
        rowspan = parseInt(rowspan, 10);
      }
      rows += rowspan || 1;

      // Now look for column-related info
      var columnsInThisRow = 0;
      var cells = trs[i].getElementsByTagName("td");
      for (var j = 0; j < cells.length; j++) {
        var colspan = cells[j].getAttribute("colspan") || 0;
        if (colspan) {
          colspan = parseInt(colspan, 10);
        }
        columnsInThisRow += colspan || 1;
      }
      columns = Math.max(columns, columnsInThisRow);
    }
    return { rows: rows, columns: columns };
  },

  /**
   * Look for 'data' (as opposed to 'layout') tables, for which we use
   * similar checks as
   * https://dxr.mozilla.org/mozilla-central/rev/71224049c0b52ab190564d3ea0eab089a159a4cf/accessible/html/HTMLTableAccessible.cpp#920
   */
  _markDataTables: function _markDataTables(root) {
    var tables = root.getElementsByTagName("table");
    for (var i = 0; i < tables.length; i++) {
      var table = tables[i];
      var role = table.getAttribute("role");
      if (role == "presentation") {
        table._readabilityDataTable = false;
        continue;
      }
      var datatable = table.getAttribute("datatable");
      if (datatable == "0") {
        table._readabilityDataTable = false;
        continue;
      }
      var summary = table.getAttribute("summary");
      if (summary) {
        table._readabilityDataTable = true;
        continue;
      }

      var caption = table.getElementsByTagName("caption")[0];
      if (caption && caption.childNodes.length > 0) {
        table._readabilityDataTable = true;
        continue;
      }

      // If the table has a descendant with any of these tags, consider a data table:
      var dataTableDescendants = ["col", "colgroup", "tfoot", "thead", "th"];
      var descendantExists = function descendantExists(tag) {
        return !!table.getElementsByTagName(tag)[0];
      };
      if (dataTableDescendants.some(descendantExists)) {
        this.log("Data table because found data-y descendant");
        table._readabilityDataTable = true;
        continue;
      }

      // Nested tables indicate a layout table:
      if (table.getElementsByTagName("table")[0]) {
        table._readabilityDataTable = false;
        continue;
      }

      var sizeInfo = this._getRowAndColumnCount(table);
      if (sizeInfo.rows >= 10 || sizeInfo.columns > 4) {
        table._readabilityDataTable = true;
        continue;
      }
      // Now just go by size entirely:
      table._readabilityDataTable = sizeInfo.rows * sizeInfo.columns > 10;
    }
  },

  /**
   * Clean an element of all tags of type "tag" if they look fishy.
   * "Fishy" is an algorithm based on content length, classnames, link density, number of images & embeds, etc.
   *
   * @return void
   **/
  _cleanConditionally: function _cleanConditionally(e, tag) {
    if (!this._flagIsActive(this.FLAG_CLEAN_CONDITIONALLY)) return;

    var isList = tag === "ul" || tag === "ol";

    // Gather counts for other typical elements embedded within.
    // Traverse backwards so we can remove nodes at the same time
    // without effecting the traversal.
    //
    // TODO: Consider taking into account original contentScore here.
    this._removeNodes(e.getElementsByTagName(tag), function (node) {
      // First check if we're in a data table, in which case don't remove us.
      var isDataTable = function isDataTable(t) {
        return t._readabilityDataTable;
      };

      if (this._hasAncestorTag(node, "table", -1, isDataTable)) {
        return false;
      }

      var weight = this._getClassWeight(node);
      var contentScore = 0;

      this.log("Cleaning Conditionally", node);

      if (weight + contentScore < 0) {
        return true;
      }

      if (this._getCharCount(node, ",") < 10) {
        // If there are not very many commas, and the number of
        // non-paragraph elements is more than paragraphs or other
        // ominous signs, remove the element.
        var p = node.getElementsByTagName("p").length;
        var img = node.getElementsByTagName("img").length;
        var li = node.getElementsByTagName("li").length - 100;
        var input = node.getElementsByTagName("input").length;

        var embedCount = 0;
        var embeds = node.getElementsByTagName("embed");
        for (var ei = 0, il = embeds.length; ei < il; ei += 1) {
          if (!this.REGEXPS.videos.test(embeds[ei].src)) embedCount += 1;
        }

        var linkDensity = this._getLinkDensity(node);
        var contentLength = this._getInnerText(node).length;

        var haveToRemove = img > 1 && p / img < 0.5 && !this._hasAncestorTag(node, "figure") || !isList && li > p || input > Math.floor(p / 3) || !isList && contentLength < 25 && (img === 0 || img > 2) && !this._hasAncestorTag(node, "figure") || !isList && weight < 25 && linkDensity > 0.2 || weight >= 25 && linkDensity > 0.5 || embedCount === 1 && contentLength < 75 || embedCount > 1;
        return haveToRemove;
      }
      return false;
    });
  },

  /**
   * Clean out elements whose id/class combinations match specific string.
   *
   * @param Element
   * @param RegExp match id/class combination.
   * @return void
   **/
  _cleanMatchedNodes: function _cleanMatchedNodes(e, regex) {
    var endOfSearchMarkerNode = this._getNextNode(e, true);
    var next = this._getNextNode(e);
    while (next && next != endOfSearchMarkerNode) {
      if (regex.test(next.className + " " + next.id)) {
        next = this._removeAndGetNext(next);
      } else {
        next = this._getNextNode(next);
      }
    }
  },

  /**
   * Clean out spurious headers from an Element. Checks things like classnames and link density.
   *
   * @param Element
   * @return void
  **/
  _cleanHeaders: function _cleanHeaders(e) {
    for (var headerIndex = 1; headerIndex < 3; headerIndex += 1) {
      this._removeNodes(e.getElementsByTagName("h" + headerIndex), function (header) {
        return this._getClassWeight(header) < 0;
      });
    }
  },

  _flagIsActive: function _flagIsActive(flag) {
    return (this._flags & flag) > 0;
  },

  _removeFlag: function _removeFlag(flag) {
    this._flags = this._flags & ~flag;
  },

  _isProbablyVisible: function _isProbablyVisible(node) {
    return node.style.display != "none" && !node.hasAttribute("hidden");
  },

  /**
   * Decides whether or not the document is reader-able without parsing the whole thing.
   *
   * @return boolean Whether or not we suspect parse() will suceeed at returning an article object.
   */
  isProbablyReaderable: function isProbablyReaderable(helperIsVisible) {
    var nodes = this._getAllNodesWithTag(this._doc, ["p", "pre"]);

    // Get <div> nodes which have <br> node(s) and append them into the `nodes` variable.
    // Some articles' DOM structures might look like
    // <div>
    //   Sentences<br>
    //   <br>
    //   Sentences<br>
    // </div>
    var brNodes = this._getAllNodesWithTag(this._doc, ["div > br"]);
    if (brNodes.length) {
      var set = new Set();
      [].forEach.call(brNodes, function (node) {
        set.add(node.parentNode);
      });
      nodes = [].concat.apply(Array.from(set), nodes);
    }

    if (!helperIsVisible) {
      helperIsVisible = this._isProbablyVisible;
    }

    var score = 0;
    // This is a little cheeky, we use the accumulator 'score' to decide what to return from
    // this callback:
    return this._someNode(nodes, function (node) {
      if (helperIsVisible && !helperIsVisible(node)) return false;
      var matchString = node.className + " " + node.id;

      if (this.REGEXPS.unlikelyCandidates.test(matchString) && !this.REGEXPS.okMaybeItsACandidate.test(matchString)) {
        return false;
      }

      if (node.matches && node.matches("li p")) {
        return false;
      }

      var textContentLength = node.textContent.trim().length;
      if (textContentLength < 140) {
        return false;
      }

      score += Math.sqrt(textContentLength - 140);

      if (score > 20) {
        return true;
      }
      return false;
    });
  },

  /**
   * Runs readability.
   *
   * Workflow:
   *  1. Prep the document by removing script tags, css, etc.
   *  2. Build readability's DOM tree.
   *  3. Grab the article content from the current dom tree.
   *  4. Replace the current DOM tree with the new one.
   *  5. Read peacefully.
   *
   * @return void
   **/
  parse: function parse() {
    // Avoid parsing too large documents, as per configuration option
    if (this._maxElemsToParse > 0) {
      var numTags = this._doc.getElementsByTagName("*").length;
      if (numTags > this._maxElemsToParse) {
        throw new Error("Aborting parsing document; " + numTags + " elements found");
      }
    }

    // Remove script tags from the document.
    this._removeScripts(this._doc);

    this._prepDocument();

    var metadata = this._getArticleMetadata();
    this._articleTitle = metadata.title;

    var articleContent = this._grabArticle();
    if (!articleContent) return null;

    this.log("Grabbed: " + articleContent.innerHTML);

    this._postProcessContent(articleContent);

    // If we haven't found an excerpt in the article's metadata, use the article's
    // first paragraph as the excerpt. This is used for displaying a preview of
    // the article's content.
    if (!metadata.excerpt) {
      var paragraphs = articleContent.getElementsByTagName("p");
      if (paragraphs.length > 0) {
        metadata.excerpt = paragraphs[0].textContent.trim();
      }
    }

    var textContent = articleContent.textContent;
    return {
      title: this._articleTitle,
      byline: metadata.byline || this._articleByline,
      dir: this._articleDir,
      content: articleContent.innerHTML,
      textContent: textContent,
      length: textContent.length,
      excerpt: metadata.excerpt
    };
  }
};

if ((typeof module === "undefined" ? "undefined" : _typeof(module)) === "object") {
  module.exports = Readability;
}

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJkZXZTcmMvY29udGVudFNjcmlwdC5qcyIsImRldlNyYy9saWIvUmVhZGFiaWxpdHkuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7O0FDQUE7Ozs7Ozs7O0lBRU0scUI7QUFDRixxQ0FBYztBQUFBOztBQUNWLGFBQUssR0FBTCxHQUFXLElBQVg7QUFDQSxhQUFLLE1BQUwsR0FBYyxLQUFkO0FBQ0EsYUFBSyxPQUFMLEdBQWUsRUFBZjtBQUNBLGFBQUssU0FBTDtBQUNBLGFBQUssVUFBTCxHQUFrQixFQUFsQjtBQUNBLGFBQUssVUFBTCxHQUFrQixFQUFsQjtBQUNBLGFBQUssY0FBTDtBQUNBLGFBQUssT0FBTCxHQUFlLElBQWY7QUFDQSxhQUFLLG9CQUFMO0FBQ0g7Ozs7K0NBRXNCO0FBQUE7O0FBQ25CLGdCQUFJLFVBQVUsT0FBTyxPQUFqQixJQUE0QixPQUFPLE9BQVAsQ0FBZSxLQUEvQyxFQUFzRDtBQUNsRCxxQkFBSyxXQUFMO0FBQ0gsYUFGRCxNQUVPO0FBQ0gsMkJBQVc7QUFBQSwyQkFBTSxNQUFLLG9CQUFMLEVBQU47QUFBQSxpQkFBWCxFQUE4QyxHQUE5QztBQUNIO0FBQ0o7OztzQ0FFYTtBQUNWLGdCQUFJLFVBQVUsT0FBTyxPQUFqQixJQUE0QixPQUFPLE9BQVAsQ0FBZSxLQUEvQyxFQUFzRDtBQUNsRCxxQkFBSyxPQUFMLEdBQWUsT0FBTyxPQUFQLENBQWUsS0FBOUI7QUFDSCxhQUZELE1BRU87QUFDSCx3QkFBUSxLQUFSLENBQWMsaUNBQWQ7QUFDQTtBQUNBLHFCQUFLLE9BQUwsR0FBZTtBQUNYLHlCQUFLLGFBQUMsR0FBRCxFQUFNLFFBQU4sRUFBbUI7QUFDcEIsNEJBQU0sUUFBUSxhQUFhLE9BQWIsQ0FBcUIsR0FBckIsQ0FBZDtBQUNBLGlDQUFTLFFBQVEsS0FBSyxLQUFMLENBQVcsS0FBWCxDQUFSLEdBQTRCLEVBQXJDO0FBQ0gscUJBSlU7QUFL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OXJEcUIsQ0FBeEI7O0FBaXNEQSxJQUFJLFFBQU8sTUFBUCx5Q0FBTyxNQUFQLE9BQWtCLFFBQXRCLEVBQWdDO0FBQzlCLFNBQU8sT0FBUCxHQUFpQixXQUFqQjtBQUNEIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiaW1wb3J0IFJlYWRhYmlsaXR5IGZyb20gJy4vbGliL1JlYWRhYmlsaXR5JztcclxuXHJcbmNsYXNzIEVuZ2xpc2hMZWFybmluZ1JlYWRlciB7XHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLnRwbCA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5hY3RpdmUgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLmhvdGtleXMgPSBbXTtcclxuICAgICAgICB0aGlzLmFkZEV2ZW50cygpO1xyXG4gICAgICAgIHRoaXMuZGljdGlvbmFyeSA9IHt9O1xyXG4gICAgICAgIHRoaXMudm9jYWJ1bGFyeSA9IFtdO1xyXG4gICAgICAgIHRoaXMubG9hZERpY3Rpb25hcnkoKTtcclxuICAgICAgICB0aGlzLnN0b3JhZ2UgPSBudWxsO1xyXG4gICAgICAgIHRoaXMuaW5pdFN0b3JhZ2VXaGVuUmVhZHkoKTtcclxuICAgIH1cclxuXHJcbiAgICBpbml0U3RvcmFnZVdoZW5SZWFkeSgpIHtcclxuICAgICAgICBpZiAoY2hyb21lICYmIGNocm9tZS5zdG9yYWdlICYmIGNocm9tZS5zdG9yYWdlLmxvY2FsKSB7XHJcbiAgICAgICAgICAgIHRoaXMuaW5pdFN0b3JhZ2UoKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHRoaXMuaW5pdFN0b3JhZ2VXaGVuUmVhZHkoKSwgMTAwKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaW5pdFN0b3JhZ2UoKSB7XHJcbiAgICAgICAgaWYgKGNocm9tZSAmJiBjaHJvbWUuc3RvcmFnZSAmJiBjaHJvbWUuc3RvcmFnZS5sb2NhbCkge1xyXG4gICAgICAgICAgICB0aGlzLnN0b3JhZ2UgPSBjaHJvbWUuc3RvcmFnZS5sb2NhbDtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdDaHJvbWUgc3RvcmFnZSBpcyBub3QgYXZhaWxhYmxlJyk7XHJcbiAgICAgICAgICAgIC8vIOWPr+S7peWcqOi/memHjOWunueOsOS4gOS4quWkh+eUqOWtmOWCqOaWueahiO+8jOavlOWmguS9v+eUqCBsb2NhbFN0b3JhZ2VcclxuICAgICAgICAgICAgdGhpcy5zdG9yYWdlID0ge1xyXG4gICAgICAgICAgICAgICAgZ2V0OiAoa2V5LCBjYWxsYmFjaykgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oa2V5KTtcclxuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayh2YWx1ZSA/IEpTT04ucGFyc2UodmFsdWUpIDoge30pO1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHNldDogKG9iaiwgY2FsbGJhY2spID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBPYmplY3Qua2V5cyhvYmopLmZvckVhY2goa2V5ID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oa2V5LCBKU09OLnN0cmluZ2lmeShvYmpba2V5XSkpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChjYWxsYmFjaykgY2FsbGJhY2soKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgYWRkUmVhZFBhZ2UoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuYWN0aXZlKSByZXR1cm47XHJcbiAgICAgICAgaWYgKCF0aGlzLnRwbCkge1xyXG4gICAgICAgICAgICBsZXQgYXJ0aWNsZSA9IG5ldyBSZWFkYWJpbGl0eShkb2N1bWVudC5jbG9uZU5vZGUodHJ1ZSkpLnBhcnNlKCk7XHJcbiAgICAgICAgICAgIGxldCByZWcgPSAvZGF0YS0oXFx3KilzcmMvZztcclxuICAgICAgICAgICAgbGV0IGNvbnRlbnQgPSBhcnRpY2xlLmNvbnRlbnQucmVwbGFjZShyZWcsICdzcmMnKTtcclxuICAgICAgICAgICAgdGhpcy50cGwgPSBgPGRpdiBjbGFzcz1cImNlbnRlci1hcmVhXCIgaWQ9XCJjbGVhclJlYWRDZW50ZXJBcmVhXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiYXJ0aWNsZVwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxoMSBjbGFzcz1cInRpdGxlXCI+JHthcnRpY2xlLnRpdGxlfTwvaDE+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImNvbnRlbnRcIj4ke2NvbnRlbnR9PC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+YDtcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG4gICAgICAgIGRpdi5pZCA9ICdjbGVhclJlYWQnO1xyXG4gICAgICAgIGRpdi5zZXRBdHRyaWJ1dGUoJ2NsYXNzJywgJ2NsZWFycmVhZC1tb2RlJyk7XHJcbiAgICAgICAgZGl2LmlubmVySFRNTCA9IHRoaXMudHBsO1xyXG4gICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoZGl2KTtcclxuICAgICAgICBkb2N1bWVudC5ib2R5LnN0eWxlLm92ZXJmbG93ID0gJ2hpZGRlbic7XHJcbiAgICAgICAgbGV0IGltZ3MgPSBkaXYuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2ltZycpO1xyXG4gICAgICAgIGxldCBhcmVhV2lkdGggPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2xlYXJSZWFkQ2VudGVyQXJlYScpLmNsaWVudFdpZHRoO1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaW1ncy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBsZXQgd2lkdGggPSBpbWdzW2ldLm5hdHVyYWxXaWR0aDtcclxuICAgICAgICAgICAgaWYgKHdpZHRoKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgY2VudGVyQXJlYVdpZHRoID0gYXJlYVdpZHRoO1xyXG4gICAgICAgICAgICAgICAgaWYgKHdpZHRoIDwgKGNlbnRlckFyZWFXaWR0aCAtIDE0MCkpIHtcclxuICAgICAgICAgICAgICAgICAgICBpbWdzW2ldLnNldEF0dHJpYnV0ZSgnY2xhc3MnLCAnaW1nLWMnKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGltZ3NbaV0ub25sb2FkID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgbGV0IHdpZHRoID0gdGhpcy5uYXR1cmFsV2lkdGg7XHJcbiAgICAgICAgICAgICAgICBsZXQgY2VudGVyQXJlYVdpZHRoID0gYXJlYVdpZHRoO1xyXG4gICAgICAgICAgICAgICAgaWYgKHdpZHRoIDwgKGNlbnRlckFyZWFXaWR0aCAtIDE0MCkpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNldEF0dHJpYnV0ZSgnY2xhc3MnLCAnaW1nLWMnKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuYWRkVHJhbnNsYXRpb25GZWF0dXJlKCk7XHJcbiAgICAgICAgdGhpcy5hZGRWb2NhYnVsYXJ5RmVhdHVyZSgpO1xyXG4gICAgICAgIHRoaXMuYWN0aXZlID0gdHJ1ZTtcclxuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICAgZGl2LnNldEF0dHJpYnV0ZSgnY2xhc3MnLCAnY2xlYXJyZWFkLW1vZGUgY2xlYXJyZWFkLW1vZGUtc2hvdycpO1xyXG4gICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2xlYXJSZWFkQ2VudGVyQXJlYScpLnNldEF0dHJpYnV0ZSgnY2xhc3MnLCAnY2VudGVyLWFyZWEgY2VudGVyLWFyZWEtc2hvdycpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGFkZFRyYW5zbGF0aW9uRmVhdHVyZSgpIHtcclxuICAgICAgICBsZXQgY29udGVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNjbGVhclJlYWRDZW50ZXJBcmVhIC5jb250ZW50Jyk7XHJcbiAgICAgICAgY29udGVudC5hZGRFdmVudExpc3RlbmVyKCdkYmxjbGljaycsIChlKSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChlLnRhcmdldC50YWdOYW1lID09PSAnV09SRCcpIHJldHVybjtcclxuICAgICAgICAgICAgbGV0IHNlbGVjdGlvbiA9IHdpbmRvdy5nZXRTZWxlY3Rpb24oKTtcclxuICAgICAgICAgICAgbGV0IHdvcmQgPSBzZWxlY3Rpb24udG9TdHJpbmcoKS50cmltKCkudG9Mb3dlckNhc2UoKTtcclxuICAgICAgICAgICAgaWYgKHdvcmQgJiYgdGhpcy5kaWN0aW9uYXJ5W3dvcmRdKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgc3BhbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3dvcmQnKTtcclxuICAgICAgICAgICAgICAgIHNwYW4udGV4dENvbnRlbnQgPSBzZWxlY3Rpb24udG9TdHJpbmcoKTtcclxuICAgICAgICAgICAgICAgIHNwYW4uc2V0QXR0cmlidXRlKCd0aXRsZScsIHRoaXMuZGljdGlvbmFyeVt3b3JkXSk7XHJcbiAgICAgICAgICAgICAgICBzcGFuLmNsYXNzTGlzdC5hZGQoJ3RyYW5zbGF0ZWQtd29yZCcpO1xyXG4gICAgICAgICAgICAgICAgbGV0IHJhbmdlID0gc2VsZWN0aW9uLmdldFJhbmdlQXQoMCk7XHJcbiAgICAgICAgICAgICAgICByYW5nZS5kZWxldGVDb250ZW50cygpO1xyXG4gICAgICAgICAgICAgICAgcmFuZ2UuaW5zZXJ0Tm9kZShzcGFuKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGFkZFZvY2FidWxhcnlGZWF0dXJlKCkge1xyXG4gICAgICAgIGxldCBjb250ZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2NsZWFyUmVhZENlbnRlckFyZWEgLmNvbnRlbnQnKTtcclxuICAgICAgICBjb250ZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGUpID0+IHtcclxuICAgICAgICAgICAgaWYgKGUudGFyZ2V0LmNsYXNzTGlzdC5jb250YWlucygndHJhbnNsYXRlZC13b3JkJykpIHtcclxuICAgICAgICAgICAgICAgIGxldCB3b3JkID0gZS50YXJnZXQudGV4dENvbnRlbnQudG9Mb3dlckNhc2UoKTtcclxuICAgICAgICAgICAgICAgIGlmICghdGhpcy52b2NhYnVsYXJ5LmluY2x1ZGVzKHdvcmQpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy52b2NhYnVsYXJ5LnB1c2god29yZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zYXZlVm9jYWJ1bGFyeSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2hvd05vdGlmaWNhdGlvbihgXCIke3dvcmR9XCIgaGFzIGJlZW4gYWRkZWQgdG8geW91ciB2b2NhYnVsYXJ5IGxpc3QuYCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBzaG93Tm90aWZpY2F0aW9uKG1lc3NhZ2UpIHtcclxuICAgICAgICBsZXQgbm90aWZpY2F0aW9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgICAgICAgbm90aWZpY2F0aW9uLnRleHRDb250ZW50ID0gbWVzc2FnZTtcclxuICAgICAgICBub3RpZmljYXRpb24uY2xhc3NMaXN0LmFkZCgnZW5nbGlzaC1sZWFybmluZy1ub3RpZmljYXRpb24nKTtcclxuICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKG5vdGlmaWNhdGlvbik7XHJcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICAgIG5vdGlmaWNhdGlvbi5yZW1vdmUoKTtcclxuICAgICAgICB9LCAzMDAwKTtcclxuICAgIH1cclxuXHJcbiAgICBsb2FkRGljdGlvbmFyeSgpIHtcclxuICAgICAgICBmZXRjaChjaHJvbWUucnVudGltZS5nZXRVUkwoJ2dwdHdvcmRzLmpzb24nKSlcclxuICAgICAgICAgICAgLnRoZW4ocmVzcG9uc2UgPT4gcmVzcG9uc2UuanNvbigpKVxyXG4gICAgICAgICAgICAudGhlbihkaWN0aW9uYXJ5ID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGljdGlvbmFyeSA9IGRpY3Rpb25hcnk7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5jYXRjaChlcnJvciA9PiB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBsb2FkaW5nIGdwdHdvcmRzLmpzb246JywgZXJyb3IpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBzYXZlVm9jYWJ1bGFyeSgpIHtcclxuICAgICAgICBpZiAodGhpcy5zdG9yYWdlKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc3RvcmFnZS5zZXQoe3ZvY2FidWxhcnk6IHRoaXMudm9jYWJ1bGFyeX0pO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1N0b3JhZ2UgaXMgbm90IGF2YWlsYWJsZScpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZW1vdmVSZWFkUGFnZSgpIHtcclxuICAgICAgICBpZiAoIXRoaXMuYWN0aXZlKSByZXR1cm47XHJcbiAgICAgICAgbGV0IGNsZWFyUmVhZCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjbGVhclJlYWQnKTtcclxuICAgICAgICBsZXQgY2xlYXJSZWFkQ2VudGVyQXJlYSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjbGVhclJlYWRDZW50ZXJBcmVhJyk7XHJcbiAgICAgICAgY2xlYXJSZWFkQ2VudGVyQXJlYS5zZXRBdHRyaWJ1dGUoJ2NsYXNzJywgJ2NlbnRlci1hcmVhJyk7XHJcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICAgIGNsZWFyUmVhZC5zZXRBdHRyaWJ1dGUoJ2NsYXNzJywgJ2NsZWFycmVhZC1tb2RlJyk7XHJcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5zdHlsZS5vdmVyZmxvdyA9ICcnO1xyXG4gICAgICAgICAgICAgICAgbGV0IHBhcmVudE5vZGUgPSBjbGVhclJlYWQucGFyZW50Tm9kZTtcclxuICAgICAgICAgICAgICAgIHBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoY2xlYXJSZWFkKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuYWN0aXZlID0gZmFsc2U7XHJcbiAgICAgICAgICAgIH0sIDI1MCk7XHJcbiAgICAgICAgfSwgMTAwKTtcclxuICAgIH1cclxuXHJcbiAgICBhZGRFdmVudHMoKSB7XHJcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZSkgPT4ge1xyXG4gICAgICAgICAgICBpZiAoZS50YXJnZXQuaWQgPT09ICdjbGVhclJlYWQnKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgY2xhc3NOYW1lcyA9IGUudGFyZ2V0LmNsYXNzTmFtZTtcclxuICAgICAgICAgICAgICAgIGlmIChjbGFzc05hbWVzLmluZGV4T2YoJ2NsZWFycmVhZC1tb2RlLXNob3cnKSA+IC0xKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yZW1vdmVSZWFkUGFnZSgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIChlKSA9PiB7XHJcbiAgICAgICAgICAgIGxldCBjb2RlID0gZS5rZXlDb2RlO1xyXG4gICAgICAgICAgICBpZiAodGhpcy5ob3RrZXlzLmluZGV4T2YoY29kZSkgPT0gLTEpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuaG90a2V5cy5wdXNoKGNvZGUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5dXAnLCAoZSkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5zdG9yYWdlKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnN0b3JhZ2UuZ2V0KChkYXRhKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGRhdGEuaGFzT3duUHJvcGVydHkoJ3N0YXRlJykgJiYgZGF0YS5zdGF0ZSA9PSAnY2xvc2UnKSByZXR1cm47XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGRhdGEuaGFzT3duUHJvcGVydHkoJ29wZW4nKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgb3BlbmtleXMgPSBkYXRhLm9wZW47XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChKU09OLnN0cmluZ2lmeSh0aGlzLmhvdGtleXMpID09IEpTT04uc3RyaW5naWZ5KG9wZW5rZXlzKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5hZGRSZWFkUGFnZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGUuc2hpZnRLZXkgJiYgZS5rZXlDb2RlID09IDEzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmFkZFJlYWRQYWdlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGRhdGEuaGFzT3duUHJvcGVydHkoJ2Nsb3NlJykpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGNsb3Nla2V5cyA9IGRhdGEuY2xvc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChKU09OLnN0cmluZ2lmeSh0aGlzLmhvdGtleXMpID09IEpTT04uc3RyaW5naWZ5KGNsb3Nla2V5cykpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucmVtb3ZlUmVhZFBhZ2UoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChlLmtleUNvZGUgPT0gMjcpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucmVtb3ZlUmVhZFBhZ2UoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmhvdGtleXMgPSBbXTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY29weScsIGV2ZW50ID0+IHtcclxuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTsgLy8g6Zi75q2i6buY6K6k5aSN5Yi26KGM5Li6XHJcblxyXG4gICAgICAgICAgICBjaHJvbWUucnVudGltZS5zZW5kTWVzc2FnZSh7dGV4dDogJ2NvcGllZCd9LCByZXNwb25zZSA9PiB7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59XHJcblxyXG4vLyDnoa7kv50gRE9NIOWKoOi9veWujOaIkOWQjuWGjeWIneWni+WMllxyXG5pZiAoZG9jdW1lbnQucmVhZHlTdGF0ZSA9PT0gJ2xvYWRpbmcnKSB7XHJcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgKCkgPT4gbmV3IEVuZ2xpc2hMZWFybmluZ1JlYWRlcigpKTtcclxufSBlbHNlIHtcclxuICAgIG5ldyBFbmdsaXNoTGVhcm5pbmdSZWFkZXIoKTtcclxufVxyXG4iLCIvKmVzbGludC1lbnYgZXM2OmZhbHNlKi9cclxuLypcclxuICogQ29weXJpZ2h0IChjKSAyMDEwIEFyYzkwIEluY1xyXG4gKlxyXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xyXG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXHJcbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxyXG4gKlxyXG4gKiAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXHJcbiAqXHJcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcclxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxyXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cclxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxyXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cclxuICovXHJcblxyXG4vKlxyXG4gKiBUaGlzIGNvZGUgaXMgaGVhdmlseSBiYXNlZCBvbiBBcmM5MCdzIHJlYWRhYmlsaXR5LmpzICgxLjcuMSkgc2NyaXB0XHJcbiAqIGF2YWlsYWJsZSBhdDogaHR0cDovL2NvZGUuZ29vZ2xlLmNvbS9wL2FyYzkwbGFicy1yZWFkYWJpbGl0eVxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBQdWJsaWMgY29uc3RydWN0b3IuXHJcbiAqIEBwYXJhbSB7SFRNTERvY3VtZW50fSBkb2MgICAgIFRoZSBkb2N1bWVudCB0byBwYXJzZS5cclxuICogQHBhcmFtIHtPYmplY3R9ICAgICAgIG9wdGlvbnMgVGhlIG9wdGlvbnMgb2JqZWN0LlxyXG4gKi9cclxuZnVuY3Rpb24gUmVhZGFiaWxpdHkoZG9jLCBvcHRpb25zKSB7XHJcbiAgLy8gSW4gc29tZSBvbGRlciB2ZXJzaW9ucywgcGVvcGxlIHBhc3NlZCBhIFVSSSBhcyB0aGUgZmlyc3QgYXJndW1lbnQuIENvcGU6XHJcbiAgaWYgKG9wdGlvbnMgJiYgb3B0aW9ucy5kb2N1bWVudEVsZW1lbnQpIHtcclxuICAgIGRvYyA9IG9wdGlvbnM7XHJcbiAgICBvcHRpb25zID0gYXJndW1lbnRzWzJdO1xyXG4gIH0gZWxzZSBpZiAoIWRvYyB8fCAhZG9jLmRvY3VtZW50RWxlbWVudCkge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKFwiRmlyc3QgYXJndW1lbnQgdG8gUmVhZGFiaWxpdHkgY29uc3RydWN0b3Igc2hvdWxkIGJlIGEgZG9jdW1lbnQgb2JqZWN0LlwiKTtcclxuICB9XHJcbiAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XHJcblxyXG4gIHRoaXMuX2RvYyA9IGRvYztcclxuICB0aGlzLl9hcnRpY2xlVGl0bGUgPSBudWxsO1xyXG4gIHRoaXMuX2FydGljbGVCeWxpbmUgPSBudWxsO1xyXG4gIHRoaXMuX2FydGljbGVEaXIgPSBudWxsO1xyXG4gIHRoaXMuX2F0dGVtcHRzID0gW107XHJcblxyXG4gIC8vIENvbmZpZ3VyYWJsZSBvcHRpb25zXHJcbiAgdGhpcy5fZGVidWcgPSAhIW9wdGlvbnMuZGVidWc7XHJcbiAgdGhpcy5fbWF4RWxlbXNUb1BhcnNlID0gb3B0aW9ucy5tYXhFbGVtc1RvUGFyc2UgfHwgdGhpcy5ERUZBVUxUX01BWF9FTEVNU19UT19QQVJTRTtcclxuICB0aGlzLl9uYlRvcENhbmRpZGF0ZXMgPSBvcHRpb25zLm5iVG9wQ2FuZGlkYXRlcyB8fCB0aGlzLkRFRkFVTFRfTl9UT1BfQ0FORElEQVRFUztcclxuICB0aGlzLl9jaGFyVGhyZXNob2xkID0gb3B0aW9ucy5jaGFyVGhyZXNob2xkIHx8IHRoaXMuREVGQVVMVF9DSEFSX1RIUkVTSE9MRDtcclxuICB0aGlzLl9jbGFzc2VzVG9QcmVzZXJ2ZSA9IHRoaXMuQ0xBU1NFU19UT19QUkVTRVJWRS5jb25jYXQob3B0aW9ucy5jbGFzc2VzVG9QcmVzZXJ2ZSB8fCBbXSk7XHJcblxyXG4gIC8vIFN0YXJ0IHdpdGggYWxsIGZsYWdzIHNldFxyXG4gIHRoaXMuX2ZsYWdzID0gdGhpcy5GTEFHX1NUUklQX1VOTElLRUxZUyB8XHJcbiAgICAgICAgICAgICAgICB0aGlzLkZMQUdfV0VJR0hUX0NMQVNTRVMgfFxyXG4gICAgICAgICAgICAgICAgdGhpcy5GTEFHX0NMRUFOX0NPTkRJVElPTkFMTFk7XHJcblxyXG4gIHZhciBsb2dFbDtcclxuXHJcbiAgLy8gQ29udHJvbCB3aGV0aGVyIGxvZyBtZXNzYWdlcyBhcmUgc2VudCB0byB0aGUgY29uc29sZVxyXG4gIGlmICh0aGlzLl9kZWJ1Zykge1xyXG4gICAgbG9nRWwgPSBmdW5jdGlvbihlKSB7XHJcbiAgICAgIHZhciBydiA9IGUubm9kZU5hbWUgKyBcIiBcIjtcclxuICAgICAgaWYgKGUubm9kZVR5cGUgPT0gZS5URVhUX05PREUpIHtcclxuICAgICAgICByZXR1cm4gcnYgKyAnKFwiJyArIGUudGV4dENvbnRlbnQgKyAnXCIpJztcclxuICAgICAgfVxyXG4gICAgICB2YXIgY2xhc3NEZXNjID0gZS5jbGFzc05hbWUgJiYgKFwiLlwiICsgZS5jbGFzc05hbWUucmVwbGFjZSgvIC9nLCBcIi5cIikpO1xyXG4gICAgICB2YXIgZWxEZXNjID0gXCJcIjtcclxuICAgICAgaWYgKGUuaWQpXHJcbiAgICAgICAgZWxEZXNjID0gXCIoI1wiICsgZS5pZCArIGNsYXNzRGVzYyArIFwiKVwiO1xyXG4gICAgICBlbHNlIGlmIChjbGFzc0Rlc2MpXHJcbiAgICAgICAgZWxEZXNjID0gXCIoXCIgKyBjbGFzc0Rlc2MgKyBcIilcIjtcclxuICAgICAgcmV0dXJuIHJ2ICsgZWxEZXNjO1xyXG4gICAgfTtcclxuICAgIHRoaXMubG9nID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICBpZiAodHlwZW9mIGR1bXAgIT09IFwidW5kZWZpbmVkXCIpIHtcclxuICAgICAgICB2YXIgbXNnID0gQXJyYXkucHJvdG90eXBlLm1hcC5jYWxsKGFyZ3VtZW50cywgZnVuY3Rpb24oeCkge1xyXG4gICAgICAgICAgcmV0dXJuICh4ICYmIHgubm9kZU5hbWUpID8gbG9nRWwoeCkgOiB4O1xyXG4gICAgICAgIH0pLmpvaW4oXCIgXCIpO1xyXG4gICAgICAgIGR1bXAoXCJSZWFkZXI6IChSZWFkYWJpbGl0eSkgXCIgKyBtc2cgKyBcIlxcblwiKTtcclxuICAgICAgfSBlbHNlIGlmICh0eXBlb2YgY29uc29sZSAhPT0gXCJ1bmRlZmluZWRcIikge1xyXG4gICAgICAgIHZhciBhcmdzID0gW1wiUmVhZGVyOiAoUmVhZGFiaWxpdHkpIFwiXS5jb25jYXQoYXJndW1lbnRzKTtcclxuICAgICAgICBjb25zb2xlLmxvZy5hcHBseShjb25zb2xlLCBhcmdzKTtcclxuICAgICAgfVxyXG4gICAgfTtcclxuICB9IGVsc2Uge1xyXG4gICAgdGhpcy5sb2cgPSBmdW5jdGlvbiAoKSB7fTtcclxuICB9XHJcbn1cclxuXHJcblJlYWRhYmlsaXR5LnByb3RvdHlwZSA9IHtcclxuICBGTEFHX1NUUklQX1VOTElLRUxZUzogMHgxLFxyXG4gIEZMQUdfV0VJR0hUX0NMQVNTRVM6IDB4MixcclxuICBGTEFHX0NMRUFOX0NPTkRJVElPTkFMTFk6IDB4NCxcclxuXHJcbiAgLy8gaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL05vZGUvbm9kZVR5cGVcclxuICBFTEVNRU5UX05PREU6IDEsXHJcbiAgVEVYVF9OT0RFOiAzLFxyXG5cclxuICAvLyBNYXggbnVtYmVyIG9mIG5vZGVzIHN1cHBvcnRlZCBieSB0aGlzIHBhcnNlci4gRGVmYXVsdDogMCAobm8gbGltaXQpXHJcbiAgREVGQVVMVF9NQVhfRUxFTVNfVE9fUEFSU0U6IDAsXHJcblxyXG4gIC8vIFRoZSBudW1iZXIgb2YgdG9wIGNhbmRpZGF0ZXMgdG8gY29uc2lkZXIgd2hlbiBhbmFseXNpbmcgaG93XHJcbiAgLy8gdGlnaHQgdGhlIGNvbXBldGl0aW9uIGlzIGFtb25nIGNhbmRpZGF0ZXMuXHJcbiAgREVGQVVMVF9OX1RPUF9DQU5ESURBVEVTOiA1LFxyXG5cclxuICAvLyBFbGVtZW50IHRhZ3MgdG8gc2NvcmUgYnkgZGVmYXVsdC5cclxuICBERUZBVUxUX1RBR1NfVE9fU0NPUkU6IFwic2VjdGlvbixoMixoMyxoNCxoNSxoNixwLHRkLHByZVwiLnRvVXBwZXJDYXNlKCkuc3BsaXQoXCIsXCIpLFxyXG5cclxuICAvLyBUaGUgZGVmYXVsdCBudW1iZXIgb2YgY2hhcnMgYW4gYXJ0aWNsZSBtdXN0IGhhdmUgaW4gb3JkZXIgdG8gcmV0dXJuIGEgcmVzdWx0XHJcbiAgREVGQVVMVF9DSEFSX1RIUkVTSE9MRDogNTAwLFxyXG5cclxuICAvLyBBbGwgb2YgdGhlIHJlZ3VsYXIgZXhwcmVzc2lvbnMgaW4gdXNlIHdpdGhpbiByZWFkYWJpbGl0eS5cclxuICAvLyBEZWZpbmVkIHVwIGhlcmUgc28gd2UgZG9uJ3QgaW5zdGFudGlhdGUgdGhlbSByZXBlYXRlZGx5IGluIGxvb3BzLlxyXG4gIFJFR0VYUFM6IHtcclxuICAgIHVubGlrZWx5Q2FuZGlkYXRlczogLy1hZC18YmFubmVyfGJyZWFkY3J1bWJzfGNvbWJ4fGNvbW1lbnR8Y29tbXVuaXR5fGNvdmVyLXdyYXB8ZGlzcXVzfGV4dHJhfGZvb3R8aGVhZGVyfGxlZ2VuZHN8bWVudXxyZWxhdGVkfHJlbWFya3xyZXBsaWVzfHJzc3xzaG91dGJveHxzaWRlYmFyfHNreXNjcmFwZXJ8c29jaWFsfHNwb25zb3J8c3VwcGxlbWVudGFsfGFkLWJyZWFrfGFnZWdhdGV8cGFnaW5hdGlvbnxwYWdlcnxwb3B1cHx5b20tcmVtb3RlL2ksXHJcbiAgICBva01heWJlSXRzQUNhbmRpZGF0ZTogL2FuZHxhcnRpY2xlfGJvZHl8Y29sdW1ufG1haW58c2hhZG93L2ksXHJcbiAgICBwb3NpdGl2ZTogL2FydGljbGV8Ym9keXxjb250ZW50fGVudHJ5fGhlbnRyeXxoLWVudHJ5fG1haW58cGFnZXxwYWdpbmF0aW9ufHBvc3R8dGV4dHxibG9nfHN0b3J5L2ksXHJcbiAgICBuZWdhdGl2ZTogL2hpZGRlbnxeaGlkJHwgaGlkJHwgaGlkIHxeaGlkIHxiYW5uZXJ8Y29tYnh8Y29tbWVudHxjb20tfGNvbnRhY3R8Zm9vdHxmb290ZXJ8Zm9vdG5vdGV8bWFzdGhlYWR8bWVkaWF8bWV0YXxvdXRicmFpbnxwcm9tb3xyZWxhdGVkfHNjcm9sbHxzaGFyZXxzaG91dGJveHxzaWRlYmFyfHNreXNjcmFwZXJ8c3BvbnNvcnxzaG9wcGluZ3x0YWdzfHRvb2x8d2lkZ2V0L2ksXHJcbiAgICBleHRyYW5lb3VzOiAvcHJpbnR8YXJjaGl2ZXxjb21tZW50fGRpc2N1c3N8ZVtcXC1dP21haWx8c2hhcmV8cmVwbHl8YWxsfGxvZ2lufHNpZ258c2luZ2xlfHV0aWxpdHkvaSxcclxuICAgIGJ5bGluZTogL2J5bGluZXxhdXRob3J8ZGF0ZWxpbmV8d3JpdHRlbmJ5fHAtYXV0aG9yL2ksXHJcbiAgICByZXBsYWNlRm9udHM6IC88KFxcLz8pZm9udFtePl0qPi9naSxcclxuICAgIG5vcm1hbGl6ZTogL1xcc3syLH0vZyxcclxuICAgIHZpZGVvczogL1xcL1xcLyh3d3dcXC4pPyhkYWlseW1vdGlvbnx5b3V0dWJlfHlvdXR1YmUtbm9jb29raWV8cGxheWVyXFwudmltZW8pXFwuY29tL2ksXHJcbiAgICBuZXh0TGluazogLyhuZXh0fHdlaXRlcnxjb250aW51ZXw+KFteXFx8XXwkKXzCuyhbXlxcfF18JCkpL2ksXHJcbiAgICBwcmV2TGluazogLyhwcmV2fGVhcmx8b2xkfG5ld3w8fMKrKS9pLFxyXG4gICAgd2hpdGVzcGFjZTogL15cXHMqJC8sXHJcbiAgICBoYXNDb250ZW50OiAvXFxTJC8sXHJcbiAgfSxcclxuXHJcbiAgRElWX1RPX1BfRUxFTVM6IFsgXCJBXCIsIFwiQkxPQ0tRVU9URVwiLCBcIkRMXCIsIFwiRElWXCIsIFwiSU1HXCIsIFwiT0xcIiwgXCJQXCIsIFwiUFJFXCIsIFwiVEFCTEVcIiwgXCJVTFwiLCBcIlNFTEVDVFwiIF0sXHJcblxyXG4gIEFMVEVSX1RPX0RJVl9FWENFUFRJT05TOiBbXCJESVZcIiwgXCJBUlRJQ0xFXCIsIFwiU0VDVElPTlwiLCBcIlBcIl0sXHJcblxyXG4gIFBSRVNFTlRBVElPTkFMX0FUVFJJQlVURVM6IFsgXCJhbGlnblwiLCBcImJhY2tncm91bmRcIiwgXCJiZ2NvbG9yXCIsIFwiYm9yZGVyXCIsIFwiY2VsbHBhZGRpbmdcIiwgXCJjZWxsc3BhY2luZ1wiLCBcImZyYW1lXCIsIFwiaHNwYWNlXCIsIFwicnVsZXNcIiwgXCJzdHlsZVwiLCBcInZhbGlnblwiLCBcInZzcGFjZVwiIF0sXHJcblxyXG4gIERFUFJFQ0FURURfU0laRV9BVFRSSUJVVEVfRUxFTVM6IFsgXCJUQUJMRVwiLCBcIlRIXCIsIFwiVERcIiwgXCJIUlwiLCBcIlBSRVwiIF0sXHJcblxyXG4gIC8vIFRoZSBjb21tZW50ZWQgb3V0IGVsZW1lbnRzIHF1YWxpZnkgYXMgcGhyYXNpbmcgY29udGVudCBidXQgdGVuZCB0byBiZVxyXG4gIC8vIHJlbW92ZWQgYnkgcmVhZGFiaWxpdHkgd2hlbiBwdXQgaW50byBwYXJhZ3JhcGhzLCBzbyB3ZSBpZ25vcmUgdGhlbSBoZXJlLlxyXG4gIFBIUkFTSU5HX0VMRU1TOiBbXHJcbiAgICAvLyBcIkNBTlZBU1wiLCBcIklGUkFNRVwiLCBcIlNWR1wiLCBcIlZJREVPXCIsXHJcbiAgICBcIkFCQlJcIiwgXCJBVURJT1wiLCBcIkJcIiwgXCJCRE9cIiwgXCJCUlwiLCBcIkJVVFRPTlwiLCBcIkNJVEVcIiwgXCJDT0RFXCIsIFwiREFUQVwiLFxyXG4gICAgXCJEQVRBTElTVFwiLCBcIkRGTlwiLCBcIkVNXCIsIFwiRU1CRURcIiwgXCJJXCIsIFwiSU1HXCIsIFwiSU5QVVRcIiwgXCJLQkRcIiwgXCJMQUJFTFwiLFxyXG4gICAgXCJNQVJLXCIsIFwiTUFUSFwiLCBcIk1FVEVSXCIsIFwiTk9TQ1JJUFRcIiwgXCJPQkpFQ1RcIiwgXCJPVVRQVVRcIiwgXCJQUk9HUkVTU1wiLCBcIlFcIixcclxuICAgIFwiUlVCWVwiLCBcIlNBTVBcIiwgXCJTQ1JJUFRcIiwgXCJTRUxFQ1RcIiwgXCJTTUFMTFwiLCBcIlNQQU5cIiwgXCJTVFJPTkdcIiwgXCJTVUJcIixcclxuICAgIFwiU1VQXCIsIFwiVEVYVEFSRUFcIiwgXCJUSU1FXCIsIFwiVkFSXCIsIFwiV0JSXCJcclxuICBdLFxyXG5cclxuICAvLyBUaGVzZSBhcmUgdGhlIGNsYXNzZXMgdGhhdCByZWFkYWJpbGl0eSBzZXRzIGl0c2VsZi5cclxuICBDTEFTU0VTX1RPX1BSRVNFUlZFOiBbIFwicGFnZVwiIF0sXHJcblxyXG4gIC8qKlxyXG4gICAqIFJ1biBhbnkgcG9zdC1wcm9jZXNzIG1vZGlmaWNhdGlvbnMgdG8gYXJ0aWNsZSBjb250ZW50IGFzIG5lY2Vzc2FyeS5cclxuICAgKlxyXG4gICAqIEBwYXJhbSBFbGVtZW50XHJcbiAgICogQHJldHVybiB2b2lkXHJcbiAgKiovXHJcbiAgX3Bvc3RQcm9jZXNzQ29udGVudDogZnVuY3Rpb24oYXJ0aWNsZUNvbnRlbnQpIHtcclxuICAgIC8vIFJlYWRhYmlsaXR5IGNhbm5vdCBvcGVuIHJlbGF0aXZlIHVyaXMgc28gd2UgY29udmVydCB0aGVtIHRvIGFic29sdXRlIHVyaXMuXHJcbiAgICB0aGlzLl9maXhSZWxhdGl2ZVVyaXMoYXJ0aWNsZUNvbnRlbnQpO1xyXG5cclxuICAgIC8vIFJlbW92ZSBjbGFzc2VzLlxyXG4gICAgdGhpcy5fY2xlYW5DbGFzc2VzKGFydGljbGVDb250ZW50KTtcclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBJdGVyYXRlcyBvdmVyIGEgTm9kZUxpc3QsIGNhbGxzIGBmaWx0ZXJGbmAgZm9yIGVhY2ggbm9kZSBhbmQgcmVtb3ZlcyBub2RlXHJcbiAgICogaWYgZnVuY3Rpb24gcmV0dXJuZWQgYHRydWVgLlxyXG4gICAqXHJcbiAgICogSWYgZnVuY3Rpb24gaXMgbm90IHBhc3NlZCwgcmVtb3ZlcyBhbGwgdGhlIG5vZGVzIGluIG5vZGUgbGlzdC5cclxuICAgKlxyXG4gICAqIEBwYXJhbSBOb2RlTGlzdCBub2RlTGlzdCBUaGUgbm9kZXMgdG8gb3BlcmF0ZSBvblxyXG4gICAqIEBwYXJhbSBGdW5jdGlvbiBmaWx0ZXJGbiB0aGUgZnVuY3Rpb24gdG8gdXNlIGFzIGEgZmlsdGVyXHJcbiAgICogQHJldHVybiB2b2lkXHJcbiAgICovXHJcbiAgX3JlbW92ZU5vZGVzOiBmdW5jdGlvbihub2RlTGlzdCwgZmlsdGVyRm4pIHtcclxuICAgIGZvciAodmFyIGkgPSBub2RlTGlzdC5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xyXG4gICAgICB2YXIgbm9kZSA9IG5vZGVMaXN0W2ldO1xyXG4gICAgICB2YXIgcGFyZW50Tm9kZSA9IG5vZGUucGFyZW50Tm9kZTtcclxuICAgICAgaWYgKHBhcmVudE5vZGUpIHtcclxuICAgICAgICBpZiAoIWZpbHRlckZuIHx8IGZpbHRlckZuLmNhbGwodGhpcywgbm9kZSwgaSwgbm9kZUxpc3QpKSB7XHJcbiAgICAgICAgICBwYXJlbnROb2RlLnJlbW92ZUNoaWxkKG5vZGUpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIEl0ZXJhdGVzIG92ZXIgYSBOb2RlTGlzdCwgYW5kIGNhbGxzIF9zZXROb2RlVGFnIGZvciBlYWNoIG5vZGUuXHJcbiAgICpcclxuICAgKiBAcGFyYW0gTm9kZUxpc3Qgbm9kZUxpc3QgVGhlIG5vZGVzIHRvIG9wZXJhdGUgb25cclxuICAgKiBAcGFyYW0gU3RyaW5nIG5ld1RhZ05hbWUgdGhlIG5ldyB0YWcgbmFtZSB0byB1c2VcclxuICAgKiBAcmV0dXJuIHZvaWRcclxuICAgKi9cclxuICBfcmVwbGFjZU5vZGVUYWdzOiBmdW5jdGlvbihub2RlTGlzdCwgbmV3VGFnTmFtZSkge1xyXG4gICAgZm9yICh2YXIgaSA9IG5vZGVMaXN0Lmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XHJcbiAgICAgIHZhciBub2RlID0gbm9kZUxpc3RbaV07XHJcbiAgICAgIHRoaXMuX3NldE5vZGVUYWcobm9kZSwgbmV3VGFnTmFtZSk7XHJcbiAgICB9XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogSXRlcmF0ZSBvdmVyIGEgTm9kZUxpc3QsIHdoaWNoIGRvZXNuJ3QgbmF0aXZlbHkgZnVsbHkgaW1wbGVtZW50IHRoZSBBcnJheVxyXG4gICAqIGludGVyZmFjZS5cclxuICAgKlxyXG4gICAqIEZvciBjb252ZW5pZW5jZSwgdGhlIGN1cnJlbnQgb2JqZWN0IGNvbnRleHQgaXMgYXBwbGllZCB0byB0aGUgcHJvdmlkZWRcclxuICAgKiBpdGVyYXRlIGZ1bmN0aW9uLlxyXG4gICAqXHJcbiAgICogQHBhcmFtICBOb2RlTGlzdCBub2RlTGlzdCBUaGUgTm9kZUxpc3QuXHJcbiAgICogQHBhcmFtICBGdW5jdGlvbiBmbiAgICAgICBUaGUgaXRlcmF0ZSBmdW5jdGlvbi5cclxuICAgKiBAcmV0dXJuIHZvaWRcclxuICAgKi9cclxuICBfZm9yRWFjaE5vZGU6IGZ1bmN0aW9uKG5vZGVMaXN0LCBmbikge1xyXG4gICAgQXJyYXkucHJvdG90eXBlLmZvckVhY2guY2FsbChub2RlTGlzdCwgZm4sIHRoaXMpO1xyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIEl0ZXJhdGUgb3ZlciBhIE5vZGVMaXN0LCByZXR1cm4gdHJ1ZSBpZiBhbnkgb2YgdGhlIHByb3ZpZGVkIGl0ZXJhdGVcclxuICAgKiBmdW5jdGlvbiBjYWxscyByZXR1cm5zIHRydWUsIGZhbHNlIG90aGVyd2lzZS5cclxuICAgKlxyXG4gICAqIEZvciBjb252ZW5pZW5jZSwgdGhlIGN1cnJlbnQgb2JqZWN0IGNvbnRleHQgaXMgYXBwbGllZCB0byB0aGVcclxuICAgKiBwcm92aWRlZCBpdGVyYXRlIGZ1bmN0aW9uLlxyXG4gICAqXHJcbiAgICogQHBhcmFtICBOb2RlTGlzdCBub2RlTGlzdCBUaGUgTm9kZUxpc3QuXHJcbiAgICogQHBhcmFtICBGdW5jdGlvbiBmbiAgICAgICBUaGUgaXRlcmF0ZSBmdW5jdGlvbi5cclxuICAgKiBAcmV0dXJuIEJvb2xlYW5cclxuICAgKi9cclxuICBfc29tZU5vZGU6IGZ1bmN0aW9uKG5vZGVMaXN0LCBmbikge1xyXG4gICAgcmV0dXJuIEFycmF5LnByb3RvdHlwZS5zb21lLmNhbGwobm9kZUxpc3QsIGZuLCB0aGlzKTtcclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBJdGVyYXRlIG92ZXIgYSBOb2RlTGlzdCwgcmV0dXJuIHRydWUgaWYgYWxsIG9mIHRoZSBwcm92aWRlZCBpdGVyYXRlXHJcbiAgICogZnVuY3Rpb24gY2FsbHMgcmV0dXJuIHRydWUsIGZhbHNlIG90aGVyd2lzZS5cclxuICAgKlxyXG4gICAqIEZvciBjb252ZW5pZW5jZSwgdGhlIGN1cnJlbnQgb2JqZWN0IGNvbnRleHQgaXMgYXBwbGllZCB0byB0aGVcclxuICAgKiBwcm92aWRlZCBpdGVyYXRlIGZ1bmN0aW9uLlxyXG4gICAqXHJcbiAgICogQHBhcmFtICBOb2RlTGlzdCBub2RlTGlzdCBUaGUgTm9kZUxpc3QuXHJcbiAgICogQHBhcmFtICBGdW5jdGlvbiBmbiAgICAgICBUaGUgaXRlcmF0ZSBmdW5jdGlvbi5cclxuICAgKiBAcmV0dXJuIEJvb2xlYW5cclxuICAgKi9cclxuICBfZXZlcnlOb2RlOiBmdW5jdGlvbihub2RlTGlzdCwgZm4pIHtcclxuICAgIHJldHVybiBBcnJheS5wcm90b3R5cGUuZXZlcnkuY2FsbChub2RlTGlzdCwgZm4sIHRoaXMpO1xyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIENvbmNhdCBhbGwgbm9kZWxpc3RzIHBhc3NlZCBhcyBhcmd1bWVudHMuXHJcbiAgICpcclxuICAgKiBAcmV0dXJuIC4uLk5vZGVMaXN0XHJcbiAgICogQHJldHVybiBBcnJheVxyXG4gICAqL1xyXG4gIF9jb25jYXROb2RlTGlzdHM6IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIHNsaWNlID0gQXJyYXkucHJvdG90eXBlLnNsaWNlO1xyXG4gICAgdmFyIGFyZ3MgPSBzbGljZS5jYWxsKGFyZ3VtZW50cyk7XHJcbiAgICB2YXIgbm9kZUxpc3RzID0gYXJncy5tYXAoZnVuY3Rpb24obGlzdCkge1xyXG4gICAgICByZXR1cm4gc2xpY2UuY2FsbChsaXN0KTtcclxuICAgIH0pO1xyXG4gICAgcmV0dXJuIEFycmF5LnByb3RvdHlwZS5jb25jYXQuYXBwbHkoW10sIG5vZGVMaXN0cyk7XHJcbiAgfSxcclxuXHJcbiAgX2dldEFsbE5vZGVzV2l0aFRhZzogZnVuY3Rpb24obm9kZSwgdGFnTmFtZXMpIHtcclxuICAgIGlmIChub2RlLnF1ZXJ5U2VsZWN0b3JBbGwpIHtcclxuICAgICAgcmV0dXJuIG5vZGUucXVlcnlTZWxlY3RvckFsbCh0YWdOYW1lcy5qb2luKFwiLFwiKSk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gW10uY29uY2F0LmFwcGx5KFtdLCB0YWdOYW1lcy5tYXAoZnVuY3Rpb24odGFnKSB7XHJcbiAgICAgIHZhciBjb2xsZWN0aW9uID0gbm9kZS5nZXRFbGVtZW50c0J5VGFnTmFtZSh0YWcpO1xyXG4gICAgICByZXR1cm4gQXJyYXkuaXNBcnJheShjb2xsZWN0aW9uKSA/IGNvbGxlY3Rpb24gOiBBcnJheS5mcm9tKGNvbGxlY3Rpb24pO1xyXG4gICAgfSkpO1xyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIFJlbW92ZXMgdGhlIGNsYXNzPVwiXCIgYXR0cmlidXRlIGZyb20gZXZlcnkgZWxlbWVudCBpbiB0aGUgZ2l2ZW5cclxuICAgKiBzdWJ0cmVlLCBleGNlcHQgdGhvc2UgdGhhdCBtYXRjaCBDTEFTU0VTX1RPX1BSRVNFUlZFIGFuZFxyXG4gICAqIHRoZSBjbGFzc2VzVG9QcmVzZXJ2ZSBhcnJheSBmcm9tIHRoZSBvcHRpb25zIG9iamVjdC5cclxuICAgKlxyXG4gICAqIEBwYXJhbSBFbGVtZW50XHJcbiAgICogQHJldHVybiB2b2lkXHJcbiAgICovXHJcbiAgX2NsZWFuQ2xhc3NlczogZnVuY3Rpb24obm9kZSkge1xyXG4gICAgdmFyIGNsYXNzZXNUb1ByZXNlcnZlID0gdGhpcy5fY2xhc3Nlc1RvUHJlc2VydmU7XHJcbiAgICB2YXIgY2xhc3NOYW1lID0gKG5vZGUuZ2V0QXR0cmlidXRlKFwiY2xhc3NcIikgfHwgXCJcIilcclxuICAgICAgLnNwbGl0KC9cXHMrLylcclxuICAgICAgLmZpbHRlcihmdW5jdGlvbihjbHMpIHtcclxuICAgICAgICByZXR1cm4gY2xhc3Nlc1RvUHJlc2VydmUuaW5kZXhPZihjbHMpICE9IC0xO1xyXG4gICAgICB9KVxyXG4gICAgICAuam9pbihcIiBcIik7XHJcblxyXG4gICAgaWYgKGNsYXNzTmFtZSkge1xyXG4gICAgICBub2RlLnNldEF0dHJpYnV0ZShcImNsYXNzXCIsIGNsYXNzTmFtZSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBub2RlLnJlbW92ZUF0dHJpYnV0ZShcImNsYXNzXCIpO1xyXG4gICAgfVxyXG5cclxuICAgIGZvciAobm9kZSA9IG5vZGUuZmlyc3RFbGVtZW50Q2hpbGQ7IG5vZGU7IG5vZGUgPSBub2RlLm5leHRFbGVtZW50U2libGluZykge1xyXG4gICAgICB0aGlzLl9jbGVhbkNsYXNzZXMobm9kZSk7XHJcbiAgICB9XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogQ29udmVydHMgZWFjaCA8YT4gYW5kIDxpbWc+IHVyaSBpbiB0aGUgZ2l2ZW4gZWxlbWVudCB0byBhbiBhYnNvbHV0ZSBVUkksXHJcbiAgICogaWdub3JpbmcgI3JlZiBVUklzLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIEVsZW1lbnRcclxuICAgKiBAcmV0dXJuIHZvaWRcclxuICAgKi9cclxuICBfZml4UmVsYXRpdmVVcmlzOiBmdW5jdGlvbihhcnRpY2xlQ29udGVudCkge1xyXG4gICAgdmFyIGJhc2VVUkkgPSB0aGlzLl9kb2MuYmFzZVVSSTtcclxuICAgIHZhciBkb2N1bWVudFVSSSA9IHRoaXMuX2RvYy5kb2N1bWVudFVSSTtcclxuICAgIGZ1bmN0aW9uIHRvQWJzb2x1dGVVUkkodXJpKSB7XHJcbiAgICAgIC8vIExlYXZlIGhhc2ggbGlua3MgYWxvbmUgaWYgdGhlIGJhc2UgVVJJIG1hdGNoZXMgdGhlIGRvY3VtZW50IFVSSTpcclxuICAgICAgaWYgKGJhc2VVUkkgPT0gZG9jdW1lbnRVUkkgJiYgdXJpLmNoYXJBdCgwKSA9PSBcIiNcIikge1xyXG4gICAgICAgIHJldHVybiB1cmk7XHJcbiAgICAgIH1cclxuICAgICAgLy8gT3RoZXJ3aXNlLCByZXNvbHZlIGFnYWluc3QgYmFzZSBVUkk6XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBVUkwodXJpLCBiYXNlVVJJKS5ocmVmO1xyXG4gICAgICB9IGNhdGNoIChleCkge1xyXG4gICAgICAgIC8vIFNvbWV0aGluZyB3ZW50IHdyb25nLCBqdXN0IHJldHVybiB0aGUgb3JpZ2luYWw6XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIHVyaTtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgbGlua3MgPSBhcnRpY2xlQ29udGVudC5nZXRFbGVtZW50c0J5VGFnTmFtZShcImFcIik7XHJcbiAgICB0aGlzLl9mb3JFYWNoTm9kZShsaW5rcywgZnVuY3Rpb24obGluaykge1xyXG4gICAgICB2YXIgaHJlZiA9IGxpbmsuZ2V0QXR0cmlidXRlKFwiaHJlZlwiKTtcclxuICAgICAgaWYgKGhyZWYpIHtcclxuICAgICAgICAvLyBSZXBsYWNlIGxpbmtzIHdpdGggamF2YXNjcmlwdDogVVJJcyB3aXRoIHRleHQgY29udGVudCwgc2luY2VcclxuICAgICAgICAvLyB0aGV5IHdvbid0IHdvcmsgYWZ0ZXIgc2NyaXB0cyBoYXZlIGJlZW4gcmVtb3ZlZCBmcm9tIHRoZSBwYWdlLlxyXG4gICAgICAgIGlmIChocmVmLmluZGV4T2YoXCJqYXZhc2NyaXB0OlwiKSA9PT0gMCkge1xyXG4gICAgICAgICAgdmFyIHRleHQgPSB0aGlzLl9kb2MuY3JlYXRlVGV4dE5vZGUobGluay50ZXh0Q29udGVudCk7XHJcbiAgICAgICAgICBsaW5rLnBhcmVudE5vZGUucmVwbGFjZUNoaWxkKHRleHQsIGxpbmspO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBsaW5rLnNldEF0dHJpYnV0ZShcImhyZWZcIiwgdG9BYnNvbHV0ZVVSSShocmVmKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICB2YXIgaW1ncyA9IGFydGljbGVDb250ZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKFwiaW1nXCIpO1xyXG4gICAgdGhpcy5fZm9yRWFjaE5vZGUoaW1ncywgZnVuY3Rpb24oaW1nKSB7XHJcbiAgICAgIHZhciBzcmMgPSBpbWcuZ2V0QXR0cmlidXRlKFwic3JjXCIpO1xyXG4gICAgICBpZiAoc3JjKSB7XHJcbiAgICAgICAgaW1nLnNldEF0dHJpYnV0ZShcInNyY1wiLCB0b0Fic29sdXRlVVJJKHNyYykpO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBHZXQgdGhlIGFydGljbGUgdGl0bGUgYXMgYW4gSDEuXHJcbiAgICpcclxuICAgKiBAcmV0dXJuIHZvaWRcclxuICAgKiovXHJcbiAgX2dldEFydGljbGVUaXRsZTogZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgZG9jID0gdGhpcy5fZG9jO1xyXG4gICAgdmFyIGN1clRpdGxlID0gXCJcIjtcclxuICAgIHZhciBvcmlnVGl0bGUgPSBcIlwiO1xyXG5cclxuICAgIHRyeSB7XHJcbiAgICAgIGN1clRpdGxlID0gb3JpZ1RpdGxlID0gZG9jLnRpdGxlLnRyaW0oKTtcclxuXHJcbiAgICAgIC8vIElmIHRoZXkgaGFkIGFuIGVsZW1lbnQgd2l0aCBpZCBcInRpdGxlXCIgaW4gdGhlaXIgSFRNTFxyXG4gICAgICBpZiAodHlwZW9mIGN1clRpdGxlICE9PSBcInN0cmluZ1wiKVxyXG4gICAgICAgIGN1clRpdGxlID0gb3JpZ1RpdGxlID0gdGhpcy5fZ2V0SW5uZXJUZXh0KGRvYy5nZXRFbGVtZW50c0J5VGFnTmFtZShcInRpdGxlXCIpWzBdKTtcclxuICAgIH0gY2F0Y2ggKGUpIHsvKiBpZ25vcmUgZXhjZXB0aW9ucyBzZXR0aW5nIHRoZSB0aXRsZS4gKi99XHJcblxyXG4gICAgdmFyIHRpdGxlSGFkSGllcmFyY2hpY2FsU2VwYXJhdG9ycyA9IGZhbHNlO1xyXG4gICAgZnVuY3Rpb24gd29yZENvdW50KHN0cikge1xyXG4gICAgICByZXR1cm4gc3RyLnNwbGl0KC9cXHMrLykubGVuZ3RoO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIElmIHRoZXJlJ3MgYSBzZXBhcmF0b3IgaW4gdGhlIHRpdGxlLCBmaXJzdCByZW1vdmUgdGhlIGZpbmFsIHBhcnRcclxuICAgIGlmICgoLyBbXFx8XFwtXFxcXFxcLz7Cu10gLykudGVzdChjdXJUaXRsZSkpIHtcclxuICAgICAgdGl0bGVIYWRIaWVyYXJjaGljYWxTZXBhcmF0b3JzID0gLyBbXFxcXFxcLz7Cu10gLy50ZXN0KGN1clRpdGxlKTtcclxuICAgICAgY3VyVGl0bGUgPSBvcmlnVGl0bGUucmVwbGFjZSgvKC4qKVtcXHxcXC1cXFxcXFwvPsK7XSAuKi9naSwgXCIkMVwiKTtcclxuXHJcbiAgICAgIC8vIElmIHRoZSByZXN1bHRpbmcgdGl0bGUgaXMgdG9vIHNob3J0ICgzIHdvcmRzIG9yIGZld2VyKSwgcmVtb3ZlXHJcbiAgICAgIC8vIHRoZSBmaXJzdCBwYXJ0IGluc3RlYWQ6XHJcbiAgICAgIGlmICh3b3JkQ291bnQoY3VyVGl0bGUpIDwgMylcclxuICAgICAgICBjdXJUaXRsZSA9IG9yaWdUaXRsZS5yZXBsYWNlKC9bXlxcfFxcLVxcXFxcXC8+wrtdKltcXHxcXC1cXFxcXFwvPsK7XSguKikvZ2ksIFwiJDFcIik7XHJcbiAgICB9IGVsc2UgaWYgKGN1clRpdGxlLmluZGV4T2YoXCI6IFwiKSAhPT0gLTEpIHtcclxuICAgICAgLy8gQ2hlY2sgaWYgd2UgaGF2ZSBhbiBoZWFkaW5nIGNvbnRhaW5pbmcgdGhpcyBleGFjdCBzdHJpbmcsIHNvIHdlXHJcbiAgICAgIC8vIGNvdWxkIGFzc3VtZSBpdCdzIHRoZSBmdWxsIHRpdGxlLlxyXG4gICAgICB2YXIgaGVhZGluZ3MgPSB0aGlzLl9jb25jYXROb2RlTGlzdHMoXHJcbiAgICAgICAgZG9jLmdldEVsZW1lbnRzQnlUYWdOYW1lKFwiaDFcIiksXHJcbiAgICAgICAgZG9jLmdldEVsZW1lbnRzQnlUYWdOYW1lKFwiaDJcIilcclxuICAgICAgKTtcclxuICAgICAgdmFyIHRyaW1tZWRUaXRsZSA9IGN1clRpdGxlLnRyaW0oKTtcclxuICAgICAgdmFyIG1hdGNoID0gdGhpcy5fc29tZU5vZGUoaGVhZGluZ3MsIGZ1bmN0aW9uKGhlYWRpbmcpIHtcclxuICAgICAgICByZXR1cm4gaGVhZGluZy50ZXh0Q29udGVudC50cmltKCkgPT09IHRyaW1tZWRUaXRsZTtcclxuICAgICAgfSk7XHJcblxyXG4gICAgICAvLyBJZiB3ZSBkb24ndCwgbGV0J3MgZXh0cmFjdCB0aGUgdGl0bGUgb3V0IG9mIHRoZSBvcmlnaW5hbCB0aXRsZSBzdHJpbmcuXHJcbiAgICAgIGlmICghbWF0Y2gpIHtcclxuICAgICAgICBjdXJUaXRsZSA9IG9yaWdUaXRsZS5zdWJzdHJpbmcob3JpZ1RpdGxlLmxhc3RJbmRleE9mKFwiOlwiKSArIDEpO1xyXG5cclxuICAgICAgICAvLyBJZiB0aGUgdGl0bGUgaXMgbm93IHRvbyBzaG9ydCwgdHJ5IHRoZSBmaXJzdCBjb2xvbiBpbnN0ZWFkOlxyXG4gICAgICAgIGlmICh3b3JkQ291bnQoY3VyVGl0bGUpIDwgMykge1xyXG4gICAgICAgICAgY3VyVGl0bGUgPSBvcmlnVGl0bGUuc3Vic3RyaW5nKG9yaWdUaXRsZS5pbmRleE9mKFwiOlwiKSArIDEpO1xyXG4gICAgICAgICAgLy8gQnV0IGlmIHdlIGhhdmUgdG9vIG1hbnkgd29yZHMgYmVmb3JlIHRoZSBjb2xvbiB0aGVyZSdzIHNvbWV0aGluZyB3ZWlyZFxyXG4gICAgICAgICAgLy8gd2l0aCB0aGUgdGl0bGVzIGFuZCB0aGUgSCB0YWdzIHNvIGxldCdzIGp1c3QgdXNlIHRoZSBvcmlnaW5hbCB0aXRsZSBpbnN0ZWFkXHJcbiAgICAgICAgfSBlbHNlIGlmICh3b3JkQ291bnQob3JpZ1RpdGxlLnN1YnN0cigwLCBvcmlnVGl0bGUuaW5kZXhPZihcIjpcIikpKSA+IDUpIHtcclxuICAgICAgICAgIGN1clRpdGxlID0gb3JpZ1RpdGxlO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSBlbHNlIGlmIChjdXJUaXRsZS5sZW5ndGggPiAxNTAgfHwgY3VyVGl0bGUubGVuZ3RoIDwgMTUpIHtcclxuICAgICAgdmFyIGhPbmVzID0gZG9jLmdldEVsZW1lbnRzQnlUYWdOYW1lKFwiaDFcIik7XHJcblxyXG4gICAgICBpZiAoaE9uZXMubGVuZ3RoID09PSAxKVxyXG4gICAgICAgIGN1clRpdGxlID0gdGhpcy5fZ2V0SW5uZXJUZXh0KGhPbmVzWzBdKTtcclxuICAgIH1cclxuXHJcbiAgICBjdXJUaXRsZSA9IGN1clRpdGxlLnRyaW0oKTtcclxuICAgIC8vIElmIHdlIG5vdyBoYXZlIDQgd29yZHMgb3IgZmV3ZXIgYXMgb3VyIHRpdGxlLCBhbmQgZWl0aGVyIG5vXHJcbiAgICAvLyAnaGllcmFyY2hpY2FsJyBzZXBhcmF0b3JzIChcXCwgLywgPiBvciDCuykgd2VyZSBmb3VuZCBpbiB0aGUgb3JpZ2luYWxcclxuICAgIC8vIHRpdGxlIG9yIHdlIGRlY3JlYXNlZCB0aGUgbnVtYmVyIG9mIHdvcmRzIGJ5IG1vcmUgdGhhbiAxIHdvcmQsIHVzZVxyXG4gICAgLy8gdGhlIG9yaWdpbmFsIHRpdGxlLlxyXG4gICAgdmFyIGN1clRpdGxlV29yZENvdW50ID0gd29yZENvdW50KGN1clRpdGxlKTtcclxuICAgIGlmIChjdXJUaXRsZVdvcmRDb3VudCA8PSA0ICYmXHJcbiAgICAgICAgKCF0aXRsZUhhZEhpZXJhcmNoaWNhbFNlcGFyYXRvcnMgfHxcclxuICAgICAgICAgY3VyVGl0bGVXb3JkQ291bnQgIT0gd29yZENvdW50KG9yaWdUaXRsZS5yZXBsYWNlKC9bXFx8XFwtXFxcXFxcLz7Cu10rL2csIFwiXCIpKSAtIDEpKSB7XHJcbiAgICAgIGN1clRpdGxlID0gb3JpZ1RpdGxlO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBjdXJUaXRsZTtcclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBQcmVwYXJlIHRoZSBIVE1MIGRvY3VtZW50IGZvciByZWFkYWJpbGl0eSB0byBzY3JhcGUgaXQuXHJcbiAgICogVGhpcyBpbmNsdWRlcyB0aGluZ3MgbGlrZSBzdHJpcHBpbmcgamF2YXNjcmlwdCwgQ1NTLCBhbmQgaGFuZGxpbmcgdGVycmlibGUgbWFya3VwLlxyXG4gICAqXHJcbiAgICogQHJldHVybiB2b2lkXHJcbiAgICoqL1xyXG4gIF9wcmVwRG9jdW1lbnQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIGRvYyA9IHRoaXMuX2RvYztcclxuXHJcbiAgICAvLyBSZW1vdmUgYWxsIHN0eWxlIHRhZ3MgaW4gaGVhZFxyXG4gICAgdGhpcy5fcmVtb3ZlTm9kZXMoZG9jLmdldEVsZW1lbnRzQnlUYWdOYW1lKFwic3R5bGVcIikpO1xyXG5cclxuICAgIGlmIChkb2MuYm9keSkge1xyXG4gICAgICB0aGlzLl9yZXBsYWNlQnJzKGRvYy5ib2R5KTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLl9yZXBsYWNlTm9kZVRhZ3MoZG9jLmdldEVsZW1lbnRzQnlUYWdOYW1lKFwiZm9udFwiKSwgXCJTUEFOXCIpO1xyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIEZpbmRzIHRoZSBuZXh0IGVsZW1lbnQsIHN0YXJ0aW5nIGZyb20gdGhlIGdpdmVuIG5vZGUsIGFuZCBpZ25vcmluZ1xyXG4gICAqIHdoaXRlc3BhY2UgaW4gYmV0d2Vlbi4gSWYgdGhlIGdpdmVuIG5vZGUgaXMgYW4gZWxlbWVudCwgdGhlIHNhbWUgbm9kZSBpc1xyXG4gICAqIHJldHVybmVkLlxyXG4gICAqL1xyXG4gIF9uZXh0RWxlbWVudDogZnVuY3Rpb24gKG5vZGUpIHtcclxuICAgIHZhciBuZXh0ID0gbm9kZTtcclxuICAgIHdoaWxlIChuZXh0XHJcbiAgICAgICAgJiYgKG5leHQubm9kZVR5cGUgIT0gdGhpcy5FTEVNRU5UX05PREUpXHJcbiAgICAgICAgJiYgdGhpcy5SRUdFWFBTLndoaXRlc3BhY2UudGVzdChuZXh0LnRleHRDb250ZW50KSkge1xyXG4gICAgICBuZXh0ID0gbmV4dC5uZXh0U2libGluZztcclxuICAgIH1cclxuICAgIHJldHVybiBuZXh0O1xyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIFJlcGxhY2VzIDIgb3IgbW9yZSBzdWNjZXNzaXZlIDxicj4gZWxlbWVudHMgd2l0aCBhIHNpbmdsZSA8cD4uXHJcbiAgICogV2hpdGVzcGFjZSBiZXR3ZWVuIDxicj4gZWxlbWVudHMgYXJlIGlnbm9yZWQuIEZvciBleGFtcGxlOlxyXG4gICAqICAgPGRpdj5mb288YnI+YmFyPGJyPiA8YnI+PGJyPmFiYzwvZGl2PlxyXG4gICAqIHdpbGwgYmVjb21lOlxyXG4gICAqICAgPGRpdj5mb288YnI+YmFyPHA+YWJjPC9wPjwvZGl2PlxyXG4gICAqL1xyXG4gIF9yZXBsYWNlQnJzOiBmdW5jdGlvbiAoZWxlbSkge1xyXG4gICAgdGhpcy5fZm9yRWFjaE5vZGUodGhpcy5fZ2V0QWxsTm9kZXNXaXRoVGFnKGVsZW0sIFtcImJyXCJdKSwgZnVuY3Rpb24oYnIpIHtcclxuICAgICAgdmFyIG5leHQgPSBici5uZXh0U2libGluZztcclxuXHJcbiAgICAgIC8vIFdoZXRoZXIgMiBvciBtb3JlIDxicj4gZWxlbWVudHMgaGF2ZSBiZWVuIGZvdW5kIGFuZCByZXBsYWNlZCB3aXRoIGFcclxuICAgICAgLy8gPHA+IGJsb2NrLlxyXG4gICAgICB2YXIgcmVwbGFjZWQgPSBmYWxzZTtcclxuXHJcbiAgICAgIC8vIElmIHdlIGZpbmQgYSA8YnI+IGNoYWluLCByZW1vdmUgdGhlIDxicj5zIHVudGlsIHdlIGhpdCBhbm90aGVyIGVsZW1lbnRcclxuICAgICAgLy8gb3Igbm9uLXdoaXRlc3BhY2UuIFRoaXMgbGVhdmVzIGJlaGluZCB0aGUgZmlyc3QgPGJyPiBpbiB0aGUgY2hhaW5cclxuICAgICAgLy8gKHdoaWNoIHdpbGwgYmUgcmVwbGFjZWQgd2l0aCBhIDxwPiBsYXRlcikuXHJcbiAgICAgIHdoaWxlICgobmV4dCA9IHRoaXMuX25leHRFbGVtZW50KG5leHQpKSAmJiAobmV4dC50YWdOYW1lID09IFwiQlJcIikpIHtcclxuICAgICAgICByZXBsYWNlZCA9IHRydWU7XHJcbiAgICAgICAgdmFyIGJyU2libGluZyA9IG5leHQubmV4dFNpYmxpbmc7XHJcbiAgICAgICAgbmV4dC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKG5leHQpO1xyXG4gICAgICAgIG5leHQgPSBiclNpYmxpbmc7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIElmIHdlIHJlbW92ZWQgYSA8YnI+IGNoYWluLCByZXBsYWNlIHRoZSByZW1haW5pbmcgPGJyPiB3aXRoIGEgPHA+LiBBZGRcclxuICAgICAgLy8gYWxsIHNpYmxpbmcgbm9kZXMgYXMgY2hpbGRyZW4gb2YgdGhlIDxwPiB1bnRpbCB3ZSBoaXQgYW5vdGhlciA8YnI+XHJcbiAgICAgIC8vIGNoYWluLlxyXG4gICAgICBpZiAocmVwbGFjZWQpIHtcclxuICAgICAgICB2YXIgcCA9IHRoaXMuX2RvYy5jcmVhdGVFbGVtZW50KFwicFwiKTtcclxuICAgICAgICBici5wYXJlbnROb2RlLnJlcGxhY2VDaGlsZChwLCBicik7XHJcblxyXG4gICAgICAgIG5leHQgPSBwLm5leHRTaWJsaW5nO1xyXG4gICAgICAgIHdoaWxlIChuZXh0KSB7XHJcbiAgICAgICAgICAvLyBJZiB3ZSd2ZSBoaXQgYW5vdGhlciA8YnI+PGJyPiwgd2UncmUgZG9uZSBhZGRpbmcgY2hpbGRyZW4gdG8gdGhpcyA8cD4uXHJcbiAgICAgICAgICBpZiAobmV4dC50YWdOYW1lID09IFwiQlJcIikge1xyXG4gICAgICAgICAgICB2YXIgbmV4dEVsZW0gPSB0aGlzLl9uZXh0RWxlbWVudChuZXh0Lm5leHRTaWJsaW5nKTtcclxuICAgICAgICAgICAgaWYgKG5leHRFbGVtICYmIG5leHRFbGVtLnRhZ05hbWUgPT0gXCJCUlwiKVxyXG4gICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIGlmICghdGhpcy5faXNQaHJhc2luZ0NvbnRlbnQobmV4dCkpXHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICAgIC8vIE90aGVyd2lzZSwgbWFrZSB0aGlzIG5vZGUgYSBjaGlsZCBvZiB0aGUgbmV3IDxwPi5cclxuICAgICAgICAgIHZhciBzaWJsaW5nID0gbmV4dC5uZXh0U2libGluZztcclxuICAgICAgICAgIHAuYXBwZW5kQ2hpbGQobmV4dCk7XHJcbiAgICAgICAgICBuZXh0ID0gc2libGluZztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHdoaWxlIChwLmxhc3RDaGlsZCAmJiB0aGlzLl9pc1doaXRlc3BhY2UocC5sYXN0Q2hpbGQpKSB7XHJcbiAgICAgICAgICBwLnJlbW92ZUNoaWxkKHAubGFzdENoaWxkKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChwLnBhcmVudE5vZGUudGFnTmFtZSA9PT0gXCJQXCIpXHJcbiAgICAgICAgICB0aGlzLl9zZXROb2RlVGFnKHAucGFyZW50Tm9kZSwgXCJESVZcIik7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gIH0sXHJcblxyXG4gIF9zZXROb2RlVGFnOiBmdW5jdGlvbiAobm9kZSwgdGFnKSB7XHJcbiAgICB0aGlzLmxvZyhcIl9zZXROb2RlVGFnXCIsIG5vZGUsIHRhZyk7XHJcbiAgICBpZiAobm9kZS5fX0pTRE9NUGFyc2VyX18pIHtcclxuICAgICAgbm9kZS5sb2NhbE5hbWUgPSB0YWcudG9Mb3dlckNhc2UoKTtcclxuICAgICAgbm9kZS50YWdOYW1lID0gdGFnLnRvVXBwZXJDYXNlKCk7XHJcbiAgICAgIHJldHVybiBub2RlO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciByZXBsYWNlbWVudCA9IG5vZGUub3duZXJEb2N1bWVudC5jcmVhdGVFbGVtZW50KHRhZyk7XHJcbiAgICB3aGlsZSAobm9kZS5maXJzdENoaWxkKSB7XHJcbiAgICAgIHJlcGxhY2VtZW50LmFwcGVuZENoaWxkKG5vZGUuZmlyc3RDaGlsZCk7XHJcbiAgICB9XHJcbiAgICBub2RlLnBhcmVudE5vZGUucmVwbGFjZUNoaWxkKHJlcGxhY2VtZW50LCBub2RlKTtcclxuICAgIGlmIChub2RlLnJlYWRhYmlsaXR5KVxyXG4gICAgICByZXBsYWNlbWVudC5yZWFkYWJpbGl0eSA9IG5vZGUucmVhZGFiaWxpdHk7XHJcblxyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBub2RlLmF0dHJpYnV0ZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgcmVwbGFjZW1lbnQuc2V0QXR0cmlidXRlKG5vZGUuYXR0cmlidXRlc1tpXS5uYW1lLCBub2RlLmF0dHJpYnV0ZXNbaV0udmFsdWUpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHJlcGxhY2VtZW50O1xyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIFByZXBhcmUgdGhlIGFydGljbGUgbm9kZSBmb3IgZGlzcGxheS4gQ2xlYW4gb3V0IGFueSBpbmxpbmUgc3R5bGVzLFxyXG4gICAqIGlmcmFtZXMsIGZvcm1zLCBzdHJpcCBleHRyYW5lb3VzIDxwPiB0YWdzLCBldGMuXHJcbiAgICpcclxuICAgKiBAcGFyYW0gRWxlbWVudFxyXG4gICAqIEByZXR1cm4gdm9pZFxyXG4gICAqKi9cclxuICBfcHJlcEFydGljbGU6IGZ1bmN0aW9uKGFydGljbGVDb250ZW50KSB7XHJcbiAgICB0aGlzLl9jbGVhblN0eWxlcyhhcnRpY2xlQ29udGVudCk7XHJcblxyXG4gICAgLy8gQ2hlY2sgZm9yIGRhdGEgdGFibGVzIGJlZm9yZSB3ZSBjb250aW51ZSwgdG8gYXZvaWQgcmVtb3ZpbmcgaXRlbXMgaW5cclxuICAgIC8vIHRob3NlIHRhYmxlcywgd2hpY2ggd2lsbCBvZnRlbiBiZSBpc29sYXRlZCBldmVuIHRob3VnaCB0aGV5J3JlXHJcbiAgICAvLyB2aXN1YWxseSBsaW5rZWQgdG8gb3RoZXIgY29udGVudC1mdWwgZWxlbWVudHMgKHRleHQsIGltYWdlcywgZXRjLikuXHJcbiAgICB0aGlzLl9tYXJrRGF0YVRhYmxlcyhhcnRpY2xlQ29udGVudCk7XHJcblxyXG4gICAgLy8gQ2xlYW4gb3V0IGp1bmsgZnJvbSB0aGUgYXJ0aWNsZSBjb250ZW50XHJcbiAgICB0aGlzLl9jbGVhbkNvbmRpdGlvbmFsbHkoYXJ0aWNsZUNvbnRlbnQsIFwiZm9ybVwiKTtcclxuICAgIHRoaXMuX2NsZWFuQ29uZGl0aW9uYWxseShhcnRpY2xlQ29udGVudCwgXCJmaWVsZHNldFwiKTtcclxuICAgIHRoaXMuX2NsZWFuKGFydGljbGVDb250ZW50LCBcIm9iamVjdFwiKTtcclxuICAgIHRoaXMuX2NsZWFuKGFydGljbGVDb250ZW50LCBcImVtYmVkXCIpO1xyXG4gICAgdGhpcy5fY2xlYW4oYXJ0aWNsZUNvbnRlbnQsIFwiaDFcIik7XHJcbiAgICB0aGlzLl9jbGVhbihhcnRpY2xlQ29udGVudCwgXCJmb290ZXJcIik7XHJcbiAgICB0aGlzLl9jbGVhbihhcnRpY2xlQ29udGVudCwgXCJsaW5rXCIpO1xyXG4gICAgdGhpcy5fY2xlYW4oYXJ0aWNsZUNvbnRlbnQsIFwiYXNpZGVcIik7XHJcblxyXG4gICAgLy8gQ2xlYW4gb3V0IGVsZW1lbnRzIGhhdmUgXCJzaGFyZVwiIGluIHRoZWlyIGlkL2NsYXNzIGNvbWJpbmF0aW9ucyBmcm9tIGZpbmFsIHRvcCBjYW5kaWRhdGVzLFxyXG4gICAgLy8gd2hpY2ggbWVhbnMgd2UgZG9uJ3QgcmVtb3ZlIHRoZSB0b3AgY2FuZGlkYXRlcyBldmVuIHRoZXkgaGF2ZSBcInNoYXJlXCIuXHJcbiAgICB0aGlzLl9mb3JFYWNoTm9kZShhcnRpY2xlQ29udGVudC5jaGlsZHJlbiwgZnVuY3Rpb24odG9wQ2FuZGlkYXRlKSB7XHJcbiAgICAgIHRoaXMuX2NsZWFuTWF0Y2hlZE5vZGVzKHRvcENhbmRpZGF0ZSwgL3NoYXJlLyk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBJZiB0aGVyZSBpcyBvbmx5IG9uZSBoMiBhbmQgaXRzIHRleHQgY29udGVudCBzdWJzdGFudGlhbGx5IGVxdWFscyBhcnRpY2xlIHRpdGxlLFxyXG4gICAgLy8gdGhleSBhcmUgcHJvYmFibHkgdXNpbmcgaXQgYXMgYSBoZWFkZXIgYW5kIG5vdCBhIHN1YmhlYWRlcixcclxuICAgIC8vIHNvIHJlbW92ZSBpdCBzaW5jZSB3ZSBhbHJlYWR5IGV4dHJhY3QgdGhlIHRpdGxlIHNlcGFyYXRlbHkuXHJcbiAgICB2YXIgaDIgPSBhcnRpY2xlQ29udGVudC5nZXRFbGVtZW50c0J5VGFnTmFtZShcImgyXCIpO1xyXG4gICAgaWYgKGgyLmxlbmd0aCA9PT0gMSkge1xyXG4gICAgICB2YXIgbGVuZ3RoU2ltaWxhclJhdGUgPSAoaDJbMF0udGV4dENvbnRlbnQubGVuZ3RoIC0gdGhpcy5fYXJ0aWNsZVRpdGxlLmxlbmd0aCkgLyB0aGlzLl9hcnRpY2xlVGl0bGUubGVuZ3RoO1xyXG4gICAgICBpZiAoTWF0aC5hYnMobGVuZ3RoU2ltaWxhclJhdGUpIDwgMC41KSB7XHJcbiAgICAgICAgdmFyIHRpdGxlc01hdGNoID0gZmFsc2U7XHJcbiAgICAgICAgaWYgKGxlbmd0aFNpbWlsYXJSYXRlID4gMCkge1xyXG4gICAgICAgICAgdGl0bGVzTWF0Y2ggPSBoMlswXS50ZXh0Q29udGVudC5pbmNsdWRlcyh0aGlzLl9hcnRpY2xlVGl0bGUpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICB0aXRsZXNNYXRjaCA9IHRoaXMuX2FydGljbGVUaXRsZS5pbmNsdWRlcyhoMlswXS50ZXh0Q29udGVudCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aXRsZXNNYXRjaCkge1xyXG4gICAgICAgICAgdGhpcy5fY2xlYW4oYXJ0aWNsZUNvbnRlbnQsIFwiaDJcIik7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5fY2xlYW4oYXJ0aWNsZUNvbnRlbnQsIFwiaWZyYW1lXCIpO1xyXG4gICAgdGhpcy5fY2xlYW4oYXJ0aWNsZUNvbnRlbnQsIFwiaW5wdXRcIik7XHJcbiAgICB0aGlzLl9jbGVhbihhcnRpY2xlQ29udGVudCwgXCJ0ZXh0YXJlYVwiKTtcclxuICAgIHRoaXMuX2NsZWFuKGFydGljbGVDb250ZW50LCBcInNlbGVjdFwiKTtcclxuICAgIHRoaXMuX2NsZWFuKGFydGljbGVDb250ZW50LCBcImJ1dHRvblwiKTtcclxuICAgIHRoaXMuX2NsZWFuSGVhZGVycyhhcnRpY2xlQ29udGVudCk7XHJcblxyXG4gICAgLy8gRG8gdGhlc2UgbGFzdCBhcyB0aGUgcHJldmlvdXMgc3R1ZmYgbWF5IGhhdmUgcmVtb3ZlZCBqdW5rXHJcbiAgICAvLyB0aGF0IHdpbGwgYWZmZWN0IHRoZXNlXHJcbiAgICB0aGlzLl9jbGVhbkNvbmRpdGlvbmFsbHkoYXJ0aWNsZUNvbnRlbnQsIFwidGFibGVcIik7XHJcbiAgICB0aGlzLl9jbGVhbkNvbmRpdGlvbmFsbHkoYXJ0aWNsZUNvbnRlbnQsIFwidWxcIik7XHJcbiAgICB0aGlzLl9jbGVhbkNvbmRpdGlvbmFsbHkoYXJ0aWNsZUNvbnRlbnQsIFwiZGl2XCIpO1xyXG5cclxuICAgIC8vIFJlbW92ZSBleHRyYSBwYXJhZ3JhcGhzXHJcbiAgICB0aGlzLl9yZW1vdmVOb2RlcyhhcnRpY2xlQ29udGVudC5nZXRFbGVtZW50c0J5VGFnTmFtZShcInBcIiksIGZ1bmN0aW9uIChwYXJhZ3JhcGgpIHtcclxuICAgICAgdmFyIGltZ0NvdW50ID0gcGFyYWdyYXBoLmdldEVsZW1lbnRzQnlUYWdOYW1lKFwiaW1nXCIpLmxlbmd0aDtcclxuICAgICAgdmFyIGVtYmVkQ291bnQgPSBwYXJhZ3JhcGguZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJlbWJlZFwiKS5sZW5ndGg7XHJcbiAgICAgIHZhciBvYmplY3RDb3VudCA9IHBhcmFncmFwaC5nZXRFbGVtZW50c0J5VGFnTmFtZShcIm9iamVjdFwiKS5sZW5ndGg7XHJcbiAgICAgIC8vIEF0IHRoaXMgcG9pbnQsIG5hc3R5IGlmcmFtZXMgaGF2ZSBiZWVuIHJlbW92ZWQsIG9ubHkgcmVtYWluIGVtYmVkZGVkIHZpZGVvIG9uZXMuXHJcbiAgICAgIHZhciBpZnJhbWVDb3VudCA9IHBhcmFncmFwaC5nZXRFbGVtZW50c0J5VGFnTmFtZShcImlmcmFtZVwiKS5sZW5ndGg7XHJcbiAgICAgIHZhciB0b3RhbENvdW50ID0gaW1nQ291bnQgKyBlbWJlZENvdW50ICsgb2JqZWN0Q291bnQgKyBpZnJhbWVDb3VudDtcclxuXHJcbiAgICAgIHJldHVybiB0b3RhbENvdW50ID09PSAwICYmICF0aGlzLl9nZXRJbm5lclRleHQocGFyYWdyYXBoLCBmYWxzZSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICB0aGlzLl9mb3JFYWNoTm9kZSh0aGlzLl9nZXRBbGxOb2Rlc1dpdGhUYWcoYXJ0aWNsZUNvbnRlbnQsIFtcImJyXCJdKSwgZnVuY3Rpb24oYnIpIHtcclxuICAgICAgdmFyIG5leHQgPSB0aGlzLl9uZXh0RWxlbWVudChici5uZXh0U2libGluZyk7XHJcbiAgICAgIGlmIChuZXh0ICYmIG5leHQudGFnTmFtZSA9PSBcIlBcIilcclxuICAgICAgICBici5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKGJyKTtcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIFJlbW92ZSBzaW5nbGUtY2VsbCB0YWJsZXNcclxuICAgIHRoaXMuX2ZvckVhY2hOb2RlKHRoaXMuX2dldEFsbE5vZGVzV2l0aFRhZyhhcnRpY2xlQ29udGVudCwgW1widGFibGVcIl0pLCBmdW5jdGlvbih0YWJsZSkge1xyXG4gICAgICB2YXIgdGJvZHkgPSB0aGlzLl9oYXNTaW5nbGVUYWdJbnNpZGVFbGVtZW50KHRhYmxlLCBcIlRCT0RZXCIpID8gdGFibGUuZmlyc3RFbGVtZW50Q2hpbGQgOiB0YWJsZTtcclxuICAgICAgaWYgKHRoaXMuX2hhc1NpbmdsZVRhZ0luc2lkZUVsZW1lbnQodGJvZHksIFwiVFJcIikpIHtcclxuICAgICAgICB2YXIgcm93ID0gdGJvZHkuZmlyc3RFbGVtZW50Q2hpbGQ7XHJcbiAgICAgICAgaWYgKHRoaXMuX2hhc1NpbmdsZVRhZ0luc2lkZUVsZW1lbnQocm93LCBcIlREXCIpKSB7XHJcbiAgICAgICAgICB2YXIgY2VsbCA9IHJvdy5maXJzdEVsZW1lbnRDaGlsZDtcclxuICAgICAgICAgIGNlbGwgPSB0aGlzLl9zZXROb2RlVGFnKGNlbGwsIHRoaXMuX2V2ZXJ5Tm9kZShjZWxsLmNoaWxkTm9kZXMsIHRoaXMuX2lzUGhyYXNpbmdDb250ZW50KSA/IFwiUFwiIDogXCJESVZcIik7XHJcbiAgICAgICAgICB0YWJsZS5wYXJlbnROb2RlLnJlcGxhY2VDaGlsZChjZWxsLCB0YWJsZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBJbml0aWFsaXplIGEgbm9kZSB3aXRoIHRoZSByZWFkYWJpbGl0eSBvYmplY3QuIEFsc28gY2hlY2tzIHRoZVxyXG4gICAqIGNsYXNzTmFtZS9pZCBmb3Igc3BlY2lhbCBuYW1lcyB0byBhZGQgdG8gaXRzIHNjb3JlLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIEVsZW1lbnRcclxuICAgKiBAcmV0dXJuIHZvaWRcclxuICAqKi9cclxuICBfaW5pdGlhbGl6ZU5vZGU6IGZ1bmN0aW9uKG5vZGUpIHtcclxuICAgIG5vZGUucmVhZGFiaWxpdHkgPSB7XCJjb250ZW50U2NvcmVcIjogMH07XHJcblxyXG4gICAgc3dpdGNoIChub2RlLnRhZ05hbWUpIHtcclxuICAgICAgY2FzZSBcIkRJVlwiOlxyXG4gICAgICAgIG5vZGUucmVhZGFiaWxpdHkuY29udGVudFNjb3JlICs9IDU7XHJcbiAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICBjYXNlIFwiUFJFXCI6XHJcbiAgICAgIGNhc2UgXCJURFwiOlxyXG4gICAgICBjYXNlIFwiQkxPQ0tRVU9URVwiOlxyXG4gICAgICAgIG5vZGUucmVhZGFiaWxpdHkuY29udGVudFNjb3JlICs9IDM7XHJcbiAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICBjYXNlIFwiQUREUkVTU1wiOlxyXG4gICAgICBjYXNlIFwiT0xcIjpcclxuICAgICAgY2FzZSBcIlVMXCI6XHJcbiAgICAgIGNhc2UgXCJETFwiOlxyXG4gICAgICBjYXNlIFwiRERcIjpcclxuICAgICAgY2FzZSBcIkRUXCI6XHJcbiAgICAgIGNhc2UgXCJMSVwiOlxyXG4gICAgICBjYXNlIFwiRk9STVwiOlxyXG4gICAgICAgIG5vZGUucmVhZGFiaWxpdHkuY29udGVudFNjb3JlIC09IDM7XHJcbiAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICBjYXNlIFwiSDFcIjpcclxuICAgICAgY2FzZSBcIkgyXCI6XHJcbiAgICAgIGNhc2UgXCJIM1wiOlxyXG4gICAgICBjYXNlIFwiSDRcIjpcclxuICAgICAgY2FzZSBcIkg1XCI6XHJcbiAgICAgIGNhc2UgXCJINlwiOlxyXG4gICAgICBjYXNlIFwiVEhcIjpcclxuICAgICAgICBub2RlLnJlYWRhYmlsaXR5LmNvbnRlbnRTY29yZSAtPSA1O1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgfVxyXG5cclxuICAgIG5vZGUucmVhZGFiaWxpdHkuY29udGVudFNjb3JlICs9IHRoaXMuX2dldENsYXNzV2VpZ2h0KG5vZGUpO1xyXG4gIH0sXHJcblxyXG4gIF9yZW1vdmVBbmRHZXROZXh0OiBmdW5jdGlvbihub2RlKSB7XHJcbiAgICB2YXIgbmV4dE5vZGUgPSB0aGlzLl9nZXROZXh0Tm9kZShub2RlLCB0cnVlKTtcclxuICAgIG5vZGUucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChub2RlKTtcclxuICAgIHJldHVybiBuZXh0Tm9kZTtcclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBUcmF2ZXJzZSB0aGUgRE9NIGZyb20gbm9kZSB0byBub2RlLCBzdGFydGluZyBhdCB0aGUgbm9kZSBwYXNzZWQgaW4uXHJcbiAgICogUGFzcyB0cnVlIGZvciB0aGUgc2Vjb25kIHBhcmFtZXRlciB0byBpbmRpY2F0ZSB0aGlzIG5vZGUgaXRzZWxmXHJcbiAgICogKGFuZCBpdHMga2lkcykgYXJlIGdvaW5nIGF3YXksIGFuZCB3ZSB3YW50IHRoZSBuZXh0IG5vZGUgb3Zlci5cclxuICAgKlxyXG4gICAqIENhbGxpbmcgdGhpcyBpbiBhIGxvb3Agd2lsbCB0cmF2ZXJzZSB0aGUgRE9NIGRlcHRoLWZpcnN0LlxyXG4gICAqL1xyXG4gIF9nZXROZXh0Tm9kZTogZnVuY3Rpb24obm9kZSwgaWdub3JlU2VsZkFuZEtpZHMpIHtcclxuICAgIC8vIEZpcnN0IGNoZWNrIGZvciBraWRzIGlmIHRob3NlIGFyZW4ndCBiZWluZyBpZ25vcmVkXHJcbiAgICBpZiAoIWlnbm9yZVNlbGZBbmRLaWRzICYmIG5vZGUuZmlyc3RFbGVtZW50Q2hpbGQpIHtcclxuICAgICAgcmV0dXJuIG5vZGUuZmlyc3RFbGVtZW50Q2hpbGQ7XHJcbiAgICB9XHJcbiAgICAvLyBUaGVuIGZvciBzaWJsaW5ncy4uLlxyXG4gICAgaWYgKG5vZGUubmV4dEVsZW1lbnRTaWJsaW5nKSB7XHJcbiAgICAgIHJldHVybiBub2RlLm5leHRFbGVtZW50U2libGluZztcclxuICAgIH1cclxuICAgIC8vIEFuZCBmaW5hbGx5LCBtb3ZlIHVwIHRoZSBwYXJlbnQgY2hhaW4gKmFuZCogZmluZCBhIHNpYmxpbmdcclxuICAgIC8vIChiZWNhdXNlIHRoaXMgaXMgZGVwdGgtZmlyc3QgdHJhdmVyc2FsLCB3ZSB3aWxsIGhhdmUgYWxyZWFkeVxyXG4gICAgLy8gc2VlbiB0aGUgcGFyZW50IG5vZGVzIHRoZW1zZWx2ZXMpLlxyXG4gICAgZG8ge1xyXG4gICAgICBub2RlID0gbm9kZS5wYXJlbnROb2RlO1xyXG4gICAgfSB3aGlsZSAobm9kZSAmJiAhbm9kZS5uZXh0RWxlbWVudFNpYmxpbmcpO1xyXG4gICAgcmV0dXJuIG5vZGUgJiYgbm9kZS5uZXh0RWxlbWVudFNpYmxpbmc7XHJcbiAgfSxcclxuXHJcbiAgX2NoZWNrQnlsaW5lOiBmdW5jdGlvbihub2RlLCBtYXRjaFN0cmluZykge1xyXG4gICAgaWYgKHRoaXMuX2FydGljbGVCeWxpbmUpIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChub2RlLmdldEF0dHJpYnV0ZSAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgIHZhciByZWwgPSBub2RlLmdldEF0dHJpYnV0ZShcInJlbFwiKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoKHJlbCA9PT0gXCJhdXRob3JcIiB8fCB0aGlzLlJFR0VYUFMuYnlsaW5lLnRlc3QobWF0Y2hTdHJpbmcpKSAmJiB0aGlzLl9pc1ZhbGlkQnlsaW5lKG5vZGUudGV4dENvbnRlbnQpKSB7XHJcbiAgICAgIHRoaXMuX2FydGljbGVCeWxpbmUgPSBub2RlLnRleHRDb250ZW50LnRyaW0oKTtcclxuICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG4gIH0sXHJcblxyXG4gIF9nZXROb2RlQW5jZXN0b3JzOiBmdW5jdGlvbihub2RlLCBtYXhEZXB0aCkge1xyXG4gICAgbWF4RGVwdGggPSBtYXhEZXB0aCB8fCAwO1xyXG4gICAgdmFyIGkgPSAwLCBhbmNlc3RvcnMgPSBbXTtcclxuICAgIHdoaWxlIChub2RlLnBhcmVudE5vZGUpIHtcclxuICAgICAgYW5jZXN0b3JzLnB1c2gobm9kZS5wYXJlbnROb2RlKTtcclxuICAgICAgaWYgKG1heERlcHRoICYmICsraSA9PT0gbWF4RGVwdGgpXHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIG5vZGUgPSBub2RlLnBhcmVudE5vZGU7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gYW5jZXN0b3JzO1xyXG4gIH0sXHJcblxyXG4gIC8qKipcclxuICAgKiBncmFiQXJ0aWNsZSAtIFVzaW5nIGEgdmFyaWV0eSBvZiBtZXRyaWNzIChjb250ZW50IHNjb3JlLCBjbGFzc25hbWUsIGVsZW1lbnQgdHlwZXMpLCBmaW5kIHRoZSBjb250ZW50IHRoYXQgaXNcclxuICAgKiAgICAgICAgIG1vc3QgbGlrZWx5IHRvIGJlIHRoZSBzdHVmZiBhIHVzZXIgd2FudHMgdG8gcmVhZC4gVGhlbiByZXR1cm4gaXQgd3JhcHBlZCB1cCBpbiBhIGRpdi5cclxuICAgKlxyXG4gICAqIEBwYXJhbSBwYWdlIGEgZG9jdW1lbnQgdG8gcnVuIHVwb24uIE5lZWRzIHRvIGJlIGEgZnVsbCBkb2N1bWVudCwgY29tcGxldGUgd2l0aCBib2R5LlxyXG4gICAqIEByZXR1cm4gRWxlbWVudFxyXG4gICoqL1xyXG4gIF9ncmFiQXJ0aWNsZTogZnVuY3Rpb24gKHBhZ2UpIHtcclxuICAgIHRoaXMubG9nKFwiKioqKiBncmFiQXJ0aWNsZSAqKioqXCIpO1xyXG4gICAgdmFyIGRvYyA9IHRoaXMuX2RvYztcclxuICAgIHZhciBpc1BhZ2luZyA9IChwYWdlICE9PSBudWxsID8gdHJ1ZTogZmFsc2UpO1xyXG4gICAgcGFnZSA9IHBhZ2UgPyBwYWdlIDogdGhpcy5fZG9jLmJvZHk7XHJcblxyXG4gICAgLy8gV2UgY2FuJ3QgZ3JhYiBhbiBhcnRpY2xlIGlmIHdlIGRvbid0IGhhdmUgYSBwYWdlIVxyXG4gICAgaWYgKCFwYWdlKSB7XHJcbiAgICAgIHRoaXMubG9nKFwiTm8gYm9keSBmb3VuZCBpbiBkb2N1bWVudC4gQWJvcnQuXCIpO1xyXG4gICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgcGFnZUNhY2hlSHRtbCA9IHBhZ2UuaW5uZXJIVE1MO1xyXG5cclxuICAgIHdoaWxlICh0cnVlKSB7XHJcbiAgICAgIHZhciBzdHJpcFVubGlrZWx5Q2FuZGlkYXRlcyA9IHRoaXMuX2ZsYWdJc0FjdGl2ZSh0aGlzLkZMQUdfU1RSSVBfVU5MSUtFTFlTKTtcclxuXHJcbiAgICAgIC8vIEZpcnN0LCBub2RlIHByZXBwaW5nLiBUcmFzaCBub2RlcyB0aGF0IGxvb2sgY3J1ZGR5IChsaWtlIG9uZXMgd2l0aCB0aGVcclxuICAgICAgLy8gY2xhc3MgbmFtZSBcImNvbW1lbnRcIiwgZXRjKSwgYW5kIHR1cm4gZGl2cyBpbnRvIFAgdGFncyB3aGVyZSB0aGV5IGhhdmUgYmVlblxyXG4gICAgICAvLyB1c2VkIGluYXBwcm9wcmlhdGVseSAoYXMgaW4sIHdoZXJlIHRoZXkgY29udGFpbiBubyBvdGhlciBibG9jayBsZXZlbCBlbGVtZW50cy4pXHJcbiAgICAgIHZhciBlbGVtZW50c1RvU2NvcmUgPSBbXTtcclxuICAgICAgdmFyIG5vZGUgPSB0aGlzLl9kb2MuZG9jdW1lbnRFbGVtZW50O1xyXG5cclxuICAgICAgd2hpbGUgKG5vZGUpIHtcclxuICAgICAgICB2YXIgbWF0Y2hTdHJpbmcgPSBub2RlLmNsYXNzTmFtZSArIFwiIFwiICsgbm9kZS5pZDtcclxuXHJcbiAgICAgICAgaWYgKCF0aGlzLl9pc1Byb2JhYmx5VmlzaWJsZShub2RlKSkge1xyXG4gICAgICAgICAgdGhpcy5sb2coXCJSZW1vdmluZyBoaWRkZW4gbm9kZSAtIFwiICsgbWF0Y2hTdHJpbmcpO1xyXG4gICAgICAgICAgbm9kZSA9IHRoaXMuX3JlbW92ZUFuZEdldE5leHQobm9kZSk7XHJcbiAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIENoZWNrIHRvIHNlZSBpZiB0aGlzIG5vZGUgaXMgYSBieWxpbmUsIGFuZCByZW1vdmUgaXQgaWYgaXQgaXMuXHJcbiAgICAgICAgaWYgKHRoaXMuX2NoZWNrQnlsaW5lKG5vZGUsIG1hdGNoU3RyaW5nKSkge1xyXG4gICAgICAgICAgbm9kZSA9IHRoaXMuX3JlbW92ZUFuZEdldE5leHQobm9kZSk7XHJcbiAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFJlbW92ZSB1bmxpa2VseSBjYW5kaWRhdGVzXHJcbiAgICAgICAgaWYgKHN0cmlwVW5saWtlbHlDYW5kaWRhdGVzKSB7XHJcbiAgICAgICAgICBpZiAodGhpcy5SRUdFWFBTLnVubGlrZWx5Q2FuZGlkYXRlcy50ZXN0KG1hdGNoU3RyaW5nKSAmJlxyXG4gICAgICAgICAgICAgICF0aGlzLlJFR0VYUFMub2tNYXliZUl0c0FDYW5kaWRhdGUudGVzdChtYXRjaFN0cmluZykgJiZcclxuICAgICAgICAgICAgICBub2RlLnRhZ05hbWUgIT09IFwiQk9EWVwiICYmXHJcbiAgICAgICAgICAgICAgbm9kZS50YWdOYW1lICE9PSBcIkFcIikge1xyXG4gICAgICAgICAgICB0aGlzLmxvZyhcIlJlbW92aW5nIHVubGlrZWx5IGNhbmRpZGF0ZSAtIFwiICsgbWF0Y2hTdHJpbmcpO1xyXG4gICAgICAgICAgICBub2RlID0gdGhpcy5fcmVtb3ZlQW5kR2V0TmV4dChub2RlKTtcclxuICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBSZW1vdmUgRElWLCBTRUNUSU9OLCBhbmQgSEVBREVSIG5vZGVzIHdpdGhvdXQgYW55IGNvbnRlbnQoZS5nLiB0ZXh0LCBpbWFnZSwgdmlkZW8sIG9yIGlmcmFtZSkuXHJcbiAgICAgICAgaWYgKChub2RlLnRhZ05hbWUgPT09IFwiRElWXCIgfHwgbm9kZS50YWdOYW1lID09PSBcIlNFQ1RJT05cIiB8fCBub2RlLnRhZ05hbWUgPT09IFwiSEVBREVSXCIgfHxcclxuICAgICAgICAgICAgIG5vZGUudGFnTmFtZSA9PT0gXCJIMVwiIHx8IG5vZGUudGFnTmFtZSA9PT0gXCJIMlwiIHx8IG5vZGUudGFnTmFtZSA9PT0gXCJIM1wiIHx8XHJcbiAgICAgICAgICAgICBub2RlLnRhZ05hbWUgPT09IFwiSDRcIiB8fCBub2RlLnRhZ05hbWUgPT09IFwiSDVcIiB8fCBub2RlLnRhZ05hbWUgPT09IFwiSDZcIikgJiZcclxuICAgICAgICAgICAgdGhpcy5faXNFbGVtZW50V2l0aG91dENvbnRlbnQobm9kZSkpIHtcclxuICAgICAgICAgIG5vZGUgPSB0aGlzLl9yZW1vdmVBbmRHZXROZXh0KG5vZGUpO1xyXG4gICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodGhpcy5ERUZBVUxUX1RBR1NfVE9fU0NPUkUuaW5kZXhPZihub2RlLnRhZ05hbWUpICE9PSAtMSkge1xyXG4gICAgICAgICAgZWxlbWVudHNUb1Njb3JlLnB1c2gobm9kZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBUdXJuIGFsbCBkaXZzIHRoYXQgZG9uJ3QgaGF2ZSBjaGlsZHJlbiBibG9jayBsZXZlbCBlbGVtZW50cyBpbnRvIHAnc1xyXG4gICAgICAgIGlmIChub2RlLnRhZ05hbWUgPT09IFwiRElWXCIpIHtcclxuICAgICAgICAgIC8vIFB1dCBwaHJhc2luZyBjb250ZW50IGludG8gcGFyYWdyYXBocy5cclxuICAgICAgICAgIHZhciBwID0gbnVsbDtcclxuICAgICAgICAgIHZhciBjaGlsZE5vZGUgPSBub2RlLmZpcnN0Q2hpbGQ7XHJcbiAgICAgICAgICB3aGlsZSAoY2hpbGROb2RlKSB7XHJcbiAgICAgICAgICAgIHZhciBuZXh0U2libGluZyA9IGNoaWxkTm9kZS5uZXh0U2libGluZztcclxuICAgICAgICAgICAgaWYgKHRoaXMuX2lzUGhyYXNpbmdDb250ZW50KGNoaWxkTm9kZSkpIHtcclxuICAgICAgICAgICAgICBpZiAocCAhPT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgcC5hcHBlbmRDaGlsZChjaGlsZE5vZGUpO1xyXG4gICAgICAgICAgICAgIH0gZWxzZSBpZiAoIXRoaXMuX2lzV2hpdGVzcGFjZShjaGlsZE5vZGUpKSB7XHJcbiAgICAgICAgICAgICAgICBwID0gZG9jLmNyZWF0ZUVsZW1lbnQoXCJwXCIpO1xyXG4gICAgICAgICAgICAgICAgbm9kZS5yZXBsYWNlQ2hpbGQocCwgY2hpbGROb2RlKTtcclxuICAgICAgICAgICAgICAgIHAuYXBwZW5kQ2hpbGQoY2hpbGROb2RlKTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAocCAhPT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgIHdoaWxlIChwLmxhc3RDaGlsZCAmJiB0aGlzLl9pc1doaXRlc3BhY2UocC5sYXN0Q2hpbGQpKSB7XHJcbiAgICAgICAgICAgICAgICBwLnJlbW92ZUNoaWxkKHAubGFzdENoaWxkKTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgcCA9IG51bGw7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY2hpbGROb2RlID0gbmV4dFNpYmxpbmc7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgLy8gU2l0ZXMgbGlrZSBodHRwOi8vbW9iaWxlLnNsYXRlLmNvbSBlbmNsb3NlcyBlYWNoIHBhcmFncmFwaCB3aXRoIGEgRElWXHJcbiAgICAgICAgICAvLyBlbGVtZW50LiBESVZzIHdpdGggb25seSBhIFAgZWxlbWVudCBpbnNpZGUgYW5kIG5vIHRleHQgY29udGVudCBjYW4gYmVcclxuICAgICAgICAgIC8vIHNhZmVseSBjb252ZXJ0ZWQgaW50byBwbGFpbiBQIGVsZW1lbnRzIHRvIGF2b2lkIGNvbmZ1c2luZyB0aGUgc2NvcmluZ1xyXG4gICAgICAgICAgLy8gYWxnb3JpdGhtIHdpdGggRElWcyB3aXRoIGFyZSwgaW4gcHJhY3RpY2UsIHBhcmFncmFwaHMuXHJcbiAgICAgICAgICBpZiAodGhpcy5faGFzU2luZ2xlVGFnSW5zaWRlRWxlbWVudChub2RlLCBcIlBcIikgJiYgdGhpcy5fZ2V0TGlua0RlbnNpdHkobm9kZSkgPCAwLjI1KSB7XHJcbiAgICAgICAgICAgIHZhciBuZXdOb2RlID0gbm9kZS5jaGlsZHJlblswXTtcclxuICAgICAgICAgICAgbm9kZS5wYXJlbnROb2RlLnJlcGxhY2VDaGlsZChuZXdOb2RlLCBub2RlKTtcclxuICAgICAgICAgICAgbm9kZSA9IG5ld05vZGU7XHJcbiAgICAgICAgICAgIGVsZW1lbnRzVG9TY29yZS5wdXNoKG5vZGUpO1xyXG4gICAgICAgICAgfSBlbHNlIGlmICghdGhpcy5faGFzQ2hpbGRCbG9ja0VsZW1lbnQobm9kZSkpIHtcclxuICAgICAgICAgICAgbm9kZSA9IHRoaXMuX3NldE5vZGVUYWcobm9kZSwgXCJQXCIpO1xyXG4gICAgICAgICAgICBlbGVtZW50c1RvU2NvcmUucHVzaChub2RlKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgbm9kZSA9IHRoaXMuX2dldE5leHROb2RlKG5vZGUpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogTG9vcCB0aHJvdWdoIGFsbCBwYXJhZ3JhcGhzLCBhbmQgYXNzaWduIGEgc2NvcmUgdG8gdGhlbSBiYXNlZCBvbiBob3cgY29udGVudC15IHRoZXkgbG9vay5cclxuICAgICAgICogVGhlbiBhZGQgdGhlaXIgc2NvcmUgdG8gdGhlaXIgcGFyZW50IG5vZGUuXHJcbiAgICAgICAqXHJcbiAgICAgICAqIEEgc2NvcmUgaXMgZGV0ZXJtaW5lZCBieSB0aGluZ3MgbGlrZSBudW1iZXIgb2YgY29tbWFzLCBjbGFzcyBuYW1lcywgZXRjLiBNYXliZSBldmVudHVhbGx5IGxpbmsgZGVuc2l0eS5cclxuICAgICAgKiovXHJcbiAgICAgIHZhciBjYW5kaWRhdGVzID0gW107XHJcbiAgICAgIHRoaXMuX2ZvckVhY2hOb2RlKGVsZW1lbnRzVG9TY29yZSwgZnVuY3Rpb24oZWxlbWVudFRvU2NvcmUpIHtcclxuICAgICAgICBpZiAoIWVsZW1lbnRUb1Njb3JlLnBhcmVudE5vZGUgfHwgdHlwZW9mKGVsZW1lbnRUb1Njb3JlLnBhcmVudE5vZGUudGFnTmFtZSkgPT09IFwidW5kZWZpbmVkXCIpXHJcbiAgICAgICAgICByZXR1cm47XHJcblxyXG4gICAgICAgIC8vIElmIHRoaXMgcGFyYWdyYXBoIGlzIGxlc3MgdGhhbiAyNSBjaGFyYWN0ZXJzLCBkb24ndCBldmVuIGNvdW50IGl0LlxyXG4gICAgICAgIHZhciBpbm5lclRleHQgPSB0aGlzLl9nZXRJbm5lclRleHQoZWxlbWVudFRvU2NvcmUpO1xyXG4gICAgICAgIGlmIChpbm5lclRleHQubGVuZ3RoIDwgMjUpXHJcbiAgICAgICAgICByZXR1cm47XHJcblxyXG4gICAgICAgIC8vIEV4Y2x1ZGUgbm9kZXMgd2l0aCBubyBhbmNlc3Rvci5cclxuICAgICAgICB2YXIgYW5jZXN0b3JzID0gdGhpcy5fZ2V0Tm9kZUFuY2VzdG9ycyhlbGVtZW50VG9TY29yZSwgMyk7XHJcbiAgICAgICAgaWYgKGFuY2VzdG9ycy5sZW5ndGggPT09IDApXHJcbiAgICAgICAgICByZXR1cm47XHJcblxyXG4gICAgICAgIHZhciBjb250ZW50U2NvcmUgPSAwO1xyXG5cclxuICAgICAgICAvLyBBZGQgYSBwb2ludCBmb3IgdGhlIHBhcmFncmFwaCBpdHNlbGYgYXMgYSBiYXNlLlxyXG4gICAgICAgIGNvbnRlbnRTY29yZSArPSAxO1xyXG5cclxuICAgICAgICAvLyBBZGQgcG9pbnRzIGZvciBhbnkgY29tbWFzIHdpdGhpbiB0aGlzIHBhcmFncmFwaC5cclxuICAgICAgICBjb250ZW50U2NvcmUgKz0gaW5uZXJUZXh0LnNwbGl0KFwiLFwiKS5sZW5ndGg7XHJcblxyXG4gICAgICAgIC8vIEZvciBldmVyeSAxMDAgY2hhcmFjdGVycyBpbiB0aGlzIHBhcmFncmFwaCwgYWRkIGFub3RoZXIgcG9pbnQuIFVwIHRvIDMgcG9pbnRzLlxyXG4gICAgICAgIGNvbnRlbnRTY29yZSArPSBNYXRoLm1pbihNYXRoLmZsb29yKGlubmVyVGV4dC5sZW5ndGggLyAxMDApLCAzKTtcclxuXHJcbiAgICAgICAgLy8gSW5pdGlhbGl6ZSBhbmQgc2NvcmUgYW5jZXN0b3JzLlxyXG4gICAgICAgIHRoaXMuX2ZvckVhY2hOb2RlKGFuY2VzdG9ycywgZnVuY3Rpb24oYW5jZXN0b3IsIGxldmVsKSB7XHJcbiAgICAgICAgICBpZiAoIWFuY2VzdG9yLnRhZ05hbWUgfHwgIWFuY2VzdG9yLnBhcmVudE5vZGUgfHwgdHlwZW9mKGFuY2VzdG9yLnBhcmVudE5vZGUudGFnTmFtZSkgPT09IFwidW5kZWZpbmVkXCIpXHJcbiAgICAgICAgICAgIHJldHVybjtcclxuXHJcbiAgICAgICAgICBpZiAodHlwZW9mKGFuY2VzdG9yLnJlYWRhYmlsaXR5KSA9PT0gXCJ1bmRlZmluZWRcIikge1xyXG4gICAgICAgICAgICB0aGlzLl9pbml0aWFsaXplTm9kZShhbmNlc3Rvcik7XHJcbiAgICAgICAgICAgIGNhbmRpZGF0ZXMucHVzaChhbmNlc3Rvcik7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgLy8gTm9kZSBzY29yZSBkaXZpZGVyOlxyXG4gICAgICAgICAgLy8gLSBwYXJlbnQ6ICAgICAgICAgICAgIDEgKG5vIGRpdmlzaW9uKVxyXG4gICAgICAgICAgLy8gLSBncmFuZHBhcmVudDogICAgICAgIDJcclxuICAgICAgICAgIC8vIC0gZ3JlYXQgZ3JhbmRwYXJlbnQrOiBhbmNlc3RvciBsZXZlbCAqIDNcclxuICAgICAgICAgIGlmIChsZXZlbCA9PT0gMClcclxuICAgICAgICAgICAgdmFyIHNjb3JlRGl2aWRlciA9IDE7XHJcbiAgICAgICAgICBlbHNlIGlmIChsZXZlbCA9PT0gMSlcclxuICAgICAgICAgICAgc2NvcmVEaXZpZGVyID0gMjtcclxuICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgc2NvcmVEaXZpZGVyID0gbGV2ZWwgKiAzO1xyXG4gICAgICAgICAgYW5jZXN0b3IucmVhZGFiaWxpdHkuY29udGVudFNjb3JlICs9IGNvbnRlbnRTY29yZSAvIHNjb3JlRGl2aWRlcjtcclxuICAgICAgICB9KTtcclxuICAgICAgfSk7XHJcblxyXG4gICAgICAvLyBBZnRlciB3ZSd2ZSBjYWxjdWxhdGVkIHNjb3JlcywgbG9vcCB0aHJvdWdoIGFsbCBvZiB0aGUgcG9zc2libGVcclxuICAgICAgLy8gY2FuZGlkYXRlIG5vZGVzIHdlIGZvdW5kIGFuZCBmaW5kIHRoZSBvbmUgd2l0aCB0aGUgaGlnaGVzdCBzY29yZS5cclxuICAgICAgdmFyIHRvcENhbmRpZGF0ZXMgPSBbXTtcclxuICAgICAgZm9yICh2YXIgYyA9IDAsIGNsID0gY2FuZGlkYXRlcy5sZW5ndGg7IGMgPCBjbDsgYyArPSAxKSB7XHJcbiAgICAgICAgdmFyIGNhbmRpZGF0ZSA9IGNhbmRpZGF0ZXNbY107XHJcblxyXG4gICAgICAgIC8vIFNjYWxlIHRoZSBmaW5hbCBjYW5kaWRhdGVzIHNjb3JlIGJhc2VkIG9uIGxpbmsgZGVuc2l0eS4gR29vZCBjb250ZW50XHJcbiAgICAgICAgLy8gc2hvdWxkIGhhdmUgYSByZWxhdGl2ZWx5IHNtYWxsIGxpbmsgZGVuc2l0eSAoNSUgb3IgbGVzcykgYW5kIGJlIG1vc3RseVxyXG4gICAgICAgIC8vIHVuYWZmZWN0ZWQgYnkgdGhpcyBvcGVyYXRpb24uXHJcbiAgICAgICAgdmFyIGNhbmRpZGF0ZVNjb3JlID0gY2FuZGlkYXRlLnJlYWRhYmlsaXR5LmNvbnRlbnRTY29yZSAqICgxIC0gdGhpcy5fZ2V0TGlua0RlbnNpdHkoY2FuZGlkYXRlKSk7XHJcbiAgICAgICAgY2FuZGlkYXRlLnJlYWRhYmlsaXR5LmNvbnRlbnRTY29yZSA9IGNhbmRpZGF0ZVNjb3JlO1xyXG5cclxuICAgICAgICB0aGlzLmxvZyhcIkNhbmRpZGF0ZTpcIiwgY2FuZGlkYXRlLCBcIndpdGggc2NvcmUgXCIgKyBjYW5kaWRhdGVTY29yZSk7XHJcblxyXG4gICAgICAgIGZvciAodmFyIHQgPSAwOyB0IDwgdGhpcy5fbmJUb3BDYW5kaWRhdGVzOyB0KyspIHtcclxuICAgICAgICAgIHZhciBhVG9wQ2FuZGlkYXRlID0gdG9wQ2FuZGlkYXRlc1t0XTtcclxuXHJcbiAgICAgICAgICBpZiAoIWFUb3BDYW5kaWRhdGUgfHwgY2FuZGlkYXRlU2NvcmUgPiBhVG9wQ2FuZGlkYXRlLnJlYWRhYmlsaXR5LmNvbnRlbnRTY29yZSkge1xyXG4gICAgICAgICAgICB0b3BDYW5kaWRhdGVzLnNwbGljZSh0LCAwLCBjYW5kaWRhdGUpO1xyXG4gICAgICAgICAgICBpZiAodG9wQ2FuZGlkYXRlcy5sZW5ndGggPiB0aGlzLl9uYlRvcENhbmRpZGF0ZXMpXHJcbiAgICAgICAgICAgICAgdG9wQ2FuZGlkYXRlcy5wb3AoKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICB2YXIgdG9wQ2FuZGlkYXRlID0gdG9wQ2FuZGlkYXRlc1swXSB8fCBudWxsO1xyXG4gICAgICB2YXIgbmVlZGVkVG9DcmVhdGVUb3BDYW5kaWRhdGUgPSBmYWxzZTtcclxuICAgICAgdmFyIHBhcmVudE9mVG9wQ2FuZGlkYXRlO1xyXG5cclxuICAgICAgLy8gSWYgd2Ugc3RpbGwgaGF2ZSBubyB0b3AgY2FuZGlkYXRlLCBqdXN0IHVzZSB0aGUgYm9keSBhcyBhIGxhc3QgcmVzb3J0LlxyXG4gICAgICAvLyBXZSBhbHNvIGhhdmUgdG8gY29weSB0aGUgYm9keSBub2RlIHNvIGl0IGlzIHNvbWV0aGluZyB3ZSBjYW4gbW9kaWZ5LlxyXG4gICAgICBpZiAodG9wQ2FuZGlkYXRlID09PSBudWxsIHx8IHRvcENhbmRpZGF0ZS50YWdOYW1lID09PSBcIkJPRFlcIikge1xyXG4gICAgICAgIC8vIE1vdmUgYWxsIG9mIHRoZSBwYWdlJ3MgY2hpbGRyZW4gaW50byB0b3BDYW5kaWRhdGVcclxuICAgICAgICB0b3BDYW5kaWRhdGUgPSBkb2MuY3JlYXRlRWxlbWVudChcIkRJVlwiKTtcclxuICAgICAgICBuZWVkZWRUb0NyZWF0ZVRvcENhbmRpZGF0ZSA9IHRydWU7XHJcbiAgICAgICAgLy8gTW92ZSBldmVyeXRoaW5nIChub3QganVzdCBlbGVtZW50cywgYWxzbyB0ZXh0IG5vZGVzIGV0Yy4pIGludG8gdGhlIGNvbnRhaW5lclxyXG4gICAgICAgIC8vIHNvIHdlIGV2ZW4gaW5jbHVkZSB0ZXh0IGRpcmVjdGx5IGluIHRoZSBib2R5OlxyXG4gICAgICAgIHZhciBraWRzID0gcGFnZS5jaGlsZE5vZGVzO1xyXG4gICAgICAgIHdoaWxlIChraWRzLmxlbmd0aCkge1xyXG4gICAgICAgICAgdGhpcy5sb2coXCJNb3ZpbmcgY2hpbGQgb3V0OlwiLCBraWRzWzBdKTtcclxuICAgICAgICAgIHRvcENhbmRpZGF0ZS5hcHBlbmRDaGlsZChraWRzWzBdKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHBhZ2UuYXBwZW5kQ2hpbGQodG9wQ2FuZGlkYXRlKTtcclxuXHJcbiAgICAgICAgdGhpcy5faW5pdGlhbGl6ZU5vZGUodG9wQ2FuZGlkYXRlKTtcclxuICAgICAgfSBlbHNlIGlmICh0b3BDYW5kaWRhdGUpIHtcclxuICAgICAgICAvLyBGaW5kIGEgYmV0dGVyIHRvcCBjYW5kaWRhdGUgbm9kZSBpZiBpdCBjb250YWlucyAoYXQgbGVhc3QgdGhyZWUpIG5vZGVzIHdoaWNoIGJlbG9uZyB0byBgdG9wQ2FuZGlkYXRlc2AgYXJyYXlcclxuICAgICAgICAvLyBhbmQgd2hvc2Ugc2NvcmVzIGFyZSBxdWl0ZSBjbG9zZWQgd2l0aCBjdXJyZW50IGB0b3BDYW5kaWRhdGVgIG5vZGUuXHJcbiAgICAgICAgdmFyIGFsdGVybmF0aXZlQ2FuZGlkYXRlQW5jZXN0b3JzID0gW107XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDE7IGkgPCB0b3BDYW5kaWRhdGVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICBpZiAodG9wQ2FuZGlkYXRlc1tpXS5yZWFkYWJpbGl0eS5jb250ZW50U2NvcmUgLyB0b3BDYW5kaWRhdGUucmVhZGFiaWxpdHkuY29udGVudFNjb3JlID49IDAuNzUpIHtcclxuICAgICAgICAgICAgYWx0ZXJuYXRpdmVDYW5kaWRhdGVBbmNlc3RvcnMucHVzaCh0aGlzLl9nZXROb2RlQW5jZXN0b3JzKHRvcENhbmRpZGF0ZXNbaV0pKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIE1JTklNVU1fVE9QQ0FORElEQVRFUyA9IDM7XHJcbiAgICAgICAgaWYgKGFsdGVybmF0aXZlQ2FuZGlkYXRlQW5jZXN0b3JzLmxlbmd0aCA+PSBNSU5JTVVNX1RPUENBTkRJREFURVMpIHtcclxuICAgICAgICAgIHBhcmVudE9mVG9wQ2FuZGlkYXRlID0gdG9wQ2FuZGlkYXRlLnBhcmVudE5vZGU7XHJcbiAgICAgICAgICB3aGlsZSAocGFyZW50T2ZUb3BDYW5kaWRhdGUudGFnTmFtZSAhPT0gXCJCT0RZXCIpIHtcclxuICAgICAgICAgICAgdmFyIGxpc3RzQ29udGFpbmluZ1RoaXNBbmNlc3RvciA9IDA7XHJcbiAgICAgICAgICAgIGZvciAodmFyIGFuY2VzdG9ySW5kZXggPSAwOyBhbmNlc3RvckluZGV4IDwgYWx0ZXJuYXRpdmVDYW5kaWRhdGVBbmNlc3RvcnMubGVuZ3RoICYmIGxpc3RzQ29udGFpbmluZ1RoaXNBbmNlc3RvciA8IE1JTklNVU1fVE9QQ0FORElEQVRFUzsgYW5jZXN0b3JJbmRleCsrKSB7XHJcbiAgICAgICAgICAgICAgbGlzdHNDb250YWluaW5nVGhpc0FuY2VzdG9yICs9IE51bWJlcihhbHRlcm5hdGl2ZUNhbmRpZGF0ZUFuY2VzdG9yc1thbmNlc3RvckluZGV4XS5pbmNsdWRlcyhwYXJlbnRPZlRvcENhbmRpZGF0ZSkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChsaXN0c0NvbnRhaW5pbmdUaGlzQW5jZXN0b3IgPj0gTUlOSU1VTV9UT1BDQU5ESURBVEVTKSB7XHJcbiAgICAgICAgICAgICAgdG9wQ2FuZGlkYXRlID0gcGFyZW50T2ZUb3BDYW5kaWRhdGU7XHJcbiAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcGFyZW50T2ZUb3BDYW5kaWRhdGUgPSBwYXJlbnRPZlRvcENhbmRpZGF0ZS5wYXJlbnROb2RlO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIXRvcENhbmRpZGF0ZS5yZWFkYWJpbGl0eSkge1xyXG4gICAgICAgICAgdGhpcy5faW5pdGlhbGl6ZU5vZGUodG9wQ2FuZGlkYXRlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIEJlY2F1c2Ugb2Ygb3VyIGJvbnVzIHN5c3RlbSwgcGFyZW50cyBvZiBjYW5kaWRhdGVzIG1pZ2h0IGhhdmUgc2NvcmVzXHJcbiAgICAgICAgLy8gdGhlbXNlbHZlcy4gVGhleSBnZXQgaGFsZiBvZiB0aGUgbm9kZS4gVGhlcmUgd29uJ3QgYmUgbm9kZXMgd2l0aCBoaWdoZXJcclxuICAgICAgICAvLyBzY29yZXMgdGhhbiBvdXIgdG9wQ2FuZGlkYXRlLCBidXQgaWYgd2Ugc2VlIHRoZSBzY29yZSBnb2luZyAqdXAqIGluIHRoZSBmaXJzdFxyXG4gICAgICAgIC8vIGZldyBzdGVwcyB1cCB0aGUgdHJlZSwgdGhhdCdzIGEgZGVjZW50IHNpZ24gdGhhdCB0aGVyZSBtaWdodCBiZSBtb3JlIGNvbnRlbnRcclxuICAgICAgICAvLyBsdXJraW5nIGluIG90aGVyIHBsYWNlcyB0aGF0IHdlIHdhbnQgdG8gdW5pZnkgaW4uIFRoZSBzaWJsaW5nIHN0dWZmXHJcbiAgICAgICAgLy8gYmVsb3cgZG9lcyBzb21lIG9mIHRoYXQgLSBidXQgb25seSBpZiB3ZSd2ZSBsb29rZWQgaGlnaCBlbm91Z2ggdXAgdGhlIERPTVxyXG4gICAgICAgIC8vIHRyZWUuXHJcbiAgICAgICAgcGFyZW50T2ZUb3BDYW5kaWRhdGUgPSB0b3BDYW5kaWRhdGUucGFyZW50Tm9kZTtcclxuICAgICAgICB2YXIgbGFzdFNjb3JlID0gdG9wQ2FuZGlkYXRlLnJlYWRhYmlsaXR5LmNvbnRlbnRTY29yZTtcclxuICAgICAgICAvLyBUaGUgc2NvcmVzIHNob3VsZG4ndCBnZXQgdG9vIGxvdy5cclxuICAgICAgICB2YXIgc2NvcmVUaHJlc2hvbGQgPSBsYXN0U2NvcmUgLyAzO1xyXG4gICAgICAgIHdoaWxlIChwYXJlbnRPZlRvcENhbmRpZGF0ZS50YWdOYW1lICE9PSBcIkJPRFlcIikge1xyXG4gICAgICAgICAgaWYgKCFwYXJlbnRPZlRvcENhbmRpZGF0ZS5yZWFkYWJpbGl0eSkge1xyXG4gICAgICAgICAgICBwYXJlbnRPZlRvcENhbmRpZGF0ZSA9IHBhcmVudE9mVG9wQ2FuZGlkYXRlLnBhcmVudE5vZGU7XHJcbiAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgdmFyIHBhcmVudFNjb3JlID0gcGFyZW50T2ZUb3BDYW5kaWRhdGUucmVhZGFiaWxpdHkuY29udGVudFNjb3JlO1xyXG4gICAgICAgICAgaWYgKHBhcmVudFNjb3JlIDwgc2NvcmVUaHJlc2hvbGQpXHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgaWYgKHBhcmVudFNjb3JlID4gbGFzdFNjb3JlKSB7XHJcbiAgICAgICAgICAgIC8vIEFscmlnaHQhIFdlIGZvdW5kIGEgYmV0dGVyIHBhcmVudCB0byB1c2UuXHJcbiAgICAgICAgICAgIHRvcENhbmRpZGF0ZSA9IHBhcmVudE9mVG9wQ2FuZGlkYXRlO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGxhc3RTY29yZSA9IHBhcmVudE9mVG9wQ2FuZGlkYXRlLnJlYWRhYmlsaXR5LmNvbnRlbnRTY29yZTtcclxuICAgICAgICAgIHBhcmVudE9mVG9wQ2FuZGlkYXRlID0gcGFyZW50T2ZUb3BDYW5kaWRhdGUucGFyZW50Tm9kZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIElmIHRoZSB0b3AgY2FuZGlkYXRlIGlzIHRoZSBvbmx5IGNoaWxkLCB1c2UgcGFyZW50IGluc3RlYWQuIFRoaXMgd2lsbCBoZWxwIHNpYmxpbmdcclxuICAgICAgICAvLyBqb2luaW5nIGxvZ2ljIHdoZW4gYWRqYWNlbnQgY29udGVudCBpcyBhY3R1YWxseSBsb2NhdGVkIGluIHBhcmVudCdzIHNpYmxpbmcgbm9kZS5cclxuICAgICAgICBwYXJlbnRPZlRvcENhbmRpZGF0ZSA9IHRvcENhbmRpZGF0ZS5wYXJlbnROb2RlO1xyXG4gICAgICAgIHdoaWxlIChwYXJlbnRPZlRvcENhbmRpZGF0ZS50YWdOYW1lICE9IFwiQk9EWVwiICYmIHBhcmVudE9mVG9wQ2FuZGlkYXRlLmNoaWxkcmVuLmxlbmd0aCA9PSAxKSB7XHJcbiAgICAgICAgICB0b3BDYW5kaWRhdGUgPSBwYXJlbnRPZlRvcENhbmRpZGF0ZTtcclxuICAgICAgICAgIHBhcmVudE9mVG9wQ2FuZGlkYXRlID0gdG9wQ2FuZGlkYXRlLnBhcmVudE5vZGU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghdG9wQ2FuZGlkYXRlLnJlYWRhYmlsaXR5KSB7XHJcbiAgICAgICAgICB0aGlzLl9pbml0aWFsaXplTm9kZSh0b3BDYW5kaWRhdGUpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gTm93IHRoYXQgd2UgaGF2ZSB0aGUgdG9wIGNhbmRpZGF0ZSwgbG9vayB0aHJvdWdoIGl0cyBzaWJsaW5ncyBmb3IgY29udGVudFxyXG4gICAgICAvLyB0aGF0IG1pZ2h0IGFsc28gYmUgcmVsYXRlZC4gVGhpbmdzIGxpa2UgcHJlYW1ibGVzLCBjb250ZW50IHNwbGl0IGJ5IGFkc1xyXG4gICAgICAvLyB0aGF0IHdlIHJlbW92ZWQsIGV0Yy5cclxuICAgICAgdmFyIGFydGljbGVDb250ZW50ID0gZG9jLmNyZWF0ZUVsZW1lbnQoXCJESVZcIik7XHJcbiAgICAgIGlmIChpc1BhZ2luZylcclxuICAgICAgICBhcnRpY2xlQ29udGVudC5pZCA9IFwicmVhZGFiaWxpdHktY29udGVudFwiO1xyXG5cclxuICAgICAgdmFyIHNpYmxpbmdTY29yZVRocmVzaG9sZCA9IE1hdGgubWF4KDEwLCB0b3BDYW5kaWRhdGUucmVhZGFiaWxpdHkuY29udGVudFNjb3JlICogMC4yKTtcclxuICAgICAgLy8gS2VlcCBwb3RlbnRpYWwgdG9wIGNhbmRpZGF0ZSdzIHBhcmVudCBub2RlIHRvIHRyeSB0byBnZXQgdGV4dCBkaXJlY3Rpb24gb2YgaXQgbGF0ZXIuXHJcbiAgICAgIHBhcmVudE9mVG9wQ2FuZGlkYXRlID0gdG9wQ2FuZGlkYXRlLnBhcmVudE5vZGU7XHJcbiAgICAgIHZhciBzaWJsaW5ncyA9IHBhcmVudE9mVG9wQ2FuZGlkYXRlLmNoaWxkcmVuO1xyXG5cclxuICAgICAgZm9yICh2YXIgcyA9IDAsIHNsID0gc2libGluZ3MubGVuZ3RoOyBzIDwgc2w7IHMrKykge1xyXG4gICAgICAgIHZhciBzaWJsaW5nID0gc2libGluZ3Nbc107XHJcbiAgICAgICAgdmFyIGFwcGVuZCA9IGZhbHNlO1xyXG5cclxuICAgICAgICB0aGlzLmxvZyhcIkxvb2tpbmcgYXQgc2libGluZyBub2RlOlwiLCBzaWJsaW5nLCBzaWJsaW5nLnJlYWRhYmlsaXR5ID8gKFwid2l0aCBzY29yZSBcIiArIHNpYmxpbmcucmVhZGFiaWxpdHkuY29udGVudFNjb3JlKSA6IFwiXCIpO1xyXG4gICAgICAgIHRoaXMubG9nKFwiU2libGluZyBoYXMgc2NvcmVcIiwgc2libGluZy5yZWFkYWJpbGl0eSA/IHNpYmxpbmcucmVhZGFiaWxpdHkuY29udGVudFNjb3JlIDogXCJVbmtub3duXCIpO1xyXG5cclxuICAgICAgICBpZiAoc2libGluZyA9PT0gdG9wQ2FuZGlkYXRlKSB7XHJcbiAgICAgICAgICBhcHBlbmQgPSB0cnVlO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICB2YXIgY29udGVudEJvbnVzID0gMDtcclxuXHJcbiAgICAgICAgICAvLyBHaXZlIGEgYm9udXMgaWYgc2libGluZyBub2RlcyBhbmQgdG9wIGNhbmRpZGF0ZXMgaGF2ZSB0aGUgZXhhbXBsZSBzYW1lIGNsYXNzbmFtZVxyXG4gICAgICAgICAgaWYgKHNpYmxpbmcuY2xhc3NOYW1lID09PSB0b3BDYW5kaWRhdGUuY2xhc3NOYW1lICYmIHRvcENhbmRpZGF0ZS5jbGFzc05hbWUgIT09IFwiXCIpXHJcbiAgICAgICAgICAgIGNvbnRlbnRCb251cyArPSB0b3BDYW5kaWRhdGUucmVhZGFiaWxpdHkuY29udGVudFNjb3JlICogMC4yO1xyXG5cclxuICAgICAgICAgIGlmIChzaWJsaW5nLnJlYWRhYmlsaXR5ICYmXHJcbiAgICAgICAgICAgICAgKChzaWJsaW5nLnJlYWRhYmlsaXR5LmNvbnRlbnRTY29yZSArIGNvbnRlbnRCb251cykgPj0gc2libGluZ1Njb3JlVGhyZXNob2xkKSkge1xyXG4gICAgICAgICAgICBhcHBlbmQgPSB0cnVlO1xyXG4gICAgICAgICAgfSBlbHNlIGlmIChzaWJsaW5nLm5vZGVOYW1lID09PSBcIlBcIikge1xyXG4gICAgICAgICAgICB2YXIgbGlua0RlbnNpdHkgPSB0aGlzLl9nZXRMaW5rRGVuc2l0eShzaWJsaW5nKTtcclxuICAgICAgICAgICAgdmFyIG5vZGVDb250ZW50ID0gdGhpcy5fZ2V0SW5uZXJUZXh0KHNpYmxpbmcpO1xyXG4gICAgICAgICAgICB2YXIgbm9kZUxlbmd0aCA9IG5vZGVDb250ZW50Lmxlbmd0aDtcclxuXHJcbiAgICAgICAgICAgIGlmIChub2RlTGVuZ3RoID4gODAgJiYgbGlua0RlbnNpdHkgPCAwLjI1KSB7XHJcbiAgICAgICAgICAgICAgYXBwZW5kID0gdHJ1ZTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChub2RlTGVuZ3RoIDwgODAgJiYgbm9kZUxlbmd0aCA+IDAgJiYgbGlua0RlbnNpdHkgPT09IDAgJiZcclxuICAgICAgICAgICAgICAgICAgICAgICBub2RlQ29udGVudC5zZWFyY2goL1xcLiggfCQpLykgIT09IC0xKSB7XHJcbiAgICAgICAgICAgICAgYXBwZW5kID0gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGFwcGVuZCkge1xyXG4gICAgICAgICAgdGhpcy5sb2coXCJBcHBlbmRpbmcgbm9kZTpcIiwgc2libGluZyk7XHJcblxyXG4gICAgICAgICAgaWYgKHRoaXMuQUxURVJfVE9fRElWX0VYQ0VQVElPTlMuaW5kZXhPZihzaWJsaW5nLm5vZGVOYW1lKSA9PT0gLTEpIHtcclxuICAgICAgICAgICAgLy8gV2UgaGF2ZSBhIG5vZGUgdGhhdCBpc24ndCBhIGNvbW1vbiBibG9jayBsZXZlbCBlbGVtZW50LCBsaWtlIGEgZm9ybSBvciB0ZCB0YWcuXHJcbiAgICAgICAgICAgIC8vIFR1cm4gaXQgaW50byBhIGRpdiBzbyBpdCBkb2Vzbid0IGdldCBmaWx0ZXJlZCBvdXQgbGF0ZXIgYnkgYWNjaWRlbnQuXHJcbiAgICAgICAgICAgIHRoaXMubG9nKFwiQWx0ZXJpbmcgc2libGluZzpcIiwgc2libGluZywgXCJ0byBkaXYuXCIpO1xyXG5cclxuICAgICAgICAgICAgc2libGluZyA9IHRoaXMuX3NldE5vZGVUYWcoc2libGluZywgXCJESVZcIik7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgYXJ0aWNsZUNvbnRlbnQuYXBwZW5kQ2hpbGQoc2libGluZyk7XHJcbiAgICAgICAgICAvLyBzaWJsaW5ncyBpcyBhIHJlZmVyZW5jZSB0byB0aGUgY2hpbGRyZW4gYXJyYXksIGFuZFxyXG4gICAgICAgICAgLy8gc2libGluZyBpcyByZW1vdmVkIGZyb20gdGhlIGFycmF5IHdoZW4gd2UgY2FsbCBhcHBlbmRDaGlsZCgpLlxyXG4gICAgICAgICAgLy8gQXMgYSByZXN1bHQsIHdlIG11c3QgcmV2aXNpdCB0aGlzIGluZGV4IHNpbmNlIHRoZSBub2Rlc1xyXG4gICAgICAgICAgLy8gaGF2ZSBiZWVuIHNoaWZ0ZWQuXHJcbiAgICAgICAgICBzIC09IDE7XHJcbiAgICAgICAgICBzbCAtPSAxO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKHRoaXMuX2RlYnVnKVxyXG4gICAgICAgIHRoaXMubG9nKFwiQXJ0aWNsZSBjb250ZW50IHByZS1wcmVwOiBcIiArIGFydGljbGVDb250ZW50LmlubmVySFRNTCk7XHJcbiAgICAgIC8vIFNvIHdlIGhhdmUgYWxsIG9mIHRoZSBjb250ZW50IHRoYXQgd2UgbmVlZC4gTm93IHdlIGNsZWFuIGl0IHVwIGZvciBwcmVzZW50YXRpb24uXHJcbiAgICAgIHRoaXMuX3ByZXBBcnRpY2xlKGFydGljbGVDb250ZW50KTtcclxuICAgICAgaWYgKHRoaXMuX2RlYnVnKVxyXG4gICAgICAgIHRoaXMubG9nKFwiQXJ0aWNsZSBjb250ZW50IHBvc3QtcHJlcDogXCIgKyBhcnRpY2xlQ29udGVudC5pbm5lckhUTUwpO1xyXG5cclxuICAgICAgaWYgKG5lZWRlZFRvQ3JlYXRlVG9wQ2FuZGlkYXRlKSB7XHJcbiAgICAgICAgLy8gV2UgYWxyZWFkeSBjcmVhdGVkIGEgZmFrZSBkaXYgdGhpbmcsIGFuZCB0aGVyZSB3b3VsZG4ndCBoYXZlIGJlZW4gYW55IHNpYmxpbmdzIGxlZnRcclxuICAgICAgICAvLyBmb3IgdGhlIHByZXZpb3VzIGxvb3AsIHNvIHRoZXJlJ3Mgbm8gcG9pbnQgdHJ5aW5nIHRvIGNyZWF0ZSBhIG5ldyBkaXYsIGFuZCB0aGVuXHJcbiAgICAgICAgLy8gbW92ZSBhbGwgdGhlIGNoaWxkcmVuIG92ZXIuIEp1c3QgYXNzaWduIElEcyBhbmQgY2xhc3MgbmFtZXMgaGVyZS4gTm8gbmVlZCB0byBhcHBlbmRcclxuICAgICAgICAvLyBiZWNhdXNlIHRoYXQgYWxyZWFkeSBoYXBwZW5lZCBhbnl3YXkuXHJcbiAgICAgICAgdG9wQ2FuZGlkYXRlLmlkID0gXCJyZWFkYWJpbGl0eS1wYWdlLTFcIjtcclxuICAgICAgICB0b3BDYW5kaWRhdGUuY2xhc3NOYW1lID0gXCJwYWdlXCI7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdmFyIGRpdiA9IGRvYy5jcmVhdGVFbGVtZW50KFwiRElWXCIpO1xyXG4gICAgICAgIGRpdi5pZCA9IFwicmVhZGFiaWxpdHktcGFnZS0xXCI7XHJcbiAgICAgICAgZGl2LmNsYXNzTmFtZSA9IFwicGFnZVwiO1xyXG4gICAgICAgIHZhciBjaGlsZHJlbiA9IGFydGljbGVDb250ZW50LmNoaWxkTm9kZXM7XHJcbiAgICAgICAgd2hpbGUgKGNoaWxkcmVuLmxlbmd0aCkge1xyXG4gICAgICAgICAgZGl2LmFwcGVuZENoaWxkKGNoaWxkcmVuWzBdKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgYXJ0aWNsZUNvbnRlbnQuYXBwZW5kQ2hpbGQoZGl2KTtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKHRoaXMuX2RlYnVnKVxyXG4gICAgICAgIHRoaXMubG9nKFwiQXJ0aWNsZSBjb250ZW50IGFmdGVyIHBhZ2luZzogXCIgKyBhcnRpY2xlQ29udGVudC5pbm5lckhUTUwpO1xyXG5cclxuICAgICAgdmFyIHBhcnNlU3VjY2Vzc2Z1bCA9IHRydWU7XHJcblxyXG4gICAgICAvLyBOb3cgdGhhdCB3ZSd2ZSBnb25lIHRocm91Z2ggdGhlIGZ1bGwgYWxnb3JpdGhtLCBjaGVjayB0byBzZWUgaWZcclxuICAgICAgLy8gd2UgZ290IGFueSBtZWFuaW5nZnVsIGNvbnRlbnQuIElmIHdlIGRpZG4ndCwgd2UgbWF5IG5lZWQgdG8gcmUtcnVuXHJcbiAgICAgIC8vIGdyYWJBcnRpY2xlIHdpdGggZGlmZmVyZW50IGZsYWdzIHNldC4gVGhpcyBnaXZlcyB1cyBhIGhpZ2hlciBsaWtlbGlob29kIG9mXHJcbiAgICAgIC8vIGZpbmRpbmcgdGhlIGNvbnRlbnQsIGFuZCB0aGUgc2lldmUgYXBwcm9hY2ggZ2l2ZXMgdXMgYSBoaWdoZXIgbGlrZWxpaG9vZCBvZlxyXG4gICAgICAvLyBmaW5kaW5nIHRoZSAtcmlnaHQtIGNvbnRlbnQuXHJcbiAgICAgIHZhciB0ZXh0TGVuZ3RoID0gdGhpcy5fZ2V0SW5uZXJUZXh0KGFydGljbGVDb250ZW50LCB0cnVlKS5sZW5ndGg7XHJcbiAgICAgIGlmICh0ZXh0TGVuZ3RoIDwgdGhpcy5fY2hhclRocmVzaG9sZCkge1xyXG4gICAgICAgIHBhcnNlU3VjY2Vzc2Z1bCA9IGZhbHNlO1xyXG4gICAgICAgIHBhZ2UuaW5uZXJIVE1MID0gcGFnZUNhY2hlSHRtbDtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMuX2ZsYWdJc0FjdGl2ZSh0aGlzLkZMQUdfU1RSSVBfVU5MSUtFTFlTKSkge1xyXG4gICAgICAgICAgdGhpcy5fcmVtb3ZlRmxhZyh0aGlzLkZMQUdfU1RSSVBfVU5MSUtFTFlTKTtcclxuICAgICAgICAgIHRoaXMuX2F0dGVtcHRzLnB1c2goe2FydGljbGVDb250ZW50OiBhcnRpY2xlQ29udGVudCwgdGV4dExlbmd0aDogdGV4dExlbmd0aH0pO1xyXG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5fZmxhZ0lzQWN0aXZlKHRoaXMuRkxBR19XRUlHSFRfQ0xBU1NFUykpIHtcclxuICAgICAgICAgIHRoaXMuX3JlbW92ZUZsYWcodGhpcy5GTEFHX1dFSUdIVF9DTEFTU0VTKTtcclxuICAgICAgICAgIHRoaXMuX2F0dGVtcHRzLnB1c2goe2FydGljbGVDb250ZW50OiBhcnRpY2xlQ29udGVudCwgdGV4dExlbmd0aDogdGV4dExlbmd0aH0pO1xyXG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5fZmxhZ0lzQWN0aXZlKHRoaXMuRkxBR19DTEVBTl9DT05ESVRJT05BTExZKSkge1xyXG4gICAgICAgICAgdGhpcy5fcmVtb3ZlRmxhZyh0aGlzLkZMQUdfQ0xFQU5fQ09ORElUSU9OQUxMWSk7XHJcbiAgICAgICAgICB0aGlzLl9hdHRlbXB0cy5wdXNoKHthcnRpY2xlQ29udGVudDogYXJ0aWNsZUNvbnRlbnQsIHRleHRMZW5ndGg6IHRleHRMZW5ndGh9KTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgdGhpcy5fYXR0ZW1wdHMucHVzaCh7YXJ0aWNsZUNvbnRlbnQ6IGFydGljbGVDb250ZW50LCB0ZXh0TGVuZ3RoOiB0ZXh0TGVuZ3RofSk7XHJcbiAgICAgICAgICAvLyBObyBsdWNrIGFmdGVyIHJlbW92aW5nIGZsYWdzLCBqdXN0IHJldHVybiB0aGUgbG9uZ2VzdCB0ZXh0IHdlIGZvdW5kIGR1cmluZyB0aGUgZGlmZmVyZW50IGxvb3BzXHJcbiAgICAgICAgICB0aGlzLl9hdHRlbXB0cy5zb3J0KGZ1bmN0aW9uIChhLCBiKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBhLnRleHRMZW5ndGggPCBiLnRleHRMZW5ndGg7XHJcbiAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAvLyBCdXQgZmlyc3QgY2hlY2sgaWYgd2UgYWN0dWFsbHkgaGF2ZSBzb21ldGhpbmdcclxuICAgICAgICAgIGlmICghdGhpcy5fYXR0ZW1wdHNbMF0udGV4dExlbmd0aCkge1xyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICBhcnRpY2xlQ29udGVudCA9IHRoaXMuX2F0dGVtcHRzWzBdLmFydGljbGVDb250ZW50O1xyXG4gICAgICAgICAgcGFyc2VTdWNjZXNzZnVsID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChwYXJzZVN1Y2Nlc3NmdWwpIHtcclxuICAgICAgICAvLyBGaW5kIG91dCB0ZXh0IGRpcmVjdGlvbiBmcm9tIGFuY2VzdG9ycyBvZiBmaW5hbCB0b3AgY2FuZGlkYXRlLlxyXG4gICAgICAgIHZhciBhbmNlc3RvcnMgPSBbcGFyZW50T2ZUb3BDYW5kaWRhdGUsIHRvcENhbmRpZGF0ZV0uY29uY2F0KHRoaXMuX2dldE5vZGVBbmNlc3RvcnMocGFyZW50T2ZUb3BDYW5kaWRhdGUpKTtcclxuICAgICAgICB0aGlzLl9zb21lTm9kZShhbmNlc3RvcnMsIGZ1bmN0aW9uKGFuY2VzdG9yKSB7XHJcbiAgICAgICAgICBpZiAoIWFuY2VzdG9yLnRhZ05hbWUpXHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgIHZhciBhcnRpY2xlRGlyID0gYW5jZXN0b3IuZ2V0QXR0cmlidXRlKFwiZGlyXCIpO1xyXG4gICAgICAgICAgaWYgKGFydGljbGVEaXIpIHtcclxuICAgICAgICAgICAgdGhpcy5fYXJ0aWNsZURpciA9IGFydGljbGVEaXI7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiBhcnRpY2xlQ29udGVudDtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIENoZWNrIHdoZXRoZXIgdGhlIGlucHV0IHN0cmluZyBjb3VsZCBiZSBhIGJ5bGluZS5cclxuICAgKiBUaGlzIHZlcmlmaWVzIHRoYXQgdGhlIGlucHV0IGlzIGEgc3RyaW5nLCBhbmQgdGhhdCB0aGUgbGVuZ3RoXHJcbiAgICogaXMgbGVzcyB0aGFuIDEwMCBjaGFycy5cclxuICAgKlxyXG4gICAqIEBwYXJhbSBwb3NzaWJsZUJ5bGluZSB7c3RyaW5nfSAtIGEgc3RyaW5nIHRvIGNoZWNrIHdoZXRoZXIgaXRzIGEgYnlsaW5lLlxyXG4gICAqIEByZXR1cm4gQm9vbGVhbiAtIHdoZXRoZXIgdGhlIGlucHV0IHN0cmluZyBpcyBhIGJ5bGluZS5cclxuICAgKi9cclxuICBfaXNWYWxpZEJ5bGluZTogZnVuY3Rpb24oYnlsaW5lKSB7XHJcbiAgICBpZiAodHlwZW9mIGJ5bGluZSA9PSBcInN0cmluZ1wiIHx8IGJ5bGluZSBpbnN0YW5jZW9mIFN0cmluZykge1xyXG4gICAgICBieWxpbmUgPSBieWxpbmUudHJpbSgpO1xyXG4gICAgICByZXR1cm4gKGJ5bGluZS5sZW5ndGggPiAwKSAmJiAoYnlsaW5lLmxlbmd0aCA8IDEwMCk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogQXR0ZW1wdHMgdG8gZ2V0IGV4Y2VycHQgYW5kIGJ5bGluZSBtZXRhZGF0YSBmb3IgdGhlIGFydGljbGUuXHJcbiAgICpcclxuICAgKiBAcmV0dXJuIE9iamVjdCB3aXRoIG9wdGlvbmFsIFwiZXhjZXJwdFwiIGFuZCBcImJ5bGluZVwiIHByb3BlcnRpZXNcclxuICAgKi9cclxuICBfZ2V0QXJ0aWNsZU1ldGFkYXRhOiBmdW5jdGlvbigpIHtcclxuICAgIHZhciBtZXRhZGF0YSA9IHt9O1xyXG4gICAgdmFyIHZhbHVlcyA9IHt9O1xyXG4gICAgdmFyIG1ldGFFbGVtZW50cyA9IHRoaXMuX2RvYy5nZXRFbGVtZW50c0J5VGFnTmFtZShcIm1ldGFcIik7XHJcblxyXG4gICAgLy8gTWF0Y2ggXCJkZXNjcmlwdGlvblwiLCBvciBUd2l0dGVyJ3MgXCJ0d2l0dGVyOmRlc2NyaXB0aW9uXCIgKENhcmRzKVxyXG4gICAgLy8gaW4gbmFtZSBhdHRyaWJ1dGUuXHJcbiAgICB2YXIgbmFtZVBhdHRlcm4gPSAvXlxccyooKHR3aXR0ZXIpXFxzKjpcXHMqKT8oZGVzY3JpcHRpb258dGl0bGUpXFxzKiQvZ2k7XHJcblxyXG4gICAgLy8gTWF0Y2ggRmFjZWJvb2sncyBPcGVuIEdyYXBoIHRpdGxlICYgZGVzY3JpcHRpb24gcHJvcGVydGllcy5cclxuICAgIHZhciBwcm9wZXJ0eVBhdHRlcm4gPSAvXlxccypvZ1xccyo6XFxzKihkZXNjcmlwdGlvbnx0aXRsZSlcXHMqJC9naTtcclxuXHJcbiAgICAvLyBGaW5kIGRlc2NyaXB0aW9uIHRhZ3MuXHJcbiAgICB0aGlzLl9mb3JFYWNoTm9kZShtZXRhRWxlbWVudHMsIGZ1bmN0aW9uKGVsZW1lbnQpIHtcclxuICAgICAgdmFyIGVsZW1lbnROYW1lID0gZWxlbWVudC5nZXRBdHRyaWJ1dGUoXCJuYW1lXCIpO1xyXG4gICAgICB2YXIgZWxlbWVudFByb3BlcnR5ID0gZWxlbWVudC5nZXRBdHRyaWJ1dGUoXCJwcm9wZXJ0eVwiKTtcclxuXHJcbiAgICAgIGlmIChbZWxlbWVudE5hbWUsIGVsZW1lbnRQcm9wZXJ0eV0uaW5kZXhPZihcImF1dGhvclwiKSAhPT0gLTEpIHtcclxuICAgICAgICBtZXRhZGF0YS5ieWxpbmUgPSBlbGVtZW50LmdldEF0dHJpYnV0ZShcImNvbnRlbnRcIik7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB2YXIgbmFtZSA9IG51bGw7XHJcbiAgICAgIGlmIChuYW1lUGF0dGVybi50ZXN0KGVsZW1lbnROYW1lKSkge1xyXG4gICAgICAgIG5hbWUgPSBlbGVtZW50TmFtZTtcclxuICAgICAgfSBlbHNlIGlmIChwcm9wZXJ0eVBhdHRlcm4udGVzdChlbGVtZW50UHJvcGVydHkpKSB7XHJcbiAgICAgICAgbmFtZSA9IGVsZW1lbnRQcm9wZXJ0eTtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKG5hbWUpIHtcclxuICAgICAgICB2YXIgY29udGVudCA9IGVsZW1lbnQuZ2V0QXR0cmlidXRlKFwiY29udGVudFwiKTtcclxuICAgICAgICBpZiAoY29udGVudCkge1xyXG4gICAgICAgICAgLy8gQ29udmVydCB0byBsb3dlcmNhc2UgYW5kIHJlbW92ZSBhbnkgd2hpdGVzcGFjZVxyXG4gICAgICAgICAgLy8gc28gd2UgY2FuIG1hdGNoIGJlbG93LlxyXG4gICAgICAgICAgbmFtZSA9IG5hbWUudG9Mb3dlckNhc2UoKS5yZXBsYWNlKC9cXHMvZywgXCJcIik7XHJcbiAgICAgICAgICB2YWx1ZXNbbmFtZV0gPSBjb250ZW50LnRyaW0oKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIGlmIChcImRlc2NyaXB0aW9uXCIgaW4gdmFsdWVzKSB7XHJcbiAgICAgIG1ldGFkYXRhLmV4Y2VycHQgPSB2YWx1ZXNbXCJkZXNjcmlwdGlvblwiXTtcclxuICAgIH0gZWxzZSBpZiAoXCJvZzpkZXNjcmlwdGlvblwiIGluIHZhbHVlcykge1xyXG4gICAgICAvLyBVc2UgZmFjZWJvb2sgb3BlbiBncmFwaCBkZXNjcmlwdGlvbi5cclxuICAgICAgbWV0YWRhdGEuZXhjZXJwdCA9IHZhbHVlc1tcIm9nOmRlc2NyaXB0aW9uXCJdO1xyXG4gICAgfSBlbHNlIGlmIChcInR3aXR0ZXI6ZGVzY3JpcHRpb25cIiBpbiB2YWx1ZXMpIHtcclxuICAgICAgLy8gVXNlIHR3aXR0ZXIgY2FyZHMgZGVzY3JpcHRpb24uXHJcbiAgICAgIG1ldGFkYXRhLmV4Y2VycHQgPSB2YWx1ZXNbXCJ0d2l0dGVyOmRlc2NyaXB0aW9uXCJdO1xyXG4gICAgfVxyXG5cclxuICAgIG1ldGFkYXRhLnRpdGxlID0gdGhpcy5fZ2V0QXJ0aWNsZVRpdGxlKCk7XHJcbiAgICBpZiAoIW1ldGFkYXRhLnRpdGxlKSB7XHJcbiAgICAgIGlmIChcIm9nOnRpdGxlXCIgaW4gdmFsdWVzKSB7XHJcbiAgICAgICAgLy8gVXNlIGZhY2Vib29rIG9wZW4gZ3JhcGggdGl0bGUuXHJcbiAgICAgICAgbWV0YWRhdGEudGl0bGUgPSB2YWx1ZXNbXCJvZzp0aXRsZVwiXTtcclxuICAgICAgfSBlbHNlIGlmIChcInR3aXR0ZXI6dGl0bGVcIiBpbiB2YWx1ZXMpIHtcclxuICAgICAgICAvLyBVc2UgdHdpdHRlciBjYXJkcyB0aXRsZS5cclxuICAgICAgICBtZXRhZGF0YS50aXRsZSA9IHZhbHVlc1tcInR3aXR0ZXI6dGl0bGVcIl07XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gbWV0YWRhdGE7XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogUmVtb3ZlcyBzY3JpcHQgdGFncyBmcm9tIHRoZSBkb2N1bWVudC5cclxuICAgKlxyXG4gICAqIEBwYXJhbSBFbGVtZW50XHJcbiAgKiovXHJcbiAgX3JlbW92ZVNjcmlwdHM6IGZ1bmN0aW9uKGRvYykge1xyXG4gICAgdGhpcy5fcmVtb3ZlTm9kZXMoZG9jLmdldEVsZW1lbnRzQnlUYWdOYW1lKFwic2NyaXB0XCIpLCBmdW5jdGlvbihzY3JpcHROb2RlKSB7XHJcbiAgICAgIHNjcmlwdE5vZGUubm9kZVZhbHVlID0gXCJcIjtcclxuICAgICAgc2NyaXB0Tm9kZS5yZW1vdmVBdHRyaWJ1dGUoXCJzcmNcIik7XHJcbiAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfSk7XHJcbiAgICB0aGlzLl9yZW1vdmVOb2Rlcyhkb2MuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJub3NjcmlwdFwiKSk7XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogQ2hlY2sgaWYgdGhpcyBub2RlIGhhcyBvbmx5IHdoaXRlc3BhY2UgYW5kIGEgc2luZ2xlIGVsZW1lbnQgd2l0aCBnaXZlbiB0YWdcclxuICAgKiBSZXR1cm5zIGZhbHNlIGlmIHRoZSBESVYgbm9kZSBjb250YWlucyBub24tZW1wdHkgdGV4dCBub2Rlc1xyXG4gICAqIG9yIGlmIGl0IGNvbnRhaW5zIG5vIGVsZW1lbnQgd2l0aCBnaXZlbiB0YWcgb3IgbW9yZSB0aGFuIDEgZWxlbWVudC5cclxuICAgKlxyXG4gICAqIEBwYXJhbSBFbGVtZW50XHJcbiAgICogQHBhcmFtIHN0cmluZyB0YWcgb2YgY2hpbGQgZWxlbWVudFxyXG4gICoqL1xyXG4gIF9oYXNTaW5nbGVUYWdJbnNpZGVFbGVtZW50OiBmdW5jdGlvbihlbGVtZW50LCB0YWcpIHtcclxuICAgIC8vIFRoZXJlIHNob3VsZCBiZSBleGFjdGx5IDEgZWxlbWVudCBjaGlsZCB3aXRoIGdpdmVuIHRhZ1xyXG4gICAgaWYgKGVsZW1lbnQuY2hpbGRyZW4ubGVuZ3RoICE9IDEgfHwgZWxlbWVudC5jaGlsZHJlblswXS50YWdOYW1lICE9PSB0YWcpIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIEFuZCB0aGVyZSBzaG91bGQgYmUgbm8gdGV4dCBub2RlcyB3aXRoIHJlYWwgY29udGVudFxyXG4gICAgcmV0dXJuICF0aGlzLl9zb21lTm9kZShlbGVtZW50LmNoaWxkTm9kZXMsIGZ1bmN0aW9uKG5vZGUpIHtcclxuICAgICAgcmV0dXJuIG5vZGUubm9kZVR5cGUgPT09IHRoaXMuVEVYVF9OT0RFICYmXHJcbiAgICAgICAgICAgICB0aGlzLlJFR0VYUFMuaGFzQ29udGVudC50ZXN0KG5vZGUudGV4dENvbnRlbnQpO1xyXG4gICAgfSk7XHJcbiAgfSxcclxuXHJcbiAgX2lzRWxlbWVudFdpdGhvdXRDb250ZW50OiBmdW5jdGlvbihub2RlKSB7XHJcbiAgICByZXR1cm4gbm9kZS5ub2RlVHlwZSA9PT0gdGhpcy5FTEVNRU5UX05PREUgJiZcclxuICAgICAgbm9kZS50ZXh0Q29udGVudC50cmltKCkubGVuZ3RoID09IDAgJiZcclxuICAgICAgKG5vZGUuY2hpbGRyZW4ubGVuZ3RoID09IDAgfHxcclxuICAgICAgIG5vZGUuY2hpbGRyZW4ubGVuZ3RoID09IG5vZGUuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJiclwiKS5sZW5ndGggKyBub2RlLmdldEVsZW1lbnRzQnlUYWdOYW1lKFwiaHJcIikubGVuZ3RoKTtcclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBEZXRlcm1pbmUgd2hldGhlciBlbGVtZW50IGhhcyBhbnkgY2hpbGRyZW4gYmxvY2sgbGV2ZWwgZWxlbWVudHMuXHJcbiAgICpcclxuICAgKiBAcGFyYW0gRWxlbWVudFxyXG4gICAqL1xyXG4gIF9oYXNDaGlsZEJsb2NrRWxlbWVudDogZnVuY3Rpb24gKGVsZW1lbnQpIHtcclxuICAgIHJldHVybiB0aGlzLl9zb21lTm9kZShlbGVtZW50LmNoaWxkTm9kZXMsIGZ1bmN0aW9uKG5vZGUpIHtcclxuICAgICAgcmV0dXJuIHRoaXMuRElWX1RPX1BfRUxFTVMuaW5kZXhPZihub2RlLnRhZ05hbWUpICE9PSAtMSB8fFxyXG4gICAgICAgICAgICAgdGhpcy5faGFzQ2hpbGRCbG9ja0VsZW1lbnQobm9kZSk7XHJcbiAgICB9KTtcclxuICB9LFxyXG5cclxuICAvKioqXHJcbiAgICogRGV0ZXJtaW5lIGlmIGEgbm9kZSBxdWFsaWZpZXMgYXMgcGhyYXNpbmcgY29udGVudC5cclxuICAgKiBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9HdWlkZS9IVE1ML0NvbnRlbnRfY2F0ZWdvcmllcyNQaHJhc2luZ19jb250ZW50XHJcbiAgKiovXHJcbiAgX2lzUGhyYXNpbmdDb250ZW50OiBmdW5jdGlvbihub2RlKSB7XHJcbiAgICByZXR1cm4gbm9kZS5ub2RlVHlwZSA9PT0gdGhpcy5URVhUX05PREUgfHwgdGhpcy5QSFJBU0lOR19FTEVNUy5pbmRleE9mKG5vZGUudGFnTmFtZSkgIT09IC0xIHx8XHJcbiAgICAgICgobm9kZS50YWdOYW1lID09PSBcIkFcIiB8fCBub2RlLnRhZ05hbWUgPT09IFwiREVMXCIgfHwgbm9kZS50YWdOYW1lID09PSBcIklOU1wiKSAmJlxyXG4gICAgICAgIHRoaXMuX2V2ZXJ5Tm9kZShub2RlLmNoaWxkTm9kZXMsIHRoaXMuX2lzUGhyYXNpbmdDb250ZW50KSk7XHJcbiAgfSxcclxuXHJcbiAgX2lzV2hpdGVzcGFjZTogZnVuY3Rpb24obm9kZSkge1xyXG4gICAgcmV0dXJuIChub2RlLm5vZGVUeXBlID09PSB0aGlzLlRFWFRfTk9ERSAmJiBub2RlLnRleHRDb250ZW50LnRyaW0oKS5sZW5ndGggPT09IDApIHx8XHJcbiAgICAgICAgICAgKG5vZGUubm9kZVR5cGUgPT09IHRoaXMuRUxFTUVOVF9OT0RFICYmIG5vZGUudGFnTmFtZSA9PT0gXCJCUlwiKTtcclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBHZXQgdGhlIGlubmVyIHRleHQgb2YgYSBub2RlIC0gY3Jvc3MgYnJvd3NlciBjb21wYXRpYmx5LlxyXG4gICAqIFRoaXMgYWxzbyBzdHJpcHMgb3V0IGFueSBleGNlc3Mgd2hpdGVzcGFjZSB0byBiZSBmb3VuZC5cclxuICAgKlxyXG4gICAqIEBwYXJhbSBFbGVtZW50XHJcbiAgICogQHBhcmFtIEJvb2xlYW4gbm9ybWFsaXplU3BhY2VzIChkZWZhdWx0OiB0cnVlKVxyXG4gICAqIEByZXR1cm4gc3RyaW5nXHJcbiAgKiovXHJcbiAgX2dldElubmVyVGV4dDogZnVuY3Rpb24oZSwgbm9ybWFsaXplU3BhY2VzKSB7XHJcbiAgICBub3JtYWxpemVTcGFjZXMgPSAodHlwZW9mIG5vcm1hbGl6ZVNwYWNlcyA9PT0gXCJ1bmRlZmluZWRcIikgPyB0cnVlIDogbm9ybWFsaXplU3BhY2VzO1xyXG4gICAgdmFyIHRleHRDb250ZW50ID0gZS50ZXh0Q29udGVudC50cmltKCk7XHJcblxyXG4gICAgaWYgKG5vcm1hbGl6ZVNwYWNlcykge1xyXG4gICAgICByZXR1cm4gdGV4dENvbnRlbnQucmVwbGFjZSh0aGlzLlJFR0VYUFMubm9ybWFsaXplLCBcIiBcIik7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdGV4dENvbnRlbnQ7XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogR2V0IHRoZSBudW1iZXIgb2YgdGltZXMgYSBzdHJpbmcgcyBhcHBlYXJzIGluIHRoZSBub2RlIGUuXHJcbiAgICpcclxuICAgKiBAcGFyYW0gRWxlbWVudFxyXG4gICAqIEBwYXJhbSBzdHJpbmcgLSB3aGF0IHRvIHNwbGl0IG9uLiBEZWZhdWx0IGlzIFwiLFwiXHJcbiAgICogQHJldHVybiBudW1iZXIgKGludGVnZXIpXHJcbiAgKiovXHJcbiAgX2dldENoYXJDb3VudDogZnVuY3Rpb24oZSwgcykge1xyXG4gICAgcyA9IHMgfHwgXCIsXCI7XHJcbiAgICByZXR1cm4gdGhpcy5fZ2V0SW5uZXJUZXh0KGUpLnNwbGl0KHMpLmxlbmd0aCAtIDE7XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogUmVtb3ZlIHRoZSBzdHlsZSBhdHRyaWJ1dGUgb24gZXZlcnkgZSBhbmQgdW5kZXIuXHJcbiAgICogVE9ETzogVGVzdCBpZiBnZXRFbGVtZW50c0J5VGFnTmFtZSgqKSBpcyBmYXN0ZXIuXHJcbiAgICpcclxuICAgKiBAcGFyYW0gRWxlbWVudFxyXG4gICAqIEByZXR1cm4gdm9pZFxyXG4gICoqL1xyXG4gIF9jbGVhblN0eWxlczogZnVuY3Rpb24oZSkge1xyXG4gICAgaWYgKCFlIHx8IGUudGFnTmFtZS50b0xvd2VyQ2FzZSgpID09PSBcInN2Z1wiKVxyXG4gICAgICByZXR1cm47XHJcblxyXG4gICAgLy8gUmVtb3ZlIGBzdHlsZWAgYW5kIGRlcHJlY2F0ZWQgcHJlc2VudGF0aW9uYWwgYXR0cmlidXRlc1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLlBSRVNFTlRBVElPTkFMX0FUVFJJQlVURVMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgZS5yZW1vdmVBdHRyaWJ1dGUodGhpcy5QUkVTRU5UQVRJT05BTF9BVFRSSUJVVEVTW2ldKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAodGhpcy5ERVBSRUNBVEVEX1NJWkVfQVRUUklCVVRFX0VMRU1TLmluZGV4T2YoZS50YWdOYW1lKSAhPT0gLTEpIHtcclxuICAgICAgZS5yZW1vdmVBdHRyaWJ1dGUoXCJ3aWR0aFwiKTtcclxuICAgICAgZS5yZW1vdmVBdHRyaWJ1dGUoXCJoZWlnaHRcIik7XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIGN1ciA9IGUuZmlyc3RFbGVtZW50Q2hpbGQ7XHJcbiAgICB3aGlsZSAoY3VyICE9PSBudWxsKSB7XHJcbiAgICAgIHRoaXMuX2NsZWFuU3R5bGVzKGN1cik7XHJcbiAgICAgIGN1ciA9IGN1ci5uZXh0RWxlbWVudFNpYmxpbmc7XHJcbiAgICB9XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogR2V0IHRoZSBkZW5zaXR5IG9mIGxpbmtzIGFzIGEgcGVyY2VudGFnZSBvZiB0aGUgY29udGVudFxyXG4gICAqIFRoaXMgaXMgdGhlIGFtb3VudCBvZiB0ZXh0IHRoYXQgaXMgaW5zaWRlIGEgbGluayBkaXZpZGVkIGJ5IHRoZSB0b3RhbCB0ZXh0IGluIHRoZSBub2RlLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIEVsZW1lbnRcclxuICAgKiBAcmV0dXJuIG51bWJlciAoZmxvYXQpXHJcbiAgKiovXHJcbiAgX2dldExpbmtEZW5zaXR5OiBmdW5jdGlvbihlbGVtZW50KSB7XHJcbiAgICB2YXIgdGV4dExlbmd0aCA9IHRoaXMuX2dldElubmVyVGV4dChlbGVtZW50KS5sZW5ndGg7XHJcbiAgICBpZiAodGV4dExlbmd0aCA9PT0gMClcclxuICAgICAgcmV0dXJuIDA7XHJcblxyXG4gICAgdmFyIGxpbmtMZW5ndGggPSAwO1xyXG5cclxuICAgIC8vIFhYWCBpbXBsZW1lbnQgX3JlZHVjZU5vZGVMaXN0P1xyXG4gICAgdGhpcy5fZm9yRWFjaE5vZGUoZWxlbWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZShcImFcIiksIGZ1bmN0aW9uKGxpbmtOb2RlKSB7XHJcbiAgICAgIGxpbmtMZW5ndGggKz0gdGhpcy5fZ2V0SW5uZXJUZXh0KGxpbmtOb2RlKS5sZW5ndGg7XHJcbiAgICB9KTtcclxuXHJcbiAgICByZXR1cm4gbGlua0xlbmd0aCAvIHRleHRMZW5ndGg7XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogR2V0IGFuIGVsZW1lbnRzIGNsYXNzL2lkIHdlaWdodC4gVXNlcyByZWd1bGFyIGV4cHJlc3Npb25zIHRvIHRlbGwgaWYgdGhpc1xyXG4gICAqIGVsZW1lbnQgbG9va3MgZ29vZCBvciBiYWQuXHJcbiAgICpcclxuICAgKiBAcGFyYW0gRWxlbWVudFxyXG4gICAqIEByZXR1cm4gbnVtYmVyIChJbnRlZ2VyKVxyXG4gICoqL1xyXG4gIF9nZXRDbGFzc1dlaWdodDogZnVuY3Rpb24oZSkge1xyXG4gICAgaWYgKCF0aGlzLl9mbGFnSXNBY3RpdmUodGhpcy5GTEFHX1dFSUdIVF9DTEFTU0VTKSlcclxuICAgICAgcmV0dXJuIDA7XHJcblxyXG4gICAgdmFyIHdlaWdodCA9IDA7XHJcblxyXG4gICAgLy8gTG9vayBmb3IgYSBzcGVjaWFsIGNsYXNzbmFtZVxyXG4gICAgaWYgKHR5cGVvZihlLmNsYXNzTmFtZSkgPT09IFwic3RyaW5nXCIgJiYgZS5jbGFzc05hbWUgIT09IFwiXCIpIHtcclxuICAgICAgaWYgKHRoaXMuUkVHRVhQUy5uZWdhdGl2ZS50ZXN0KGUuY2xhc3NOYW1lKSlcclxuICAgICAgICB3ZWlnaHQgLT0gMjU7XHJcblxyXG4gICAgICBpZiAodGhpcy5SRUdFWFBTLnBvc2l0aXZlLnRlc3QoZS5jbGFzc05hbWUpKVxyXG4gICAgICAgIHdlaWdodCArPSAyNTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBMb29rIGZvciBhIHNwZWNpYWwgSURcclxuICAgIGlmICh0eXBlb2YoZS5pZCkgPT09IFwic3RyaW5nXCIgJiYgZS5pZCAhPT0gXCJcIikge1xyXG4gICAgICBpZiAodGhpcy5SRUdFWFBTLm5lZ2F0aXZlLnRlc3QoZS5pZCkpXHJcbiAgICAgICAgd2VpZ2h0IC09IDI1O1xyXG5cclxuICAgICAgaWYgKHRoaXMuUkVHRVhQUy5wb3NpdGl2ZS50ZXN0KGUuaWQpKVxyXG4gICAgICAgIHdlaWdodCArPSAyNTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gd2VpZ2h0O1xyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIENsZWFuIGEgbm9kZSBvZiBhbGwgZWxlbWVudHMgb2YgdHlwZSBcInRhZ1wiLlxyXG4gICAqIChVbmxlc3MgaXQncyBhIHlvdXR1YmUvdmltZW8gdmlkZW8uIFBlb3BsZSBsb3ZlIG1vdmllcy4pXHJcbiAgICpcclxuICAgKiBAcGFyYW0gRWxlbWVudFxyXG4gICAqIEBwYXJhbSBzdHJpbmcgdGFnIHRvIGNsZWFuXHJcbiAgICogQHJldHVybiB2b2lkXHJcbiAgICoqL1xyXG4gIF9jbGVhbjogZnVuY3Rpb24oZSwgdGFnKSB7XHJcbiAgICB2YXIgaXNFbWJlZCA9IFtcIm9iamVjdFwiLCBcImVtYmVkXCIsIFwiaWZyYW1lXCJdLmluZGV4T2YodGFnKSAhPT0gLTE7XHJcblxyXG4gICAgdGhpcy5fcmVtb3ZlTm9kZXMoZS5nZXRFbGVtZW50c0J5VGFnTmFtZSh0YWcpLCBmdW5jdGlvbihlbGVtZW50KSB7XHJcbiAgICAgIC8vIEFsbG93IHlvdXR1YmUgYW5kIHZpbWVvIHZpZGVvcyB0aHJvdWdoIGFzIHBlb3BsZSB1c3VhbGx5IHdhbnQgdG8gc2VlIHRob3NlLlxyXG4gICAgICBpZiAoaXNFbWJlZCkge1xyXG4gICAgICAgIHZhciBhdHRyaWJ1dGVWYWx1ZXMgPSBbXS5tYXAuY2FsbChlbGVtZW50LmF0dHJpYnV0ZXMsIGZ1bmN0aW9uKGF0dHIpIHtcclxuICAgICAgICAgIHJldHVybiBhdHRyLnZhbHVlO1xyXG4gICAgICAgIH0pLmpvaW4oXCJ8XCIpO1xyXG5cclxuICAgICAgICAvLyBGaXJzdCwgY2hlY2sgdGhlIGVsZW1lbnRzIGF0dHJpYnV0ZXMgdG8gc2VlIGlmIGFueSBvZiB0aGVtIGNvbnRhaW4geW91dHViZSBvciB2aW1lb1xyXG4gICAgICAgIGlmICh0aGlzLlJFR0VYUFMudmlkZW9zLnRlc3QoYXR0cmlidXRlVmFsdWVzKSlcclxuICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuXHJcbiAgICAgICAgLy8gVGhlbiBjaGVjayB0aGUgZWxlbWVudHMgaW5zaWRlIHRoaXMgZWxlbWVudCBmb3IgdGhlIHNhbWUuXHJcbiAgICAgICAgaWYgKHRoaXMuUkVHRVhQUy52aWRlb3MudGVzdChlbGVtZW50LmlubmVySFRNTCkpXHJcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfSk7XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogQ2hlY2sgaWYgYSBnaXZlbiBub2RlIGhhcyBvbmUgb2YgaXRzIGFuY2VzdG9yIHRhZyBuYW1lIG1hdGNoaW5nIHRoZVxyXG4gICAqIHByb3ZpZGVkIG9uZS5cclxuICAgKiBAcGFyYW0gIEhUTUxFbGVtZW50IG5vZGVcclxuICAgKiBAcGFyYW0gIFN0cmluZyAgICAgIHRhZ05hbWVcclxuICAgKiBAcGFyYW0gIE51bWJlciAgICAgIG1heERlcHRoXHJcbiAgICogQHBhcmFtICBGdW5jdGlvbiAgICBmaWx0ZXJGbiBhIGZpbHRlciB0byBpbnZva2UgdG8gZGV0ZXJtaW5lIHdoZXRoZXIgdGhpcyBub2RlICdjb3VudHMnXHJcbiAgICogQHJldHVybiBCb29sZWFuXHJcbiAgICovXHJcbiAgX2hhc0FuY2VzdG9yVGFnOiBmdW5jdGlvbihub2RlLCB0YWdOYW1lLCBtYXhEZXB0aCwgZmlsdGVyRm4pIHtcclxuICAgIG1heERlcHRoID0gbWF4RGVwdGggfHwgMztcclxuICAgIHRhZ05hbWUgPSB0YWdOYW1lLnRvVXBwZXJDYXNlKCk7XHJcbiAgICB2YXIgZGVwdGggPSAwO1xyXG4gICAgd2hpbGUgKG5vZGUucGFyZW50Tm9kZSkge1xyXG4gICAgICBpZiAobWF4RGVwdGggPiAwICYmIGRlcHRoID4gbWF4RGVwdGgpXHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICBpZiAobm9kZS5wYXJlbnROb2RlLnRhZ05hbWUgPT09IHRhZ05hbWUgJiYgKCFmaWx0ZXJGbiB8fCBmaWx0ZXJGbihub2RlLnBhcmVudE5vZGUpKSlcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgbm9kZSA9IG5vZGUucGFyZW50Tm9kZTtcclxuICAgICAgZGVwdGgrKztcclxuICAgIH1cclxuICAgIHJldHVybiBmYWxzZTtcclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm4gYW4gb2JqZWN0IGluZGljYXRpbmcgaG93IG1hbnkgcm93cyBhbmQgY29sdW1ucyB0aGlzIHRhYmxlIGhhcy5cclxuICAgKi9cclxuICBfZ2V0Um93QW5kQ29sdW1uQ291bnQ6IGZ1bmN0aW9uKHRhYmxlKSB7XHJcbiAgICB2YXIgcm93cyA9IDA7XHJcbiAgICB2YXIgY29sdW1ucyA9IDA7XHJcbiAgICB2YXIgdHJzID0gdGFibGUuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJ0clwiKTtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdHJzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgIHZhciByb3dzcGFuID0gdHJzW2ldLmdldEF0dHJpYnV0ZShcInJvd3NwYW5cIikgfHwgMDtcclxuICAgICAgaWYgKHJvd3NwYW4pIHtcclxuICAgICAgICByb3dzcGFuID0gcGFyc2VJbnQocm93c3BhbiwgMTApO1xyXG4gICAgICB9XHJcbiAgICAgIHJvd3MgKz0gKHJvd3NwYW4gfHwgMSk7XHJcblxyXG4gICAgICAvLyBOb3cgbG9vayBmb3IgY29sdW1uLXJlbGF0ZWQgaW5mb1xyXG4gICAgICB2YXIgY29sdW1uc0luVGhpc1JvdyA9IDA7XHJcbiAgICAgIHZhciBjZWxscyA9IHRyc1tpXS5nZXRFbGVtZW50c0J5VGFnTmFtZShcInRkXCIpO1xyXG4gICAgICBmb3IgKHZhciBqID0gMDsgaiA8IGNlbGxzLmxlbmd0aDsgaisrKSB7XHJcbiAgICAgICAgdmFyIGNvbHNwYW4gPSBjZWxsc1tqXS5nZXRBdHRyaWJ1dGUoXCJjb2xzcGFuXCIpIHx8IDA7XHJcbiAgICAgICAgaWYgKGNvbHNwYW4pIHtcclxuICAgICAgICAgIGNvbHNwYW4gPSBwYXJzZUludChjb2xzcGFuLCAxMCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbHVtbnNJblRoaXNSb3cgKz0gKGNvbHNwYW4gfHwgMSk7XHJcbiAgICAgIH1cclxuICAgICAgY29sdW1ucyA9IE1hdGgubWF4KGNvbHVtbnMsIGNvbHVtbnNJblRoaXNSb3cpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHtyb3dzOiByb3dzLCBjb2x1bW5zOiBjb2x1bW5zfTtcclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBMb29rIGZvciAnZGF0YScgKGFzIG9wcG9zZWQgdG8gJ2xheW91dCcpIHRhYmxlcywgZm9yIHdoaWNoIHdlIHVzZVxyXG4gICAqIHNpbWlsYXIgY2hlY2tzIGFzXHJcbiAgICogaHR0cHM6Ly9keHIubW96aWxsYS5vcmcvbW96aWxsYS1jZW50cmFsL3Jldi83MTIyNDA0OWMwYjUyYWIxOTA1NjRkM2VhMGVhYjA4OWExNTlhNGNmL2FjY2Vzc2libGUvaHRtbC9IVE1MVGFibGVBY2Nlc3NpYmxlLmNwcCM5MjBcclxuICAgKi9cclxuICBfbWFya0RhdGFUYWJsZXM6IGZ1bmN0aW9uKHJvb3QpIHtcclxuICAgIHZhciB0YWJsZXMgPSByb290LmdldEVsZW1lbnRzQnlUYWdOYW1lKFwidGFibGVcIik7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRhYmxlcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICB2YXIgdGFibGUgPSB0YWJsZXNbaV07XHJcbiAgICAgIHZhciByb2xlID0gdGFibGUuZ2V0QXR0cmlidXRlKFwicm9sZVwiKTtcclxuICAgICAgaWYgKHJvbGUgPT0gXCJwcmVzZW50YXRpb25cIikge1xyXG4gICAgICAgIHRhYmxlLl9yZWFkYWJpbGl0eURhdGFUYWJsZSA9IGZhbHNlO1xyXG4gICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICB9XHJcbiAgICAgIHZhciBkYXRhdGFibGUgPSB0YWJsZS5nZXRBdHRyaWJ1dGUoXCJkYXRhdGFibGVcIik7XHJcbiAgICAgIGlmIChkYXRhdGFibGUgPT0gXCIwXCIpIHtcclxuICAgICAgICB0YWJsZS5fcmVhZGFiaWxpdHlEYXRhVGFibGUgPSBmYWxzZTtcclxuICAgICAgICBjb250aW51ZTtcclxuICAgICAgfVxyXG4gICAgICB2YXIgc3VtbWFyeSA9IHRhYmxlLmdldEF0dHJpYnV0ZShcInN1bW1hcnlcIik7XHJcbiAgICAgIGlmIChzdW1tYXJ5KSB7XHJcbiAgICAgICAgdGFibGUuX3JlYWRhYmlsaXR5RGF0YVRhYmxlID0gdHJ1ZTtcclxuICAgICAgICBjb250aW51ZTtcclxuICAgICAgfVxyXG5cclxuICAgICAgdmFyIGNhcHRpb24gPSB0YWJsZS5nZXRFbGVtZW50c0J5VGFnTmFtZShcImNhcHRpb25cIilbMF07XHJcbiAgICAgIGlmIChjYXB0aW9uICYmIGNhcHRpb24uY2hpbGROb2Rlcy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgdGFibGUuX3JlYWRhYmlsaXR5RGF0YVRhYmxlID0gdHJ1ZTtcclxuICAgICAgICBjb250aW51ZTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gSWYgdGhlIHRhYmxlIGhhcyBhIGRlc2NlbmRhbnQgd2l0aCBhbnkgb2YgdGhlc2UgdGFncywgY29uc2lkZXIgYSBkYXRhIHRhYmxlOlxyXG4gICAgICB2YXIgZGF0YVRhYmxlRGVzY2VuZGFudHMgPSBbXCJjb2xcIiwgXCJjb2xncm91cFwiLCBcInRmb290XCIsIFwidGhlYWRcIiwgXCJ0aFwiXTtcclxuICAgICAgdmFyIGRlc2NlbmRhbnRFeGlzdHMgPSBmdW5jdGlvbih0YWcpIHtcclxuICAgICAgICByZXR1cm4gISF0YWJsZS5nZXRFbGVtZW50c0J5VGFnTmFtZSh0YWcpWzBdO1xyXG4gICAgICB9O1xyXG4gICAgICBpZiAoZGF0YVRhYmxlRGVzY2VuZGFudHMuc29tZShkZXNjZW5kYW50RXhpc3RzKSkge1xyXG4gICAgICAgIHRoaXMubG9nKFwiRGF0YSB0YWJsZSBiZWNhdXNlIGZvdW5kIGRhdGEteSBkZXNjZW5kYW50XCIpO1xyXG4gICAgICAgIHRhYmxlLl9yZWFkYWJpbGl0eURhdGFUYWJsZSA9IHRydWU7XHJcbiAgICAgICAgY29udGludWU7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIE5lc3RlZCB0YWJsZXMgaW5kaWNhdGUgYSBsYXlvdXQgdGFibGU6XHJcbiAgICAgIGlmICh0YWJsZS5nZXRFbGVtZW50c0J5VGFnTmFtZShcInRhYmxlXCIpWzBdKSB7XHJcbiAgICAgICAgdGFibGUuX3JlYWRhYmlsaXR5RGF0YVRhYmxlID0gZmFsc2U7XHJcbiAgICAgICAgY29udGludWU7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHZhciBzaXplSW5mbyA9IHRoaXMuX2dldFJvd0FuZENvbHVtbkNvdW50KHRhYmxlKTtcclxuICAgICAgaWYgKHNpemVJbmZvLnJvd3MgPj0gMTAgfHwgc2l6ZUluZm8uY29sdW1ucyA+IDQpIHtcclxuICAgICAgICB0YWJsZS5fcmVhZGFiaWxpdHlEYXRhVGFibGUgPSB0cnVlO1xyXG4gICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICB9XHJcbiAgICAgIC8vIE5vdyBqdXN0IGdvIGJ5IHNpemUgZW50aXJlbHk6XHJcbiAgICAgIHRhYmxlLl9yZWFkYWJpbGl0eURhdGFUYWJsZSA9IHNpemVJbmZvLnJvd3MgKiBzaXplSW5mby5jb2x1bW5zID4gMTA7XHJcbiAgICB9XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogQ2xlYW4gYW4gZWxlbWVudCBvZiBhbGwgdGFncyBvZiB0eXBlIFwidGFnXCIgaWYgdGhleSBsb29rIGZpc2h5LlxyXG4gICAqIFwiRmlzaHlcIiBpcyBhbiBhbGdvcml0aG0gYmFzZWQgb24gY29udGVudCBsZW5ndGgsIGNsYXNzbmFtZXMsIGxpbmsgZGVuc2l0eSwgbnVtYmVyIG9mIGltYWdlcyAmIGVtYmVkcywgZXRjLlxyXG4gICAqXHJcbiAgICogQHJldHVybiB2b2lkXHJcbiAgICoqL1xyXG4gIF9jbGVhbkNvbmRpdGlvbmFsbHk6IGZ1bmN0aW9uKGUsIHRhZykge1xyXG4gICAgaWYgKCF0aGlzLl9mbGFnSXNBY3RpdmUodGhpcy5GTEFHX0NMRUFOX0NPTkRJVElPTkFMTFkpKVxyXG4gICAgICByZXR1cm47XHJcblxyXG4gICAgdmFyIGlzTGlzdCA9IHRhZyA9PT0gXCJ1bFwiIHx8IHRhZyA9PT0gXCJvbFwiO1xyXG5cclxuICAgIC8vIEdhdGhlciBjb3VudHMgZm9yIG90aGVyIHR5cGljYWwgZWxlbWVudHMgZW1iZWRkZWQgd2l0aGluLlxyXG4gICAgLy8gVHJhdmVyc2UgYmFja3dhcmRzIHNvIHdlIGNhbiByZW1vdmUgbm9kZXMgYXQgdGhlIHNhbWUgdGltZVxyXG4gICAgLy8gd2l0aG91dCBlZmZlY3RpbmcgdGhlIHRyYXZlcnNhbC5cclxuICAgIC8vXHJcbiAgICAvLyBUT0RPOiBDb25zaWRlciB0YWtpbmcgaW50byBhY2NvdW50IG9yaWdpbmFsIGNvbnRlbnRTY29yZSBoZXJlLlxyXG4gICAgdGhpcy5fcmVtb3ZlTm9kZXMoZS5nZXRFbGVtZW50c0J5VGFnTmFtZSh0YWcpLCBmdW5jdGlvbihub2RlKSB7XHJcbiAgICAgIC8vIEZpcnN0IGNoZWNrIGlmIHdlJ3JlIGluIGEgZGF0YSB0YWJsZSwgaW4gd2hpY2ggY2FzZSBkb24ndCByZW1vdmUgdXMuXHJcbiAgICAgIHZhciBpc0RhdGFUYWJsZSA9IGZ1bmN0aW9uKHQpIHtcclxuICAgICAgICByZXR1cm4gdC5fcmVhZGFiaWxpdHlEYXRhVGFibGU7XHJcbiAgICAgIH07XHJcblxyXG4gICAgICBpZiAodGhpcy5faGFzQW5jZXN0b3JUYWcobm9kZSwgXCJ0YWJsZVwiLCAtMSwgaXNEYXRhVGFibGUpKSB7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB2YXIgd2VpZ2h0ID0gdGhpcy5fZ2V0Q2xhc3NXZWlnaHQobm9kZSk7XHJcbiAgICAgIHZhciBjb250ZW50U2NvcmUgPSAwO1xyXG5cclxuICAgICAgdGhpcy5sb2coXCJDbGVhbmluZyBDb25kaXRpb25hbGx5XCIsIG5vZGUpO1xyXG5cclxuICAgICAgaWYgKHdlaWdodCArIGNvbnRlbnRTY29yZSA8IDApIHtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKHRoaXMuX2dldENoYXJDb3VudChub2RlLCBcIixcIikgPCAxMCkge1xyXG4gICAgICAgIC8vIElmIHRoZXJlIGFyZSBub3QgdmVyeSBtYW55IGNvbW1hcywgYW5kIHRoZSBudW1iZXIgb2ZcclxuICAgICAgICAvLyBub24tcGFyYWdyYXBoIGVsZW1lbnRzIGlzIG1vcmUgdGhhbiBwYXJhZ3JhcGhzIG9yIG90aGVyXHJcbiAgICAgICAgLy8gb21pbm91cyBzaWducywgcmVtb3ZlIHRoZSBlbGVtZW50LlxyXG4gICAgICAgIHZhciBwID0gbm9kZS5nZXRFbGVtZW50c0J5VGFnTmFtZShcInBcIikubGVuZ3RoO1xyXG4gICAgICAgIHZhciBpbWcgPSBub2RlLmdldEVsZW1lbnRzQnlUYWdOYW1lKFwiaW1nXCIpLmxlbmd0aDtcclxuICAgICAgICB2YXIgbGkgPSBub2RlLmdldEVsZW1lbnRzQnlUYWdOYW1lKFwibGlcIikubGVuZ3RoIC0gMTAwO1xyXG4gICAgICAgIHZhciBpbnB1dCA9IG5vZGUuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJpbnB1dFwiKS5sZW5ndGg7XHJcblxyXG4gICAgICAgIHZhciBlbWJlZENvdW50ID0gMDtcclxuICAgICAgICB2YXIgZW1iZWRzID0gbm9kZS5nZXRFbGVtZW50c0J5VGFnTmFtZShcImVtYmVkXCIpO1xyXG4gICAgICAgIGZvciAodmFyIGVpID0gMCwgaWwgPSBlbWJlZHMubGVuZ3RoOyBlaSA8IGlsOyBlaSArPSAxKSB7XHJcbiAgICAgICAgICBpZiAoIXRoaXMuUkVHRVhQUy52aWRlb3MudGVzdChlbWJlZHNbZWldLnNyYykpXHJcbiAgICAgICAgICAgIGVtYmVkQ291bnQgKz0gMTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHZhciBsaW5rRGVuc2l0eSA9IHRoaXMuX2dldExpbmtEZW5zaXR5KG5vZGUpO1xyXG4gICAgICAgIHZhciBjb250ZW50TGVuZ3RoID0gdGhpcy5fZ2V0SW5uZXJUZXh0KG5vZGUpLmxlbmd0aDtcclxuXHJcbiAgICAgICAgdmFyIGhhdmVUb1JlbW92ZSA9XHJcbiAgICAgICAgICAoaW1nID4gMSAmJiBwIC8gaW1nIDwgMC41ICYmICF0aGlzLl9oYXNBbmNlc3RvclRhZyhub2RlLCBcImZpZ3VyZVwiKSkgfHxcclxuICAgICAgICAgICghaXNMaXN0ICYmIGxpID4gcCkgfHxcclxuICAgICAgICAgIChpbnB1dCA+IE1hdGguZmxvb3IocC8zKSkgfHxcclxuICAgICAgICAgICghaXNMaXN0ICYmIGNvbnRlbnRMZW5ndGggPCAyNSAmJiAoaW1nID09PSAwIHx8IGltZyA+IDIpICYmICF0aGlzLl9oYXNBbmNlc3RvclRhZyhub2RlLCBcImZpZ3VyZVwiKSkgfHxcclxuICAgICAgICAgICghaXNMaXN0ICYmIHdlaWdodCA8IDI1ICYmIGxpbmtEZW5zaXR5ID4gMC4yKSB8fFxyXG4gICAgICAgICAgKHdlaWdodCA+PSAyNSAmJiBsaW5rRGVuc2l0eSA+IDAuNSkgfHxcclxuICAgICAgICAgICgoZW1iZWRDb3VudCA9PT0gMSAmJiBjb250ZW50TGVuZ3RoIDwgNzUpIHx8IGVtYmVkQ291bnQgPiAxKTtcclxuICAgICAgICByZXR1cm4gaGF2ZVRvUmVtb3ZlO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH0pO1xyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIENsZWFuIG91dCBlbGVtZW50cyB3aG9zZSBpZC9jbGFzcyBjb21iaW5hdGlvbnMgbWF0Y2ggc3BlY2lmaWMgc3RyaW5nLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIEVsZW1lbnRcclxuICAgKiBAcGFyYW0gUmVnRXhwIG1hdGNoIGlkL2NsYXNzIGNvbWJpbmF0aW9uLlxyXG4gICAqIEByZXR1cm4gdm9pZFxyXG4gICAqKi9cclxuICBfY2xlYW5NYXRjaGVkTm9kZXM6IGZ1bmN0aW9uKGUsIHJlZ2V4KSB7XHJcbiAgICB2YXIgZW5kT2ZTZWFyY2hNYXJrZXJOb2RlID0gdGhpcy5fZ2V0TmV4dE5vZGUoZSwgdHJ1ZSk7XHJcbiAgICB2YXIgbmV4dCA9IHRoaXMuX2dldE5leHROb2RlKGUpO1xyXG4gICAgd2hpbGUgKG5leHQgJiYgbmV4dCAhPSBlbmRPZlNlYXJjaE1hcmtlck5vZGUpIHtcclxuICAgICAgaWYgKHJlZ2V4LnRlc3QobmV4dC5jbGFzc05hbWUgKyBcIiBcIiArIG5leHQuaWQpKSB7XHJcbiAgICAgICAgbmV4dCA9IHRoaXMuX3JlbW92ZUFuZEdldE5leHQobmV4dCk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgbmV4dCA9IHRoaXMuX2dldE5leHROb2RlKG5leHQpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogQ2xlYW4gb3V0IHNwdXJpb3VzIGhlYWRlcnMgZnJvbSBhbiBFbGVtZW50LiBDaGVja3MgdGhpbmdzIGxpa2UgY2xhc3NuYW1lcyBhbmQgbGluayBkZW5zaXR5LlxyXG4gICAqXHJcbiAgICogQHBhcmFtIEVsZW1lbnRcclxuICAgKiBAcmV0dXJuIHZvaWRcclxuICAqKi9cclxuICBfY2xlYW5IZWFkZXJzOiBmdW5jdGlvbihlKSB7XHJcbiAgICBmb3IgKHZhciBoZWFkZXJJbmRleCA9IDE7IGhlYWRlckluZGV4IDwgMzsgaGVhZGVySW5kZXggKz0gMSkge1xyXG4gICAgICB0aGlzLl9yZW1vdmVOb2RlcyhlLmdldEVsZW1lbnRzQnlUYWdOYW1lKFwiaFwiICsgaGVhZGVySW5kZXgpLCBmdW5jdGlvbiAoaGVhZGVyKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2dldENsYXNzV2VpZ2h0KGhlYWRlcikgPCAwO1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuICB9LFxyXG5cclxuICBfZmxhZ0lzQWN0aXZlOiBmdW5jdGlvbihmbGFnKSB7XHJcbiAgICByZXR1cm4gKHRoaXMuX2ZsYWdzICYgZmxhZykgPiAwO1xyXG4gIH0sXHJcblxyXG4gIF9yZW1vdmVGbGFnOiBmdW5jdGlvbihmbGFnKSB7XHJcbiAgICB0aGlzLl9mbGFncyA9IHRoaXMuX2ZsYWdzICYgfmZsYWc7XHJcbiAgfSxcclxuXHJcbiAgX2lzUHJvYmFibHlWaXNpYmxlOiBmdW5jdGlvbihub2RlKSB7XHJcbiAgICByZXR1cm4gbm9kZS5zdHlsZS5kaXNwbGF5ICE9IFwibm9uZVwiICYmICFub2RlLmhhc0F0dHJpYnV0ZShcImhpZGRlblwiKTtcclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBEZWNpZGVzIHdoZXRoZXIgb3Igbm90IHRoZSBkb2N1bWVudCBpcyByZWFkZXItYWJsZSB3aXRob3V0IHBhcnNpbmcgdGhlIHdob2xlIHRoaW5nLlxyXG4gICAqXHJcbiAgICogQHJldHVybiBib29sZWFuIFdoZXRoZXIgb3Igbm90IHdlIHN1c3BlY3QgcGFyc2UoKSB3aWxsIHN1Y2VlZWQgYXQgcmV0dXJuaW5nIGFuIGFydGljbGUgb2JqZWN0LlxyXG4gICAqL1xyXG4gIGlzUHJvYmFibHlSZWFkZXJhYmxlOiBmdW5jdGlvbihoZWxwZXJJc1Zpc2libGUpIHtcclxuICAgIHZhciBub2RlcyA9IHRoaXMuX2dldEFsbE5vZGVzV2l0aFRhZyh0aGlzLl9kb2MsIFtcInBcIiwgXCJwcmVcIl0pO1xyXG5cclxuICAgIC8vIEdldCA8ZGl2PiBub2RlcyB3aGljaCBoYXZlIDxicj4gbm9kZShzKSBhbmQgYXBwZW5kIHRoZW0gaW50byB0aGUgYG5vZGVzYCB2YXJpYWJsZS5cclxuICAgIC8vIFNvbWUgYXJ0aWNsZXMnIERPTSBzdHJ1Y3R1cmVzIG1pZ2h0IGxvb2sgbGlrZVxyXG4gICAgLy8gPGRpdj5cclxuICAgIC8vICAgU2VudGVuY2VzPGJyPlxyXG4gICAgLy8gICA8YnI+XHJcbiAgICAvLyAgIFNlbnRlbmNlczxicj5cclxuICAgIC8vIDwvZGl2PlxyXG4gICAgdmFyIGJyTm9kZXMgPSB0aGlzLl9nZXRBbGxOb2Rlc1dpdGhUYWcodGhpcy5fZG9jLCBbXCJkaXYgPiBiclwiXSk7XHJcbiAgICBpZiAoYnJOb2Rlcy5sZW5ndGgpIHtcclxuICAgICAgdmFyIHNldCA9IG5ldyBTZXQoKTtcclxuICAgICAgW10uZm9yRWFjaC5jYWxsKGJyTm9kZXMsIGZ1bmN0aW9uKG5vZGUpIHtcclxuICAgICAgICBzZXQuYWRkKG5vZGUucGFyZW50Tm9kZSk7XHJcbiAgICAgIH0pO1xyXG4gICAgICBub2RlcyA9IFtdLmNvbmNhdC5hcHBseShBcnJheS5mcm9tKHNldCksIG5vZGVzKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoIWhlbHBlcklzVmlzaWJsZSkge1xyXG4gICAgICBoZWxwZXJJc1Zpc2libGUgPSB0aGlzLl9pc1Byb2JhYmx5VmlzaWJsZTtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgc2NvcmUgPSAwO1xyXG4gICAgLy8gVGhpcyBpcyBhIGxpdHRsZSBjaGVla3ksIHdlIHVzZSB0aGUgYWNjdW11bGF0b3IgJ3Njb3JlJyB0byBkZWNpZGUgd2hhdCB0byByZXR1cm4gZnJvbVxyXG4gICAgLy8gdGhpcyBjYWxsYmFjazpcclxuICAgIHJldHVybiB0aGlzLl9zb21lTm9kZShub2RlcywgZnVuY3Rpb24obm9kZSkge1xyXG4gICAgICBpZiAoaGVscGVySXNWaXNpYmxlICYmICFoZWxwZXJJc1Zpc2libGUobm9kZSkpXHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICB2YXIgbWF0Y2hTdHJpbmcgPSBub2RlLmNsYXNzTmFtZSArIFwiIFwiICsgbm9kZS5pZDtcclxuXHJcbiAgICAgIGlmICh0aGlzLlJFR0VYUFMudW5saWtlbHlDYW5kaWRhdGVzLnRlc3QobWF0Y2hTdHJpbmcpICYmXHJcbiAgICAgICAgICAhdGhpcy5SRUdFWFBTLm9rTWF5YmVJdHNBQ2FuZGlkYXRlLnRlc3QobWF0Y2hTdHJpbmcpKSB7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAobm9kZS5tYXRjaGVzICYmIG5vZGUubWF0Y2hlcyhcImxpIHBcIikpIHtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHZhciB0ZXh0Q29udGVudExlbmd0aCA9IG5vZGUudGV4dENvbnRlbnQudHJpbSgpLmxlbmd0aDtcclxuICAgICAgaWYgKHRleHRDb250ZW50TGVuZ3RoIDwgMTQwKSB7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBzY29yZSArPSBNYXRoLnNxcnQodGV4dENvbnRlbnRMZW5ndGggLSAxNDApO1xyXG5cclxuICAgICAgaWYgKHNjb3JlID4gMjApIHtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9KTtcclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBSdW5zIHJlYWRhYmlsaXR5LlxyXG4gICAqXHJcbiAgICogV29ya2Zsb3c6XHJcbiAgICogIDEuIFByZXAgdGhlIGRvY3VtZW50IGJ5IHJlbW92aW5nIHNjcmlwdCB0YWdzLCBjc3MsIGV0Yy5cclxuICAgKiAgMi4gQnVpbGQgcmVhZGFiaWxpdHkncyBET00gdHJlZS5cclxuICAgKiAgMy4gR3JhYiB0aGUgYXJ0aWNsZSBjb250ZW50IGZyb20gdGhlIGN1cnJlbnQgZG9tIHRyZWUuXHJcbiAgICogIDQuIFJlcGxhY2UgdGhlIGN1cnJlbnQgRE9NIHRyZWUgd2l0aCB0aGUgbmV3IG9uZS5cclxuICAgKiAgNS4gUmVhZCBwZWFjZWZ1bGx5LlxyXG4gICAqXHJcbiAgICogQHJldHVybiB2b2lkXHJcbiAgICoqL1xyXG4gIHBhcnNlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAvLyBBdm9pZCBwYXJzaW5nIHRvbyBsYXJnZSBkb2N1bWVudHMsIGFzIHBlciBjb25maWd1cmF0aW9uIG9wdGlvblxyXG4gICAgaWYgKHRoaXMuX21heEVsZW1zVG9QYXJzZSA+IDApIHtcclxuICAgICAgdmFyIG51bVRhZ3MgPSB0aGlzLl9kb2MuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCIqXCIpLmxlbmd0aDtcclxuICAgICAgaWYgKG51bVRhZ3MgPiB0aGlzLl9tYXhFbGVtc1RvUGFyc2UpIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJBYm9ydGluZyBwYXJzaW5nIGRvY3VtZW50OyBcIiArIG51bVRhZ3MgKyBcIiBlbGVtZW50cyBmb3VuZFwiKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIFJlbW92ZSBzY3JpcHQgdGFncyBmcm9tIHRoZSBkb2N1bWVudC5cclxuICAgIHRoaXMuX3JlbW92ZVNjcmlwdHModGhpcy5fZG9jKTtcclxuXHJcbiAgICB0aGlzLl9wcmVwRG9jdW1lbnQoKTtcclxuXHJcbiAgICB2YXIgbWV0YWRhdGEgPSB0aGlzLl9nZXRBcnRpY2xlTWV0YWRhdGEoKTtcclxuICAgIHRoaXMuX2FydGljbGVUaXRsZSA9IG1ldGFkYXRhLnRpdGxlO1xyXG5cclxuICAgIHZhciBhcnRpY2xlQ29udGVudCA9IHRoaXMuX2dyYWJBcnRpY2xlKCk7XHJcbiAgICBpZiAoIWFydGljbGVDb250ZW50KVxyXG4gICAgICByZXR1cm4gbnVsbDtcclxuXHJcbiAgICB0aGlzLmxvZyhcIkdyYWJiZWQ6IFwiICsgYXJ0aWNsZUNvbnRlbnQuaW5uZXJIVE1MKTtcclxuXHJcbiAgICB0aGlzLl9wb3N0UHJvY2Vzc0NvbnRlbnQoYXJ0aWNsZUNvbnRlbnQpO1xyXG5cclxuICAgIC8vIElmIHdlIGhhdmVuJ3QgZm91bmQgYW4gZXhjZXJwdCBpbiB0aGUgYXJ0aWNsZSdzIG1ldGFkYXRhLCB1c2UgdGhlIGFydGljbGUnc1xyXG4gICAgLy8gZmlyc3QgcGFyYWdyYXBoIGFzIHRoZSBleGNlcnB0LiBUaGlzIGlzIHVzZWQgZm9yIGRpc3BsYXlpbmcgYSBwcmV2aWV3IG9mXHJcbiAgICAvLyB0aGUgYXJ0aWNsZSdzIGNvbnRlbnQuXHJcbiAgICBpZiAoIW1ldGFkYXRhLmV4Y2VycHQpIHtcclxuICAgICAgdmFyIHBhcmFncmFwaHMgPSBhcnRpY2xlQ29udGVudC5nZXRFbGVtZW50c0J5VGFnTmFtZShcInBcIik7XHJcbiAgICAgIGlmIChwYXJhZ3JhcGhzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICBtZXRhZGF0YS5leGNlcnB0ID0gcGFyYWdyYXBoc1swXS50ZXh0Q29udGVudC50cmltKCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB2YXIgdGV4dENvbnRlbnQgPSBhcnRpY2xlQ29udGVudC50ZXh0Q29udGVudDtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIHRpdGxlOiB0aGlzLl9hcnRpY2xlVGl0bGUsXHJcbiAgICAgIGJ5bGluZTogbWV0YWRhdGEuYnlsaW5lIHx8IHRoaXMuX2FydGljbGVCeWxpbmUsXHJcbiAgICAgIGRpcjogdGhpcy5fYXJ0aWNsZURpcixcclxuICAgICAgY29udGVudDogYXJ0aWNsZUNvbnRlbnQuaW5uZXJIVE1MLFxyXG4gICAgICB0ZXh0Q29udGVudDogdGV4dENvbnRlbnQsXHJcbiAgICAgIGxlbmd0aDogdGV4dENvbnRlbnQubGVuZ3RoLFxyXG4gICAgICBleGNlcnB0OiBtZXRhZGF0YS5leGNlcnB0LFxyXG4gICAgfTtcclxuICB9XHJcbn07XHJcblxyXG5pZiAodHlwZW9mIG1vZHVsZSA9PT0gXCJvYmplY3RcIikge1xyXG4gIG1vZHVsZS5leHBvcnRzID0gUmVhZGFiaWxpdHk7XHJcbn1cclxuIl19
