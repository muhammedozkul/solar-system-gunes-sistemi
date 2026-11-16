// ---------------------------------------------------------------------------
// Sahne kurulumu: Güneş, gezegenler, uydular, halkalar, kuşaklar, gökyüzü
// ---------------------------------------------------------------------------
import * as THREE from 'three';
import { CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import {
  GOVDELER,
  GUNES_YARICAP,
  olcekYaricap,
  olcekUyduYaricap,
  olcekUzaklik,
  olcekUyduPeriyot,
} from './data.js';
import {
  gunesMalzemesi,
  koronaMalzemesi,
  dunyaMalzemesi,
  atmosferHaleMalzemesi,
  atmosferPusMalzemesi,
  halkaMalzemesi,
  halkaGolgesiEkle,
  yildizMalzemesi,
} from './shaders.js';

const DERECE = Math.PI / 180;
const TAU = Math.PI * 2;
const VURGU = new THREE.Color('#f5b461');
const YORUNGE_RENGI = new THREE.Color('#8fa3c8');

/** Tekrarlanabilir sözde rastgele sayı üreteci (mulberry32). */
function rastgeleUret(tohum) {
  let a = tohum >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Kepler denkleminin küçük dış merkezlikler için seri açılımı: ortalama → gerçek anomali. */
function gercekAnomali(M, e) {
  return M + 2 * e * Math.sin(M) + 1.25 * e * e * Math.sin(2 * M);
}

/**
 * Yörünge üzerindeki konum (Güneş merkezli, sahne birimi).
 * y ekseni tutulum düzleminin kuzeyidir; hareket kuzeyden bakınca saat yönünün tersinedir.
 */
function yorungeKonumu(y, nu, hedef) {
  const r = (y.a * (1 - y.e * y.e)) / (1 + y.e * Math.cos(nu));
  const u = nu + y.enberi - y.dugum; // düğüm çizgisinden ölçülen açı
  const x = r * Math.cos(u);
  const zDuz = -r * Math.sin(u);
  const yy = -zDuz * Math.sin(y.egim);
  const z = zDuz * Math.cos(y.egim);
  const c = Math.cos(y.dugum);
  const s = Math.sin(y.dugum);
  return hedef.set(x * c + z * s, yy, -x * s + z * c);
}

export function gunesSistemiKur({ sahne, yonetici, anizotropi, pikselOrani, etiketTiklandi }) {
  const yukleyici = new THREE.TextureLoader(yonetici);
  const dokuOnbellek = new Map();

  /** Doku yükle; renk dokuları sRGB, veri dokuları (normal/specular) doğrusal kalır. */
  function doku(ad, srgb = true) {
    const anahtar = `${ad}|${srgb}`;
    if (dokuOnbellek.has(anahtar)) return dokuOnbellek.get(anahtar);
    const t = yukleyici.load(`textures/${ad}`);
    if (srgb) t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = anizotropi;
    dokuOnbellek.set(anahtar, t);
    return t;
  }

  const kureBuyuk = new THREE.SphereGeometry(1, 96, 64);
  const kureOrta = new THREE.SphereGeometry(1, 64, 44);
  const kureKucuk = new THREE.SphereGeometry(1, 36, 24);
  const isabetGeo = new THREE.SphereGeometry(1, 12, 8);
  const isabetMalzeme = new THREE.MeshBasicMaterial({ visible: false });

  const govdeler = new Map(); // id → çalışma zamanı kaydı
  const guncelleyiciler = []; // her karede çağrılan işlevler
  const yorungeNesneleri = []; // aç/kapa için bütün yörünge çizgileri
  const tmp = new THREE.Vector3();
  const tmp2 = new THREE.Vector3();

  // ---- Yardımcılar --------------------------------------------------------

  function etiketOlustur(veri, sinif = '') {
    const el = document.createElement('div');
    el.className = `etiket ${sinif}`.trim();
    el.dataset.id = veri.id;
    const ad = document.createElement('span');
    ad.textContent = veri.ad;
    el.appendChild(ad);
    el.addEventListener('click', (olay) => {
      olay.stopPropagation();
      etiketTiklandi(veri.id);
    });
    const nesne = new CSS2DObject(el);
    nesne.center.set(0.5, 1);
    return nesne;
  }

  function govdeKaydet(kayit) {
    kayit.dunyaKonumu = (hedef) => kayit.dugum.getWorldPosition(hedef);
    kayit.durum = { gorunur: null, soluk: null };
    govdeler.set(kayit.id, kayit);
    return kayit;
  }

  function isabetEkle(dugum) {
    const m = new THREE.Mesh(isabetGeo, isabetMalzeme);
    dugum.add(m);
    return m;
  }

  function atmosferEkle(dugum, R, atmosfer, basiklik = 0) {
    const yOlcek = 1 - basiklik;
    const hale = new THREE.Mesh(
      kureOrta,
      atmosferHaleMalzemesi({
        renk: atmosfer.renk,
        siddet: atmosfer.siddet,
        oran: 1 / atmosfer.kalinlik,
      })
    );
    const Ra = R * atmosfer.kalinlik;
    hale.scale.set(Ra, Ra * yOlcek, Ra);
    hale.renderOrder = 3;
    dugum.add(hale);

    const pus = new THREE.Mesh(
      kureOrta,
      atmosferPusMalzemesi({ renk: atmosfer.renk, siddet: atmosfer.siddet * 0.55 })
    );
    const Rp = R * 1.02;
    pus.scale.set(Rp, Rp * yOlcek, Rp);
    pus.renderOrder = 2;
    dugum.add(pus);
  }

  /** İç kenardan dış kenara radyal okunan UV'lerle halka geometrisi. */
  function halkaGeometrisi(ic, dis) {
    const geo = new THREE.RingGeometry(ic, dis, 192, 1);
    const konum = geo.attributes.position;
    const uv = geo.attributes.uv;
    for (let i = 0; i < konum.count; i++) {
      const r = Math.hypot(konum.getX(i), konum.getY(i));
      uv.setXY(i, (r - ic) / (dis - ic), 0.5);
    }
    uv.needsUpdate = true;
    return geo;
  }

  function cemberCizgisi(yaricap, opaklik) {
    const noktalar = [];
    for (let i = 0; i < 128; i++) {
      const a = (i / 128) * TAU;
      noktalar.push(new THREE.Vector3(Math.cos(a) * yaricap, 0, -Math.sin(a) * yaricap));
    }
    const cizgi = new THREE.LineLoop(
      new THREE.BufferGeometry().setFromPoints(noktalar),
      new THREE.LineBasicMaterial({
        color: YORUNGE_RENGI.clone(),
        transparent: true,
        opacity: opaklik,
        depthWrite: false,
      })
    );
    cizgi.userData.tabanOpaklik = opaklik;
    yorungeNesneleri.push(cizgi);
    return cizgi;
  }

  // ---- Işıklar ------------------------------------------------------------
  // r160 fiziksel ışık birimleri kullanır: decay = 0 ile uzaklıktan bağımsız,
  // şiddet ≈ π'nin biraz altı ile Lambert yüzeyde "albedo × cos" elde edilir.
  const gunesIsigi = new THREE.PointLight(0xfff3e2, 2.9, 0, 0);
  sahne.add(gunesIsigi);
  sahne.add(new THREE.AmbientLight(0x8fa4d6, 0.11));

  // ---- Güneş --------------------------------------------------------------
  const gunesVeri = GOVDELER[0];
  const gunesGrup = new THREE.Group();
  sahne.add(gunesGrup);
  const gunesEgim = new THREE.Group();
  gunesEgim.rotation.z = -gunesVeri.egiklik * DERECE;
  gunesGrup.add(gunesEgim);

  const gunesMat = gunesMalzemesi(doku(gunesVeri.doku));
  const gunesAg = new THREE.Mesh(kureBuyuk, gunesMat);
  gunesAg.scale.setScalar(GUNES_YARICAP);
  gunesEgim.add(gunesAg);

  const KORONA_CARPAN = 3.6;
  const koronaMat = koronaMalzemesi(1 / KORONA_CARPAN);
  const korona = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), koronaMat);
  korona.scale.setScalar(GUNES_YARICAP * KORONA_CARPAN);
  korona.renderOrder = 5;
  gunesGrup.add(korona);

  const gunesEtiket = etiketOlustur(gunesVeri, 'etiket-gunes');
  gunesEtiket.position.y = GUNES_YARICAP * 1.12;
  gunesGrup.add(gunesEtiket);

  govdeKaydet({
    id: 'gunes',
    veri: gunesVeri,
    tip: 'yildiz',
    yaricap: GUNES_YARICAP,
    dugum: gunesGrup,
    isabet: isabetEkle(gunesGrup),
    etiket: gunesEtiket,
    bakisCarpani: 4.4,
    enAzPiksel: 0,
  });

  guncelleyiciler.push((z) => {
    gunesAg.rotation.y = (z.donusGun / gunesVeri.gun) * TAU;
    gunesMat.uniforms.uZaman.value = z.gorsel;
    koronaMat.uniforms.uZaman.value = z.gorsel;
  });

  // ---- Uydular ------------------------------------------------------------
  function uyduKur(uv, ebeveyn, duzlem) {
    const R = olcekUyduYaricap(uv.yaricap);
    const dugum = new THREE.Group();
    duzlem.add(dugum);

    const mat = new THREE.MeshLambertMaterial({
      map: doku(uv.doku),
      color: new THREE.Color(uv.ton || '#ffffff'),
    });
    if (uv.kabartma) {
      mat.bumpMap = doku(uv.doku);
      mat.bumpScale = R * 0.03;
    }
    const ag = new THREE.Mesh(kureKucuk, mat);
    const b = uv.bicim || [1, 1, 1];
    ag.scale.set(R * b[0], R * b[1], R * b[2]);
    dugum.add(ag);

    if (uv.atmosfer) atmosferEkle(dugum, R, uv.atmosfer);

    const etiket = etiketOlustur(uv, 'etiket-uydu');
    etiket.position.y = R * 1.25;
    dugum.add(etiket);

    const cizgi = cemberCizgisi(uv.uzaklik, 0.1);
    duzlem.add(cizgi);

    const periyot = olcekUyduPeriyot(uv.periyot);
    const faz = (uv.id.charCodeAt(0) * 0.7 + uv.id.length * 1.3) % TAU;

    const kayit = govdeKaydet({
      id: uv.id,
      veri: uv,
      tip: 'uydu',
      yaricap: R,
      dugum,
      isabet: isabetEkle(dugum),
      etiket,
      yorunge: cizgi,
      ebeveyn,
      bakisCarpani: 6,
      enAzPiksel: 9,
    });

    guncelleyiciler.push((z) => {
      const aci = faz + (z.uyduGun / periyot) * TAU;
      dugum.position.set(Math.cos(aci) * uv.uzaklik, 0, -Math.sin(aci) * uv.uzaklik);
      // Kütle çekim kilidi: uydu gezegenine hep aynı yüzünü gösterir
      ag.rotation.y = aci + Math.PI;
    });
    return kayit;
  }

  // ---- Gezegenler ---------------------------------------------------------
  function gezegenKur(v) {
    const R = olcekYaricap(v.yaricap);
    const basiklik = v.basiklik || 0;

    // Sahne ölçeğine çevrilmiş yörünge öğeleri
    const yorunge = {
      a: olcekUzaklik(v.a),
      e: v.e,
      egim: v.egim * DERECE,
      dugum: v.dugum * DERECE,
      enberi: v.enberi * DERECE,
    };
    const M0 = (v.L0 - v.enberi) * DERECE;

    const sistem = new THREE.Group(); // gezegenin konumu (dönmez)
    sahne.add(sistem);
    const egim = new THREE.Group(); // eksen eğikliği
    egim.rotation.z = -v.egiklik * DERECE;
    sistem.add(egim);

    // -- Gövde --
    let malzeme;
    let bulutAg = null;
    if (v.ozel === 'dunya') {
      malzeme = dunyaMalzemesi({
        gunduz: doku('2k_earth_daymap.jpg'),
        gece: doku('2k_earth_nightmap.jpg'),
        yansima: doku('2k_earth_specular_map.jpg', false),
        normal: doku('2k_earth_normal_map.jpg', false),
        bulut: doku('2k_earth_clouds.jpg'),
      });
    } else {
      malzeme = new THREE.MeshLambertMaterial({ map: doku(v.doku) });
      if (v.kabartma) {
        malzeme.bumpMap = doku(v.doku);
        malzeme.bumpScale = R * 0.025;
      }
    }
    const ag = new THREE.Mesh(R > 2 ? kureBuyuk : kureOrta, malzeme);
    ag.scale.set(R, R * (1 - basiklik), R);
    egim.add(ag);

    if (v.ozel === 'dunya') {
      const bulutDoku = doku('2k_earth_clouds.jpg');
      bulutDoku.wrapS = THREE.RepeatWrapping;
      bulutAg = new THREE.Mesh(
        kureOrta,
        new THREE.MeshLambertMaterial({
          map: bulutDoku,
          alphaMap: bulutDoku,
          transparent: true,
          depthWrite: false,
        })
      );
      bulutAg.scale.setScalar(R * 1.012);
      bulutAg.renderOrder = 1;
      egim.add(bulutAg);
    }

    // Kabuklar eğik gruba eklenir ki basık gezegenlerde kutuplarda boşluk kalmasın
    if (v.atmosfer) atmosferEkle(egim, R, v.atmosfer, basiklik);

    // -- Halkalar --
    let halkaMat = null;
    if (v.halka) {
      const ic = R * v.halka.ic;
      const dis = R * v.halka.dis;
      const halkaDoku = doku(v.halka.doku);
      halkaMat = halkaMalzemesi({ doku: halkaDoku, gezegenYaricap: R * (1 - basiklik * 0.5) });
      const halka = new THREE.Mesh(halkaGeometrisi(ic, dis), halkaMat);
      halka.rotation.x = -Math.PI / 2;
      halka.renderOrder = 4;
      egim.add(halka);
      halkaGolgesiEkle(malzeme, { doku: halkaDoku, ic, dis });
    }
    if (v.ozel === 'uranus') {
      // Çok soluk, ince halkalar: küçük bir tuval dokusuyla üretilir
      const tuval = document.createElement('canvas');
      tuval.width = 256;
      tuval.height = 2;
      const c = tuval.getContext('2d');
      const bantlar = [
        [0.05, 0.02, 0.25], [0.17, 0.015, 0.2], [0.3, 0.02, 0.3], [0.44, 0.015, 0.22],
        [0.58, 0.02, 0.3], [0.7, 0.012, 0.2], [0.9, 0.06, 0.6],
      ];
      for (const [konum, genislik, alfa] of bantlar) {
        c.fillStyle = `rgba(200,220,230,${alfa})`;
        c.fillRect(Math.round(konum * 256), 0, Math.max(1, Math.round(genislik * 256)), 2);
      }
      const halkaDoku = new THREE.CanvasTexture(tuval);
      halkaDoku.colorSpace = THREE.SRGBColorSpace;
      halkaMat = halkaMalzemesi({ doku: halkaDoku, gezegenYaricap: R, opaklik: 0.5 });
      const halka = new THREE.Mesh(halkaGeometrisi(R * 1.6, R * 2.05), halkaMat);
      halka.rotation.x = -Math.PI / 2;
      halka.renderOrder = 4;
      egim.add(halka);
    }

    // -- Etiket, isabet küresi, yörünge çizgisi --
    const etiket = etiketOlustur(v);
    etiket.position.y = R * 1.18;
    sistem.add(etiket);

    const noktalar = [];
    const ADIM = 400;
    for (let i = 0; i < ADIM; i++) {
      noktalar.push(yorungeKonumu(yorunge, (i / ADIM) * TAU, new THREE.Vector3()));
    }
    const cizgi = new THREE.LineLoop(
      new THREE.BufferGeometry().setFromPoints(noktalar),
      new THREE.LineBasicMaterial({
        color: YORUNGE_RENGI.clone(),
        transparent: true,
        opacity: 0.2,
        depthWrite: false,
      })
    );
    cizgi.userData.tabanOpaklik = 0.2;
    sahne.add(cizgi);
    yorungeNesneleri.push(cizgi);

    const kayit = govdeKaydet({
      id: v.id,
      veri: v,
      tip: 'gezegen',
      yaricap: R,
      dugum: sistem,
      isabet: isabetEkle(sistem),
      etiket,
      yorunge: cizgi,
      bakisCarpani: v.halka ? 7.2 : 4.6,
      enAzPiksel: 15,
      uydular: [],
    });

    // -- Uydular: ekvator düzleminde (Ay: tutulum düzlemine 5° eğik) --
    for (const uv of v.uydular || []) {
      const duzlem = new THREE.Group();
      duzlem.rotation.z =
        uv.duzlemEgim !== undefined ? uv.duzlemEgim * DERECE : -v.egiklik * DERECE;
      sistem.add(duzlem);
      kayit.uydular.push(uyduKur(uv, kayit, duzlem));
    }

    // -- Kare güncellemesi --
    const donusPeriyodu = v.gorselGun || v.gun;
    const halkaNormal = new THREE.Vector3();
    guncelleyiciler.push((z) => {
      const M = M0 + (z.simGun / v.yil) * TAU;
      yorungeKonumu(yorunge, gercekAnomali(M, v.e), sistem.position);

      const donus = (z.donusGun / donusPeriyodu) * TAU;
      ag.rotation.y = donus;

      if (bulutAg) {
        // Bulutlar yüzeyden biraz daha hızlı döner; gölgeleri de birlikte kayar
        const fark = donus * 0.08 + z.gorsel * 0.004;
        bulutAg.rotation.y = donus + fark;
        malzeme.uniforms.uBulutKayma.value = (fark / TAU) % 1;
      }
      if (halkaMat) halkaMat.uniforms.uGezegenKonum.value.copy(sistem.position);
      const hu = malzeme.userData.halkaUniform;
      if (hu) {
        halkaNormal.set(0, 1, 0).applyQuaternion(egim.quaternion);
        hu.uHalkaNormal.value.copy(halkaNormal);
        hu.uHalkaMerkez.value.copy(sistem.position);
      }
    });
    return kayit;
  }

  for (const v of GOVDELER.slice(1)) gezegenKur(v);

  // ---- Asteroit kuşağı ----------------------------------------------------
  // Mars ile Jüpiter arası; üç katman Kepler'e uygun farklı hızlarda döner.
  (function asteroitKusagi() {
    const rnd = rastgeleUret(20240611);
    const geo = new THREE.IcosahedronGeometry(1, 1);
    const k = geo.attributes.position;
    for (let i = 0; i < k.count; i++) {
      tmp.fromBufferAttribute(k, i);
      // Konuma bağlı deformasyon: ortak köşeler aynı yere gider, yüzey yırtılmaz
      const n =
        1 +
        0.26 * Math.sin(tmp.x * 3.1 + 1.3) * Math.sin(tmp.y * 4.3 + 0.7) +
        0.2 * Math.sin(tmp.z * 5.7 + tmp.x * 2.9);
      tmp.multiplyScalar(n);
      k.setXYZ(i, tmp.x, tmp.y, tmp.z);
    }
    geo.computeVertexNormals();

    const malzeme = new THREE.MeshLambertMaterial({ color: 0xffffff, flatShading: true });
    // Katman sınırları AB cinsinden (gerçek kuşak ≈ 2,1–3,3 AB)
    const katmanlar = [
      { icAB: 2.1, disAB: 2.52, adet: 950 },
      { icAB: 2.48, disAB: 2.95, adet: 1200 },
      { icAB: 2.9, disAB: 3.3, adet: 850 },
    ];
    const kukla = new THREE.Object3D();
    const renk = new THREE.Color();

    for (const katman of katmanlar) {
      katman.ic = olcekUzaklik(katman.icAB);
      katman.dis = olcekUzaklik(katman.disAB);
      const ag = new THREE.InstancedMesh(geo, malzeme, katman.adet);
      ag.frustumCulled = false;
      for (let i = 0; i < katman.adet; i++) {
        const r = katman.ic + (katman.dis - katman.ic) * (0.5 + (rnd() + rnd() + rnd() - 1.5) / 3 * 1.6);
        const a = rnd() * TAU;
        const y = (rnd() + rnd() + rnd() - 1.5) * 2.2;
        kukla.position.set(Math.cos(a) * r, y, Math.sin(a) * r);
        kukla.rotation.set(rnd() * TAU, rnd() * TAU, rnd() * TAU);
        const boyut = 0.025 + Math.pow(rnd(), 3.2) * 0.14;
        kukla.scale.set(boyut * (0.7 + rnd() * 0.6), boyut * (0.6 + rnd() * 0.5), boyut * (0.7 + rnd() * 0.6));
        kukla.updateMatrix();
        ag.setMatrixAt(i, kukla.matrix);
        const ton = 0.32 + rnd() * 0.3;
        renk.setRGB(ton * (1.0 + rnd() * 0.12), ton * 0.94, ton * (0.82 + rnd() * 0.1));
        ag.setColorAt(i, renk);
      }
      ag.instanceMatrix.needsUpdate = true;
      ag.instanceColor.needsUpdate = true;
      sahne.add(ag);

      // Katmanın ortalama uzaklığından Kepler periyodu (gün): T = a^1.5 yıl
      const ortaAB = (katman.icAB + katman.disAB) / 2;
      const periyot = Math.pow(ortaAB, 1.5) * 365.25;
      guncelleyiciler.push((z) => {
        ag.rotation.y = (z.simGun / periyot) * TAU;
      });
    }
  })();

  // ---- Kuiper kuşağı ------------------------------------------------------
  (function kuiperKusagi() {
    const rnd = rastgeleUret(7741);
    const ADET = 1900;
    const konum = new Float32Array(ADET * 3);
    for (let i = 0; i < ADET; i++) {
      const r = olcekUzaklik(32 + Math.pow(rnd(), 1.4) * 18);
      const a = rnd() * TAU;
      konum[i * 3] = Math.cos(a) * r;
      konum[i * 3 + 1] = (rnd() + rnd() + rnd() - 1.5) * 15;
      konum[i * 3 + 2] = Math.sin(a) * r;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(konum, 3));
    const noktalar = new THREE.Points(
      geo,
      new THREE.PointsMaterial({
        color: 0x93a6c4,
        size: 0.9,
        sizeAttenuation: true,
        transparent: true,
        opacity: 0.38,
        depthWrite: false,
      })
    );
    sahne.add(noktalar);
    const periyot = Math.pow(42, 1.5) * 365.25;
    guncelleyiciler.push((z) => {
      noktalar.rotation.y = (z.simGun / periyot) * TAU;
    });
  })();

  // ---- Gökyüzü ------------------------------------------------------------
  // Samanyolu küresi ve nokta yıldızlar kamerayı izler; böylece hiçbir zaman
  // yakınlaşılamaz ve uzak kırpma düzlemine takılmaz.
  const gokyuzu = new THREE.Group();
  sahne.add(gokyuzu);

  const samanyolu = new THREE.Mesh(
    new THREE.SphereGeometry(9000, 48, 32),
    new THREE.MeshBasicMaterial({
      map: doku('8k_stars_milky_way.jpg'),
      side: THREE.BackSide,
      color: new THREE.Color(0.85, 0.85, 0.9),
      depthWrite: false,
      fog: false,
    })
  );
  // Galaksi düzlemi tutulum düzlemine yaklaşık 60° eğiktir
  samanyolu.rotation.set(60.2 * DERECE, 0, 0.5);
  samanyolu.renderOrder = -10;
  gokyuzu.add(samanyolu);

  const yildizMat = yildizMalzemesi(pikselOrani);
  (function yildizlar() {
    const rnd = rastgeleUret(99173);
    const ADET = 4200;
    const konum = new Float32Array(ADET * 3);
    const renkler = new Float32Array(ADET * 3);
    const boyut = new Float32Array(ADET);
    const faz = new Float32Array(ADET);
    const palet = [
      [0.72, 0.82, 1.0], [1.0, 1.0, 1.0], [1.0, 0.95, 0.84], [1.0, 0.84, 0.68], [0.85, 0.9, 1.0],
    ];
    for (let i = 0; i < ADET; i++) {
      // Küre üzerinde eşit dağılım
      const u = rnd() * 2 - 1;
      const a = rnd() * TAU;
      const s = Math.sqrt(1 - u * u);
      const r = 6000;
      konum[i * 3] = Math.cos(a) * s * r;
      konum[i * 3 + 1] = u * r;
      konum[i * 3 + 2] = Math.sin(a) * s * r;
      const p = palet[Math.floor(rnd() * palet.length)];
      const parlaklik = 0.25 + Math.pow(rnd(), 2.6) * 0.75;
      renkler[i * 3] = p[0] * parlaklik;
      renkler[i * 3 + 1] = p[1] * parlaklik;
      renkler[i * 3 + 2] = p[2] * parlaklik;
      boyut[i] = 1.1 + Math.pow(rnd(), 4) * 2.6;
      faz[i] = rnd() * 10;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(konum, 3));
    geo.setAttribute('aRenk', new THREE.BufferAttribute(renkler, 3));
    geo.setAttribute('aBoyut', new THREE.BufferAttribute(boyut, 1));
    geo.setAttribute('aFaz', new THREE.BufferAttribute(faz, 1));
    const noktalar = new THREE.Points(geo, yildizMat);
    noktalar.frustumCulled = false;
    noktalar.renderOrder = -9;
    gokyuzu.add(noktalar);
  })();

  let yildizZamani = 0;

  // Etiket çakışmalarında kimin önce yerleşeceği
  const ONCELIK = ['gunes', 'jupiter', 'saturn', 'dunya', 'mars', 'venus', 'neptun', 'uranus', 'merkur'];
  const oncelikSirasi = [...govdeler.values()].sort((a, b) => {
    const sa = a.tip === 'uydu' ? 100 : ONCELIK.indexOf(a.id);
    const sb = b.tip === 'uydu' ? 100 : ONCELIK.indexOf(b.id);
    return sa - sb;
  });
  const yerlesen = [];

  // ---- Dışa açılan arayüz -------------------------------------------------
  return {
    govdeler,

    /** Bütün gövdeleri verilen zaman durumuna göre konumlandırır. */
    guncelle(z) {
      for (const g of guncelleyiciler) g(z);
    },

    /** Kamera o karedeki son konumunu aldıktan sonra çağrılır. */
    kameraIzle(kamera, gercekDt) {
      gokyuzu.position.copy(kamera.position);
      korona.quaternion.copy(kamera.quaternion); // korona her zaman kameraya dönük
      yildizZamani += gercekDt; // yıldız titreşimi simülasyon duraklasa da sürer
      yildizMat.uniforms.uZaman.value = yildizZamani;
    },

    pikselOraniAyarla(oran) {
      yildizMat.uniforms.uPikselOrani.value = oran;
    },

    yorungeleriGoster(acik) {
      for (const n of yorungeNesneleri) n.visible = acik;
    },

    /** Seçili gövdenin (uyduysa ebeveyninin de) yörünge çizgisini vurgular. */
    yorungeVurgula(id) {
      const secili = id ? govdeler.get(id) : null;
      for (const g of govdeler.values()) {
        if (!g.yorunge) continue;
        const vurgulu = secili && (g === secili || g === secili.ebeveyn);
        const m = g.yorunge.material;
        m.color.copy(vurgulu ? VURGU : YORUNGE_RENGI);
        m.opacity = vurgulu ? 0.75 : g.yorunge.userData.tabanOpaklik;
      }
    },

    /**
     * Etiket görünürlüğü: uydu etiketleri yalnızca gezegenlerine yakınken görünür;
     * bir gövdeye odaklanıldığında diğer etiketler solar, çok yakınken gizlenir.
     */
    etiketleriGuncelle(kamera, odak, acik, ekranGenislik, ekranYukseklik) {
      let odakYakin = false;
      if (odak) {
        odak.dunyaKonumu(tmp);
        odakYakin = kamera.position.distanceTo(tmp) < odak.yaricap * 14;
      }
      const odakAilesi = odak ? odak.ebeveyn || odak : null;
      for (const g of govdeler.values()) {
        let gorunur = acik;
        let soluk = false;
        if (gorunur && g.tip === 'uydu') {
          g.ebeveyn.dunyaKonumu(tmp);
          gorunur = kamera.position.distanceTo(tmp) < g.ebeveyn.yaricap * 34;
        }
        if (gorunur && odak) {
          if (g === odak) {
            gorunur = !odakYakin;
          } else {
            const aile = g.ebeveyn || g;
            if (aile !== odakAilesi) {
              if (odakYakin) gorunur = false;
              else soluk = true;
            }
          }
        }
        g.durum.aday = gorunur;
        if (g.durum.soluk !== soluk) {
          g.durum.soluk = soluk;
          g.etiket.element.classList.toggle('soluk', soluk);
        }
      }

      // Üst üste binen etiketleri ayıkla: öncelik sırasıyla yerleştir, ekranda
      // daha önce yerleşmiş bir etikete çok yakın düşeni gizle. Görünür etiket
      // için eşik biraz daha dar tutulur ki sınırda yanıp sönme olmasın.
      yerlesen.length = 0;
      for (const g of oncelikSirasi) {
        let gorunur = g.durum.aday;
        if (gorunur) {
          g.etiket.getWorldPosition(tmp).project(kamera);
          const x = (tmp.x * 0.5 + 0.5) * ekranGenislik;
          const y = (-tmp.y * 0.5 + 0.5) * ekranYukseklik;
          const esikX = g.durum.gorunur ? 58 : 74;
          const esikY = g.durum.gorunur ? 15 : 21;
          if (g !== odak) {
            for (let i = 0; i < yerlesen.length; i += 2) {
              if (Math.abs(yerlesen[i] - x) < esikX && Math.abs(yerlesen[i + 1] - y) < esikY) {
                gorunur = false;
                break;
              }
            }
          }
          if (gorunur) yerlesen.push(x, y);
        }
        if (g.durum.gorunur !== gorunur) {
          g.durum.gorunur = gorunur;
          g.etiket.visible = gorunur;
        }
      }
    },

    /**
     * Tıklama için isabet kürelerini hazırlar: küçük ya da uzak gövdelerin
     * isabet küresi ekranda en az belirli bir piksel yarıçapında olacak şekilde büyütülür.
     */
    isabetListesi(kamera, ekranYuksekligi) {
      const liste = [];
      const pikselBasina =
        (2 * Math.tan((kamera.fov * DERECE) / 2)) / ekranYuksekligi; // 1 birim uzaklıkta 1 piksel
      for (const g of govdeler.values()) {
        g.dunyaKonumu(tmp);
        const uzaklik = kamera.position.distanceTo(tmp);
        if (g.tip === 'uydu') {
          g.ebeveyn.dunyaKonumu(tmp2);
          // Uydular yalnızca gezegenlerine yakınken seçilebilir
          if (kamera.position.distanceTo(tmp2) > g.ebeveyn.yaricap * 34) continue;
        }
        const r = Math.max(g.yaricap * 1.05, uzaklik * pikselBasina * g.enAzPiksel);
        g.isabet.scale.setScalar(r);
        g.isabet.userData.id = g.id;
        g.isabet.updateWorldMatrix(true, false);
        liste.push(g.isabet);
      }
      return liste;
    },
  };
}
