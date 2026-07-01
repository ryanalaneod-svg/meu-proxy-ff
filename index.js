const express = require('express');
const app = express();
const port = process.env.PORT || 8080;

app.all('*', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.json({
        "status": "success",
        "verAddr": "https://meu-proxy-ff-production.up.railway.app/",
        "fakeVersion": "1.126.1",
        "config": {
            "maintenance": false,
            "forceUpdate": false,
            "hotfixUrl": "https://dl.freefiremobile.com/",
            "cdnUrl": "https://dl.freefiremobile.com/",
            "region": "BR"
        },
        "Telegram": "QuyModgame"
    });
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Servidor rodando na porta ${port}`);
});
