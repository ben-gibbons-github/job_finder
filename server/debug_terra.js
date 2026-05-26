const fs = require('fs');

async function debug() {
  const html = fs.readFileSync('terra_search.html', 'utf8');
  const findMatches = (keyword) => {
    let matches = [];
    let pos = 0;
    while ((pos = html.indexOf(keyword, pos)) !== -1) {
      const start = Math.max(0, pos - 150);
      const end = Math.min(html.length, pos + 150);
      matches.push(html.substring(start, end));
      pos += keyword.length;
      if (matches.length >= 5) break;
    }
    return matches;
  };

  console.log('--- Matches for "job_title" ---');
  findMatches('job_title').forEach((snippet, i) => {
    console.log(`Snippet ${i + 1}:\n${snippet}\n---`);
  });

  console.log('\n--- Matches for "job_url" ---');
  findMatches('job_url').forEach((snippet, i) => {
    console.log(`Snippet ${i + 1}:\n${snippet}\n---`);
  });
}

debug();
