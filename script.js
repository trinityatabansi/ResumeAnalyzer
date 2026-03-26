// GoalMine Resume Analyzer — script.js v5
// Weighted category-based scoring engine

if (window.pdfjsLib) {
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
}

// ════════════════════════════════════════
// KNOWLEDGE BASE — Category Keywords
// ════════════════════════════════════════

const KB = {
  // ── CORE TECHNICAL SKILLS by job type ──
  tech_data: [
    "sql","python","excel","tableau","power bi","r","java","javascript","typescript",
    "html","css","pandas","numpy","matplotlib","scikit","tensorflow","machine learning",
    "data analysis","data analytics","data visualization","data modeling","data pipeline",
    "database","mysql","postgresql","mongodb","snowflake","spark","hadoop","aws","azure",
    "gcp","cloud","api","git","github","etl","bi","kpi","dashboard","reporting",
    "structured data","unstructured data","statistics","regression","forecasting",
    "a/b testing","google analytics","looker","dbt","airflow","jupyter","vba","macro"
  ],
  business_analyst: [
    "excel","sql","microsoft office","business analysis","business requirements",
    "requirements gathering","functional specifications","process improvement",
    "stakeholder","documentation","workflow","reporting","data analysis","gap analysis",
    "uat","user acceptance","use case","business process","project management",
    "powerpoint","word","visio","jira","confluence","trello","business intelligence",
    "kpi","metrics","analytical","problem solving","communication","presentation",
    "process mapping","root cause","cost benefit","risk analysis","feasibility"
  ],
  marketing: [
    "marketing","seo","sem","social media","content","campaign","brand","advertising",
    "google ads","facebook","instagram","analytics","copywriting","email marketing",
    "hubspot","salesforce","crm","lead generation","conversion","roi","engagement",
    "strategy","digital marketing","market research","consumer behavior","public relations"
  ],
  finance: [
    "accounting","finance","financial analysis","budgeting","forecasting","excel",
    "quickbooks","gaap","ifrs","audit","tax","financial modeling","valuation","dcf",
    "balance sheet","income statement","cash flow","variance analysis","reconciliation",
    "accounts payable","accounts receivable","payroll","erp","sap","oracle"
  ],
  general: [
    "excel","microsoft office","communication","organization","teamwork","leadership",
    "problem solving","project management","customer service","data entry","reporting",
    "documentation","research","analysis","presentation","writing","planning","strategy"
  ]
};

// ── SOFT SKILLS (universal) ──
const SOFT_SKILLS = [
  "communication","verbal","written","presentation","public speaking",
  "teamwork","collaboration","cross-functional","interpersonal",
  "problem solving","analytical","critical thinking","detail oriented","attention to detail",
  "organization","organizational","time management","prioritization","multitasking",
  "leadership","initiative","proactive","self-motivated","adaptable","adaptability",
  "documentation","reporting","planning","strategic","creative","innovation",
  "customer service","stakeholder","mentoring","coaching","training","facilitation"
];

// ── EDUCATION SIGNALS ──
const EDU_DEGREES = [
  "bachelor","master","phd","doctorate","associate","mba","bs","ba","ms","bba",
  "undergraduate","graduate","degree","diploma"
];
const EDU_FIELDS = [
  "business","information technology","computer science","data science","finance",
  "accounting","marketing","management","engineering","statistics","mathematics",
  "economics","information systems","mis","analytics","administration"
];
const EDU_CERTS = [
  "certification","certificate","certified","ibm","google","microsoft","aws","pmp",
  "comptia","coursera","edx","udemy","linkedin learning","professional certificate",
  "data analyst","project management","agile","scrum","six sigma","itil"
];

// ── BONUS KEYWORDS (don't penalize if missing) ──
const BONUS_KEYWORDS = [
  "agile","scrum","kanban","jira","confluence","sdlc","uat","sprint","waterfall",
  "six sigma","itil","pmp","lean","devops","ci/cd","docker","kubernetes"
];

