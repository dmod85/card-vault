import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET() {
  try {
    const dataDir = path.join(process.cwd(), 'src', 'data', 'sets');
    const files = await fs.readdir(dataDir);
    
    const sets = [];
    
    for (const file of files) {
      if (file.endsWith('.json')) {
        const fileContents = await fs.readFile(path.join(dataDir, file), 'utf8');
        const data = JSON.parse(fileContents);
        
        // We only return metadata for the index, not the entire heavy cards array
        sets.push({
          id: data.id,
          name: data.name,
          year: data.year,
          sport: data.sport,
          brand: data.brand,
          totalCards: data.cards?.length || 0,
        });
      }
    }
    
    // Sort: master sets first (regular, then celebration), then alphabetical for inserts
    const MASTER_ORDER = ["2026-topps-series-1", "2026-topps-series-1-celebration"];
    sets.sort((a, b) => {
      const aIdx = MASTER_ORDER.indexOf(a.id);
      const bIdx = MASTER_ORDER.indexOf(b.id);
      if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
      if (aIdx !== -1) return -1;
      if (bIdx !== -1) return 1;
      return a.name.localeCompare(b.name);
    });

    return NextResponse.json(sets);
  } catch (error) {
    console.error("Error reading sets:", error);
    return NextResponse.json(
      { error: "Failed to load available sets" },
      { status: 500 }
    );
  }
}
