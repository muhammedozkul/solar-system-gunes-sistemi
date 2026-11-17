@echo off
chcp 65001 >nul
rem Güneş Sistemi — yerel sunucuyu başlatır ve tarayıcıda açar (Windows).
rem Çift tıklayarak çalıştır. Kapatmak için bu pencereyi kapat ya da Ctrl+C'ye bas.

cd /d "%~dp0"
set "PORT=8773"
set "ADRES=http://localhost:%PORT%"

rem Port doluysa sunucu büyük olasılıkla zaten çalışıyordur: yalnızca tarayıcıyı aç
netstat -ano | findstr /r /c:":%PORT% .*LISTENING" >nul
if not errorlevel 1 (
  echo Sunucu zaten çalışıyor: %ADRES%
  start "" "%ADRES%"
  exit /b 0
)

rem Önce Python başlatıcısı (py), yoksa python. Microsoft Store kısayolu sorun çıkarabilir.
set "PY="
where py >nul 2>nul && set "PY=py -3"
if not defined PY (
  where python >nul 2>nul && set "PY=python"
)
if not defined PY (
  echo Python bulunamadı.
  echo https://www.python.org adresinden Python 3 kur, kurulumda "Add python.exe to PATH" kutusunu işaretle ve yeniden dene.
  echo Kurmadan da açabilirsin: https://muhammedozkul.github.io/solar-system-gunes-sistemi/
  pause
  exit /b 1
)

echo Güneş Sistemi başlatılıyor: %ADRES%
echo Kapatmak için bu pencereyi kapat ya da Ctrl+C'ye bas.

rem Sunucu ayağa kalkınca tarayıcıyı aç
start "" /b cmd /c "timeout /t 2 /nobreak >nul & start "" %ADRES%"
%PY% -m http.server %PORT% --bind 127.0.0.1
if errorlevel 1 pause
