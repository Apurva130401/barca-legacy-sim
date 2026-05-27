"use client";

import squadSeed from "@/data/barcelonaSquad.json";
import clubsSeed from "@/data/clubs.json";
import playerDb from "@/data/playerDatabase.json";
import { AnimatePresence, motion } from "framer-motion";
import {
  Banknote,
  BriefcaseBusiness,
  CalendarDays,
  ChevronRight,
  CircleDollarSign,
  ClipboardList,
  Dumbbell,
  Flame,
  Gavel,
  Medal,
  Megaphone,
  Search,
  Shield,
  Sparkles,
  Trophy,
  Users,
  X
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type Player = {
  id: string;
  name: string;
  age: number;
  position: string;
  rating: number;
  wage: number;
  value: number;
  morale: number;
  injury: string;
  nationality: string;
  club?: string;
  potential?: number;
  loyalty?: number;
  level?: string;
  registered?: boolean;
  squadStatus?: "kept" | "sold" | "loaned";
  goals?: number;
};

type Stage = "welcome" | "marketSetup" | "budget" | "flick" | "squad" | "market" | "formation" | "season" | "results" | "trophies";
type NegotiationDifficulty = "hard" | "normal" | "easy";
type Offer = { club: string; fee: number; wageContribution?: number; type: "sale" | "loan" };
type Contract = { transferFee: number; wage: number; years: number; bonus: number; releaseClause: number };
type SlotLine = "GK" | "Defense" | "Midfield" | "Forward";
type FormationSlot = { id: string; label: string; line: SlotLine; x: string; y: string };
type SeasonResult = {
  leaguePosition: number;
  ucl: string;
  copa: string;
  superCup: string;
  trophies: string[];
  fanHappiness: number;
  managerSatisfaction: number;
  finance: number;
  scorers: { name: string; goals: number }[];
  log: string[];
};

const STORAGE_KEY = "barca-sd-sim-v3";
const ffpLimit = 2820000;
const formations = ["4-3-3", "4-2-3-1", "3-4-3", "4-4-2 Diamond"];
const formationSlots: Record<string, FormationSlot[]> = {
  "4-3-3": [
    { id: "gk", label: "GK", line: "GK", x: "50%", y: "88%" },
    { id: "lb", label: "LB", line: "Defense", x: "18%", y: "68%" },
    { id: "lcb", label: "CB", line: "Defense", x: "39%", y: "70%" },
    { id: "rcb", label: "CB", line: "Defense", x: "61%", y: "70%" },
    { id: "rb", label: "RB", line: "Defense", x: "82%", y: "68%" },
    { id: "lcm", label: "CM", line: "Midfield", x: "30%", y: "45%" },
    { id: "dm", label: "DM", line: "Midfield", x: "50%", y: "50%" },
    { id: "rcm", label: "CM", line: "Midfield", x: "70%", y: "45%" },
    { id: "lw", label: "LW", line: "Forward", x: "23%", y: "18%" },
    { id: "st", label: "ST", line: "Forward", x: "50%", y: "13%" },
    { id: "rw", label: "RW", line: "Forward", x: "77%", y: "18%" }
  ],
  "4-2-3-1": [
    { id: "gk", label: "GK", line: "GK", x: "50%", y: "88%" },
    { id: "lb", label: "LB", line: "Defense", x: "18%", y: "68%" },
    { id: "lcb", label: "CB", line: "Defense", x: "39%", y: "70%" },
    { id: "rcb", label: "CB", line: "Defense", x: "61%", y: "70%" },
    { id: "rb", label: "RB", line: "Defense", x: "82%", y: "68%" },
    { id: "ldm", label: "DM", line: "Midfield", x: "38%", y: "51%" },
    { id: "rdm", label: "DM", line: "Midfield", x: "62%", y: "51%" },
    { id: "lam", label: "AM", line: "Midfield", x: "25%", y: "31%" },
    { id: "am", label: "AM", line: "Midfield", x: "50%", y: "28%" },
    { id: "ram", label: "AM", line: "Midfield", x: "75%", y: "31%" },
    { id: "st", label: "ST", line: "Forward", x: "50%", y: "12%" }
  ],
  "3-4-3": [
    { id: "gk", label: "GK", line: "GK", x: "50%", y: "88%" },
    { id: "lcb", label: "CB", line: "Defense", x: "30%", y: "69%" },
    { id: "cb", label: "CB", line: "Defense", x: "50%", y: "72%" },
    { id: "rcb", label: "CB", line: "Defense", x: "70%", y: "69%" },
    { id: "lm", label: "LM", line: "Midfield", x: "18%", y: "48%" },
    { id: "lcm", label: "CM", line: "Midfield", x: "40%", y: "48%" },
    { id: "rcm", label: "CM", line: "Midfield", x: "60%", y: "48%" },
    { id: "rm", label: "RM", line: "Midfield", x: "82%", y: "48%" },
    { id: "lw", label: "LW", line: "Forward", x: "24%", y: "18%" },
    { id: "st", label: "ST", line: "Forward", x: "50%", y: "13%" },
    { id: "rw", label: "RW", line: "Forward", x: "76%", y: "18%" }
  ],
  "4-4-2 Diamond": [
    { id: "gk", label: "GK", line: "GK", x: "50%", y: "88%" },
    { id: "lb", label: "LB", line: "Defense", x: "18%", y: "68%" },
    { id: "lcb", label: "CB", line: "Defense", x: "39%", y: "70%" },
    { id: "rcb", label: "CB", line: "Defense", x: "61%", y: "70%" },
    { id: "rb", label: "RB", line: "Defense", x: "82%", y: "68%" },
    { id: "dm", label: "DM", line: "Midfield", x: "50%", y: "53%" },
    { id: "lcm", label: "CM", line: "Midfield", x: "34%", y: "39%" },
    { id: "rcm", label: "CM", line: "Midfield", x: "66%", y: "39%" },
    { id: "am", label: "AM", line: "Midfield", x: "50%", y: "27%" },
    { id: "lst", label: "ST", line: "Forward", x: "39%", y: "12%" },
    { id: "rst", label: "ST", line: "Forward", x: "61%", y: "12%" }
  ]
};
const months = ["August", "September", "October", "November", "December", "January", "February", "March", "April", "May"];

const money = (value: number) =>
  new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
    notation: Math.abs(value) > 999999 ? "compact" : "standard"
  }).format(value);

const clamp = (n: number, min = 0, max = 100) => Math.max(min, Math.min(max, n));
const seeded = (n: number) => Math.abs(Math.sin(n * 9301 + 49297) * 233280) % 1;

function buildMarket(): Player[] {
  const compactPlayers = (playerDb.compactPlayers ?? []).map((row: string) => {
    const [id, name, club, nationality, age, position, rating, potential, value, wage, loyalty, level] = row.split("|");
    return {
      id,
      name,
      club,
      nationality,
      age: Number(age),
      position,
      rating: Number(rating),
      potential: Number(potential),
      value: Number(value),
      wage: Number(wage),
      loyalty: Number(loyalty),
      level
    };
  });
  return [...playerDb.players, ...compactPlayers].map((p, index) => ({
    ...p,
    id: `market-${p.id}`,
    morale: 58 + Math.floor(seeded(index + 13) * 35),
    injury: seeded(index + 21) > 0.94 ? "Minor knock" : "Fit"
  }));
}

