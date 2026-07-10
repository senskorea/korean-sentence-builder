# Korean Sentence Builder 🇰🇷

A modern, interactive, and AI-powered web application for learning and building Korean sentences block by block.

## Features
- **Visual Sentence Construction**: Drag, drop, and click to form grammatically correct sentences.
- **AI Topic Generator**: Type any topic (e.g., "ordering coffee") and instantly populate the app with relevant subjects, objects, and verbs using Gemini AI.
- **Dynamic Conjugation**: Automatically conjugate verbs into past, present, future, and desiderative forms based on context.
- **Bilingual Copying**: One-click copy of sentences to clipboard in Korean-only or Bilingual formats.
- **Text-to-Speech**: Built-in audio playback for pronunciation practice.
- **History Tracking**: Save your favorite generated sentences and topics.

## Run Locally

**Prerequisites:** Node.js

1. Clone the repository and install dependencies:
   ```bash
   npm install
   ```

2. Set up your environment variables:
   Rename `.env.example` to `.env` (or create a `.env` file) and add your Gemini API key:
   ```env
   VITE_GEMINI_API_KEY=your_api_key_here
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.