// ── NOISE to always filter ──
const NOISE = new Set([
  "a","an","the","and","or","with","in","on","for","to","of","is","at","by","as",
  "from","are","be","have","has","had","was","were","will","we","i","you","your",
  "our","their","this","that","it","its","they","them","which","who","what","when",
  "than","then","but","not","no","if","so","do","up","out","can","just","also",
  "all","any","more","such","each","about","into","over","per","etc","via","vs",
  "would","could","should","shall","may","might","must","within","across","onto",
  "been","being","both","few","how","most","other","some","these","those","too",
  "very","get","got","let","put","set","did","does","done","make","made","come",
  "came","take","took","see","saw","know","think","want","say","said","one","two",
  "three","use","used","using","need","needs","include","including","ensure",
  "provide","provides","apply","applying","applicant","candidates","candidate",
  "job","role","position","opportunity","company","employer","hiring","hire",
  "resume","linkedin","dice","premium","profile","click","apply","save","show",
  "promoted","hirer","responses","managed","off","via","today","hours","ago",
  "people","remote","volunteer","location","locations","united","states","chicago",
  "boston","phoenix","madison","columbia","dallas","new","york","multiple","across",
  "welcome","looking","seeking","ideal","individuals","restart","break","return",
  "returnees","strongly","encouraged","please","note","equal","opportunity","eeo"
]);

// ════════════════════════════════════════
// NLP HELPERS
// ════════════════════════════════════════

function stem(w) {
  return w
    .replace(/izations?$/,"ize").replace(/isations?$/,"ise")
    .replace(/ations?$/,"ate").replace(/nesses?$/,"")
    .replace(/ments?$/,"").replace(/ings?$/,"")
    .replace(/edly$/,"").replace(/ers?$/,"")
    .replace(/ied$/,"y").replace(/ies$/,"y")
    .replace(/ed$/,"").replace(/ly$/,"").replace(/s$/,"");
}

function tokenize(text) {
  return (text.toLowerCase().match(/\b[a-z][a-z0-9]{1,}\b/g) || []).filter(w => !NOISE.has(w));
}

function extractBigrams(text) {
  const words = tokenize(text);
  const bigrams = [];
  for (let i = 0; i < words.length - 1; i++) {
    bigrams.push(`${words[i]} ${words[i+1]}`);
  }
  return bigrams;
}

// Flexible match: checks word, stem, and common synonyms
const SYNONYMS = {
  "analysis": ["analytics","analytical","analyzing","analyzed","reporting","insights"],
  "documentation": ["documented","records","structured","organized","tracking","documented"],
  "data": ["dataset","datasets","database","databases"],
  "management": ["managing","managed","oversight","administering"],
  "communication": ["communicating","communicated","verbal","written","presentation"],
  "development": ["developing","developed","building","built","created","designing"],
  "support": ["supporting","assisted","assisting","helped","helping"],
  "collaboration": ["collaborative","collaborating","collaborated","teamwork","cross-functional"],
  "organization": ["organizational","organized","organizing"],
  "problem": ["problems","solving","troubleshooting","troubleshoot"],
  "reporting": ["reports","report","analysis","insights","dashboards"],
  "planning": ["planned","plans","strategy","strategic"],
  "research": ["researching","researched","investigated","investigation"],
  "testing": ["test","tests","uat","qa","quality assurance","validation"]
};

function flexMatch(resumeTokens, resumeBigrams, keyword) {
  const kLow = keyword.toLowerCase();
  const kStem = stem(kLow);

  // Direct match
  if (resumeTokens.includes(kLow)) return true;
  if (resumeBigrams.includes(kLow)) return true;

  // Stem match
  if (resumeTokens.some(t => stem(t) === kStem)) return true;

  // Multi-word keyword
  if (kLow.includes(" ")) {
    const parts = kLow.split(" ");
    if (parts.every(p => resumeTokens.some(t => t === p || stem(t) === stem(p)))) return true;
  }

  // Synonym match
  for (const [base, syns] of Object.entries(SYNONYMS)) {
    if (kLow === base || kStem === stem(base) || syns.includes(kLow)) {
      const allForms = [base, ...syns];
      if (allForms.some(f => resumeTokens.includes(f) || resumeBigrams.includes(f))) return true;
    }
  }

  return false;
}

