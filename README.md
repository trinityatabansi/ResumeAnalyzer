#  Resume-to-Job Match Analyzer

An intelligent resume analysis tool that evaluates how well a candidate's resume aligns with a job description using a **weighted, category-based scoring system**.

Designed for **students, recent graduates, and early-career professionals**, this tool provides **fair, explainable, and actionable feedback** — not just a raw keyword score.

---

##  What This Project Does

This application analyzes:
- A resume (paste text or upload `.txt` / `.pdf`)
- A job description (paste text or upload `.txt` / `.pdf`)

And returns:
-  **Match score** — fair, weighted, not a raw keyword count
-  **Category breakdown** — Core Skills, Experience, Education, Professional Skills
-  **Strengths** — what aligns well with the role
-  **Gaps** — key terms missing from the resume
- **Bonus skills** — detected but not penalized if absent
-  **Suggestions** — actionable, specific resume improvements
-  **Skill search** — type any skill to instantly check if it's matched or missing

---

##  Why This Project Is Useful

Most resume tools:
-  Over-penalize missing keywords
-  Count irrelevant job description text toward the score
-  Treat all words equally regardless of importance
-  Provide unclear or misleading percentages

This tool solves that by:
-  Using a **weighted, category-based scoring model**
-  Filtering out **noise** (company names, locations, filler text)
-  Treating **bonus frameworks** (Agile, SDLC, UAT) as optional — missing them does not hurt your score
-  Applying **flexible matching** — "data tracking" ≈ "data analysis", "structured records" ≈ "documentation"
-  Detecting **job type** (Tech/Data, Business Analyst, Marketing, Finance, General) and adjusting keyword priorities accordingly
  -  Providing **real hiring-style feedback**, not just a number

---

##  How It Works

###  Scoring Model

The system evaluates resumes using four weighted categories:

| Category               | Weight | What It Checks                                              |
|------------------------|--------|-------------------------------------------------------------|
| Core Skills            | 40%    | Technical tools, software, domain-specific hard skills      |
| Experience & Projects  | 25%    | Work history, project relevance, transferable skills        |
| Education Fit          | 20%    | Degree presence, field relevance, certifications            |
| Professional Skills    | 15%    | Communication, collaboration, organization, problem-solving |

**Final Score Formula:**
```
Score = (CoreSkills × 0.40) + (EducationFit × 0.20) + (Experience × 0.25) + (SoftSkills × 0.15)
```

---

### ⚙️ Key Features

-  **Deduplicates keywords** — no repetition bias
-  **Filters noise** — removes filler words, company names, locations, marketing copy
-  **Weights required skills higher** than preferred or contextual mentions
- **Bonus skills** — tools like Agile, Scrum, SDLC, UAT are rewarded if present but never penalized if missing
-  **Flexible matching** — stemming + synonym mapping (e.g., "managing" ≈ "management", "analytical" ≈ "analysis")
-  **Job type detection** — auto-classifies the role and loads a tailored skill dictionary
-  **PDF & TXT upload** — supports file uploads using PDF.js (no server required)
-  **Live skill search** — Ctrl+F style search across all matched and missing keywords
-  **Google search integration** — research missing skills directly from the tool

---

## 📊 Example Output

**Input:**
- Resume: Business Administration graduate, IBM Data Analyst Certified, Excel, SQL, Python, Tableau, data analysis experience
- Job: Entry-Level Business Analyst — requires Excel, SQL, data analysis, documentation, Microsoft Office, communication

**Output:**
```
Overall Match:     Good Match — 74%

Core Skills:       85%   ██████████████████░░
Experience:        80%   ████████████████░░░░
Education Fit:     90%   ██████████████████░░
Professional:      60%   ████████████░░░░░░░░

✦ Strengths:       excel, sql, python, data analysis, microsoft office,
                   ibm certification, business administration degree

 Gaps:           business requirements, stakeholder communication,
                   process improvement, functional specifications

 Bonus Found:    None detected (does not affect score)

 Suggestions:
→ Add "business requirements" or "requirements gathering" to experience bullets
→ Include "stakeholder communication" or "cross-functional collaboration"
→ Use "process improvement" or "workflow optimization" in work descriptions
→ Mention "reporting and analysis" explicitly in your experience section
```

---

## 🛠️ Tech Stack

| Technology | Purpose                          |
|------------|----------------------------------|
| HTML5      | Structure and layout             |
| CSS3       | Styling — Gold/White/Black theme |
| JavaScript | Scoring engine, NLP logic, UI    |
| PDF.js     | Client-side PDF text extraction  |
| Google Fonts | Cormorant Garamond + Crimson Text |

> **No backend. No server. No API keys required.** Everything runs entirely in the browser.

---

##  Getting Started

### Option 1 — Open Locally
```bash
git clone https://github.com/YOUR_USERNAME/resume-analyzer.git
cd resume-analyzer
open index.html
```
No install needed. Just open `index.html` in any modern browser.

### Option 2 — Deploy on Vercel (Recommended)
1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → Import Project
3. Select this repository
4. Click **Deploy** — live in ~30 seconds

---

##  Project Structure

```
resume-analyzer/
├── index.html      # Main UI — structure, layout, all sections
├── style.css       # Gold/White/Black professional theme
└── script.js       # Scoring engine, NLP logic, file reader, UI controller
```

---

##  Target Users

| User          | How They Use It                                                   |
|---------------|-------------------------------------------------------------------|
| **Applying**  | Paste their resume + a job posting → get a score and improve it  |
| **Hiring**    | Paste a candidate's resume + job description → assess fit quickly |



## 👤 Author

**Trinity Atabansi**
- 💼 LinkedIn: Trinity Atabansi




## 📄 License

MIT License — free to use, modify, and distribute.

---

*Built with GoalMine — turning goals into action.*
