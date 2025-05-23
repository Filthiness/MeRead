const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const url = require('url');

const initSqlJs = require('./lib/sqlite/sql-wasm.js');

// Load configuration
const config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));
const PORT = config.port || 3000;
const STATIC_DIR = path.join(__dirname, '/');
const DB_PATH = config.databasePath;

let db;
let SQL;

// Initialize SQL.js and database
async function initializeDatabase() {
  try {
    SQL = await initSqlJs({
      locateFile: file => `./lib/sqlite/${file}`
    });

    // Check if database file exists
    let dbExists = fs.existsSync(DB_PATH);
    
    if (dbExists) {
      const fileBuffer = fs.readFileSync(DB_PATH);
      db = new SQL.Database(fileBuffer);
    } else {
      // Create new database
      db = new SQL.Database();
      // Create directory if it doesn't exist
      const dir = path.dirname(DB_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    }

    // Create tables if they don't exist
    db.exec(`
      CREATE TABLE IF NOT EXISTS texts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_read_position INTEGER DEFAULT 0,
        last_read_timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    if (!dbExists) {
      // Save the new database to file
      const data = db.export();
      fs.writeFileSync(DB_PATH, Buffer.from(data));
    }

    console.log('Database initialized successfully');
  } catch (err) {
    console.error('Database initialization failed:', err);
    process.exit(1);
  }
}

// --------------------------------------------------

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);

  // Handle API requests
  if (parsedUrl.pathname.startsWith('/api/texts')) {
    await handleApiRequest(req, res, parsedUrl);
    return;
  }

  // Handle proxy requests
  if (parsedUrl.pathname.startsWith('/proxy/')) {
    handleProxy(req, res, parsedUrl);
    return;
  }

  // Handle static files
  serveStaticFile(res, parsedUrl.pathname);
});

// --------------------------------------------------

async function handleApiRequest(req, res, parsedUrl) {
  try {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');

    // GET /api/texts - List all texts
    if (req.method === 'GET' && parsedUrl.pathname === '/api/texts') {
      const stmt = db.prepare(`
        SELECT 
          id, 
          title, 
          substr(content, 1, 100) as preview_content,
          created_at as createdAt,
          updated_at as updatedAt,
          last_read_position as lastReadPosition,
          last_read_timestamp as lastReadTimestamp
        FROM texts
      `);
      
      const texts = [];
      while (stmt.step()) {
        texts.push(stmt.getAsObject());
      }
      stmt.free();
      
      res.end(JSON.stringify(texts));
      return;
    }

    // GET /api/texts/:id - Get single text
    const matchSingle = parsedUrl.pathname.match(/^\/api\/texts\/(\d+)$/);
    if (req.method === 'GET' && matchSingle) {
      const id = parseInt(matchSingle[1]);
      const stmt = db.prepare(`
        SELECT 
          id, 
          title, 
          content,
          created_at as createdAt,
          updated_at as updatedAt,
          last_read_position as lastReadPosition,
          last_read_timestamp as lastReadTimestamp
        FROM texts
        WHERE id = ?
      `);
      
      stmt.bind([id]);
      if (stmt.step()) {
        res.end(JSON.stringify(stmt.getAsObject()));
      } else {
        res.statusCode = 404;
        res.end(JSON.stringify({ error: 'Text not found' }));
      }
      stmt.free();
      return;
    }

    // POST /api/texts - Create new text
    if (req.method === 'POST' && parsedUrl.pathname === '/api/texts') {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', async () => {
        try {
          const { title, content } = JSON.parse(body);
          if (!title || !content) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'Title and content are required' }));
            return;
          }

          const stmt = db.prepare(`
            INSERT INTO texts (title, content)
            VALUES (?, ?)
          `);
          
          stmt.bind([title, content]);
          stmt.step();
          stmt.free();
          
          // Get the inserted record
          const lastId = db.exec("SELECT last_insert_rowid()")[0].values[0][0];
          const selectStmt = db.prepare(`
            SELECT * FROM texts WHERE id = ?
          `);
          selectStmt.bind([lastId]);
          selectStmt.step();
          const newText = selectStmt.getAsObject();
          selectStmt.free();
          
          // Save database to file
          const data = db.export();
          fs.writeFileSync(DB_PATH, Buffer.from(data));
          
          res.statusCode = 201;
          res.end(JSON.stringify({
            id: newText.id,
            title: newText.title,
            content: newText.content,
            createdAt: newText.created_at,
            updatedAt: newText.updated_at,
            lastReadPosition: newText.last_read_position,
            lastReadTimestamp: newText.last_read_timestamp
          }));
        } catch (err) {
          res.statusCode = 400;
          res.end(JSON.stringify({ error: 'Invalid request body' }));
        }
      });
      return;
    }

    // PUT /api/texts/:id - Update text
    if (req.method === 'PUT' && matchSingle) {
      const id = parseInt(matchSingle[1]);
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', async () => {
        try {
          const { title, content, last_read_position, last_read_timestamp } = JSON.parse(body);
          
          // Check if text exists
          const checkStmt = db.prepare('SELECT 1 FROM texts WHERE id = ?');
          checkStmt.bind([id]);
          if (!checkStmt.step()) {
            res.statusCode = 404;
            res.end(JSON.stringify({ error: 'Text not found' }));
            checkStmt.free();
            return;
          }
          checkStmt.free();
          
          let updateFields = [];
          let params = [];
          
          if (title !== undefined) {
            updateFields.push('title = ?');
            params.push(title);
          }
          if (content !== undefined) {
            updateFields.push('content = ?');
            params.push(content);
          }
          if (last_read_position !== undefined) {
            updateFields.push('last_read_position = ?');
            params.push(last_read_position);
          }
          if (last_read_timestamp !== undefined) {
            updateFields.push('last_read_timestamp = ?');
            params.push(last_read_timestamp);
          }
          
          // Always update updated_at
          updateFields.push('updated_at = CURRENT_TIMESTAMP');
          
          if (updateFields.length === 1) { // Only updated_at
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'No fields to update' }));
            return;
          }
          
          const query = `
            UPDATE texts
            SET ${updateFields.join(', ')}
            WHERE id = ?
          `;
          
          params.push(id);
          const stmt = db.prepare(query);
          stmt.bind(params);
          stmt.step();
          stmt.free();
          
          // Get the updated record
          const selectStmt = db.prepare('SELECT * FROM texts WHERE id = ?');
          selectStmt.bind([id]);
          selectStmt.step();
          const updatedText = selectStmt.getAsObject();
          selectStmt.free();
          
          // Save database to file
          const data = db.export();
          fs.writeFileSync(DB_PATH, Buffer.from(data));
          
          res.end(JSON.stringify({
            id: updatedText.id,
            title: updatedText.title,
            content: updatedText.content,
            createdAt: updatedText.created_at,
            updatedAt: updatedText.updated_at,
            lastReadPosition: updatedText.last_read_position,
            lastReadTimestamp: updatedText.last_read_timestamp
          }));
        } catch (err) {
          res.statusCode = 400;
          res.end(JSON.stringify({ error: 'Invalid request body' }));
        }
      });
      return;
    }

    // DELETE /api/texts/:id - Delete text
    if (req.method === 'DELETE' && matchSingle) {
      const id = parseInt(matchSingle[1]);
      
      const stmt = db.prepare('DELETE FROM texts WHERE id = ?');
      stmt.bind([id]);
      stmt.step();  // step() doesn't return a boolean
      stmt.free();
      
      // Check if any rows were actually deleted
      const changes = db.getRowsModified();
      if (changes > 0) {
        // Save database to file
        const data = db.export();
        fs.writeFileSync(DB_PATH, Buffer.from(data));
        
        res.statusCode = 204;
        res.end();
      } else {
        res.statusCode = 404;
        res.end(JSON.stringify({ error: 'Text not found' }));
      }
      return;
    }

    // No matching API route
    res.statusCode = 404;
    res.end(JSON.stringify({ error: 'Not found' }));
  } catch (err) {
    console.error('API error:', err);
    res.statusCode = 500;
    res.end(JSON.stringify({ error: 'Internal server error' }));
  }
}

function handleProxy(req, res, parsedUrl) {
  // (Existing proxy code remains the same)
  // Extract the target URL from the path (after /proxy/)
  const targetUrlEncoded = parsedUrl.pathname.slice(7); // Remove '/proxy/'
  const targetUrl = decodeURIComponent(targetUrlEncoded);
  
  // Parse the target URL
  const targetParsedUrl = url.parse(targetUrl);
  
  // Select http or https module based on protocol
  const httpModule = targetParsedUrl.protocol === 'https:' ? https : http;
  
  // Create options for the proxy request
  const options = {
    hostname: targetParsedUrl.hostname,
    port: targetParsedUrl.port || (targetParsedUrl.protocol === 'https:' ? 443 : 80),
    path: targetParsedUrl.path,
    method: req.method,
    headers: {
      ...req.headers,
      host: targetParsedUrl.host
    }
  };
  
  // Remove headers that would cause issues
  delete options.headers['host'];
  delete options.headers['connection'];
  
  // Make the proxy request
  const proxyReq = httpModule.request(options, proxyRes => {
    // Forward the status code
    res.statusCode = proxyRes.statusCode;
    
    // Forward the headers
    Object.keys(proxyRes.headers).forEach(key => {
      res.setHeader(key, proxyRes.headers[key]);
    });
    
    // Forward the response body
    proxyRes.pipe(res);
  });
  
  // Handle errors
  proxyReq.on('error', error => {
    console.error('Proxy request error:', error);
    res.statusCode = 500;
    res.end(`Proxy error: ${error.message}`);
  });
  
  // Forward the request body if any
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    req.pipe(proxyReq);
  } else {
    proxyReq.end();
  }
}

function serveStaticFile(res, pathname) {
  // (Existing static file code remains the same)
  let filePath = path.join(STATIC_DIR, pathname === '/' ? 'index.html' : pathname);
  filePath = path.normalize(filePath).replace(/\\/g, '/'); 
  
  // Read file with UTF-8 encoding for text files
  fs.readFile(filePath, (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.statusCode = 404;
        res.end('404 Not Found');
        return;
      }
      res.statusCode = 500;
      res.end(`Server Error: ${err.code}`);
      return;
    }
    
    const ext = path.extname(filePath).toLowerCase();
    const contentTypes = {
      '.html': 'text/html; charset=utf-8',
      '.js': 'text/javascript; charset=utf-8',
      '.css': 'text/css; charset=utf-8',
      '.json': 'application/json; charset=utf-8',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
      '.txt': 'text/plain; charset=utf-8',
      '.wasm': 'application/wasm'
    };
    
    const contentType = contentTypes[ext] || 'application/octet-stream';
    
    res.setHeader('Content-Type', contentType);
    res.end(data);
  });
}

// --------------------------------------------------

// Initialize database and start server
initializeDatabase().then(() => {
  server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
  });
}).catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});