// ════════════════════════════════════════
// JOB TYPE DETECTION
// ════════════════════════════════════════

function detectJobType(jobText) {
  const j = jobText.toLowerCase();
  const counts = {
    tech_data: 0, business_analyst: 0, marketing: 0, finance: 0
  };
  const signals = {
    tech_data:        ["data analyst","data science","sql","python","tableau","machine learning","bi","analytics","dashboard","database"],
    business_analyst: ["business analyst","business analysis","requirements","stakeholder","sdlc","uat","process improvement","functional specifications"],
    marketing:        ["marketing","seo","campaign","social media","brand","content","advertising","digital marketing"],
    finance:          ["finance","accounting","financial","budgeting","audit","gaap","reconciliation","accounts"]
  };
  for (const [type, words] of Object.entries(signals)) {
    counts[type] = words.filter(w => j.includes(w)).length;
  }
  const max = Math.max(...Object.values(counts));
  if (max === 0) return "general";
  return Object.keys(counts).find(k => counts[k] === max);
}

// ════════════════════════════════════════
// CATEGORY SCORING
// ════════════════════════════════════════

function scoreCoreSkills(resumeTokens, resumeBigrams, jobType) {
  const pool = [...new Set([...KB[jobType] || [], ...KB.general])];
  const matched = pool.filter(k => flexMatch(resumeTokens, resumeBigrams, k));
  const total   = Math.min(pool.length, 20); // cap denominator at 20 core skills
  const pct     = Math.min(100, Math.round((matched.length / total) * 100));
  return { pct, matched, total: pool.length };
}

function scoreEducation(resumeText, jobText) {
  const r = resumeText.toLowerCase();
  const j = jobText.toLowerCase();
  let score = 0;
  const signals = [];
  const missing = [];

  // Degree present
  const hasDegree = EDU_DEGREES.some(d => r.includes(d));
  if (hasDegree) { score += 40; signals.push("Degree present"); }
  else missing.push("No degree detected");

  // Field relevance
  const jobFields = EDU_FIELDS.filter(f => j.includes(f));
  const resumeFields = EDU_FIELDS.filter(f => r.includes(f));
  const fieldMatch = jobFields.some(f => resumeFields.includes(f) ||
    resumeFields.some(rf => stem(rf) === stem(f)));
  if (fieldMatch) { score += 35; signals.push("Relevant field of study"); }
  else if (resumeFields.length > 0) { score += 15; signals.push("Related field of study"); }
  else missing.push("Field of study not clearly aligned");

  // Certifications
  const hasCerts = EDU_CERTS.some(c => r.includes(c));
  if (hasCerts) { score += 25; signals.push("Certifications detected"); }

  return { pct: Math.min(100, score), signals, missing };
}

function scoreExperience(resumeText, jobText, resumeTokens, resumeBigrams) {
  const r = resumeText.toLowerCase();
  const j = jobText.toLowerCase();
  let score = 0;
  const signals = [];
  const missing = [];

  // Work experience
  const expSignals = ["experience","worked","managed","led","developed","built","created",
    "coordinated","maintained","analyzed","designed","implemented","supported","assisted"];
  const expMatches = expSignals.filter(e => r.includes(e));
  if (expMatches.length >= 4) { score += 35; signals.push("Solid work experience"); }
  else if (expMatches.length >= 2) { score += 20; signals.push("Some work experience"); }
  else missing.push("Limited work experience signals");

  // Projects
  const hasProjects = r.includes("project") || r.includes("built") || r.includes("developed") || r.includes("created");
  if (hasProjects) { score += 30; signals.push("Projects demonstrated"); }
  else missing.push("No clear projects mentioned");

  // Transferable skills alignment with job
  const jobTokens = tokenize(j);
  const jobBigrams = extractBigrams(j);
  const transferable = ["data","analysis","reporting","documentation","budgeting","operations",
    "planning","coordination","management","leadership","communication","research",
    "tracking","systems","workflow","process","support"];
  const transferMatches = transferable.filter(t =>
    flexMatch(resumeTokens, resumeBigrams, t) && (jobTokens.includes(t) || jobBigrams.some(b => b.includes(t)))
  );
  if (transferMatches.length >= 4) { score += 35; signals.push("Strong transferable skills"); }
  else if (transferMatches.length >= 2) { score += 20; signals.push("Some transferable skills"); }
  else missing.push("Transferable experience not clearly visible");

  return { pct: Math.min(100, score), signals, missing };
}

