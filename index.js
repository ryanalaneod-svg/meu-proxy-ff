const express = require('express');
const app = express();
const port = process.env.PORT || 8080;

app.get('/proxyxyz/*', (req, res) => {
    res.json({
        "verAddr": "https://meu-proxy-ff-production.up.railway.app/proxyxyz/0,0,0,0,0,1/",
        "fakeVersion": "2.126.6",
        "Telegram": "QuyModgame"
    });
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Servidor rodando na porta ${port}`);
});
