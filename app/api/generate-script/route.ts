import { OpenAI } from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { duration, speakers, prompt } = await request.json();

    const systemPrompt = `You are an expert ad script writer. Create a script for a ${duration}-second advertisement with ${
      speakers.length
    } speaker(s).
    
Speaker details:
${speakers.map((s: any) => `- ${s.name} (Voice: ${s.voice})`).join("\n")}

Format the script with speaker names followed by their lines. Keep the total duration in mind - each line should take roughly 3-4 seconds to speak.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
    });

    return NextResponse.json({
      script: completion.choices[0].message.content,
    });
  } catch (error) {
    console.error("Script generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate script" },
      { status: 500 }
    );
  }
}