function scoreSoftSkills(resumeTokens, resumeBigrams, jobText) {
  const jobTokens  = tokenize(jobText);
  const jobBigrams = extractBigrams(jobText);
  const relevant   = SOFT_SKILLS.filter(s =>
    flexMatch(jobTokens, jobBigrams, s) // only care about ones job mentions
  );
  if (relevant.length === 0) {
    // Job doesn't explicitly list soft skills — give baseline
    const baseline = SOFT_SKILLS.filter(s => flexMatch(resumeTokens, resumeBigrams, s));
    return { pct: Math.min(100, baseline.length * 14), matched: baseline, missing: [] };
  }
  const matched = relevant.filter(s => flexMatch(resumeTokens, resumeBigrams, s));
  const missing = relevant.filter(s => !flexMatch(resumeTokens, resumeBigrams, s));
  const pct = Math.min(100, Math.round((matched.length / Math.min(relevant.length, 8)) * 100));
  return { pct, matched, missing };
}

// ════════════════════════════════════════
// GAPS & SUGGESTIONS
// ════════════════════════════════════════

function buildGaps(jobText, resumeTokens, resumeBigrams, jobType) {
  const jobTokens  = tokenize(jobText);
  const jobBigrams = extractBigrams(jobText);

  // Required keywords from job (deduplicated, no noise, no bonus)
  const requiredPool = [...new Set([...jobTokens, ...jobBigrams])]
    .filter(w => !BONUS_KEYWORDS.some(b => w.includes(b)))
    .filter(w => w.length > 3);

  const gaps = requiredPool.filter(w => !flexMatch(resumeTokens, resumeBigrams, w));

  // Filter to only meaningful gaps (appear in KB or are multi-word)
  const allKB = Object.values(KB).flat();
  const meaningfulGaps = [...new Set(gaps.filter(g =>
    allKB.some(k => k.includes(g) || g.includes(k)) || g.includes(" ")
  ))].slice(0, 12);

  return meaningfulGaps;
}

function buildSuggestions(gaps, coreScore, eduScore, expScore, softScore, jobType) {
  const suggestions = [];

  if (coreScore.pct < 60) {
    const missing = KB[jobType]?.filter(k => !coreScore.matched.some(m => m.includes(k))).slice(0, 3) || [];
    if (missing.length) suggestions.push(`Add explicit skill mentions: ${missing.join(", ")}`);
  }
  if (gaps.some(g => g.includes("requirement") || g.includes("business requirement")))
    suggestions.push('Use the phrase "business requirements" or "requirements gathering" in your experience');
  if (gaps.some(g => g.includes("stakeholder")))
    suggestions.push('Add "stakeholder communication" or "cross-functional collaboration" to your experience bullets');
  if (gaps.some(g => g.includes("process")))
    suggestions.push('Include "process improvement" or "workflow optimization" in your work descriptions');
  if (gaps.some(g => g.includes("reporting") || g.includes("report")))
    suggestions.push('Explicitly mention "reporting and analysis" in your experience section');
  if (expScore.pct < 50)
    suggestions.push("Expand project descriptions with measurable outcomes and tools used");
  if (eduScore.pct < 60)
    suggestions.push("Add your degree, major, and any relevant certifications more prominently");
  if (softScore.pct < 50)
    suggestions.push('Include soft skill language: "collaborated with teams", "communicated findings", "organized and documented"');
  if (suggestions.length === 0)
    suggestions.push("Your resume is well-aligned. Consider quantifying achievements with numbers or percentages.");

  return suggestions.slice(0, 5);
}

