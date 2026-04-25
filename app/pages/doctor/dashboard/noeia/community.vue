<script setup lang="ts">
import {
  Search, ChevronDown, BadgeCheck, Users, FileText, File,
  ClipboardList, Star, ArrowUpDown, MapPin, Stethoscope, LayoutGrid,
  X, Plus, Link2, Mail, ArrowLeft, LayoutDashboard, ChevronRight, Check, Linkedin,
} from 'lucide-vue-next'

definePageMeta({ layout: 'dashboard' })

const route  = useRoute()
const router = useRouter()

// ── Types ──────────────────────────────────────────────────────────────────

type TemplateType = 'note' | 'document' | 'form'

interface CommunityTemplate {
  id: string
  name: string
  type: TemplateType
  author: {
    name: string
    specialty: string
    initials: string
    verified: boolean
    avatarColor: string
  }
  usageCount: number
  rating: number
  country: string
  specialty: string
  category: string
  lastEdited: string
  description: string
  tags: string[]
  exampleNote: string
  templateStructure: string
}

// ── Seed data ──────────────────────────────────────────────────────────────

const communityTemplates: CommunityTemplate[] = [
  {
    id: 'c1', name: 'SOAP Note — Psychiatry', type: 'note',
    author: { name: 'Dr. Sarah Chen', specialty: 'Psychiatry', initials: 'SC', verified: true, avatarColor: 'bg-violet-500' },
    usageCount: 14820, rating: 4.9, country: 'Australia', specialty: 'Psychiatry', category: 'Assessment',
    lastEdited: '12/01/2026',
    tags: ['Psychiatry', 'SOAP', 'Note'],
    description: 'A structured SOAP note template designed for psychiatric assessments. It covers all key clinical domains including subjective patient-reported symptoms, objective mental status findings, clinical assessment, and a detailed management plan. Ideal for both outpatient and inpatient psychiatric settings.',
    exampleNote: `SUBJECTIVE:\n- Patient reports persistent low mood over the past 3 weeks.\n- Reports early morning waking and loss of appetite.\n- Denies suicidal ideation. No recent substance use.\n\nOBJECTIVE:\n- Alert and oriented x3. Cooperative and calm.\n- Speech: Normal rate and volume. Mood: "Down". Affect: Congruent, reduced range.\n- Thought process: Linear and goal-directed.\n- No perceptual disturbances noted.\n\nASSESSMENT:\n- Major Depressive Episode, moderate severity (F32.1).\n- PHQ-9 score: 14 (moderate).\n\nPLAN:\n- Continue sertraline 50mg OD, review in 4 weeks.\n- Refer to CBT waitlist.\n- Safety plan reviewed and documented.`,
    templateStructure: `SUBJECTIVE:\n- Chief complaint:\n- History of presenting illness:\n- Current medications:\n- Reported symptoms:\n\nOBJECTIVE:\n- Mental status examination:\n- Vital signs (if relevant):\n- Risk assessment summary:\n\nASSESSMENT:\n- Primary diagnosis (ICD-10/DSM-5):\n- Formulation:\n- Severity rating:\n\nPLAN:\n- Pharmacological:\n- Psychological:\n- Follow-up:\n- Safety plan:`,
  },
  {
    id: 'c2', name: 'Cognitive Behavioural Therapy Session Notes', type: 'note',
    author: { name: 'Dr. James Whitfield', specialty: 'Clinical Psychology', initials: 'JW', verified: true, avatarColor: 'bg-sky-500' },
    usageCount: 11302, rating: 4.8, country: 'United Kingdom', specialty: 'Psychology', category: 'Therapy',
    lastEdited: '08/02/2026',
    tags: ['CBT', 'Psychology', 'Therapy'],
    description: 'A comprehensive CBT session note template that tracks the therapeutic alliance, session agenda, cognitive and behavioural interventions applied, homework assignments, and progress towards treatment goals. Designed for clinical psychologists and CBT practitioners working with anxiety, depression, and related conditions.',
    exampleNote: `SESSION AGENDA:\n- Review homework from last session\n- Work through automatic thought record\n- Introduce behavioural experiment\n\nSESSION CONTENT:\n- Patient completed thought diary for 3/7 days. Identified key NATs around work performance.\n- Explored evidence for/against core belief "I am incompetent".\n- Developed behavioural experiment: delegate one task this week and observe outcome.\n\nINTERVENTIONS USED:\n- Socratic questioning\n- Thought challenging / cognitive restructuring\n- Behavioural experiment design\n\nHOMEWORK SET:\n- Complete thought diary daily\n- Carry out behavioural experiment and record outcome\n- Read handout on cognitive distortions\n\nPROGRESS:\n- Symptom severity (GAD-7): 11 → 8 over 4 sessions. Good engagement.`,
    templateStructure: `SESSION AGENDA:\n-\n-\n\nSESSION CONTENT:\n- Homework review:\n- Main session content:\n- Key insights from session:\n\nINTERVENTIONS USED:\n-\n\nHOMEWORK SET:\n-\n\nPROGRESS:\n- Symptom rating (scale/tool):\n- Notes on therapeutic alliance:`,
  },
  {
    id: 'c3', name: 'Referral Letter — Specialist', type: 'document',
    author: { name: 'Dr. Ananya Patel', specialty: 'General Practice', initials: 'AP', verified: true, avatarColor: 'bg-emerald-500' },
    usageCount: 9870, rating: 4.7, country: 'Australia', specialty: 'General Practice', category: 'Letters',
    lastEdited: '05/01/2026',
    tags: ['Referral', 'Letter', 'GP'],
    description: 'A professional specialist referral letter template suitable for any clinical specialty. Covers presenting complaint, relevant history, investigations to date, current medications, and the specific clinical question being referred for. Formatted for clarity and completeness to facilitate efficient specialist triage.',
    exampleNote: `Dear Dr. [Specialist Name],\n\nRe: [Patient Name], DOB: [DD/MM/YYYY], Medicare: XXXXXXXX\n\nThank you for seeing this [age]-year-old [gender] who presents with a [duration] history of [presenting complaint].\n\nRELEVANT HISTORY:\n- [Relevant medical/psychiatric history]\n- Previous treatments tried: [list]\n\nCURRENT MEDICATIONS:\n- [Medication 1, dose, frequency]\n- [Medication 2, dose, frequency]\n\nINVESTIGATIONS:\n- [Recent bloods, imaging, other results]\n\nREFERRAL QUESTION:\nI would appreciate your assessment and management recommendations regarding [specific clinical question].\n\nKind regards,\n[Your Name]\n[Clinic details]`,
    templateStructure: `Dear Dr. [Specialist],\n\nRe: [Patient], DOB: , Medicare: \n\nREASON FOR REFERRAL:\n\nRELEVANT HISTORY:\n\nCURRENT MEDICATIONS:\n\nINVESTIGATIONS:\n\nREFERRAL QUESTION:\n\nKind regards,\n[Doctor Name]`,
  },
  {
    id: 'c4', name: 'PHQ-9 Depression Screening', type: 'form',
    author: { name: 'Dr. Michael Torres', specialty: 'Psychiatry', initials: 'MT', verified: false, avatarColor: 'bg-amber-500' },
    usageCount: 8450, rating: 4.6, country: 'United States', specialty: 'Psychiatry', category: 'Assessment',
    lastEdited: '22/01/2026',
    tags: ['PHQ-9', 'Depression', 'Screening'],
    description: 'A standardised PHQ-9 depression screening form with automatic severity scoring. Each of the 9 items maps to DSM-5 criteria for major depression. Includes scoring interpretation guide (minimal, mild, moderate, moderately severe, severe) and guidance on clinical thresholds for intervention.',
    exampleNote: `PHQ-9 PATIENT HEALTH QUESTIONNAIRE\n\nOver the last 2 weeks, how often have you been bothered by:\n\n1. Little interest or pleasure in doing things\n   ☐ Not at all (0)  ☐ Several days (1)  ☑ More than half (2)  ☐ Nearly every day (3)\n\n2. Feeling down, depressed, or hopeless\n   ☐ Not at all (0)  ☑ Several days (1)  ☐ More than half (2)  ☐ Nearly every day (3)\n\n3. Trouble falling/staying asleep, or sleeping too much\n   ☑ Not at all (0)  ☐ Several days (1)  ☐ More than half (2)  ☐ Nearly every day (3)\n\n[Items 4–9 continue...]\n\nTOTAL SCORE: 8 — MILD DEPRESSION\nRecommendation: Watchful waiting; repeat PHQ-9 in 2–4 weeks.`,
    templateStructure: `PHQ-9 SCREENING — [Patient Name] — [Date]\n\n1. Little interest or pleasure:  0 / 1 / 2 / 3\n2. Feeling down or hopeless:     0 / 1 / 2 / 3\n3. Sleep problems:               0 / 1 / 2 / 3\n4. Fatigue or low energy:        0 / 1 / 2 / 3\n5. Appetite changes:             0 / 1 / 2 / 3\n6. Negative feelings about self: 0 / 1 / 2 / 3\n7. Concentration problems:       0 / 1 / 2 / 3\n8. Psychomotor changes:          0 / 1 / 2 / 3\n9. Thoughts of self-harm:        0 / 1 / 2 / 3\n\nTOTAL: ____ / 27\nSeverity: Minimal (0–4) / Mild (5–9) / Moderate (10–14) / Moderately Severe (15–19) / Severe (20–27)`,
  },
  {
    id: 'c5', name: 'Intake Assessment — Mental Health', type: 'note',
    author: { name: 'Dr. Priya Sharma', specialty: 'Clinical Psychology', initials: 'PS', verified: true, avatarColor: 'bg-pink-500' },
    usageCount: 7230, rating: 4.8, country: 'Canada', specialty: 'Psychology', category: 'Assessment',
    lastEdited: '15/02/2026',
    tags: ['Intake', 'Assessment', 'Psychology'],
    description: 'A thorough initial intake assessment template for mental health presentations. Covers presenting problems, psychiatric and medical history, family history, developmental and social history, substance use, risk assessment, and initial formulation. Suitable for both individual and group practice settings.',
    exampleNote: `INTAKE ASSESSMENT\nDate: [Date] | Clinician: [Name] | Referral source: GP\n\nPRESENTING PROBLEM:\nClient is a 34-year-old presenting with a 6-month history of heightened anxiety, panic attacks (2–3/week), and avoidance of public spaces. Significant impairment to occupational functioning.\n\nPSYCHIATRIC HISTORY:\n- No previous psychiatric contact.\n- No prior hospitalisations.\n\nMEDICAL HISTORY:\n- Hypothyroidism — on levothyroxine 100mcg.\n\nFAMILY HISTORY:\n- Mother: depression, treated with antidepressants.\n\nRISK ASSESSMENT:\n- No current suicidal ideation.\n- No self-harm history.\n\nFORMULATION:\nPanic disorder with agoraphobia (F40.01). Predisposing: anxious temperament. Precipitating: workplace restructure. Perpetuating: avoidance and safety behaviours.\n\nPLAN:\n- CBT for panic disorder (12–16 sessions)\n- Psychoeducation re: anxiety cycle`,
    templateStructure: `INTAKE ASSESSMENT — [Patient] — [Date]\n\nPRESENTING PROBLEM:\n\nPSYCHIATRIC HISTORY:\n\nMEDICAL HISTORY:\n\nMEDICATIONS:\n\nFAMILY HISTORY:\n\nSOCIAL / DEVELOPMENTAL HISTORY:\n\nSUBSTANCE USE:\n\nRISK ASSESSMENT:\n- SI: / SH: / HI:\n\nMENTAL STATUS:\n\nFORMULATION:\n\nDIAGNOSIS (ICD-10):\n\nPLAN:`,
  },
  {
    id: 'c6', name: 'Progress Note — Weekly Session', type: 'note',
    author: { name: 'Dr. Luca Rossi', specialty: 'Psychotherapy', initials: 'LR', verified: true, avatarColor: 'bg-indigo-500' },
    usageCount: 6810, rating: 4.5, country: 'Italy', specialty: 'Psychology', category: 'Therapy',
    lastEdited: '01/03/2026',
    tags: ['Progress', 'Therapy', 'Weekly'],
    description: 'A concise weekly progress note template for ongoing psychotherapy sessions. Tracks session content, patient progress, risk status, and next steps. Designed to be completed efficiently without sacrificing clinical detail, making it ideal for high-caseload practitioners.',
    exampleNote: `PROGRESS NOTE — Session 7\nDate: [Date] | Duration: 50 min\n\nSESSION CONTENT:\n- Reviewed week since last session; patient reports improved sleep.\n- Explored relationship dynamics with partner; identified projection pattern.\n- Worked with transference material that arose mid-session.\n\nCLINICAL OBSERVATIONS:\n- Affect: Warmer and more engaged than previous sessions.\n- Insight: Growing. Beginning to link current patterns to early experiences.\n\nRISK: No concerns. Safety plan in place and reviewed.\n\nPLAN:\n- Continue exploring relational patterns.\n- Introduce concept of attachment styles next session.\n- Review PHQ-9 at session 8.`,
    templateStructure: `PROGRESS NOTE — Session [#]\nDate: | Duration:\n\nSESSION CONTENT:\n\nCLINICAL OBSERVATIONS:\n- Affect:\n- Engagement:\n- Insight:\n\nRISK UPDATE:\n\nPLAN:\n- Next session focus:\n- Homework (if applicable):`,
  },
  {
    id: 'c7', name: 'Discharge Summary — Inpatient', type: 'document',
    author: { name: 'Dr. Emma Larson', specialty: 'Psychiatry', initials: 'EL', verified: true, avatarColor: 'bg-teal-500' },
    usageCount: 5990, rating: 4.7, country: 'Australia', specialty: 'Psychiatry', category: 'Discharge',
    lastEdited: '28/01/2026',
    tags: ['Discharge', 'Inpatient', 'Psychiatry'],
    description: 'A comprehensive inpatient psychiatric discharge summary template covering admission details, diagnoses, treatment course, medications on discharge, risk assessment at discharge, and follow-up arrangements. Formatted for direct transmission to the patient\'s GP and outpatient team.',
    exampleNote: `PSYCHIATRIC DISCHARGE SUMMARY\n\nPatient: [Name] | DOB: | MRN: \nAdmission: [Date] | Discharge: [Date] | Ward: Adult Acute Inpatient\nAdmitting Diagnosis: Acute psychotic episode (F23)\n\nADMISSION REASON:\nPresented via ED with 2-week history of auditory hallucinations, disorganised thinking, and behavioural disturbance. First psychiatric presentation.\n\nTREATMENT COURSE:\n- Commenced olanzapine 10mg nocte; titrated to 20mg over admission.\n- Psychoeducation sessions x4. Family meeting held on Day 7.\n- Settled within 10 days. Insight improving at discharge.\n\nDISCHARGE DIAGNOSIS: F20.0 Paranoid Schizophrenia (provisional)\n\nMEDICATIONS ON DISCHARGE:\n- Olanzapine 20mg nocte\n\nRISK AT DISCHARGE: Low — supported discharge to family home.\n\nFOLLOW-UP:\n- CMHT appointment: [Date]\n- GP review: 1 week`,
    templateStructure: `DISCHARGE SUMMARY\n\nPatient: | DOB: | MRN:\nAdmission date: | Discharge date:\nWard:\n\nADMISSION REASON:\n\nDIAGNOSES:\n- Primary:\n- Secondary:\n\nTREATMENT COURSE:\n\nMEDICATIONS ON DISCHARGE:\n\nRISK AT DISCHARGE:\n\nFOLLOW-UP ARRANGEMENTS:\n- GP:\n- Outpatient:\n- Crisis plan:`,
  },
  {
    id: 'c8', name: 'GAD-7 Anxiety Questionnaire', type: 'form',
    author: { name: 'Dr. Noah Kim', specialty: 'General Practice', initials: 'NK', verified: false, avatarColor: 'bg-orange-500' },
    usageCount: 5640, rating: 4.4, country: 'South Korea', specialty: 'General Practice', category: 'Assessment',
    lastEdited: '10/02/2026',
    tags: ['GAD-7', 'Anxiety', 'Screening'],
    description: 'The Generalised Anxiety Disorder 7-item scale (GAD-7), a validated screening tool and severity measure for generalised anxiety disorder. Includes scoring guide, severity thresholds, and clinical action prompts. Widely used in primary care and mental health settings.',
    exampleNote: `GAD-7 — GENERALISED ANXIETY DISORDER SCALE\n\nOver the last 2 weeks, how often have you been bothered by:\n\n1. Feeling nervous, anxious or on edge\n   ☑ Several days (1)\n\n2. Not being able to stop or control worrying\n   ☑ More than half the days (2)\n\n3. Worrying too much about different things\n   ☑ More than half the days (2)\n\n4. Trouble relaxing\n   ☑ Several days (1)\n\n5. Being so restless it is hard to sit still\n   ☐ Not at all (0)\n\n6. Becoming easily annoyed or irritable\n   ☑ Several days (1)\n\n7. Feeling afraid as if something awful might happen\n   ☑ Several days (1)\n\nTOTAL SCORE: 8 — MODERATE ANXIETY\nClinical action: Consider further evaluation and treatment.`,
    templateStructure: `GAD-7 — [Patient Name] — [Date]\n\n1. Nervous/anxious/on edge:         0 / 1 / 2 / 3\n2. Can't stop/control worrying:     0 / 1 / 2 / 3\n3. Worrying too much:               0 / 1 / 2 / 3\n4. Trouble relaxing:                0 / 1 / 2 / 3\n5. Restless, hard to sit still:     0 / 1 / 2 / 3\n6. Easily annoyed or irritable:     0 / 1 / 2 / 3\n7. Feeling afraid, awful might happen: 0 / 1 / 2 / 3\n\nTOTAL: ____ / 21\nSeverity: Minimal (0–4) / Mild (5–9) / Moderate (10–14) / Severe (15–21)`,
  },
  {
    id: 'c9', name: 'Risk Assessment — Suicide & Self-Harm', type: 'note',
    author: { name: 'Dr. Sophie Leroy', specialty: 'Clinical Psychology', initials: 'SL', verified: true, avatarColor: 'bg-rose-500' },
    usageCount: 4920, rating: 4.9, country: 'France', specialty: 'Psychology', category: 'Assessment',
    lastEdited: '20/02/2026',
    tags: ['Risk', 'Safety', 'Assessment'],
    description: 'A structured clinical risk assessment template for suicide and self-harm, aligned with current best-practice guidelines. Covers ideation, intent, plan, means access, protective factors, and clinical formulation of risk level. Includes a safety plan section for collaborative documentation.',
    exampleNote: `RISK ASSESSMENT — [Patient Name] — [Date]\n\nSUICIDAL IDEATION:\n- Passive ideation: Present ("I wish I wasn't here")\n- Active ideation: Absent at time of assessment\n- Intent: None stated\n- Plan: No specific plan disclosed\n- Means access: No firearms; medications locked away by partner\n\nSELF-HARM HISTORY:\n- Previous episodes: Yes — cutting (upper arms), last episode 4 months ago\n- Current urges: Moderate (5/10)\n\nPROTECTIVE FACTORS:\n- Strong family support. Two young children.\n- Engaged in treatment. Good therapeutic alliance.\n- Religious beliefs against suicide.\n\nRISK LEVEL: MODERATE\n\nSAFETY PLAN:\n1. Warning signs to watch for: Isolation, not sleeping\n2. Coping strategies: Call sister, go for a walk\n3. Crisis contacts: [Crisis line], [GP name]\n4. Remove access to means: Partner holding medications`,
    templateStructure: `RISK ASSESSMENT — [Patient] — [Date]\n\nSUICIDAL IDEATION:\n- Passive ideation:\n- Active ideation:\n- Intent:\n- Plan:\n- Means access:\n\nSELF-HARM:\n- History:\n- Current urges:\n\nPROTECTIVE FACTORS:\n\nRISK FORMULATION:\n- Risk level: Low / Moderate / High\n- Rationale:\n\nSAFETY PLAN:\n1. Warning signs:\n2. Coping strategies:\n3. Crisis contacts:\n4. Means restriction:`,
  },
  {
    id: 'c10', name: 'Case Formulation — CBT Framework', type: 'document',
    author: { name: 'Dr. Marcus Webb', specialty: 'Psychology', initials: 'MW', verified: true, avatarColor: 'bg-cyan-500' },
    usageCount: 4450, rating: 4.6, country: 'United Kingdom', specialty: 'Psychology', category: 'Therapy',
    lastEdited: '03/03/2026',
    tags: ['Formulation', 'CBT', 'Psychology'],
    description: 'A structured case formulation template using the CBT 5-part model (Padesky & Mooney). Guides the clinician through identifying predisposing, precipitating, and perpetuating factors, core beliefs, assumptions, and behaviours. Designed to inform treatment planning and be shared collaboratively with the client.',
    exampleNote: `CBT CASE FORMULATION\nClient: [Initials] | Date: | Clinician:\n\nPRESENTING PROBLEM:\nGeneralised anxiety with health anxiety features. Significant reassurance-seeking behaviour.\n\n5-PART MODEL:\n\nSITUATION: Notices physical sensation (e.g. chest tightening)\n↓\nTHOUGHTS: "This could be a heart attack. Something is seriously wrong."\n↓\nEMOTIONS: Anxiety (8/10), Fear\nPHYSICAL: Rapid heartbeat, shallow breathing, dizziness\nBEHAVIOURS: Checks pulse, calls GP, avoids exercise\n\nCORE BELIEF: "My body is fragile and unreliable."\nASSUMPTION: "If I feel something physical, it must be dangerous."\n\nPREDISPOSING: Mother had serious illness during childhood; learned threat hypervigilance.\nPRECIPITATING: Friend's cardiac event 6 months ago.\nPERPETUATING: Reassurance-seeking prevents disconfirmation; avoidance maintains fear.`,
    templateStructure: `CBT CASE FORMULATION — [Client Initials] — [Date]\n\nPRESENTING PROBLEM:\n\n5-PART MODEL:\nSITUATION:\nTHOUGHTS:\nEMOTIONS:\nPHYSICAL SENSATIONS:\nBEHAVIOURS:\n\nCORE BELIEF:\nUNDERLYING ASSUMPTION:\n\nPREDISPOSING FACTORS:\nPRECIPITATING FACTORS:\nPERPETUATING FACTORS:\n\nTREATMENT TARGETS:\n1.\n2.\n3.`,
  },
  {
    id: 'c11', name: 'Medication Review Note', type: 'note',
    author: { name: 'Dr. Fatima Al-Hassan', specialty: 'Psychiatry', initials: 'FA', verified: true, avatarColor: 'bg-lime-600' },
    usageCount: 3870, rating: 4.5, country: 'Canada', specialty: 'Psychiatry', category: 'Medication',
    lastEdited: '25/02/2026',
    tags: ['Medication', 'Review', 'Psychiatry'],
    description: 'A structured medication review note for psychiatric outpatient appointments. Covers current medications, tolerability, side effects, adherence, blood levels (where applicable), physical health monitoring, and any medication changes. Includes decision-making documentation for prescribing changes.',
    exampleNote: `MEDICATION REVIEW — [Patient] — [Date]\n\nCURRENT MEDICATIONS:\n- Quetiapine XR 300mg nocte (commenced [date])\n- Lithium carbonate 800mg nocte (serum level: 0.72 mmol/L — therapeutic)\n\nEFFICACY:\n- Mood: Stable. No manic or depressive episodes since medication optimisation.\n- Sleep: Improved. Averaging 7–8 hours.\n\nTOLERABILITY / SIDE EFFECTS:\n- Weight gain +3kg over 6 months. Discussed dietary measures.\n- Mild sedation in mornings — improved since switching to nocte dosing.\n\nADHERENCE: Good (self-report + family corroboration)\n\nMONITORING:\n- Lithium level: 0.72 ✓ | TFTs: Normal | Renal function: Normal | ECG: Normal\n\nDECISION:\n- Maintain current regimen. Review in 3 months or sooner if mood destabilises.`,
    templateStructure: `MEDICATION REVIEW — [Patient] — [Date]\n\nCURRENT MEDICATIONS:\n-\n\nEFFICACY:\n\nTOLERABILITY / SIDE EFFECTS:\n\nADHERENCE:\n\nMONITORING RESULTS:\n\nCHANGES MADE (if any):\n\nPLAN / NEXT REVIEW:`,
  },
  {
    id: 'c12', name: 'Couples Therapy Session Note', type: 'note',
    author: { name: 'Dr. Isabella García', specialty: 'Psychotherapy', initials: 'IG', verified: false, avatarColor: 'bg-fuchsia-500' },
    usageCount: 3210, rating: 4.3, country: 'Spain', specialty: 'Psychology', category: 'Therapy',
    lastEdited: '18/02/2026',
    tags: ['Couples', 'Therapy', 'Psychotherapy'],
    description: 'A session note template for couples therapy, capturing dyadic dynamics, communication patterns, emotional responses from both partners, therapeutic interventions applied, and agreed goals for the next session. Supports both EFT and Gottman-method practitioners.',
    exampleNote: `COUPLES SESSION NOTE — Session 5\nCouple: [Partner A] & [Partner B] | Date: | Duration: 60 min\n\nSESSION THEME: Pursuing-withdrawing cycle\n\nPARTNER A:\n- Presented as emotionally activated early in session.\n- Expressed fear of abandonment underlying criticism.\n- Able to soften and express primary emotion when given space.\n\nPARTNER B:\n- Initially defended and withdrawn.\n- Opened up when Partner A's vulnerability became apparent.\n- Disclosed fear of failure as a partner.\n\nCYCLE IDENTIFIED: A criticises → B withdraws → A escalates (EFT cycle).\n\nINTERVENTIONS:\n- Evocative responding, heightening, empathic conjecture.\n- Reframing criticism as attachment protest.\n\nSESSION GOALS FOR NEXT TIME:\n- Build on today's enactment.\n- Explore each partner's attachment history.`,
    templateStructure: `COUPLES SESSION NOTE — Session [#]\nCouple: [Partner A] & [Partner B] | Date: | Duration:\n\nSESSION THEME:\n\nPARTNER A:\n- Presentation:\n- Key disclosures:\n\nPARTNER B:\n- Presentation:\n- Key disclosures:\n\nINTERACTION PATTERNS OBSERVED:\n\nINTERVENTIONS:\n\nNEXT SESSION GOALS:`,
  },
]

