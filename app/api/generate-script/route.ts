import { OpenAI } from "openai";
import { NextResponse } from "next/server";
import { Script } from "@/components/recording/models";
import { zodResponseFormat } from "openai/helpers/zod.mjs";

export async function POST(request: Request) {
	try {
		const { prompt, duration, speakers } = await request.json();

		const openai = new OpenAI({
			apiKey: process.env.OPENAI_API_KEY,
		});

		const systemPrompt = `You are an expert ad script writer. Create a script for a ${duration}-second advertisement with ${
			speakers.length
		} speaker(s).
    
Speaker details:
${speakers
	.map((speaker: any) => `- ${speaker.role} (Voice: ${speaker.voice})`)
	.join("\n")}

Important constraints:
- The script MUST NOT exceed ${duration * 2} words in total
- Each line should take roughly 3-4 seconds to speak
- Keep the total duration in mind (${duration} seconds)

Format the script with speaker names followed by their lines.`;

		const completion = await openai.chat.completions.create({
			messages: [
				{ role: "system", content: systemPrompt },
				{ role: "user", content: prompt },
			],
			model: "gpt-4o-mini",
			temperature: 0.7,
			response_format: zodResponseFormat(Script, "script"),
		});

		return NextResponse.json(
			JSON.parse(completion.choices[0].message.content || "{}")
		);
	} catch (error) {
		console.error("Error generating script:", error);
		return NextResponse.json(
			{ error: "Failed to generate script" },
			{ status: 500 }
		);
	}
}