function buildContextualNote(jobType, coreScore, softScore, expScore) {
  const typeLabel = {
    tech_data: "technical/data", business_analyst: "business analyst",
    marketing: "marketing", finance: "finance", general: "general"
  }[jobType] || "general";

  if (coreScore.pct >= 70 && softScore.pct < 50)
    return `You match the ${typeLabel} technical requirements well, but your resume could use more business analyst language — phrases like "requirements gathering," "stakeholder communication," and "process improvement" would strengthen it.`;
  if (coreScore.pct < 50 && softScore.pct >= 60)
    return `Your professional and soft skills are evident, but the resume would benefit from more explicit ${typeLabel} technical terminology to match this role's requirements.`;
  if (expScore.pct >= 70)
    return `Your experience and projects demonstrate strong practical alignment. Making sure your resume uses the exact terminology from the job description will further improve visibility.`;
  return `Your profile shows promising alignment with this ${typeLabel} role. Focus on mirroring the language of the job description in your experience bullets.`;
}

// ════════════════════════════════════════
// FILE READING
// ════════════════════════════════════════

function countWords(text) { const w = text.trim().match(/\b\w+\b/g); return w ? w.length : 0; }
function attachWordCounter(tid, cid) {
  const el = document.getElementById(tid), cnt = document.getElementById(cid);
  el.addEventListener("input", () => { const n = countWords(el.value); cnt.textContent = `${n} word${n!==1?"s":""}`; });
}
attachWordCounter("resume","resumeCount"); attachWordCounter("job","jobCount");

async function readFile(file, textareaId, statusId, countId) {
  const status = document.getElementById(statusId);
  const textarea = document.getElementById(textareaId);
  const countEl  = document.getElementById(countId);
  status.textContent = `Reading "${file.name}"…`;
  if (file.name.toLowerCase().endsWith(".pdf")) {
    try {
      const pdf = await pdfjsLib.getDocument({ data: await file.arrayBuffer() }).promise;
      let text = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        text += (await (await pdf.getPage(i)).getTextContent()).items.map(x=>x.str).join(" ") + "\n";
      }
      textarea.value = text.trim();
      const n = countWords(text);
      countEl.textContent = `${n} word${n!==1?"s":""}`;
      status.textContent  = `✓ PDF loaded — "${file.name}" (${pdf.numPages} pages, ${n} words)`;
    } catch(e) { status.textContent = `Could not read PDF. Please paste the text manually.`; }
  } else {
    const reader = new FileReader();
    reader.onload = e => {
      textarea.value = e.target.result;
      const n = countWords(e.target.result);
      countEl.textContent = `${n} word${n!==1?"s":""}`;
      status.textContent  = `✓ File loaded — "${file.name}" (${n} words)`;
    };
    reader.onerror = () => { status.textContent = `Could not read file.`; };
    reader.readAsText(file);
  }
}
document.getElementById("resumeFile").addEventListener("change", e => { if(e.target.files[0]) readFile(e.target.files[0],"resume","resumeFileStatus","resumeCount"); });
document.getElementById("jobFile").addEventListener("change",    e => { if(e.target.files[0]) readFile(e.target.files[0],"job","jobFileStatus","jobCount"); });

// ════════════════════════════════════════
// ANIMATIONS
// ════════════════════════════════════════

function animateRing(pct, color) {
  const ring = document.getElementById("ringFill");
  const numEl = document.getElementById("scoreNumber");
  const circumference = 326.7;
  ring.style.stroke = color;
  setTimeout(() => { ring.style.strokeDashoffset = circumference - (pct/100)*circumference; }, 150);
  let cur = 0;
  const step = Math.max(1, Math.ceil(pct/50));
  const t = setInterval(() => { cur = Math.min(cur+step, pct); numEl.textContent = cur; if(cur>=pct) clearInterval(t); }, 18);
}

