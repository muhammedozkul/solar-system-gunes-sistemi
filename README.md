# Güneş Sistemi

Tarayıcıda çalışan, gezilebilir 3B Güneş Sistemi. Saf HTML, CSS ve JavaScript ile yazıldı; derleme adımı, npm ya da framework yok. Üç boyutlu çizim için depoyla birlikte gelen Three.js (r160) kullanılır, internet bağlantısı gerekmez.

## Çalıştırma

**macOS:** `Güneş Sistemi.command` dosyasına çift tıkla. Yerel bir sunucu başlar ve tarayıcıda `http://localhost:8773` açılır. Sunucu zaten çalışıyorsa yalnızca tarayıcı açılır. Kapatmak için açılan Terminal penceresinde `Ctrl+C`.

**Elle:**

```bash
cd gunes-sistemi
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
| Önceki / sonraki | `←` / `→` |
| Duraklat / oynat | `Boşluk` |
| Genel görünüm | `Esc` |
| Yörüngeler / etiketler | `O` / `L` |
| Otomatik tur | `T` |

Bir gövdeye gidildiğinde kamera onu yörüngesinde takip eder; bu sırada çevresinde dönüp yakınlaşabilirsin. Gezegenlerin bilgi panelindeki çiplerle uydulara (Ay, Phobos, Deimos, Io, Europa, Ganymede, Callisto, Titan) geçebilirsin.

## Neler var

- Kaynayan yüzeyli, koronalı Güneş (özel shader + bloom)
- Dünya: gece tarafında şehir ışıkları, okyanus parlaması, normal map, ayrı dönen bulutlar ve bulut gölgeleri, atmosfer parıltısı
- Satürn: dokulu halka, halkanın gezegene ve gezegenin halkaya düşen gölgesi
- Gerçek eksen eğiklikleri, dış merkezli ve eğik yörüngeler, gerçek periyot oranları
- Asteroit kuşağı (3.000 kaya, InstancedMesh), Kuiper kuşağı, Samanyolu ve titreşen yıldızlar
- Zaman denetimi (1 saat/sn – 2 yıl/sn), otomatik tur, Türkçe bilgi panelleri

## Ölçek hakkında

Gerçek oranlarla gezegenler ekranda görünmez; bu yüzden ölçek sıkıştırılmıştır, sıra ve büyüklük ilişkileri korunur:

- Yarıçap: `(R / R_dünya)^0,55` (Dünya = 1 birim, Jüpiter ≈ 3,7 birim; Güneş 9 birime sabitlenmiştir)
- Güneş'e uzaklık: `18 + 56·√AB`
- Yörünge periyotları gerçektir. Kendi ekseninde dönüş ve uydu hareketi, yüksek hızlarda titremeye dönüşmemesi için sınırlı hızla ilerler; uydu periyotları karekökle sıkıştırılmıştır.
- Başlangıçta gezegenler, J2000 ortalama yörünge öğelerinden hesaplanan yaklaşık bugünkü konumlarındadır.

## Dosya yapısı

```
index.html            Sayfa iskeleti ve importmap
css/style.css         Arayüz stilleri
js/main.js            Renderer, postprocessing, kamera uçuşu/takibi, etkileşim
js/scene.js           Güneş, gezegenler, uydular, halkalar, kuşaklar, gökyüzü
js/shaders.js         Özel GLSL shader'lar
js/ui.js              Menü, bilgi paneli, zaman denetimi, yardım
js/data.js            Gezegen verileri, Türkçe metinler, ölçek formülleri
textures/             Gezegen dokuları
vendor/three/         Three.js r160
```

## Kaynaklar

- Dokular: [Solar System Scope](https://www.solarsystemscope.com/textures/) — CC BY 4.0
- [Three.js](https://threejs.org) r160 — MIT
- Simplex gürültüsü: Ian McEwan / Ashima Arts — MIT
- Fiziksel veriler: NASA Planetary Fact Sheet ve NASA Solar System Exploration
