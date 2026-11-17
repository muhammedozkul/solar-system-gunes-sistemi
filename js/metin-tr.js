// ---------------------------------------------------------------------------
// Türkçe metinler
//   ARAYUZ : arayüz dizgileri (anahtar → metin). {ad} gibi yer tutucular
//            i18n.js'teki t() ile doldurulur.
//   GOVDE  : gövde kimliği → { ad, tur, aciklama, veriler, bilgiler }
//            Kimlikler data.js'tekilerle aynıdır ve çevrilmez.
// Yeni bir metin eklerken aynı anahtarı metin-en.js'e de ekle.
// ---------------------------------------------------------------------------

export const ARAYUZ = {
  // Sayfa
  'sayfa.baslik': 'Güneş Sistemi',
  'sayfa.aciklama': 'Tarayıcıda gezilebilir, etkileşimli 3B Güneş Sistemi.',
  'marka.ad': 'Güneş Sistemi',
  'marka.alt': 'Etkileşimli 3B keşif',
  'sahne.aria': 'Güneş Sistemi 3B sahnesi',
  'kaynak': 'Geliştiren: Muhammed Yaşar ÖZKUL · Dokular: Solar System Scope (CC BY 4.0) · Three.js',

  // Yükleme
  'yukleme.dokular': 'Dokular yükleniyor…',
  'yukleme.ilerleme': 'Dokular yükleniyor… %{yuzde}',
  'yukleme.hata': 'Yüklenemedi: {url}',
  'yukleme.hazir': 'Hazır',

  // Zaman denetimi
  'zaman.aria': 'Zaman denetimi',
  'oynat.baslik': 'Duraklat / oynat (Boşluk)',
  'oynat.duraklat': 'Duraklat',
  'oynat.oynat': 'Oynat',
  'hiz.aria': 'Simülasyon hızı',
  'hiz.saat': '{n} saat/sn',
  'hiz.gun': '{n} gün/sn',
  'hiz.yil': '{n} yıl/sn',
  'sure.baslik': 'Geçen simülasyon süresi',
  'sure.gun': '{gun} gün',
  'sure.yilGun': '{yil} yıl {gun} gün',

  // Üst düğmeler
  'denetimler.aria': 'Görünüm denetimleri',
  'tur.yazi': 'Tur',
  'tur.aria': 'Otomatik tur',
  'tur.baslatBaslik': 'Turu başlat (T)',
  'tur.durdurBaslik': 'Turu durdur (T)',
  'yorunge.baslik': 'Yörüngeler (O)',
  'yorunge.aria': 'Yörüngeleri göster',
  'etiket.baslik': 'Etiketler (L)',
  'etiket.aria': 'Etiketleri göster',
  'genel.baslik': 'Genel görünüm (Esc)',
  'genel.aria': 'Genel görünüm',
  'tamekran': 'Tam ekran',
  'yardim.dugme': 'Klavye kısayolları',
  'dil.baslik': 'Dil / Language',
  'dil.aria': 'Dil: Türkçe. İngilizceye geç',

  // İpuçları
  'ipucu.acilis': '<b>Sürükle:</b> döndür · <b>Tekerlek:</b> yakınlaş · <b>Tıkla:</b> gezegene git',
  'ipucu.acilisDokunmatik': '<b>Sürükle:</b> döndür · <b>Sıkıştır:</b> yakınlaş · <b>Dokun:</b> gezegene git',
  'ipucu.tur': '<b>Tur</b> · {ad} · {sira}/{toplam} — durdurmak için tıkla ya da bir tuşa bas',

  // Bilgi paneli
  'panel.aria': 'Gövde bilgileri',
  'panel.onceki': 'Önceki gövde',
  'panel.oncekiBaslik': 'Önceki (←)',
  'panel.sonraki': 'Sonraki gövde',
  'panel.sonrakiBaslik': 'Sonraki (→)',
  'panel.kapat': 'Paneli kapat',
  'panel.kapatBaslik': 'Kapat',
  'panel.bilgiler': 'Biliyor muydun?',
  'panel.buyukUydular': 'Büyük uydular',
  'panel.uydusu': 'Uydusu',
  'panel.gezegeni': 'Gezegeni',
  'panel.cuceGezegeni': 'Cüce gezegeni',
  'panel.genislet': 'Paneli genişlet',
  'panel.daralt': 'Paneli küçült',
  'panel.enberiyeGit': 'Güneş\'e yaklaşınca izle →',
  'panel.canli': 'Güneş\'e uzaklık: {ab} AB · kuyruk yok, çok uzakta',
  'panel.canliKuyruklu': 'Güneş\'e uzaklık: {ab} AB · kuyruk görünüyor',

  // Menü
  'menu.aria': 'Gövdeler',

  // Yardım penceresi
  'yardim.baslik': 'Kısayollar',
  'yardim.kapat': 'Kapat',
  'yardim.gunes': 'Güneş',
  'yardim.gezegenler': 'Gezegenler (Merkür → Neptün)',
  'yardim.pluton': 'Plüton',
  'yardim.halley': 'Halley Kuyruklu Yıldızı',
  'yardim.komsu': 'Önceki / sonraki gövde',
  'yardim.bosluk': 'Boşluk',
  'yardim.duraklat': 'Duraklat / oynat',
  'yardim.genel': 'Genel görünüm',
  'yardim.yorunge': 'Yörüngeleri aç/kapat',
  'yardim.etiket': 'Etiketleri aç/kapat',
  'yardim.tur': 'Turu başlat/durdur',
  'yardim.not': 'Sürükle: döndür · Tekerlek ya da iki parmak: yakınlaş · Sağ tık: kaydır · Tıkla: gezegene git',

  // Hatalar
  'hata.genel': 'Bir sorun oluştu',
  'hata.webglYokBaslik': 'WebGL kullanılamıyor',
  'hata.webglYokMetin':
    'Bu deneyim için WebGL destekleyen güncel bir tarayıcı ve ekran kartı sürücüsü gerekir. Tarayıcını güncellemeyi ya da donanım hızlandırmayı açmayı dene.',
  'hata.webglBaslatBaslik': 'WebGL başlatılamadı',
  'hata.webglBaslatMetin':
    'Grafik bağlamı oluşturulamadı. Tarayıcında donanım hızlandırmanın açık olduğundan emin ol ve sayfayı yenile.',
};