function animateBar(id, pct, color, delay=0) {
  setTimeout(() => {
    const el = document.getElementById(id);
    if (el) { el.style.width = pct+"%"; el.style.background = color; }
  }, delay);
}

function scoreColor(pct) {
  if (pct >= 70) return "#2e7d52";
  if (pct >= 40) return "#c9860a";
  return "#c0392b";
}

function renderTags(containerId, words, cls="") {
  const c = document.getElementById(containerId);
  if (!c) return;
  c.innerHTML = "";
  if (!words || !words.length) {
    const t = document.createElement("span");
    t.className="tag"; t.textContent="None found"; t.style.opacity="0.4";
    c.appendChild(t); return;
  }
  words.slice(0,60).forEach((w,i)=>{
    const t = document.createElement("span");
    t.className = "tag " + cls;
    t.textContent = w;
    t.dataset.word = w.toLowerCase();
    t.style.animationDelay = `${i*0.016}s`;
    c.appendChild(t);
  });
}

// ════════════════════════════════════════
// MAIN ANALYZE
// ════════════════════════════════════════

let lastMissing = [], lastNoise = [], lastMatched = [];

document.getElementById("analyzeBtn").addEventListener("click", () => {
  const resumeRaw = document.getElementById("resume").value.trim();
  const jobRaw    = document.getElementById("job").value.trim();
  if (!resumeRaw) { shake(document.getElementById("resumeCard")); return; }
  if (!jobRaw)    { shake(document.getElementById("jobCard"));    return; }

  const resumeTokens  = tokenize(resumeRaw);
  const resumeBigrams = extractBigrams(resumeRaw);
  const jobType       = detectJobType(jobRaw);

  // Run all 4 scorers
  const core = scoreCoreSkills(resumeTokens, resumeBigrams, jobType);
  const edu  = scoreEducation(resumeRaw, jobRaw);
  const exp  = scoreExperience(resumeRaw, jobRaw, resumeTokens, resumeBigrams);
  const soft = scoreSoftSkills(resumeTokens, resumeBigrams, jobRaw);

  // Bonus check (doesn't affect score)
  const bonusFound = BONUS_KEYWORDS.filter(b => flexMatch(resumeTokens, resumeBigrams, b));

  // Weighted final score
  const final = Math.round(
    (core.pct * 0.40) +
    (edu.pct  * 0.20) +
    (exp.pct  * 0.25) +
    (soft.pct * 0.15)
  );

  const finalColor = scoreColor(final);
  const finalLabel = final >= 70 ? "Strong Match" : final >= 40 ? "Good Match" : "Developing Match";

  // Gaps & suggestions
  const gaps = buildGaps(jobRaw, resumeTokens, resumeBigrams, jobType);
  const suggestions = buildSuggestions(gaps, core, edu, exp, soft, jobType);
  const note = buildContextualNote(jobType, core, soft, exp);

  // Noise (filler words found in job)
  lastNoise   = [...new Set((jobRaw.toLowerCase().match(/\b[a-z]{3,}\b/g)||[]).filter(w=>NOISE.has(w)))];
  lastMatched = core.matched;
  lastMissing = gaps;

  // ── Render UI ──
  const resultsEl = document.getElementById("results");
  resultsEl.classList.remove("hidden");
  resultsEl.scrollIntoView({ behavior:"smooth", block:"start" });

  // Score card
  document.getElementById("scoreNumber").textContent  = "0";
  document.getElementById("scoreLabel").textContent   = finalLabel;
  document.getElementById("scoreTier").textContent    = jobType.replace("_"," / ").toUpperCase() + " ROLE";
  document.getElementById("scoreEncourage").textContent = getEncouragement(final);
  document.getElementById("contextNote").textContent  = note;
  animateRing(final, finalColor);
  document.getElementById("progressValue").textContent = final + "%";
  document.getElementById("progressValue").style.color = finalColor;
  animateBar("progressBar", final, finalColor, 200);
  document.getElementById("progressNeedle").style.left = `calc(${Math.min(100,final)}% - 1.5px)`;

  // Category bars
  const cats = [
    { bar:"coreBar",  val:core.pct,  label:"coreLabel"  },
    { bar:"eduBar",   val:edu.pct,   label:"eduLabel"   },
    { bar:"expBar",   val:exp.pct,   label:"expLabel"   },
    { bar:"softBar",  val:soft.pct,  label:"softLabel"  },
  ];
  cats.forEach(({bar,val,label},i) => {
    animateBar(bar, val, scoreColor(val), 300+i*100);
    const el = document.getElementById(label);
    if(el) el.textContent = val+"%";
  });

  // Strengths
  const strengths = [...new Set([...core.matched.slice(0,8), ...(soft.matched||[]).slice(0,4), ...edu.signals.slice(0,3)])];
  renderTags("strengthsList", strengths, "tag-matched");

  // Gaps
  renderTags("gapsList", gaps.slice(0,10), "tag-missing");

  // Bonus
  const bonusEl = document.getElementById("bonusList");
  if (bonusEl) {
    bonusEl.innerHTML = "";
    if (bonusFound.length) {
      bonusFound.forEach((b,i)=>{
        const t = document.createElement("span");
        t.className = "tag tag-bonus";
        t.textContent = b;
        t.style.animationDelay = `${i*0.016}s`;
        bonusEl.appendChild(t);
      });
    } else {
      const t = document.createElement("span");
      t.className="tag"; t.textContent="None found (not penalized)"; t.style.opacity="0.4";
      bonusEl.appendChild(t);
    }
  }

  // Suggestions
  const suggEl = document.getElementById("suggestionsList");
  if (suggEl) {
    suggEl.innerHTML = "";
    suggestions.forEach((s,i)=>{
      const li = document.createElement("li");
      li.innerHTML = s;
      li.style.animationDelay = `${i*0.08}s`;
      suggEl.appendChild(li);
    });
  }

  // Feedback tip
  document.getElementById("feedbackTip").innerHTML = getFeedbackTip(gaps);

  // Filler accordion
  document.getElementById("noiseCount").textContent = lastNoise.length;
  renderTags("noiseList", lastNoise, "tag-noise");

  clearKeywordSearch();
});

