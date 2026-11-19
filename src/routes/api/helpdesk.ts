import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { buildHelpdeskInstructions } from "@/lib/campus/knowledge";

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
          if (err instanceof PaymentRequiredError) return Response.json({ error: "The helpdesk is out of AI credits right now. Please try again later." }, { status: 402 });
          if (err instanceof RateLimitError) return Response.json({ error: "The helpdesk is busy. Please wait a moment and try again." }, { status: 429 });
          if (err instanceof GatewayError) return Response.json({ error: "The helpdesk could not answer right now. Please try again." }, { status: 502 });
          return Response.json({ error: "Unexpected helpdesk error." }, { status: 500 });
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
