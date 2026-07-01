const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.get('/proxyxyz/:params', (req, res) => {
    res.json({
        "status": "success",
        "message": "Proxy ativo",
        "verAddr": "http://seu-link-aqui.com/proxy", 
        "fakeVersion": "2.126.6"
    });
});

app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
