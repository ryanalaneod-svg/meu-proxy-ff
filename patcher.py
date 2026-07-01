POST http://seu-servidor:8080/patch-apply

{
  "filePath": "C:/game.exe",
  "outputPath": "C:/game_patched.exe",
  "functionName": "recoil",
  "targetValue": "1.0f_to_0.0f",
  "offsets": ["0x7ec", "0x7f0", "0x7f4", "0x7f8", "0x7fc", "0x800", "0x804", "0x808", "0x80c", "0x810", "0x818"],
  "backupOriginal": true
}
