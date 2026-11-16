// ---------------------------------------------------------------------------
// Güneş Sistemi — ana modül
// Renderer, postprocessing, kamera uçuşları/takibi, zaman ve etkileşim.
// ---------------------------------------------------------------------------
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { CSS2DRenderer } from 'three/addons/renderers/CSS2DRenderer.js';

import { ANA_SIRA } from './data.js';
import { gunesSistemiKur } from './scene.js';
import { arayuzKur, hataGoster } from './ui.js';
import { dilBaslat, dilDegisince, govdeMetni, t, tHtml } from './i18n.js';

const AZ_HAREKET = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const DOKUNMATIK = window.matchMedia('(pointer: coarse)').matches;
const UCUS_SURESI = AZ_HAREKET ? 0.45 : 2.2; // sn
const ACILIS_SURESI = AZ_HAREKET ? 0.8 : 5.2; // sn
const TUR_BEKLEME = 8; // her gövdede kalınan süre (sn)

// Yüksek hızlarda kendi ekseninde dönüş ve uydu hareketi bulanık bir titremeye
// dönüşmesin diye bu iki saat sınırlı hızla ilerler (gün/sn).
const DONUS_HIZ_SINIRI = 0.12;
const UYDU_HIZ_SINIRI = 0.8;

// Piksel oranı 1,5 ile sınırlanır ve 4× MSAA korunur: Retina ekranda 2× çizime göre
// ~%44 daha az piksel (bloom geçişleri de buna ölçeklenir), yörünge çizgileri ve
// gezegen kenarları ise MSAA sayesinde MSAA'sız 2×'ten daha pürüzsüz kalır.
const EN_COK_PIKSEL_ORANI = 1.5;
const MSAA_ORNEK = 4;

const Y_EKSENI = new THREE.Vector3(0, 1, 0);

function webglVarMi() {
  try {
    const tuval = document.createElement('canvas');
    return !!(tuval.getContext('webgl2') || tuval.getContext('webgl'));
  } catch {
    return false;
  }
}

function pikselOraniHesapla() {
  return Math.min(window.devicePixelRatio || 1, EN_COK_PIKSEL_ORANI);
}

