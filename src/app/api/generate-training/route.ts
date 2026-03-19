import { NextRequest, NextResponse } from "next/server";
import { OpenAI } from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";
const pdfParse = require("pdf-parse");

// Define the structured output schema
const TrainingSchema = z.object({
  summary: z.string().describe("A 1 paragraph summary of the SOP."),
  steps: z.array(z.string()).describe("A list of step-by-step instructions."),
  quiz: z.array(
    z.object({
      question: z.string(),
      options: z.array(z.string()).describe("Exactly 4 options: A, B, C, and D"),
      correct_answer: z.string().describe("The exact text of the correct option"),
      explanation: z.string().describe("Explanation for why the answer is correct"),
    })
  ).describe("3-5 multiple-choice questions based on the SOP."),
});

export async function POST(req: NextRequest) {
  // Initialize OpenAI client inside the handler to prevent build-time errors
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Parse PDF
    let pdfText = "";
    try {
      const parsed = await pdfParse(buffer);
      pdfText = parsed.text;
    } catch (e) {
      console.error("PDF parsing error:", e);
      return NextResponse.json({ error: "Failed to parse PDF" }, { status: 500 });
    }

    if (!pdfText.trim()) {
      return NextResponse.json({ error: "No text found in PDF" }, { status: 400 });
    }

    // Call OpenAI Structured Output
    try {
      // @ts-ignore
      const completion = await openai.beta.chat.completions.parse({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are an AI SOP Tutor. Analyze the provided SOP, summarize it, extract step-by-step instructions, and generate a 3-5 question multiple-choice quiz based ONLY on the SOP content.",
          },
          {
            role: "user",
            content: `Here is the SOP content:\n\n${pdfText}`,
          },
        ],
        response_format: zodResponseFormat(TrainingSchema, "training_schema"),
      });

      const parsedData = completion.choices[0].message.parsed;
      return NextResponse.json({ success: true, data: parsedData });
    } catch (e) {
      console.error("OpenAI error:", e);
      return NextResponse.json({ error: "Failed to generate training materials" }, { status: 500 });
    }
  } catch (error) {
    console.error("General error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
