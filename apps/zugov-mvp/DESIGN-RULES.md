# Tasarım Kuralları

Bunlar tercih değil, kural. İhlal edilirse `npm test` kırılır (bkz. `tests/design.test.ts`).
Yeni bir kural gerektiğinde önce buraya yazılır, sonra teste eklenir, sonra koda uygulanır.

## 1. Yasak karakterler

- **Uzun tire (`—`) ve orta tire (`–`) hiçbir yerde kullanılmaz.** Kaynak kodda, yorumda,
  arayüz metninde, dokümanda, commit mesajında. İstisna yok. Yerine nokta, virgül, iki nokta,
  parantez ya da normal tire (`-`).
- Sayı ve tarih aralıkları normal tire ile yazılır: `2018-2026`, `40-80 bin`.

## 2. Renk

- **Zemin tektir.** 30 Ağustos 2026'da A (Beyaz) seçildi, B ve C kaldırıldı. Üç değerli
  standart standart değildir. Karanlık sistem tercihinde aynı standart karanlık zeminde
  render edilir, bu alternatif palet değil okunabilirlik gereğidir.
- **Palet akromatiktir.** Zemin, yüzey, çizgi ve metin yalnızca gri skalasından seçilir.
- **Tek kromatik renk vardır ve o kırmızıdır.** Sadece iki iş için: kırmızı çizgi beyanı ve
  hata mesajı. Başka hiçbir yerde renk kullanılmaz.
- Seçili durum renkle değil, mürekkep dolgusuyla gösterilir. Yön bilgisi zaten etiketin
  kendisindedir (`Kesinlikle olsun` / `Kesinlikle olmasın`), renge yüklenmez.
- **Yasak palet aileleri:** krem + terracotta + kil (`#faf6f0`, `#f5f1ea`, `#b4552c`,
  `#c1633b`, `#b08947` ve akrabaları), mor/lila vurgu, degrade metin, neon parlama,
  mesh degrade, cam efekti. Bunlar üretilmiş arayüzün imzasıdır.
- Saf siyah (`#000000`) ve saf beyaz (`#ffffff`) metin rengi olarak kullanılmaz. Zemin beyaz
  olabilir, mürekkep `#161616`.

## 3. Tipografi

- **Tek aile: IBM Plex.** Sans arayüz için, Serif okunacak uzun metin için, Mono sayı ve
  imza için. Üç ses, bir aile. Kurumsal tipografi böyle kurulur.
- **Yasak fontlar:** Space Grotesk, Outfit, Satoshi, Cabinet Grotesk, Fraunces,
  Instrument Serif, Sora, Manrope, Poppins, Clash Display. Hepsi aynı kuşağın imzası.
- Latin-ext yüklenir, Türkçe diakritikleri eksiksiz olmak zorundadır.
- Başlık `<br>` ile kırılmaz. Sığmıyorsa yazı küçülür ya da cümle kısalır.

## 4. Düzen

- **Kart yerine çizgi.** Gruplama önce boşlukla, sonra saç teli çizgiyle yapılır. Kart
  yalnızca gerçekten yükseklik ifade ediyorsa kullanılır. Gölge yok.
- Köşe yarıçapı 2px. Tek değer, her yerde.
- **Üç eşit sütun yasak.** Aynı ağırlıkta üç kutu yan yana dizmek üretilmiş arayüzün en
  bilinen kalıbı. Liste satırı ya da farklı ağırlıklar kullanılır.
- **Sayfa başına en fazla bir küçük büyük harfli etiket.** `KARAR VERİLMEDEN ÖNCE`,
  `KAYDA GEÇTİ`, `01 / BÖLÜM` türü üst etiketler her başlığın üstüne konmaz.
- **Orta nokta (`·`) satır başına bir kez.** Varsayılan ayraç değildir.
- Ölçü 65 karakteri geçmez.

## 5. Metin

- Başlık altına açıklayıcı mikro cümle konmaz.
- Kaydırma ipucu (`aşağı kaydır`), sürüm rozeti (`v0.1`, `BETA`), sahte kesinlik taşıyan
  sayılar, şehir ve saat şeritleri yasak.
- Uydurma isim, uydurma marka, `Acme` türü yer tutucu kullanılmaz.
- Türkçe metin `/turkce-humanizer` süzgecinden geçirilir. Üç kalıp arayüzde hiç
  bulunmaz ve testle engellenir:
  - Karşıtlık bağlacından önce virgül. `Sonuç ayakta, ama tartışmalı` yanlış,
    `Sonuç ayakta ama tartışmalı` doğru. İngilizcenin `but` öncesi virgül kuralının
    zorla çevirisi, TDK'ya göre de yanlış.
  - Noktalı virgül. Cümle ikiye bölünür.
  - `X değil, Y` kalıbı. İngilizcenin `not X but Y` hamlesi. Gerçek mantıksal bağ
    kurulur ya da yalnızca Y bırakılır.

## 6. Hareket

- Yalnızca durum değişimini okunur kılan geçişler. Sonsuz döngü, paralaks, kaydırma ele
  geçirme, imleç efekti yok.
- `prefers-reduced-motion` her zaman onurlandırılır.

## 7. Erişilebilirlik

- Metin ve zemin arasında en az WCAG AA (4.5:1).
- Bilgi yalnızca renkle taşınmaz. Renk her zaman bir etiketin yanında durur.
- Odak halkası her etkileşimli öğede görünür.
- Dokunma hedefi en az 44px yüksekliğinde.
