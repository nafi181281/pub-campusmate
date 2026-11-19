import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { buildHelpdeskInstructions, POLICIES } from "@/lib/campus/knowledge";
import { gradeFor } from "@/lib/campus/grading";

const Body = z.object({
  lang: z.enum(["auto", "bn", "en"]).default("auto"),
  messages: z
    .array(z.object({ role: z.enum(["user", "assistant"]), text: z.string().min(1).max(4000) }))
    .min(1)
    .max(40),
});

function getLocalFallbackAnswer(query: string, lang: "auto" | "bn" | "en"): string {
  const q = query.toLowerCase();
  const isBn = lang === "bn" || /[\u0980-\u09FF]/.test(query);

  const numMatch = query.match(/(\d{1,3})\s*%/);
  if (numMatch) {
    const mark = parseInt(numMatch[1], 10);
    const g = gradeFor(mark);
    if (g) {
      if (isBn) {
        return `**${mark}%** নম্বরের জন্য গ্রেড হলো **${g.letter}** (গ্রেড পয়েন্ট: **${g.point.toFixed(2)}**)।\n\n[PUB Academic Ordinance Sec 5.1]`;
      }
      return `For **${mark}%**, the grade is **${g.letter}** (Grade Point: **${g.point.toFixed(2)}**).\n\n[PUB Academic Ordinance Sec 5.1]`;
    }
  }

  if (q.includes("probation") || q.includes("প্রবেশন")) {
    const p = POLICIES.find((x) => x.id === "probation");
    return `${isBn ? "একাডেমিক প্রবেশন নীতি:" : "Academic Probation Policy:"}\n\n${p?.text}\n\n[${p?.source}]`;
  }

  if (q.includes("credit") || q.includes("ক্রেডিট")) {
    const p = POLICIES.find((x) => x.id === "credit");
    return `${isBn ? "ক্রেডিট সীমা:" : "Credit Load Policy:"}\n\n${p?.text}\n\n[${p?.source}]`;
  }

  if (q.includes("drop") || q.includes("ড্রপ")) {
    const p = POLICIES.find((x) => x.id === "drop");
    return `${isBn ? "কোর্স ড্রপ করার নিয়ম:" : "Course Drop Policy:"}\n\n${p?.text}\n\n[${p?.source}]`;
  }

  if (q.includes("fee") || q.includes("tuition") || q.includes("ফি") || q.includes("টাকা")) {
    const p = POLICIES.find((x) => x.id === "fees");
    return `${isBn ? "টিউশন ফি পরিশোধের নিয়ম:" : "Tuition Fee Payment:"}\n\n${p?.text}\n\n[${p?.source}]`;
  }

  if (q.includes("prereq") || q.includes("পূর্বশর্ত") || q.includes("2101") || q.includes("1201")) {
    const p = POLICIES.find((x) => x.id === "prereq");
    return `${isBn ? "কোর্স পূর্বশর্ত (Prerequisites):" : "Course Prerequisites:"}\n\n${p?.text}\n\n[${p?.source}]`;
  }

  if (isBn) {
    return `আমি **Jervis**, পুণ্ড্র ইউনিভার্সিটি অব সায়েন্স অ্যান্ড টেকনোলজির (PUB) অফিসিয়াল একাডেমিক অ্যাসিস্ট্যান্ট।\n\nআপনি গ্রেডিং স্কেল, ক্রেডিট লিমিট, কোর্স রেজিস্ট্রেশন, ড্রপ পলিসি বা টিউশন ফি নিয়ে যেকোনো প্রশ্ন করতে পারেন। অফিসিয়াল তথ্যের বাইরে কোনো বিষয়ে সহযোগিতার জন্য ডিপার্টমেন্ট অ্যাডভাইজার বা সিএসই অফিসে যোগাযোগের পরামর্শ দেওয়া হচ্ছে।`;
  }
  return `I am **Jervis**, the official academic assistant for Pundra University of Science & Technology (PUB).\n\nYou can ask me about grading scales, credit limits, course registration, drop policies, or tuition fee rules with official citations. For unlisted departmental inquiries, please contact the CSE Department Office.`;
}

export const Route = createFileRoute("/api/helpdesk")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const parsed = Body.safeParse(await request.json().catch(() => null));
        if (!parsed.success) return Response.json({ error: "Invalid request" }, { status: 400 });
        const { lang, messages } = parsed.data;

        let stream;
        try {
          const { streamResponse } = await import("@lovable.dev/ai-gateway");
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
          console.warn("AI gateway unreachable or offline, using robust local knowledge fallback:", err);
          const lastUserMessage = messages.filter((m) => m.role === "user").pop()?.text || "";
          const fallbackText = getLocalFallbackAnswer(lastUserMessage, lang);
          return new Response(fallbackText, {
            headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-cache" },
          });
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
