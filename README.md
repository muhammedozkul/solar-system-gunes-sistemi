# Güneş Sistemi · Solar System

Tarayıcıda çalışan, gezilebilir 3B Güneş Sistemi. Saf HTML, CSS ve JavaScript ile yazıldı; derleme adımı, npm ya da framework yok. Üç boyutlu çizim için depoyla birlikte gelen Three.js (r160) kullanılır, internet bağlantısı gerekmez.

🪐 **Tarayıcıda aç:** https://muhammedozkul.github.io/solar-system-gunes-sistemi/

Kurulum gerekmez; Windows, macOS ve telefonda Chrome, Edge, Safari ya da Firefox ile açılır.

## Çalıştırma

**macOS:** `Güneş Sistemi.command` dosyasına çift tıkla. Yerel bir sunucu başlar ve tarayıcıda `http://localhost:8773` açılır. Sunucu zaten çalışıyorsa yalnızca tarayıcı açılır. Kapatmak için açılan Terminal penceresinde `Ctrl+C`.

**Windows:** `Güneş Sistemi.bat` dosyasına çift tıkla. [Python 3](https://www.python.org) kurulu olmalı (kurulumda "Add python.exe to PATH" kutusunu işaretle). Kapatmak için açılan siyah pencereyi kapat. Python kurmak istemiyorsan yukarıdaki canlı bağlantıyı kullan.

**Elle:**

```bash
cd solar-system-gunes-sistemi
python3 -m http.server 8773
# sonra tarayıcıda: http://localhost:8773
```

ES modülleri `file://` üzerinden yüklenemediği için `index.html` dosyasını doğrudan açmak çalışmaz; yerel sunucu şarttır.

## Kullanım

| Eylem | Nasıl |
| --- | --- |
| Döndür | Sürükle |
| Yakınlaş / uzaklaş | Tekerlek ya da iki parmak |
| Kaydır (genel görünümde) | Sağ tık ile sürükle |
| Bir gövdeye git | Gövdeye, etiketine ya da alttaki menüye tıkla |
| Güneş / gezegenler | `0` / `1`–`8` |
| Plüton / Halley | `9` / `H` |
| Önceki / sonraki | `←` / `→` |
| Duraklat / oynat | `Boşluk` |
| Genel görünüm | `Esc` |
| Yörüngeler / etiketler | `O` / `L` |
| Otomatik tur | `T` |
| Dil (Türkçe / İngilizce) | Sağ üstteki TR · EN düğmesi; seçim hatırlanır, ilk açılışta tarayıcı diline göre seçilir |

Bir gövdeye gidildiğinde kamera onu yörüngesinde takip eder; bu sırada çevresinde dönüp yakınlaşabilirsin. Gezegenlerin bilgi panelindeki çiplerle uydulara (Ay, Phobos, Deimos, Io, Europa, Ganymede, Callisto, Titan, Charon) geçebilirsin.

**Paylaşılabilir bağlantı:** Bir gövde seçilince adres çubuğu değişir (ör. `…/#saturn`, `…/#halley`). Bu bağlantıyı açan kişi doğrudan o gövdeye uçar.

**Telefonda:** Bilgi paneli alttan küçük açılır, gövde görünür kalır. Yukarı kaydır ya da metne dokun: genişler. Aşağı kaydır: önce küçülür, sonra kapanır.

## Neler var

- Kaynayan yüzeyli, koronalı Güneş (özel shader + bloom)
- Dünya: gece tarafında şehir ışıkları, okyanus parlaması, normal map, ayrı dönen bulutlar ve bulut gölgeleri, atmosfer parıltısı
- Satürn: dokulu halka, halkanın gezegene ve gezegenin halkaya düşen gölgesi
- Gerçek eksen eğiklikleri, dış merkezli ve eğik yörüngeler, gerçek periyot oranları
- Plüton ve uydusu Charon (cüce gezegen; basık, Neptün'ün yörüngesini kesen yörünge)
- Halley Kuyruklu Yıldızı: gerçek yörünge öğeleriyle bugünkü konumunda (≈ 35 AB). Güneş'e yaklaşınca koma ve iki kuyruk belirir: Güneş'in tam tersini gösteren mavi iyon kuyruğu ve yörüngede geride kalarak kavis çizen toz kuyruğu. Paneldeki **Güneş'e yaklaşınca izle** düğmesi zamanı 2061 geçişinin hemen öncesine taşır.
- Asteroit kuşağı (3.000 kaya, InstancedMesh), Kuiper kuşağı, Samanyolu ve titreşen yıldızlar
- Zaman denetimi (1 saat/sn – 2 yıl/sn), otomatik tur, Türkçe ve İngilizce arayüz ile bilgi panelleri

## Ölçek hakkında

Gerçek oranlarla gezegenler ekranda görünmez; bu yüzden ölçek sıkıştırılmıştır, sıra ve büyüklük ilişkileri korunur:

- Yarıçap: `(R / R_dünya)^0,55` (Dünya = 1 birim, Jüpiter ≈ 3,7 birim; Güneş 9 birime sabitlenmiştir)
- Güneş'e uzaklık: `18 + 56·√AB`
- Yörünge periyotları gerçektir. Kendi ekseninde dönüş ve uydu hareketi, yüksek hızlarda titremeye dönüşmemesi için sınırlı hızla ilerler; uydu periyotları karekökle sıkıştırılmıştır.
- Başlangıçta gezegenler, J2000 ortalama yörünge öğelerinden hesaplanan yaklaşık bugünkü konumlarındadır. Konumlar Kepler denkleminin sayısal çözümüyle bulunur.
- Halley'in çok basık yörüngesinde konum gerçek AB cinsinden hesaplanır, yalnızca Güneş'e uzaklık aynı formülle sıkıştırılır; çekirdek görünür kalsın diye büyütülmüştür.
- Solar System Scope'ta Plüton dokusu yoktur; Plüton ve Charon renklendirilmiş Ay dokusuyla gösterilir.

## Dosya yapısı

```
index.html            Sayfa iskeleti ve importmap
css/style.css         Arayüz stilleri
js/main.js            Renderer, postprocessing, kamera uçuşu/takibi, etkileşim
js/scene.js           Güneş, gezegenler, uydular, halkalar, kuşaklar, gökyüzü
js/shaders.js         Özel GLSL shader'lar
js/ui.js              Menü, bilgi paneli, zaman denetimi, yardım
js/i18n.js            Dil seçimi, t() çeviri işlevi, sayı biçimleme
js/metin-tr.js        Türkçe arayüz ve gövde metinleri
js/metin-en.js        İngilizce arayüz ve gövde metinleri
js/data.js            Gezegen, Plüton ve Halley verileri (sayısal), ölçek formülleri
textures/             Gezegen dokuları
vendor/three/         Three.js r160
```

## Kaynaklar

- Dokular: [Solar System Scope](https://www.solarsystemscope.com/textures/) — CC BY 4.0
- [Three.js](https://threejs.org) r160 — MIT
- Simplex gürültüsü: Ian McEwan / Ashima Arts — MIT
- Fiziksel veriler: NASA Planetary Fact Sheet ve NASA Solar System Exploration
- Halley yörünge öğeleri: JPL Small-Body Database
