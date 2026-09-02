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

## Arayüz: ekranda tek soru

Katılım akışı dört adım, her adım tek bir şey soruyor.

1. **Öneri.** Gerekçe metni serifle, rahat okunacak ölçüde. Sorgulama raporu burada ama kapalı
   duruyor, isteyen açar. Makine yazısı bir duvarı önerinin üstüne koymak, kimse konuşmadan
   odadaki en yüksek sesi vermek olurdu.
2. **Sen.** İsim ve kendi cümlelerin. Yazmak istemeyen doğrudan işaretlemeye geçebilir.
3. **Seçenekler.** Her seçenek ayrı ekranda: ne diyorsun, ne kadar önemli, kırmızı çizgin mi.
   Kendi yazdığın cümle o seçeneğin üstünde alıntılanır, taslağın nereden geldiğini görürsün.
4. **Onay.** Tercihinin seçili sayım kuralında ne anlama geldiği düz Türkçeyle yazılır
   (`mechanism.explain()`). Onaylamadan hiçbir şey kaydedilmez.

**Sonuç ayrı sayfada, ve akışın içinde değil.** Önceki sürüm öneriyi, raporu, formu ve o anki
sonucu tek sayfada gösteriyordu. Kişi kendi görüşünü oluşturmadan mevcut sonucu görüyordu, ki bu
var olmayan bir mutabakatı imal etmenin en ucuz yolu.

Arayüzde tek bir teori kelimesi yok. Kimse "quadratic" görmüyor, "100 kredin var, önemsediğine
dağıt" görüyor. Sans arayüz için, serif okunacak metin için; kural bu kadar basit.

Renk üç iş yapıyor: yön (yeşil destek, kırmızı itiraz), derece (accent, yönü yok), ve kırmızı
çizgi. Kayıtsızlık uyarı değildir, o yüzden renksizdir.

## Model neden 3B

Katılımcının kendi makinesinde çalışması gerekiyorsa boyut bir tasarım kısıtıdır, taviz değil.
Qwen2.5 3B Instruct (Apache-2.0), Q4_K_M, diskte ~1,9 GB, 8 GB RAM'li bir dizüstünde çalışır.
Modelden istenen tek şey çıkarım ve sınıflandırma; yargı, sıralama ve tavsiye hiç istenmiyor.

`temperature 0` ve sabit `seed` zorunlu. İki kişi aynı öneriyi kendi makinesinde çalıştırıp
raporun imzasını (`digest`) karşılaştırabilir.

Endpoint OpenAI uyumlu, yani llama.cpp, vLLM ve LM Studio de aynı şekilde çalışır:

```bash
ZUGOV_MODEL_URL=http://127.0.0.1:8080/v1 ZUGOV_MODEL=kendi-modelin npm run dev
```

**Düşünen model kullanılmadı.** Qwen3 4B ilk tercihti ve çalışmadı: gizli düşünme geçişi token
bütçesinin tamamını yiyor, içerik boş dönüyor, ve OpenAI uyumlu uçta bunu kapatmanın taşınabilir
bir yolu yok (`think`, `enable_thinking` ve `/no_think` üçü de yok sayılıyor, Ollama 0.32).
Düşünmeyen bir instruct modeli tek kod yolunu her sunucuda çalışır tutuyor.

## Küçük modelin neyi beceremediği, ve bunun nasıl kapatıldığı

Bunlar tahmin değil, bu makinede ölçüldü. Üçü de prompt'a güvenmek yerine koda yazıldı.

**Sayı uyduruyor.** 40 bin liralık bir bütçe metnine "Açık atölye ve mutfak birlikte 80 bin lira
maliyetli" gözlemi ekledi. Denetçinin bir sayının eksik olduğunu söylemeye hakkı var, o sayıyı
üretmeye hakkı yok: gözlemdeki her rakam kaynak metinde aranır, yoksa gözlem düşer.

**Örneği kopyalıyor.** Prompt'taki örnek cevabı olduğu gibi geri veriyor. Bu yüzden örnek alakasız
bir konudan (otobüs güzergâhı) seçildi ve kopyalanan satırlar çıktıdan eleniyor.

**Kelime öbeğiyle cevap veriyor.** "finansal", "talepler" gibi. Dört kelimeden kısa gözlemler
düşer; parça bir gözlem değildir, basmak raporda olmayan bir titizliği taklit eder.

**İşareti ters çeviriyor.** İlk tasarımda modelden -1 ile +1 arası sayı istendi ve "bunu kesinlikle
istiyorum" cümlesini güçlü muhalefete çevirdi. Sayı istemek bırakıldı: model sabit bir kelime
listesinden etiket seçiyor, sayıya çevirme kodda. Etiketler birbirinden uzak kelimeler olmak
zorunda; `kesinlikle_istiyor` ile `kesinlikle_istemiyor` iki harf farkla ayrıldığı için model
sürekli ilkini seçiyordu, `savunuyor` ile `reddediyor` bu sorunu bitirdi.

**Türkçe nüansı yarı yarıya kaçırıyor.** Etiketler ayrıldıktan sonra bile üç kişilik bir testte
dokuz okumanın beşi doğruydu. Bu 3B'nin tavanı, ve tasarım bunu varsayıyor: taslak asla sayılmaz,
her satır düzenlenebilir, ve kişinin metni bir seçenekten bahsettiği halde taslak nötr kaldıysa
o satır arayüzde işaretlenir. Testte modelin kaçırdığı beş okumanın beşi de işaretlendi.

Daha iyi Türkçe için `qwen2.5:7b-instruct` (~4,7 GB) tabanına geçilebilir. Yukarıdaki korumaların
hepsi yerinde kalır; hiçbiri modelin iyi davranmasına bel bağlamıyor.

## MACI ile ilişkisi

Bu uygulama `packages/` altındaki MACI protokolüne henüz bağlı değil, ve bu bilinçli. MACI zorlayıcı
bir mahremiyet katmanı, ama tek bir oylama kuralı dayatıyor. Buradaki soyutlama katmanı MACI'yi
beş mekanizmadan biri olarak, `Mechanism` arayüzünü uygulayan bir adaptör olarak alabilir. Sıradaki
iş bu: `lib/core/mechanisms/maci.ts`, tally'yi zincire devreden bir uygulama.

Ekibin çalışan MACI entegrasyonu `apps/zugov-frontend` ve `apps/zugov-backend` altında duruyor,
bu MVP onlara dokunmuyor.

## Test

```bash
npm test        # çekirdek mantık, 14 test
npm run typecheck
```

Testler yerel modele bağlı değil. `vitest.config.ts` endpoint'i ulaşılamaz bir porta çeviriyor,
model yolu ise sahte bir `fetch` ile sınanıyor. Korunan davranışlar: onaylanmamış tercih sayıma
giremez, kırmızı çizgi hiçbir mekanizmada kaybolmaz, etiket işareti ters çevrilmez, rapor kaynakta
olmayan rakam basmaz, ve model kapalıyken her iki yedek de çalışmaya devam eder.

## Veri

Postgres, `mvp_decisions` tablosu (`lib/store.ts`). Kimlik ve üyeliğin zaten oturduğu aynı
`zugov_dev` veritabanı, `DATABASE_URL` verilmezse bu makinede o veritabanını varsayılan alır.
Şema tek dosyada bootstrap edilir (`lib/db.ts`), ayrı bir migrasyon aracı yok. Eski JSON
dosyadan geçiş `npm run migrate:decisions` ile yapıldı, bir kerelik betik
(`scripts/migrate-decisions-to-postgres.ts`).