export const GOVDE = {
  gunes: {
    ad: 'Güneş',
    tur: 'Yıldız · G2V sarı cüce',
    aciklama:
      'Güneş Sistemi\'nin kalbi ve kütlesinin yüzde 99,86\'sı. Çekirdeğinde her saniye yaklaşık 600 milyon ton hidrojeni helyuma dönüştürür; açığa çıkan enerji bütün gezegenleri aydınlatır ve Dünya\'daki yaşamı mümkün kılar.',
    veriler: [
      ['Çap', '1.392.700 km'],
      ['Dünya\'ya uzaklık', '149,6 milyon km · 1 AB'],
      ['Ekvatorda dönüş', '≈ 25 gün'],
      ['Galaksi turu', '≈ 230 milyon yıl'],
      ['Gezegen sayısı', '8'],
      ['Yüzey sıcaklığı', '≈ 5.500 °C'],
      ['Yüzey çekimi', '274 m/s²'],
      ['Yaş', '≈ 4,6 milyar yıl'],
    ],
    bilgiler: [
      'Güneş\'in içine yaklaşık 1,3 milyon Dünya sığar.',
      'Işığı Dünya\'ya 8 dakika 20 saniyede ulaşır; gökyüzünde gördüğün Güneş, sekiz dakika önceki hâlidir.',
      'Çekirdeği yaklaşık 15 milyon °C\'dir; dış atmosferi olan korona ise şaşırtıcı biçimde yüzeyden yüzlerce kat daha sıcaktır.',
    ],
  },

  merkur: {
    ad: 'Merkür',
    tur: 'Karasal gezegen',
    aciklama:
      'Güneş\'e en yakın ve en küçük gezegen. Neredeyse hiç atmosferi olmadığından ısıyı tutamaz: gündüzleri kurşunu eritecek kadar sıcak, geceleri ise dondurucu soğuktur.',
    veriler: [
      ['Çap', '4.879 km'],
      ['Güneş\'e uzaklık', '57,9 milyon km · 0,39 AB'],
      ['Bir günü (dönüş)', '58,6 Dünya günü'],
      ['Bir yılı', '88 Dünya günü'],
      ['Uydu sayısı', '0'],
      ['Sıcaklık', '−180 °C / 430 °C'],
      ['Yerçekimi', '3,7 m/s²'],
    ],
    bilgiler: [
      'Güneş\'in iki doğuşu arası 176 Dünya günü sürer; yani Merkür\'de bir "gün", iki Merkür yılı kadar uzundur.',
      'Sistemin en hızlı gezegenidir: yörüngesinde saniyede yaklaşık 47 km yol alır.',
      'Kutuplarındaki sürekli gölgede kalan kraterlerde su buzu bulunduğuna dair güçlü kanıtlar vardır.',
    ],
  },

  venus: {
    ad: 'Venüs',
    tur: 'Karasal gezegen',
    aciklama:
      'Boyutuyla Dünya\'nın ikizi, koşullarıyla tam tersi. Kalın karbondioksit atmosferi ve sülfürik asit bulutları ısıyı öyle hapseder ki yüzeyi Merkür\'den bile sıcaktır. Burada gördüğün, yüzeyi tamamen örten bulut tabakasıdır.',
    veriler: [
      ['Çap', '12.104 km'],
      ['Güneş\'e uzaklık', '108,2 milyon km · 0,72 AB'],
      ['Bir günü (dönüş)', '243 Dünya günü, ters yönde'],
      ['Bir yılı', '224,7 Dünya günü'],
      ['Uydu sayısı', '0'],
      ['Ortalama sıcaklık', '464 °C'],
      ['Yerçekimi', '8,87 m/s²'],
    ],
    bilgiler: [
      'Kendi ekseninde bir turu, Güneş çevresindeki turundan uzun sürer: günü yılından uzundur.',
      'Diğer gezegenlerin çoğunun tersine döner; Venüs\'te Güneş batıdan doğar.',
      'Yüzey basıncı Dünya\'dakinin yaklaşık 92 katıdır; bu, okyanusun 900 metre derinliğindeki basınca denktir.',
    ],
  },

  dunya: {
    ad: 'Dünya',
    tur: 'Karasal gezegen',
    aciklama:
      'Yüzeyinde sıvı su bulunduğu ve yaşam barındırdığı bilinen tek gezegen. Yüzeyinin yüzde 71\'i okyanuslarla kaplıdır; ince atmosferi ve manyetik alanı onu Güneş\'in zararlı ışınımından korur.',
    veriler: [
      ['Çap', '12.742 km'],
      ['Güneş\'e uzaklık', '149,6 milyon km · 1 AB'],
      ['Bir günü', '23 sa 56 dk'],
      ['Bir yılı', '365,25 gün'],
      ['Uydu sayısı', '1'],
      ['Ortalama sıcaklık', '15 °C'],
      ['Yerçekimi', '9,81 m/s²'],
    ],
    bilgiler: [
      'Mevsimlerin nedeni Güneş\'e uzaklık değil, eksenin 23,4 derecelik eğikliğidir.',
      'Karasal gezegenlerin en büyüğü ve en yoğunudur.',
      'Gece tarafına yaklaş: şehir ışıklarını görebilirsin.',
    ],
  },

  ay: {
    ad: 'Ay',
    tur: 'Doğal uydu · Dünya',
    aciklama:
      'Dünya\'nın tek doğal uydusu ve Dünya dışında insanın ayak bastığı tek gök cismi. Büyük olasılıkla 4,5 milyar yıl önce, Mars büyüklüğünde bir cismin genç Dünya\'ya çarpmasıyla saçılan maddeden oluştu.',
    veriler: [
      ['Çap', '3.474 km'],
      ['Dünya\'ya uzaklık', '384.400 km'],
      ['Bir günü (dönüş)', '27,3 Dünya günü'],
      ['Dünya çevresinde tur', '27,3 gün'],
      ['Evre döngüsü', '29,5 gün'],
      ['Sıcaklık', '−173 °C / 127 °C'],
      ['Yerçekimi', '1,62 m/s²'],
    ],
    bilgiler: [
      'Dönüşü yörüngesiyle kilitlidir; bu yüzden Dünya\'dan hep aynı yüzünü görürüz.',
      'Her yıl Dünya\'dan yaklaşık 3,8 santimetre uzaklaşır.',
      'Gelgitlerin başlıca nedeni Ay\'ın kütle çekimidir.',
    ],
  },

  mars: {
    ad: 'Mars',
    tur: 'Karasal gezegen',
    aciklama:
      'Rengini yüzeyindeki demir oksitten, yani pastan alan Kızıl Gezegen. Bugün soğuk ve kuru bir çöl; ancak kurumuş nehir yatakları ve deltalar, bir zamanlar yüzeyinde su aktığını gösteriyor.',
    veriler: [
      ['Çap', '6.779 km'],
      ['Güneş\'e uzaklık', '227,9 milyon km · 1,52 AB'],
      ['Bir günü', '24 sa 37 dk'],
      ['Bir yılı', '687 Dünya günü'],
      ['Uydu sayısı', '2'],
      ['Ortalama sıcaklık', '−63 °C'],
      ['Yerçekimi', '3,72 m/s²'],
    ],
    bilgiler: [
      'Olympus Mons yaklaşık 22 km yüksekliğiyle Güneş Sistemi\'nin bilinen en yüksek yanardağıdır.',
      'Valles Marineris kanyon sistemi 4.000 km\'yi aşar; Türkiye\'nin doğu-batı uzunluğunun iki katından fazladır.',
      'Atmosferi Dünya\'nınkinin yüzde biri kadar yoğundur ve çoğunlukla karbondioksittir.',
    ],
  },

  phobos: {
    ad: 'Phobos',
    tur: 'Doğal uydu · Mars',
    aciklama:
      'Mars\'ın iki küçük uydusundan büyük ve yakın olanı. Patates biçimli bu kaya parçası, gezegenine o kadar yakın döner ki bir Mars gününde gökyüzünü iki kereden fazla kateder.',
    veriler: [
      ['Boyut', '27 × 22 × 18 km'],
      ['Mars\'a uzaklık', '9.376 km (merkezden)'],
      ['Mars çevresinde tur', '7 sa 39 dk'],
      ['Ortalama sıcaklık', '≈ −40 °C'],
      ['Yerçekimi', '0,006 m/s²'],
    ],
    bilgiler: [
      'Her yüzyılda Mars\'a yaklaşık 1,8 metre yaklaşır; on milyonlarca yıl içinde parçalanıp bir halka oluşturması bekleniyor.',
      'Mars yüzeyinden bakıldığında batıdan doğar, doğudan batar.',
    ],
  },

  deimos: {
    ad: 'Deimos',
    tur: 'Doğal uydu · Mars',
    aciklama:
      'Mars\'ın küçük ve uzak uydusu. Yüzeyi kalın bir toz tabakasıyla örtülü olduğundan Phobos\'a göre daha pürüzsüz görünür.',
    veriler: [
      ['Boyut', '15 × 12 × 11 km'],
      ['Mars\'a uzaklık', '23.460 km (merkezden)'],
      ['Mars çevresinde tur', '30 sa 18 dk'],
      ['Ortalama sıcaklık', '≈ −40 °C'],
      ['Yerçekimi', '0,003 m/s²'],
    ],
    bilgiler: [
      'Mars\'tan bakıldığında parlak bir yıldızdan pek farklı görünmez.',
      'Kaçış hızı o kadar düşüktür ki (saniyede yaklaşık 5,6 metre) iyi bir koşuyla atlayan biri Deimos\'tan kopup uzaya savrulabilir.',
    ],
  },

  jupiter: {
    ad: 'Jüpiter',
    tur: 'Gaz devi',
    aciklama:
      'Güneş Sistemi\'nin açık ara en büyük gezegeni: diğer bütün gezegenlerin toplamından iki buçuk kat daha kütleli. Katı bir yüzeyi yoktur; gördüğün kuşaklar, saatte yüzlerce kilometre hızla esen rüzgârların sürüklediği bulutlardır.',
    veriler: [
      ['Çap', '139.820 km'],
      ['Güneş\'e uzaklık', '778,5 milyon km · 5,20 AB'],
      ['Bir günü', '9 sa 56 dk'],
      ['Bir yılı', '11,86 Dünya yılı'],
      ['Uydu sayısı', '115 (2026)'],
      ['Bulut tepesi sıcaklığı', '−110 °C'],
      ['Yerçekimi', '24,79 m/s²'],
    ],
    bilgiler: [
      'Büyük Kırmızı Leke, Dünya\'dan büyük bir fırtınadır ve en az 190 yıldır aralıksız gözleniyor.',
      'Sistemin en kısa günü ondadır: bu dev küre kendi çevresinde 10 saatten kısa sürede döner.',
      'İçine 1.300\'den fazla Dünya sığar.',
    ],
  },

  io: {
    ad: 'Io',
    tur: 'Galileo uydusu · Jüpiter',
    aciklama:
      'Güneş Sistemi\'nin volkanik olarak en etkin cismi. Jüpiter\'in ve komşu uyduların çekimi içini sürekli yoğurup ısıtır; yüzeyinde yüzlerce etkin yanardağ vardır.',
    veriler: [
      ['Çap', '3.643 km'],
      ['Jüpiter\'e uzaklık', '421.700 km'],
      ['Jüpiter çevresinde tur', '1,77 gün'],
      ['Ortalama sıcaklık', '≈ −130 °C'],
      ['Yerçekimi', '1,80 m/s²'],
    ],
    bilgiler: [
      'Sarı-turuncu rengini kükürt bileşiklerinden alır.',
      'Bazı püskürmeleri yüzeyden 400 km yükseğe ulaşır.',
    ],
  },

  europa: {
    ad: 'Europa',
    tur: 'Galileo uydusu · Jüpiter',
    aciklama:
      'Buz kabuğunun altında, Dünya\'daki bütün okyanusların toplamından fazla su barındırdığı düşünülen bir uydu. Dünya dışı yaşam arayışının en güçlü adaylarından biridir.',
    veriler: [
      ['Çap', '3.122 km'],
      ['Jüpiter\'e uzaklık', '671.000 km'],
      ['Jüpiter çevresinde tur', '3,55 gün'],
      ['Ortalama sıcaklık', '≈ −160 °C'],
      ['Yerçekimi', '1,31 m/s²'],
    ],
    bilgiler: [
      'Yüzeyi Güneş Sistemi\'nin en pürüzsüz yüzeylerinden biridir; neredeyse hiç dağ ya da derin krater yoktur.',
      'NASA\'nın Europa Clipper aracı 2024\'te bu uyduyu incelemek üzere yola çıktı.',
    ],
  },

  ganymede: {
    ad: 'Ganymede',
    tur: 'Galileo uydusu · Jüpiter',
    aciklama:
      'Güneş Sistemi\'nin en büyük uydusu; Merkür gezegeninden bile büyüktür. Kendi manyetik alanına sahip olduğu bilinen tek uydudur.',
    veriler: [
      ['Çap', '5.268 km'],
      ['Jüpiter\'e uzaklık', '1.070.400 km'],
      ['Jüpiter çevresinde tur', '7,15 gün'],
      ['Ortalama sıcaklık', '≈ −160 °C'],
      ['Yerçekimi', '1,43 m/s²'],
    ],
    bilgiler: [
      'Güneş\'in çevresinde dönseydi rahatlıkla gezegen sayılırdı.',
      'Buz kabuğunun altında tuzlu bir okyanus bulunduğuna dair kanıtlar vardır.',
    ],
  },

  callisto: {
    ad: 'Callisto',
    tur: 'Galileo uydusu · Jüpiter',
    aciklama:
      'Güneş Sistemi\'nin en yoğun kraterli cisimlerinden biri. Yüzeyi milyarlarca yıldır neredeyse hiç değişmemiştir; adeta sistemin ilk dönemlerinden kalma bir fosildir.',
    veriler: [
      ['Çap', '4.821 km'],
      ['Jüpiter\'e uzaklık', '1.882.700 km'],
      ['Jüpiter çevresinde tur', '16,7 gün'],
      ['Ortalama sıcaklık', '≈ −140 °C'],
      ['Yerçekimi', '1,24 m/s²'],
    ],
    bilgiler: [
      'Jüpiter\'in yoğun radyasyon kuşaklarının dışında kaldığı için, gelecekteki insanlı üsler için aday gösterilir.',
      'Valhalla çarpma havzasının halkaları yaklaşık 3.800 km genişliğe yayılır.',
    ],
  },

  saturn: {
    ad: 'Satürn',
    tur: 'Gaz devi',
    aciklama:
      'Görkemli halkalarıyla sistemin mücevheri. Halkalar toz tanesinden ev büyüklüğüne kadar değişen sayısız buz ve kaya parçasından oluşur; 280.000 km genişliğe yayılmalarına karşın çoğu yerde kalınlıkları onlarca metreyi geçmez.',
    veriler: [
      ['Çap', '116.460 km'],
      ['Güneş\'e uzaklık', '1,43 milyar km · 9,54 AB'],
      ['Bir günü', '10 sa 33 dk'],
      ['Bir yılı', '29,45 Dünya yılı'],
      ['Uydu sayısı', '293 (2026)'],
      ['Bulut tepesi sıcaklığı', '−140 °C'],
      ['Yerçekimi', '10,44 m/s²'],
    ],
    bilgiler: [
      'Ortalama yoğunluğu sudan düşüktür; yeterince büyük bir okyanus olsaydı Satürn üzerinde yüzerdi.',
      'Kuzey kutbunda, her kenarı Dünya\'nın çapından uzun, altıgen biçimli bir jet akımı döner; altıgenin merkezinde dev bir girdap yer alır.',
      'Halkanın gezegene, gezegenin de halkaya düşen gölgesine dikkat et.',
    ],
  },

  titan: {
    ad: 'Titan',
    tur: 'Doğal uydu · Satürn',
    aciklama:
      'Kalın bir atmosfere sahip tek uydu ve Dünya dışında yüzeyinde kalıcı sıvı bulunduğu bilinen tek cisim. Ancak göllerini ve denizlerini su değil, sıvı metan ve etan doldurur.',
    veriler: [
      ['Çap', '5.150 km'],
      ['Satürn\'e uzaklık', '1.221.870 km'],
      ['Satürn çevresinde tur', '15,95 gün'],
      ['Yüzey sıcaklığı', '−179 °C'],
      ['Yerçekimi', '1,35 m/s²'],
    ],
    bilgiler: [
      'Atmosferi o kadar yoğun, yerçekimi o kadar düşüktür ki kollarına kanat takan bir insan burada uçabilirdi.',
      'Huygens sondası 2005\'te Titan\'a indi; bu, dış Güneş Sistemi\'ndeki ilk iniştir.',
    ],
  },

  uranus: {
    ad: 'Uranüs',
    tur: 'Buz devi',
    aciklama:
      'Yan yatmış gezegen. Ekseni yörünge düzlemine neredeyse paralel olduğundan Güneş\'in çevresinde yuvarlanarak ilerler gibidir. Soluk camgöbeği rengini, atmosferindeki metanın kırmızı ışığı soğurmasına borçludur.',
    veriler: [
      ['Çap', '50.724 km'],
      ['Güneş\'e uzaklık', '2,87 milyar km · 19,2 AB'],
      ['Bir günü', '17 sa 14 dk, ters yönde'],
      ['Bir yılı', '84 Dünya yılı'],
      ['Uydu sayısı', '29 (2026)'],
      ['Bulut tepesi sıcaklığı', '−195 °C'],
      ['Yerçekimi', '8,69 m/s²'],
    ],
    bilgiler: [
      'Eğikliği yüzünden kutuplarında 42 yıl gündüz, ardından 42 yıl gece yaşanır.',
      '1781\'de William Herschel tarafından bulundu; teleskopla keşfedilen ilk gezegendir.',
      'İnce ve karanlık 13 halkası vardır; burada çok soluk biçimde gösterilmiştir.',
    ],
  },

  neptun: {
    ad: 'Neptün',
    tur: 'Buz devi',
    aciklama:
      'Güneş\'e en uzak gezegen: karanlık, soğuk ve fırtınalı. Güneş ışığı buraya Dünya\'dakinden 900 kat daha zayıf ulaşır; buna karşın atmosferinde sistemin en hızlı rüzgârları eser.',
    veriler: [
      ['Çap', '49.244 km'],
      ['Güneş\'e uzaklık', '4,50 milyar km · 30,1 AB'],
      ['Bir günü', '16 sa 6 dk'],
      ['Bir yılı', '164,8 Dünya yılı'],
      ['Uydu sayısı', '16'],
      ['Bulut tepesi sıcaklığı', '−200 °C'],
      ['Yerçekimi', '11,15 m/s²'],
    ],
    bilgiler: [
      'Rüzgârları saatte 2.000 km\'yi aşar; ses hızından hızlıdır.',
      'Gözlemle değil, matematiksel hesapla bulunan ilk gezegendir (1846).',
      'Keşfinden bu yana Güneş çevresindeki ilk tam turunu ancak 2011\'de tamamladı.',
    ],
  },

  pluton: {
    ad: 'Plüton',
    tur: 'Cüce gezegen · Kuiper kuşağı',
    aciklama:
      'Kuiper kuşağının en ünlü üyesi. 1930\'da bulundu, 76 yıl gezegen sayıldı, 2006\'da cüce gezegen olarak yeniden sınıflandı. Basık yörüngesi yüzünden bazen Neptün\'den bile Güneş\'e yakındır.',
    veriler: [
      ['Çap', '2.377 km'],
      ['Güneş\'e uzaklık', '5,9 milyar km · 39,5 AB'],
      ['Bir günü', '6 gün 9 sa, ters yönde'],
      ['Bir yılı', '248 Dünya yılı'],
      ['Uydu sayısı', '5'],
      ['Yüzey sıcaklığı', '≈ −230 °C'],
      ['Yerçekimi', '0,62 m/s²'],
    ],
    bilgiler: [
      'New Horizons 2015\'te yanından geçti ve yüzeyinde kalp biçiminde, azot buzundan dev bir ova buldu.',
      'Plüton ile Charon birbirine kilitlidir: ikisi de birbirine hep aynı yüzünü gösterir.',
      '1979–1999 arasında Güneş\'e Neptün\'den daha yakındı; yörüngeler kesişse de çarpışmazlar.',
    ],
  },

  charon: {
    ad: 'Charon',
    tur: 'Doğal uydu · Plüton',
    aciklama:
      'Plüton\'un en büyük uydusu; boyu Plüton\'un yarısından fazladır. İkisi ortak bir noktanın çevresinde dönerler ve bu nokta Plüton\'un dışında kalır; bu yüzden çoğu zaman çift cüce gezegen diye anılırlar.',
    veriler: [
      ['Çap', '1.212 km'],
      ['Plüton\'a uzaklık', '19.596 km'],
      ['Plüton çevresinde tur', '6,39 gün'],
      ['Yüzey sıcaklığı', '≈ −220 °C'],
      ['Yerçekimi', '0,29 m/s²'],
    ],
    bilgiler: [
      'Kuzey kutbundaki kızıl lekenin, Plüton\'dan kaçıp Charon\'a ulaşan metan gazından oluştuğu düşünülür.',
      '1978\'de bulundu; Plüton\'un kütlesi ancak onun yörüngesinden hesaplanabildi.',
    ],
  },

  halley: {
    ad: 'Halley',
    tur: 'Kuyruklu yıldız · kısa dönemli',
    aciklama:
      'Çıplak gözle görülebilen ve bir insan ömründe iki kez dönebilen tek kuyruklu yıldız. Aralık 2023\'te yörüngesinin en uzak noktasından döndü; Güneş\'e yeniden 2061\'de yaklaşacak. Güneş\'e yaklaşınca buzları buharlaşır ve iki kuyruk oluşur.',
    veriler: [
      ['Çekirdek', '≈ 15 × 8 km'],
      ['Dönüş süresi', '≈ 76 yıl'],
      ['Güneş\'e en yakın', '0,59 AB (Venüs\'ün içi)'],
      ['Güneş\'e en uzak', '35 AB (Neptün\'ün ötesi)'],
      ['Son geçiş', '9 Şubat 1986'],
      ['Sonraki geçiş', '28 Temmuz 2061'],
    ],
    bilgiler: [
      'Mavi, düz kuyruk iyonlaşmış gazdır ve güneş rüzgârıyla hep Güneş\'in tam tersini gösterir; sarımsı, kavisli kuyruk ise tozdur ve yörüngede geride kalır.',
      'Edmond Halley, 1531, 1607 ve 1682 gözlemlerinin aynı cisme ait olduğunu anlayıp 1758\'deki dönüşünü önceden bildirdi.',
      'Giotto sondası 1986\'da çekirdeğini fotoğrafladı: kömürden bile karanlık bir yüzey.',
      'Mayıs\'taki Eta Akuaritler ve Ekim\'deki Orionitler meteor yağmurları Halley\'in bıraktığı tozdan gelir.',
    ],
  },
};
