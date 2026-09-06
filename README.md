# National Learning Portal — SIH 2026

**Smart India Hackathon 2026**
**Ministry:** Ministry of Statistics & Programme Implementation (MoSPI)
**Team Name:** [Insert Team Name]

## 📜 Problem Statement
"Develop an AI enabled learning platform that identifies competency gaps, recommends personalized training through integration with the iGOT Karmayogi ecosystem, and capable of generating Quizzes and Multiple choice questions (MCQs) from uploaded learning materials to strengthen capacity building in India's Official Statistical System."

## 🚀 What We Are Doing
We are building a comprehensive, AI-powered capacity building platform tailored for MoSPI officials. Our solution bridges the gap between current skills and required competencies by leveraging the iGOT Karmayogi learning ecosystem. 

**Key Features:**
1. **Competency Gap Analysis:** Automatically assesses an official's proficiency across key domains (Statistical Methods, Data Management, Digital Tools, Domain Knowledge).
2. **AI Course Recommendations:** Uses FAISS vector search and Google Gemini to map specific skill gaps to the most relevant courses in the iGOT Karmayogi catalog.
3. **Smart Assessments (PDF to Quiz):** Allows admins and officials to upload any training manual or PDF. The platform uses AI to instantly read the document and generate targeted Multiple Choice Questions (MCQs) to evaluate comprehension.
4. **Role-Based Dashboards:** Dedicated views for Officers (to track personal learning) and Administrators (to monitor organizational gaps and course effectiveness).

## 🛠️ Tech Stack
**Frontend:**
- Next.js 14 (App Router)
- React & Tailwind CSS
- Recharts (for Data Visualization)

**Backend:**
- FastAPI (Python)
- SQLite (Relational Data) & NetworkX (Graph Data)

**AI & Machine Learning:**
- Google Gemini (gemini-1.5-flash) via Instructor
- FAISS (Facebook AI Similarity Search)
- Sentence-Transformers (`all-MiniLM-L6-v2` for embeddings)
