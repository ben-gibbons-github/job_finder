/**
 * Search the public web and return normalized top results.
 */
export async function searchWeb(query, maxResults = 5) {
    const apiKey = process.env.TAVILY_API_KEY;
    if (!apiKey || query.trim().length === 0) {
        return [];
    }
    const response = await fetch('https://api.tavily.com/search', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            api_key: apiKey,
            query,
            search_depth: 'basic',
            max_results: maxResults,
            include_answer: false,
            include_images: false,
        }),
    });
    if (!response.ok) {
        throw new Error(`Tavily API error: ${response.status} ${response.statusText}`);
    }
    const data = (await response.json());
    const rawResults = data.results ?? [];
    return rawResults
        .filter((item) => typeof item.url === 'string' && item.url.length > 0)
        .slice(0, maxResults)
        .map((item) => ({
        title: item.title?.trim() || 'Untitled',
        url: item.url,
        snippet: item.content?.trim() || '',
    }));
}
export function formatWebResultsForPrompt(results) {
    if (results.length === 0) {
        return 'No web sources available.';
    }
    return results
        .map((result, index) => {
        return `${index + 1}) ${result.title}\nURL: ${result.url}\nSnippet: ${result.snippet}`;
    })
        .join('\n\n');
}
