const express = require('express');
const app = express();
const port = process.env.PORT || 8080;

// Esta rota captura TUDO o que o jogo pedir após a barra
app.all('*', (req, res) => {
    // Respondemos sempre com o JSON que o jogo espera
    res.json({
        "verAddr": "https://meu-proxy-ff-production.up.railway.app/proxyxyz/0,0,0,0,0,1/",
        "fakeVersion": "2.126.6",
        "status": "success"
    });
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Servidor escutando em todas as rotas na porta ${port}`);
});
