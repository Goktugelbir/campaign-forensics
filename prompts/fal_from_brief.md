# fal_from_brief — Adım 3 üretim şablonu (fal.ai)

> **Manus'a not:** `higgsfield_from_brief.md` artık kullanılmıyor; bu dosya onun yerine geçer. Genel kurallar `CAMPAIGN_FORENSICS.md` → 4.2 ve Adım 3'te. Bu dosya yalnızca `diagnosis.json` → `creative_brief` alanlarından prompt kurmayı tarif eder. Faz 4'e kadar gerekmez.

## Girdi

`data/cases/<slug>/diagnosis.json` → `creative_brief` (`concept`, `message`, `audience`, `tone`, `scenes[]`, `visual_direction`, `cta`) ve `diagnosis.main_cause`.

## Sıra (kredi tasarrufu)

1. **1 görsel** üret → göster → onay al.
2. Onaylanırsa en fazla **2 varyant** daha.
3. Onaylı görseli ilk kare yaparak **image-to-video**: sahne başına 5–10 sn'lik klip, toplam 10–20 sn. En fazla 2 deneme.
4. Her çağrıdan önce: model ID + tahmini maliyet, tek cümle.
5. Dönen URL'leri **hemen** `public/cases/<slug>/` altına indir; `creative.json`'a yerel yol, `prompt_used`, `tool: "fal"`, `model` yaz.

Model ID'lerini çalıştırmadan önce fal.ai model sayfasından doğrula.

## Görsel prompt şablonu — rebrand (wordmark/kimlik konsepti)

Yazı doğruluğu güçlü bir model kullan (ör. Ideogram veya Recraft).

```
Clean brand identity concept sheet for a wordmark reading exactly "<BRAND>".
Problem to fix: <diagnosis.main_cause, tek cümle>.
Design direction: <visual_direction>. Tone: <tone>.
Show the wordmark large on a plain background, plus the same wordmark at small
app-icon / feed size to prove legibility. Flat vector style, high contrast,
no mockup clutter, no extra text besides the wordmark.
```

Kurallar:
- Wordmark'ın harfleri birebir doğru olmalı; yanlış yazılmış çıktı atılır, yeniden üretilir (ama toplam deneme sınırına sayılır).
- Gerçek markanın resmi logosunun kopyası değil, **teşhisteki sorunu çözen bir konsept** üretilir. Raporda altına "Concept based on diagnosis — not an official [Brand] design" yazılır.

## Görsel prompt şablonu — ad / launch

FLUX ailesi uygundur.

```
Campaign key visual. Concept: <concept>. Message: <message>.
Audience: <audience>. Tone: <tone>. Visual direction: <visual_direction>.
Photographic, natural light, simple composition, one clear focal point,
negative space for a headline. No text, no logos, no watermarks.
```

Başlık ve CTA görsele modelle yazdırılmaz; web arayüzünde üstüne bindirilir.

## Video prompt şablonu (image-to-video)

Her `scenes[i]` için ayrı klip:

```
<scenes[i]>. Slow, steady camera movement. <tone> mood.
Keep the subject and composition consistent with the input image.
No on-screen text, no fast cuts, no distortion.
```

- Wordmark videoda **üretilmez**; gerekiyorsa onaylı logo görseli son sahnede statik olarak kullanılır.
- Kaçın: bozuk eller/yüzler, anlamsız yazılar, aşırı efekt, gerçek kişilere benzeyen yüzler.
- Klipler birleştirilecekse `ffmpeg` ile art arda eklenir, toplam 10–20 sn.

## Çıktı örneği (`creative.json`)

```json
{
  "case_slug": "instagram-wordmark-2026",
  "assets": [
    {
      "kind": "image",
      "label": "Revised wordmark concept",
      "path": "/cases/instagram-wordmark-2026/wordmark-v1.png",
      "prompt_used": "...",
      "tool": "fal",
      "model": "<doğrulanmış model ID>"
    },
    {
      "kind": "video",
      "label": "Relaunch video",
      "path": "/cases/instagram-wordmark-2026/relaunch.mp4",
      "prompt_used": "...",
      "tool": "fal",
      "model": "<doğrulanmış model ID>"
    }
  ]
}
```