function yumusak(t) {
  // ease in-out (kübik)
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function aciSarmala(a) {
  return Math.atan2(Math.sin(a), Math.cos(a));
}

if (location.protocol !== 'file:') {
  dilBaslat();
  basla();
}

function basla() {
  // ---- Renderer -----------------------------------------------------------
  // WebGL denetimi ve renderer, arayüz olayları bağlanmadan önce yapılır: hata
  // durumunda hiçbir düğme henüz kurulmamış sahne nesnelerine erişemez.
  if (!webglVarMi()) {
    hataGoster('hata.webglYokBaslik', 'hata.webglYokMetin');
    return;
  }

  const kap = document.getElementById('sahne');
  let genislik = window.innerWidth;
  let yukseklik = window.innerHeight;
  let pikselOrani = pikselOraniHesapla();

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' });
  } catch {
    hataGoster('hata.webglBaslatBaslik', 'hata.webglBaslatMetin');
    return;
  }
  renderer.setPixelRatio(pikselOrani);
  renderer.setSize(genislik, yukseklik);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  kap.appendChild(renderer.domElement);

  // ---- Durum --------------------------------------------------------------
  const durum = {
    duraklat: false,
    hiz: 5, // gün/sn
    odak: null, // izlenen gövde kaydı
    sonAci: 0, // odaktaki gövdenin Güneş çevresindeki son açısı
    ucus: null, // süren kamera uçuşu
    tur: null, // { sira, bekleme }
    yorungeler: true,
    etiketler: true,
    panelAcik: false,
    acilisIpucu: false,
  };

  // Yükleme bitip açılış uçuşu başlayana kadar klavye kısayolları ve arayüz olayları yok sayılır
  let hazir = false;
  const hazirsa =
    (islev) =>
    (...argumanlar) => {
      if (hazir) islev(...argumanlar);
    };

  const olaylar = {
    sec: hazirsa((id) => odaklan(id)),
    onceki: hazirsa(() => komsuyaGit(-1)),
    sonraki: hazirsa(() => komsuyaGit(1)),
    panelKapat: hazirsa(() => {
      durum.panelAcik = false;
      ui.panelGizle();
    }),
    hiz: (deger) => {
      durum.hiz = deger;
    },
    duraklat: hazirsa(() => duraklatDegistir()),
    tur: hazirsa(() => turDegistir()),
    yorungeler: hazirsa(() => yorungeleriDegistir()),
    etiketler: hazirsa(() => etiketleriDegistir()),
    genelGorunum: hazirsa(() => genelGorunum()),
  };
  const ui = arayuzKur(olaylar);
  durum.hiz = ui.baslangicHizi();

  const etiketRenderer = new CSS2DRenderer();
  etiketRenderer.setSize(genislik, yukseklik);
  etiketRenderer.domElement.className = 'etiket-katmani';
  kap.appendChild(etiketRenderer.domElement);

  const sahne = new THREE.Scene();
  sahne.background = new THREE.Color(0x000000);

  const kamera = new THREE.PerspectiveCamera(45, genislik / yukseklik, 0.1, 40000);
  kamera.position.set(-400, 620, 1000);
  kamera.lookAt(0, 0, 0);

  // ---- Postprocessing -----------------------------------------------------
  // Yarı kayan noktalı (HDR) hedef: yalnızca 1'in üstündeki değerler, yani Güneş,
  // bloom üretir; gezegenler yanıp patlamaz. Çoklu örnekleme kenarları yumuşatır.
  const hedef = new THREE.WebGLRenderTarget(genislik * pikselOrani, yukseklik * pikselOrani, {
    type: THREE.HalfFloatType,
    samples: MSAA_ORNEK,
  });
  const composer = new EffectComposer(renderer, hedef);
  composer.setPixelRatio(pikselOrani);
  composer.setSize(genislik, yukseklik);
  composer.addPass(new RenderPass(sahne, kamera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(genislik, yukseklik), 0.5, 0.6, 1.0);
  // Eşik, parlaklık (luma) yerine en parlak renk kanalına bakar: turuncu Güneş'in
  // luması düşük olsa da kırmızı kanalı 1'in üstündedir; gezegenler ise hiçbir
  // kanalda 1'i aşmaz. Böylece yalnızca Güneş parlar.
  bloom.materialHighPassFilter.fragmentShader = bloom.materialHighPassFilter.fragmentShader.replace(
    'float v = dot( texel.xyz, luma );',
    'float v = max( texel.r, max( texel.g, texel.b ) );'
  );
  bloom.materialHighPassFilter.uniforms.smoothWidth.value = 0.25;
  composer.addPass(bloom);
  composer.addPass(new OutputPass());

  // ---- Denetimler ---------------------------------------------------------
  // Denetim tuvale değil sahne kabına bağlanır: etiketler tuvalin üstünde durduğu
  // için sürükleme ve tekerlek etiketin üzerindeyken de çalışsın.
  const kontroller = new OrbitControls(kamera, kap);
  kontroller.enableDamping = true;
  kontroller.dampingFactor = 0.07;
  kontroller.rotateSpeed = 0.55;
  kontroller.zoomSpeed = 0.9;
  kontroller.panSpeed = 0.8;
  kontroller.minDistance = 14;
  kontroller.maxDistance = 1500;
  kontroller.autoRotateSpeed = 0.7;
  kontroller.enabled = false; // açılış uçuşu bitene kadar

  // ---- Sahne içeriği ------------------------------------------------------
  const yonetici = new THREE.LoadingManager();
  let yuklemeHatasi = false;
  yonetici.onProgress = (_url, yuklenen, toplam) => {
    const oran = yuklenen / toplam;
    ui.yuklemeIlerleme(oran, 'yukleme.ilerleme', { yuzde: Math.round(oran * 100) });
  };
  yonetici.onError = (url) => {
    yuklemeHatasi = true;
    ui.yuklemeIlerleme(0, 'yukleme.hata', { url });
  };
  yonetici.onLoad = () => {
    if (!yuklemeHatasi) ui.yuklemeIlerleme(1, 'yukleme.hazir');
    // İlk kare: shader derleme ve doku yükleme takılması açılış ekranının arkasında kalsın
    kare();
    setTimeout(() => {
      ui.yuklemeBitti();
      saat.getDelta();
      renderer.setAnimationLoop(kare);
      hazir = true;
      acilis();
    }, 250);
  };

  // Doku sınırı 8K'nın altındaysa ya da küçük/dokunmatik ekranda gökyüzü dokusu küçültülür
  const enBuyukDoku = renderer.capabilities.maxTextureSize;
  const kucukEkran = DOKUNMATIK || Math.min(window.screen.width, window.screen.height) <= 820;
  const gokyuzuGenislik = enBuyukDoku < 8192 || kucukEkran ? Math.min(4096, enBuyukDoku) : 0;

  const sistem = gunesSistemiKur({
    sahne,
    yonetici,
    anizotropi: Math.min(8, renderer.capabilities.getMaxAnisotropy()),
    pikselOrani,
    gokyuzuGenislik,
  });

  // Simülasyon saati. Başlangıç: bugünün J2000'den bu yana gün sayısı; böylece
  // gezegenler yaklaşık olarak bugünkü gerçek konumlarında başlar.
  const baslangicGun = (Date.now() - Date.UTC(2000, 0, 1, 12)) / 86400000;
  const zaman = {
    simGun: baslangicGun, // yörünge hareketi
    donusGun: 0, // eksen dönüşleri (hız sınırlı)
    uyduGun: 0, // uydu hareketi (hız sınırlı)
    gorsel: 0, // shader animasyonları (sn)
  };

  const saat = new THREE.Clock();
  const v1 = new THREE.Vector3();
  const v2 = new THREE.Vector3();
  const v3 = new THREE.Vector3();
  const kaydirma = { x: 0, y: 0 }; // panel açıkken görüntü merkezinin kayması (piksel)

  // ---- Kamera uçuşu -------------------------------------------------------

  /**
   * OrbitControls'un sönümleme artığını (dönme/kaydırma/yakınlaşma ivmesi) sıfırlar.
   * Bu iç değerler dışarıya açık değildir: sönümleme kapalıyken bir update() hepsini
   * uygulayıp sıfırlar, ardından kameranın konumu ve hedefi geri yüklenir.
   */
  function sonumlemeyiSifirla() {
    v1.copy(kamera.position);
    v2.copy(kontroller.target);
    const otoDonus = kontroller.autoRotate;
    kontroller.enableDamping = false;
    kontroller.autoRotate = false;
    kontroller.update();
    kontroller.enableDamping = true;
    kontroller.autoRotate = otoDonus;
    kamera.position.copy(v1);
    kontroller.target.copy(v2);
    kamera.lookAt(kontroller.target);
  }

  /**
   * Kamerayı yumuşak, yay çizen bir yolla hedefe uçurur.
   * `hedefAl` her karede güncel hedef konumunu verir (gövde yörüngede ilerlerken
   * varış noktası da onunla birlikte kayar); `ofset` kameranın hedefe göre son konumudur.
   */
  function ucusBaslat({ hedefAl, ofset, sure = UCUS_SURESI, enYakin, yay = true, bitince }) {
    // Önceki sürüklemenin ivmesi varışta kameranın kaymasına yol açmasın
    sonumlemeyiSifirla();
    kontroller.enabled = false;
    durum.ucus = {
      t: 0,
      sure,
      p0: kamera.position.clone(),
      h0: kontroller.target.clone(),
      hedefAl,
      ofset,
      enYakin,
      yay,
      bitince,
    };
  }

  function ucusGuncelle(dt, dAci) {
    const u = durum.ucus;
    u.t = Math.min(1, u.t + dt / u.sure);
    if (dAci) u.ofset.applyAxisAngle(Y_EKSENI, dAci);

    const k = yumusak(u.t);
    u.hedefAl(v1); // güncel hedef
    v2.copy(v1).add(u.ofset); // güncel varış noktası

    kamera.position.lerpVectors(u.p0, v2, k);
    if (u.yay) {
      // Yolun ortasında yükselen yay: hem daha sinematik hem Güneş'in içinden geçmez
      kamera.position.y += Math.sin(Math.PI * k) * Math.min(u.p0.distanceTo(v2) * 0.14, 95);
    }
    // Bakış hedefi konumdan biraz önce varır; kamera önce hedefe döner, sonra yaklaşır
    kontroller.target.lerpVectors(u.h0, v1, yumusak(Math.min(1, u.t * 1.4)));
    kamera.lookAt(kontroller.target);

    if (u.t >= 1) {
      durum.ucus = null;
      kontroller.minDistance = u.enYakin;
      kontroller.enabled = true;
      kontroller.update(dt);
      if (u.bitince) u.bitince();
    }
  }

  /** Dikey ekranlarda gövdenin kadraja sığması için uzaklık çarpanı. */
  function dikeyCarpan() {
    const oran = genislik / yukseklik;
    const carpan = oran < 1 ? Math.min(1.9, Math.pow(1 / oran, 0.7)) : 1;
    // Mobilde alttan çıkan çekmece ekranın bir kısmını kapatır; biraz daha uzaktan bak
    return genislik <= 720 ? carpan * 1.45 : carpan;
  }

  function genelOfset() {
    const oran = genislik / yukseklik;
    const uzaklik = Math.min(1300, Math.max(460, 415 / (0.414 * oran)));
    return new THREE.Vector3(0, 0.42, 0.908).multiplyScalar(uzaklik);
  }

  function gunesAcisi(g) {
    (g.ebeveyn || g).dunyaKonumu(v3);
    return Math.atan2(-v3.z, v3.x);
  }

  // ---- Odaklanma ----------------------------------------------------------

  function odaklan(id, { panel = true } = {}) {
    const g = sistem.govdeler.get(id);
    if (!g) return;
    durum.odak = g;
    durum.sonAci = gunesAcisi(g);
    kontroller.enablePan = false;

    ui.sec(id);
    sistem.yorungeVurgula(id);
    if (panel) {
      ui.panelGoster(id);
      durum.panelAcik = true;
    }

    const konum = g.dunyaKonumu(new THREE.Vector3());
    const yon = new THREE.Vector3();
    if (g.tip === 'yildiz') {
      // Güneş'e bulunduğumuz yönden yaklaş
      yon.copy(kamera.position).sub(konum);
      yon.y = 0;
      if (yon.lengthSq() < 1e-6) yon.set(0, 0, 1);
      yon.normalize();
      yon.y = 0.26;
    } else {
      // Güneş'e bakan (aydınlık) taraftan, biraz yandan ve yukarıdan yaklaş:
      // böylece hem gündüz yüzü hem terminatör görünür
      yon.copy(konum).multiplyScalar(-1);
      yon.y = 0;
      yon.normalize().applyAxisAngle(Y_EKSENI, 0.62);
      yon.y = 0.24;
    }
    yon.normalize().multiplyScalar(g.yaricap * g.bakisCarpani * dikeyCarpan());

    ucusBaslat({
      hedefAl: (hedefVektor) => g.dunyaKonumu(hedefVektor),
      ofset: yon,
      enYakin: g.yaricap * 1.35,
    });
  }

  function genelGorunum(sure = UCUS_SURESI) {
    durum.odak = null;
    durum.panelAcik = false;
    kontroller.enablePan = true;
    ui.sec(null);
    ui.panelGizle();
    sistem.yorungeVurgula(null);
    ucusBaslat({
      hedefAl: (hedefVektor) => hedefVektor.set(0, 0, 0),
      ofset: genelOfset(),
      sure,
      enYakin: 14,
    });
  }

  function komsuyaGit(yon) {
    let sira;
    if (!durum.odak) {
      sira = yon > 0 ? 0 : ANA_SIRA.length - 1;
    } else if (durum.odak.ebeveyn) {
      // Uydudan: geri → kendi gezegeni, ileri → sonraki gezegen
      const ebeveynSira = ANA_SIRA.indexOf(durum.odak.ebeveyn.id);
      sira = yon > 0 ? ebeveynSira + 1 : ebeveynSira;
    } else {
      sira = ANA_SIRA.indexOf(durum.odak.id) + yon;
    }
    sira = (sira + ANA_SIRA.length) % ANA_SIRA.length;
    odaklan(ANA_SIRA[sira]);
  }

  // ---- Açılış -------------------------------------------------------------

  function acilis() {
    ucusBaslat({
      hedefAl: (hedefVektor) => hedefVektor.set(0, 0, 0),
      ofset: genelOfset(),
      sure: ACILIS_SURESI,
      enYakin: 14,
      yay: false,
      bitince: () => {
        durum.acilisIpucu = true;
        ui.ipucu(() => t(DOKUNMATIK ? 'ipucu.acilisDokunmatik' : 'ipucu.acilis'), 9000);
      },
    });
  }

  // ---- Tur ----------------------------------------------------------------

  function turAdimi() {
    const id = ANA_SIRA[durum.tur.sira];
    const sira = durum.tur.sira + 1;
    durum.tur.bekleme = 0;
    odaklan(id);
    // Gövde adı kalıba kaçışlanarak konur; dil değişince ipucu yeniden üretilir
    ui.ipucu(() => tHtml('ipucu.tur', { ad: govdeMetni(id).ad, sira, toplam: ANA_SIRA.length }), 0);
  }

  function turBaslat() {
    durum.tur = { sira: 0, bekleme: 0 };
    durum.acilisIpucu = false;
    ui.dugmeDurumu('tur', true);
    turAdimi();
  }

  function turDurdur({ genel = false } = {}) {
    if (!durum.tur) return;
    durum.tur = null;
    kontroller.autoRotate = false;
    ui.dugmeDurumu('tur', false);
    ui.ipucuGizle();
    if (genel) genelGorunum();
  }

  function turDegistir() {
    if (durum.tur) turDurdur();
    else turBaslat();
  }

  function turGuncelle(dt) {
    const tur = durum.tur;
    if (!tur) return;
    // Gövdenin başındayken kamera yavaşça çevresinde dolanır
    kontroller.autoRotate = !durum.ucus && !AZ_HAREKET;
    if (durum.ucus) return;
    tur.bekleme += dt;
    if (tur.bekleme >= TUR_BEKLEME) {
      tur.sira += 1;
      if (tur.sira >= ANA_SIRA.length) turDurdur({ genel: true });
      else turAdimi();
    }
  }

  // ---- Aç/kapa ------------------------------------------------------------

  function duraklatDegistir() {
    durum.duraklat = !durum.duraklat;
    ui.duraklatildi(durum.duraklat);
  }

  function yorungeleriDegistir() {
    durum.yorungeler = !durum.yorungeler;
    sistem.yorungeleriGoster(durum.yorungeler);
    ui.dugmeDurumu('yorunge', durum.yorungeler);
  }

  function etiketleriDegistir() {
    durum.etiketler = !durum.etiketler;
    ui.dugmeDurumu('etiket', durum.etiketler);
  }

  // ---- Dil ----------------------------------------------------------------
  // Arayüz kendi metinlerini yeniler; burada yalnızca 3B etiketler kalır.
  // Kamera, odak, zaman ve tur durumuna dokunulmaz.
  dilDegisince(() => sistem.etiketAdlariniYenile());

  // ---- Tıklama ve üzerine gelme -------------------------------------------

  const isinlayici = new THREE.Raycaster();
  const fare = new THREE.Vector2();
  const tuval = renderer.domElement;
  const isaretciler = new Map(); // etkin işaretçiler (çoklu dokunuşu ayırt etmek için)
  let basma = null; // { x, y, zaman, gecerli, etiketId }
  let uzerindeKontrol = false;
  let sonFare = null;

  /** Ekran koordinatındaki gövdenin kimliğini döndürür (yoksa null). */
  function govdeBul(x, y) {
    const kutu = tuval.getBoundingClientRect();
    fare.set(((x - kutu.left) / kutu.width) * 2 - 1, -((y - kutu.top) / kutu.height) * 2 + 1);
    kamera.updateMatrixWorld();
    isinlayici.setFromCamera(fare, kamera);
    const isabetler = isinlayici.intersectObjects(sistem.isabetListesi(kamera, yukseklik), false);
    return isabetler.length ? isabetler[0].object.userData.id : null;
  }

  // Sahne kabı hem tuvali hem etiket katmanını kapsar. Basılan yer bir etiketse
  // kimliği hatırlanır; kısa ve kıpırtısız bırakılırsa o gövdeye gidilir.
  kap.addEventListener('pointerdown', (olay) => {
    isaretciler.set(olay.pointerId, true);
    const etiket = olay.target instanceof Element ? olay.target.closest('.etiket') : null;
    basma = {
      x: olay.clientX,
      y: olay.clientY,
      zaman: performance.now(),
      // Yalnızca tek parmak / sol tuş tıklama sayılır
      gecerli: isaretciler.size === 1 && olay.button === 0,
      etiketId: etiket ? etiket.dataset.id : null,
    };
  });

  tuval.addEventListener('pointermove', (olay) => {
    if (olay.pointerType === 'mouse' && olay.buttons === 0) {
      sonFare = { x: olay.clientX, y: olay.clientY };
      uzerindeKontrol = true;
    }
  });

  tuval.addEventListener('pointerleave', () => {
    sonFare = null;
    tuval.style.cursor = '';
  });

  function isaretciBirak(olay) {
    isaretciler.delete(olay.pointerId);
  }
  window.addEventListener('pointercancel', (olay) => {
    isaretciBirak(olay);
    basma = null;
  });
  window.addEventListener('pointerup', (olay) => {
    const b = basma;
    isaretciBirak(olay);
    if (!b || !b.gecerli) return;
    basma = null;
    // Denetim işaretçiyi yakaladığında hedef kabın kendisidir; yakalama yoksa
    // (ör. uçuş sırasında) bırakılan yer yine sahnenin içinde olmalı
    if (!hazir || !(olay.target instanceof Node) || !kap.contains(olay.target)) return;
    // Sürükleme ile tıklamayı ayır: birkaç pikselden fazla oynadıysa tıklama değildir
    const oynama = Math.hypot(olay.clientX - b.x, olay.clientY - b.y);
    if (oynama > 6 || performance.now() - b.zaman > 700) return;
    const id = b.etiketId || govdeBul(olay.clientX, olay.clientY);
    if (id) odaklan(id);
  });

  // ---- Kullanıcı etkileşimi turu durdurur ---------------------------------

  /** Tur düğmesi turu kendisi yönetir; dil düğmesi ise sahne durumuna dokunmaz. */
  function turuEtkilemez(hedef) {
    return hedef instanceof Element && !!hedef.closest('#dugme-tur, #dugme-dil');
  }

  function etkilesim(olay) {
    if (turuEtkilemez(olay.target)) return;
    if (durum.acilisIpucu) {
      durum.acilisIpucu = false;
      ui.ipucuGizle();
    }
    if (durum.tur) turDurdur();
  }
  window.addEventListener('pointerdown', etkilesim, true);
  window.addEventListener('wheel', etkilesim, { capture: true, passive: true });

  // ---- Klavye -------------------------------------------------------------

  /** Klavye kısayoluyla gövde değişince menüde eski öğenin odak çerçevesi kalmasın. */
  function menuOdaginiBirak() {
    const aktif = document.activeElement;
    if (aktif instanceof HTMLElement && aktif.closest('#menu')) aktif.blur();
  }

  window.addEventListener('keydown', (olay) => {
    if (olay.metaKey || olay.ctrlKey || olay.altKey) return;
    const tus = olay.key;
    const hedef = olay.target instanceof HTMLElement ? olay.target : null;
    const girdide = !!hedef && hedef.tagName === 'INPUT';

    if (ui.yardimAcik()) {
      // Pencere içinde düğmeler normal çalışır (Boşluk/Enter kapat düğmesini tetikler)
      if (tus === 'Escape' && !olay.repeat) ui.yardimGoster(false);
      return;
    }

    // Boşluk her yerde yalnızca duraklatır/oynatır: odaktaki düğmenin kendi tıklaması
    // tetiklenmesin (bkz. keyup) ve sayfa kaymasın
    if (tus === ' ') olay.preventDefault();
    if (!hazir || olay.repeat) return;

    // Tur/dil düğmesinde Enter düğmenin kendi tıklamasını tetikler: tur düğmesi
    // turu kendisi durdurur, dil düğmesi turu etkilemez. Burada ayrıca durdurma.
    const turTusu = tus === 't' || tus === 'T';
    const dugmeKendisiYapar = tus === 'Enter' && turuEtkilemez(hedef);
    if (durum.tur && !turTusu && !dugmeKendisiYapar) turDurdur();
    if (durum.acilisIpucu && !dugmeKendisiYapar) {
      durum.acilisIpucu = false;
      ui.ipucuGizle();
    }

    if (tus >= '0' && tus <= '8' && tus.length === 1) {
      menuOdaginiBirak();
      odaklan(ANA_SIRA[Number(tus)]);
    } else if (tus === ' ') {
      duraklatDegistir();
    } else if (tus === 'Escape') {
      menuOdaginiBirak();
      genelGorunum();
    } else if (tus === 'o' || tus === 'O') {
      yorungeleriDegistir();
    } else if (tus === 'l' || tus === 'L') {
      etiketleriDegistir();
    } else if (turTusu) {
      turDegistir();
    } else if (tus === '?') {
      ui.yardimGoster(true);
    } else if (tus === 'ArrowRight' && !girdide) {
      menuOdaginiBirak();
      komsuyaGit(1);
    } else if (tus === 'ArrowLeft' && !girdide) {
      menuOdaginiBirak();
      komsuyaGit(-1);
    }
  });

  // Düğmeler Boşluk'la tıklamayı tuş bırakılınca yapar; burada da engellenir ki
  // Boşluk odaktaki düğmeyi ikinci kez tetiklemesin
  window.addEventListener('keyup', (olay) => {
    if (olay.key !== ' ' || ui.yardimAcik()) return;
    if (olay.target instanceof HTMLElement && olay.target.tagName === 'BUTTON') olay.preventDefault();
  });

  // ---- Pencere olayları ---------------------------------------------------

  window.addEventListener('resize', () => {
    genislik = window.innerWidth;
    yukseklik = window.innerHeight;
    // Pencere başka bir ekrana taşındıysa ya da sayfa yakınlaştırıldıysa piksel oranı değişir
    pikselOrani = pikselOraniHesapla();
    kamera.aspect = genislik / yukseklik;
    kamera.updateProjectionMatrix();
    renderer.setPixelRatio(pikselOrani);
    renderer.setSize(genislik, yukseklik);
    composer.setPixelRatio(pikselOrani);
    composer.setSize(genislik, yukseklik);
    etiketRenderer.setSize(genislik, yukseklik);
    sistem.pikselOraniAyarla(pikselOrani);
  });

  // Sekme gizlenince animasyonu durdur, dönünce zaman sıçramasın
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      renderer.setAnimationLoop(null);
    } else if (calisiyor) {
      saat.getDelta();
      renderer.setAnimationLoop(kare);
    }
  });

  // ---- Kare döngüsü -------------------------------------------------------

  let calisiyor = false;

  function kare() {
    calisiyor = true;
    const dt = Math.min(saat.getDelta(), 0.1);

    // Birikimli simülasyon zamanı: hız değişse de konumlar sıçramaz
    if (!durum.duraklat) {
      zaman.simGun += dt * durum.hiz;
      zaman.donusGun += dt * Math.min(durum.hiz, DONUS_HIZ_SINIRI);
      zaman.uyduGun += dt * Math.min(durum.hiz, UYDU_HIZ_SINIRI);
      zaman.gorsel += dt;
    }
    sistem.guncelle(zaman);

    // Odaktaki gövdenin bu karedeki yer değiştirmesi ve Güneş çevresindeki dönüşü
    let dAci = 0;
    const odak = durum.odak;
    if (odak && odak.tip !== 'yildiz') {
      const aci = gunesAcisi(odak);
      dAci = aciSarmala(aci - durum.sonAci);
      durum.sonAci = aci;
    }

    if (durum.ucus) {
      ucusGuncelle(dt, dAci);
    } else {
      if (odak) {
        // TAKİP: kameranın gövdeye göre konumu korunur; ayrıca gövdeyle birlikte
        // Güneş'in çevresinde döndürülür ki aydınlık taraf kadrajda kalsın.
        // Kullanıcı bu sırada serbestçe dönebilir ve yakınlaşabilir.
        v1.copy(kamera.position).sub(kontroller.target);
        if (dAci) v1.applyAxisAngle(Y_EKSENI, dAci);
        odak.dunyaKonumu(kontroller.target);
        kamera.position.copy(kontroller.target).add(v1);
      }
      // Gerçek kare süresiyle: otomatik dönüş yüksek yenileme hızında hızlanmasın
      kontroller.update(dt);
    }

    turGuncelle(dt);

    // Yakın kırpma düzlemi uzaklığa göre ayarlanır: yakında ayrıntı, uzakta z-fighting'siz derinlik
    const hedefUzaklik = kamera.position.distanceTo(kontroller.target);
    const yuzeyUzaklik = odak ? Math.max(hedefUzaklik - odak.yaricap, 0.02) : hedefUzaklik;
    kamera.near = THREE.MathUtils.clamp(yuzeyUzaklik * 0.05, 0.01, 2);

    // Panel açıkken görüntü merkezini panelin kapatmadığı alana kaydır
    const mobil = genislik <= 720;
    const hedefX = durum.panelAcik && !mobil ? Math.min(184, genislik * 0.14) : 0;
    const hedefY = durum.panelAcik && mobil ? yukseklik * 0.19 : 0;
    const yaklasma = 1 - Math.exp(-dt * 4.5);
    kaydirma.x += (hedefX - kaydirma.x) * yaklasma;
    kaydirma.y += (hedefY - kaydirma.y) * yaklasma;
    kamera.setViewOffset(genislik, yukseklik, kaydirma.x, kaydirma.y, genislik, yukseklik);
    kamera.updateMatrixWorld();

    sistem.kameraIzle(kamera, dt);
    sistem.etiketleriGuncelle(kamera, odak, durum.etiketler, genislik, yukseklik);
    ui.gecenSure(zaman.simGun - baslangicGun);

    // İmleç: bir gövdenin üzerindeyken işaret parmağı
    if (uzerindeKontrol && sonFare) {
      uzerindeKontrol = false;
      tuval.style.cursor = govdeBul(sonFare.x, sonFare.y) ? 'pointer' : '';
    }

    composer.render(dt);
    etiketRenderer.render(sahne, kamera);
  }
}
