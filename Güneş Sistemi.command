#!/bin/bash
# Güneş Sistemi — yerel sunucuyu başlatır ve tarayıcıda açar.
# Çift tıklayarak çalıştır. Kapatmak için bu pencerede Ctrl+C'ye bas.

cd "$(dirname "$0")" || exit 1

PORT=8773
ADRES="http://localhost:$PORT"

# Port doluysa sunucu büyük olasılıkla zaten çalışıyordur: yalnızca tarayıcıyı aç.
if lsof -nP -iTCP:"$PORT" -sTCP:LISTEN >/dev/null 2>&1; then
  echo "Sunucu zaten çalışıyor: $ADRES"
  open "$ADRES"
  exit 0
fi

if ! command -v python3 >/dev/null 2>&1; then
  echo "python3 bulunamadı. Lütfen Python 3 kur (https://www.python.org) ve yeniden dene."
  read -r -p "Kapatmak için Enter'a bas…"
  exit 1
fi

echo "Güneş Sistemi başlatılıyor: $ADRES"
echo "Kapatmak için Ctrl+C."

# Sunucu ayağa kalkınca tarayıcıyı aç
( sleep 1; open "$ADRES" ) &

exec python3 -m http.server "$PORT" --bind 127.0.0.1
