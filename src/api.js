const API_BASE_URL = '/api';

/**
 * Fetches all texts (with preview content)
 * @returns {Promise<Array>} Array of text objects
 */
export async function getAllTexts() {
  const response = await fetch(`${API_BASE_URL}/texts`);
  if (!response.ok) {
    throw new Error(`Failed to fetch texts: ${response.statusText}`);
  }
  return await response.json();
}

/**
 * Fetches a single text by ID (with full content)
 * @param {number} id - The ID of the text to fetch
 * @returns {Promise<Object>} The text object
 */
export async function getTextById(id) {
  const response = await fetch(`${API_BASE_URL}/texts/${id}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch text ${id}: ${response.statusText}`);
  }
  return await response.json();
}

/**
 * Creates a new text entry
 * @param {Object} textData - The text data to create
 * @param {string} textData.title - The title of the text
 * @param {string} textData.content - The content of the text
 * @returns {Promise<Object>} The newly created text object
 */
export async function createText({ title, content }) {
  const response = await fetch(`${API_BASE_URL}/texts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title, content }),
  });
  if (!response.ok) {
    throw new Error(`Failed to create text: ${response.statusText}`);
  }
  return await response.json();
}

/**
 * Updates a text entry (full or partial update)
 * @param {number} id - The ID of the text to update
 * @param {Object} updateData - The data to update
 * @param {string} [updateData.title] - The new title (optional)
 * @param {string} [updateData.content] - The new content (optional)
 * @param {number} [updateData.last_read_position] - The last read position (optional)
 * @param {string} [updateData.last_read_timestamp] - The last read timestamp (optional)
 * @returns {Promise<Object>} The updated text object
 */
export async function updateText(id, updateData) {
  const response = await fetch(`${API_BASE_URL}/texts/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updateData),
  });
  if (!response.ok) {
    throw new Error(`Failed to update text ${id}: ${response.statusText}`);
  }
  return await response.json();
}

/**
 * Updates only the reading progress of a text
 * @param {number} id - The ID of the text to update
 * @param {number} position - The last read position
 * @param {string} [timestamp] - Optional timestamp (defaults to current time)
 * @returns {Promise<Object>} The updated text object
 */
export async function updateReadingProgress(id, position, timestamp = new Date().toISOString()) {
  return updateText(id, {
    last_read_position: position,
    last_read_timestamp: timestamp,
  });
}

/**
 * Deletes a text entry
 * @param {number} id - The ID of the text to delete
 * @returns {Promise<void>}
 */
export async function deleteText(id) {
  const response = await fetch(`${API_BASE_URL}/texts/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error(`Failed to delete text ${id}: ${response.statusText}`);
  }
  // No content to return on successful deletion (204)
}
