import { askGeminiWithSearch } from './AskLLM.js'

function isQuotaError(error: unknown): boolean {
  const text = String(error).toLowerCase()
  return (
    text.includes('resource_exhausted') ||
    text.includes('quota exceeded') ||
    text.includes('request failed (429)')
  )
}

async function main() {
  const questions = [
    'What is the difference between event-driven and streaming architectures?'
  ];
  try {
    const answers = await askGeminiWithSearch(questions);
    for (const { question, answer } of answers) {
      console.log(`Q: ${question}\nA: ${answer}\n`);
    }
  } catch (err) {
    if (isQuotaError(err)) {
      console.error('Gemini quota/rate limit reached. Please retry later or increase your Gemini API quota.')
      return
    }
    console.error('Error:', err);
    process.exit(1);
  }
}

main();
