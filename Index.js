const express = require('express');
const app = express();
const port = process.env.PORT || 8080;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// LOGGER

app.use((req, res, next) => {
    console.log("========== REQUEST ==========");
    console.log("TIME:", new Date().toISOString());

    // URL completa acessada
    console.log("FULL URL:", req.protocol + "://" + req.get("host") + req.originalUrl);

    // só endpoint
    console.log("URL:", req.originalUrl);

    console.log("METHOD:", req.method);
    console.log("HEADERS:", req.headers);

    console.log("============================");
    next();
});

// Rotas comuns de teste
app.get('/', (req, res) => {
    res.json({
        status: "online",
        version: "1.0.0"
    });
});

app.get('/config', (req, res) => {
    res.json({
        config: true,
        update: false
    });
});

app.get('/version', (req, res) => {
    res.json({
        latest: "1.0.0"
    });
});

app.post('/auth', (req, res) => {
    res.json({
        auth: "ok",
        token: "debug-token"
    });
});

app.get('/servers', (req, res) => {
    res.json({
        list: [
            { id: 1, region: "BR" },
            { id: 2, region: "US" }
        ]
    });
});

// fallback
app.all('*', (req, res) => {
    console.log("UNKNOWN URL:", req.originalUrl);

    res.json({
        route: req.url,
        ok: true
    });
});

app.listen(port, '0.0.0.0', () => {
    console.log("Running on port", port);
});
