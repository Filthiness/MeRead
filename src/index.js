import { Modal } from '/src/ui/common/modal.js';
import { 
    getAllTexts,
    getTextById,
    updateText,
    createText,
    deleteText,
} from '/src/api.js';


let books = [];

// DOM elements
const bookList = document.getElementById('book-list');
const emptyState = document.getElementById('empty-state');
const addBookBtn = document.getElementById('add-book-btn');

// Render book list
async function renderBooks() {
    const books = await getAllTexts();

    bookList.innerHTML = '';
    
    if (books.length === 0) {
        bookList.appendChild(emptyState);
        emptyState.style.display = 'block';
        return;
    }
    
    emptyState.style.display = 'none';
    
    books.forEach(book => {
        const bookCard = document.createElement('div');
        bookCard.className = 'book-card';
        bookCard.dataset.id = book.id;
        
        const preview = book.preview_content.length > 50 
            ? book.preview_content.substring(0, 50) + '...' 
            : book.preview_content;
        
        const dateStr = book.updatedAt;
        
        bookCard.innerHTML = `
            <div class="book-actions">
                <button class="action-btn edit-btn" title="Edit">
                    <svg width="14" height="14" viewBox="0 0 24 24"><path fill="currentColor" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
                </button>
                <button class="action-btn delete-btn" title="Delete">
                    <svg width="14" height="14" viewBox="0 0 24 24"><path fill="currentColor" d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
                </button>
            </div>
            <h3 class="book-title">${book.title}</h3>
            <p class="book-preview">${preview}</p>
            <div class="book-meta">
                <span>Last updated: ${dateStr}</span>
                <a href="./reader.html?id=${book.id}" class="open-link">Read →</a>
            </div>
        `;
        
        bookList.appendChild(bookCard);
    });
    
    // Add event listeners to action buttons
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const bookId = parseInt(e.target.closest('.book-card').dataset.id);
            const book = books.find(b => b.id === bookId);
            if (book) showEditModal(book);
        });
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const bookId = parseInt(e.target.closest('.book-card').dataset.id);
            showDeleteConfirm(bookId);
        });
    });
}

// Show add book modal
function showAddModal() {
    const form = document.createElement('form');
    form.className = 'add-book-form';
    
    form.innerHTML = `
        <div class="form-group">
            <label for="book-title">Title</label>
            <input type="text" id="book-title" required>
        </div>
        <div class="form-group">
            <label for="book-content">Content</label>
            <textarea id="book-content" required></textarea>
        </div>
        <div class="form-actions">
            <button type="button" class="cancel-btn">Cancel</button>
            <button type="submit" class="save-btn">Save</button>
        </div>
    `;
    
    const modal = new Modal({
        title: 'Add New Text',
        content: form,
        showCloseButton: true
    }).open();
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const title = document.getElementById('book-title').value;
        const content = document.getElementById('book-content').value;
        

        await createText({
            title: title,
            content: content
        });

        renderBooks();
        modal.close();
    });
    
    form.querySelector('.cancel-btn').addEventListener('click', () => {
        modal.close();
    });
}

// Show edit book modal
async function showEditModal(book) {
    const form = document.createElement('form');
    const fullBook = await getTextById(book.id);

    let bookContent = "Couldn't load content";
    if ((fullBook) !== undefined) bookContent = fullBook.content;

    form.className = 'add-book-form';

    form.innerHTML = `
        <div class="form-group">
            <label for="book-title">Title</label>
            <input type="text" id="book-title" value="${book.title}" required>
        </div>
        <div class="form-group">
            <label for="book-content">Content</label>
            <textarea id="book-content" required>${bookContent}</textarea>
        </div>
        <div class="form-actions">
            <button type="button" class="cancel-btn">Cancel</button>
            <button type="submit" class="save-btn">Save</button>
        </div>
    `;

    const modal = new Modal({
        title: 'Edit Text',
        content: form,
        showCloseButton: true
    }).open();

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const title = document.getElementById('book-title').value;
        const content = document.getElementById('book-content').value;

        // Update book
        await updateText(book.id, {
            title: title,
            content: content,
        })
        
        renderBooks();
        modal.close();
    });
    
    form.querySelector('.cancel-btn').addEventListener('click', () => {
        modal.close();
    });
}

// Show delete confirmation
function showDeleteConfirm(bookId) {
    new Modal({
        title: 'Confirm Delete',
        content: 'Are you sure you want to delete this text? This action cannot be undone.',
        buttons: [
            {
                text: 'Cancel',
                className: 'cancel-btn',
                closeOnClick: true
            },
            {
                text: 'Delete',
                className: 'delete-btn',
                onClick: async () => {
                    await deleteText(bookId)
                    renderBooks();
                },
                closeOnClick: true
            }
        ]
    }).open();
}

// Initialize
addBookBtn.addEventListener('click', showAddModal);
renderBooks();

