const express = require('express');
const app = express();
const port = process.env.PORT || 8080;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ================= LOGGER ================= */

app.use((req, res, next) => {
    console.log("========== REQUEST ==========");
    console.log("TIME:", new Date().toISOString());
    console.log("METHOD:", req.method);
    console.log("URL:", req.url);
    console.log("HEADERS:", req.headers);
    console.log("BODY:", req.body);
    console.log("============================");
    next();
});

/* ================= STATUS ================= */

app.get('/', (req, res) => {
    res.json({
        status: "online",
        version: "1.0.0",
        server: "runtime-config-server"
    });
});

/* ================= CONFIG PADRÃO ================= */

app.get('/config', (req, res) => {
    res.json({
        config: true,
        update: false
    });
});

/* ================= VERSION ================= */

app.get('/version', (req, res) => {
    res.json({
        latest: "1.0.0"
    });
});

/* ================= AUTH ================= */

app.post('/auth', (req, res) => {
    const { user, password } = req.body;

    res.json({
        auth: "ok",
        token: "debug-token",
        user: user || "guest"
    });
});

/* ================= SERVERS ================= */

app.get('/servers', (req, res) => {
    res.json({
        list: [
            { id: 1, region: "BR", ip: "192.168.1.10" },
            { id: 2, region: "US", ip: "192.168.1.20" }
        ]
    });
});

/* =========================================================
   RUNTIME CONFIG
   App Android Helper baixa esse JSON
========================================================= */

app.get('/runtime-config', (req, res) => {
    res.json({
        timestamp: Date.now(),

        engine: "custom-engine",

        modules: [
            {
                module: "libgame.so",

                configs: [
                    {
                        name: "feature_a",
                        enabled: true,
                        offset: "0x0012A4F0",
                        value: 85
                    },

                    {
                        name: "feature_b",
                        enabled: true,
                        offset: "0x0037BC20",
                        value: 1
                    },

                    {
                        name: "feature_c",
                        enabled: false,
                        offset: "0x0099FF00",
                        value: 0
                    }
                ]
            }
        ]
    });
});

/* =========================================================
   APP HELPER ENVIA STATUS
========================================================= */

app.post('/helper-status', (req, res) => {
    const { device, version, connected } = req.body;

    console.log("HELPER STATUS:", {
        device,
        version,
        connected
    });

    res.json({
        received: true,
        helper_online: true
    });
});

/* =========================================================
   LOCAL SOCKET / IPC CONFIG
   App helper consulta dados internos
========================================================= */

app.get('/ipc-data', (req, res) => {
    res.json({
        binder_channel: "game.internal.channel",

        socket_path: "/data/local/tmp/game_socket",

        commands: [
            "read_config",
            "sync_state",
            "apply_runtime"
        ]
    });
});

/* =========================================================
   JOGO PEGA CONFIG FINAL
========================================================= */

app.get('/game-state', (req, res) => {
    res.json({
        sync: true,

        settings: {
            mode: "runtime",

            sensitivity: 90,

            feature_a: true,

            feature_b: true
        }
    });
});

/* ================= FALLBACK ================= */

app.all('*', (req, res) => {
    res.json({
        route: req.url,
        ok: true,
        message: "endpoint exists but no handler"
    });
});

/* ================= START ================= */

app.listen(port, '0.0.0.0', () => {
    console.log("===================================");
    console.log("SERVER RUNNING ON PORT:", port);
    console.log("LISTENING ON 0.0.0.0");
    console.log("===================================");
});
