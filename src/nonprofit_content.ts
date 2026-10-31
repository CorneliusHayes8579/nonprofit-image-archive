import { z } from "zod";

export const imageRequest = z.object({
  kind: z.enum(["receipt", "reminder", "campaign"]),
  audience: z.string().min(1),
  subject: z.string().min(1),
});

export type ImageRequest = z.infer<typeof imageRequest>;

const direction: Record<ImageRequest["kind"], string> = {
  receipt: "a warm, clear thank-you illustration for a donor receipt",
  reminder: "an encouraging, accessible illustration for a volunteer reminder",
  campaign: "an editorial campaign-report illustration that makes progress easy to understand",
};

export function imagePrompt(input: ImageRequest): string {
  const request = imageRequest.parse(input);
  return `${direction[request.kind]}; subject: ${request.subject}; audience: ${request.audience}; nonprofit communications, inclusive people, no text in the image`;
}

export function archiveName(input: ImageRequest): string {
  const request = imageRequest.parse(input);
  const safe = request.subject.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return `${request.kind}-${safe || "image"}.png`;
}
