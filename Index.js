const express = require('express');
const app = express();
const port = process.env.PORT || 8080;
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

/* =========================
   PARSERS
========================= */

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

/* =========================
   LOGGER GLOBAL
========================= */

app.use((req, res, next) => {
    console.log("\n======================================");
    console.log("TIME:", new Date().toISOString());
    console.log("FULL URL:", req.protocol + "://" + req.get("host") + req.originalUrl);
    console.log("ENDPOINT:", req.originalUrl);
    console.log("METHOD:", req.method);
    console.log("IP:", req.ip);
    console.log("USER-AGENT:", req.headers['user-agent'] || "none");

    console.log("\nHEADERS:");
    console.log(req.headers);

    console.log("\nQUERY:");
    console.log(req.query);

    console.log("\nBODY:");
    console.log(req.body);

    console.log("======================================\n");

    next();
});

/* =========================
   HEALTH CHECK RAILWAY
========================= */

app.get('/', (req, res) => {
    res.status(200).send("SERVER ONLINE");
});

/* =========================
   CONFIG
========================= */

app.get('/config', (req, res) => {
    res.json({
        config: true,
        update: false
    });
});

/* =========================
   VERSION
========================= */

app.get('/version', (req, res) => {
    res.json({
        latest: "2.126.1"
    });
});

/* =========================
   AUTH
========================= */

app.post('/auth', (req, res) => {
    res.json({
        auth: "ok",
        token: "debug-token",
        received: req.body
    });
});

/* =========================
   SERVERS
========================= */

app.get('/servers', (req, res) => {
    res.json({
        list: [
            { id: 1, region: "BR" },
            { id: 2, region: "US" }
        ]
    });
});

/* =========================
   DEBUG ROUTE
========================= */

app.get('/debug', (req, res) => {
    res.json({
        online: true,
        time: Date.now(),
        headers: req.headers
    });
});

/* =========================
   PATCHER INTERATIVO - PERGUNTA TUDO
========================= */

app.get('/patch-interactive', (req, res) => {
    res.json({
        title: "Patcher Interativo - FPP Recoil",
        description: "Configure o patch respondendo as perguntas abaixo",
        questions: {
            filePath: {
                type: "string",
                label: "Caminho do arquivo .exe",
                placeholder: "Ex: C:/Users/seu-usuario/game.exe",
                required: true
            },
            outputPath: {
                type: "string",
                label: "Caminho de saída (opcional)",
                placeholder: "Ex: C:/Users/seu-usuario/game_patched.exe",
                required: false
            },
            functionName: {
                type: "select",
                label: "Qual função deseja patchear?",
                options: [
                    { value: "recoil", label: "Recoil (Recuo de arma)" },
                    { value: "vibracao", label: "Vibração" },
                    { value: "rotacao", label: "Rotação da arma" },
                    { value: "todos", label: "Todas as funções" }
                ],
                required: true
            },
            targetValue: {
                type: "select",
                label: "Trocar de qual valor para qual valor?",
                options: [
                    { value: "1.0f_to_0.0f", label: "1.0f → 0.0f (Desabilitar)" },
                    { value: "0.5f_to_0.0f", label: "0.5f → 0.0f" },
                    { value: "custom", label: "Valor customizado" }
                ],
                required: true
            },
            offsets: {
                type: "textarea",
                label: "Offsets em hexadecimal (um por linha)",
                placeholder: "0x7ec\n0x7f0\n0x7f4\n0x7f8\n0x7fc\n0x800",
                hint: "Cole os offsets que o jogo informou",
                required: true
            },
            backupOriginal: {
                type: "boolean",
                label: "Fazer backup do arquivo original?",
                default: true
            }
        },
        example_request: {
            method: "POST",
            endpoint: "/patch-apply",
            body: {
                filePath: "C:/game.exe",
                outputPath: "C:/game_patched.exe",
                functionName: "recoil",
                targetValue: "1.0f_to_0.0f",
                offsets: ["0x7ec", "0x7f0", "0x7f4", "0x7f8", "0x7fc", "0x800", "0x804", "0x808", "0x80c", "0x810", "0x818"],
                backupOriginal: true
            }
        }
    });
});

/* =========================
   PATCHER APPLY - APLICA O PATCH
========================= */

