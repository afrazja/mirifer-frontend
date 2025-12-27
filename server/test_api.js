const http = require('http');

const data = JSON.stringify({
    day: 1,
    userText: 'I am feeling a bit lost but hopeful about the new system.',
    mode: 'mirror'
});

const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/mirifer/respond',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = http.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);
    res.on('data', (d) => {
        process.stdout.write(d);
    });
});

req.on('error', (e) => {
    console.error(e);
});

req.write(data);
req.end();
