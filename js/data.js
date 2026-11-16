// ---------------------------------------------------------------------------
// Güneş Sistemi verileri: yalnızca sayısal / fiziksel alanlar
//
// Gövde adları ve bilgi metinleri dil başına ayrı dosyalardadır
// (metin-tr.js, metin-en.js); bağlantı `id` ile kurulur. id'ler Türkçedir ve
// anahtar olarak kullanılır (menü sırası, etiket önceliği, CSS [data-id]): çevrilmez.
//
// Fiziksel değerler NASA Planetary Fact Sheet değerlerine dayanır.
// Yörünge öğeleri J2000 dönemine ait yaklaşık ortalama değerlerdir.
//   yaricap : Dünya yarıçapı cinsinden ortalama yarıçap
//   a       : yarı büyük eksen (AB)
//   e       : dış merkezlik
//   egim    : yörünge eğikliği (derece, tutulum düzlemine göre)
//   dugum   : çıkış düğümü boylamı (derece)
//   enberi  : enberi boylamı (derece)
//   L0      : J2000 anındaki ortalama boylam (derece)
//   yil     : yörünge periyodu (Dünya günü)
//   gun     : kendi ekseni etrafında dönüş periyodu (Dünya günü)
//   egiklik : eksen eğikliği (derece). 90°'den büyük değer ters dönüş demektir.
// ---------------------------------------------------------------------------

// ---- Ölçek ----------------------------------------------------------------
// Gerçek oranlarla hiçbir şey ekrana sığmaz; bu yüzden sıkıştırılmış ölçek
// kullanılır. Sıra ve büyüklük ilişkileri korunur.
export const GUNES_YARICAP = 9;

/** Gezegen yarıçapı: (R / R_dünya)^0.55 → Dünya = 1 birim, Jüpiter ≈ 3,7 birim. */
export function olcekYaricap(dunyaYaricapi) {
  return Math.pow(dunyaYaricapi, 0.55);
}

/**
 * Uydu yarıçapı ebeveynine oranla ölçeklenir: R_gezegen · (r_uydu / r_gezegen)^0.85.
 * Üs 1'den biraz küçük olduğu için uydular gerçek oranlarından biraz iridir ama
 * gezegenlerinin yanında inandırıcı kalır (Ay ≈ Dünya'nın 1/3'ü, Titan ≈ Satürn'ün
 * 1/14'ü). Çok küçük uydular için görünür kalsınlar diye alt sınır vardır.
 */
export function olcekUyduYaricap(dunyaYaricapi, ebeveynDunyaYaricapi) {
  const oran = dunyaYaricapi / ebeveynDunyaYaricapi;
  return Math.max(0.06, olcekYaricap(ebeveynDunyaYaricapi) * Math.pow(oran, 0.85));
}

/** Güneş'e uzaklık: 18 + 56·√AB → Merkür ≈ 53, Dünya = 74, Neptün ≈ 325 birim. */
export function olcekUzaklik(ab) {
  return 18 + 56 * Math.sqrt(ab);
}

/** Uyduların sahnedeki yörünge periyodu (gün): gerçek periyodun karekök sıkıştırması. */
export function olcekUyduPeriyot(gun) {
  return 2.5 * Math.sqrt(gun);
}

