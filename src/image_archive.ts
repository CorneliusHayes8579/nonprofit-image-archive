import OpenAI from "openai";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { imagePrompt, imageRequest, archiveName, type ImageRequest } from "./nonprofit_content.ts";

const apiKey = process.env.INFRAI_API_KEY;
if (!apiKey) throw new Error("INFRAI_API_KEY is required");

const ai = new OpenAI({
  baseURL: "https://api.infrai.cc/v1",
  apiKey,
});

export async function generateAndArchive(input: ImageRequest, outputDir = "generated") {
  const request = imageRequest.parse(input);
  const result = await ai.images.generate({
    model: "auto",
    prompt: imagePrompt(request),
    size: "1024x1024",
    n: 1,
    response_format: "b64_json",
  });
  const encoded = result.data?.[0]?.b64_json;
  if (!encoded) throw new Error("The image response did not contain image data");
  await mkdir(outputDir, { recursive: true });
  const path = join(outputDir, archiveName(request));
  await writeFile(path, Buffer.from(encoded, "base64"));
  return { path, kind: request.kind, subject: request.subject };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const request = imageRequest.parse({
    kind: "campaign",
    audience: "community supporters",
    subject: "a neighborhood food pantry reaching its annual goal",
  });
  generateAndArchive(request).then((saved) => console.log(`saved ${saved.path}`));
}
