export const getBookmark = () => 
    Array.from(document.querySelectorAll('.mecab-token')).findIndex(el => 
        el.classList.contains('bookmarked')
    );

export function scrollToBookmark() {
    document.querySelectorAll('.bookmarked').forEach(el => {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return true; 
    });
    return false;
}

export function markElement(el) {
    // Remove any existing bookmarks first
    document.querySelectorAll('.bookmarked').forEach(el => {
        el.classList.remove('bookmarked');
    });

    el.classList.add('bookmarked');
}

export function markToki(i){
    const tok = document.querySelectorAll('.mecab-token')[i]

    if (tok === undefined) return false;

    markElement(tok);
    return true;
}

export class BookmarkManager{
    constructor(container){
        this.container = container;
    }

    getBookmark(){
        return Array.from(this.container.querySelectorAll('.mecab-token')).findIndex(el => 
            el.classList.contains('bookmarked')
        );
    }

    scrollToBookmark() {
        this.container.querySelectorAll('.bookmarked').forEach(el => {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return true; 
        });
        return false;
    }

    markElement(el) {
        // Remove any existing bookmarks first
        this.container.querySelectorAll('.bookmarked').forEach(el => {
            el.classList.remove('bookmarked');
        });

        el.classList.add('bookmarked');
    }

    markToki(i){
        const tok = this.container.querySelectorAll('.mecab-token')[i]

        if (tok === undefined) return false;

        markElement(tok);
        return true;
    }
}

// ----------------------init------------------------


// setInterval(() => {
//     console.log(getBookmark());
// }, 2000)