const initialSquad = (squadSeed as Player[]).map((p) => ({ ...p, registered: true, squadStatus: "kept" as const, goals: 0 }));

const newsTone = [
  "BREAKING",
  "Gerard Romero is live again",
  "Boardroom leak",
  "Mundo Deportivo siren",
  "Fake Twitter meltdown"
];

const negotiationProfiles: Record<NegotiationDifficulty, { label: string; description: string; appealBonus: number; clubAcceptanceBonus: number; hijackMultiplier: number; marqueePenalty: number; rivalryMultiplier: number }> = {
  hard: {
    label: "Hard",
    description: "Marquee players demand a convincing project, elite clubs hold firm, and rival hijacks are brutal.",
    appealBonus: -10,
    clubAcceptanceBonus: -18,
    hijackMultiplier: 1.35,
    marqueePenalty: 16,
    rivalryMultiplier: 1.2
  },
  normal: {
    label: "Normal",
    description: "A balanced market: some stars can be tempted, but clubs and agents still punish messy offers.",
    appealBonus: 0,
    clubAcceptanceBonus: 0,
    hijackMultiplier: 1,
    marqueePenalty: 7,
    rivalryMultiplier: 1
  },
  easy: {
    label: "Easy",
    description: "Barça pull is strong, clubs are more flexible, and players are easier to lure with good wages.",
    appealBonus: 15,
    clubAcceptanceBonus: 20,
    hijackMultiplier: 0.55,
    marqueePenalty: 0,
    rivalryMultiplier: 0.75
  }
};