// ── Filter options ─────────────────────────────────────────────────────────

const sortOptions    = ['Most Popular', 'Highest Rated', 'Recently Added']
const locationOptions = ['All', 'Australia', 'United Kingdom', 'United States', 'Canada', 'France', 'Spain', 'Italy', 'South Korea']
const specialtyOptions = ['All', 'Psychiatry', 'Psychology', 'General Practice', 'Psychotherapy']
const categoryOptions  = ['All', 'Assessment', 'Therapy', 'Letters', 'Discharge', 'Medication']

// ── State ──────────────────────────────────────────────────────────────────

const search       = ref('')
const sortBy       = ref('Most Popular')
const location     = ref('All')
const specialty    = ref('All')
const category     = ref('All')
const openDropdown = ref<'sort' | 'location' | 'specialty' | 'category' | null>(null)

const previewTab = ref<'example' | 'structure'>('example')
const addedToLibrary = ref(false)

const selectedTemplate = computed<CommunityTemplate | null>(() =>
  communityTemplates.find(t => t.id === route.query.id) ?? null,
)

function openTemplate(t: CommunityTemplate) {
  previewTab.value = 'example'
  addedToLibrary.value = false
  router.push({ query: { id: t.id } })
}
function closeTemplate() { router.push({ query: {} }) }
function addToLibrary() { addedToLibrary.value = true }

