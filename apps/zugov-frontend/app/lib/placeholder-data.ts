import { BookOpen, FileText, Video, FileCode } from "lucide-react";

export const IDENTITY_PROVIDERS = [
  "Zupass",
  "Ethereum Attestation Service",
  "Gitcoin Passport",
  "Token & NFT Gating",
  "MetaMask",
  "WalletConnect",
  "Coinbase Wallet",
  "Safe",
  "World ID",
];

export const VOTING_MECHANISMS = [
  { id: "simple", name: "Simple Majority" },
  { id: "quadratic", name: "Quadratic Voting" },
  { id: "ranked", name: "Ranked Choice" },
];

export const EXISTING_COMMUNITIES = ["ZuKas Residency", "ZuAfrique", "Zuitzerland", "EDGE City"];

export const AUTH_METHODS = [
  { id: "zupass", name: "Zupass", icon: "🎫" },
  { id: "eas", name: "Ethereum Attestation Service", icon: "✓" },
  { id: "gitcoin", name: "Gitcoin Passport", icon: "🌱" },
  { id: "token", name: "Token & NFT Gating", icon: "🎨" },
  { id: "metamask", name: "MetaMask", icon: "🦊" },
  { id: "walletconnect", name: "WalletConnect", icon: "🔗" },
  { id: "coinbase", name: "Coinbase Wallet", icon: "💠" },
  { id: "safe", name: "Safe", icon: "🔐" },
  { id: "worldid", name: "World ID", icon: "🌍" },
];

export const IDENTITY_BADGES = [
  { id: "zupass", name: "Zupass", icon: "🎫", verified: true },
  { id: "eas", name: "EAS", icon: "✓", verified: true },
  { id: "gitcoin", name: "Gitcoin Passport", icon: "🌱", verified: false },
  { id: "token", name: "Token Holder", icon: "🎨", verified: true },
  { id: "metamask", name: "MetaMask", icon: "🦊", verified: true },
  { id: "worldid", name: "World ID", icon: "🌍", verified: false },
];

export const USER_COMMUNITIES = [
  {
    id: "1",
    name: "ZuKas Residency",
    role: "Member",
    reputation: 875,
    maxReputation: 1000,
    logo: "🏛️",
  },
  {
    id: "2",
    name: "ZuAfrique",
    role: "Delegate",
    reputation: 620,
    maxReputation: 1000,
    logo: "🌍",
  },
  {
    id: "3",
    name: "Zuitzerland",
    role: "Active Voter",
    reputation: 450,
    maxReputation: 1000,
    logo: "🏔️",
  },
];

export const EXAMPLE_COMMUNITIES = [
  {
    id: "1",
    name: "The Network School - Singapore",
    description: "A Startup Society",
    members: 450,
    proposals: 23,
    logo: "🏛️",
    category: "Residency",
  },
  // {
  //   id: "1",
  //   name: "ZuKas Residency",
  //   description: "Zuzalu community in Kas, Turkey - innovation and collaboration hub",
  //   members: 450,
  //   proposals: 23,
  //   logo: "🏛️",
  //   category: "Residency",
  // },
  // {
  //   id: "2",
  //   name: "ZuAfrique",
  //   description: "Zuzalu African community building decentralized future",
  //   members: 320,
  //   proposals: 18,
  //   logo: "🌍",
  //   category: "Regional",
  // },
  // {
  //   id: "3",
  //   name: "Zuitzerland",
  //   description: "Zuzalu Switzerland - Alpine innovation and governance experiments",
  //   members: 280,
  //   proposals: 15,
  //   logo: "🏔️",
  //   category: "Regional",
  // },
  // {
  //   id: "4",
  //   name: "EDGE City",
  //   description: "Network state experiment for building future cities",
  //   members: 890,
  //   proposals: 42,
  //   logo: "🌆",
  //   category: "Network State",
  // },
];

export const COMMUNITY_DATA = {
  "1": {
    name: "ZuKas Residency",
    description:
      "ZuKas is a Zuzalu community residency in Kas, Turkey, bringing together innovators, builders, and researchers for collaborative experiments in governance and technology.",
    summary: "Innovation and collaboration hub focused on decentralized governance experiments and community building.",
    members: 450,
    logo: "🏛️",
    category: "Residency",
    affiliatedCommunities: [
      { id: "2", name: "ZuAfrique", logo: "🌍" },
      { id: "3", name: "Zuitzerland", logo: "🏔️" },
    ],
  },
  "2": {
    name: "ZuAfrique",
    description:
      "ZuAfrique is the African chapter of the Zuzalu movement, building decentralized future through local innovation and global collaboration.",
    summary: "African community building the decentralized future through governance experiments and local innovation.",
    members: 320,
    logo: "🌍",
    category: "Regional",
    affiliatedCommunities: [
      { id: "1", name: "ZuKas Residency", logo: "🏛️" },
      { id: "4", name: "EDGE City", logo: "🌆" },
    ],
  },
  "3": {
    name: "Zuitzerland",
    description:
      "Zuitzerland brings the Zuzalu ethos to the Swiss Alps, combining alpine innovation with cutting-edge governance experiments.",
    summary: "Alpine innovation and governance experiments combining Swiss precision with decentralized coordination.",
    members: 280,
    logo: "🏔️",
    category: "Regional",
    affiliatedCommunities: [{ id: "1", name: "ZuKas Residency", logo: "🏛️" }],
  },
  "4": {
    name: "EDGE City",
    description:
      "EDGE City is a network state experiment focused on building the infrastructure and governance systems for future cities.",
    summary:
      "Network state experiment for building future cities with innovative governance and coordination mechanisms.",
    members: 890,
    logo: "🌆",
    category: "Network State",
    affiliatedCommunities: [{ id: "2", name: "ZuAfrique", logo: "🌍" }],
  },
};

