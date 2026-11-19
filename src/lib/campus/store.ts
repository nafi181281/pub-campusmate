import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { SEED_LOST_FOUND, TEACHERS, makeSeedRoutine, type Availability, type LostItem, type Offering } from "./data";

export type Role = "student" | "faculty" | "advisor" | "coordinator";
export type RegStatus = "draft" | "pending" | "approved" | "rejected";

export type Registration = {
  offeringIds: string[];
  status: RegStatus;
  submittedAt?: string | undefined;
  decidedAt?: string | undefined;
  advisorComment?: string | undefined;
};

export type Petition = {
  id: string;
  studentId: string;
  kind: "add" | "drop";
  offeringId: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
  comment?: string;
  createdAt: string;
};

export type MakeupClass = {
  id: string;
  teacherId: string;
  offeringId: string;
  date: string;
  start: string;
  end: string;
  room: string;
  reason: string;
  createdAt: string;
};

export type AttendanceSession = {
  id: string;
  offeringId: string;
  teacherId: string;
  code: string;
  createdAt: number;
  expiresAt: number;
  checkins: { studentId: string; at: number }[];
};

export type Submission = { fileName: string; note: string; at: string };

export type ChatMessage = { id: string; role: "user" | "assistant"; text: string };

type State = {
  role: Role;
  studentId: string;
  teacherId: string;
  registrations: Record<string, Registration>;
  petitions: Petition[];
  availability: Record<string, Availability>;
  makeups: MakeupClass[];
  routineDraft: Offering[];
  published: Offering[];
  publishedAt: string | null;
  sessions: AttendanceSession[];
  submissions: Record<string, Submission>;
  lostFound: LostItem[];
  chat: ChatMessage[];
  chatLang: "auto" | "bn" | "en";
};

type Actions = {
  setRole: (role: Role) => void;
  setStudent: (id: string) => void;
  setTeacher: (id: string) => void;
  setSelection: (studentId: string, offeringIds: string[]) => void;
  submitRegistration: (studentId: string) => void;
  decideRegistration: (studentId: string, approve: boolean, comment: string) => void;
  addPetition: (p: Omit<Petition, "id" | "status" | "createdAt">) => void;
  decidePetition: (id: string, approve: boolean, comment: string) => void;
  setAvailability: (teacherId: string, av: Availability) => void;
  addMakeup: (m: Omit<MakeupClass, "id" | "createdAt">) => void;
  removeMakeup: (id: string) => void;
  updateDraft: (offerings: Offering[]) => void;
  publishRoutine: () => void;
  resetDraft: () => void;
  startSession: (offeringId: string, teacherId: string, seconds: number) => AttendanceSession;
  endSession: (id: string) => void;
  checkIn: (code: string, studentId: string) => { ok: boolean; message: string };
  submitAssignment: (studentId: string, assignmentId: string, s: Submission) => void;
  addLost: (item: Omit<LostItem, "id" | "resolved">) => void;
  toggleResolved: (id: string) => void;
  setChat: (messages: ChatMessage[]) => void;
  setChatLang: (lang: State["chatLang"]) => void;
  resetDemo: () => void;
};

const uid = () => crypto.randomUUID();

function initialState(): State {
  return {
    role: "student",
    studentId: "210101",
    teacherId: "habib",
    registrations: {},
    petitions: [],
    availability: Object.fromEntries(TEACHERS.map((t) => [t.id, t.availability])),
    makeups: [],
    routineDraft: makeSeedRoutine(),
    published: makeSeedRoutine(),
    publishedAt: "2026-11-14T09:00:00.000Z",
    sessions: [],
    submissions: {},
    lostFound: SEED_LOST_FOUND,
    chat: [],
    chatLang: "auto",
  };
}

