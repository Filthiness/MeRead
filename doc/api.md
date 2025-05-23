**SQL DDL for `texts` table:**

```sql
CREATE TABLE IF NOT EXISTS texts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_read_position INTEGER DEFAULT 0,
    last_read_timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## API Endpoints Design (RESTful)

Standard RESTful conventions for the API. All responses will be JSON.

*   **`GET /api/texts`**
    *   **Description:** Retrieve a list of all texts.
    *   **Response:** `Array` of text objects (excluding full content for brevity in the list, but including metadata).
    *   **Example Response:**
        ```json
        [
            {
                "id": 1,
                "title": "吾輩は猫である",
                "preview_content": "吾輩は猫である。名前はまだ無い。...", // Truncated content for display
                "createdAt": "2023-10-26T10:00:00Z",
                "updatedAt": "2023-10-26T11:30:00Z",
                "lastReadPosition": 120,
                "lastReadTimestamp": "2023-10-26T11:25:00Z"
            },
            // ... more texts
        ]
        ```

*   **`GET /api/texts/:id`**
    *   **Description:** Retrieve a single text by its ID.
    *   **Parameters:** `:id` (integer) - The ID of the text.
    *   **Response:** Single text object with full content.
    *   **Example Response:**
        ```json
        {
            "id": 1,
            "title": "吾輩は猫である",
            "content": "吾輩は猫である。名前はまだ無い。...", // Full content
            "createdAt": "2023-10-26T10:00:00Z",
            "updatedAt": "2023-10-26T11:30:00Z",
            "lastReadPosition": 120,
            "lastReadTimestamp": "2023-10-26T11:25:00Z"
        }
        ```

*   **`POST /api/texts`**
    *   **Description:** Create a new text entry.
    *   **Request Body:** `JSON` object with `title` and `content`.
    *   **Example Request Body:**
        ```json
        {
            "title": "新しい物語",
            "content": "これは新しい物語の本文です。"
        }
        ```
    *   **Response:** The newly created text object, including its `id` and timestamps.

*   **`PUT /api/texts/:id`**
    *   **Description:** Update an existing text by its ID. Can update title, content, or last read position/timestamp.
    *   **Parameters:** `:id` (integer) - The ID of the text to update.
    *   **Request Body:** `JSON` object with fields to update (e.g., `title`, `content`, `last_read_position`, `last_read_timestamp`). `updated_at` will be automatically set on the server.
    *   **Example Request Body (Full Update):**
        ```json
        {
            "title": "更新された物語",
            "content": "これは更新された物語の本文です。"
        }
        ```
    *   **Example Request Body (Bookmark Update):**
        ```json
        {
            "last_read_position": 250,
            "last_read_timestamp": "2023-10-26T14:45:00Z"
        }
        ```
    *   **Response:** The updated text object.

*   **`DELETE /api/texts/:id`**
    *   **Description:** Delete a text by its ID.
    *   **Parameters:** `:id` (integer) - The ID of the text to delete.
    *   **Response:** `204 No Content` on successful deletion.

## 4. Configuration (JSON)

We'll create a `config.json` file for settings like the database path and server port.

**`config.json`**

```json
{
  "port": 3000,
  "databasePath": "./data/bookshelf.db"
}
```
