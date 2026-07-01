const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// Esta rota aceita qualquer coisa depois de /proxyxyz/
app.get('/proxyxyz/*', (req, res) => {
    res.json({
        "verAddr": "https://meu-proxy-ff-production.up.railway.app/proxyxyz/0,0,0,0,0,1/",
        "fakeVersion": "2.126.6",
        "Telegram": "QuyModgame"
    });
});

app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
