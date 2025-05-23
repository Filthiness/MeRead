import Mecab from "../lib/mecab/mecab.js";
import { createMecabRenderer, } from "./mecab-renderer.js";
import { SettingsPanel } from "./ui/settings-panel.js";
import { Modal } from "./ui/common/modal.js";

import { getBookmark, scrollToBookmark, markElement, markToki } from "/src/bookmark.js";
import { getTextById } from "/src/api.js";

const testTxt = "\u300E\u672C\u7DE8\u306E\u4E3B\u4EBA\u516C\u300F\r\n\r\n\u30EA\u30B9\u30C6\u30A3\u30A2\uFF089\u6B73\uFF09\u3000\u91D1\u9AEA\u306B\u30D0\u30A4\u30AA\u30EC\u30C3\u30C8\u306E\u77B3\r\n\r\n\u524D\u4E16\u306E\u8A18\u61B6\u3092\u6301\u3061\u3001\u4E09\u5EA6\u76EE\u306E\u4EBA\u751F\u304C\u59CB\u307E\u3063\u305F\u5C11\u5973\r\n\r\n\u4E00\u5EA6\u76EE\u306E\u4EBA\u751F\u306F\u4FAF\u7235\u4EE4\u5B22\u30EC\u30CE\u30A2\u30FB\u30E9\u30A6\u30F3\u30BB\u30EB\r\n\r\n\u904A\u5B66\u306B\u6765\u305F\u96A3\u56FD\u306E\u4EE4\u5B22\u30E1\u30EA\u30A2\u306B\u9665\u308C\u3089\u308C\u3001\u5A5A\u7D04\u7834\u68C4\u3055\u308C\u4FEE\u9053\u9662\u3078\r\n\r\n\u4E8C\u5EA6\u76EE\u306F\u5B64\u5150\r\n\r\n\u4E00\u5EA6\u76EE\u3068\u306F\u5168\u304F\u7570\u306A\u308B\u4E16\u754C\u306E\u5B64\u5150\u3068\u3057\u3066\u751F\u307E\u308C\u308B\r\n\r\n\u4E09\u5EA6\u76EE\u306F\u3001\u4E00\u5EA6\u76EE\u306E\u3068\u304D\u306B\u56E0\u7E01\u306E\u3042\u308B\u30E1\u30EA\u30A2\u306E\u51FA\u8EAB\u56FD\u306B\u751F\u307E\u308C\u305F\u5E73\u6C11\u306E\u5C11\u5973\r\n\r\n\u7956\u6BCD\u3068\u6BCD\u306B\u611B\u3055\u308C\u80B2\u3061\u5E78\u305B\u306A\u65E5\u3005\u3092\u904E\u3054\u3057\u3066\u3044\u305F\u306E\u3060\u304C\u30019\u6B73\u306B\u306A\u3063\u305F\u5E74\u306B\u5BB6\u65CF\u3092\u5931\u3044\u3001\u305D\u306E\u65E5\u306B\u3084\u3063\u3066\u6765\u305F\u56FD\u738B\u965B\u4E0B\u306E\u9063\u3044\u304B\u3089\u738B\u5973\u3060\u3068\u77E5\u3089\u3055\u308C\u305F\r\n\r\n\r\n\r\n\r\n\r\n\u30A8\u30C9\uFF0818\u6B73\uFF09\r\n\r\n\u30EA\u30B9\u30C6\u30A3\u30A2\u304C\u4F4F\u3080\u6751\u306B\u3042\u308B\u5546\u5E97\u306E\u606F\u5B50\r\n\r\n\u30EA\u30B9\u30C6\u30A3\u30A2\u3092\u81EA\u8EAB\u306E\u59B9\u306E\u3088\u3046\u306B\u601D\u3063\u3066\u3044\u308B\r\n\r\n\r\n\r\n\r\n\r\n\u30A4\u30B7\u30E5\u30E9\u30FB\u30B7\u30E9\u30F3\u30C9\u30EA\u30A2\uFF0831\u6B73\uFF09\u3000\u91D1\u9AEA\u306B\u30D0\u30A4\u30AA\u30EC\u30C3\u30C8\u306E\u77B3\r\n\r\n\u738B\u653F\u56FD\u5BB6\u30D5\u30A3\u30E9\u30F3\u30C7\u30EB\u306E\u56FD\u738B\r\n\r\n12\u6B73\u3067\u6B21\u671F\u738B\u5019\u88DC\u306B\u306A\u308A\u300117\u6B73\u3067\u56FD\u738B\u3068\u306A\u308B\r\n\r\n\u30EA\u30B9\u30C6\u30A3\u30A2\u306E\u6BCD\u3068\u306F\u738B\u5BAE\u3067\u958B\u304B\u308C\u305F\u821E\u8E0F\u4F1A\u3067\u51FA\u4F1A\u3044\u3001\u5074\u5BA4\u306B\r\n\r\n\u611B\u3057\u3066\u3044\u308B\u4EBA\u306E\u9858\u3044\u3092\u53F6\u3048\u308B\u70BA\u306B\u624B\u653E\u3057\u3001\u7121\u95A2\u5FC3\u3092\u88C5\u3044\u8010\u3048\u7D9A\u3051\u305F\r\n\r\n\r\n\r\n\r\n\r\n\u30EA\u30AA\u30EB\u30AC\u30FB\u30AF\u30E9\u30A6\u30C7\u30A3\u30B9\u30BF\uFF0818\u6B73\uFF09 \u80A9\u4E0B\u307E\u3067\u3042\u308B\u9577\u3044\u9280\u9AEA\u306B\u9752\u3044\u77B3\r\n\r\n\u56FD\u738B\u76F4\u5C5E\u5E38\u5099\u8ECD\u7B2C\u4E09\u90E8\u968A\u968A\u9577 \u77DB\u3068\u76FE\u3068\u547C\u3070\u308C\u308B\u4F2F\u7235\u5BB6\u306E\u5B50\u606F\r\n\r\n\u30A4\u30B7\u30E5\u30E9\u738B\u306E\u547D\u4EE4\u3067\u30EA\u30B9\u30C6\u30A3\u30A2\u3092\u6751\u307E\u3067\u8FCE\u3048\u306B\u884C\u304D\u3001\u738B\u5BAE\u3078\u9023\u308C\u3066\u6765\u305F\r\n\r\n\u30EA\u30B9\u30C6\u30A3\u30A2\u306B\u4EBA\u5916\u7591\u60D1\u3092\u304B\u3051\u3089\u308C\u308B\u307B\u3069\u306E\u7F8E\u5F62\u3067\u3001\u4E00\u898B\u3059\u308B\u3068\u51B7\u305F\u305D\u3046\u306A\u5370\u8C61\u3092\u53D7\u3051\u308B\u304C\u3001\u4E2D\u8EAB\u306F\u904E\u4FDD\u8B77\u3067\u53EF\u611B\u3089\u3057\u3044\r\n\r\n\r\n\r\n\r\n\r\n\u30B7\u30EA\u30EB\u30FB\u30AF\u30E9\u30A6\u30C7\u30A3\u30B9\u30BF\uFF0811\u6B73\uFF09 \u9280\u9AEA\u306B\u7070\u8272\u306E\u77B3\r\n\r\n\u30EA\u30AA\u30EB\u30AC\u306E\u5F1F\u3002\r\n\r\n\u6B73\u306E\u96E2\u308C\u305F\u5144\u306B\u53EF\u611B\u304C\u3089\u308C\u3001\u5FC5\u7136\u7684\u306B\u304A\u5144\u3061\u3083\u3093\u5927\u597D\u304D\u3063\u5B50\u306B\r\n\r\n\u7269\u8170\u67D4\u3089\u304B\u306A\u7F8E\u5C11\u5E74\u306B\u898B\u3048\u308B\u304C\u3001\u4E00\u7656\u3082\u3001\u4E8C\u7656\u3082\u3042\u308A\u6027\u683C\u306B\u96E3\u304C\u3042\u308B\r\n\r\n\r\n\r\n\r\n\r\n\u30E1\u30EA\u30A2\u30FB\u30A2\u30C3\u30BB\u30F3\uFF089\u6B73\uFF09 \u8336\u8272\u306E\u9AEA\u3068\u77B3\r\n\r\n\u7269\u8A9E\u306E\u30D2\u30ED\u30A4\u30F3\u3000\r\n\r\n\u738B\u5983\u3068\u306F\u89AA\u985E\u95A2\u4FC2\u306E\u7537\u7235\u4EE4\u5B22\r\n\r\n\u738B\u5983\u3068\u738B\u5B50\u4E8C\u4EBA\u306B\u53EF\u611B\u304C\u3089\u308C\u3001\u3053\u308C\u3068\u3044\u3063\u305F\u83EF\u306F\u306A\u3044\u304C\u611B\u3089\u3057\u3044\u5C11\u5973\r\n\r\n\u7D20\u76F4\u3067\u7A7A\u6C17\u304C\u8AAD\u3081\u305A\u3001\u81EA\u8EAB\u3092\u304A\u59EB\u69D8\u3060\u3068\u52D8\u9055\u3044\u3057\u3066\u3044\u308B\u7BC0\u304C\u3042\u308B\r\n\r\n\r\n\r\n\r\n\r\n\u30AF\u30EA\u30B9\u30FB\u30B7\u30E9\u30F3\u30C9\u30EA\u30A2\uFF0812\u6B73\uFF09\u3000\u8D64\u307F\u304C\u5F37\u3044\u91D1\u9AEA\u306B\u7D2B\u3068\u3044\u3046\u3088\u308A\u306F\u9752\u3088\u308A\u306E\u77B3\r\n\r\n\u30D5\u30A3\u30E9\u30F3\u30C7\u30EB\u56FD\u306E\u7B2C\u4E00\u738B\u5B50\u3001\u6B63\u5983\u306E\u5B50\r\n\r\n\u7A4F\u3084\u304B\u3067\u7E4A\u7D30\u305D\u3046\u306B\u898B\u3048\u308B\u304C\u2026\u2026\r\n\r\n\r\n\r\n\r\n\r\n\u30BD\u30EC\u30A4\u30EB\u30FB\u30B7\u30E9\u30F3\u30C9\u30EA\u30A2\uFF0811\u6B73\uFF09\u8D64\u307F\u304C\u5F37\u3044\u91D1\u9AEA\u306B\u3001\u7D2B\u3068\u3044\u3046\u3088\u308A\u306F\u8D64\u3088\u308A\u306E\u77B3\r\n\r\n\u30D5\u30A3\u30E9\u30F3\u30C7\u30EB\u56FD\u306E\u7B2C\u4E8C\u738B\u5B50\u3001\u6B63\u5983\u306E\u5B50\r\n\r\n\u30EA\u30B9\u30C6\u30A3\u30A2\u304C\u6C17\u306B\u5165\u3089\u305A\u4F55\u5EA6\u304B\u7A81\u3063\u304B\u304B\u308B\u304C\u3001\u305D\u306E\u5EA6\u306B\u7389\u7815\u3057\u3066\u3044\u308B\r\n\r\n\r\n\r\n\r\n\r\n\u30EB\u30A4\u30FC\u30C0\u30FB\u30B7\u30E9\u30F3\u30C9\u30EA\u30A2\uFF0833\uFF09 \u771F\u3063\u8D64\u306A\u9AEA\u3068\u9752\u3044\u77B3\r\n\r\n\u30D5\u30A3\u30E9\u30F3\u30C7\u30EB\u56FD\u306E\u4FAF\u7235\u4EE4\u5B22\r\n\r\n\u738B\u5983\u306B\u306A\u308B\u3088\u3046\u80B2\u3066\u3089\u308C\u305F\u7A76\u6975\u306E\u3054\u4EE4\u5B22\r\n\r\n\u8056\u6BCD\u3068\u8B33\u308F\u308C\u3066\u3044\u308B\u304C\u3001\u7121\u6148\u60B2\u3067\u51B7\u9177\u306A\u5973\u6027\r\n\r\n\u30EA\u30B9\u30C6\u30A3\u30A2\u304B\u3089\u306F\u72D0\u306B\u4F8B\u3048\u3089\u308C\u308B\u3053\u3068\u3082\r\n\r\n\r\n\r\n\r\n\r\n\u30B8\u30E5\u30EA\u30A2\u30DE\u30EA\u30A2\u30FB\u30B9\u30AB\u30EB\u30AD\r\n\r\n\u30EA\u30B9\u30C6\u30A3\u30A2\u306E\u6BCD\u3067\u30A4\u30B7\u30E5\u30E9\u738B\u306E\u5074\u5BA4\u3060\u3063\u305F\u5973\u6027\r\n\r\n\r\n\r\n\r\n\r\n\u300E\u738B\u5BAE\u5185\u300F\r\n\r\n\r\n\r\n\u30ED\u30FC\u30AC\u30C3\u30C8\u30FB\u30A2\u30DE\u30FC\u30C8\uFF0870\u6B73\uFF09\r\n\r\n\u30A4\u30B7\u30E5\u30E9\u738B\u306E\u88DC\u4F50\u3092\u3057\u3066\u3044\u308B\u57F7\u4E8B\r\n\r\n\r\n\r\n\r\n\r\n\u30EA\u30BF\u30FB\u30A2\u30DE\u30FC\u30C8\uFF0865\u6B73\uFF09\r\n\r\n\u30A4\u30B7\u30E5\u30E9\u738B\u306E\u4E73\u6BCD\u3001\u7D71\u62EC\u5BAE\u7B46\u982D\u4F8D\u5973\r\n\r\n\u73FE\u5F79\u306E\u4F8D\u5973\u3067\u3042\u308A\u3001\u30ED\u30FC\u30AC\u30C3\u30C8\u306E\u59BB\r\n\r\n\r\n\r\n\r\n\r\n\u30B8\u30FC\u30CA\u30FB\u30A2\u30DE\u30FC\u30C8\r\n\r\n\u30EA\u30BF\u306E\u5A18\u3067\u7D71\u62EC\u5BAE\u306E\u4F8D\u5973\r\n\r\n\u30EA\u30B9\u30C6\u30A3\u30A2\u306E\u5C02\u5C5E\r\n\r\n\r\n\r\n\r\n\r\n\u30A4\u30EB\u30C0\u30FB\u30B6\u30FC\u30CB\r\n\r\n\u30EA\u30BF\u306E\u59B9\u306E\u5A18\u3067\u7D71\u62EC\u5BAE\u306E\u4F8D\u5973\r\n\r\n\u30EA\u30B9\u30C6\u30A3\u30A2\u306E\u5C02\u5C5E"

