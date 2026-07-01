const express = require('express');
const app = express();
const port = process.env.PORT || 8080;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log de toda requisição
app.use((req, res, next) => {
    console.log("========== NOVA REQUISIÇÃO ==========");
    console.log("Horário:", new Date().toISOString());
    console.log("Método:", req.method);
    console.log("URL:", req.url);
    console.log("Headers:", req.headers);
    console.log("Body:", req.body);
    console.log("=====================================");
    next();
});

// OPTIONS
app.options('*', (req, res) => {
    res.set({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': '*',
        'Access-Control-Allow-Headers': '*'
    });
    res.sendStatus(204);
});

// Todas as rotas
app.all('*', (req, res) => {
    res.set({
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Access-Control-Allow-Origin': '*'
    });

    res.status(200).json({
        status: "ok",
        message: "server reached",
        host: "https://meu-proxy-ff-production.up.railway.app/",
        timestamp: Date.now()
    });
});

// Health check
app.get('/health', (req, res) => {
    res.json({
        online: true,
        host: "https://meu-proxy-ff-production.up.railway.app/"
    });
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Servidor rodando na porta ${port}`);
});
