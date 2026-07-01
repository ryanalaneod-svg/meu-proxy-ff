const express = require('express');
const app = express();
const port = process.env.PORT || 8080;

app.all('*', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({
        "verAddr": "https://meu-proxy-ff-production.up.railway.app/",
        "fakeVersion": "1.126.1",
        "Telegram": "Anderson1135v"
    }));
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Servidor rodando na porta ${port}`);
});