// ---- Gövdeler -------------------------------------------------------------
export const GOVDELER = [
  {
    id: 'gunes',
    renkler: ['#ffd27a', '#ff7a1a'],
    doku: '2k_sun.jpg',
    gun: 25.4,
    egiklik: 7.25,
  },
  {
    id: 'merkur',
    renkler: ['#c9c2b8', '#6e665e'],
    doku: '2k_mercury.jpg',
    yaricap: 0.383,
    a: 0.387, e: 0.2056, egim: 7.0, dugum: 48.33, enberi: 77.46, L0: 252.25,
    yil: 87.969,
    gun: 58.646,
    egiklik: 0.03,
    kabartma: true,
  },
  {
    id: 'venus',
    renkler: ['#f1d9a4', '#b98a3f'],
    doku: '2k_venus_atmosphere.jpg',
    yaricap: 0.949,
    a: 0.723, e: 0.0068, egim: 3.39, dugum: 76.68, enberi: 131.53, L0: 181.98,
    yil: 224.701,
    gun: 243.02,
    // Görünen yüzey bulut tabakasıdır; bulutlar gezegenin çevresini yaklaşık 4 günde
    // dolanır (süper rotasyon). Görsel dönüş için bu değer kullanılır.
    gorselGun: 4.2,
    egiklik: 177.36,
    atmosfer: { renk: '#ffd591', kalinlik: 1.14, siddet: 0.85 },
  },
  {
    id: 'dunya',
    renkler: ['#7db8ff', '#1f4f9c'],
    doku: '2k_earth_daymap.jpg',
    ozel: 'dunya',
    yaricap: 1,
    a: 1.0, e: 0.0167, egim: 0.0, dugum: 0.0, enberi: 102.95, L0: 100.46,
    yil: 365.256,
    gun: 0.99727,
    egiklik: 23.44,
    atmosfer: { renk: '#5aa2ff', kalinlik: 1.13, siddet: 0.95 },
    uydular: [
      {
        id: 'ay',
        renkler: ['#e2e2e2', '#77777b'],
        doku: '2k_moon.jpg',
        ton: '#ffffff',
        yaricap: 0.2727,
        uzaklik: 3.5,
        periyot: 27.32,
        duzlemEgim: 5.14,
        kabartma: true,
      },
    ],
  },
  {
    id: 'mars',
    renkler: ['#f0a070', '#9c3d1e'],
    doku: '2k_mars.jpg',
    yaricap: 0.532,
    a: 1.524, e: 0.0934, egim: 1.85, dugum: 49.56, enberi: 336.04, L0: 355.45,
    yil: 686.98,
    gun: 1.02596,
    egiklik: 25.19,
    kabartma: true,
    atmosfer: { renk: '#ff8a5c', kalinlik: 1.07, siddet: 0.42 },
    uydular: [
      {
        id: 'phobos',
        renkler: ['#a8998b', '#4f463e'],
        doku: '2k_moon.jpg',
        ton: '#9a8676',
        yaricap: 0.00174,
        uzaklik: 1.45,
        periyot: 0.3189,
        bicim: [1.0, 0.8, 0.72],
      },
      {
        id: 'deimos',
        renkler: ['#b5a899', '#5a5148'],
        doku: '2k_moon.jpg',
        ton: '#a89886',
        yaricap: 0.00097,
        uzaklik: 2.25,
        periyot: 1.263,
        bicim: [1.0, 0.82, 0.7],
      },
    ],
  },
  {
    id: 'jupiter',
    renkler: ['#e8c9a0', '#a8683a'],
    doku: '2k_jupiter.jpg',
    yaricap: 10.97,
    basiklik: 0.065,
    a: 5.203, e: 0.0484, egim: 1.3, dugum: 100.46, enberi: 14.75, L0: 34.4,
    yil: 4332.59,
    gun: 0.41354,
    egiklik: 3.13,
    atmosfer: { renk: '#f2d2a6', kalinlik: 1.05, siddet: 0.34 },
    uydular: [
      {
        id: 'io',
        renkler: ['#f3e08a', '#b98f2b'],
        doku: '2k_moon.jpg',
        ton: '#f0d66a',
        yaricap: 0.2859,
        uzaklik: 6.0,
        periyot: 1.769,
      },
      {
        id: 'europa',
        renkler: ['#efe6d6', '#9c8a72'],
        doku: '2k_moon.jpg',
        ton: '#e9dcc6',
        yaricap: 0.245,
        uzaklik: 7.5,
        periyot: 3.551,
      },
      {
        id: 'ganymede',
        renkler: ['#c9bfb2', '#6d6359'],
        doku: '2k_moon.jpg',
        ton: '#b9ad9f',
        yaricap: 0.4135,
        uzaklik: 9.3,
        periyot: 7.155,
      },
      {
        id: 'callisto',
        renkler: ['#9a8f82', '#453d35'],
        doku: '2k_moon.jpg',
        ton: '#85796c',
        yaricap: 0.3783,
        uzaklik: 11.6,
        periyot: 16.689,
      },
    ],
  },
  {
    id: 'saturn',
    renkler: ['#f0dcae', '#b39256'],
    doku: '2k_saturn.jpg',
    ozel: 'saturn',
    yaricap: 9.14,
    basiklik: 0.098,
    a: 9.537, e: 0.0542, egim: 2.49, dugum: 113.67, enberi: 92.43, L0: 49.94,
    yil: 10759.22,
    gun: 0.4396, // 10 sa 33 dk
    egiklik: 26.73,
    atmosfer: { renk: '#f5e2b0', kalinlik: 1.05, siddet: 0.3 },
    halka: { ic: 1.24, dis: 2.33, doku: '2k_saturn_ring_alpha.png' },
    uydular: [
      {
        id: 'titan',
        renkler: ['#f0bd6a', '#a8691f'],
        doku: '2k_venus_atmosphere.jpg',
        ton: '#f2b45a',
        yaricap: 0.4037,
        uzaklik: 11.4,
        periyot: 15.945,
        atmosfer: { renk: '#ffb459', kalinlik: 1.14, siddet: 0.6 },
      },
    ],
  },
  {
    id: 'uranus',
    renkler: ['#c4f0f2', '#5fa9b5'],
    doku: '2k_uranus.jpg',
    ozel: 'uranus',
    yaricap: 3.98,
    basiklik: 0.023,
    a: 19.19, e: 0.0472, egim: 0.77, dugum: 74.01, enberi: 170.96, L0: 313.23,
    yil: 30688.5,
    gun: 0.71833,
    egiklik: 97.77,
    atmosfer: { renk: '#9fe8ee', kalinlik: 1.07, siddet: 0.5 },
  },
  {
    id: 'neptun',
    renkler: ['#7fa4ff', '#2a45b0'],
    doku: '2k_neptune.jpg',
    yaricap: 3.86,
    basiklik: 0.017,
    a: 30.07, e: 0.0086, egim: 1.77, dugum: 131.78, enberi: 44.97, L0: 304.88,
    yil: 60182,
    gun: 0.6713,
    egiklik: 28.32,
    atmosfer: { renk: '#5f86ff', kalinlik: 1.07, siddet: 0.55 },
  },
];

/** Menüde ve turda kullanılan ana sıra: Güneş + 8 gezegen. */
export const ANA_SIRA = GOVDELER.map((g) => g.id);

/** Kimlikten veri kaydına (uydular dâhil) hızlı erişim. */
export const VERI = new Map();
for (const g of GOVDELER) {
  VERI.set(g.id, g);
  for (const u of g.uydular || []) {
    u.ebeveynId = g.id;
    VERI.set(u.id, u);
  }
}