function getEncouragement(score) {
  if (score >= 70) return "Excellent alignment — this resume is competitive for this role.";
  if (score >= 55) return "Strong foundation here. A few targeted additions could make this highly competitive.";
  if (score >= 40) return "Good alignment in key areas. Addressing the gaps below will significantly strengthen the match.";
  if (score >= 25) return "Some alignment present. Tailoring the resume more closely to this role is recommended.";
  return "Limited alignment at this stage. Review the gaps and suggestions carefully before applying.";
}

function getFeedbackTip(gaps) {
  if (!gaps.length) return "All key requirements from the job description appear to be addressed.";
  const top = gaps.slice(0,4).map(g=>`<strong>${g}</strong>`).join(", ");
  return `💡 <em>Consider incorporating these terms into your resume:</em> ${top}.`;
}

// ── Filler accordion ──
document.getElementById("fillerToggle").addEventListener("click", () => {
  const body = document.getElementById("fillerBody");
  const acc  = document.getElementById("fillerAccordion");
  const open = !body.classList.contains("hidden");
  body.classList.toggle("hidden", open);
  acc.classList.toggle("open", !open);
  document.querySelector(".filler-toggle span:first-child").textContent = open ? "Show filtered words" : "Hide filtered words";
});

// ── Keyword search ──
let filterActive = false;
function runKeywordSearch(query) {
  if (!query) { clearKeywordSearch(); return; }
  const q = query.toLowerCase().trim(), qStem = stem(q);
  const inMatched = lastMatched.some(w => w.toLowerCase().includes(q) || stem(w).includes(qStem));
  const inMissing = lastMissing.some(w => w.toLowerCase().includes(q) || stem(w).includes(qStem));
  const resultEl = document.getElementById("keywordResult");
  if (inMatched)      resultEl.innerHTML = `<span class="kw-found">✓ "<strong>${query}</strong>" is covered in the matched skills.</span>`;
  else if (inMissing) resultEl.innerHTML = `<span class="kw-missing">✗ "<strong>${query}</strong>" appears in the gaps — consider adding it.</span>`;
  else                resultEl.innerHTML = `<span class="kw-unknown">— "<strong>${query}</strong>" was not found in either list.</span>`;
  document.querySelectorAll(".tag[data-word]").forEach(tag => {
    const hit = tag.dataset.word.includes(q) || stem(tag.dataset.word).includes(qStem);
    tag.classList.toggle("tag-highlight", hit);
    if (filterActive) tag.style.display = hit ? "" : "none";
  });
  document.getElementById("keywordClearBtn").classList.remove("hidden");
}
function clearKeywordSearch() {
  const el = document.getElementById("keywordSearch");
  if(el) el.value="";
  const re = document.getElementById("keywordResult");
  if(re) re.innerHTML="";
  document.getElementById("keywordClearBtn").classList.add("hidden");
  document.querySelectorAll(".tag[data-word]").forEach(t=>{ t.classList.remove("tag-highlight"); t.style.display=""; });
  filterActive=false;
  document.getElementById("keywordFilterBtn").textContent="Filter";
}
document.getElementById("keywordSearch").addEventListener("input",   e=>runKeywordSearch(e.target.value.trim()));
document.getElementById("keywordSearch").addEventListener("keydown", e=>{ if(e.key==="Enter") runKeywordSearch(e.target.value.trim()); });
document.getElementById("keywordFilterBtn").addEventListener("click", ()=>{
  const q=document.getElementById("keywordSearch").value.trim();
  if(!q) return;
  filterActive=!filterActive;
  document.getElementById("keywordFilterBtn").textContent=filterActive?"Show All":"Filter";
  runKeywordSearch(q);
});
document.getElementById("keywordClearBtn").addEventListener("click", clearKeywordSearch);

