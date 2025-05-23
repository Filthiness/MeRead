import Mecab from "../lib/mecab/mecab.js";
import { createMecabRenderer, } from "./mecab-renderer.js";
import { SettingsPanel } from "./ui/settings-panel.js";
import { Modal } from "./ui/common/modal.js";

import { BookmarkManager } from "/src/bookmark.js";
import * as api from "/src/api.js";


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
    constructor(container, {
        onSave = () => true,
    }) {
        this.renderer = createMecabRenderer();
        this.bman;
        this.container = container;

        this.onSave = onSave;

        this.src = "";
        this.id = -1;
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
        this.bman = new BookmarkManager(content);

        // layout order
        output.appendChild(this.#buildHeader());
        output.appendChild(content);
        output.appendChild(this.#buildFooter());
        this.container.appendChild(output);

        await Mecab.waitReady();
        this.#renderReaderContent(content);

        // bookmark logic
        if (this.bookmark == -1) return;
        this.bman.markToki(this.bookmark);
        this.bman.scrollToBookmark();
    }

    saveBookmark(bid){
        bid = (bid === undefined) ? this.bman.getBookmark() : bid;
        if (this.onSave("bookmark", {
            bid: bid
        })) {
            this.bookmark = bid;
            console.log("set bookmark to", bid);
        }
        else { /* TODO */ } 
    }

    saveTitle(txt){
        console.log("saved title as", txt);
        if (this.onSave("title", {
            newTitle: txt
        })) {
            this.title=txt;
        }
        else { /* TODO */}
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

// --------------------------------------------------

function readerSaverT(id, saveType, dat){
    if (saveType === "bookmark"){
        api.updateText(id, { last_read_position: dat.bid })
        return true;
    }
    else if (saveType === "title"){
        api.updateText(id, { title: dat.newTitle })
        return true;
    }
    return false;
}

// --------------------------------------------------

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

function initTopBar(){
    const topBar = document.getElementById('top-bar');
    let lastScrollPosition = window.pageYOffset || document.documentElement.scrollTop;
    
    window.addEventListener('scroll', () => {
        const currentScrollPosition = window.pageYOffset || document.documentElement.scrollTop;
        
        if (currentScrollPosition > lastScrollPosition) {
            // Scrolling down
            topBar.classList.add('contracted');
        } else {
            // Scrolling up
            topBar.classList.remove('contracted');
        }
        
        lastScrollPosition = currentScrollPosition;
    });
}


function initBotBar(){
    const barElement = document.querySelector('floating-bottom-bar');

    // no-ops should toggle the bar(s)
    document.addEventListener('click', (e) => {
        const cl = e.target.classList;
        const noop = cl.contains('mecab-analysis')
            || cl.contains('reader-content')
            || e.target.id === "container"
            || e.target.id === "outarea"
            || e.target === document.body
            || e.target === document.documentElement

        if (noop) {
            barElement.toggle();
        }
    });
}

function initBookmarkBtn(bookmarkButton, reader){
    if (bookmarkButton === undefined) return;

    // Click handler
    bookmarkButton.addEventListener('click', () => {
        reader.bman.scrollToBookmark();
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
            reader.bman.markElement(token);
            reader.saveBookmark();
        }
    });
}

// --------------------------------------------------

async function init(){
    initBotBar();
    initTopBar();

    let outarea = document.getElementById('outarea');
    const bookmarkButton = document.getElementById('bookmark-btn');
    let params = new URLSearchParams(document.location.search);
    let srcId = parseInt(params.get("id"), 10);

    if (!isNaN(srcId)) {
        console.log("Loading book " + srcId);
    }

    const book = await api.getTextById(srcId);

    const readerSaver = readerSaverT.bind(null, srcId);
    const reader = new Reader(outarea, {
        onSave: readerSaver
    });
    reader.render({
        title: book.title,
        src: book.content,
        bookmark: book.lastReadPosition
    });


    initBookmarkBtn(bookmarkButton, reader);
}

window.addEventListener('load', function() {
    init();
});

