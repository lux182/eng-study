(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
'use strict';

var storage = null;

function initStorageWhenReady() {
    console.log(chrome);
    if (chrome && chrome.storage && chrome.storage.local) {
        initStorage();
    }
}

function initStorage() {
    console.log('initStorage');
    if (chrome && chrome.storage && chrome.storage.local) {
        storage = chrome.storage.local;
    } else {
        console.error('Chrome storage is not available');
        // 使用 localStorage 作为备用
        storage = {
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
    // 初始化存储后立即显示词汇表和随机单词
    showVocabulary();
    showRandomWord();
}

function showVocabulary() {
    console.log('showVocabulary function called'); // 调试信息
    if (!storage) {
        console.error('Storage is not initialized');
        return;
    }
    storage.get('vocabulary', function (result) {
        console.log('Retrieved vocabulary:', result.vocabulary); // 调试信息
        var vocabulary = result.vocabulary || [];
        var vocabularyList = document.getElementById('vocabularyList');
        vocabularyList.innerHTML = '';
        vocabulary.forEach(function (word) {
            var li = document.createElement('li');
            li.textContent = word;
            li.addEventListener('click', function () {
                showDefinition(word);
            });
            vocabularyList.appendChild(li);
        });
        console.log('Vocabulary list updated'); // 调试信息
    });
}

function showWordDefinition(word) {
    fetch(chrome.runtime.getURL('gptwords.json')).then(function (response) {
        return response.json();
    }).then(function (dictionary) {
        var definition = dictionary[word.toLowerCase()];
        if (definition) {
            showToast(word + ': ' + definition);
        } else {
            showToast('Definition not found for "' + word + '"');
        }
    });
}

function showToast(message) {
    var snackbarContainer = document.querySelector('#toast');
    if (snackbarContainer && snackbarContainer.MaterialSnackbar) {
        var data = { message: message, timeout: 2000 };
        snackbarContainer.MaterialSnackbar.showSnackbar(data);
    } else {
        alert(message);
    }
}

function showRandomWord() {
    fetch(chrome.runtime.getURL('gptwords.json')).then(function (response) {
        return response.json();
    }).then(function (data) {
        var wordList = data.wordList;
        var randomWordObj = wordList[Math.floor(Math.random() * wordList.length)];
        var randomWord = randomWordObj.word;
        var wordContent = parseContent(randomWordObj.content);
        var randomWordElement = document.getElementById('randomWord');
        randomWordElement.innerHTML = '\n                    <h3>' + randomWord + '</h3>\n                    <p><strong>\u5B9A\u4E49\uFF1A</strong>' + wordContent['分析词义'] + '</p>\n                    <p><strong>\u4F8B\u53E5\uFF1A</strong>' + wordContent['列举例句'][0] + '</p>\n                    <p><strong>\u8BCD\u6839\u5206\u6790</strong>' + wordContent['词根分析'] + '</p>\n                    <p><strong>\u53D1\u5C55\u5386\u53F2\u548C\u6587\u5316\u80CC\u666F</strong>' + wordContent['发展历史和文化背景'] + '</p>\n                    <p><strong>\u5355\u8BCD\u53D8\u5F62</strong>' + wordContent['单词变形'] + '</p>\n                    <p><strong>\u8BB0\u5FC6\u8F85\u52A9\uFF1A</strong>' + wordContent['记忆辅助'] + '</p>\n                    <p><strong>\u5C0F\u6545\u4E8B\uFF1A</strong>' + wordContent['小故事'] + '</p>\n                ';
    }).catch(function (error) {
        console.error('Error loading gptwords.json:', error);
    });
}

function parseContent(content) {
    var sections = content.split('###').filter(function (section) {
        return section.trim() !== '';
    });
    var result = {};

    sections.forEach(function (section) {
        var lines = section.trim().split('\n');
        if (lines.length === 0) return; // 跳过空部分

        var firstLine = lines[0];
        var titleEndIndex = firstLine.indexOf(' ');
        var title = titleEndIndex !== -1 ? firstLine.slice(0, titleEndIndex).trim() : firstLine.trim();

        var sectionContent = '';
        if (titleEndIndex !== -1) {
            sectionContent = firstLine.slice(titleEndIndex + 1).trim(); // 保留第一行标题后的内容
        }
        if (lines.length > 1) {
            sectionContent += (sectionContent ? '\n' : '') + lines.slice(1).join('\n');
        }

        if (title === '列举例句') {
            result[title] = sectionContent.split(/\d+\./).slice(1).map(function (item) {
                return item.trim();
            }).filter(Boolean);
        } else {
            result[title] = sectionContent.trim();
        }
    });

    return result;
}

document.addEventListener('DOMContentLoaded', function () {
    console.log('DOMContentLoaded event fired'); // 调试信息
    initStorageWhenReady();
    var showVocabularyButton = document.getElementById('showVocabulary');
    if (showVocabularyButton) {
        showVocabularyButton.addEventListener('click', showRandomWord);
    } else {
        console.error('Show Vocabulary button not found');
    }
    // 初始显示随机单词
    showRandomWord();
});

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJkZXZTcmMvcG9wdXAuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQ0FBLElBQUksVUFBVSxJQUFkOztBQUVBLFNBQVMsb0JBQVQsR0FBZ0M7QUFDNUIsWUFBUSxHQUFSLENBQVksTUFBWjtBQUNBLFFBQUksVUFBVSxPQUFPLE9BQWpCLElBQTRCLE9BQU8sT0FBUCxDQUFlLEtBQS9DLEVBQXNEO0FBQ2xEO0FBQ0g7QUFDSjs7QUFFRCxTQUFTLFdBQVQsR0FBdUI7QUFDbkIsWUFBUSxHQUFSLENBQVksYUFBWjtBQUNBLFFBQUksVUFBVSxPQUFPLE9BQWpCLElBQTRCLE9BQU8sT0FBUCxDQUFlLEtBQS9DLEVBQXNEO0FBQ2xELGtCQUFVLE9BQU8sT0FBUCxDQUFlLEtBQXpCO0FBQ0gsS0FGRCxNQUVPO0FBQ0gsZ0JBQVEsS0FBUixDQUFjLGlDQUFkO0FBQ0E7QUFDQSxrQkFBVTtBQUNOLGlCQUFLLGFBQUMsR0FBRCxFQUFNLFFBQU4sRUFBbUI7QUFDcEIsb0JBQU0sUUFBUSxhQUFhLE9BQWIsQ0FBcUIsR0FBckIsQ0FBZDtBQUNBLHlCQUFTLFFBQVEsS0FBSyxLQUFMLENBQVcsS0FBWCxDQUFSLEdBQTRCLEVBQXJDO0FBQ0gsYUFKSztBQUtOLGlCQUFLLGFBQUMsR0FBRCxFQUFNLFFBQU4sRUFBbUI7QUFDcEIsdUJBQU8sSUFBUCxDQUFZLEdBQVosRUFBaUIsT0FBakIsQ0FBeUIsZUFBTztBQUM1QixpQ0FBYSxPQUFiLENBQXFCLEdBQXJCLEVBQTBCLEtBQUssU0FBTCxDQUFlLElBQUksR0FBSixDQUFmLENBQTFCO0FBQ0gsaUJBRkQ7QUFHQSxvQkFBSSxRQUFKLEVBQWM7QUFDakI7QUFWSyxTQUFWO0FBWUg7QUFDRDtBQUNBO0FBQ0E7QUFDSDs7QUFFRCxTQUFTLGNBQVQsR0FBMEI7QUFDdEIsWUFBUSxHQUFSLENBQVksZ0NBQVosRUFEc0IsQ0FDeUI7QUFDL0MsUUFB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LGVBQWUsSUFBZixFQUFoQjtBQUNIO0FBQ0osS0FyQkQ7O0FBdUJBLFdBQU8sTUFBUDtBQUNIOztBQUVELFNBQVMsZ0JBQVQsQ0FBMEIsa0JBQTFCLEVBQThDLFlBQVk7QUFDdEQsWUFBUSxHQUFSLENBQVksOEJBQVosRUFEc0QsQ0FDVDtBQUM3QztBQUNBLFFBQUksdUJBQXVCLFNBQVMsY0FBVCxDQUF3QixnQkFBeEIsQ0FBM0I7QUFDQSxRQUFJLG9CQUFKLEVBQTBCO0FBQ3RCLDZCQUFxQixnQkFBckIsQ0FBc0MsT0FBdEMsRUFBK0MsY0FBL0M7QUFDSCxLQUZELE1BRU87QUFDSCxnQkFBUSxLQUFSLENBQWMsa0NBQWQ7QUFDSDtBQUNEO0FBQ0E7QUFDSCxDQVhEIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwibGV0IHN0b3JhZ2UgPSBudWxsO1xyXG5cclxuZnVuY3Rpb24gaW5pdFN0b3JhZ2VXaGVuUmVhZHkoKSB7XHJcbiAgICBjb25zb2xlLmxvZyhjaHJvbWUpO1xyXG4gICAgaWYgKGNocm9tZSAmJiBjaHJvbWUuc3RvcmFnZSAmJiBjaHJvbWUuc3RvcmFnZS5sb2NhbCkge1xyXG4gICAgICAgIGluaXRTdG9yYWdlKCk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGluaXRTdG9yYWdlKCkge1xyXG4gICAgY29uc29sZS5sb2coJ2luaXRTdG9yYWdlJyk7XHJcbiAgICBpZiAoY2hyb21lICYmIGNocm9tZS5zdG9yYWdlICYmIGNocm9tZS5zdG9yYWdlLmxvY2FsKSB7XHJcbiAgICAgICAgc3RvcmFnZSA9IGNocm9tZS5zdG9yYWdlLmxvY2FsO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICBjb25zb2xlLmVycm9yKCdDaHJvbWUgc3RvcmFnZSBpcyBub3QgYXZhaWxhYmxlJyk7XHJcbiAgICAgICAgLy8g5L2/55SoIGxvY2FsU3RvcmFnZSDkvZzkuLrlpIfnlKhcclxuICAgICAgICBzdG9yYWdlID0ge1xyXG4gICAgICAgICAgICBnZXQ6IChrZXksIGNhbGxiYWNrKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCB2YWx1ZSA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKGtleSk7XHJcbiAgICAgICAgICAgICAgICBjYWxsYmFjayh2YWx1ZSA/IEpTT04ucGFyc2UodmFsdWUpIDoge30pO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBzZXQ6IChvYmosIGNhbGxiYWNrKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBPYmplY3Qua2V5cyhvYmopLmZvckVhY2goa2V5ID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShrZXksIEpTT04uc3RyaW5naWZ5KG9ialtrZXldKSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIGlmIChjYWxsYmFjaykgY2FsbGJhY2soKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcbiAgICB9XHJcbiAgICAvLyDliJ3lp4vljJblrZjlgqjlkI7nq4vljbPmmL7npLror43msYfooajlkozpmo/mnLrljZXor41cclxuICAgIHNob3dWb2NhYnVsYXJ5KCk7XHJcbiAgICBzaG93UmFuZG9tV29yZCgpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBzaG93Vm9jYWJ1bGFyeSgpIHtcclxuICAgIGNvbnNvbGUubG9nKCdzaG93Vm9jYWJ1bGFyeSBmdW5jdGlvbiBjYWxsZWQnKTsgLy8g6LCD6K+V5L+h5oGvXHJcbiAgICBpZiAoIXN0b3JhZ2UpIHtcclxuICAgICAgICBjb25zb2xlLmVycm9yKCdTdG9yYWdlIGlzIG5vdCBpbml0aWFsaXplZCcpO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIHN0b3JhZ2UuZ2V0KCd2b2NhYnVsYXJ5JywgZnVuY3Rpb24gKHJlc3VsdCkge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCdSZXRyaWV2ZWQgdm9jYWJ1bGFyeTonLCByZXN1bHQudm9jYWJ1bGFyeSk7IC8vIOiwg+ivleS/oeaBr1xyXG4gICAgICAgIGxldCB2b2NhYnVsYXJ5ID0gcmVzdWx0LnZvY2FidWxhcnkgfHwgW107XHJcbiAgICAgICAgbGV0IHZvY2FidWxhcnlMaXN0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3ZvY2FidWxhcnlMaXN0Jyk7XHJcbiAgICAgICAgdm9jYWJ1bGFyeUxpc3QuaW5uZXJIVE1MID0gJyc7XHJcbiAgICAgICAgdm9jYWJ1bGFyeS5mb3JFYWNoKGZ1bmN0aW9uICh3b3JkKSB7XHJcbiAgICAgICAgICAgIGxldCBsaSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xpJyk7XHJcbiAgICAgICAgICAgIGxpLnRleHRDb250ZW50ID0gd29yZDtcclxuICAgICAgICAgICAgbGkuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICBzaG93RGVmaW5pdGlvbih3b3JkKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHZvY2FidWxhcnlMaXN0LmFwcGVuZENoaWxkKGxpKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICBjb25zb2xlLmxvZygnVm9jYWJ1bGFyeSBsaXN0IHVwZGF0ZWQnKTsgLy8g6LCD6K+V5L+h5oGvXHJcbiAgICB9KTtcclxufVxyXG5cclxuZnVuY3Rpb24gc2hvd1dvcmREZWZpbml0aW9uKHdvcmQpIHtcclxuICAgIGZldGNoKGNocm9tZS5ydW50aW1lLmdldFVSTCgnZ3B0d29yZHMuanNvbicpKVxyXG4gICAgICAgIC50aGVuKHJlc3BvbnNlID0+IHJlc3BvbnNlLmpzb24oKSlcclxuICAgICAgICAudGhlbihkaWN0aW9uYXJ5ID0+IHtcclxuICAgICAgICAgICAgbGV0IGRlZmluaXRpb24gPSBkaWN0aW9uYXJ5W3dvcmQudG9Mb3dlckNhc2UoKV07XHJcbiAgICAgICAgICAgIGlmIChkZWZpbml0aW9uKSB7XHJcbiAgICAgICAgICAgICAgICBzaG93VG9hc3QoYCR7d29yZH06ICR7ZGVmaW5pdGlvbn1gKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHNob3dUb2FzdChgRGVmaW5pdGlvbiBub3QgZm91bmQgZm9yIFwiJHt3b3JkfVwiYCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxufVxyXG5cclxuZnVuY3Rpb24gc2hvd1RvYXN0KG1lc3NhZ2UpIHtcclxuICAgIGxldCBzbmFja2JhckNvbnRhaW5lciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyN0b2FzdCcpO1xyXG4gICAgaWYgKHNuYWNrYmFyQ29udGFpbmVyICYmIHNuYWNrYmFyQ29udGFpbmVyLk1hdGVyaWFsU25hY2tiYXIpIHtcclxuICAgICAgICBsZXQgZGF0YSA9IHsgbWVzc2FnZTogbWVzc2FnZSwgdGltZW91dDogMjAwMCB9O1xyXG4gICAgICAgIHNuYWNrYmFyQ29udGFpbmVyLk1hdGVyaWFsU25hY2tiYXIuc2hvd1NuYWNrYmFyKGRhdGEpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICBhbGVydChtZXNzYWdlKTtcclxuICAgIH1cclxufVxyXG5cclxuZnVuY3Rpb24gc2hvd1JhbmRvbVdvcmQoKSB7XHJcbiAgICBmZXRjaChjaHJvbWUucnVudGltZS5nZXRVUkwoJ2dwdHdvcmRzLmpzb24nKSlcclxuICAgICAgICAudGhlbihyZXNwb25zZSA9PiByZXNwb25zZS5qc29uKCkpXHJcbiAgICAgICAgLnRoZW4oZGF0YSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IHdvcmRMaXN0ID0gZGF0YS53b3JkTGlzdDtcclxuICAgICAgICAgICAgY29uc3QgcmFuZG9tV29yZE9iaiA9IHdvcmRMaXN0W01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIHdvcmRMaXN0Lmxlbmd0aCldO1xyXG4gICAgICAgICAgICBjb25zdCByYW5kb21Xb3JkID0gcmFuZG9tV29yZE9iai53b3JkO1xyXG4gICAgICAgICAgICBjb25zdCB3b3JkQ29udGVudCA9IHBhcnNlQ29udGVudChyYW5kb21Xb3JkT2JqLmNvbnRlbnQpO1xyXG4gICAgICAgICAgICBjb25zdCByYW5kb21Xb3JkRWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdyYW5kb21Xb3JkJyk7XHJcbiAgICAgICAgICAgIHJhbmRvbVdvcmRFbGVtZW50LmlubmVySFRNTCA9IGBcclxuICAgICAgICAgICAgICAgICAgICA8aDM+JHtyYW5kb21Xb3JkfTwvaDM+XHJcbiAgICAgICAgICAgICAgICAgICAgPHA+PHN0cm9uZz7lrprkuYnvvJo8L3N0cm9uZz4ke3dvcmRDb250ZW50WyfliIbmnpDor43kuYknXX08L3A+XHJcbiAgICAgICAgICAgICAgICAgICAgPHA+PHN0cm9uZz7kvovlj6XvvJo8L3N0cm9uZz4ke3dvcmRDb250ZW50WyfliJfkuL7kvovlj6UnXVswXX08L3A+XHJcbiAgICAgICAgICAgICAgICAgICAgPHA+PHN0cm9uZz7or43moLnliIbmnpA8L3N0cm9uZz4ke3dvcmRDb250ZW50Wyfor43moLnliIbmnpAnXX08L3A+XHJcbiAgICAgICAgICAgICAgICAgICAgPHA+PHN0cm9uZz7lj5HlsZXljoblj7LlkozmlofljJbog4zmma88L3N0cm9uZz4ke3dvcmRDb250ZW50Wyflj5HlsZXljoblj7LlkozmlofljJbog4zmma8nXX08L3A+XHJcbiAgICAgICAgICAgICAgICAgICAgPHA+PHN0cm9uZz7ljZXor43lj5jlvaI8L3N0cm9uZz4ke3dvcmRDb250ZW50WyfljZXor43lj5jlvaInXX08L3A+XHJcbiAgICAgICAgICAgICAgICAgICAgPHA+PHN0cm9uZz7orrDlv4bovoXliqnvvJo8L3N0cm9uZz4ke3dvcmRDb250ZW50WyforrDlv4bovoXliqknXX08L3A+XHJcbiAgICAgICAgICAgICAgICAgICAgPHA+PHN0cm9uZz7lsI/mlYXkuovvvJo8L3N0cm9uZz4ke3dvcmRDb250ZW50WyflsI/mlYXkuosnXX08L3A+XHJcbiAgICAgICAgICAgICAgICBgO1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLmNhdGNoKGVycm9yID0+IHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgbG9hZGluZyBncHR3b3Jkcy5qc29uOicsIGVycm9yKTtcclxuICAgICAgICB9KTtcclxufVxyXG5cclxuZnVuY3Rpb24gcGFyc2VDb250ZW50KGNvbnRlbnQpIHtcclxuICAgIGNvbnN0IHNlY3Rpb25zID0gY29udGVudC5zcGxpdCgnIyMjJykuZmlsdGVyKHNlY3Rpb24gPT4gc2VjdGlvbi50cmltKCkgIT09ICcnKTtcclxuICAgIGNvbnN0IHJlc3VsdCA9IHt9O1xyXG4gICAgIFxyXG4gICAgc2VjdGlvbnMuZm9yRWFjaChzZWN0aW9uID0+IHtcclxuICAgICAgICBjb25zdCBsaW5lcyA9IHNlY3Rpb24udHJpbSgpLnNwbGl0KCdcXG4nKTtcclxuICAgICAgICBpZiAobGluZXMubGVuZ3RoID09PSAwKSByZXR1cm47IC8vIOi3s+i/h+epuumDqOWIhlxyXG5cclxuICAgICAgICBjb25zdCBmaXJzdExpbmUgPSBsaW5lc1swXTtcclxuICAgICAgICBjb25zdCB0aXRsZUVuZEluZGV4ID0gZmlyc3RMaW5lLmluZGV4T2YoJyAnKTtcclxuICAgICAgICBjb25zdCB0aXRsZSA9IHRpdGxlRW5kSW5kZXggIT09IC0xID8gZmlyc3RMaW5lLnNsaWNlKDAsIHRpdGxlRW5kSW5kZXgpLnRyaW0oKSA6IGZpcnN0TGluZS50cmltKCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGV0IHNlY3Rpb25Db250ZW50ID0gJyc7XHJcbiAgICAgICAgaWYgKHRpdGxlRW5kSW5kZXggIT09IC0xKSB7XHJcbiAgICAgICAgICAgIHNlY3Rpb25Db250ZW50ID0gZmlyc3RMaW5lLnNsaWNlKHRpdGxlRW5kSW5kZXggKyAxKS50cmltKCk7IC8vIOS/neeVmeesrOS4gOihjOagh+mimOWQjueahOWGheWuuVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAobGluZXMubGVuZ3RoID4gMSkge1xyXG4gICAgICAgICAgICBzZWN0aW9uQ29udGVudCArPSAoc2VjdGlvbkNvbnRlbnQgPyAnXFxuJyA6ICcnKSArIGxpbmVzLnNsaWNlKDEpLmpvaW4oJ1xcbicpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBpZiAodGl0bGUgPT09ICfliJfkuL7kvovlj6UnKSB7XHJcbiAgICAgICAgICAgIHJlc3VsdFt0aXRsZV0gPSBzZWN0aW9uQ29udGVudC5zcGxpdCgvXFxkK1xcLi8pLnNsaWNlKDEpLm1hcChpdGVtID0+IGl0ZW0udHJpbSgpKS5maWx0ZXIoQm9vbGVhbik7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcmVzdWx0W3RpdGxlXSA9IHNlY3Rpb25Db250ZW50LnRyaW0oKTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuICAgIFxyXG4gICAgcmV0dXJuIHJlc3VsdDtcclxufVxyXG5cclxuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsIGZ1bmN0aW9uICgpIHtcclxuICAgIGNvbnNvbGUubG9nKCdET01Db250ZW50TG9hZGVkIGV2ZW50IGZpcmVkJyk7IC8vIOiwg+ivleS/oeaBr1xyXG4gICAgaW5pdFN0b3JhZ2VXaGVuUmVhZHkoKTtcclxuICAgIGxldCBzaG93Vm9jYWJ1bGFyeUJ1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzaG93Vm9jYWJ1bGFyeScpO1xyXG4gICAgaWYgKHNob3dWb2NhYnVsYXJ5QnV0dG9uKSB7XHJcbiAgICAgICAgc2hvd1ZvY2FidWxhcnlCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBzaG93UmFuZG9tV29yZCk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ1Nob3cgVm9jYWJ1bGFyeSBidXR0b24gbm90IGZvdW5kJyk7XHJcbiAgICB9XHJcbiAgICAvLyDliJ3lp4vmmL7npLrpmo/mnLrljZXor41cclxuICAgIHNob3dSYW5kb21Xb3JkKCk7XHJcbn0pO1xyXG4iXX0=
