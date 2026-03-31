import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ setId: string }> }
) {
  const { setId } = await params;

  try {
    const dataPath = path.join(process.cwd(), 'src', 'data', 'sets', `${setId}.json`);
    const fileContents = await fs.readFile(dataPath, 'utf8');
    const data = JSON.parse(fileContents);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error reading set data:", error);
    return NextResponse.json(
      { error: "Checklist set not found" },
      { status: 404 }
    );
  }
}