app.post('/patch-apply', (req, res) => {
    const { filePath, outputPath, functionName, targetValue, offsets, backupOriginal } = req.body;

    // Validações
    if (!filePath) {
        return res.status(400).json({
            error: true,
            message: "filePath é obrigatório"
        });
    }

    if (!offsets || offsets.length === 0) {
        return res.status(400).json({
            error: true,
            message: "Nenhum offset foi fornecido"
        });
    }

    // Verifica se o arquivo existe
    if (!fs.existsSync(filePath)) {
        return res.status(404).json({
            error: true,
            message: `Arquivo não encontrado: ${filePath}`
        });
    }

    // Define output path
    const finalOutputPath = outputPath || filePath.replace('.exe', '_patched.exe');

    // Define o script de patch customizado baseado nos parâmetros
    const patchScript = `#!/usr/bin/env python3
import struct
import sys
from pathlib import Path

OFFSETS = {}
FUNCTION_NAME = "${functionName}"
TARGET_VALUE = "${targetValue}"

# Converte offsets da string para dicionário
offsets_list = ${JSON.stringify(offsets)};
for offset_str in offsets_list:
    offset = int(offset_str, 16)
    OFFSETS[offset] = f"Custom_{offset_str}"

def patch_file(input_file, output_file):
    try:
        with open(input_file, 'rb') as f:
            data = bytearray(f.read())
        
        print(f"[*] Arquivo carregado: {input_file}")
        print(f"[*] Função: {FUNCTION_NAME}")
        print(f"[*] Tamanho: {len(data)} bytes")
        print()
        
        # Define valores
        if TARGET_VALUE == "1.0f_to_0.0f":
            value_from = struct.pack('<f', 1.0)
            value_to = struct.pack('<f', 0.0)
            desc = "1.0f → 0.0f"
        elif TARGET_VALUE == "0.5f_to_0.0f":
            value_from = struct.pack('<f', 0.5)
            value_to = struct.pack('<f', 0.0)
            desc = "0.5f → 0.0f"
        else:
            value_from = struct.pack('<f', 1.0)
            value_to = struct.pack('<f', 0.0)
            desc = "1.0f → 0.0f"
        
        patched_count = 0
        
        for offset, name in OFFSETS.items():
            if offset + 4 > len(data):
                print(f"[!] {offset:06x} ({name:35}) - FORA DO ARQUIVO")
                continue
            
            current_value = data[offset:offset+4]
            current_float = struct.unpack('<f', current_value)[0]
            
            if current_value == value_from:
                data[offset:offset+4] = value_to
                print(f"[✓] 0x{offset:x} ({name:35}) - {desc}")
                patched_count += 1
            else:
                print(f"[×] 0x{offset:x} ({name:35}) - Valor: {current_float}")
        
        print()
        print(f"[*] Total patcheado: {patched_count}/{len(OFFSETS)}")
        
        with open(output_file, 'wb') as f:
            f.write(data)
        
        print(f"[✓] Arquivo salvo: {output_file}")
        
    except Exception as e:
        print(f"[!] Erro: {e}")
        sys.exit(1)

if __name__ == "__main__":
    patch_file("${filePath}", "${finalOutputPath}")
`;

    // Salva o script temporário
    const tempScriptPath = path.join(__dirname, `patcher_temp_${Date.now()}.py`);
    
    fs.writeFileSync(tempScriptPath, patchScript);

    console.log(`[PATCH-APPLY] Iniciando patch customizado`);
    console.log(`[PATCH-APPLY] Função: ${functionName}`);
    console.log(`[PATCH-APPLY] Arquivo: ${filePath}`);
    console.log(`[PATCH-APPLY] Offsets: ${offsets.join(', ')}`);

    if (backupOriginal) {
        const backupPath = filePath + '.backup';
        if (!fs.existsSync(backupPath)) {
            fs.copyFileSync(filePath, backupPath);
            console.log(`[BACKUP] Arquivo original salvo em: ${backupPath}`);
        }
    }

    // Executa o script
    const patcher = spawn('python', [tempScriptPath]);

    let output = '';
    let errorOutput = '';

    patcher.stdout.on('data', (data) => {
        output += data.toString();
        console.log(`[OUTPUT] ${data.toString()}`);
    });

    patcher.stderr.on('data', (data) => {
        errorOutput += data.toString();
        console.error(`[ERROR] ${data.toString()}`);
    });

    patcher.on('close', (code) => {
        // Limpa o arquivo temporário
        fs.unlinkSync(tempScriptPath);

        if (code === 0) {
            console.log(`[SUCCESS] Patch aplicado com sucesso!`);
            res.json({
                success: true,
                message: "Patch aplicado com sucesso! 🎉",
                details: {
                    functionName: functionName,
                    inputFile: filePath,
                    outputFile: finalOutputPath,
                    offsetsPatched: offsets.length,
                    backupCreated: backupOriginal
                },
                logs: output
            });
        } else {
            console.log(`[ERROR] Erro ao aplicar patch (código ${code})`);
            res.status(500).json({
                error: true,
                message: `Erro ao executar patch (código ${code})`,
                logs: output,
                errors: errorOutput
            });
        }
    });

    patcher.on('error', (err) => {
        fs.unlinkSync(tempScriptPath);
        console.error(`[ERROR] Erro ao iniciar patcher:`, err);
        res.status(500).json({
            error: true,
            message: "Erro ao iniciar patcher",
            details: err.message
        });
    });
});

/* =========================
   UNKNOWN ROUTES
========================= */

app.all('*', (req, res) => {
    console.log("UNKNOWN URL HIT:", req.originalUrl);

    res.status(200).json({
        route: req.originalUrl,
        ok: true,
        message: "fallback reached"
    });
});

/* =========================
   ERROR HANDLER
========================= */

process.on('uncaughtException', (err) => {
    console.log("UNCAUGHT EXCEPTION:");
    console.error(err);
});

process.on('unhandledRejection', (err) => {
    console.log("UNHANDLED REJECTION:");
    console.error(err);
});

/* =========================
   KEEP ALIVE LOG
========================= */

setInterval(() => {
    console.log("SERVER STILL RUNNING:", new Date().toISOString());
}, 30000);

/* =========================
   START SERVER
========================= */

app.listen(port, '0.0.0.0', () => {
    console.log("================================");
    console.log("SERVER STARTED SUCCESSFULLY");
    console.log("PORT:", port);
    console.log("ADDRESS: 0.0.0.0");
    console.log("VERSION: 2.126.1");
    console.log("================================");
});
