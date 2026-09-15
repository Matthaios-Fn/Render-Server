const http = require('http');
const fs = require('fs');
const path = require('path');
const PORT = 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');
console.log("Server starting...");

let visitorCount = 0;

const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.png': 'image/png'
};

http.createServer((req, res) => {
    const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const reqPath = parsedUrl.pathname === '/' ? '/index.html' : parsedUrl.pathname;
    const theme = parsedUrl.searchParams.get('theme') === 'dark' ? 'dark-mode' : 'light-mode';


    let filePath = path.join(PUBLIC_DIR, reqPath);
    let ext = path.extname(filePath).toLowerCase();
    let contentType = MIME_TYPES[ext] || 'text/plain';

    fs.readFile(filePath, (err, content) => {
        let finalcontent = content;
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/html' });
            res.end('<h1>404: Page Not Found</h1>');
            return;
        }

        if (reqPath === '/index.html') {
            visitorCount++;
            console.log(`[VISIT #${visitorCount}] Connection from ${req.socket.remoteAddress}`);
        }


        if (ext === '.html') {

            // Inside finalcontent.replace block:
            finalcontent = Buffer.from(content.toString().replace('{{COUNT}}', String(visitorCount)).replace('{{THEME_CLASS}}', theme));
        }

        console.log(`[REQUEST] ${req.socket.remoteAddress} accessed ${reqPath}`);
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(finalcontent);
    });
}).listen(PORT, '0.0.0.0', () => {
    console.log(`Server live! Listening on port ${PORT}...`);
});