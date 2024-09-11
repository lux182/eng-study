chrome.tabs.onUpdated.addListener(function (tabId, changeInfo) {
    if (changeInfo.status === 'complete') {
        console.log('background.js: chrome.tabs.onUpdated.addListener')
        chrome.tabs.executeScript(tabId, {
            file: 'contentScript.js'
        });
    }
});

// 初始化,运行一次
chrome.runtime.onInstalled.addListener(() => {
    // 代码
    console.log('background.js: chrome.runtime.onInstalled.addListener')
});

// 长期事件监听/处理
chrome.browserAction.onClicked.addListener(() => {
    // 代码
    console.log('background.js: chrome.browserAction.onClicked.addListener')
});

chrome.alarms.onAlarm.addListener(() => {
    // 代码
    console.log('background.js: chrome.alarms.onAlarm.addListener')
});
