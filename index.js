const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.get('/proxyxyz/:params', (req, res) => {
    res.json({
        "verAddr": `https://meu-proxy-ff-production.up.railway.app/proxyxyz/${req.params.params}/`,
        "fakeVersion": "2.126.6",
        "Telegram": "QuyModgame"
    });
});

app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
