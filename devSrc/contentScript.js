import Readability from './lib/Readability';

class EnglishLearningReader {
    constructor() {
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

    initStorageWhenReady() {
        if (chrome && chrome.storage && chrome.storage.local) {
            this.initStorage();
        } else {
            setTimeout(() => this.initStorageWhenReady(), 100);
        }
    }

    initStorage() {
        if (chrome && chrome.storage && chrome.storage.local) {
            this.storage = chrome.storage.local;
        } else {
            console.error('Chrome storage is not available');
            // 可以在这里实现一个备用存储方案，比如使用 localStorage
            this.storage = {
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
    }

    addReadPage() {
        if (this.active) return;
        if (!this.tpl) {
            let article = new Readability(document.cloneNode(true)).parse();
            let reg = /data-(\w*)src/g;
            let content = article.content.replace(reg, 'src');
            this.tpl = `<div class="center-area" id="clearReadCenterArea">
                            <div class="article">
                                <h1 class="title">${article.title}</h1>
                                <div class="content">${content}</div>
                            </div>
                        </div>`;
        }
        let div = document.createElement('div');
        div.id = 'clearRead';
        div.setAttribute('class', 'clearread-mode');
        div.innerHTML = this.tpl;
        document.body.appendChild(div);
        document.body.style.overflow = 'hidden';
        let imgs = div.getElementsByTagName('img');
        let areaWidth = document.getElementById('clearReadCenterArea').clientWidth;
        for (let i = 0; i < imgs.length; i++) {
            let width = imgs[i].naturalWidth;
            if (width) {
                let centerAreaWidth = areaWidth;
                if (width < (centerAreaWidth - 140)) {
                    imgs[i].setAttribute('class', 'img-c')
                }
            }
            imgs[i].onload = function () {
                let width = this.naturalWidth;
                let centerAreaWidth = areaWidth;
                if (width < (centerAreaWidth - 140)) {
                    this.setAttribute('class', 'img-c')
                }
            }
        }
        this.addTranslationFeature();
        this.addVocabularyFeature();
        this.active = true;
        setTimeout(() => {
            div.setAttribute('class', 'clearread-mode clearread-mode-show');
            document.getElementById('clearReadCenterArea').setAttribute('class', 'center-area center-area-show');
        });
    }

    addTranslationFeature() {
        let content = document.querySelector('#clearReadCenterArea .content');
        content.addEventListener('dblclick', (e) => {
            if (e.target.tagName === 'WORD') return;
            let selection = window.getSelection();
            let word = selection.toString().trim().toLowerCase();
            if (word && this.dictionary[word]) {
                let span = document.createElement('word');
                span.textContent = selection.toString();
                span.setAttribute('title', this.dictionary[word]);
                span.classList.add('translated-word');
                let range = selection.getRangeAt(0);
                range.deleteContents();
                range.insertNode(span);
            }
        });
    }

    addVocabularyFeature() {
        let content = document.querySelector('#clearReadCenterArea .content');
        content.addEventListener('click', (e) => {
            if (e.target.classList.contains('translated-word')) {
                let word = e.target.textContent.toLowerCase();
                if (!this.vocabulary.includes(word)) {
                    this.vocabulary.push(word);
                    this.saveVocabulary();
                    this.showNotification(`"${word}" has been added to your vocabulary list.`);
                }
            }
        });
    }

    showNotification(message) {
        let notification = document.createElement('div');
        notification.textContent = message;
        notification.classList.add('english-learning-notification');
        document.body.appendChild(notification);
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    loadDictionary() {
        fetch(chrome.runtime.getURL('gptwords.json'))
            .then(response => response.json())
            .then(dictionary => {
                this.dictionary = dictionary;
            })
            .catch(error => {
                console.error('Error loading gptwords.json:', error);
            });
    }

    saveVocabulary() {
        if (this.storage) {
            this.storage.set({vocabulary: this.vocabulary});
        } else {
            console.error('Storage is not available');
        }
    }

    removeReadPage() {
        if (!this.active) return;
        let clearRead = document.getElementById('clearRead');
        let clearReadCenterArea = document.getElementById('clearReadCenterArea');
        clearReadCenterArea.setAttribute('class', 'center-area');
        setTimeout(() => {
            clearRead.setAttribute('class', 'clearread-mode');
            setTimeout(() => {
                document.body.style.overflow = '';
                let parentNode = clearRead.parentNode;
                parentNode.removeChild(clearRead);
                this.active = false;
            }, 250);
        }, 100);
    }

    addEvents() {
        document.addEventListener('click', (e) => {
            if (e.target.id === 'clearRead') {
                let classNames = e.target.className;
                if (classNames.indexOf('clearread-mode-show') > -1) {
                    this.removeReadPage();
                }
            }
        });
        document.addEventListener('keydown', (e) => {
            let code = e.keyCode;
            if (this.hotkeys.indexOf(code) == -1) {
                this.hotkeys.push(code);
            }
        });
        document.addEventListener('keyup', (e) => {
            if (this.storage) {
                this.storage.get((data) => {
                    if (data.hasOwnProperty('state') && data.state == 'close') return;
                    if (data.hasOwnProperty('open')) {
                        let openkeys = data.open;
                        if (JSON.stringify(this.hotkeys) == JSON.stringify(openkeys)) {
                            this.addReadPage();
                        }
                    } else {
                        if (e.shiftKey && e.keyCode == 13) {
                            this.addReadPage();
                        }
                    }
                    if (data.hasOwnProperty('close')) {
                        let closekeys = data.close;
                        if (JSON.stringify(this.hotkeys) == JSON.stringify(closekeys)) {
                            this.removeReadPage();
                        }
                    } else {
                        if (e.keyCode == 27) {
                            this.removeReadPage();
                        }
                    }
                    this.hotkeys = [];
                });
            }
        });
        document.addEventListener('copy', event => {
            event.preventDefault(); // 阻止默认复制行为

            chrome.runtime.sendMessage({text: 'copied'}, response => {
            });
        });
    }
}

// 确保 DOM 加载完成后再初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new EnglishLearningReader());
} else {
    new EnglishLearningReader();
}
