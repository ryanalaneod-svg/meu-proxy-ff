const express = require('express');
const app = express();
const port = process.env.PORT || 8080;

/* =========================
   PARSERS
========================= */

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

/* =========================
   LOGGER GLOBAL
========================= */

app.use((req, res, next) => {
    console.log("\n======================================");
    console.log("TIME:", new Date().toISOString());
    console.log("FULL URL:", req.protocol + "://" + req.get("host") + req.originalUrl);
    console.log("ENDPOINT:", req.originalUrl);
    console.log("METHOD:", req.method);
    console.log("IP:", req.ip);
    console.log("USER-AGENT:", req.headers['user-agent'] || "none");

    console.log("\nHEADERS:");
    console.log(req.headers);

    console.log("\nQUERY:");
    console.log(req.query);

    console.log("\nBODY:");
    console.log(req.body);

    console.log("======================================\n");

    next();
});

/* =========================
   HEALTH CHECK RAILWAY
========================= */

app.get('/', (req, res) => {
    res.status(200).send("SERVER ONLINE");
});

/* =========================
   CONFIG
========================= */

app.get('/config', (req, res) => {
    res.json({
        config: true,
        update: false
    });
});

/* =========================
   VERSION
========================= */

app.get('/version', (req, res) => {
    res.json({
        latest: "1.0.0"
    });
});

/* =========================
   AUTH
========================= */

app.post('/auth', (req, res) => {
    res.json({
        auth: "ok",
        token: "debug-token",
        received: req.body
    });
});

/* =========================
   SERVERS
========================= */

app.get('/servers', (req, res) => {
    res.json({
        list: [
            { id: 1, region: "BR" },
            { id: 2, region: "US" }
        ]
    });
});

/* =========================
   DEBUG ROUTE
========================= */

app.get('/debug', (req, res) => {
    res.json({
        online: true,
        time: Date.now(),
        headers: req.headers
    });
});

/* =========================
   UNKNOWN ROUTES
========================= */

app.all('*', (req, res) => {
    console.log("UNKNOWN URL HIT:", req.originalUrl);

    res.status(200).json({
        route: req.originalUrl,
        ok: true,
        message: "fallback reached"
    });
});

/* =========================
   ERROR HANDLER
========================= */

process.on('uncaughtException', (err) => {
    console.log("UNCAUGHT EXCEPTION:");
    console.error(err);
});

process.on('unhandledRejection', (err) => {
    console.log("UNHANDLED REJECTION:");
    console.error(err);
});

/* =========================
   KEEP ALIVE LOG
========================= */

setInterval(() => {
    console.log("SERVER STILL RUNNING:", new Date().toISOString());
}, 30000);

/* =========================
   START SERVER
========================= */

app.listen(port, '0.0.0.0', () => {
    console.log("================================");
    console.log("SERVER STARTED SUCCESSFULLY");
    console.log("PORT:", port);
    console.log("ADDRESS: 0.0.0.0");
    console.log("================================");
});
