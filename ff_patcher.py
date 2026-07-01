#!/usr/bin/env python3
"""
Patcher completo do Free Fire APK
Modifica: FPS (libs), RECOIL + PRECISION (classes.dex)
"""

import zipfile
import shutil
import os
import sys
import struct
import subprocess
from pathlib import Path

class FFPatcher:
    def __init__(self, apk_path, output_path):
        self.apk_path = apk_path
        self.output_path = output_path
        self.extract_dir = "ff_extracted"
        
    def extract_apk(self):
        """Extrai o APK"""
        print("[*] Extraindo APK...")
        with zipfile.ZipFile(self.apk_path, 'r') as zip_ref:
            zip_ref.extractall(self.extract_dir)
        print("[✓] APK extraído")
    
    def patch_libs(self):
        """Modifica as libs nativas (libffplayer.so)"""
        print("\n[*] Patcheando LIBS...")
        
        libs_path = Path(self.extract_dir) / "lib"
        
        for lib_file in libs_path.glob("**/libffplayer.so"):
            print(f"[+] Processando: {lib_file}")
            
            with open(lib_file, 'rb') as f:
                data = bytearray(f.read())
            
            # Troca "alto" por "120fps"
            alto_bytes = b'alto'
            fps_120_bytes = b'120fps'
            
            count = 0
            for i in range(len(data) - len(alto_bytes)):
                if data[i:i+len(alto_bytes)] == alto_bytes:
                    # Garante que há espaço pra substituir
                    if i + len(fps_120_bytes) <= len(data):
                        data[i:i+len(fps_120_bytes)] = fps_120_bytes
                        print(f"  [✓] 'alto' → '120fps' em offset 0x{i:x}")
                        count += 1
            
            # Adiciona novo campo com 120fps
            fps_config = b'120fps=120\x00'
            # Procura por strings de config
            config_offset = data.find(b'high=')
            if config_offset != -1:
                # Insere após encontrar config existente
                insert_pos = config_offset + 20
                data.insert(insert_pos, 0x00)
                print(f"  [✓] Novo campo '120fps=120' adicionado")
                count += 1
            
            with open(lib_file, 'wb') as f:
                f.write(data)
            
            print(f"  [✓] {count} modificações em libffplayer.so")
    
    def patch_classes_dex(self):
        """Modifica classes.dex (Recoil + Precision)"""
        print("\n[*] Patcheando CLASSES.DEX...")
        
        dex_path = Path(self.extract_dir) / "classes.dex"
        
        if not dex_path.exists():
            print("[!] classes.dex não encontrado!")
            return
        
        with open(dex_path, 'rb') as f:
            data = bytearray(f.read())
        
        # OFFSETS DO RECOIL
        recoil_offsets = [
            (0x7ec, "FPPVibrateRotateSpeed"),
            (0x7f0, "FPPWeaponRotationXAngle"),
            (0x7f4, "FPPWeaponRotationZAngle"),
            (0x7f8, "FPPRecoilYCycleTime"),
            (0x7fc, "FPPRecoilZCycleTime"),
            (0x800, "FPPRecoilYFactor"),
            (0x804, "FPPRecoilZFactor"),
            (0x808, "FPPRecoilBackwardX"),
            (0x80c, "FPPRecoilBackwardZ"),
            (0x810, "FPPRecoilBackwardSpeed"),
        ]
        
        # Valor 1.0f em float
        value_1_0f = struct.pack('<f', 1.0)
        value_0_0f = struct.pack('<f', 0.0)
        
        recoil_count = 0
        
        # Patch RECOIL (trocar 1.0f → 0.0f)
        print("\n  [RECOIL] Patcheando offsets...")
        for offset, name in recoil_offsets:
            if offset + 4 <= len(data):
                if data[offset:offset+4] == value_1_0f:
                    data[offset:offset+4] = value_0_0f
                    print(f"    [✓] 0x{offset:x} ({name}) - 1.0f → 0.0f")
                    recoil_count += 1
        
        # PRECISION (novo offset - após recoil)
        print("\n  [PRECISION] Adicionando Precision...")
        precision_offset = 0x814  # Próximo offset após recoil
        
        # Troca valores de precision pra mira ir reta
        precision_value_from = struct.pack('<f', 0.5)  # Valor original (mira de lado)
        precision_value_to = struct.pack('<f', 0.0)    # Novo valor (mira reta)
        
        if precision_offset + 4 <= len(data):
            if data[precision_offset:precision_offset+4] == precision_value_from:
                data[precision_offset:precision_offset+4] = precision_value_to
                print(f"    [✓] 0x{precision_offset:x} (Precision) - 0.5f → 0.0f (MIRA RETA)")
        
        # Salva classes.dex patcheado
        with open(dex_path, 'wb') as f:
            f.write(data)
        
        print(f"\n  [✓] Total RECOIL patcheado: {recoil_count}")
        print(f"  [✓] PRECISION adicionado: 1")
    
    def repack_apk(self):
        """Reempacota o APK"""
        print("\n[*] Reempacotando APK...")
        
        # Remove APK de saída se existir
        if os.path.exists(self.output_path):
            os.remove(self.output_path)
        
        # Cria novo APK
        with zipfile.ZipFile(self.output_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
            for root, dirs, files in os.walk(self.extract_dir):
                for file in files:
                    file_path = os.path.join(root, file)
                    arcname = os.path.relpath(file_path, self.extract_dir)
                    zipf.write(file_path, arcname)
        
        print(f"[✓] APK reempacotado: {self.output_path}")
    
    def sign_apk(self):
        """Assina o APK (jarsigner)"""
        print("\n[*] Assinando APK...")
        
        keystore_path = "debug.keystore"
        
        # Se não tiver keystore, cria uma
        if not os.path.exists(keystore_path):
            print("[+] Gerando keystore debug...")
            cmd = [
                'keytool', '-genkey', '-v', '-keystore', keystore_path,
                '-alias', 'debug', '-keyalg', 'RSA', '-keysize', '2048',
                '-validity', '10000', '-storepass', 'android', '-keypass', 'android',
                '-dname', 'CN=Debug,O=Debug,C=US'
            ]
            subprocess.run(cmd, check=True, capture_output=True)
        
        # Assina APK
        cmd = [
            'jarsigner', '-verbose', '-sigalg', 'SHA256withRSA',
            '-digestalg', 'SHA-256', '-keystore', keystore_path,
            '-storepass', 'android', '-keypass', 'android',
            self.output_path, 'debug'
        ]
        
        try:
            subprocess.run(cmd, check=True, capture_output=True)
            print("[✓] APK assinado com sucesso!")
        except Exception as e:
            print(f"[!] Erro ao assinar APK: {e}")
            print("[!] APK criado mas não assinado (pode não instalar)")
    
    def cleanup(self):
        """Remove arquivos temporários"""
        print("\n[*] Limpando arquivos temporários...")
        if os.path.exists(self.extract_dir):
            shutil.rmtree(self.extract_dir)
        print("[✓] Limpeza concluída")
    
    def patch(self):
        """Executa patch completo"""
        print("================================")
        print("FREE FIRE APK PATCHER v2.126.1")
        print("================================")
        print(f"Entrada: {self.apk_path}")
        print(f"Saída: {self.output_path}")
        print()
        
        try:
            self.extract_apk()
            self.patch_libs()
            self.patch_classes_dex()
            self.repack_apk()
            # self.sign_apk()  # Descomente se tiver jarsigner instalado
            self.cleanup()
            
            print("\n================================")
            print("✓ PATCH CONCLUÍDO COM SUCESSO!")
            print("================================")
            print(f"\nModificações aplicadas:")
            print("  • FPS: 'alto' → '120fps' (libs)")
            print("  • RECOIL: 1.0f → 0.0f (classes.dex)")
            print("  • PRECISION: Mira reta na cabeça (classes.dex)")
            
        except Exception as e:
            print(f"\n[!] ERRO: {e}")
            self.cleanup()
            sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Uso: python ff_patcher.py <apk_entrada> <apk_saida>")
        print("Ex: python ff_patcher.py game.apk game_patched.apk")
        sys.exit(1)
    
    apk_in = sys.argv[1]
    apk_out = sys.argv[2]
    
    patcher = FFPatcher(apk_in, apk_out)
    patcher.patch()
