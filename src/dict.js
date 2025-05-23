// proxied fetch
function pfetch(resource, options = {}) {
  // Get the URL from the resource
  let url;
  if (resource instanceof Request) {
    url = resource.url;
    // Create a new Request object with the same properties
    options = {
      method: resource.method,
      headers: resource.headers,
      body: resource.body,
      mode: resource.mode,
      credentials: resource.credentials,
      cache: resource.cache,
      redirect: resource.redirect,
      referrer: resource.referrer,
      referrerPolicy: resource.referrerPolicy,
      integrity: resource.integrity,
      keepalive: resource.keepalive,
      signal: resource.signal,
      ...options
    };
  } else {
    url = resource instanceof URL ? resource.href : resource;
  }

  // Check if the URL is already a proxied URL or a relative URL
  if (url.startsWith('/proxy/') || url.startsWith('/') && !url.startsWith('//')) {
    // It's already proxied or a local URL, use native fetch
    return fetch(url, options);
  }

  // Create the proxied URL
  const proxiedUrl = `/proxy/${encodeURIComponent(url)}`;
  
  // Call the native fetch with the proxied URL
  return fetch(proxiedUrl, options);
}


// --------------------------------------------------


class JishoAPI {
  /**
   * Search for Japanese words or phrases using the Jisho API
   * @param {string} query - The search term (can be English, Japanese, or romaji)
   * @returns {Promise<Object>} - The API response data
   */
  static async search(query) {
    try {
      const response = await pfetch(`https://jisho.org/api/v1/search/words?keyword=${encodeURIComponent(query)}`);
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching from Jisho API:', error);
      return {
        meta: {
          status: 500,
          error: error.message
        },
        data: []
      };
    }
  }
}


class JishoRenderer {
    constructor(container) {
        this.container = container;
        if (!this.container) {
            console.error("Container element not found");
            return;
        }
    }
    
    render(data) {
        if (!data || !data.data || !data.data.length) {
            this.container.innerHTML = "<div class='jisho-renderer'>No results found</div>";
            return;
        }
        
        const wrapper = document.createElement('div');
        wrapper.className = 'jisho-renderer';
        
        data.data.forEach(entry => {
            wrapper.appendChild(this.createEntry(entry));
        });
        
        this.container.innerHTML = '';
        this.container.appendChild(wrapper);
    }
    
    createEntry(entry) {
        const entryEl = document.createElement('div');
        entryEl.className = 'jr-entry';
        
        // Create header with word, reading, and common tag
        const header = document.createElement('div');
        header.className = 'jr-word-header';
        
        const wordEl = document.createElement('span');
        wordEl.className = 'jr-word';
        wordEl.textContent = entry.japanese[0].word || '';
        
        const readingEl = document.createElement('span');
        readingEl.className = 'jr-reading';
        readingEl.textContent = entry.japanese[0].reading || '';
        
        header.appendChild(wordEl);
        header.appendChild(readingEl);
        
        if (entry.is_common) {
            const commonTag = document.createElement('span');
            commonTag.className = 'jr-common-tag';
            commonTag.textContent = 'common';
            header.appendChild(commonTag);
        }
        
        entryEl.appendChild(header);
        
        // Add alternative readings/variants if they exist
        if (entry.japanese.length > 1) {
            const variantsEl = document.createElement('div');
            variantsEl.className = 'jr-variant';
            
            const variantTexts = entry.japanese.slice(1).map(j => {
                return `${j.word || ''}${j.reading ? ` (${j.reading})` : ''}`;
            });
            
            variantsEl.textContent = `Also: ${variantTexts.join(', ')}`;
            entryEl.appendChild(variantsEl);
        }
        
        // Add senses (definitions)
        entry.senses.forEach(sense => {
            // Skip Wikipedia definitions
            if (sense.parts_of_speech.includes('Wikipedia definition')) return;
            
            const senseEl = document.createElement('div');
            senseEl.className = 'jr-sense';
            
            const posEl = document.createElement('div');
            posEl.className = 'jr-pos';
            posEl.textContent = this.formatPartsOfSpeech(sense.parts_of_speech);
            
            const defEl = document.createElement('div');
            defEl.className = 'jr-definition';
            defEl.textContent = sense.english_definitions.join(', ');
            
            senseEl.appendChild(posEl);
            senseEl.appendChild(defEl);
            entryEl.appendChild(senseEl);
        });
        
        return entryEl;
    }
    
    formatPartsOfSpeech(parts) {
        return parts
            .filter(p => p !== 'Wikipedia definition')
            .map(p => p.replace(/^Noun, /, ''))
            .join(' • ');
    }
}

export {
    JishoRenderer,
    JishoAPI,
}

