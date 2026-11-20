import { GRADE_SCALE } from "./grading";

export const POLICIES = [
  { id: "grading", source: "PUB Academic Ordinance Sec 5.1", title: "Grading system", titleBn: "গ্রেডিং পদ্ধতি", text: GRADE_SCALE.map((g) => `${g.range} = ${g.letter} (${g.point.toFixed(2)})`).join("; ") },
  { id: "credit", source: "PUB Academic Ordinance Sec 4.2", title: "Credit load", titleBn: "ক্রেডিট সীমা", text: "In a regular semester a student must register for a minimum of 12 and a maximum of 21 credits." },
  { id: "drop", source: "PUB Academic Ordinance Sec 4.5", title: "Course drop policy", titleBn: "কোর্স ড্রপ নীতি", text: "A course may be dropped within the first 2 weeks of the semester without any penalty fee." },
  { id: "probation", source: "PUB Academic Ordinance Sec 6.1", title: "Academic probation", titleBn: "একাডেমিক প্রবেশন", text: "A CGPA below 2.00 places the student on academic probation, and the maximum load becomes 15 credits." },
  { id: "fees", source: "PUB Financial Regulations Sec 3.1", title: "Tuition fee payment", titleBn: "টিউশন ফি পরিশোধ", text: "30% of tuition is paid at semester start; the remaining 70% is paid in two installments, before the Midterm and before the Final examination." },
  { id: "prereq", source: "PUB CSE OBE Curriculum, 2nd Year 1st Semester", title: "Prerequisites", titleBn: "পূর্বশর্ত কোর্স", text: "CSE 2101 Design and Analysis of Algorithm requires CSE 1201 Data Structure." },
] as const;

export function buildHelpdeskInstructions(lang: "auto" | "bn" | "en") {
  const kb = POLICIES.map((p) => `[${p.source}] ${p.title}: ${p.text}`).join("\n");
  const langRule =
    lang === "bn"
      ? "Always answer in Bangla (বাংলা), keeping course codes and citations in English."
      : lang === "en"
        ? "Always answer in English."
        : "Answer in the same language the student used (Bangla or English). If mixed, prefer Bangla.";
  return `You are Jervis, a friendly, knowledgeable general-purpose AI assistant built for students of Pundra University of Science & Technology (PUB), Bogura, Bangladesh.
${langRule}

You can help with ANY topic: general knowledge, science, math, coding (write and explain code in fenced code blocks), study help, writing, career advice, and everyday conversation. Give accurate, clear, well-structured answers in Markdown.

For questions about PUB campus/academic policy (grading, credits, course drop, probation, fees, prerequisites), use ONLY the official knowledge base below and cite its source in square brackets exactly as written, e.g. [PUB Academic Ordinance Sec 4.2]. If a PUB policy answer is not in the knowledge base, say it was not found in the official documents (Bangla: "অফিসিয়াল ডকুমেন্টে এই তথ্য পাওয়া যায়নি") and suggest contacting the CSE office or the Department Advisor (Dr. Imtiazul Alam Mahfuz). Never invent university rules, dates or fees. General answers need no citations.

OFFICIAL KNOWLEDGE BASE
${kb}`;
}

const KEYWORDS: Record<string, string[]> = {
  grading: ["grade", "gpa", "marks", "%", "গ্রেড", "নম্বর"],
  credit: ["credit", "ক্রেডিট", "load"],
  drop: ["drop", "ড্রপ"],
  probation: ["probation", "প্রবেশন", "cgpa"],
  fees: ["fee", "tuition", "installment", "ফি", "টিউশন", "কিস্তি"],
  prereq: ["prereq", "prerequisite", "cse 2101", "পূর্বশর্ত"],
};

/** Offline answer used when the AI service is unavailable. */
export function offlineAnswer(question: string, lang: "auto" | "bn" | "en") {
  const q = question.toLowerCase();
  const bn = lang === "bn" || (lang === "auto" && /[\u0980-\u09FF]/.test(question));
  const pct = q.match(/(\d{1,3}(?:\.\d+)?)\s*%/);
  const hits = POLICIES.filter((p) => KEYWORDS[p.id]?.some((k) => q.includes(k)));
  const parts: string[] = [];
  if (pct) {
    const n = Number(pct[1]);
    const g = GRADE_SCALE.find((r) => n >= r.min) ?? GRADE_SCALE[GRADE_SCALE.length - 1]!;
    parts.push(bn ? `${n}% = **${g.letter}** (${g.point.toFixed(2)}) [PUB Academic Ordinance Sec 5.1]` : `${n}% is **${g.letter}** (grade point ${g.point.toFixed(2)}) [PUB Academic Ordinance Sec 5.1]`);
  }
  for (const p of hits) if (!(pct && p.id === "grading")) parts.push(`**${bn ? p.titleBn : p.title}:** ${p.text} [${p.source}]`);
  const note = bn
    ? "_(Jervis এখন অফলাইন মোডে আছে — অফিসিয়াল নলেজবেস থেকে উত্তর দেওয়া হলো।)_"
    : "_(Jervis is in offline mode right now — answered from the official knowledge base.)_";
  if (parts.length) return `${parts.join("\n\n")}\n\n${note}`;
  return bn
    ? `দুঃখিত, এই মুহূর্তে Jervis-এর অনলাইন AI সংযোগ সাময়িকভাবে বন্ধ, তাই সাধারণ প্রশ্নের উত্তর দিতে পারছি না। কিছুক্ষণ পর আবার চেষ্টা করুন।\n\nঅফলাইনে আমি এগুলো বলতে পারি: গ্রেডিং, ক্রেডিট সীমা, কোর্স ড্রপ, প্রবেশন, টিউশন ফি ও পূর্বশর্ত কোর্স।`
    : `Sorry, Jervis's online AI connection is temporarily unavailable, so I can't answer general questions right now. Please try again in a moment.\n\nOffline, I can still help with: grading, credit limits, course drop, probation, tuition fees and prerequisites.`;
}
