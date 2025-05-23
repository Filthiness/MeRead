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

        this.markElement(tok);
        return true;
    }
}

// ----------------------init------------------------


// setInterval(() => {
//     console.log(getBookmark());
// }, 2000)

