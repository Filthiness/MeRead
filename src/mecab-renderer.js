import { JishoAPI, JishoRenderer } from "./dict.js";
import { Modal } from "./ui/common/modal.js";

function _k2h(text){
  return text.replace(/[\u30A1-\u30F6]/g, function(match) {
    const charCode = match.charCodeAt(0) - 0x60;
    return String.fromCharCode(charCode);
  });
}

function _rubyable(str) {
  const isPureKana = /^[\u3040-\u309F\u30A0-\u30FF\uFF65-\uFF9F]*$/.test(str);
  
  // CJK Unified Ideographs and extensions, but excluding:
  // - General punctuation (U+3000-303F) except for 々 (U+3005), 〻 (U+303B), and repetition marks
  // - CJK Symbols and Punctuation (U+3000-303F) that aren't relevant for pronunciation
  const hasRubyableChars = /[\u4E00-\u9FFF\u31F0-\u31FF\u3400-\u4DBF\uF900-\uFAFF]|[\uD840-\uD87F][\uDC00-\uDFFF]/.test(str) || 
    /[\u3005\u303B\u303C]/.test(str); // Include specific symbols that need ruby
  
  return !isPureKana && hasRubyableChars;
}

// --------------------------------------------------

// renderer.js
export function createMecabRenderer(options = {}) {
  const defaults = {
    showReading: true,
    showPronunciation: false,
    baseColors: {
      名詞: '#ffecec',
      助詞: '#ecf7ec',
      助動詞: '#ececf7',
      動詞: '#ffffd6',
      形容詞: '#f7ecf7',
      副詞: '#ecf7f7',
      連体詞: '#ffebd6',
      接続詞: '#d6ebf7',
      感動詞: '#ffd6eb',
      記号: '#e6e6e6',
    },
    expandedColors: {
      名詞: '#ffc9c9',
      助詞: '#c9e9c9',
      助動詞: '#c9c9e9',
      動詞: '#ffff99',
      形容詞: '#f0c9f0',
      副詞: '#c9e9e9',
      連体詞: '#ffd8b0',
      接続詞: '#b0d8f7',
      感動詞: '#ffb0d8',
      記号: '#d0d0d0',
    },
    baseClass: 'mecab-token',
    rubyClass: 'mecab-ruby',
    posDetailClass: 'mecab-pos-detail'
  };

  const config = { ...defaults, ...options };

  function createTokenNode(token) {
    const container = document.createElement('span');
    container.className = config.baseClass;
    
    // Set POS attribute for CSS targeting
    container.setAttribute('data-pos', token.pos);

    // Main word with optional ruby
    const wordSpan = document.createElement('span');
    wordSpan.className = 'mecab-word';
    wordSpan.textContent = token.word;
    
  
    if (config.showReading && token.reading && token.reading !== '*' && _rubyable(token.word)) {
      const ruby = document.createElement('ruby');
      ruby.className = config.rubyClass;
      ruby.appendChild(wordSpan.cloneNode(true));
      
      const rt = document.createElement('rt');
      rt.textContent = _k2h(token.reading);
      ruby.appendChild(rt);
      
      container.appendChild(ruby);
    } else {
      container.appendChild(wordSpan);
    }

    // Pronunciation if enabled
    if (config.showPronunciation && token.pronunciation && 
        token.pronunciation !== '*' && token.pronunciation !== token.reading) {
      const pron = document.createElement('span');
      pron.className = 'mecab-pronunciation';
      pron.textContent = ` (${token.pronunciation})`;
      container.appendChild(pron);
    }

    container.addEventListener('click', async (e) => {
      e.stopPropagation();
      const posContainer = await createTokenDetail(token);
      new Modal({
        title: token.word,
        content: posContainer,
      }).open();
    
    }); // container.addEventListener('click')

    return container;
  }

  async function createTokenDetail(token){
    // POS details (hidden by default)
    const posDetail = document.createElement('div');
    posDetail.className = config.posDetailClass;
    
    let detailText = token.pos;
    if (token.pos_detail1 && token.pos_detail1 !== '*') {
      detailText += `・${token.pos_detail1}`;
      if (token.pos_detail2 && token.pos_detail2 !== '*') {
        detailText += `・${token.pos_detail2}`;
      }
    }
    
    // dictionary lookup container
    const dictContainer = document.createElement('div');
    dictContainer.className = 'jr-container';
    dictContainer.style.width = '75vw';
    dictContainer.innerHTML = '<div class="jr-loading">Loading...</div>';
    
    posDetail.textContent = detailText;
    _loadDictContent(token.word, dictContainer);
    posDetail.appendChild(dictContainer);

    return posDetail;
  }

  async function _loadDictContent(word, container){
    const dictRenderer = new JishoRenderer(container);
    const res = await JishoAPI.search(word);
    dictRenderer.render(res);
  }

  // --------------------------------------------------
  
  function renderAnalysis(tokens) {
    const fragment = document.createDocumentFragment();
    const wrapper = document.createElement('div');
    wrapper.className = 'mecab-analysis';
    
    tokens.forEach(token => {
      const tokenNode = createTokenNode(token);
      wrapper.appendChild(tokenNode);
      wrapper.appendChild(document.createTextNode(' '));
    });
    
    fragment.appendChild(wrapper);
    return fragment;
  }

  return {
    renderAnalysis
  };
}

