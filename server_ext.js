const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');

let visitorCount = 0;

const messages = ["Server booted up successfully!"];

const fortunes = [
    "You will have a great day!",
    "Good things are coming your way.",
    "You will make a new friend soon.",
    "Success is in your future.",
    "Happiness is a journey, not a destination."
];

const randomFact = [
    "Did you know? A group of flamingos is called a 'flamboyance'.",
    "Did you know? A group of crows is called a 'murder'.",
    "Did you know? A group of owls is called a 'parliament'.",
    "Did you know? A group of lions is called a 'pride'.",
    "Did you know? A group of dolphins is called a 'pod'.",
    "Did you know? A group of elephants is called a 'herd'."
];


const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.mp4': 'video/mp4',
    '.json': 'application/json',
    '.ico': 'image/x-icon'
};



http.createServer((req, res) => {
    const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const reqPath = parsedUrl.pathname;

    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const logLine =
        `[${new Date().toISOString()}] IP: ${clientIp} | Method: ${req.method} | Path: ${reqPath}`;

    fs.appendFile(path.join(__dirname, 'server.log'), logLine, (err) => {
        if (err) console.error('Failed to write to log file:', err);

    });


    if (reqPath === '/coffee') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        return res.end('<h1>Here is your coffee!</h1>');

    }

    if (reqPath === '/roll') {
        const roll = Math.floor(Math.random() * 6) + 1;
        console.log(`Roll: ${roll}`);
        res.writeHead(200, { 'Content-Type': 'text/html' });
        return res.end(`<h1>You rolled a ${roll}!</h1>`);
    }



    // Route Normalization: Map root to index.html & append .html to extensionless routes
    let normalizedPath = reqPath === '/' ? '/index.html' : reqPath;
    if (!path.extname(normalizedPath)) {
        normalizedPath += '.html';
    }

    const filePath = path.join(PUBLIC_DIR, normalizedPath);
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'text/plain';

    fs.readFile(filePath, (err, content) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/html' });
            return res.end('<h1>404: Page Not Found</h1>');
        }

        let finalContent = content;

        if (ext === '.html') {
            let randomFortune = fortunes[Math.floor(Math.random() * fortunes.length)];

            let fact = randomFact[Math.floor(Math.random() * randomFact.length)];


            if (normalizedPath === '/index.html') {
                visitorCount++;
                console.log(`[VISIT #${visitorCount}] Connection from: ${req.socket.remoteAddress}`);
            }


            const newMsg = parsedUrl.searchParams.get('msg');

            if (newMsg) {
                messages.push(newMsg);
                res.writeHead(302, { 'Location': '/shoutbox' });
                return res.end();
            }


            const messageListHTML = messages.map(msg => `<li>${msg}</li>`).join('');


            const theme = parsedUrl.searchParams.get('theme') === 'dark' ? 'dark-mode' : 'light-mode';


            finalContent = content.toString()
                .replace('{{COUNT}}', String(visitorCount))
                .replace('{{THEME_CLASS}}', theme)
                .replace('{{FORTUNE}}', randomFortune)
                .replace('{{FACT}}', fact)
                .replace('{{MESSAGES}}', messageListHTML);
        }

        console.log(`[REQUEST] ${req.socket.remoteAddress} accessed ${normalizedPath}`);
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(finalContent);
    });
}).listen(PORT, '0.0.0.0', () => {
    console.log(`Server live! Listening on port http://localhost:${PORT}...`);
});
