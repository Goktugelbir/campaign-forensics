# Campaign Forensics — Proje Spesifikasyonu (Manus için)

> **Manus'a not:** Bu dosya projenin tek doğruluk kaynağıdır. Boş bir klasörde başlıyorsun. Aşağıdaki fazları sırayla uygula. Her fazın sonunda kabul kriterlerini kontrol et, kısa bir özet ver ve bir sonraki faza geçmeden onay iste. **Bugün hackathon günü, zaman kısıtlı:** belirsiz bir noktada bu dosyadaki varsayılanı seç, kararını özette bir satırla belirt ve devam et. Yalnızca geri alınamayan işlerde (kredi harcayan büyük çağrılar, yayına alma) sor.
>
> **Yardımcı dosyalar:** `Campaign Forensics — Frontend Sayfa Haritası.docx` (sayfa ve içerik ayrıntısı) ve `Campaign Forensics — Premium Tasarım.pdf` (görsel referans). Bunlar bu dosyayla çelişirse **bu dosya geçerlidir**; bölüm 7 iki dosyadaki kararları zaten içerir.

---

## 0. Çalışma kuralları (önce bunları oku)

1. **Fazlara sadık kal.** Bir fazı bitirmeden diğerine geçme. Her fazın sonunda: ne yapıldı, ne eksik, sıradaki adım.
2. **Sahte veri sadece Faz 1'de.** Faz 2'den itibaren rapordaki her bilgi gerçek bir kaynağa (URL) dayanmalı. Kaynak bulamazsan uydurma, "bulunamadı" yaz. Mock vaka **kurgusal bir marka** hakkındadır (bkz. 7.8); gerçek bir markaya (ör. Instagram) kanıtsız teşhis yazılmaz.
3. **Kredi tasarrufu.** Apify ve fal.ai çağrıları kredi harcar. Her actor çağrısında sonuç limiti ver (varsayılan `maxItems` 50–100). Aynı çağrıyı gereksiz tekrarlama. Büyük bir çağrıdan önce ne yapacağını tek cümleyle söyle.
4. **Kişisel veri yok.** Kullanıcı adları, profil linkleri, yüz fotoğrafları rapora girmez. Yorumlar anonim metin olarak saklanır.
5. **Hassas konu yok.** Siyasi, dini, ırk temalı içerik üretme ve rapora koyma.
6. **Arayüz dili İngilizce.** Kod, değişken ve dosya adları İngilizce. Bu spesifikasyon Türkçe.
7. **Basit tut.** Veritabanı, kullanıcı girişi, ödeme sistemi yok. Veri JSON dosyalarında durur.

---

## 1. Ürün özeti

**Campaign Forensics**, ajanslar ve markalar için bir **kampanya teşhis SaaS'ı**.

- Kullanıcı tutmayan bir kampanyayı (reklam, marka yenilemesi, lansman) girer.
- Sistem internetteki kanıtları toplar: yorumlar, haberler, forum tartışmaları, rakip/karşılaştırma içerikleri.
- 6 hipotezi kanıtla test eder, eler ve kampanyanın **neden** tutmadığını teşhis eder.
- Teşhise göre bir reçete ve yaratıcı brif çıkarır, düzeltilmiş kampanyayı (görsel/video) üretir.
- **Reklam hesabına erişim gerekmez.** Sadece kamuya açık veri kullanılır.

**Tek cümlelik değer önerisi:** *"Lansmandan sonraki 48 saatte ne ters gittiğini kanıtla gösterir ve düzeltilmiş kampanyayı üretir."*

**Slogan (arayüzde):** *"See why your launch backfired. With evidence."* ("failed" değil, çünkü Instagram vakası ticari başarısızlık değil, olumsuz lansman tepkisi.)

**Hedef müşteri:** Reklam ajansları, marka yenileyen şirketlerin pazarlama ekipleri.

---

## 2. Bağlam: Hackathon