function _splitNewlines(text) {
    const regex = /([^\S\r\n]+|\r?\n)/g;
    let parts = [];
    let lastIndex = 0;

    text.replace(regex, (match, p1, offset) => {
        if (offset > lastIndex) {
            parts.push({ type: 'text', content: text.slice(lastIndex, offset) });
        }
        parts.push({ type: 'format', content: match });
        lastIndex = offset + match.length;
    });

    if (lastIndex < text.length) {
        parts.push({ type: 'text', content: text.slice(lastIndex) });
    }

    return parts;
}


class Reader {
    constructor(container) {
        this.renderer = createMecabRenderer();
        this.container = container;

        this.src = "";
        this.bookmark = -1;
        this.title = "Untitled";
    }

    async render({src, title = "Untitled", bookmark = -1}) {
        this.src = src;
        this.bookmark = bookmark;
        this.title = title;

        this.container.innerHTML = '';

        const output = document.createDocumentFragment();
        const content = this.#buildReaderContent();

        // layout order
        output.appendChild(this.#buildHeader());
        output.appendChild(content);
        output.appendChild(this.#buildFooter());
        this.container.appendChild(output);

        await Mecab.waitReady();
        this.#renderReaderContent(content);

        // bookmark logic
        if (this.bookmark == -1) return;
        markToki(this.bookmark);
        scrollToBookmark();
    }

    saveBookmark(id){
        console.log("set bookmark to", id);
        this.bookmark = id;
    }

    saveTitle(txt){
        console.log("saved title as", txt);
        this.title=txt;
    }

    // -----------------------UI-------------------------

    #buildHeader(){

        const header = document.createElement('div');
        header.className = 'reader-header';

        const titleInput = document.createElement('input');
        titleInput.className = 'title-input';
        titleInput.type = 'text';
        titleInput.value = this.title;
        titleInput.addEventListener('change', (e) => {
            this.saveTitle(e.target.value);
        });
        header.appendChild(titleInput);

        const readingTime = document.createElement('div');
        readingTime.className = 'reading-time';
        readingTime.textContent = this.#calculateReadingTime(this.src);
        header.appendChild(readingTime);

        return header;
    }


    // build initial state for reader content
    #buildReaderContent(){
        const content = document.createElement('div');
        content.className = 'reader-content';

        // Add loading indicator
        const loadingIndicator = document.createElement('div');
        loadingIndicator.className = 'loading-indicator';
        loadingIndicator.textContent = 'Processing text...';
        content.appendChild(loadingIndicator);

        return content;
    }