export default function Home() {
  const [stage, setStage] = useState<Stage>("welcome");
  const [director, setDirector] = useState("");
  const [negotiationDifficulty, setNegotiationDifficulty] = useState<NegotiationDifficulty>("normal");
  const [budget, setBudget] = useState(65000000);
  const [cash, setCash] = useState(65000000);
  const [squad, setSquad] = useState<Player[]>(initialSquad);
  const [market] = useState<Player[]>(buildMarket);
  const [query, setQuery] = useState("");
  const [position, setPosition] = useState("ALL");
  const [maxPrice, setMaxPrice] = useState(180000000);
  const [maxAge, setMaxAge] = useState(40);
  const [offer, setOffer] = useState<{ player: Player; offer: Offer } | null>(null);
  const [contractTarget, setContractTarget] = useState<Player | null>(null);
  const [contract, setContract] = useState<Contract>({ transferFee: 30000000, wage: 110000, years: 4, bonus: 5000000, releaseClause: 120000000 });
  const [toast, setToast] = useState<string | null>(null);
  const [showGordonCelebration, setShowGordonCelebration] = useState(false);
  const [headline, setHeadline] = useState<string | null>("Barcelona appoints you as Sporting Director. Accountants seen stretching.");
  const [formation, setFormation] = useState("4-3-3");
  const [slotAssignments, setSlotAssignments] = useState<Record<string, string>>({});
  const [selectedSlot, setSelectedSlot] = useState<FormationSlot | null>(null);
  const [xi, setXi] = useState<string[]>([]);
  const [bench, setBench] = useState<string[]>([]);
  const [monthIndex, setMonthIndex] = useState(0);
  const [seasonLog, setSeasonLog] = useState<string[]>([]);
  const [result, setResult] = useState<SeasonResult | null>(null);
  const [trophies, setTrophies] = useState({ ucl: 5, liga: 27, copa: 31 });

  useEffect(() => {
    setShowGordonCelebration(true);
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      const saved = JSON.parse(raw);
      setStage(saved.stage ?? "welcome");
      setDirector(saved.director ?? "");
      setNegotiationDifficulty(saved.negotiationDifficulty ?? "normal");
      setBudget(saved.budget ?? 65000000);
      setCash(saved.cash ?? 65000000);
      setSquad(saved.squad ?? initialSquad);
      setFormation(saved.formation ?? "4-3-3");
      setSlotAssignments(saved.slotAssignments ?? {});
      setXi(saved.xi ?? []);
      setBench(saved.bench ?? []);
      setMonthIndex(saved.monthIndex ?? 0);
      setSeasonLog(saved.seasonLog ?? []);
      setResult(saved.result ?? null);
      setTrophies(saved.trophies ?? { ucl: 5, liga: 27, copa: 31 });
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ stage, director, negotiationDifficulty, budget, cash, squad, formation, slotAssignments, xi, bench, monthIndex, seasonLog, result, trophies })
    );
  }, [stage, director, negotiationDifficulty, budget, cash, squad, formation, slotAssignments, xi, bench, monthIndex, seasonLog, result, trophies]);

  useEffect(() => {
    setXi(Object.values(slotAssignments).filter(Boolean));
  }, [slotAssignments]);

  const activeSquad = squad.filter((p) => p.squadStatus !== "sold" && p.squadStatus !== "loaned");
  const assignedXi = Object.values(slotAssignments).filter(Boolean);
  const wageBill = activeSquad.reduce((sum, p) => sum + p.wage, 0);
  const avgMorale = Math.round(activeSquad.reduce((sum, p) => sum + p.morale, 0) / Math.max(1, activeSquad.length));
  const squadPower = Math.round(activeSquad.reduce((sum, p) => sum + p.rating, 0) / Math.max(1, activeSquad.length));
  const ffpRisk = clamp(Math.round((wageBill / ffpLimit) * 100));
  const registeredCount = activeSquad.filter((p) => p.registered).length;
  const currentSlots = formationSlots[formation] ?? formationSlots["4-3-3"];
  const negotiationProfile = negotiationProfiles[negotiationDifficulty];
  const ballonDorLine =
    result && (result.trophies.includes("UEFA Champions League") || result.trophies.includes("La Liga")) && result.fanHappiness >= 78
      ? "Ballon d'Or winner: Lamine Yamal after delivering an actual trophy season, not just elite edits."
      : result && result.leaguePosition <= 2 && result.trophies.length > 0
        ? "Ballon d'Or winner: Kylian Mbappe. Lamine finishes top five and posts one mysterious hourglass emoji."
        : "Ballon d'Or winner: Kylian Mbappe. Barcelona's PR team quietly deletes the Lamine poster draft.";

  const filteredMarket = useMemo(
    () =>
      market
        .filter((p) => p.name.toLowerCase().includes(query.toLowerCase()))
        .filter((p) => position === "ALL" || p.position === position)
        .filter((p) => p.value <= maxPrice && p.age <= maxAge)
        .slice(0, 72),
    [market, maxAge, maxPrice, position, query]
  );

  const marketPositions = useMemo(() => Array.from(new Set(market.map((p) => p.position))).sort(), [market]);

  const pushNews = (message: string) => {
    setHeadline(`${newsTone[Math.floor(Math.random() * newsTone.length)]}: ${message}`);
    setToast(message);
    window.setTimeout(() => setToast(null), 3300);
  };

  const generateOffer = (player: Player, type: "sale" | "loan") => {
    const club = clubsSeed[Math.floor(Math.random() * clubsSeed.length)];
    const fee = type === "sale" ? Math.round(player.value * (0.72 + Math.random() * 0.58) / 100000) * 100000 : 0;
    const wageContribution = type === "loan" ? Math.round((35 + Math.random() * 65) * 10) / 10 : undefined;
    setOffer({ player, offer: { club: club.name, fee, wageContribution, type } });
  };

  const acceptOffer = () => {
    if (!offer) return;
    setSquad((players) =>
      players.map((p) =>
        p.id === offer.player.id
          ? {
              ...p,
              squadStatus: offer.offer.type === "sale" ? "sold" : "loaned",
              wage: offer.offer.type === "loan" ? Math.round(p.wage * (1 - (offer.offer.wageContribution ?? 0) / 100)) : p.wage
            }
          : p
      )
    );
    setCash((v) => v + offer.offer.fee);
    pushNews(`${offer.offer.club} ${offer.offer.type === "sale" ? "buys" : "borrows"} ${offer.player.name}. The wage bill exhales.`);
    setOffer(null);
  };

  const startNegotiation = (player: Player) => {
    setContractTarget(player);
    setContract({
      transferFee: Math.min(cash, Math.round(player.value * 1.05 / 100000) * 100000),
      wage: Math.round(player.wage * (1.08 + Math.random() * 0.42) / 1000) * 1000,
      years: player.age > 30 ? 2 : 5,
      bonus: Math.round(player.value * 0.08 / 100000) * 100000,
      releaseClause: Math.round(player.value * 2.2 / 1000000) * 1000000
    });
  };

  const submitContract = () => {
    if (!contractTarget) return;
    const isRealMadrid = contractTarget.club === "Real Madrid";
    const isEliteClub = ["Real Madrid", "Manchester City", "Bayern Munich", "Paris Saint-Germain", "Arsenal", "Liverpool", "Inter"].includes(contractTarget.club ?? "");
    const isPremierLeague = ["Manchester City", "Arsenal", "Liverpool", "Chelsea", "Newcastle United", "Manchester United", "West Ham United", "Brighton", "Aston Villa", "Crystal Palace", "Nottingham Forest"].includes(contractTarget.club ?? "");
    const clubResistance = isRealMadrid ? 2.8 : isEliteClub ? 1.55 : isPremierLeague ? 1.35 : 1.08;
    const releaseClauseTax = contract.releaseClause < contractTarget.value * 1.8 ? 0.12 : 0;
    const askingPrice = Math.round(contractTarget.value * (clubResistance + releaseClauseTax + Math.random() * 0.22) / 100000) * 100000;
    const transferCost = Math.min(contract.transferFee, cash);
    const competitor = clubsSeed[Math.floor(Math.random() * clubsSeed.length)];
    const wagePremium = contract.wage / Math.max(1, contractTarget.wage);
    const registrationPenalty = wageBill + contract.wage > ffpLimit ? 30 : 0;
    const rivalryPenalty = (isRealMadrid ? 75 : contractTarget.club === "Atletico Madrid" ? 18 : 0) * negotiationProfile.rivalryMultiplier;
    const projectBonus = contractTarget.age <= 23 ? 6 : contractTarget.age >= 31 ? -4 : 0;
    const starPenalty = contractTarget.rating >= 88 ? negotiationProfile.marqueePenalty : contractTarget.rating >= 85 ? Math.round(negotiationProfile.marqueePenalty * 0.55) : 0;
    const levelPenalty = contractTarget.level === "World superstar" ? 12 : contractTarget.level === "Elite UCL" ? 7 : 0;
    const loyaltyPenalty = (contractTarget.loyalty ?? 50) * 0.42;
    const releaseClauseBonus = contract.releaseClause > contractTarget.value * 2.4 ? 5 : -4;
    const wageScore = wagePremium >= 1.45 ? 24 : wagePremium >= 1.22 ? 15 : wagePremium >= 1.08 ? 7 : -12;
    const clubOfferRatio = transferCost / Math.max(1, askingPrice);
    const clubAcceptance = clamp((clubOfferRatio >= 1 ? 100 : clubOfferRatio >= 0.9 ? 72 : clubOfferRatio >= 0.8 ? 38 : clubOfferRatio >= 0.7 ? 16 : 0) + negotiationProfile.clubAcceptanceBonus);
    const cashPenalty = cash >= transferCost + contract.bonus ? 0 : 35;
    const appeal = 56 + negotiationProfile.appealBonus + wageScore + projectBonus + releaseClauseBonus - registrationPenalty - rivalryPenalty - starPenalty - levelPenalty - loyaltyPenalty - cashPenalty + Math.random() * 18;
    if (transferCost > cash || cash < transferCost + contract.bonus) {
      pushNews(`The ${contractTarget.name} deal collapses. Your offer cannot exceed the available transfer budget.`);
      setContractTarget(null);
      return;
    }
    if (Math.random() * 100 > clubAcceptance) {
      pushNews(`${contractTarget.club} rejects ${money(transferCost)} for ${contractTarget.name}. They are holding out for around ${money(askingPrice)}.`);
      setContractTarget(null);
      return;
    }
    if (isRealMadrid && Math.random() < (negotiationDifficulty === "easy" ? 0.72 : negotiationDifficulty === "normal" ? 0.88 : 0.96)) {
      pushNews(`${contractTarget.name} refuses to cross the Clasico border. The agent did not even let you finish the sentence.`);
      setContractTarget(null);
      return;
    }
    if (appeal < 48) {
      const reason = registrationPenalty ? "because La Liga registration looks impossible" : loyaltyPenalty > 28 ? `because he is settled at ${contractTarget.club}` : "because the sporting project is not convincing enough";
      pushNews(`${contractTarget.name} rejects Barcelona ${reason}.`);
      setContractTarget(null);
      return;
    }
    const hijackChance = clamp((contractTarget.rating >= 86 ? 0.36 : contractTarget.potential && contractTarget.potential >= 88 ? 0.28 : 0.14) * negotiationProfile.hijackMultiplier, 0, 0.72);
    if (Math.random() < hijackChance) {
      pushNews(`${competitor.name} hijacks the ${contractTarget.name} deal with cleaner wages and fewer PDF rituals.`);
      setContractTarget(null);
      return;
    }
    const registered = wageBill + contract.wage <= ffpLimit;
    const signed = { ...contractTarget, id: `signed-${contractTarget.id}`, wage: contract.wage, morale: 74, registered, squadStatus: "kept" as const, goals: 0 };
    setSquad((players) => [signed, ...players]);
    setCash((v) => v - transferCost - contract.bonus);
    pushNews(registered ? `${contractTarget.name} signs from ${contractTarget.club} for ${money(transferCost)} and is registered.` : `${contractTarget.name} signs from ${contractTarget.club}, but La Liga blocks registration. Sell someone. Immediately.`);
    setContractTarget(null);
  };

  const toggleSelection = (id: string, group: "xi" | "bench") => {
    if (group === "xi") {
      setXi((list) => (list.includes(id) ? list.filter((x) => x !== id) : list.length < 11 && !bench.includes(id) ? [...list, id] : list));
    } else {
      setBench((list) => (list.includes(id) ? list.filter((x) => x !== id) : list.length < 7 && !xi.includes(id) ? [...list, id] : list));
    }
  };

  const isEligibleForSlot = (player: Player, slot: FormationSlot) => {
    if (slot.line === "GK") return player.position === "GK";
    if (slot.line === "Defense") return ["CB", "LB", "RB"].includes(player.position);
    if (slot.line === "Midfield") return ["DM", "CM", "AM"].includes(player.position);
    return ["LW", "RW", "ST"].includes(player.position);
  };

  const assignToSlot = (playerId: string) => {
    if (!selectedSlot) return;
    setSlotAssignments((current) => {
      const next = Object.fromEntries(Object.entries(current).filter(([, id]) => id !== playerId));
      next[selectedSlot.id] = playerId;
      return next;
    });
    setBench((list) => list.filter((id) => id !== playerId));
    setSelectedSlot(null);
  };

  const simulateMonth = () => {
    const month = months[monthIndex];
    const fitBonus = assignedXi.length >= 11 ? 4 : -18;
    const ffpPenalty = wageBill > ffpLimit ? -26 : 0;
    const depthPenalty = activeSquad.length < 22 ? -8 : 0;
    const score = squadPower + avgMorale * 0.12 + fitBonus + ffpPenalty + depthPenalty + Math.random() * 14;
    const wins = clamp(Math.round((score - 66) / 9), 0, 4);
    const event = playerDb.headlines[Math.floor(Math.random() * playerDb.headlines.length)];
    const injuryChance = Math.random();
    let extra = "";
    if (injuryChance > 0.76) {
      const victim = activeSquad[Math.floor(Math.random() * activeSquad.length)];
      extra = `${victim.name} suffers a training knock.`;
      setSquad((players) => players.map((p) => (p.id === victim.id ? { ...p, injury: "2 weeks", morale: clamp(p.morale - 5) } : p)));
    }
    const line = `${month}: ${wins} wins from 5. ${event} ${extra}`;
    setSeasonLog((log) => [line, ...log].slice(0, 14));
    setMonthIndex((i) => i + 1);
    pushNews(line);
    if (monthIndex + 1 >= months.length) finishSeason([...seasonLog, line]);
  };

  const finishSeason = (log: string[]) => {
    const base = squadPower + avgMorale * 0.14 + (wageBill <= ffpLimit ? 4 : -24) + (assignedXi.length >= 11 ? 4 : -18) + (activeSquad.length >= 23 ? 3 : -7) + Math.random() * 13;
    const leaguePosition = base > 103 ? 1 : base > 96 ? 2 : base > 89 ? 3 : base > 82 ? 4 : base > 76 ? 5 : 7;
    const trophiesWon = [
      leaguePosition === 1 ? "La Liga" : "",
      base > 101 && Math.random() > 0.38 ? "Copa del Rey" : "",
      base > 110 && Math.random() > 0.55 ? "UEFA Champions League" : "",
      base > 96 && Math.random() > 0.7 ? "Spanish Super Cup" : ""
    ].filter(Boolean);
    const scorers = [...activeSquad]
      .filter((p) => ["ST", "RW", "LW", "AM"].includes(p.position))
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 5)
      .map((p, i) => ({ name: p.name, goals: Math.max(4, Math.round((p.rating - 68) * (1.35 - i * 0.12) + Math.random() * 8)) }));
    setResult({
      leaguePosition,
      ucl: trophiesWon.includes("UEFA Champions League") ? "Winners" : base > 102 ? "Semi-final" : base > 92 ? "Quarter-final" : base > 84 ? "Round of 16" : "League phase exit",
      copa: trophiesWon.includes("Copa del Rey") ? "Winners" : base > 92 ? "Semi-final" : base > 83 ? "Quarter-final" : "Round of 16",
      superCup: trophiesWon.includes("Spanish Super Cup") ? "Winners" : "Final drama",
      trophies: trophiesWon,
      fanHappiness: clamp(Math.round(base - 18 - (leaguePosition - 1) * 10)),
      managerSatisfaction: clamp(Math.round(base - 14 - (wageBill > ffpLimit ? 22 : 0))),
      finance: cash - Math.max(0, wageBill - ffpLimit) * 8,
      scorers,
      log
    });
    setTrophies((t) => ({
      ucl: t.ucl + (trophiesWon.includes("UEFA Champions League") ? 1 : 0),
      liga: t.liga + (trophiesWon.includes("La Liga") ? 1 : 0),
      copa: t.copa + (trophiesWon.includes("Copa del Rey") ? 1 : 0)
    }));
    setStage("results");
  };

  const restart = () => {
    localStorage.removeItem(STORAGE_KEY);
    window.location.reload();
  };

  return (
    <main className="min-h-screen overflow-hidden px-4 py-5 text-slate-100 sm:px-6 lg:px-8">
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -24 }} className="fixed left-1/2 top-5 z-50 w-[min(92vw,680px)] -translate-x-1/2 rounded-lg border border-barcaGold/40 bg-night/95 p-4 shadow-glow">
            <div className="flex items-center gap-3 text-sm font-semibold"><Flame className="h-5 w-5 text-barcaGold" /> {toast}</div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showGordonCelebration && (
          <motion.div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div initial={{ scale: .9, y: 24 }} animate={{ scale: 1, y: 0 }} exit={{ scale: .9, y: 24 }} className="glass w-[min(92vw,560px)] rounded-lg border-barcaGold/40 p-6 text-center shadow-glow">
              <Sparkles className="mx-auto h-10 w-10 text-barcaGold" />
              <p className="mt-3 text-sm uppercase tracking-[.3em] text-barcaGold">Official signing</p>
              <h2 className="mt-3 text-4xl font-black">Anthony Gordon is in the Barça squad</h2>
              <p className="mt-3 text-slate-300">The left wing just got louder. Fans are already refreshing compilations and pretending they knew the flight number.</p>
              <button className="mt-6 rounded-lg bg-barcaGold px-5 py-3 font-black text-night" onClick={() => setShowGordonCelebration(false)}>Vamos</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mx-auto flex max-w-7xl flex-col gap-5">
        <header className="glass noise flex flex-col gap-4 rounded-lg p-4 shadow-glow md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-[.28em] text-barcaGold"><Shield className="h-4 w-4" /> Barca Sporting Director Simulator</div>
            <h1 className="mt-2 text-2xl font-black sm:text-4xl">FC Barcelona, but the spreadsheet is screaming</h1>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
            <Stat label="Cash" value={money(cash)} icon={<CircleDollarSign />} />
            <Stat label="Wages" value={money(wageBill)} icon={<Banknote />} danger={wageBill > ffpLimit} />
            <Stat label="FFP risk" value={`${ffpRisk}%`} icon={<Gavel />} danger={ffpRisk > 90} />
            <Stat label="Morale" value={`${avgMorale}%`} icon={<Users />} />
          </div>
        </header>

        {headline && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-lg border border-white/10 bg-black/35 p-3 text-sm text-slate-200">
            <span className="mr-2 text-barcaGold">Ticker</span>{headline}
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {stage === "welcome" && (
            <Screen key="welcome">
              <div className="grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
                <div className="pitch-lines rounded-lg p-7">
                  <p className="text-sm uppercase tracking-[.35em] text-barcaGold">Welcome to FC Barcelona</p>
                  <h2 className="mt-3 text-4xl font-black sm:text-6xl">You are now responsible for miracles.</h2>
                  <p className="mt-4 max-w-2xl text-slate-300">Hansi Flick wants signings, La Liga wants paperwork, fans want trophies, and the wage bill is sitting in your office wearing sunglasses.</p>
                  <div className="mt-6 flex max-w-md flex-col gap-3 sm:flex-row">
                    <input className="rounded-lg border border-white/15 bg-black/45 px-4 py-3 outline-none focus:border-barcaGold" placeholder="Director name" value={director} onChange={(e) => setDirector(e.target.value)} />
                    <button className="rounded-lg bg-barcaGold px-5 py-3 font-black text-night" onClick={() => setStage("marketSetup")} disabled={!director.trim()}>Take the job</button>
                  </div>
                </div>
                <Panel title="Financial Crisis Briefing" icon={<ClipboardList />}>
                  <Info label="Deferred wages" value="Still haunting the halls" />
                  <Info label="Registration mood" value="Hostile" />
                  <Info label="Board message" value="Win now, spend less, look calm" />
                  <Info label="Fan patience" value="Depends on the next winger" />
                </Panel>
              </div>
            </Screen>
          )}

          {stage === "marketSetup" && (
            <Screen key="marketSetup">
              <Panel title="Transfer Market Difficulty" icon={<Gavel />}>
                <div className="grid gap-4 md:grid-cols-3">
                  {(Object.keys(negotiationProfiles) as NegotiationDifficulty[]).map((level) => {
                    const profile = negotiationProfiles[level];
                    const selected = negotiationDifficulty === level;
                    return (
                      <button
                        key={level}
                        className={`rounded-lg border p-5 text-left transition ${selected ? "border-barcaGold bg-barcaGold/15 shadow-glow" : "border-white/10 bg-black/30 hover:border-barcaGold/60 hover:bg-white/10"}`}
                        onClick={() => setNegotiationDifficulty(level)}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <h3 className="text-2xl font-black">{profile.label}</h3>
                          <span className={`rounded-full px-3 py-1 text-xs font-black ${selected ? "bg-barcaGold text-night" : "bg-white/10 text-slate-300"}`}>{selected ? "Selected" : "Choose"}</span>
                        </div>
                        <p className="mt-3 text-sm text-slate-300">{profile.description}</p>
                      </button>
                    );
                  })}
                </div>
                <div className="mt-5 rounded-lg border border-white/10 bg-black/30 p-4 text-sm text-slate-300">
                  Current mode: <b className="text-barcaGold">{negotiationProfile.label}</b>. This changes real transfer behavior: club acceptance, player appeal, marquee-player reluctance, rivalry resistance, and hijack odds.
                </div>
                <button className="mt-5 rounded-lg bg-barcaGold px-5 py-3 font-black text-night" onClick={() => setStage("budget")}>Continue to Budget</button>
              </Panel>
            </Screen>
          )}

          {stage === "budget" && (
            <Screen key="budget">
              <Panel title="Budget Adjustment" icon={<BriefcaseBusiness />}>
                <div className="grid gap-5 lg:grid-cols-[1fr_.85fr]">
                  <div>
                    <label className="text-sm text-slate-300">Transfer budget</label>
                    <input type="range" min={25000000} max={160000000} step={5000000} value={budget} onChange={(e) => { setBudget(Number(e.target.value)); setCash(Number(e.target.value)); }} className="mt-4 w-full" />
                    <div className="mt-3 text-5xl font-black text-barcaGold">{money(budget)}</div>
                    <div className="mt-5 h-4 overflow-hidden rounded-full bg-white/10"><div className="h-full bg-gradient-to-r from-barcaBlue via-barcaRed to-barcaGold" style={{ width: `${ffpRisk}%` }} /></div>
                    <p className="mt-2 text-sm text-slate-400">FFP risk starts at {ffpRisk}%. Bigger budgets make fans louder, but wages still decide registration.</p>
                  </div>
                  <div className="grid gap-3">
                    <Info label="Board expectation" value={budget > 110000000 ? "Major trophies or chaos" : "Top 2 and wage discipline"} />
                    <Info label="Wage budget" value={money(ffpLimit)} />
                    <Info label="Current wage bill" value={money(wageBill)} />
                    <button className="mt-2 rounded-lg bg-barcaGold px-5 py-3 font-black text-night" onClick={() => setStage("flick")}>Meet Hansi Flick</button>
                  </div>
                </div>
              </Panel>
            </Screen>
          )}

          {stage === "flick" && (
            <Screen key="flick">
              <div className="grid gap-5 lg:grid-cols-[.85fr_1.15fr]">
                <Panel title="Hansi Flick" icon={<Dumbbell />}>
                  <div className="rounded-lg border border-white/10 bg-white/5 p-5">
                    <p className="text-2xl font-black">Guten Tag, {director}.</p>
                    <p className="mt-4 text-slate-300">Deco has left the building. The printer resigned in solidarity. You must win trophies, reduce wages, handle FFP, and register players before the fans turn the mentions into a courtroom.</p>
                  </div>
                </Panel>
                <Panel title="Objectives" icon={<Trophy />}>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {["Win La Liga or reach UCL semi-final","Reduce wage bill under La Liga limit","Register every new signing","Keep Lamine happy at all costs","Survive fake Twitter","Avoid the emergency lever button"].map((item) => (
                      <div key={item} className="rounded-lg border border-white/10 bg-black/30 p-4 text-sm">{item}</div>
                    ))}
                  </div>
                  <button className="mt-5 rounded-lg bg-barcaGold px-5 py-3 font-black text-night" onClick={() => setStage("squad")}>Open squad hub</button>
                </Panel>
              </div>
            </Screen>
          )}

          {stage === "squad" && (
            <Screen key="squad">
              <Panel title="Squad Management" icon={<Users />}>
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm text-slate-400">{activeSquad.length} active players, {registeredCount} registered. Sell or loan wages before La Liga blocks your new toys.</p>
                  <button className="rounded-lg bg-barcaGold px-4 py-2 font-black text-night" onClick={() => setStage("market")}>Transfer market <ChevronRight className="inline h-4 w-4" /></button>
                </div>
                <PlayerTable players={squad} actions={(p) => p.squadStatus === "kept" ? (
                  <div className="flex gap-2">
                    <button className="rounded-md bg-emerald-500/20 px-3 py-2 text-xs font-bold text-emerald-200" onClick={() => generateOffer(p, "sale")}>Sell</button>
                    <button className="rounded-md bg-sky-500/20 px-3 py-2 text-xs font-bold text-sky-200" onClick={() => generateOffer(p, "loan")}>Loan</button>
                  </div>
                ) : <span className="text-xs uppercase text-slate-500">{p.squadStatus}</span>} />
              </Panel>
            </Screen>
          )}

          {stage === "market" && (
            <Screen key="market">
              <Panel title="Transfer Market" icon={<Search />}>
                <div className="mb-4 rounded-lg border border-white/10 bg-black/30 p-3 text-sm text-slate-300">
                  Negotiation mode: <b className="text-barcaGold">{negotiationProfile.label}</b> | {negotiationProfile.description}
                </div>
                <div className="mb-4 flex flex-col gap-3 xl:flex-row xl:items-center">
                  <div className="grid flex-1 gap-3 lg:grid-cols-4">
                  <input className="rounded-lg border border-white/10 bg-black/40 px-3 py-2 lg:col-span-2" placeholder="Search players" value={query} onChange={(e) => setQuery(e.target.value)} />
                  <select className="rounded-lg border border-white/10 bg-black/40 px-3 py-2" value={position} onChange={(e) => setPosition(e.target.value)}>
                    <option value="ALL">All positions</option>{marketPositions.map((p) => <option key={p}>{p}</option>)}
                  </select>
                  <select className="rounded-lg border border-white/10 bg-black/40 px-3 py-2" value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))}>
                    {[25000000,50000000,80000000,120000000,180000000].map((v) => <option key={v} value={v}>Under {money(v)}</option>)}
                  </select>
                  <select className="rounded-lg border border-white/10 bg-black/40 px-3 py-2" value={maxAge} onChange={(e) => setMaxAge(Number(e.target.value))}>
                    {[21,24,28,32,40].map((v) => <option key={v} value={v}>Age under {v}</option>)}
                  </select>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row xl:flex-col">
                    <button className="rounded-lg border border-emerald-400/50 px-5 py-3 font-black text-emerald-100 transition hover:border-emerald-300 hover:bg-emerald-500/15" onClick={() => setStage("squad")}>Back -&gt; Sell</button>
                    <button className="rounded-lg bg-emerald-500 px-5 py-3 font-black text-night shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-400" onClick={() => setStage("formation")}>Next -&gt; Formation</button>
                  </div>
                </div>
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {filteredMarket.map((p) => (
                    <motion.div layout key={p.id} className="rounded-lg border border-white/10 bg-white/[.045] p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-black">{p.name}</h3>
                          <p className="text-xs text-slate-400">{p.club} | {p.nationality} | {p.position}</p>
                          <p className="text-xs text-slate-500">{p.level} | loyalty {p.loyalty}%</p>
                        </div>
                        <span className="rounded-md bg-barcaGold px-2 py-1 text-sm font-black text-night">{p.rating}</span>
                      </div>
                      <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
                        <Info label="Value" value={money(p.value)} compact />
                        <Info label="Wage" value={money(p.wage)} compact />
                        <Info label="Potential" value={`${p.potential}`} compact />
                      </div>
                      <button className="mt-4 w-full rounded-lg bg-barcaRed px-4 py-2 font-black" onClick={() => startNegotiation(p)}>Negotiate</button>
                    </motion.div>
                  ))}
                </div>
                <div className="mt-5 flex flex-wrap gap-3">
                  <button className="rounded-lg border border-emerald-400/50 px-5 py-3 font-black text-emerald-100 transition hover:border-emerald-300 hover:bg-emerald-500/15" onClick={() => setStage("squad")}>Back -&gt; Sell</button>
                  <button className="rounded-lg bg-emerald-500 px-5 py-3 font-black text-night shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-400" onClick={() => setStage("formation")}>Next -&gt; Formation</button>
                </div>
              </Panel>
            </Screen>
          )}

          {stage === "formation" && (
            <Screen key="formation">
              <div className="grid gap-5 lg:grid-cols-[.9fr_1.1fr]">
                <Panel title="Formation & Squad Setup" icon={<Shield />}>
                  <select className="mb-4 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-3" value={formation} onChange={(e) => { setFormation(e.target.value); setSlotAssignments({}); }}>{formations.map((f) => <option key={f}>{f}</option>)}</select>
                  <div className="pitch-lines relative min-h-[560px] overflow-hidden rounded-lg p-4">
                    <div className="absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/15" />
                    <div className="absolute left-[12%] right-[12%] top-4 h-24 rounded-b-full border-x border-b border-white/10" />
                    <div className="absolute bottom-4 left-[12%] right-[12%] h-24 rounded-t-full border-x border-t border-white/10" />
                    {currentSlots.map((slot) => {
                      const player = activeSquad.find((p) => p.id === slotAssignments[slot.id]);
                      return (
                        <button
                          key={slot.id}
                          className={`absolute min-h-[64px] w-[min(30vw,150px)] -translate-x-1/2 -translate-y-1/2 rounded-lg border p-2 text-center text-xs font-black transition hover:border-barcaGold hover:bg-black/80 ${player ? "border-barcaGold/40 bg-black/70" : "border-white/15 bg-black/45 text-slate-300"}`}
                          style={{ left: slot.x, top: slot.y }}
                          onClick={() => setSelectedSlot(slot)}
                        >
                          <span className="block text-[11px] uppercase tracking-[.2em] text-barcaGold">{slot.label}</span>
                          {player ? <><span className="block truncate">{player.name}</span><span className="text-slate-400">{player.position} {player.rating}</span></> : <span className="block text-slate-400">Choose {slot.line}</span>}
                        </button>
                      );
                    })}
                  </div>
                </Panel>
                <Panel title={`Assigned XI (${assignedXi.length}/11) & Bench (${bench.length}/7)`} icon={<Users />}>
                  <button className="mb-4 rounded-lg border border-emerald-400/50 px-5 py-3 font-black text-emerald-100 transition hover:border-emerald-300 hover:bg-emerald-500/15" onClick={() => setStage("market")}>Back -&gt; Transfer Market</button>
                  <div className="mb-4 rounded-lg border border-white/10 bg-black/30 p-4 text-sm text-slate-300">
                    Click a position on the pitch to choose from eligible players only: GK, defenders, midfielders, or forwards.
                  </div>
                  <div className="max-h-[650px] overflow-auto pr-2">
                    {activeSquad.map((p) => (
                      <div key={p.id} className="mb-2 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white/10 bg-black/30 p-3 text-sm">
                        <span><b>{p.name}</b> <span className="text-slate-400">{p.position} {p.rating} | {p.registered ? "Registered" : "Blocked"}</span></span>
                        <div className="flex gap-2">
                          {assignedXi.includes(p.id) && <span className="rounded-md bg-barcaGold px-3 py-2 text-xs font-black text-night">XI</span>}
                          <button disabled={!p.registered} className={`rounded-md px-3 py-2 text-xs font-black ${bench.includes(p.id) ? "bg-barcaBlue" : "bg-white/10"}`} onClick={() => toggleSelection(p.id, "bench")}>Bench</button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button disabled={assignedXi.length < 11} className="mt-4 w-full rounded-lg bg-barcaGold px-4 py-3 font-black text-night" onClick={() => setStage("season")}>Start season</button>
                </Panel>
              </div>
            </Screen>
          )}

          {stage === "season" && (
            <Screen key="season">
              <Panel title="Season Simulation" icon={<CalendarDays />}>
                <div className="grid gap-5 lg:grid-cols-[.7fr_1.3fr]">
                  <div className="rounded-lg border border-white/10 bg-black/30 p-5">
                    <p className="text-sm uppercase tracking-[.25em] text-barcaGold">Current month</p>
                    <h2 className="mt-2 text-5xl font-black">{months[monthIndex] ?? "May"}</h2>
                    <p className="mt-4 text-sm text-slate-400">Competitions: La Liga, UEFA Champions League, Copa del Rey, Spanish Super Cup.</p>
                    <button className="mt-5 w-full rounded-lg bg-barcaGold px-4 py-3 font-black text-night" onClick={simulateMonth}>Simulate month</button>
                  </div>
                  <div className="grid gap-3">
                    {seasonLog.length === 0 ? <p className="rounded-lg border border-white/10 bg-white/5 p-4 text-slate-400">No matches yet. The optimism is legally fragile.</p> : seasonLog.map((line) => <div key={line} className="rounded-lg border border-white/10 bg-white/[.045] p-4 text-sm">{line}</div>)}
                  </div>
                </div>
              </Panel>
            </Screen>
          )}

          {stage === "results" && result && (
            <Screen key="results">
              <Panel title="End Season Results" icon={<Medal />}>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <Info label="La Liga" value={`${result.leaguePosition}${result.leaguePosition === 1 ? "st" : result.leaguePosition === 2 ? "nd" : "th"}`} />
                  <Info label="UCL" value={result.ucl} />
                  <Info label="Copa del Rey" value={result.copa} />
                  <Info label="Super Cup" value={result.superCup} />
                </div>
                <div className="mt-5 grid gap-5 lg:grid-cols-2">
                  <div className="rounded-lg border border-white/10 bg-black/30 p-4">
                    <h3 className="mb-3 font-black">Top scorers</h3>
                    {result.scorers.map((s) => <div key={s.name} className="flex justify-between border-b border-white/10 py-2 text-sm"><span>{s.name}</span><b>{s.goals}</b></div>)}
                  </div>
                  <div className="rounded-lg border border-white/10 bg-black/30 p-4">
                    <h3 className="mb-3 font-black">Board & Fans</h3>
                    <Meter label="Manager satisfaction" value={result.managerSatisfaction} />
                    <Meter label="Fan happiness" value={result.fanHappiness} />
                    <Info label="Financial summary" value={money(result.finance)} compact />
                  </div>
                </div>
                <div className="mt-5 flex flex-wrap gap-3">
                  <button className="rounded-lg bg-barcaGold px-5 py-3 font-black text-night" onClick={() => setStage("trophies")}>Open trophy room</button>
                  <button className="rounded-lg bg-emerald-500 px-5 py-3 font-black text-night shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-400" onClick={restart}>Play Again</button>
                  <button className="rounded-lg border border-white/15 px-5 py-3 font-black" onClick={restart}>New save</button>
                </div>
                <div className="mt-6 flex flex-col gap-3 rounded-lg border border-barcaGold/30 bg-barcaGold/10 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm font-bold text-slate-100">Enjoyed surviving the Barça spreadsheet?</p>
                  <a className="inline-flex min-h-[48px] items-center justify-center rounded-lg bg-barcaGold px-6 py-3 text-center font-black text-night shadow-lg shadow-barcaGold/20 transition hover:-translate-y-0.5 hover:bg-yellow-300" href="https://buymeacoffee.com/apurvamishra" target="_blank" rel="noreferrer">Buy Me a Coffee</a>
                </div>
              </Panel>
            </Screen>
          )}

          {stage === "trophies" && (
            <Screen key="trophies">
              <Panel title="Trophy Room" icon={<Trophy />}>
                <div className="grid gap-5 md:grid-cols-3">
                  <TrophyCase label="UEFA Champions League" count={trophies.ucl} fresh={!!result?.trophies.includes("UEFA Champions League")} />
                  <TrophyCase label="La Liga" count={trophies.liga} fresh={!!result?.trophies.includes("La Liga")} />
                  <TrophyCase label="Copa del Rey" count={trophies.copa} fresh={!!result?.trophies.includes("Copa del Rey")} />
                </div>
                <div className="mt-6 rounded-lg border border-white/10 bg-black/30 p-4">
                  <h3 className="font-black">Season awards</h3>
                  <p className="mt-2 text-sm text-slate-300">{ballonDorLine}</p>
                  <p className="mt-1 text-sm text-slate-300">Youth academy breakout: Guille Fernandez. La Masia discourse restored to full power.</p>
                </div>
                <button className="mt-5 rounded-lg border border-white/15 px-5 py-3 font-black transition hover:border-barcaGold hover:bg-white/10" onClick={() => setStage("results")}>Back to Season Summary</button>
              </Panel>
            </Screen>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {offer && (
          <Modal title={`${offer.offer.type === "sale" ? "Transfer" : "Loan"} Offer`} onClose={() => setOffer(null)}>
            <p className="text-slate-300">{offer.offer.club} wants {offer.player.name}.</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Info label="Fee" value={offer.offer.type === "sale" ? money(offer.offer.fee) : "No fee"} />
              <Info label="Wage contribution" value={offer.offer.type === "loan" ? `${offer.offer.wageContribution}%` : "100% removed"} />
            </div>
            <div className="mt-5 flex gap-3">
              <button className="flex-1 rounded-lg bg-emerald-500 px-4 py-3 font-black text-night" onClick={acceptOffer}>Accept</button>
              <button className="flex-1 rounded-lg border border-white/15 px-4 py-3 font-black" onClick={() => setOffer(null)}>Reject</button>
            </div>
          </Modal>
        )}

        {contractTarget && (
          <Modal title={`Contract: ${contractTarget.name}`} onClose={() => setContractTarget(null)}>
            <div className="grid gap-4">
              <Slider label={`Transfer fee to ${contractTarget.club}`} value={Math.min(contract.transferFee, cash)} min={0} max={Math.max(0, cash)} step={500000} format={money} onChange={(transferFee) => setContract((c) => ({ ...c, transferFee }))} />
              <div className="rounded-lg border border-white/10 bg-black/30 p-3 text-sm text-slate-300">
                Budget available: <b className="text-barcaGold">{money(cash)}</b>. Clubs can reject low offers, especially elite clubs and rivals.
              </div>
              <Slider label="Wage" value={contract.wage} min={30000} max={520000} step={5000} format={money} onChange={(wage) => setContract((c) => ({ ...c, wage }))} />
              <Slider label="Years" value={contract.years} min={1} max={6} step={1} onChange={(years) => setContract((c) => ({ ...c, years }))} />
              <Slider label="Bonus" value={contract.bonus} min={0} max={25000000} step={500000} format={money} onChange={(bonus) => setContract((c) => ({ ...c, bonus }))} />
              <Slider label="Release clause" value={contract.releaseClause} min={10000000} max={400000000} step={5000000} format={money} onChange={(releaseClause) => setContract((c) => ({ ...c, releaseClause }))} />
              <div className={`rounded-lg p-3 text-sm ${wageBill + contract.wage > ffpLimit ? "bg-red-500/20 text-red-100" : "bg-emerald-500/15 text-emerald-100"}`}>
                {wageBill + contract.wage > ffpLimit ? "Cannot register player under current La Liga FFP. You can still sign him, but chaos follows." : "Registration projected to pass."}
              </div>
              <button className="rounded-lg bg-barcaGold px-4 py-3 font-black text-night" onClick={submitContract}>Submit offer</button>
            </div>
          </Modal>
        )}

        {selectedSlot && (
          <Modal title={`Choose ${selectedSlot.line}: ${selectedSlot.label}`} onClose={() => setSelectedSlot(null)}>
            <div className="max-h-[520px] overflow-auto pr-2">
              {activeSquad
                .filter((p) => p.registered && isEligibleForSlot(p, selectedSlot))
                .sort((a, b) => b.rating - a.rating)
                .map((p) => {
                  const isAssignedElsewhere = assignedXi.includes(p.id) && slotAssignments[selectedSlot.id] !== p.id;
                  return (
                    <button
                      key={p.id}
                      disabled={isAssignedElsewhere}
                      className="mb-2 flex w-full items-center justify-between gap-3 rounded-lg border border-white/10 bg-black/30 p-3 text-left transition hover:border-barcaGold hover:bg-white/10 disabled:hover:border-white/10 disabled:hover:bg-black/30"
                      onClick={() => assignToSlot(p.id)}
                    >
                      <span>
                        <b>{p.name}</b>
                        <span className="block text-xs text-slate-400">{p.position} | {p.nationality} | wage {money(p.wage)}</span>
                      </span>
                      <span className="rounded-md bg-barcaGold px-2 py-1 text-sm font-black text-night">{isAssignedElsewhere ? "XI" : p.rating}</span>
                    </button>
                  );
                })}
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </main>
  );
}

function Screen({ children }: { children: React.ReactNode }) {
  return <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -18 }} transition={{ duration: .28 }}>{children}</motion.section>;
}

function Panel({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="glass rounded-lg p-4 shadow-glow sm:p-5">
      <div className="mb-4 flex items-center gap-2 text-lg font-black">{icon}<span>{title}</span></div>
      {children}
    </section>
  );
}

function Stat({ label, value, icon, danger }: { label: string; value: string; icon: React.ReactNode; danger?: boolean }) {
  return <div className={`rounded-lg border p-3 ${danger ? "border-red-400/40 bg-red-500/15" : "border-white/10 bg-white/5"}`}><div className="flex items-center gap-2 text-xs text-slate-400">{icon}{label}</div><div className="mt-1 font-black">{value}</div></div>;
}

function Info({ label, value, compact }: { label: string; value: string; compact?: boolean }) {
  return <div className={`rounded-lg border border-white/10 bg-white/[.045] ${compact ? "p-2" : "p-4"}`}><div className="text-[11px] uppercase tracking-[.18em] text-slate-500">{label}</div><div className="mt-1 font-black text-slate-100">{value}</div></div>;
}

function Meter({ label, value }: { label: string; value: number }) {
  return <div className="mb-4"><div className="mb-1 flex justify-between text-sm"><span>{label}</span><b>{value}%</b></div><div className="h-3 rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-barcaRed via-barcaBlue to-barcaGold" style={{ width: `${value}%` }} /></div></div>;
}

function PlayerTable({ players, actions }: { players: Player[]; actions: (p: Player) => React.ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[920px] border-separate border-spacing-y-2 text-left text-sm">
        <thead className="text-xs uppercase tracking-[.18em] text-slate-500"><tr>{["Player","Pos","Age","OVR","Wage","Value","Morale","Status","Action"].map((h) => <th key={h} className="px-3 py-2">{h}</th>)}</tr></thead>
        <tbody>{players.map((p) => <tr key={p.id} className="bg-white/[.045]"><td className="rounded-l-lg px-3 py-3 font-bold">{p.name}<div className="text-xs text-slate-500">{p.nationality}</div></td><td className="px-3">{p.position}</td><td className="px-3">{p.age}</td><td className="px-3 font-black text-barcaGold">{p.rating}</td><td className="px-3">{money(p.wage)}</td><td className="px-3">{money(p.value)}</td><td className="px-3">{p.morale}%</td><td className="px-3">{p.injury} | {p.registered ? "Reg" : "Blocked"}</td><td className="rounded-r-lg px-3">{actions(p)}</td></tr>)}</tbody>
      </table>
    </div>
  );
}

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <motion.div className="fixed inset-0 z-40 grid place-items-center bg-black/70 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div initial={{ scale: .94, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: .94, y: 16 }} className="glass w-[min(94vw,620px)] rounded-lg p-5 shadow-danger">
        <div className="mb-4 flex items-center justify-between gap-3"><h2 className="text-2xl font-black">{title}</h2><button className="rounded-md bg-white/10 p-2" onClick={onClose}><X className="h-5 w-5" /></button></div>
        {children}
      </motion.div>
    </motion.div>
  );
}

function Slider({ label, value, min, max, step, format, onChange }: { label: string; value: number; min: number; max: number; step: number; format?: (v: number) => string; onChange: (v: number) => void }) {
  return <label className="block"><div className="mb-2 flex justify-between text-sm"><span>{label}</span><b>{format ? format(value) : value}</b></div><input className="w-full" type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} /></label>;
}

function TrophyCase({ label, count, fresh }: { label: string; count: number; fresh: boolean }) {
  return (
    <motion.div animate={fresh ? { scale: [1, 1.05, 1], boxShadow: ["0 0 0 rgba(237,187,0,0)", "0 0 50px rgba(237,187,0,.35)", "0 0 0 rgba(237,187,0,0)"] } : {}} className="rounded-lg border border-barcaGold/25 bg-gradient-to-b from-white/[.08] to-black/30 p-6 text-center">
      <Sparkles className="mx-auto mb-3 h-8 w-8 text-barcaGold" />
      <div className="text-6xl font-black text-barcaGold">{count}</div>
      <div className="mt-2 font-bold">{label}</div>
      {fresh && <div className="mt-3 rounded-full bg-barcaGold px-3 py-1 text-xs font-black text-night">New trophy added</div>}
    </motion.div>
  );
}
