// Script to generate the Celebration base set from the existing regular base set
const fs = require('fs');
const path = require('path');

const baseSetPath = path.join(__dirname, '..', 'src', 'data', 'sets', '2026-topps-series-1.json');
const baseSet = JSON.parse(fs.readFileSync(baseSetPath, 'utf8'));

// The Celebration Mega Box base set has the same 350 cards but different parallels
const celebrationBase = {
  id: "2026-topps-series-1-celebration",
  name: "2026 Topps Series 1 Baseball - Celebration Mega Box",
  year: 2026,
  brand: "Topps",
  sport: "Baseball",
  baseParallels: [
    { id: "base", name: "Base", odds: "1:1" },
    { id: "confetti", name: "Confetti", odds: "1:2 packs" },
    { id: "opening-day-foil", name: "Opening Day Foil", odds: "1:16" },
    { id: "confetti-pink", name: "Confetti Pink", odds: "1:108" },
    { id: "confetti-lime-green", name: "Confetti Lime Green", odds: "1:215" }
  ],
  cards: baseSet.cards.map(card => ({
    id: card.id.replace('2026-t1-', 'cel-base-'),
    cardNumber: card.cardNumber,
    playerName: card.playerName,
    team: card.team,
    rarity: "Base",
    setId: "2026-topps-series-1-celebration",
    sport: "Baseball"
  }))
};

const outPath = path.join(__dirname, '..', 'src', 'data', 'sets', '2026-topps-series-1-celebration.json');
fs.writeFileSync(outPath, JSON.stringify(celebrationBase, null, 2));
console.log(`Written ${celebrationBase.cards.length} cards to ${outPath}`);