export const useCampus = create<State & Actions>()(
  persist(
    (set, get) => ({
      ...initialState(),
      setRole: (role) => set({ role }),
      setStudent: (studentId) => set({ studentId, role: "student" }),
      setTeacher: (teacherId) => set({ teacherId, role: "faculty" }),
      setSelection: (studentId, offeringIds) =>
        set((s) => ({
          registrations: {
            ...s.registrations,
            [studentId]: { ...s.registrations[studentId], offeringIds, status: s.registrations[studentId]?.status === "rejected" ? "rejected" : "draft" },
          },
        })),
      submitRegistration: (studentId) =>
        set((s) => ({
          registrations: {
            ...s.registrations,
            [studentId]: { offeringIds: [], ...s.registrations[studentId], status: "pending", submittedAt: new Date().toISOString(), advisorComment: undefined, decidedAt: undefined },
          },
        })),
      decideRegistration: (studentId, approve, comment) =>
        set((s) => ({
          registrations: {
            ...s.registrations,
            [studentId]: { offeringIds: [], ...s.registrations[studentId], status: approve ? "approved" : "rejected", advisorComment: comment, decidedAt: new Date().toISOString() },
          },
        })),
      addPetition: (p) => set((s) => ({ petitions: [{ ...p, id: uid(), status: "pending", createdAt: new Date().toISOString() }, ...s.petitions] })),
      decidePetition: (id, approve, comment) => {
        const p = get().petitions.find((x) => x.id === id);
        if (!p) return;
        set((s) => {
          const reg = s.registrations[p.studentId];
          let registrations = s.registrations;
          if (approve && reg) {
            const ids = p.kind === "drop" ? reg.offeringIds.filter((x) => x !== p.offeringId) : [...reg.offeringIds, p.offeringId];
            registrations = { ...s.registrations, [p.studentId]: { ...reg, offeringIds: ids } };
          }
          return { registrations, petitions: s.petitions.map((x) => (x.id === id ? { ...x, status: approve ? "approved" : "rejected", comment } : x)) };
        });
      },
      setAvailability: (teacherId, av) => set((s) => ({ availability: { ...s.availability, [teacherId]: av } })),
      addMakeup: (m) => set((s) => ({ makeups: [{ ...m, id: uid(), createdAt: new Date().toISOString() }, ...s.makeups] })),
      removeMakeup: (id) => set((s) => ({ makeups: s.makeups.filter((m) => m.id !== id) })),
      updateDraft: (routineDraft) => set({ routineDraft }),
      publishRoutine: () => set((s) => ({ published: s.routineDraft, publishedAt: new Date().toISOString() })),
      resetDraft: () => set((s) => ({ routineDraft: s.published })),
      startSession: (offeringId, teacherId, seconds) => {
        const now = Date.now();
        const session: AttendanceSession = {
          id: uid(),
          offeringId,
          teacherId,
          code: Math.random().toString(36).slice(2, 8).toUpperCase(),
          createdAt: now,
          expiresAt: now + seconds * 1000,
          checkins: [],
        };
        set((s) => ({ sessions: [session, ...s.sessions].slice(0, 20) }));
        return session;
      },
      endSession: (id) => set((s) => ({ sessions: s.sessions.map((x) => (x.id === id ? { ...x, expiresAt: Math.min(x.expiresAt, Date.now()) } : x)) })),
      checkIn: (code, studentId) => {
        const clean = code.trim().toUpperCase().replace(/^PUB-ATT:/, "");
        const session = get().sessions.find((x) => x.code === clean);
        if (!session) return { ok: false, message: "Invalid code — no attendance session found." };
        if (Date.now() > session.expiresAt) return { ok: false, message: "This QR code has expired. Ask your teacher to generate a new one." };
        if (session.checkins.some((c) => c.studentId === studentId)) return { ok: true, message: "You are already marked present for this session." };
        set((s) => ({ sessions: s.sessions.map((x) => (x.id === session.id ? { ...x, checkins: [...x.checkins, { studentId, at: Date.now() }] } : x)) }));
        return { ok: true, message: "Checked in — you are marked present." };
      },
      submitAssignment: (studentId, assignmentId, sub) => set((s) => ({ submissions: { ...s.submissions, [`${studentId}:${assignmentId}`]: sub } })),
      addLost: (item) => set((s) => ({ lostFound: [{ ...item, id: uid(), resolved: false }, ...s.lostFound] })),
      toggleResolved: (id) => set((s) => ({ lostFound: s.lostFound.map((x) => (x.id === id ? { ...x, resolved: !x.resolved } : x)) })),
      setChat: (chat) => set({ chat }),
      setChatLang: (chatLang) => set({ chatLang }),
      resetDemo: () => set({ ...initialState(), role: get().role, studentId: get().studentId, teacherId: get().teacherId }),
    }),
    {
      name: "pub-campusmate-v1",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
    },
  ),
);

