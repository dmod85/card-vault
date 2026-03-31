import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const image = formData.get("image") as File;
    
    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    
    // Fallback: If no API key is set, use mock data
    if (!apiKey) {
      console.log("No Gemini API key found, using mock data...");
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 2000));
      return NextResponse.json({
        player_name: "Mock Player",
        year: 2023,
        brand: "Panini Prizm",
        set_name: "Base",
        card_number: "1",
        sport: "Basketball",
        is_rookie: true,
        notes: "Mocked from missing API key."
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Convert File to GenerativePart
    const arrayBuffer = await image.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    const imagePart = {
      inlineData: {
        data: buffer.toString("base64"),
        mimeType: image.type
      }
    };

    const prompt = `
      You are a world-class sports trading card expert with encyclopedic knowledge of every card set ever produced.
      Carefully analyze this trading card image and identify it as precisely as possible.

      IDENTIFYING THE YEAR:
      The year may not be printed on the front. Use your deep knowledge of card design history to identify it:
      - Recognize the specific border design, color scheme, font style, and layout — each year/set has a unique look
      - Identify the brand's design language for that era (e.g., 1989 Topps has a distinctive border, 2011 Topps has a specific photo frame style)
      - Cross-reference the player name, team uniform/jersey style, and card design to narrow down the exact year
      - If a copyright year IS visible anywhere, use that
      - Provide your best confident estimate based on design recognition — do not return null unless you truly cannot identify the card at all

      Return ONLY a raw JSON object (no markdown, no code fences, no extra text) with these exact keys:
      - "player_name" (String: Full name as printed on card)
      - "year" (Integer: Your best determination of the card year using design knowledge and any visible text)
      - "brand" (String: e.g., Topps, Panini, Upper Deck, Fleer, Bowman, Donruss, Score, Pacific)
      - "set_name" (String: The specific set name, e.g., "Topps Chrome", "Prizm", "Heritage", "Stadium Club")
      - "card_number" (String: Card number as printed, or null if not visible)
      - "sport" (String: Baseball, Basketball, Football, Hockey, Soccer, or Other)
      - "is_rookie" (Boolean: true only if RC designation or "Rookie Card" is printed on the card)
      - "notes" (String: Notable features like Refractor, Holo, Parallel, Auto, Numbered /99, Graded, Error card, Short Print, etc. Also note your confidence in the year if estimated by design.)
    `;

    const result = await model.generateContent([prompt, imagePart]);
    const text = result.response.text();
    
    try {
      // Clean up markdown formatting if the model still returns it
      const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsedData = JSON.parse(cleanText);
      return NextResponse.json(parsedData);
    } catch (e) {
      console.error("Failed to parse Gemini output:", text);
      return NextResponse.json({ error: "AI failed to format response correctly" }, { status: 500 });
    }

  } catch (error: any) {
    console.error("API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
