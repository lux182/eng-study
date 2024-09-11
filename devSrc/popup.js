let storage = null;

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
            get: (key, callback) => {
                const value = localStorage.getItem(key);
                callback(value ? JSON.parse(value) : {});
            },
            set: (obj, callback) => {
                Object.keys(obj).forEach(key => {
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
        let vocabulary = result.vocabulary || [];
        let vocabularyList = document.getElementById('vocabularyList');
        vocabularyList.innerHTML = '';
        vocabulary.forEach(function (word) {
            let li = document.createElement('li');
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
    fetch(chrome.runtime.getURL('gptwords.json'))
        .then(response => response.json())
        .then(dictionary => {
            let definition = dictionary[word.toLowerCase()];
            if (definition) {
                showToast(`${word}: ${definition}`);
            } else {
                showToast(`Definition not found for "${word}"`);
            }
        });
}

function showToast(message) {
    let snackbarContainer = document.querySelector('#toast');
    if (snackbarContainer && snackbarContainer.MaterialSnackbar) {
        let data = { message: message, timeout: 2000 };
        snackbarContainer.MaterialSnackbar.showSnackbar(data);
    } else {
        alert(message);
    }
}

function showRandomWord() {
    fetch(chrome.runtime.getURL('gptwords.json'))
        .then(response => response.json())
        .then(data => {
            const wordList = data.wordList;
            const randomWordObj = wordList[Math.floor(Math.random() * wordList.length)];
            const randomWord = randomWordObj.word;
            const wordContent = parseContent(randomWordObj.content);
            const randomWordElement = document.getElementById('randomWord');
            randomWordElement.innerHTML = `
                    <h3>${randomWord}</h3>
                    <p><strong>定义：</strong>${wordContent['分析词义']}</p>
                    <p><strong>例句：</strong>${wordContent['列举例句'][0]}</p>
                    <p><strong>词根分析</strong>${wordContent['词根分析']}</p>
                    <p><strong>发展历史和文化背景</strong>${wordContent['发展历史和文化背景']}</p>
                    <p><strong>单词变形</strong>${wordContent['单词变形']}</p>
                    <p><strong>记忆辅助：</strong>${wordContent['记忆辅助']}</p>
                    <p><strong>小故事：</strong>${wordContent['小故事']}</p>
                `;
        })
        .catch(error => {
            console.error('Error loading gptwords.json:', error);
        });
}

function parseContent(content) {
    const sections = content.split('###').filter(section => section.trim() !== '');
    const result = {};
     
    sections.forEach(section => {
        const lines = section.trim().split('\n');
        if (lines.length === 0) return; // 跳过空部分

        const firstLine = lines[0];
        const titleEndIndex = firstLine.indexOf(' ');
        const title = titleEndIndex !== -1 ? firstLine.slice(0, titleEndIndex).trim() : firstLine.trim();
        
        let sectionContent = '';
        if (titleEndIndex !== -1) {
            sectionContent = firstLine.slice(titleEndIndex + 1).trim(); // 保留第一行标题后的内容
        }
        if (lines.length > 1) {
            sectionContent += (sectionContent ? '\n' : '') + lines.slice(1).join('\n');
        }
        
        if (title === '列举例句') {
            result[title] = sectionContent.split(/\d+\./).slice(1).map(item => item.trim()).filter(Boolean);
        } else {
            result[title] = sectionContent.trim();
        }
    });
    
    return result;
}

document.addEventListener('DOMContentLoaded', function () {
    console.log('DOMContentLoaded event fired'); // 调试信息
    initStorageWhenReady();
    let showVocabularyButton = document.getElementById('showVocabulary');
    if (showVocabularyButton) {
        showVocabularyButton.addEventListener('click', showRandomWord);
    } else {
        console.error('Show Vocabulary button not found');
    }
    // 初始显示随机单词
    showRandomWord();
});
