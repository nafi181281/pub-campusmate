import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { buildHelpdeskInstructions, offlineAnswer } from "@/lib/campus/knowledge";

const Body = z.object({
  lang: z.enum(["auto", "bn", "en"]).default("auto"),
  messages: z
    .array(z.object({ role: z.enum(["user", "assistant"]), text: z.string().min(1).max(4000) }))
    .min(1)
    .max(40),
});

export const Route = createFileRoute("/api/helpdesk")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const parsed = Body.safeParse(await request.json().catch(() => null));
        if (!parsed.success) return Response.json({ error: "Invalid request" }, { status: 400 });
        const { lang, messages } = parsed.data;

        const { streamResponse, GatewayError, PaymentRequiredError, RateLimitError } = await import("@lovable.dev/ai-gateway");
        let stream;
        try {
          stream = await streamResponse(
            {
              model: "openai/gpt-6-astra",
              instructions: buildHelpdeskInstructions(lang),
              input: messages.map((m) => ({ role: m.role, content: m.text })),
              reasoning: { effort: "low" },
            },
            { signal: request.signal },
          );
        } catch (err) {
          console.error("helpdesk gateway error", err);
          const last = messages[messages.length - 1]?.text ?? "";
          return new Response(offlineAnswer(last, lang), { headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-cache", "x-jervis-mode": "offline" } });
        }

        const encoder = new TextEncoder();
        const body = new ReadableStream<Uint8Array>({
          async start(controller) {
            try {
              for await (const event of stream) {
                if (event.type === "response.output_text.delta") controller.enqueue(encoder.encode(event.delta));
              }
            } catch (err) {
              console.error("helpdesk stream error", err);
              controller.enqueue(encoder.encode("\n\n_(The answer was interrupted. Please ask again.)_"));
            } finally {
              controller.close();
            }
          },
        });
        return new Response(body, { headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-cache" } });
      },
    },
  },
});