export const COMMUNITY_PROPOSALS = [
  {
    id: "1",
    title: "Upgrade Protocol to v2.0",
    status: "active",
    type: "onchain",
    privacy: "public",
    eligible: true,
    votes: 1234,
    endDate: "2026-05-15",
  },
  {
    id: "2",
    title: "Fund Public Goods Round Q2 2026",
    status: "active",
    type: "offchain",
    privacy: "public",
    eligible: true,
    votes: 892,
    endDate: "2026-05-10",
  },
  {
    id: "3",
    title: "Treasury Allocation Strategy",
    status: "closed",
    type: "onchain",
    privacy: "private",
    eligible: false,
    votes: 2341,
    endDate: "2026-04-20",
  },
];

export const FORUM_POSTS = [
  {
    id: "1",
    title: "Thoughts on the v2.0 upgrade timeline",
    author: "Anonymous Voter #1234",
    replies: 23,
    timestamp: "2 hours ago",
  },
  {
    id: "2",
    title: "Why I'm voting YES on public goods funding",
    author: "Anonymous Voter #5678",
    replies: 15,
    timestamp: "5 hours ago",
  },
];

export const ALL_PROPOSALS = [
  {
    id: "1",
    community: "ZuKas Residency",
    communityLogo: "🏛️",
    title: "Community Space Expansion Plan",
    status: "active",
    type: "onchain",
    privacy: "public",
    eligible: true,
    votes: 234,
    endDate: "2026-05-15",
  },
  {
    id: "2",
    community: "ZuAfrique",
    communityLogo: "🌍",
    title: "Regional Development Fund Q2 2026",
    status: "active",
    type: "offchain",
    privacy: "public",
    eligible: true,
    votes: 189,
    endDate: "2026-05-10",
  },
  {
    id: "3",
    community: "Zuitzerland",
    communityLogo: "🏔️",
    title: "Alpine Innovation Grant Program",
    status: "active",
    type: "onchain",
    privacy: "public",
    eligible: false,
    votes: 145,
    endDate: "2026-05-20",
  },
  {
    id: "4",
    community: "EDGE City",
    communityLogo: "🌆",
    title: "Network State Infrastructure Proposal",
    status: "closed",
    type: "onchain",
    privacy: "private",
    eligible: false,
    votes: 412,
    endDate: "2026-04-20",
  },
];

export const DELEGATES = [
  {
    id: "1",
    name: "Alice.eth",
    avatar: "👩‍💼",
    communities: ["ZuKas Residency", "ZuAfrique"],
    totalVotes: 145,
    reputation: 920,
    statement: "Focused on community building and cross-regional collaboration",
  },
  {
    id: "2",
    name: "Bob.eth",
    avatar: "👨‍💻",
    communities: ["Zuitzerland"],
    totalVotes: 89,
    reputation: 760,
    statement: "Supporting alpine innovation and governance experiments",
  },
  {
    id: "3",
    name: "Carol.eth",
    avatar: "👩‍🔬",
    communities: ["EDGE City", "ZuKas Residency"],
    totalVotes: 203,
    reputation: 850,
    statement: "Advancing network state experiments and future city infrastructure",
  },
  {
    id: "4",
    name: "Dave.eth",
    avatar: "👨‍🎨",
    communities: ["ZuAfrique"],
    totalVotes: 67,
    reputation: 540,
    statement: "Championing local innovation and decentralized governance in Africa",
  },
];

export const DOCUMENTS = [
  {
    id: "1",
    title: "Getting Started with ZuGov",
    category: "Guide",
    icon: BookOpen,
    description: "Learn the basics of using ZuGov for community governance",
    lastUpdated: "2026-04-15",
  },
  {
    id: "2",
    title: "Understanding Voting Mechanisms",
    category: "Documentation",
    icon: FileText,
    description: "Deep dive into simple majority, quadratic, and ranked choice voting",
    lastUpdated: "2026-04-20",
  },
  {
    id: "3",
    title: "Setting Up Identity Verification",
    category: "Tutorial",
    icon: Video,
    description: "Step-by-step guide to configure identity providers for your community",
    lastUpdated: "2026-04-25",
  },
  {
    id: "4",
    title: "API Reference",
    category: "Technical",
    icon: FileCode,
    description: "Complete API documentation for integrating with ZuGov",
    lastUpdated: "2026-04-28",
  },
  {
    id: "5",
    title: "Community Best Practices",
    category: "Guide",
    icon: BookOpen,
    description: "Tips and strategies for effective community governance",
    lastUpdated: "2026-04-10",
  },
  {
    id: "6",
    title: "Privacy & Security",
    category: "Documentation",
    icon: FileText,
    description: "Understanding how ZuGov protects user privacy and secures votes",
    lastUpdated: "2026-04-18",
  },
];

export const KNOWLEDGE_BASE_CATEGORIES = ["All", "Guide", "Documentation", "Tutorial", "Technical"];
