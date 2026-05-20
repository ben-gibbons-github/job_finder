import ClimateBaseScraper from './ClimateBase.js';
describe('ClimateBaseScraper', () => {
    it('should populate all ScrapedJob fields', async () => {
        const scraper = new ClimateBaseScraper();
        const mockHtml = `
      <div data-job-id="1">
        <h2>Senior Software Engineer</h2>
        <span class="company">GreenTech Inc</span>
        <span class="location">San Francisco</span>
        <p class="description">Lead our sustainability initiatives</p>
        <span class="job-type">Full-time</span>
        <time datetime="2024-05-10T00:00:00Z"></time>
        <a href="/jobs/123">View Job</a>
        <span class="tag">Climate Tech</span>
        <span class="tag">Remote</span>
      </div>
    `;
        global.fetch = async () => ({ ok: true, text: async () => mockHtml });
        const jobs = await scraper.scrapeJobs();
        expect(jobs.length).toBeGreaterThan(0);
        const job = jobs[0];
        const requiredFields = [
            'name', 'company_name', 'location', 'location_lat', 'location_lon',
            'description', 'type', 'source', 'source_url', 'posted',
            'impact_number', 'audit_number', 'audit_text', 'tags',
            'ai_summary', 'ai_red_flag_summary', 'ai_score', 'ai_red_flag_score',
        ];
        for (const field of requiredFields) {
            expect(field in job).toBe(true);
        }
    });
    it('should have correct field types', async () => {
        const scraper = new ClimateBaseScraper();
        const mockHtml = `
      <div data-job-id="1">
        <h2>Engineer</h2>
        <span class="company">Company</span>
        <span class="location">Location</span>
        <p class="description">Description</p>
        <span class="job-type">Full-time</span>
        <time datetime="2024-05-10T00:00:00Z"></time>
        <a href="/jobs/1">View</a>
      </div>
    `;
        global.fetch = async () => ({ ok: true, text: async () => mockHtml });
        const jobs = await scraper.scrapeJobs();
        const job = jobs[0];
        expect(typeof job.name).toBe('string');
        expect(typeof job.company_name).toBe('string');
        expect(typeof job.location_lat).toBe('number');
        expect(typeof job.location_lon).toBe('number');
        expect(typeof job.impact_number).toBe('number');
        expect(Array.isArray(job.tags)).toBe(true);
    });
    it('should have non-empty critical fields', async () => {
        const scraper = new ClimateBaseScraper();
        const mockHtml = `
      <div data-job-id="1">
        <h2>Product Manager</h2>
        <span class="company">GreenCorp</span>
        <span class="location">Berlin</span>
        <p class="description">Manage our product strategy</p>
        <span class="job-type">Full-time</span>
        <time datetime="2024-05-10T00:00:00Z"></time>
        <a href="/jobs/123">Apply</a>
      </div>
    `;
        global.fetch = async () => ({ ok: true, text: async () => mockHtml });
        const jobs = await scraper.scrapeJobs();
        const job = jobs[0];
        expect(job.name.length).toBeGreaterThan(0);
        expect(job.company_name.length).toBeGreaterThan(0);
        expect(job.location.length).toBeGreaterThan(0);
        expect(job.source.length).toBeGreaterThan(0);
        expect(job.source_url.length).toBeGreaterThan(0);
    });
});
