(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
'use strict';

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo) {
    if (changeInfo.status === 'complete') {
        console.log('background.js: chrome.tabs.onUpdated.addListener');
        chrome.tabs.executeScript(tabId, {
            file: 'contentScript.js'
        });
    }
});

// 初始化,运行一次
chrome.runtime.onInstalled.addListener(function () {
    // 代码
    console.log('background.js: chrome.runtime.onInstalled.addListener');
});

// 长期事件监听/处理
chrome.browserAction.onClicked.addListener(function () {
    // 代码
    console.log('background.js: chrome.browserAction.onClicked.addListener');
});

chrome.alarms.onAlarm.addListener(function () {
    // 代码
    console.log('background.js: chrome.alarms.onAlarm.addListener');
});

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJkZXZTcmMvYmFja2dyb3VuZC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUEsT0FBTyxJQUFQLENBQVksU0FBWixDQUFzQixXQUF0QixDQUFrQyxVQUFVLEtBQVYsRUFBaUIsVUFBakIsRUFBNkI7QUFDM0QsUUFBSSxXQUFXLE1BQVgsS0FBc0IsVUFBMUIsRUFBc0M7QUFDbEMsZ0JBQVEsR0FBUixDQUFZLGtEQUFaO0FBQ0EsZUFBTyxJQUFQLENBQVksYUFBWixDQUEwQixLQUExQixFQUFpQztBQUM3QixrQkFBTTtBQUR1QixTQUFqQztBQUdIO0FBQ0osQ0FQRDs7QUFTQTtBQUNBLE9BQU8sT0FBUCxDQUFlLFdBQWYsQ0FBMkIsV0FBM0IsQ0FBdUMsWUFBTTtBQUN6QztBQUNBLFlBQVEsR0FBUixDQUFZLHVEQUFaO0FBQ0gsQ0FIRDs7QUFLQTtBQUNBLE9BQU8sYUFBUCxDQUFxQixTQUFyQixDQUErQixXQUEvQixDQUEyQyxZQUFNO0FBQzdDO0FBQ0EsWUFBUSxHQUFSLENBQVksMkRBQVo7QUFDSCxDQUhEOztBQUtBLE9BQU8sTUFBUCxDQUFjLE9BQWQsQ0FBc0IsV0FBdEIsQ0FBa0MsWUFBTTtBQUNwQztBQUNBLFlBQVEsR0FBUixDQUFZLGtEQUFaO0FBQ0gsQ0FIRCIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsImNocm9tZS50YWJzLm9uVXBkYXRlZC5hZGRMaXN0ZW5lcihmdW5jdGlvbiAodGFiSWQsIGNoYW5nZUluZm8pIHtcclxuICAgIGlmIChjaGFuZ2VJbmZvLnN0YXR1cyA9PT0gJ2NvbXBsZXRlJykge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCdiYWNrZ3JvdW5kLmpzOiBjaHJvbWUudGFicy5vblVwZGF0ZWQuYWRkTGlzdGVuZXInKVxyXG4gICAgICAgIGNocm9tZS50YWJzLmV4ZWN1dGVTY3JpcHQodGFiSWQsIHtcclxuICAgICAgICAgICAgZmlsZTogJ2NvbnRlbnRTY3JpcHQuanMnXHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbn0pO1xyXG5cclxuLy8g5Yid5aeL5YyWLOi/kOihjOS4gOasoVxyXG5jaHJvbWUucnVudGltZS5vbkluc3RhbGxlZC5hZGRMaXN0ZW5lcigoKSA9PiB7XHJcbiAgICAvLyDku6PnoIFcclxuICAgIGNvbnNvbGUubG9nKCdiYWNrZ3JvdW5kLmpzOiBjaHJvbWUucnVudGltZS5vbkluc3RhbGxlZC5hZGRMaXN0ZW5lcicpXHJcbn0pO1xyXG5cclxuLy8g6ZW/5pyf5LqL5Lu255uR5ZCsL+WkhOeQhlxyXG5jaHJvbWUuYnJvd3NlckFjdGlvbi5vbkNsaWNrZWQuYWRkTGlzdGVuZXIoKCkgPT4ge1xyXG4gICAgLy8g5Luj56CBXHJcbiAgICBjb25zb2xlLmxvZygnYmFja2dyb3VuZC5qczogY2hyb21lLmJyb3dzZXJBY3Rpb24ub25DbGlja2VkLmFkZExpc3RlbmVyJylcclxufSk7XHJcblxyXG5jaHJvbWUuYWxhcm1zLm9uQWxhcm0uYWRkTGlzdGVuZXIoKCkgPT4ge1xyXG4gICAgLy8g5Luj56CBXHJcbiAgICBjb25zb2xlLmxvZygnYmFja2dyb3VuZC5qczogY2hyb21lLmFsYXJtcy5vbkFsYXJtLmFkZExpc3RlbmVyJylcclxufSk7XHJcbiJdfQ==
