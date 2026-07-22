
🏀 ShoeFinder

A full-stack basketball shoe recommendation system that matches users to the right shoe based on natural language descriptions.

What it does

Type in what you're looking for — "I have wide feet and play outdoors" — and ShoeFinder will recommend the best matching basketball shoes from a database of 300+ reviewed shoes, ranked by a weighted scoring algorithm.

How it works
Data Collection — A web scraper built with Axios and Cheerio pulls performance ratings and reviewer comments from The Hoops Geek, a multi-reviewer basketball shoe platform
AI Processing — Groq AI summarizes unstructured reviewer text and infers numerical scores for categories like traction, cushion, and wide foot suitability
Recommendation Engine — A weighted scoring algorithm interprets the user's natural language query, infers importance weights per category, and ranks shoes using a match score formula with hard constraints for critical requirements
Automated Updates — A GitHub Actions cron job runs monthly to check for new shoe reviews and automatically updates the database
Tech Stack
Frontend — Next.js, React, TypeScript, Tailwind CSS
Backend — Node.js, Next.js API Routes
Database — PostgreSQL, Supabase
AI — Groq AI (llama-3.3-70b)
Scraping — Axios, Cheerio
DevOps — GitHub Actions, Cron Jobs
Getting Started
Prerequisites
Node.js 20+
PostgreSQL
Groq API key
Supabase account
Installation
bash
git clone https://github.com/hanshin0613/shoe-finder
cd shoe-finder
npm install
cd shoefinder
npm install
Environment Variables

Create a .env file in the root folder:

GROQ_API_KEY=your_groq_key
POSTGRES_URL_NON_POOLING=your_postgres_connection_string

Create a .env.local file in the shoefinder folder:

DATABASE_URL=your_postgres_connection_string
Running the scraper
bash
node PageScraper.js
Running the website
bash
cd shoefinder
npm run dev

Open http://localhost:3000

Project Structure
shoe-finder/
├── PageScraper.js        ← scrapes shoe data and inserts into database
├── LinkScraper.js        ← checks for new shoe links monthly
├── links.json            ← cached list of shoe URLs
├── .github/
│   └── workflows/
│       └── monthly-scrape.yml  ← GitHub Actions cron job
└── shoefinder/           ← Next.js app
    ├── app/
    │   ├── page.tsx      ← frontend
    │   └── api/chat/
    │       └── route.ts  ← backend API
    └── lib/
        └── db.ts         ← database connection
Lessons Learned

This was my first full-stack project, built entirely through self-directed learning. Key challenges included managing Supabase egress limits, handling AI rate limiting gracefully, and designing a scoring algorithm that accurately reflects user preferences from natural language input.
