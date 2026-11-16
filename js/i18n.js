// ---------------------------------------------------------------------------
// Dil desteği (Türkçe / İngilizce)
//
// Metinler metin-tr.js ve metin-en.js içindedir:
//   ARAYUZ : arayüz dizgileri  → t('anahtar', { degisken })
//   GOVDE  : gövde metinleri   → govdeMetni(id)
// HTML'deki metinler öznitelikle bağlanır ve dil değişince yeniden yazılır:
//   data-i18n        → textContent
//   data-i18n-aria   → aria-label
//   data-i18n-title  → title
//   data-i18n-content→ content (meta etiketleri)
// Kod tarafında anında güncellenmesi gerekenler dilDegisince() ile abone olur.
// ---------------------------------------------------------------------------
import * as TR from './metin-tr.js';
import * as EN from './metin-en.js';

const DILLER = { tr: TR, en: EN };
const YEDEK = 'tr';
const YEREL_AD = { tr: 'tr-TR', en: 'en-US' };
const KAYIT_ANAHTARI = 'gunes-sistemi.dil';

function ilkDil() {
  try {
    const kayit = localStorage.getItem(KAYIT_ANAHTARI);
    if (kayit && DILLER[kayit]) return kayit;
  } catch {
    // Depolama kapalı olabilir (gizli pencere vb.); tarayıcı diline düş
  }
  const tarayici = String(navigator.language || '').toLowerCase();
  return tarayici.startsWith('tr') ? 'tr' : 'en';
}

let etkin = ilkDil();
const aboneler = new Set();
const sayiBicimleri = new Map(); // `${dil}|${basamak}` → Intl.NumberFormat

/** Etkin dil kodu: 'tr' ya da 'en'. */
export function etkinDil() {
  return etkin;
}

/** Etkin dilin Intl yerel adı (ör. 'tr-TR'). */
export function yerelAd() {
  return YEREL_AD[etkin];
}

function ham(anahtar) {
  const metin = DILLER[etkin].ARAYUZ[anahtar];
  if (metin !== undefined) return metin;
  const yedek = DILLER[YEDEK].ARAYUZ[anahtar];
  return yedek !== undefined ? yedek : anahtar;
}

function doldur(kalip, degiskenler, donustur) {
  if (!degiskenler) return kalip;
  return kalip.replace(/\{(\w+)\}/g, (tum, ad) =>
    ad in degiskenler ? donustur(String(degiskenler[ad])) : tum
  );
}

const HTML_KACIS = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
function htmlKacis(metin) {
  return metin.replace(/[&<>"']/g, (c) => HTML_KACIS[c]);
}

/** Arayüz dizgisi; {ad} gibi yer tutucular `degiskenler` ile doldurulur. */
export function t(anahtar, degiskenler) {
  return doldur(ham(anahtar), degiskenler, (d) => d);
}

/**
 * innerHTML'e yazılacak dizgi: kalıp güvenilir (<b> içerebilir), değişkenler ise
 * HTML olarak kaçışlanır; böylece bir ad kalıbı bozamaz.
 */
export function tHtml(anahtar, degiskenler) {
  return doldur(ham(anahtar), degiskenler, htmlKacis);
}

/** Gövdenin etkin dildeki metinleri: { ad, tur, aciklama, veriler, bilgiler }. */
export function govdeMetni(id) {
  return DILLER[etkin].GOVDE[id] || DILLER[YEDEK].GOVDE[id];
}

/** Sayıyı etkin dile göre biçimler (biçimleyici dil ve basamak başına bir kez kurulur). */
export function sayiBicimle(n, basamak = 0) {
  const anahtar = `${etkin}|${basamak}`;
  let bicim = sayiBicimleri.get(anahtar);
  if (!bicim) {
    bicim = new Intl.NumberFormat(YEREL_AD[etkin], {
      minimumFractionDigits: basamak,
      maximumFractionDigits: basamak,
    });
    sayiBicimleri.set(anahtar, bicim);
  }
  return bicim.format(n);
}

/** Verilen kökün altındaki data-i18n* öznitelikli öğeleri etkin dile çevirir. */
export function domCevir(kok = document) {
  for (const el of kok.querySelectorAll('[data-i18n]')) el.textContent = t(el.dataset.i18n);
  for (const el of kok.querySelectorAll('[data-i18n-aria]')) el.setAttribute('aria-label', t(el.dataset.i18nAria));
  for (const el of kok.querySelectorAll('[data-i18n-title]')) el.title = t(el.dataset.i18nTitle);
  for (const el of kok.querySelectorAll('[data-i18n-content]')) el.setAttribute('content', t(el.dataset.i18nContent));
}

function belgeyeUygula() {
  // Etiketler büyük harfe çevrilir; lang="tr" kalırsa İngilizce "Titan" → "TİTAN" olur
  document.documentElement.lang = etkin;
  domCevir(document);
}

/** Açılışta bir kez çağrılır: belge dilini ve statik metinleri ayarlar (kayıt yapmaz). */
export function dilBaslat() {
  belgeyeUygula();
}

/** Dili değiştirir, seçimi hatırlar ve abonelere haber verir. */
export function dilAyarla(yeni) {
  if (!DILLER[yeni] || yeni === etkin) return;
  etkin = yeni;
  try {
    localStorage.setItem(KAYIT_ANAHTARI, yeni);
  } catch {
    // Kaydedilemezse yalnızca bu oturum için geçerli olur
  }
  belgeyeUygula();
  for (const abone of aboneler) abone(yeni);
}

/** Dil değişince çağrılacak işlevi kaydeder; aboneliği bitiren işlevi döndürür. */
export function dilDegisince(abone) {
  aboneler.add(abone);
  return () => aboneler.delete(abone);
}