// Reset per-template state when navigating away
watch(() => route.query.id, (id) => {
  if (!id) return
  previewTab.value = 'example'
  addedToLibrary.value = false
})

function toggleDropdown(key: 'sort' | 'location' | 'specialty' | 'category') {
  openDropdown.value = openDropdown.value === key ? null : key
}
function closeDropdowns() { openDropdown.value = null }

onMounted(() => document.addEventListener('click', closeDropdowns))
onUnmounted(() => document.removeEventListener('click', closeDropdowns))

// ── Computed ───────────────────────────────────────────────────────────────

const filtered = computed(() => {
  let list = [...communityTemplates]
  const q = search.value.trim().toLowerCase()
  if (q) list = list.filter(t => t.name.toLowerCase().includes(q) || t.author.name.toLowerCase().includes(q))
  if (location.value !== 'All')  list = list.filter(t => t.country === location.value)
  if (specialty.value !== 'All') list = list.filter(t => t.specialty === specialty.value)
  if (category.value !== 'All')  list = list.filter(t => t.category === category.value)
  if (sortBy.value === 'Most Popular')   list.sort((a, b) => b.usageCount - a.usageCount)
  if (sortBy.value === 'Highest Rated')  list.sort((a, b) => b.rating - a.rating)
  if (sortBy.value === 'Recently Added') list.reverse()
  return list
})

