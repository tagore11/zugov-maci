/**
 * Every string this app shows a reader, in one place.
 *
 * Not a translation layer (nothing here is looked up by key at runtime; a component still
 * imports the exact field it needs), just a single address for "what does this app say."
 * Model prompts live separately in lib/llm/lang/tr-prompts.ts: a person reads this file, a
 * model reads that one, and a screen that needs new copy should never involve editing both.
 *
 * Turkish-specific generated sentences (the Grounding Engine's no-model fallback text, whose
 * word order and grammar don't just find-and-replace into another language) stay out of here
 * too, in lib/llm/lang/tr.ts's groundingCopy, next to the rest of the Turkish-specific logic
 * that has to change together with them.
 */

export const copy = {
  app: {
    title: "ZuGov",
    description: "Topluluk kararları için, bu cihazda çalışan karar aracı.",
  },

  wallet: {
    signInWithoutWallet: "Cüzdansız devam et",
    signingIn: "Giriş yapılıyor",
    localAccountNote: "bu cihazda oluşturuldu",
    signOut: "Çıkış",
    walletConnect: "Cüzdan bağla",
    walletConnecting: "Cüzdan açılıyor",
    walletSign: "İmzala ve gir",
    walletSigning: "Cüzdanında onayla",
    walletSignatureExplanation:
      "Cüzdanın bir imza isteyecek. Bu bir işlem değildir, zincire hiçbir şey yazılmaz ve ücret ödemezsin. İmza yalnızca cüzdanın sana ait olduğunu kanıtlar.",
    noWalletExplanation: "Bu kimlik yalnızca bu tarayıcıda tutulur ve para taşımaz. Cüzdanın varsa onunla da girebilirsin.",
  },

  modelBadge: {
    checking: "model durumu okunuyor",
    localSuffix: "bu cihazda çalışıyor",
    fallback: (detail: string) => `model kapalı, kural tabanlı yedek devrede (${detail})`,
    checkFailed: "kontrol edilemedi",
  },

  home: {
    heading: "Ne istediğini kendi cümlelerinle söyle, sayımı bize bırak.",
    intro:
      "Bir topluluk karar alırken iki şeyi kaybeder: neyin neden önerildiğini, ve kimin gerçekten ne istediğini. Burada ikisi de kayda geçer. Oylama kuralı en son takılır, ve değiştirilebilir.",
    communitiesTitle: "Topluluklar",
    communitiesHint: "Bir topluluğa gir, kararlarını gör, kendi kararını aç.",
    facts: {
      localTerm: "Bu cihazda çalışır",
      localBody: "Karar metni ve tercihlerin bu bilgisayardan çıkmaz. Kimlik ve üyelik yönetişim arka ucundan gelir.",
      noAiVoteTerm: "Yapay zekanın oyu yok",
      noAiVoteBody: "Taslak çıkarır, soru sorar. Sayıma girmez, senin onayın olmadan hiçbir şey kaydedilmez.",
      ruleChangesTerm: "Kural sonradan değişir",
      ruleChangesBody: "Tercihin bir kez yazılır. Topluluk sayım kuralını değiştirirse yeniden oy vermezsin.",
    },
  },

  communityList: {
    loadFailed: "Topluluklar yüklenemedi.",
    backendDown: (detail: string) => `Yönetişim arka ucu çalışmıyor olabilir. ${detail}`,
    empty: "Henüz topluluk yok.",
    typeUnion: "birlik",
    typeCommunity: "topluluk",
    subCommunitySuffix: ", alt topluluk",
    approvalRequiredSuffix: ", katılım onaya bağlı",
    openSuffix: ", katılıma açık",
    loadFailedGeneric: "Yüklenemedi.",
  },

  communityRoom: {
    backToCommunities: "Topluluklar",
    notFound: "Topluluk bulunamadı.",
    signedOutHint: "Kararları görebilirsin. Katılmak ve oy vermek için cüzdanınla giriş yap.",
    memberOfCommunityPrefix: "Bu toplulukta",
    memberTierFallback: "üyesin",
    canVoteSuffix: ", oy verebilirsin",
    cannotVoteSuffix: ", oy veremezsin",
    canCreateProposalsSuffix: ", karar açabilirsin",
    pendingApproval: "Katılım talebin onay bekliyor.",
    notAMember: "Bu topluluğun üyesi değilsin.",
    approvalOnly: "Katılım onaya bağlı.",
    join: "Katıl",
    joining: "Katılıyor",
    joinFailed: "Katılınamadı.",
    decisionsTitle: "Kararlar",
    openDecision: "Karar aç",
    noDecisions: "Bu toplulukta henüz karar yok.",
    tierCannotCreate: (tierLabel: string) =>
      `Bu toplulukta ${tierLabel} kademesindesin ve bu kademe karar açamıyor. Üyelik yönetme yetkisi olan biri kademeni yükseltebilir.`,
    participantCount: "katılımcı",
  },

  decisionPage: {
    backToDecisions: "Kararlar",
    seeResult: "Sonuca bak",
    participantCount: "katılımcı",
  },

  groundingPanel: {
    readingText: "Okunuyor",
    whatDoesTheTextSay: "Metin ne diyor?",
    notInRationale: "Gerekçede geçmiyor.",
    questioning: "Sorgulanıyor",
    auditSixQuestions: "Altı soruyla sorgula",
    generationFailed: "Üretilemedi.",
    unknownError: "Bilinmeyen hata.",
  },

  decisionFlow: {
    stepLabels: ["Öneri", "Seçenekler", "Önem", "Onay"],
    supportSteps: {
      for: "Olsun",
      neutral: "Fark etmez",
      against: "Olmasın",
    },
    signInToParticipate: "Katılmak için giriş yap",
    cannotVoteTitle: "Bu toplulukta oy veremezsin",
    cannotVoteHint: "Üyelik kademen oy vermeye açık değil.",
    start: "Başla",
    writeInsteadOfMarking: "Tek tek işaretlemek yerine kendi cümlelerinle yaz",
    whatDoYouThink: "Ne düşünüyorsun?",
    writePlaceholder: "Neyi istiyorsun, neyi istemiyorsun.",
    reading: "Okunuyor",
    mark: "İşaretle",
    cancel: "Vazgeç",
    mostImportantQuestion: "Hangisi senin için en önemli?",
    proceed: "Devam",
    back: "Geri",
    yourVoteSays: "Oyun şunu söylüyor",
    alreadyVoted: "Bu cüzdanla daha önce oy verdin. Bu, öncekinin yerine geçer.",
    saving: "Kaydediliyor",
    confirm: "Onaylıyorum",
    next: "Sonraki",
    cannotAccept: "Bunu kabul edemem.",
    readFailed: "Okunamadı.",
    saveFailed: "Kaydedilemedi.",
    unknownError: "Bilinmeyen hata.",
  },

  newDecision: {
    mechanismChoices: {
      approval: { name: "Onay", when: "Birden fazla seçenek aynı anda kabul edilebiliyorsa." },
      ranked: { name: "Sıralama", when: "Tek bir kazanan çıkacaksa ve oylar bölünecekse." },
      quadratic: { name: "Ağırlık", when: "Bazıları için hayati, bazıları için önemsiz bir konuysa." },
      consent: { name: "Rıza", when: "Herkesin birlikte yaşayabileceği bir sonuç arıyorsan." },
      allocate: { name: "Paylaştırma", when: "Bir bütçe ya da kaynağı bölüşeceksen." },
    },
    back: "Geri",
    heading: "Karar aç",
    titleLabel: "Karar başlığı",
    titlePlaceholder: "Ortak alanın bütçesi nereye gitsin?",
    bodyLabel: "Gerekçe metni",
    bodyPlaceholder: "Neden karar veriyoruz, hangi kısıtlar var, hangi bilgi elimizde yok.",
    optionsLabel: "Seçenekler",
    optionPlaceholder: (index: number) => `Seçenek ${index}`,
    addOption: "seçenek ekle",
    ruleLabel: "Sayım kuralı",
    ruleHint:
      "Şimdi seçtiğin kural kesin değil. Herkes tercihini bir kez yazar, kuralı sonra değiştirirsen kimsenin yeniden oy vermesi gerekmez.",
    opening: "Açılıyor",
    open: "Kararı aç",
    openFailed: "Karar açılamadı.",
    unknownError: "Bilinmeyen hata.",
  },

  result: {
    backToDecision: "Karara dön",
    participantCount: "katılımcı",
    noResultYetTitle: "Henüz sonuç yok",
    noResultYetHint: "İlk tercih kaydedildiğinde sonuç ve kural karşılaştırması burada belirir.",
    byRule: (mechanismName: string) => `${mechanismName} kuralına göre`,
    noWinner: "Öne çıkan seçenek yok",
    closeContest: "İlk iki seçenek çok yakın. Bu sonuç kesinleşmiş sayılmaz.",
    redLinesTitle: "Kırmızı çizgiler",
    redLineCount: (count: number) => ` için ${count} kişi kabul edemeyeceğini söyledi.`,
    verdictTitle: {
      robust: "Kararı oda verdi",
      leaning: "Sonuç ayakta ama tartışmalı",
      contested: "Kararı kural veriyor",
    },
    verdictBody: {
      robust: "Beş sayım kuralı da aynı seçeneği seçiyor.",
      leaning: "Kuralların çoğu aynı sonuca çıkıyor, biri ayrışıyor.",
      contested: "Kuralı değiştirmek kazananı değiştiriyor. Bunu konuşmadan sonucu kesinleştirme.",
    },
    currentRule: "şu anki kural",
    noWinnerShort: "kazanan çıkmadı",
    verifyTitle: "Bu sonucu kendin doğrula",
    verifyBody: "Makbuzda pusulaların hepsi var, isimler yok. İndir, kendi makinende say, imzayı karşılaştır. Bize güvenmen gerekmiyor.",
    signatureLabel: "imza",
    openReceipt: "Makbuzu aç",
  },

  grounding: {
    /** Reader-facing label for each of the six audit questions. Not sent to the model. */
    auditQuestions: {
      assumptions: "Bu önerinin işe yaraması için hangi varsayımların doğru çıkması gerekiyor?",
      baseRates: "Benzer kararlar geçmişte hangi sıklıkla tuttu? Karşılaştırma noktası ne?",
      counterarguments: "Buna karşı çıkan en güçlü argüman ne?",
      reversibility: "Kötü giderse geri dönmek ne kadar kolay, maliyeti ne?",
      affectedParties: "Karardan doğrudan ve dolaylı olarak kimler etkileniyor?",
      precedents: "Hangi emsal ya da benzer vaka incelenmeli?",
    },
  },
};
