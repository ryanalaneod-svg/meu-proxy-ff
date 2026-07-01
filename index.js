const express = require('express');
const app = express();
const port = process.env.PORT || 8080;

// O jogo faz múltiplos pedidos. Vamos responder a tudo com sucesso.
app.all('/proxyxyz/*', (req, res) => {
    res.json({
        "status": "success",
        "verAddr": "https://meu-proxy-ff-production.up.railway.app/proxyxyz/0,0,0,0,0,1/",
        "fakeVersion": "2.126.6",
        "config": {
            "maintenance": false,
            "forceUpdate": false,
            "assetsUrl": "https://dl.freefiremobile.com/"
        },
        "Telegram": "QuyModgame"
    });
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Servidor rodando na porta ${port}`);
});
