import { fetchJson, normalizeJobsWithCoordinates, parseCsvEnv, } from './PortalIngestionUtils.js';
const MAX_PAGINATION_REQUESTS = 100;
function toArray(payload) {
    if (Array.isArray(payload)) {
        return payload;
    }
    if (payload && typeof payload === 'object') {
        const obj = payload;
        if (Array.isArray(obj.jobs)) {
            return obj.jobs;
        }
        if (Array.isArray(obj.results)) {
            return obj.results;
        }
        if (Array.isArray(obj.data)) {
            return obj.data;
        }
    }
    return [];
}
function mapGenericRecord(record, source) {
    const title = record.title ||
        record.name ||
        record.position ||
        record.role ||
        '';
    const url = record.url ||
        record.absolute_url ||
        record.hostedUrl ||
        record.apply_url ||
        '';
    if (!title || !url) {
        return null;
    }
    const company = record.company ||
        record.company_name ||
        record.organization ||
        source;
    const location = record.location ||
        record.locations?.[0] ||
        'Remote';
    const description = record.description ||
        record.summary ||
        '';
    const posted = record.posted ||
        record.datePosted ||
        record.created_at ||
        record.updated_at ||
        undefined;
    const tags = Array.isArray(record.tags)
        ? record.tags
        : Array.isArray(record.categories)
            ? record.categories
            : [];
    return {
        title,
        company,
        location,
        remote: 'Unknown',
        type: record.type || record.jobType || 'Full-time',
        sourceUrl: url,
        posted,
        description,
        tags,
    };
}
function asObject(value) {
    return value && typeof value === 'object' ? value : null;
}
function toAbsoluteUrl(baseUrl, candidate) {
    if (typeof candidate !== 'string' || candidate.trim().length === 0) {
        return null;
    }
    try {
        return new URL(candidate, baseUrl).toString();
    }
    catch {
        return null;
    }
}
function extractNextUrls(payload, currentUrl) {
    const out = new Set();
    const root = asObject(payload);
    if (!root) {
        return [];
    }
    const directCandidates = [
        root.next,
        root.next_url,
        root.nextPage,
        root.next_page,
    ];
    for (const candidate of directCandidates) {
        const absolute = toAbsoluteUrl(currentUrl, candidate);
        if (absolute) {
            out.add(absolute);
        }
    }
    const links = asObject(root.links);
    if (links) {
        const linkCandidates = [
            links.next,
            links.next_url,
            links.next_page,
            links.next_page_url,
        ];
        for (const candidate of linkCandidates) {
            const absolute = toAbsoluteUrl(currentUrl, candidate);
            if (absolute) {
                out.add(absolute);
            }
        }
    }
    const pagination = asObject(root.pagination);
    if (pagination) {
        const absolute = toAbsoluteUrl(currentUrl, pagination.next);
        if (absolute) {
            out.add(absolute);
        }
    }
    return Array.from(out);
}
export async function fetchPortalJobsFromEndpointList(options) {
    const endpointList = parseCsvEnv(process.env[options.envVar]);
    if (endpointList.length === 0) {
        console.warn(`[${options.source}] No endpoints configured in ${options.envVar}; skipping direct endpoint ingestion.`);
        return [];
    }
    const normalized = [];
    for (const endpoint of endpointList) {
        const visited = new Set();
        const queue = [endpoint];
        let requests = 0;
        while (queue.length > 0 && requests < MAX_PAGINATION_REQUESTS) {
            const current = queue.shift();
            if (visited.has(current)) {
                continue;
            }
            visited.add(current);
            requests += 1;
            try {
                const payload = await fetchJson(current);
                const rows = toArray(payload);
                for (const row of rows) {
                    const mapped = mapGenericRecord(row, options.source);
                    if (mapped) {
                        normalized.push(mapped);
                    }
                }
                const nextUrls = extractNextUrls(payload, current);
                for (const nextUrl of nextUrls) {
                    if (!visited.has(nextUrl)) {
                        queue.push(nextUrl);
                    }
                }
            }
            catch (error) {
                console.warn(`[${options.source}] Failed endpoint ${current}:`, String(error));
            }
        }
    }
    return normalizeJobsWithCoordinates(options.source, normalized);
}