- **Etkinlik:** 10X Your Brand Hackathon (Istanbul Ignited by Slush'D × Manus AI), 12 Ekim 2026, DotsHub İstanbul.
- **Build süresi:** 09:30–15:00. Teslim 15:00'te kilitlenir.
- **Sunum:** 2 dakika pitch + demo, 1 dakika soru. İlk 6 sahnede tekrar sunar.
- **Jüri kriterleri:**
  - **Transformation:** Önce/sonra farkı ne kadar görünür?
  - **Speed:** Gün içinde gerçekten ne üretildi?
  - **Use of Manus:** Manus işi araçlar ve akışlar arasında ne kadar anlamlı yönetti?
  - **Real-world utility:** Yarın canlıya alınıp ölçülebilir değer üretebilir mi?

Bu yüzden: **soruşturma akışını (veri → teşhis → üretim) Manus kendisi, MCP connector'larıyla yürütür.** Web uygulaması bu akışın sonuçlarını gösteren SaaS arayüzüdür.

---

## 3. Mimari

İki katman var:

```
┌──────────────────────────────────────────────────────────────────┐
│ KATMAN 1: SORUŞTURMA MOTORU  (Manus agent + MCP connectors)       │
│                                                                    │
│  case.json ──► [Adım 1: Kanıt]  ──► evidence.json                  │
│                 Apify MCP                                          │
│            ──► [Adım 2: Teşhis] ──► diagnosis.json                 │
│                 Manus analiz                                       │
│            ──► [Adım 3: Üretim] ──► creative.json (+ görsel/video)  │
│                 fal.ai (MCP veya API)                              │
└──────────────────────────────────────────────────────────────────┘
                              │ JSON dosyaları
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│ KATMAN 2: SAAS WEB UYGULAMASI  (Next.js, statik JSON okur)         │
│  Landing · New Case · Report (Case · Evidence · Diagnosis · Relaunch)│
└──────────────────────────────────────────────────────────────────┘
```

- Web uygulaması **Apify veya fal.ai API'sini doğrudan çağırmaz.** Sadece `data/cases/<slug>/` altındaki JSON dosyalarını okur.
- "New Case" formu bir `case.json` taslağı üretir ve kullanıcıya "Investigation queued" ekranı gösterir. Formun arkasında motoru otomatik tetiklemek **kapsam dışıdır** (yol haritası maddesi). Demoda motoru Manus görevi olarak biz çalıştırırız.

### Teknoloji

- **Next.js (App Router) + TypeScript + Tailwind CSS**
- Grafik gerekiyorsa: `recharts`
- İkonlar: `lucide-react`
- Veritabanı yok. Veri: `data/cases/<slug>/*.json`
- Tek komutla çalışmalı: `npm install && npm run dev`
- Yayına alma: Manus'un kendi yayınlama/deploy özelliği (paylaşılabilir link gerekli).

---

## 4. MCP connector'ları

### 4.1 Apify (veri toplama)

- **Bağlantı:** Manus → Settings → Connectors → Custom MCP → Server URL: `https://mcp.apify.com` (OAuth ile Apify hesabına giriş).
- **Kullanım:** Actor'leri Apify Store'dan bul ve çalıştır. Actor isimleri değişebilir; önce Apify'ın actor arama aracıyla doğrula, sonra çalıştır.
- **Önerilen actor türleri** (isimleri doğrula):

| İhtiyaç | Aranacak actor | Not |
|---|---|---|
| Haberler / genel web | Google Search Results Scraper | TR + EN sorgular |
| Instagram yorumları | Instagram Comment Scraper | Gönderi URL'si ile |
| Instagram gönderileri | Instagram Scraper | Hesap/gönderi meta verisi |
| YouTube yorumları | YouTube Comments Scraper | Video URL'si ile |
| Reddit | Reddit Scraper | Subreddit + arama terimi |
| Sayfa içeriği | Website Content Crawler | Haber metni, blog, forum sayfası |
| Threads / X | Uygun bir actor varsa | Yoksa atla, Google Search ile `site:` sorgusu dene |

- **Limitler:** Her çağrıda `maxItems` / `resultsLimit` ver. Varsayılan 50–100. Toplam hedef: **30–80 kaliteli kanıt.**
- **Ham çıktılar:** `data/cases/<slug>/raw/<source>.json` olarak sakla.

### 4.2 fal.ai (görsel ve video üretimi)

- **Bağlantı:** fal.ai için Manus'ta bir MCP connector'ı varsa onu kullan (Settings → Connectors). Yoksa fal.ai API'sini Manus görevi içinden çağır (`@fal-ai/client` veya Python `fal-client`). API anahtarı `FAL_KEY` ortam değişkeninde durur, **koda, repoya ve web uygulamasına asla yazılmaz.**
- **Model seçimi:** Model ID'leri değişebilir; çalıştırmadan önce fal.ai model sayfasından doğrula. Önerilen başlangıç:
  - **Görsel (logo/kimlik konsepti):** metin çizimi güçlü bir model (ör. Ideogram veya Recraft; wordmark için yazı doğruluğu kritik). Genel kampanya görseli için FLUX ailesi.
  - **Video:** görselden videoya (image-to-video) bir model (ör. Kling veya Veo ailesi). Önce görseli üret, sonra onu ilk kare olarak kullan; tutarlılık artar.
- **Kredi tasarrufu:** Önce 1 görsel varyantı üret, beğenilirse çoğalt. Video pahalıdır: en fazla 2 deneme. Her çağrıdan önce model ve tahmini maliyeti tek cümleyle söyle.
- **Kullanım:** Adım 3'te `creative_brief`'ten görsel ve kısa video üret.
- **Video kuralları:** 10–20 saniye (gerekirse 5–10 sn'lik 2–3 klip art arda), 3–4 sahne, temiz ve sade. "AI slop" görünümünden kaçın (bozuk eller, anlamsız yazılar, aşırı efekt). Wordmark videoda üretilmez; yazı gerekiyorsa üretilen logo görseli sahneye yerleştirilir.
- **Çıktı:** fal.ai'ın döndürdüğü URL'ler geçicidir: dosyaları hemen `public/cases/<slug>/` altına indir, `creative.json`'a yerel yolu ve kullanılan model ID'sini yaz.

### 4.3 Connector yoksa

Bir connector çalışmazsa durma: hatayı açıkça söyle ve alternatif öner (ör. Manus'un kendi görsel üretimi). Kullanıcı onaylamadan alternatife geçme.

---

## 5. Veri sözleşmeleri (TypeScript tipleri)

Bu tipler `lib/types.ts` dosyasında tanımlanır ve hem motor hem uygulama tarafından kullanılır.

```ts
// data/cases/<slug>/case.json
export interface Case {
  slug: string;                 // "instagram-wordmark-2026"
  brand: string;                // "Instagram"
  campaign: string;             // "New wordmark / brand refresh"
  campaign_type: "ad" | "rebrand" | "launch" | "other";
  launch_date: string;          // ISO date, "2026-08-.."
  summary: string;              // 2-3 cümle, ne oldu
  claim: string;                // markanın kampanyayla iddia ettiği şey
  comparison_targets: string[]; // karşılaştırma: önceki versiyon, rakipler
  key_questions: string[];      // vakaya özel soruşturma soruları
  assets: { label: string; url: string }[]; // eski görsel/video linkleri
  status: "draft" | "collecting" | "diagnosing" | "producing" | "done";
}

// data/cases/<slug>/evidence.json
export interface EvidenceFile {
  case_slug: string;
  collected_at: string;         // ISO datetime
  sources_summary: { source: string; count: number }[];
  evidence: Evidence[];
}

export interface Evidence {
  id: string;                   // "ev_001"
  source: "news" | "instagram" | "youtube" | "reddit" | "x" | "threads" | "web" | "competitor";
  type: "comment" | "news" | "discussion" | "ad" | "official";
  url: string;                  // ZORUNLU, gerçek kaynak
  date: string | null;
  lang: "en" | "tr" | "other";
  text: string;                 // anonim, max ~500 karakter
  metrics?: { likes?: number; replies?: number; views?: number };
  sentiment?: "negative" | "neutral" | "positive";
  tags?: string[];              // ör. "readability", "nostalgia", "design-community"
}

// data/cases/<slug>/diagnosis.json
export type HypothesisName =
  | "Positioning" | "Target Audience" | "Differentiation"
  | "Message" | "Creative Execution" | "Competition";

export interface DiagnosisFile {
  case_slug: string;
  hypotheses: Hypothesis[];     // tam olarak 6 adet
  diagnosis: {
    main_cause: string;         // tek cümle, spesifik
    explanation: string;        // 3-5 cümle
    secondary_causes: string[];
    surprising_finding: string; // ekibi şaşırtan bulgu
    evidence_ids: string[];
  };
  prescription: { change: string; why: string; evidence_ids: string[] }[];
  creative_brief: {
    concept: string;
    message: string;
    audience: string;
    tone: string;
    scenes: string[];           // 3-4 sahne
    visual_direction: string;
    cta: string;
  };
  before_after: { dimension: string; before: string; after: string }[];
  generic_check: { passed: boolean; note: string }; // bkz. Adım 2
}

export interface Hypothesis {
  id: string;                   // "H1".."H6"
  name: HypothesisName;
  status: "confirmed" | "rejected" | "uncertain";
  confidence: number;           // 0-100
  evidence_ids: string[];
  reasoning: string;            // 2-3 cümle
}

// data/cases/<slug>/creative.json
export interface CreativeFile {
  case_slug: string;
  assets: {
    kind: "image" | "video";
    label: string;              // "Revised wordmark concept", "Relaunch video"
    path: string;               // public/cases/<slug>/... veya URL
    prompt_used: string;
    tool: "fal" | "manus";
    model?: string;             // fal.ai model ID, ör. "fal-ai/..."
  }[];
}
```

---

## 6. Soruşturma motoru (Katman 1)

Motor 3 adımdan oluşur. Her adım ayrı çalıştırılabilir ve çıktısını dosyaya yazar. Kullanıcı "Run step 1 for <slug>" gibi komut verdiğinde ilgili adımı çalıştır.

### Adım 1: Kanıt toplama → `evidence.json`

1. `case.json`'ı oku. `key_questions` ve `comparison_targets`'tan bir **kaynak planı** çıkar (hangi actor, hangi sorgu/URL, hangi limit). Planı göster, onay al.
2. Apify MCP ile çalıştır. Ham çıktıları `raw/` altına kaydet.
3. **Normalize et:** Evidence şemasına çevir. Kullanıcı adlarını ve kişisel bilgileri sil. Tekrarları ve spam'i ele. Çok kısa ve anlamsız yorumları at.
4. Her kanıta `sentiment` ve 1–3 `tags` ekle.
5. **Denge kontrolü:** En az 3 farklı kaynak türü olmalı. Sadece olumsuz değil, destekleyen/nötr kanıtları da dahil et.
6. `sources_summary` ile birlikte `evidence.json`'a yaz. Sonunda kaynak dağılımını ve en dikkat çekici 5 kanıtı özetle.

### Adım 2: Teşhis → `diagnosis.json`

1. `case.json` + `evidence.json`'ı oku.
2. 6 hipotezin her birini kanıtla değerlendir:
   - **Positioning:** Marka/kampanya pazarda doğru yeri anlatıyor mu?
   - **Target Audience:** Doğru kitleye mi konuştu? Tepki veren kim?
   - **Differentiation:** Rakiplerden/önceki halinden ayrışıyor mu?
   - **Message:** Ana mesaj anlaşıldı mı? Yanlış okundu mu?
   - **Creative Execution:** Görsel/tasarım/uygulama kalitesi sorun mu?
   - **Competition:** Rakip veya bağlam etkisi var mı?
3. Her hipotez için: `status`, `confidence`, en az 2 `evidence_ids`, kısa gerekçe. Kanıtı olmayan hipotez `uncertain` olur.
4. Ana teşhisi yaz. **Her iddia en az bir kanıta bağlı olmalı.**
5. **Jenerik teşhis testi** (zorunlu): Kendine sor: *"Bu ana teşhis, başka bir markanın başka bir kampanyasına da aynen uyar mı?"* Evet ise teşhisi daha spesifik hâle getir ve tekrar dene. Sonucu `generic_check`'e yaz. Örnek jenerik (kabul edilmez): "İnsanlar değişimi sevmez." Örnek spesifik: "Yeni logodaki harf birleşimi küçük boyutta 'r' ve 'a'yı 'z' gibi okutuyor; şikâyetlerin çoğu bu okunabilirlik sorununa odaklanıyor."
6. Reçete (3–5 madde), yaratıcı brif ve önce/sonra tablosunu (4–6 satır) yaz.

### Adım 3: Üretim → `creative.json`

1. `creative_brief`'i oku.
2. Kampanya türüne göre üret:
   - **rebrand:** Düzeltilmiş logo/kimlik konsepti görseli (1–3 varyant) + kısa yeniden lansman videosu.
   - **ad / launch:** Yeni kampanya görseli + kısa video.
3. fal.ai ile üret (bkz. 4.2; prompt şablonları `fal_from_brief.md`). Kullanılan prompt'ları ve model ID'lerini kaydet.
4. Dosyaları `public/cases/<slug>/` altına indir, `creative.json`'a yaz.

### Tek seferde çalıştırma

Kullanıcı "Run full investigation for <slug>" derse 3 adımı sırayla çalıştır; her adım arasında 2–3 cümlelik ara özet ver. (Bu, demoda gösterilecek uçtan uca akış.)

---

## 7. Web uygulaması (Katman 2)

### 7.1 Sayfalar ve öncelik

**P0** = demo bunsuz çalışmaz, Faz 1'de yapılır. **P1** = "gerçek ürün" hissi, Faz 5'te. **P2** = yasal/destek, Faz 5'te tek şablonla, zaman kalırsa. P1/P2 sayfaları yapılana kadar linkleri basit bir "Coming soon" sayfasına gider (kırık link olmaz).

| Route | Sayfa | Öncelik | Nereden erişilir |
|---|---|---|---|
| `/` | Landing | **P0** | Logo, header |
| `/cases` | Vaka listesi | **P0** | Header ("Sample reports") |
| `/cases/[slug]` | Rapor (4 sekme) | **P0** | Vaka kartı, landing CTA |
| `/new` | New Case formu + "Investigation queued" durumu | **P0** | Header CTA |
| `error.tsx` | Hata ekranı | **P0** | Otomatik |
| `/how-it-works` | Methodology | P1 | Header |
| `/pricing` | Pricing | P1 | Header |
| `/faq` | SSS + sözlük | P1 | Header, footer |
| `/legal/data-sources` | Responsible Data Use | P1 | Footer, Evidence sekmesi |
| `/legal/disclaimer` | Disclaimer (marka ve yöntem) | P1 | Footer, rapor altı |
| `not-found.tsx`, `loading.tsx`, boş durum bileşeni | Sistem ekranları | P1 | Otomatik |
| `/about`, `/contact` | Şirket | P2 | Footer |
| `/legal/privacy`, `/legal/kvkk` (Türkçe), `/legal/cookies`, `/legal/terms`, `/legal/data-request` | Yasal | P2 | Footer |
| `/cases/[slug]/print` | Yazdırılabilir rapor (`@media print`) | P2 | Rapor üstü buton |

- **Header:** How it works · Sample reports · Pricing · FAQ · **[Start a case →]** butonu.
- **Footer:** Product (How it works, Sample reports, Pricing, Start a case) · Company (About, Contact) · Legal (Privacy, KVKK Notice (TR), Cookies, Terms, Responsible Data Use, Disclaimer, Data requests). Alt satır: "© 2026 Campaign Forensics · Built with Manus, Apify and fal.ai" + "Brand names are trademarks of their owners. We are not affiliated with any brand we analyze."
- **Yasal sayfalar** tek bir `LegalPage` bileşeni + `content/legal/*.md` dosyalarıyla üretilir (başlık, "Last updated", içindekiler, gövde). İçerik iskeleti docx'teki Grup C'de. Hukuki görüş değildir; gerçek lansman öncesi avukat kontrolü gerekir.
- **Dil:** Arayüz İngilizce. PDF'teki TR | EN değiştirici **Faz 1'de yapılmaz** (en erken Faz 5, zaman kalırsa). Yalnızca KVKK metni Türkçedir.

### 7.2 Landing page (`/`)

Yukarıdan aşağıya:

1. **Hero:** Üstte küçük etiket "CAMPAIGN FORENSICS · BETA". Başlık *"See why your launch backfired. With evidence."* Alt metin: "Campaign Forensics collects the public reaction to your campaign, tests six explanations against the evidence, and tells you what actually went wrong — then produces the fixed campaign. Every claim links to its source." Butonlar: **See a sample report →** (ana vaka; Faz 5'e kadar demo-mock) ve **Start a case** (`/new`). Sağda canlı önizleme: Main cause kutusu, 2 hipotez rozeti, 1 kanıt kartı (MOCK DATA rozetli).
2. **Güven şeridi:** "NO AD ACCOUNT ACCESS · EVERY CLAIM SOURCED · DIAGNOSIS TO CREATIVE".
3. **Recently investigated:** "Instagram — wordmark refresh · Lay's — global rebrand · McDonald's NL — AI holiday ad". **Düz metin, marka logosu yok.**
4. **The problem:** "Campaigns don't fail silently. The evidence is just scattered." + 3 sütun: Comments / Coverage / Competitors.
5. **How it works:** 01 Evidence → 02 Diagnosis → 03 Relaunch, her biri kısa paragraf; "Read the methodology →" (`/how-it-works`).
6. **Sample report önizlemesi:** "What a diagnosis looks like." 3 hipotez kartı (confirmed / uncertain / rejected) + "Open the full report →".
7. **Why Campaign Forensics — "Not another dashboard.":** No ad account access · Every claim is sourced · Diagnosis to creative, one flow.
8. **Kimler için:** For agencies (new-business pitch) · For brand teams (48 saat içinde lansman sonrası).
9. **Pricing:** 3 kart: **Single report $49** · **Agency $299/mo** (MOST POPULAR; sınırsız vaka, white-label rapor yol haritası etiketiyle) · **Enterprise "Let's talk"**. Altında "Beta — prices may change".
10. **FAQ özeti:** 4 soru (What does it do? · Why not just ask ChatGPT? · How reliable is a diagnosis? · Do you need access to our ad accounts?), akordeon; "All questions →".
11. **Waitlist:** "Get early access." E-posta alanı + buton. Ayrı ve **önceden işaretlenmemiş** pazarlama onay kutusu ("Send me product updates by e-mail…") + "By joining you acknowledge our Privacy Policy and KVKK Notice." Backend yok: gönderince teşekkür mesajı.
12. **Footer** (7.1).

### 7.3 New Case (`/new`)

- **Alanlar:** Brand\*, Campaign name\*, Campaign type\* (select: ad / rebrand / launch / other), Launch date\*, Campaign URL(s)\* (birden fazla eklenebilir), "What did the brand want to achieve?" (claim), Competitors / comparison (opsiyonel), "Your e-mail for the report" (opsiyonel).
- **Zorunlu onay kutusu:** "I confirm I am authorized to request this analysis and have read the [KVKK notice] and [Terms]."
- **Doğrulama:** zorunlu alanlar, URL formatı, gelecek tarih uyarısı.
- **Start investigation** → aynı sayfada "Investigation queued" durumu: `case.json` taslağının önizlemesi + **Download** butonu, 3 adımlı ilerleme göstergesi (Evidence → Diagnosis → Relaunch; demoda statik), "Typical turnaround: under 48 hours", "See a sample report" linki.
- Otomatik tetikleme yok (kapsam dışı).

### 7.4 Vaka listesi (`/cases`)

- Kart grid'i: marka, kampanya adı, tür rozeti, lansman tarihi, durum rozeti (draft → done), kanıt sayısı, ana sebebin ilk cümlesi.
- demo-mock vakasında görünür **MOCK DATA** rozeti; Faz 5'te listeden gizlenir.
- Filtre: tür ve durum. Boş durum: "No cases yet — Start a case".

### 7.5 Rapor (`/cases/[slug]`)

**Üst başlık (her sekmede sabit):** üst satırda mono etiket "CASE CF-0412 · REBRAND · LAUNCHED 14 AUG 2026" + durum rozeti (+ mock ise MOCK DATA). Başlık: "Brand — Campaign". Altında: "Evidence collected [tarih] · Independent analysis of public signals. Not affiliated with [Brand]." Butonlar: **Download JSON**, **Print** (P2; yoksa gizle), **Copy link**.

**Sekmeler:** Case · Evidence [n] · Diagnosis · Relaunch. **Sekme durumu URL'de tutulur** (`?tab=evidence#ev_014`), böylece link paylaşılabilir ve kanıt ID'si doğru karta gider.

**Sekme 1: Case**
- Özet, markanın iddiası, eski görsel(ler) (tıklayınca büyür), anahtar sorular, karşılaştırma hedefleri.

**Sekme 2: Evidence**
- Üstte: kaynak dağılımı (küçük bar chart) ve sentiment dağılımı.
- Kanıt kartları: monospace `id` (ör. `ev_014`), kaynak ikonu + adı, tarih, metin (500 karakterde kesilir, "Show more"), metrikler, `#etiketler`, **↗ Open source** linki, küçük "Report this evidence" linki (`/legal/data-request`).
- **Kullanıcı adı, profil fotoğrafı ve profil linki asla görünmez;** link gönderiye/habere gider.
- Filtreler: kaynak, sentiment, etiket + arama kutusu. Sonuç yoksa boş durum.
- Altta küçük "How we handle public data →" linki (`/legal/data-sources`).

**Sekme 3: Diagnosis** (sıra PDF'teki gibi)
1. **EXHIBIT A — MAIN CAUSE** kutusu (büyük, serif): ana sebep cümlesi, açıklama, bağlı kanıt ID'leri. Sağ üstte generic check rozeti ("GENERIC TEST · PASSED").
2. **Tested hypotheses** başlığı + özet sayaç ("● 2 confirmed ● 1 uncertain ● 3 rejected").
3. 6 hipotez kartı (3×2 grid, önce confirmed, sonra uncertain, sonra rejected): "H5 · CREATIVE EXECUTION" etiketi, durum rozeti, güven çubuğu + sayı, gerekçe, kanıt ID'leri. **Kanıt ID'sine tıklayınca Evidence sekmesine geçer, karta kaydırır ve kartı 2 sn vurgular.**
4. Yan yana: **EXHIBIT B — SURPRISING FINDING** (dikkat çekici, amber kenarlı) ve **Other contributing causes** (01/02/03 numaralı liste).
5. "Go to prescription and relaunch →" linki.

**Sekme 4: Relaunch**
- Reçete maddeleri (değişiklik + neden + kanıt ID'leri).
- Yaratıcı brif kartı (concept, message, audience, tone, scenes, visual direction, CTA).
- Üretilen görsel(ler) ve video oynatıcı. Görselin altında: "Concept based on diagnosis — not an official [Brand] design."
- **Before / After** tablosu: dimension | before | after.
- Eski ve yeni görsel yan yana (zaman kalırsa kaydırıcılı karşılaştırma).
- Rapor altında kısa feragatname + `/legal/disclaimer` linki.

### 7.6 Tasarım (PDF referansı)

His: **"dijital adli soruşturma dosyası"**: ciddi, editoryal, güven veren. Projektörde okunaklı; öncelik masaüstü, mobil yeterli düzeyde.

| Token | Değer |
|---|---|
| Arka plan | `#000000` |
| Kart / yüzey | `#0e0e0e`, 1px ince gri kenarlık (`#222` civarı), yumuşak köşe |
| Metin | Beyaz başlık, gri (`#9a9a9a` civarı) gövde |
| Vurgu | Tek renk: amber (`#f5a623` civarı): numaralar (01/02/03), bölüm etiketleri, birincil buton, Exhibit kutuları |
| Durum renkleri | Confirmed yeşil · Uncertain gri · Rejected kırmızı. Rejected kartlar soluk (opacity), başlığı üstü çizili |
| Başlık fontu | Serif (Instrument Serif veya Newsreader): hero, bölüm başlıkları, Main cause |
| Gövde fontu | Inter |
| Etiket fontu | Monospace (JetBrains Mono), BÜYÜK HARF, geniş harf aralığı: bölüm etiketleri ("THE PROBLEM"), kanıt ID'leri, rozetler |
| Güven skoru | İnce yatay çubuk + sağda sayı |

- Bölüm yapısı: küçük amber mono etiket → büyük serif başlık → içerik. Bol boşluk.
- Animasyonlar minimal (sekme geçişi, kart hover, kanıt vurgusu).
- Marka logoları kullanılmaz; marka adları düz metin.

### 7.7 Durum ekranları

- `error.tsx` (P0): "Something went wrong" + ana sayfaya dön.
- `not-found.tsx` (P1): bilinmeyen vaka slug'ı dahil.
- Boş durum bileşeni (P1): vaka listesi ve kanıt filtreleri için.

### 7.8 Mock veri (Faz 1)

- `data/cases/demo-mock/` **kurgusal bir marka** hakkındadır, ör. "Northwind Coffee — logo refresh" (`campaign_type: "rebrand"`). Gerçek marka adı kullanılmaz; böylece kanıtsız bir teşhis yanlışlıkla gerçek vakaya sızmaz.
- Boyut: ~40 kanıt (en az 4 kaynak türü, karışık sentiment), 6 hipotez (2 confirmed, 1 uncertain, 3 rejected), 3–5 reçete maddesi, 4–6 before/after satırı, 1 görsel + 1 video yer tutucusu.
- URL'ler açıkça sahte (`https://example.com/...`), her ekranda MOCK DATA rozeti.
- Landing'deki önizlemeler Faz 5'e kadar bu vakayı gösterir; Faz 5'te gerçek Instagram vakasına bağlanır.

---

## 8. Klasör yapısı

```
campaign-forensics/
├── CAMPAIGN_FORENSICS.md        # bu dosya
├── README.md                    # nasıl çalıştırılır, motor komutları
├── app/
│   ├── page.tsx                 # landing
│   ├── error.tsx · not-found.tsx · loading.tsx
│   ├── new/page.tsx             # form + "Investigation queued"
│   ├── cases/page.tsx
│   ├── cases/[slug]/page.tsx    # rapor (?tab=…#ev_…)
│   ├── how-it-works/ · pricing/ · faq/ · about/ · contact/   # P1/P2
│   └── legal/[page]/page.tsx    # tek LegalPage şablonu
├── components/
│   ├── report/                  # CaseTab, EvidenceTab, DiagnosisTab, RelaunchTab
│   ├── EvidenceCard.tsx
│   ├── HypothesisCard.tsx
│   ├── Header.tsx · Footer.tsx · LegalPage.tsx · EmptyState.tsx
│   └── ...
├── lib/
│   ├── types.ts                 # bölüm 5'teki tipler
│   └── data.ts                  # JSON okuma yardımcıları
├── data/
│   └── cases/
│       ├── demo-mock/           # Faz 1 sahte veri (kurgusal marka, bkz. 7.8)
│       │   ├── case.json
│       │   ├── evidence.json
│       │   ├── diagnosis.json
│       │   └── creative.json
│       └── <slug>/              # gerçek vakalar (+ raw/)
├── content/
│   └── legal/*.md               # yasal metinler (KVKK Türkçe)
├── prompts/                     # motor adımlarında kullanılan prompt'lar (versiyonlu)
└── public/
    └── cases/<slug>/            # indirilen görsel/video dosyaları
```

---

## 9. Fazlar ve kabul kriterleri

### Faz 1: Uygulama iskeleti (sahte veriyle)
- Next.js projesi, tipler, **yalnızca P0 sayfaları** (7.1), header/footer, rapor sekmeleri, 7.6'daki tasarım tokenları.
- `data/cases/demo-mock/` altında 7.8'e uygun sahte veri.
- ✅ Kabul: `npm run dev` çalışıyor; landing → sample report akışı tıklanabiliyor; 4 sekme sahte veriyi gösteriyor; kanıt ID'sine tıklayınca Evidence sekmesine geçip ilgili kart vurgulanıyor ve URL değişiyor; New Case formu `case.json` indiriyor; header/footer'da kırık link yok.

### Faz 2: Kanıt toplama (gerçek vaka)
- Vakanın `case.json`'ı oluşturulur (bölüm 10'daki vaka kartından).
- Adım 1 çalıştırılır → `evidence.json`.
- ✅ Kabul: 30+ kanıt, en az 3 kaynak türü, her kanıtta gerçek URL, kullanıcı adı yok.

### Faz 3: Teşhis
- Adım 2 çalıştırılır → `diagnosis.json`.
- ✅ Kabul: 6 hipotez, her birinde kanıt ID'leri; jenerik teşhis testi geçti; bir "surprising finding" var.

### Faz 4: Üretim
- Adım 3 çalıştırılır → `creative.json` + dosyalar.
- ✅ Kabul: En az 1 görsel konsepti + 1 kısa video; rapordaki Relaunch sekmesinde görünüyor.

### Faz 5: Bağlama ve cilalama
- Rapor sayfası gerçek vakayı gösterir; landing'deki "See a sample report" ve önizlemeler gerçek vakaya bağlanır; demo-mock listeden gizlenir.
- P1 sayfaları (öncelik sırası: how-it-works, disclaimer, data-sources, pricing, faq, 404), zaman kalırsa P2 (yasal şablon, about/contact, print).
- Uygulama yayına alınır, paylaşılabilir link üretilir.
- ✅ Kabul: Yayın linki çalışıyor; 2 dakikalık demo akışı (landing → rapor → 4 sekme) takılmadan geçiyor.

> **Zaman kutusu (hackathon günü):** Faz 1 → 10:30 · Faz 2 → 11:00 · Faz 3 → 12:00 · Faz 4 → 13:30 · Faz 5 → 14:00. 14:00'ten sonra yeni özellik eklenmez.

---

## 10. Vakalar

> Aşağıdaki bilgiler **başlangıç ipuçlarıdır**, kanıt değildir. Adım 1'de her birini kaynakla doğrula; doğrulanamayanı rapora koyma.

### 10.1 Ana vaka: Instagram'ın yeni logosu (Pazartesi)
- **slug:** `instagram-wordmark-2026`
- **Tür:** rebrand
- **Ne oldu:** Instagram Ağustos 2026'da yaklaşık 10 yıllık el yazısı wordmark'ını değiştirdi. Yeni tasarım sosyal medyada eleştirildi; birçok kullanıcı logonun "Instagram" yerine "Instagzam" gibi okunduğunu söyledi.
- **Anahtar sorular:**
  1. Instagram 2016'da logosunu değiştirdiğinde de alay konusu olmuştu ve sonra benimsendi. **Bu kez fark ne?**
  2. "Instagzam" itirazı bir zevk meselesi mi, yoksa ölçülebilir bir **okunabilirlik/tasarım hatası** mı?
  3. **Kim itiraz ediyor?** Tasarım topluluğu mu, sıradan kullanıcılar mı? Reddit, X, Threads ve haberlerde tepki farklı mı?
  4. Yeni tasarımı destekleyen yorumların **organik olup olmadığı** sosyal medyada tartışıldı mı?
- **Karşılaştırma:** Instagram 2016 logo değişikliğine tepkiler; TikTok, Threads, X'in kimlik değişiklikleri.
- **Kaynak önerileri:** Adam Mosseri'nin duyuru paylaşımlarının yorumları (Instagram/Threads), TR + EN haberler, r/Instagram, r/graphic_design, X.
- **Üretim:** Düzeltilmiş wordmark konsepti (okunabilirlik sorununu çözen) + kısa yeniden lansman videosu.

### 10.2 Prova vakası: Lay's marka yenilemesi (hafta sonu)
- **slug:** `lays-rebrand`
- **Tür:** rebrand
- **Ne oldu:** Lay's, tarihinin en büyük marka yenilemesini yaptı: yeni logo, yeni paket tasarımı, "gerçek patates/doğal içerik" mesajı. Türkiye'de "Tam da Lay'slik" reklam filmiyle geldi. Tepkiler karışık.
- **Anahtar soru:** Marka, kendi araştırmasında tespit ettiği "doğal içerikle ilişkilendirilmeme" sorununu bu yenilemeyle çözebildi mi? Yorumlar mesajdan mı, fiyattan/gramajdan/tattan mı bahsediyor?
- **Karşılaştırma:** Ruffles, Pringles, Patos, Çerezza.

### 10.3 B planı: McDonald's Hollanda AI Noel reklamı
- **slug:** `mcdonalds-nl-ai-xmas`
- **Tür:** ad
- **Ne oldu:** Aralık 2025'te tamamen AI ile üretilmiş "It's the Most Terrible Time of the Year" reklamı yayınlandı, tepki üzerine 3 gün içinde kaldırıldı. Orijinal video ve yorumları kaldırıldı; kanıt kopyalardan, Reddit'ten ve haberlerden gelir.
- **Anahtar soru:** Aynı sezonda Coca-Cola'nın AI reklamı çok daha olumlu karşılandı. Fark AI kullanımı mı, yoksa ton ve konsept mi?
- **Karşılaştırma:** Coca-Cola "Holidays Are Coming" AI reklamı (2025).

---

## 11. Demo akışı (2 dakika)

1. **Landing** (10 sn): ürünün ne yaptığı tek cümle.
2. **Rapor → Case** (10 sn): "Instagram logosunu değiştirdi, insanlar 'Instagzam' diye okudu."
3. **Evidence** (25 sn): "Manus bugün Apify ile X kaynaktan Y kanıt topladı." 2–3 çarpıcı kart.
4. **Diagnosis** (30 sn): elenen hipotezler, ana sebep, şaşırtıcı bulgu.
5. **Relaunch** (30 sn): düzeltilmiş konsept + video, before/after tablosu.
6. **Kapanış** (15 sn): "Instagram vitrin örneği. Ajanslara ve marka yenileyen şirketlere satıyoruz."

Yedek: Manus görevinin replay linki ve ekran kaydı.

---

## 12. Kapsam dışı (yol haritası)

- New Case formunun motoru otomatik tetiklemesi (Manus API ile)
- Kullanıcı hesabı, ödeme, çoklu ekip
- Lansman sonrası sürekli izleme ve uyarılar
- PDF/white-label rapor dışa aktarma
