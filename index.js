const express = require('express');
const app = express();
const port = process.env.PORT || 8080;

// Respondemos a qualquer solicitação com uma estrutura de configuração completa
app.all('*', (req, res) => {
    res.json({
        "status": "success",
        "verAddr": "https://meu-proxy-ff-production.up.railway.app/",
        "fakeVersion": "2.126.6",
        "config": {
            "maintenance": false,
            "forceUpdate": false,
            "cdnUrl": "https://dl.freefiremobile.com/",
            "region": "BR"
        },
        "Telegram": "QuyModgame"
    });
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Servidor rodando na porta ${port}`);
});