    #renderReaderContent(content){
        const parts = this.#preprocessText(this.src);

        // Clear loading indicator
        content.innerHTML = '';

        for (const part of parts) {
            if (part.type === 'text') {
                let tokens = Mecab.query(part.content);
                content.appendChild(this.renderer.renderAnalysis(tokens));
            } else if (part.type === 'format') {
                if (part.content.includes('\n')) {
                    content.appendChild(document.createElement('br'));
                } else {
                    content.appendChild(document.createTextNode(part.content));
                }
            }
        }
    }

    #buildFooter(){
        const footer = document.createElement('div');
        footer.className = 'reader-footer';
        footer.innerHTML = '<div class="footer-content">✦</div>'; // Fleuron ornament

        return footer;
    }

    // ------------------Text Processing-----------------

    #preprocessText(text) {
        return _splitNewlines(text);
    }

    #calculateReadingTime(text) {
        // Simple reading time calculation (200 words per minute)
        const wordCount = text.length;
        const minutes = Math.ceil(wordCount / 100);
        return `${minutes} min read`;
    }
}


document.addEventListener('copy', function(e) {
    e.preventDefault();

    // Hide all rt elements
    const rtElements = document.querySelectorAll('rt');
    rtElements.forEach(el => el.style.visibility = 'hidden');

    // Get selection and set clipboard data
    const selection = window.getSelection().toString();
    e.clipboardData.setData('text', selection);

    // Show rt elements again
    rtElements.forEach(el => el.style.visibility = 'visible');
});

