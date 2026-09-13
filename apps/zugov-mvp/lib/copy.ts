/**
 * Every string this app shows a reader, in one place.
 *
 * Not a translation layer (nothing here is looked up by key at runtime; a component still
 * imports the exact field it needs), just a single address for "what does this app say."
 * Model prompts live separately in lib/llm/lang/en-prompts.ts: a person reads this file, a
 * model reads that one, and a screen that needs new copy should never involve editing both.
 *
 * English-specific generated sentences (the Grounding Engine's no-model fallback text) stay
 * out of here too, in lib/llm/lang/en.ts's groundingCopy, next to the rest of the
 * language-specific logic that has to change together with them.
 */

export const copy = {
  app: {
    title: "ZuGov",
    description: "A decision tool for community choices, running on this device.",
  },

  wallet: {
    signInWithoutWallet: "Continue without a wallet",
    signingIn: "Signing in",
    localAccountNote: "created on this device",
    signOut: "Sign out",
    walletConnect: "Connect wallet",
    walletConnecting: "Opening wallet",
    walletSign: "Sign and enter",
    walletSigning: "Confirm in your wallet",
    walletSignatureExplanation:
      "Your wallet will ask for a signature. This is not a transaction, nothing is written to a chain, and you pay no fee. The signature only proves the wallet is yours.",
    noWalletExplanation:
      "This identity is kept only in this browser and carries no funds. If you have a wallet, you can sign in with that instead.",
  },

  modelBadge: {
    checking: "checking model status",
    localSuffix: "running on this device",
    fallback: (detail: string) => `model off, rule-based fallback active (${detail})`,
    checkFailed: "could not check",
  },

  home: {
    heading: "Say what you want in your own words, leave the counting to us.",
    intro:
      "A community loses two things when it makes a decision: why something was proposed, and what people actually want. Here both get recorded. The voting rule is attached last, and it can change.",
    communitiesTitle: "Communities",
    communitiesHint: "Enter a community, see its decisions, open your own.",
    facts: {
      localTerm: "Runs on this device",
      localBody: "The decision text and your preferences never leave this computer. Identity and membership come from the governance backend.",
      noAiVoteTerm: "The AI has no vote",
      noAiVoteBody: "It drafts, it asks questions. It never enters the tally, and nothing is saved without your confirmation.",
      ruleChangesTerm: "The rule can change later",
      ruleChangesBody: "Your preference is written once. If the community changes the counting rule, you don't have to vote again.",
    },
  },

  communityList: {
    loadFailed: "Communities could not be loaded.",
    backendDown: (detail: string) => `The governance backend may be down. ${detail}`,
    empty: "No communities yet.",
    typeUnion: "union",
    typeCommunity: "community",
    subCommunitySuffix: ", sub-community",
    approvalRequiredSuffix: ", joining needs approval",
    openSuffix: ", open to join",
    loadFailedGeneric: "Could not load.",
  },

  communityRoom: {
    backToCommunities: "Communities",
    notFound: "Community not found.",
    signedOutHint: "You can view the decisions. Sign in with your wallet to join and vote.",
    memberOfCommunityPrefix: "In this community you are",
    memberTierFallback: "a member",
    canVoteSuffix: ", you can vote",
    cannotVoteSuffix: ", you cannot vote",
    canCreateProposalsSuffix: ", you can open decisions",
    pendingApproval: "Your request to join is awaiting approval.",
    notAMember: "You are not a member of this community.",
    approvalOnly: "Joining needs approval.",
    join: "Join",
    joining: "Joining",
    joinFailed: "Could not join.",
    decisionsTitle: "Decisions",
    openDecision: "Open a decision",
    noDecisions: "No decisions in this community yet.",
    tierCannotCreate: (tierLabel: string) =>
      `You are at the ${tierLabel} tier in this community, and this tier cannot open decisions. Someone with membership rights can raise your tier.`,
    participantCount: "participants",
  },

  decisionPage: {
    backToDecisions: "Decisions",
    seeResult: "See the result",
    participantCount: "participants",
  },

  groundingPanel: {
    readingText: "Reading",
    whatDoesTheTextSay: "What does the text say?",
    notInRationale: "Not mentioned in the rationale.",
    questioning: "Questioning",
    auditSixQuestions: "Question it with six prompts",
    generationFailed: "Could not generate.",
    unknownError: "Unknown error.",
  },

  decisionFlow: {
    stepLabels: ["Proposal", "Options", "Importance", "Confirm"],
    supportSteps: {
      for: "Yes",
      neutral: "No preference",
      against: "No",
    },
    signInToParticipate: "Sign in to participate",
    cannotVoteTitle: "You cannot vote in this community",
    cannotVoteHint: "Your membership tier is not open to voting.",
    start: "Start",
    writeInsteadOfMarking: "Write in your own words instead of marking one by one",
    whatDoYouThink: "What do you think?",
    writePlaceholder: "What you want, what you don't.",
    reading: "Reading",
    mark: "Mark",
    cancel: "Cancel",
    mostImportantQuestion: "Which one matters most to you?",
    proceed: "Continue",
    back: "Back",
    yourVoteSays: "Your vote says",
    alreadyVoted: "You already voted with this wallet. This replaces the earlier one.",
    saving: "Saving",
    confirm: "I confirm",
    next: "Next",
    cannotAccept: "I can't accept this.",
    readFailed: "Could not read.",
    saveFailed: "Could not save.",
    unknownError: "Unknown error.",
  },

  newDecision: {
    mechanismChoices: {
      approval: { name: "Approval", when: "When more than one option can be accepted at the same time." },
      ranked: { name: "Ranked", when: "When there will be one winner and votes might split." },
      quadratic: { name: "Weighted", when: "When the matter is vital to some and trivial to others." },
      consent: { name: "Consent", when: "When you're looking for an outcome everyone can live with." },
      allocate: { name: "Allocation", when: "When you're splitting a budget or a resource." },
    },
    back: "Back",
    heading: "Open a decision",
    titleLabel: "Decision title",
    titlePlaceholder: "Where should the shared space's budget go?",
    bodyLabel: "Rationale",
    bodyPlaceholder: "Why we're deciding, what constraints exist, what information we don't have.",
    optionsLabel: "Options",
    optionPlaceholder: (index: number) => `Option ${index}`,
    addOption: "add an option",
    ruleLabel: "Counting rule",
    ruleHint:
      "The rule you pick now isn't final. Everyone writes their preference once, and if you change the rule later, nobody has to vote again.",
    opening: "Opening",
    open: "Open the decision",
    openFailed: "The decision could not be opened.",
    unknownError: "Unknown error.",
  },

  result: {
    backToDecision: "Back to the decision",
    participantCount: "participants",
    noResultYetTitle: "No result yet",
    noResultYetHint: "Once the first preference is recorded, the result and the rule comparison will appear here.",
    byRule: (mechanismName: string) => `under the ${mechanismName} rule`,
    noWinner: "No option stands out",
    closeContest: "The top two options are very close. This result should not be treated as settled.",
    redLinesTitle: "Red lines",
    redLineCount: (count: number) => `: ${count} ${count === 1 ? "person" : "people"} said they cannot accept this.`,
    verdictTitle: {
      robust: "The room decided",
      leaning: "The result holds but is contested",
      contested: "The rule is deciding",
    },
    verdictBody: {
      robust: "All five counting rules pick the same option.",
      leaning: "Most rules land on the same result, one diverges.",
      contested: "Changing the rule changes the winner. Don't treat this as settled without discussing it.",
    },
    currentRule: "current rule",
    noWinnerShort: "no winner",
    verifyTitle: "Verify this result yourself",
    verifyBody: "The receipt has every ballot and no names. Download it, count it on your own machine, compare the signature. You don't have to trust us.",
    signatureLabel: "signature",
    openReceipt: "Open the receipt",
  },

  grounding: {
    /** Reader-facing label for each of the six audit questions. Not sent to the model. */
    auditQuestions: {
      assumptions: "What assumptions have to be true for this proposal to work?",
      baseRates: "How often have similar decisions worked out in the past? What's the point of comparison?",
      counterarguments: "What is the strongest argument against this?",
      reversibility: "If this goes badly, how easy and how costly is it to undo?",
      affectedParties: "Who is affected, directly and indirectly?",
      precedents: "What precedent or similar case should be examined?",
    },
  },
};