const hasFilters = computed(() =>
  location.value !== 'All' || specialty.value !== 'All' || category.value !== 'All' || search.value.trim() !== '',
)

function clearFilters() {
  location.value = 'All'
  specialty.value = 'All'
  category.value = 'All'
  search.value = ''
}

// ── Helpers ────────────────────────────────────────────────────────────────

const typeConfig: Record<TemplateType, { label: string; color: string; icon: Component }> = {
  note:     { label: 'Note',     color: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',        icon: FileText },
  document: { label: 'Document', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', icon: File },
  form:     { label: 'Form',     color: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400', icon: ClipboardList },
}

function fmtCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k`
  return String(n)
}

function copyLink() {
  navigator.clipboard.writeText(window.location.origin + route.fullPath).catch(() => {})
}
</script>

<template>
  <div class="flex-1 flex flex-col min-h-0 overflow-hidden bg-background" @click.self="closeDropdowns">

    <Transition name="page-swap" mode="out-in">

      <!-- ── Template detail view ── -->
      <div v-if="selectedTemplate" key="detail" class="flex-1 flex flex-col min-h-0 overflow-hidden bg-[#f7f4f0] dark:bg-background">
        <div class="flex-1 overflow-y-auto">
          <div class="max-w-5xl mx-auto px-8 py-8">

            <!-- Breadcrumb -->
            <div class="mb-10 flex items-center gap-1.5 text-sm">
              <button
                class="px-2.5 py-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                @click="closeTemplate"
              >
                Community
              </button>
              <ChevronRight class="w-3.5 h-3.5 text-muted-foreground/40 shrink-0" />
              <span class="px-2.5 py-1.5 text-foreground font-medium truncate max-w-xs">{{ selectedTemplate?.name }}</span>
            </div>

            <!-- Main layout: content + sidebar -->
            <div class="flex gap-16 items-start">

              <!-- Left content -->
              <div class="flex-1 min-w-0">

                <!-- Title -->
                <h1 class="text-5xl font-bold text-foreground leading-tight mb-8 tracking-tight">
                  {{ selectedTemplate.name }}
                </h1>

                <!-- Metadata row -->
                <div class="grid grid-cols-4 gap-6 mb-10 pb-10 border-b border-border/40">
                  <div>
                    <p class="text-xs text-muted-foreground mb-1">Created by</p>
                    <p class="text-sm font-medium text-foreground">{{ selectedTemplate.author.name }}</p>
                  </div>
                  <div>
                    <p class="text-xs text-muted-foreground mb-1">Specialty</p>
                    <p class="text-sm font-medium text-foreground">{{ selectedTemplate.author.specialty }}</p>
                  </div>
                  <div>
                    <p class="text-xs text-muted-foreground mb-1">Last edited</p>
                    <p class="text-sm font-medium text-foreground">{{ selectedTemplate.lastEdited }}</p>
                  </div>
                  <div>
                    <p class="text-xs text-muted-foreground mb-1">Uses</p>
                    <p class="text-sm font-medium text-foreground">{{ selectedTemplate.usageCount.toLocaleString() }} times</p>
                  </div>
                </div>

                <!-- About -->
                <div class="mb-10">
                  <h2 class="text-xl font-bold text-foreground mb-4">About this template</h2>
                  <p class="text-sm text-foreground/80 leading-relaxed">{{ selectedTemplate.description }}</p>
                </div>

                <!-- Preview template -->
                <div>
                  <h2 class="text-xl font-bold text-foreground mb-4">Preview template</h2>
                  <div class="bg-background border border-border/50 rounded-2xl overflow-hidden shadow-sm">

                    <!-- Tabs -->
                    <div class="flex border-b border-border/40 bg-muted/30">
                      <button
                        :class="['flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors', previewTab === 'example' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground']"
                        @click="previewTab = 'example'"
                      >
                        <FileText class="w-3.5 h-3.5" />
                        Example note
                      </button>
                      <button
                        :class="['flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors', previewTab === 'structure' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground']"
                        @click="previewTab = 'structure'"
                      >
                        <LayoutDashboard class="w-3.5 h-3.5" />
                        Template structure
                      </button>
                    </div>

                    <!-- Content -->
                    <div class="p-6">
                      <pre class="text-sm text-foreground/85 leading-relaxed font-mono whitespace-pre-wrap">{{ previewTab === 'example' ? selectedTemplate.exampleNote : selectedTemplate.templateStructure }}</pre>
                    </div>
                  </div>
                </div>

              </div>

              <!-- Right sidebar -->
              <div class="w-64 shrink-0 space-y-6 sticky top-8">

                <!-- Add to library -->
                <button
                  :class="['w-full flex items-center justify-center gap-2 h-11 rounded-xl text-sm font-semibold transition-all', addedToLibrary ? 'bg-emerald-600 text-white' : 'bg-foreground text-background hover:opacity-90']"
                  @click="addToLibrary"
                >
                  <template v-if="addedToLibrary">
                    <Check class="w-4 h-4" />
                    Added to library
                  </template>
                  <template v-else>
                    <Plus class="w-4 h-4" />
                    Add to my library
                  </template>
                </button>

                <!-- Tags -->
                <div>
                  <p class="text-sm font-semibold text-foreground mb-3">Tags</p>
                  <div class="flex flex-wrap gap-2">
                    <span
                      v-for="tag in selectedTemplate.tags"
                      :key="tag"
                      class="inline-flex items-center px-3 py-1 text-sm border border-border rounded-lg text-foreground bg-background/60"
                    >
                      {{ tag }}
                    </span>
                  </div>
                </div>

                <!-- Share -->
                <div>
                  <p class="text-sm font-semibold text-foreground mb-3">Share</p>
                  <div class="flex items-center gap-2">
                    <button
                      class="w-9 h-9 rounded-lg border border-border bg-background/60 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                      title="Copy link"
                      @click="copyLink"
                    >
                      <Link2 class="w-4 h-4" />
                    </button>
                    <button
                      class="w-9 h-9 rounded-lg border border-border bg-background/60 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                      title="Share on LinkedIn"
                    >
                      <Linkedin class="w-4 h-4" />
                    </button>
                    <button
                      class="w-9 h-9 rounded-lg border border-border bg-background/60 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                      title="Share via email"
                    >
                      <Mail class="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <!-- Author card -->
                <div class="rounded-xl border border-border/60 bg-background/60 p-4">
                  <p class="text-xs text-muted-foreground mb-3 font-medium uppercase tracking-wide">Author</p>
                  <div class="flex items-center gap-3">
                    <div :class="['w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0', selectedTemplate.author.avatarColor]">
                      {{ selectedTemplate.author.initials }}
                    </div>
                    <div class="min-w-0">
                      <div class="flex items-center gap-1">
                        <p class="text-sm font-medium text-foreground truncate">{{ selectedTemplate.author.name }}</p>
                        <BadgeCheck v-if="selectedTemplate.author.verified" class="w-3.5 h-3.5 text-primary shrink-0" />
                      </div>
                      <p class="text-xs text-muted-foreground">{{ selectedTemplate.author.specialty }}</p>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ── Community list view ── -->
      <div v-else key="list" class="flex-1 overflow-y-auto">
        <div class="max-w-5xl mx-auto px-6 py-10">

          <div class="text-center mb-8">
            <h1 class="text-4xl font-bold text-foreground mb-2">Template Community</h1>
            <p class="text-muted-foreground text-sm max-w-md mx-auto">
              Discover and use templates created by practitioners around the world.
            </p>
          </div>

          <!-- Search + filter bar -->
          <div class="flex flex-col gap-3 mb-8">
            <div class="relative max-w-lg mx-auto w-full">
              <Search class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <input
                v-model="search"
                type="text"
                placeholder="Search templates…"
                class="w-full h-10 pl-10 pr-4 rounded-xl border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground/60 outline-none focus:ring-1 focus:ring-ring shadow-sm"
              />
            </div>

            <div class="flex items-center justify-center flex-wrap gap-2">

              <div class="relative" @click.stop>
                <button
                  :class="['flex items-center gap-1.5 h-9 px-3.5 text-sm rounded-lg border transition-colors', openDropdown === 'sort' ? 'border-primary bg-primary/5 text-primary' : 'border-border bg-card text-foreground hover:bg-accent']"
                  @click="toggleDropdown('sort')"
                >
                  <ArrowUpDown class="w-3.5 h-3.5 text-muted-foreground" />
                  {{ sortBy }}
                  <ChevronDown class="w-3.5 h-3.5 text-muted-foreground" />
                </button>
                <Transition enter-active-class="transition duration-100 ease-out" enter-from-class="opacity-0 scale-95" leave-active-class="transition duration-75 ease-in" leave-to-class="opacity-0 scale-95">
                  <div v-if="openDropdown === 'sort'" class="absolute top-full mt-1 left-0 z-50 w-44 rounded-xl border border-border bg-card shadow-lg overflow-hidden">
                    <button v-for="opt in sortOptions" :key="opt" :class="['w-full text-left px-3.5 py-2 text-sm transition-colors', sortBy === opt ? 'bg-primary/10 text-primary font-medium' : 'text-foreground hover:bg-accent']" @click="sortBy = opt; closeDropdowns()">{{ opt }}</button>
                  </div>
                </Transition>
              </div>

              <div class="relative" @click.stop>
                <button
                  :class="['flex items-center gap-1.5 h-9 px-3.5 text-sm rounded-lg border transition-colors max-w-[180px]', location !== 'All' ? 'border-primary bg-primary/10 text-primary font-medium' : openDropdown === 'location' ? 'border-primary bg-primary/5 text-primary' : 'border-border bg-card text-foreground hover:bg-accent']"
                  @click="toggleDropdown('location')"
                >
                  <MapPin class="w-3.5 h-3.5 shrink-0" :class="location !== 'All' ? 'text-primary' : 'text-muted-foreground'" />
                  <span class="truncate">Location{{ location !== 'All' ? `: ${location}` : '' }}</span>
                  <ChevronDown class="w-3.5 h-3.5 shrink-0" :class="location !== 'All' ? 'text-primary' : 'text-muted-foreground'" />
                </button>
                <Transition enter-active-class="transition duration-100 ease-out" enter-from-class="opacity-0 scale-95" leave-active-class="transition duration-75 ease-in" leave-to-class="opacity-0 scale-95">
                  <div v-if="openDropdown === 'location'" class="absolute top-full mt-1 left-0 z-50 w-52 rounded-xl border border-border bg-card shadow-lg overflow-hidden max-h-64 overflow-y-auto">
                    <button v-for="opt in locationOptions" :key="opt" :class="['w-full text-left px-3.5 py-2 text-sm transition-colors', location === opt ? 'bg-primary/10 text-primary font-medium' : 'text-foreground hover:bg-accent']" @click="location = opt; closeDropdowns()">{{ opt }}</button>
                  </div>
                </Transition>
              </div>

              <div class="relative" @click.stop>
                <button
                  :class="['flex items-center gap-1.5 h-9 px-3.5 text-sm rounded-lg border transition-colors', specialty !== 'All' ? 'border-primary bg-primary/10 text-primary font-medium' : openDropdown === 'specialty' ? 'border-primary bg-primary/5 text-primary' : 'border-border bg-card text-foreground hover:bg-accent']"
                  @click="toggleDropdown('specialty')"
                >
                  <Stethoscope class="w-3.5 h-3.5" :class="specialty !== 'All' ? 'text-primary' : 'text-muted-foreground'" />
                  Specialty{{ specialty !== 'All' ? `: ${specialty}` : '' }}
                  <ChevronDown class="w-3.5 h-3.5" :class="specialty !== 'All' ? 'text-primary' : 'text-muted-foreground'" />
                </button>
                <Transition enter-active-class="transition duration-100 ease-out" enter-from-class="opacity-0 scale-95" leave-active-class="transition duration-75 ease-in" leave-to-class="opacity-0 scale-95">
                  <div v-if="openDropdown === 'specialty'" class="absolute top-full mt-1 left-0 z-50 w-52 rounded-xl border border-border bg-card shadow-lg overflow-hidden">
                    <button v-for="opt in specialtyOptions" :key="opt" :class="['w-full text-left px-3.5 py-2 text-sm transition-colors', specialty === opt ? 'bg-primary/10 text-primary font-medium' : 'text-foreground hover:bg-accent']" @click="specialty = opt; closeDropdowns()">{{ opt }}</button>
                  </div>
                </Transition>
              </div>

              <div class="relative" @click.stop>
                <button
                  :class="['flex items-center gap-1.5 h-9 px-3.5 text-sm rounded-lg border transition-colors', category !== 'All' ? 'border-primary bg-primary/10 text-primary font-medium' : openDropdown === 'category' ? 'border-primary bg-primary/5 text-primary' : 'border-border bg-card text-foreground hover:bg-accent']"
                  @click="toggleDropdown('category')"
                >
                  <LayoutGrid class="w-3.5 h-3.5" :class="category !== 'All' ? 'text-primary' : 'text-muted-foreground'" />
                  Category{{ category !== 'All' ? `: ${category}` : '' }}
                  <ChevronDown class="w-3.5 h-3.5" :class="category !== 'All' ? 'text-primary' : 'text-muted-foreground'" />
                </button>
                <Transition enter-active-class="transition duration-100 ease-out" enter-from-class="opacity-0 scale-95" leave-active-class="transition duration-75 ease-in" leave-to-class="opacity-0 scale-95">
                  <div v-if="openDropdown === 'category'" class="absolute top-full mt-1 left-0 z-50 w-44 rounded-xl border border-border bg-card shadow-lg overflow-hidden">
                    <button v-for="opt in categoryOptions" :key="opt" :class="['w-full text-left px-3.5 py-2 text-sm transition-colors', category === opt ? 'bg-primary/10 text-primary font-medium' : 'text-foreground hover:bg-accent']" @click="category = opt; closeDropdowns()">{{ opt }}</button>
                  </div>
                </Transition>
              </div>

              <Transition enter-active-class="transition duration-100" enter-from-class="opacity-0" leave-active-class="transition duration-75" leave-to-class="opacity-0">
                <button v-if="hasFilters" class="flex items-center gap-1 h-9 px-2.5 text-xs text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-accent" @click="clearFilters">
                  <X class="w-3.5 h-3.5" />
                  Clear
                </button>
              </Transition>

            </div>
          </div>

          <p class="text-xs text-muted-foreground mb-4">{{ filtered.length }} template{{ filtered.length !== 1 ? 's' : '' }}</p>

          <div v-if="filtered.length" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div
              v-for="t in filtered"
              :key="t.id"
              class="group relative flex flex-col gap-4 p-5 bg-card border border-border rounded-2xl hover:shadow-md hover:border-border/80 transition-all cursor-pointer"
              @click="openTemplate(t)"
            >
              <div class="flex items-center justify-between">
                <span :class="['inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full', typeConfig[t.type].color]">
                  <component :is="typeConfig[t.type].icon" class="w-3 h-3" />
                  {{ typeConfig[t.type].label }}
                </span>
                <button class="opacity-0 group-hover:opacity-100 p-1 rounded-lg text-muted-foreground hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all" @click.stop>
                  <Star class="w-3.5 h-3.5" />
                </button>
              </div>
              <p class="text-sm font-semibold text-foreground leading-snug flex-1 line-clamp-2">{{ t.name }}</p>
              <div class="flex items-center gap-2.5">
                <div :class="['w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0', t.author.avatarColor]">{{ t.author.initials }}</div>
                <div class="min-w-0 flex-1">
                  <div class="flex items-center gap-1">
                    <p class="text-xs font-medium text-foreground truncate">{{ t.author.name }}</p>
                    <BadgeCheck v-if="t.author.verified" class="w-3.5 h-3.5 text-primary shrink-0" />
                  </div>
                  <p class="text-[11px] text-muted-foreground truncate">{{ t.author.specialty }}</p>
                </div>
              </div>
              <div class="flex items-center gap-1.5 text-[11px] text-muted-foreground border-t border-border/60 pt-3">
                <Users class="w-3.5 h-3.5" />
                <span>{{ fmtCount(t.usageCount) }} uses</span>
                <span class="ml-auto flex items-center gap-0.5">
                  <Star class="w-3 h-3 fill-amber-400 text-amber-400" />
                  {{ t.rating }}
                </span>
              </div>
            </div>
          </div>

          <div v-else class="flex flex-col items-center gap-4 py-20 text-center">
            <div class="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
              <Search class="w-6 h-6 text-muted-foreground/50" />
            </div>
            <div>
              <p class="font-semibold text-foreground mb-1">No templates found</p>
              <p class="text-sm text-muted-foreground">Try adjusting your filters or search query.</p>
            </div>
            <button class="text-sm text-primary hover:underline" @click="clearFilters">Clear all filters</button>
          </div>

        </div>
      </div>

    </Transition>
  </div>
</template>

<style scoped>
.page-swap-enter-active { transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1); }
.page-swap-leave-active { transition: all 0.16s cubic-bezier(0.4, 0, 0.2, 1); }
.page-swap-enter-from  { opacity: 0; transform: translateY(12px); }
.page-swap-leave-to    { opacity: 0; transform: translateY(-8px); }
</style>