const settingsPanel = new SettingsPanel({
    showReading: true,
    showPronunciation: false
});

// Setup settings button
document.getElementById('settings-btn').addEventListener('click', () => {
  new Modal({
    title: 'Reader Settings',
    content: settingsPanel.render(),
    showCloseButton: true
  }).open();
});


function initBookmarkBtn(bookmarkButton, reader){
    if (bookmarkButton === undefined) return;

    // Click handler
    bookmarkButton.addEventListener('click', () => {
        scrollToBookmark();
    });

    // Drag and drop functionality
    bookmarkButton.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', 'bookmark');
        e.dataTransfer.effectAllowed = 'copy';
    });

    // Add dragover and drop handlers to all mecab tokens
    document.addEventListener('dragover', (e) => {
        const token = e.target.closest('.mecab-token');
        if (token) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';
        }
    });

    document.addEventListener('drop', (e) => {
        const token = e.target.closest('.mecab-token');
        if (token) {
            e.preventDefault();
            markElement(token);
            reader.saveBookmark(getBookmark());
        }
    });
}
// --------------------------------------------------

async function init(){
    let outarea = document.getElementById('outarea');
    const bookmarkButton = document.getElementById('bookmark-btn');
    let params = new URLSearchParams(document.location.search);
    let srcId = parseInt(params.get("id"), 10);

    if (!isNaN(srcId)) {
        console.log("Loading book " + srcId);
    }

    const book = await getTextById(srcId);
    const reader = new Reader(outarea);
    reader.render({
        title: book.title,
        src: book.content,
        bookmark: book.lastReadPosition
    });


    initBookmarkBtn(bookmarkButton, reader);
}

function readerInit() {
}

window.addEventListener('load', function() {
    init();
});