// ── Reset ──
document.getElementById("resetBtn").addEventListener("click", ()=>{
  ["resume","job"].forEach(id=>{ document.getElementById(id).value=""; });
  ["resumeCount","jobCount"].forEach(id=>{ document.getElementById(id).textContent="0 words"; });
  ["resumeFileStatus","jobFileStatus"].forEach(id=>{ document.getElementById(id).textContent=""; });
  document.getElementById("results").classList.add("hidden");
  document.getElementById("ringFill").style.strokeDashoffset="326.7";
  document.getElementById("scoreNumber").textContent="0";
  ["progressBar","coreBar","eduBar","expBar","softBar"].forEach(id=>{
    const el=document.getElementById(id); if(el){el.style.width="0%";}
  });
  document.getElementById("progressNeedle").style.left="0%";
  document.getElementById("progressValue").textContent="0%";
  document.getElementById("feedbackTip").innerHTML="";
  lastMatched=[]; lastMissing=[]; lastNoise=[];
  clearKeywordSearch();
  window.scrollTo({top:0,behavior:"smooth"});
});

// ── Quick search chips ──
document.querySelectorAll(".quick-chip").forEach(chip=>{
  chip.addEventListener("click",()=>{
    const q=chip.dataset.q;
    document.getElementById("searchInput").value=q;
    window.open(`https://www.google.com/search?q=${encodeURIComponent(q)}`,"_blank");
  });
});

// ── Shake ──
function shake(el) {
  el.style.animation="none"; el.style.borderColor="rgba(192,57,43,0.5)";
  el.offsetHeight; el.style.animation="shake 0.4s ease";
  setTimeout(()=>{el.style.borderColor="";el.style.animation="";},600);
}
const ss=document.createElement("style");
ss.textContent=`@keyframes shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-5px)}40%{transform:translateX(5px)}60%{transform:translateX(-3px)}80%{transform:translateX(3px)}}`;
document.head.appendChild(ss);