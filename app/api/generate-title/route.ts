import { OpenAI } from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
	try {
		const { script } = await request.json();

		const prompt = `Generate a concise, neutral title for this audio ad script. The title should be brief (max 50 characters) and capture the essence of the ad. This title will be used to identify the ad in the database. Your output must not have any special characters, quotation marks or markdown formatting. Here's the script:\n\n${script.lines
			.map((line: { line: any }) => line.line)
			.join("\n")}`;

		const completion = await openai.chat.completions.create({
			messages: [{ role: "user", content: prompt }],
			model: "gpt-4o-mini",
			temperature: 0.7,
			max_tokens: 50,
		});

		const title = completion.choices[0].message.content?.trim();

		return NextResponse.json({ title });
	} catch (error) {
		console.error("Error generating title:", error);
		return NextResponse.json(
			{ error: "Failed to generate title" },
			{ status: 500 }
		);
	}
}
