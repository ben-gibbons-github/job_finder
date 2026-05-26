const DEFAULT_FETCH_TIMEOUT_MS = 30_000;
export function stripHtmlTags(value) {
    return value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}
export async function fetchHtml(url) {
    try {
        const response = await fetch(url, {
            method: 'GET',
            signal: AbortSignal.timeout(DEFAULT_FETCH_TIMEOUT_MS),
            headers: {
                Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
                'Cache-Control': 'no-cache',
                Pragma: 'no-cache',
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36',
            },
        });
        if (!response.ok) {
            return null;
        }
        return response.text();
    }
    catch {
        return null;
    }
}
export async function collectPaginatedHtmlJobs(options) {
    const jobs = [];
    const seenUrls = new Set();
    for (let page = 1; page <= options.maxPages; page += 1) {
        const url = options.pageUrl(page);
        const html = await fetchHtml(url);
        if (!html) {
            if (page === 1) {
                return [];
            }
            break;
        }
        const pageJobs = options.parseJobs(html, page);
        if (pageJobs.length === 0) {
            break;
        }
        let added = 0;
        for (const job of pageJobs) {
            if (!job.sourceUrl || seenUrls.has(job.sourceUrl)) {
                continue;
            }
            seenUrls.add(job.sourceUrl);
            jobs.push(job);
            added += 1;
        }
        if (added === 0) {
            break;
        }
        if (options.hasNextPage && !options.hasNextPage(html, page)) {
            break;
        }
    }
    return jobs;
}
