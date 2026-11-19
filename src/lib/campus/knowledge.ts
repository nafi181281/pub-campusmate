import { GRADE_SCALE } from "./grading";

export const POLICIES = [
  { id: "grading", source: "PUB Academic Ordinance Sec 5.1", title: "Grading system", titleBn: "গ্রেডিং পদ্ধতি", text: GRADE_SCALE.map((g) => `${g.range} = ${g.letter} (${g.point.toFixed(2)})`).join("; ") },
  { id: "credit", source: "PUB Academic Ordinance Sec 4.2", title: "Credit load", titleBn: "ক্রেডিট সীমা", text: "In a regular semester a student must register for a minimum of 12 and a maximum of 21 credits." },
  { id: "drop", source: "PUB Academic Ordinance Sec 4.5", title: "Course drop policy", titleBn: "কোর্স ড্রপ নীতি", text: "A course may be dropped within the first 2 weeks of the semester without any penalty fee." },
  { id: "probation", source: "PUB Academic Ordinance Sec 6.1", title: "Academic probation", titleBn: "একাডেমিক প্রবেশন", text: "A CGPA below 2.00 places the student on academic probation, and the maximum load becomes 15 credits." },
  { id: "fees", source: "PUB Financial Regulations Sec 3.1", title: "Tuition fee payment", titleBn: "টিউশন ফি পরিশোধ", text: "30% of tuition is paid at semester start; the remaining 70% is paid in two installments, before the Midterm and before the Final examination." },
  { id: "prereq", source: "PUB CSE OBE Curriculum, 2nd Year 1st Semester", title: "Prerequisites", titleBn: "পূর্বশর্ত কোর্স", text: "CSE 2101 Design and Analysis of Algorithms requires CSE 1201 Data Structures. CSE 2103 Database Management Systems requires CSE 1101 Structured Programming." },
] as const;

export function buildHelpdeskInstructions(lang: "auto" | "bn" | "en") {
  const kb = POLICIES.map((p) => `[${p.source}] ${p.title}: ${p.text}`).join("\n");
  const langRule =
    lang === "bn"
      ? "Always answer in Bangla (বাংলা), keeping course codes and citations in English."
      : lang === "en"
        ? "Always answer in English."
        : "Answer in the same language the student used (Bangla or English). If mixed, prefer Bangla.";
  return `You are CampusMate Helpdesk, the official academic assistant of Pundra University of Science & Technology (PUB), Bogura, Bangladesh.
${langRule}

Use ONLY the official knowledge base below for policy facts. After every policy fact, cite its source in square brackets exactly as written, e.g. [PUB Academic Ordinance Sec 4.2].
If the question is about PUB policy and the answer is not in the knowledge base, say clearly that the information was not found in the official documents (Bangla: "অফিসিয়াল ডকুমেন্টে এই তথ্য পাওয়া যায়নি") and suggest contacting the CSE office or the Department Advisor (Dr. Imtiazul Alam Mahfuz).
You may help with general study questions (e.g. explaining algorithms or databases) without citations, but never invent university rules, dates or fees.
Keep answers concise and well formatted in Markdown; use short tables for grading questions.

OFFICIAL KNOWLEDGE BASE
${kb}`;
}
