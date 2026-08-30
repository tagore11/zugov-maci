# ZuGov MVP

Bir topluluğun karar alırken kaybettiği iki şeyi kayda geçirir: önerinin arkasındaki akıl
yürütmeyi, ve kimin gerçekten ne istediğini. Oylama kuralı bunların üstüne sonradan takılır.

Tamamen yerel çalışır. Model bu bilgisayarda, veri bu bilgisayarda, hiçbir API anahtarı yok.

## Kurulum

```bash
cd apps/zugov-mvp
npm install
npm run model:install      # ollama üzerinde zugov-grounding modelini kurar
npm run dev                # http://localhost:3400
```

Model olmadan da çalışır. `zugov-grounding` kurulu değilse uygulama kural tabanlı yedeğe düşer,
arayüzde bunu açıkça söyler ve hiçbir işlev kapanmaz.

## Üç fikir

### 1. Tercih, oylama kuralından bağımsız kaydedilir

Herkes bir kez, kendi cümleleriyle ne istediğini yazar. Bu, seçenek başına dört sayıya çevrilir:

| alan | ne demek |
| --- | --- |
| `support` | -1 ile +1, yön ve şiddet |
| `confidence` | 0 ile 1, kişinin kendi kesinliği. Ağırlığı asla etkilemez |
| `salience` | 0 ile 1, bu konunun kişi için ne kadar önemli olduğu |
| `redLine` | "bununla yaşayamam" |

Oylama sistemlerinin çoğu bu dördünü tek sayıya ezer. Onay oylaması sadece `support`'un işaretini
tutar, ağırlıklı oylama `salience`'ı, sıralama sadece sırayı. Dördünü ayrı tutmak, kuralı sonradan
değiştirmeyi mümkün kılar. Kural değişince kimsenin yeniden oy vermesi gerekmez.

`lib/core/mechanisms/` altındaki her mekanizma aynı arayüzü uygular:

```ts
project(vector, options) -> Ballot     // tercihi bu kuralın sayabileceği pusulaya çevir
explain(ballot, options) -> string[]   // kişiye kendi diliyle ne oy verdiğini söyle
tally(ballots, options)  -> Outcome    // say
```

Beş kural var: Onay, Sıralama (anlık ikinci tur), Ağırlık (quadratic), Rıza (sosyokrasi),
Paylaştırma (quadratic funding). Yeni bir kural eklemek tek dosya, ve mevcut hiçbir tercihi
geçersiz kılmaz.

### 2. Kuralın kendisi denetlenir

`analyseSensitivity()` aynı tercihleri beş kuraldan da geçirir ve kazananın değişip değişmediğine
bakar.

- Beşi de aynı sonucu veriyorsa kararı oda vermiştir, yazılım değil.
- Kuralı değiştirmek kazananı değiştiriyorsa bu sonuç meşru sayılmadan önce odanın hangi kuralla
  karar aldığını konuşması gerekir.

Arrow teoremi tarafsız bir oylama kuralı olmadığını söylüyor. Araçların çoğu bunu tek bir kural
gösterip saklıyor. Burası göstermeyi seçiyor.

### 3. Grounding Engine oy vermez

Yerel model iki iş yapar:

- **Sorgulama raporu:** öneriyi altı epistemik soru altında ayrıştırır (varsayımlar, taban oranlar,
  karşı argüman, geri dönülebilirlik, etkilenen taraflar, emsaller). Rapor tarafsızdır, seçenek
  önermez, oy taşımaz. `lib/core/decide.ts` rapora hiç bakmaz.
- **Tercih taslağı:** kişinin yazdığı metni yukarıdaki dört sayıya çevirir.

İkincisi kritik nokta. Model çıktısı **her zaman** `confirmed: false` döner, arayüzde satır satır
düzeltilebilir kontroller olarak görünür, ve `decide()` onaylanmamış bir tercihi saymayı reddeder:

```ts
for (const vector of vectors) {
  if (!vector.confirmed) throw new UnconfirmedPreferenceError(vector.subjectId);
}
```

Bu tek satır, "AI yardımcı olur ama karar vermez" iddiasının koda yazılmış hali. Test ediliyor.

## Model neden 4B

Katılımcının kendi makinesinde çalışması gerekiyorsa boyut bir tasarım kısıtıdır, taviz değil.
Qwen3 4B (Apache-2.0), Q4_K_M, diskte ~2.5 GB, 8 GB RAM'li bir dizüstünde çalışır. Modelden
istenen tek şey çıkarım ve yapılandırma; yargı, sıralama ve tavsiye hiç istenmiyor.

`temperature 0` ve sabit `seed` zorunlu. İki kişi aynı öneriyi kendi makinesinde çalıştırıp
raporun imzasını (`digest`) karşılaştırabilir.

Endpoint OpenAI uyumlu, yani llama.cpp, vLLM ve LM Studio de aynı şekilde çalışır:

```bash
ZUGOV_MODEL_URL=http://127.0.0.1:8080/v1 ZUGOV_MODEL=kendi-modelin npm run dev
```

## MACI ile ilişkisi

Bu uygulama `packages/` altındaki MACI protokolüne henüz bağlı değil, ve bu bilinçli. MACI zorlayıcı
bir mahremiyet katmanı, ama tek bir oylama kuralı dayatıyor. Buradaki soyutlama katmanı MACI'yi
beş mekanizmadan biri olarak, `Mechanism` arayüzünü uygulayan bir adaptör olarak alabilir. Sıradaki
iş bu: `lib/core/mechanisms/maci.ts`, tally'yi zincire devreden bir uygulama.

Ekibin çalışan MACI entegrasyonu `apps/zugov-frontend` ve `apps/zugov-backend` altında duruyor,
bu MVP onlara dokunmuyor.

## Test

```bash
npm test        # çekirdek mantık, 11 test
npm run typecheck
```

Testler üç davranışı koruyor: onaylanmamış tercih sayıma giremez, kırmızı çizgi hiçbir mekanizmada
kaybolmaz, ve model kapalıyken her iki yedek de tarafsız çıktı üretir.

## Veri

`.data/decisions.json`. Tek dosya, kurulacak servis yok. Postgres'e geçmek `lib/store.ts` dışında
hiçbir dosyaya dokunmaz.
