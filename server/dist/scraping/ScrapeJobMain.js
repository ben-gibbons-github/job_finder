import ClimateBaseScraper from './ClimateBase.js';
import GreenhouseScraper from './Greenhouse.js';
import LeverScraper from './Lever.js';
import AshbyScraper from './Ashby.js';
import BreezyScraper from './Breezy.js';
import BambooScraper from './Bamboo.js';
import BuiltInScraper from './BuiltIn.js';
import BuiltInGreenTechScraper from './BuiltInGreenTech.js';
import TerraScraper from './Terra.js';
import EightyKHoursScraper from './EightyKHours.js';
import RemoteOKScraper from './RemoteOK.js';
import ArbeitNowScraper from './ArbeitNow.js';
import MuseumScraper from './Museum.js';
import JobForGoodScraper from './JobForGood.js';
import GlobalJobsScraper from './GlobalJobs.js';
import CharityJobScraper from './CharityJob.js';
import EnvironmentJobScraper from './EnvironmentJob.js';
import ImpactPoolScraper from './ImpactPool.js';
import TechJobsForGoodScraper from './TechJobsForGood.js';
import EthicalJobsScraper from './EthicalJobs.js';
import ImpactOpportunityScraper from './ImpactOpportunity.js';
import EscapeTheCityScraper from './EscapeTheCity.js';
import CharityPeopleScraper from './CharityPeople.js';
import DevNetJobsStandardScraper from './DevNetJobsStandard.js';
import DevNetJobsHighlightedScraper from './DevNetJobsHighlighted.js';
import DevNetJobsHomeScraper from './DevNetJobsHome.js';
import GlobalJobsRssScraper from './GlobalJobsRSS.js';
import RemoteCoRssScraper from './RemoteCoRSS.js';
import JobicyRssScraper from './JobicyRSS.js';
import DynamiteJobsRssScraper from './DynamiteJobsRSS.js';
import CharityVolunteerJobsScraper from './CharityVolunteerJobs.js';
import CharityVillageScraper from './CharityVillage.js';
import IdealistNonprofitJobsScraper from './IdealistNonprofitJobs.js';
import IdealistVolunteerOpportunitiesScraper from './IdealistVolunteerOpportunities.js';
import ArtsJobsScraper from './ArtsJobs.js';
import WeWorkRemotelyDesignScraper from './WeWorkRemotelyDesign.js';
import CharityJobCreativeScraper from './CharityJobCreative.js';
import WeWorkRemotelyProgrammingScraper from './WeWorkRemotelyProgramming.js';
import WeWorkRemotelyCustomerSupportScraper from './WeWorkRemotelyCustomerSupport.js';
import WeWorkRemotelyProductScraper from './WeWorkRemotelyProduct.js';
import WeWorkRemotelySalesMarketingScraper from './WeWorkRemotelySalesMarketing.js';
import RemoteOKDeveloperScraper from './RemoteOKDeveloper.js';
import RemoteOKSupportScraper from './RemoteOKSupport.js';
import RemoteOKMarketingScraper from './RemoteOKMarketing.js';
import RemoteOKDesignScraper from './RemoteOKDesign.js';
import RemoteOKProductScraper from './RemoteOKProduct.js';
import RemoteOKDataScraper from './RemoteOKData.js';
import RemoteOKSalesScraper from './RemoteOKSales.js';
import RemoteOKFinanceScraper from './RemoteOKFinance.js';
import RemoteOKHRScraper from './RemoteOKHR.js';
import RemoteOKLegalScraper from './RemoteOKLegal.js';
import RemoteOKOperationsScraper from './RemoteOKOperations.js';
import RemoteOKWritingScraper from './RemoteOKWriting.js';
import RemoteOKEducationScraper from './RemoteOKEducation.js';
import HealthECareersScraper from './HealthECareers.js';
import JMIRCareersScraper from './JMIRCareers.js';
import APHACareersScraper from './APHACareers.js';
import PhysicsTodayMedicalImagingScraper from './PhysicsTodayMedicalImaging.js';
import RSNACareerConnectScraper from './RSNACareerConnect.js';
import ASHPCareerPharmScraper from './ASHPCareerPharm.js';
import ACCCareerCenterScraper from './ACCCareerCenter.js';
import MedDeviceJobsScraper from './MedDeviceJobs.js';
import BioTalentJobsScraper from './BioTalentJobs.js';
import BioSpaceRssScraper from './BioSpaceRSS.js';
import BioSpaceDataRssScraper from './BioSpaceDataRSS.js';
import BioSpaceEngineerRssScraper from './BioSpaceEngineerRSS.js';
import BioSpaceSoftwareRssScraper from './BioSpaceSoftwareRSS.js';
import PharmiwebRssScraper from './PharmiwebRSS.js';
import APICCareersScraper from './APICCareers.js';
import FACSSurgeryCareerConnectionScraper from './FACSSurgeryCareerConnection.js';
import BuiltInHealthTechScraper from './BuiltInHealthTech.js';
import BuiltInSocialImpactScraper from './BuiltInSocialImpact.js';
import PharmiwebSoftwareRssScraper from './PharmiwebSoftwareRSS.js';
import PharmiwebEngineerRssScraper from './PharmiwebEngineerRSS.js';
import PharmiwebDataRssScraper from './PharmiwebDataRSS.js';
import RemotiveScraper from './Remotive.js';
import TheMuseScraper from './TheMuse.js';
import scrapedEmployerCache from './ScrapedEmployerCache.js';
import { gatherLegacyAIData } from './GatherLegacyAIData.js';
import { startBackgroundGeocodeJobs } from '../utils/BackgroundGeocode.js';
import { ensureCacheDir, readAnyCache, readFreshCache, writeCache, } from './ScrapingCache.js';
function normalizeEmployerName(name) {
    return String(name ?? '').trim().toLowerCase();
}
const SCRAPER_COMPONENTS = [
    {
        name: 'ClimateBase',
        scrapeJobs: () => new ClimateBaseScraper().scrapeJobs(),
    },
    {
        name: 'Greenhouse',
        scrapeJobs: () => new GreenhouseScraper().scrapeJobs(),
    },
    {
        name: 'Lever',
        scrapeJobs: () => new LeverScraper().scrapeJobs(),
    },
    {
        name: 'Ashby',
        scrapeJobs: () => new AshbyScraper().scrapeJobs(),
    },
    {
        name: 'Breezy',
        scrapeJobs: () => new BreezyScraper().scrapeJobs(),
    },
    {
        name: 'Bamboo',
        scrapeJobs: () => new BambooScraper().scrapeJobs(),
    },
    {
        name: 'BuiltIn',
        scrapeJobs: () => new BuiltInScraper().scrapeJobs(),
    },
    {
        name: 'BuiltInGreenTech',
        scrapeJobs: () => new BuiltInGreenTechScraper().scrapeJobs(),
    },
    {
        name: 'Terra',
        scrapeJobs: () => new TerraScraper().scrapeJobs(),
    },
    {
        name: '80kHours',
        scrapeJobs: () => new EightyKHoursScraper().scrapeJobs(),
    },
    {
        name: 'RemoteOK',
        scrapeJobs: () => new RemoteOKScraper().scrapeJobs(),
    },
    {
        name: 'ArbeitNow',
        scrapeJobs: () => new ArbeitNowScraper().scrapeJobs(),
    },
    {
        name: 'Museum',
        scrapeJobs: () => new MuseumScraper().scrapeJobs(),
    },
    {
        name: 'JobForGood',
        scrapeJobs: () => new JobForGoodScraper().scrapeJobs(),
    },
    {
        name: 'GlobalJobs',
        scrapeJobs: () => new GlobalJobsScraper().scrapeJobs(),
    },
    {
        name: 'CharityJob',
        scrapeJobs: () => new CharityJobScraper().scrapeJobs(),
    },
    {
        name: 'EnvironmentJob',
        scrapeJobs: () => new EnvironmentJobScraper().scrapeJobs(),
    },
    {
        name: 'ImpactPool',
        scrapeJobs: () => new ImpactPoolScraper().scrapeJobs(),
    },
    {
        name: 'TechJobsForGood',
        scrapeJobs: () => new TechJobsForGoodScraper().scrapeJobs(),
    },
    {
        name: 'EthicalJobs',
        scrapeJobs: () => new EthicalJobsScraper().scrapeJobs(),
    },
    {
        name: 'ImpactOpportunity',
        scrapeJobs: () => new ImpactOpportunityScraper().scrapeJobs(),
    },
    {
        name: 'EscapeTheCity',
        scrapeJobs: () => new EscapeTheCityScraper().scrapeJobs(),
    },
    {
        name: 'CharityPeople',
        scrapeJobs: () => new CharityPeopleScraper().scrapeJobs(),
    },
    {
        name: 'DevNetJobsStandard',
        scrapeJobs: () => new DevNetJobsStandardScraper().scrapeJobs(),
    },
    {
        name: 'DevNetJobsHighlighted',
        scrapeJobs: () => new DevNetJobsHighlightedScraper().scrapeJobs(),
    },
    {
        name: 'DevNetJobsHome',
        scrapeJobs: () => new DevNetJobsHomeScraper().scrapeJobs(),
    },
    {
        name: 'GlobalJobsRSS',
        scrapeJobs: () => new GlobalJobsRssScraper().scrapeJobs(),
    },
    {
        name: 'RemoteCoRSS',
        scrapeJobs: () => new RemoteCoRssScraper().scrapeJobs(),
    },
    {
        name: 'JobicyRSS',
        scrapeJobs: () => new JobicyRssScraper().scrapeJobs(),
    },
    {
        name: 'DynamiteJobsRSS',
        scrapeJobs: () => new DynamiteJobsRssScraper().scrapeJobs(),
    },
    {
        name: 'CharityVolunteerJobs',
        scrapeJobs: () => new CharityVolunteerJobsScraper().scrapeJobs(),
    },
    {
        name: 'CharityVillage',
        scrapeJobs: () => new CharityVillageScraper().scrapeJobs(),
    },
    {
        name: 'IdealistNonprofitJobs',
        scrapeJobs: () => new IdealistNonprofitJobsScraper().scrapeJobs(),
    },
    {
        name: 'IdealistVolunteerOpportunities',
        scrapeJobs: () => new IdealistVolunteerOpportunitiesScraper().scrapeJobs(),
    },
    {
        name: 'ArtsJobs',
        scrapeJobs: () => new ArtsJobsScraper().scrapeJobs(),
    },
    {
        name: 'WeWorkRemotelyDesign',
        scrapeJobs: () => new WeWorkRemotelyDesignScraper().scrapeJobs(),
    },
    {
        name: 'CharityJobCreative',
        scrapeJobs: () => new CharityJobCreativeScraper().scrapeJobs(),
    },
    {
        name: 'WeWorkRemotelyProgramming',
        scrapeJobs: () => new WeWorkRemotelyProgrammingScraper().scrapeJobs(),
    },
    {
        name: 'WeWorkRemotelyCustomerSupport',
        scrapeJobs: () => new WeWorkRemotelyCustomerSupportScraper().scrapeJobs(),
    },
    {
        name: 'WeWorkRemotelyProduct',
        scrapeJobs: () => new WeWorkRemotelyProductScraper().scrapeJobs(),
    },
    {
        name: 'WeWorkRemotelySalesMarketing',
        scrapeJobs: () => new WeWorkRemotelySalesMarketingScraper().scrapeJobs(),
    },
    {
        name: 'RemoteOKDeveloper',
        scrapeJobs: () => new RemoteOKDeveloperScraper().scrapeJobs(),
    },
    {
        name: 'RemoteOKSupport',
        scrapeJobs: () => new RemoteOKSupportScraper().scrapeJobs(),
    },
    {
        name: 'RemoteOKMarketing',
        scrapeJobs: () => new RemoteOKMarketingScraper().scrapeJobs(),
    },
    {
        name: 'RemoteOKDesign',
        scrapeJobs: () => new RemoteOKDesignScraper().scrapeJobs(),
    },
    {
        name: 'RemoteOKProduct',
        scrapeJobs: () => new RemoteOKProductScraper().scrapeJobs(),
    },
    {
        name: 'RemoteOKData',
        scrapeJobs: () => new RemoteOKDataScraper().scrapeJobs(),
    },
    {
        name: 'RemoteOKSales',
        scrapeJobs: () => new RemoteOKSalesScraper().scrapeJobs(),
    },
    {
        name: 'RemoteOKFinance',
        scrapeJobs: () => new RemoteOKFinanceScraper().scrapeJobs(),
    },
    {
        name: 'RemoteOKHR',
        scrapeJobs: () => new RemoteOKHRScraper().scrapeJobs(),
    },
    {
        name: 'RemoteOKLegal',
        scrapeJobs: () => new RemoteOKLegalScraper().scrapeJobs(),
    },
    {
        name: 'RemoteOKOperations',
        scrapeJobs: () => new RemoteOKOperationsScraper().scrapeJobs(),
    },
    {
        name: 'RemoteOKWriting',
        scrapeJobs: () => new RemoteOKWritingScraper().scrapeJobs(),
    },
    {
        name: 'RemoteOKEducation',
        scrapeJobs: () => new RemoteOKEducationScraper().scrapeJobs(),
    },
    {
        name: 'HealthECareers',
        scrapeJobs: () => new HealthECareersScraper().scrapeJobs(),
    },
    {
        name: 'JMIRCareers',
        scrapeJobs: () => new JMIRCareersScraper().scrapeJobs(),
    },
    {
        name: 'APHACareers',
        scrapeJobs: () => new APHACareersScraper().scrapeJobs(),
    },
    {
        name: 'PhysicsTodayMedicalImaging',
        scrapeJobs: () => new PhysicsTodayMedicalImagingScraper().scrapeJobs(),
    },
    {
        name: 'RSNACareerConnect',
        scrapeJobs: () => new RSNACareerConnectScraper().scrapeJobs(),
    },
    {
        name: 'ASHPCareerPharm',
        scrapeJobs: () => new ASHPCareerPharmScraper().scrapeJobs(),
    },
    {
        name: 'ACCCareerCenter',
        scrapeJobs: () => new ACCCareerCenterScraper().scrapeJobs(),
    },
    {
        name: 'MedDeviceJobs',
        scrapeJobs: () => new MedDeviceJobsScraper().scrapeJobs(),
    },
    {
        name: 'BioTalentJobs',
        scrapeJobs: () => new BioTalentJobsScraper().scrapeJobs(),
    },
    {
        name: 'BioSpaceRSS',
        scrapeJobs: () => new BioSpaceRssScraper().scrapeJobs(),
    },
    {
        name: 'BioSpaceDataRSS',
        scrapeJobs: () => new BioSpaceDataRssScraper().scrapeJobs(),
    },
    {
        name: 'BioSpaceEngineerRSS',
        scrapeJobs: () => new BioSpaceEngineerRssScraper().scrapeJobs(),
    },
    {
        name: 'BioSpaceSoftwareRSS',
        scrapeJobs: () => new BioSpaceSoftwareRssScraper().scrapeJobs(),
    },
    {
        name: 'PharmiwebRSS',
        scrapeJobs: () => new PharmiwebRssScraper().scrapeJobs(),
    },
    {
        name: 'APICCareers',
        scrapeJobs: () => new APICCareersScraper().scrapeJobs(),
    },
    {
        name: 'FACSSurgeryCareerConnection',
        scrapeJobs: () => new FACSSurgeryCareerConnectionScraper().scrapeJobs(),
    },
    {
        name: 'BuiltInHealthTech',
        scrapeJobs: () => new BuiltInHealthTechScraper().scrapeJobs(),
    },
    {
        name: 'BuiltInSocialImpact',
        scrapeJobs: () => new BuiltInSocialImpactScraper().scrapeJobs(),
    },
    {
        name: 'PharmiwebSoftwareRSS',
        scrapeJobs: () => new PharmiwebSoftwareRssScraper().scrapeJobs(),
    },
    {
        name: 'PharmiwebEngineerRSS',
        scrapeJobs: () => new PharmiwebEngineerRssScraper().scrapeJobs(),
    },
    {
        name: 'PharmiwebDataRSS',
        scrapeJobs: () => new PharmiwebDataRssScraper().scrapeJobs(),
    },
    {
        name: 'Remotive',
        scrapeJobs: () => new RemotiveScraper().scrapeJobs(),
    },
    {
        name: 'TheMuse',
        scrapeJobs: () => new TheMuseScraper().scrapeJobs(),
    },
];
async function loadComponentJobs(component) {
    const cachedJobs = await readFreshCache(component.name);
    if (cachedJobs) {
        console.log(`Loaded ${cachedJobs.length} jobs from cache for ${component.name}`);
        return cachedJobs;
    }
    const scrapedJobs = await component.scrapeJobs();
    if (scrapedJobs.length === 0) {
        console.warn(`Scraper for ${component.name} returned 0 jobs.`);
        const staleCache = await readAnyCache(component.name);
        if (staleCache) {
            console.warn(`Using stale cache for ${component.name} because fresh scrape returned 0 jobs (${staleCache.length} jobs)`);
            return staleCache;
        }
        return [];
    }
    await writeCache(component.name, scrapedJobs);
    console.log(`Scraped ${scrapedJobs.length} jobs from ${component.name} and updated cache`);
    return scrapedJobs;
}
export async function scrapeJobsMain() {
    const jobs = [];
    console.log('Starting job scraping...');
    await ensureCacheDir();
    for (const component of SCRAPER_COMPONENTS) {
        const componentJobs = await loadComponentJobs(component);
        jobs.push(...componentJobs);
    }
    const dedupedJobs = [];
    const seenSourceUrls = new Set();
    for (const job of jobs) {
        const sourceUrl = job.source_url?.trim();
        if (!sourceUrl) {
            dedupedJobs.push(job);
            continue;
        }
        if (seenSourceUrls.has(sourceUrl)) {
            continue;
        }
        seenSourceUrls.add(sourceUrl);
        dedupedJobs.push(job);
    }
    const removedDuplicates = jobs.length - dedupedJobs.length;
    if (removedDuplicates > 0) {
        console.log(`Removed ${removedDuplicates} duplicate jobs by source_url`);
    }
    startBackgroundGeocodeJobs(dedupedJobs);
    const employerDatastore = new Map();
    for (const cachedEmployer of scrapedEmployerCache.getAllCachedEmployers()) {
        const key = normalizeEmployerName(cachedEmployer.name);
        if (!key) {
            continue;
        }
        employerDatastore.set(key, cachedEmployer);
    }
    for (const job of dedupedJobs) {
        const employerName = String(job.company_name ?? '').trim() || 'Unknown Employer';
        const employerKey = normalizeEmployerName(employerName);
        if (!employerKey) {
            continue;
        }
        let employer = employerDatastore.get(employerKey);
        if (!employer) {
            employer = {
                name: employerName,
                ai_summary: '',
                ai_red_flag_summary: '',
                ai_score: 0,
                ai_red_flag_score: 0,
                ai_impact_summary: '',
                ai_impact_score: 0,
                employeeQualityOfLifeScore: 0,
                employeeQualityOfLifeSummary: '',
            };
            employerDatastore.set(employerKey, employer);
        }
        job.scrapedEmployer = employer;
    }
    gatherLegacyAIData(dedupedJobs, employerDatastore);
    scrapedEmployerCache.setCachedEmployers(Array.from(employerDatastore.values()));
    const employers = Array.from(employerDatastore.values());
    const totalEmployers = employers.length;
    const hasAuditData = (employer) => employer.ai_score > 0 ||
        employer.ai_red_flag_score > 0 ||
        String(employer.ai_summary ?? '').trim().length > 0 ||
        String(employer.ai_red_flag_summary ?? '').trim().length > 0;
    const hasImpactData = (employer) => employer.ai_impact_score > 0 || String(employer.ai_impact_summary ?? '').trim().length > 0;
    const hasQualityOfLifeData = (employer) => employer.employeeQualityOfLifeScore > 0 ||
        String(employer.employeeQualityOfLifeSummary ?? '').trim().length > 0;
    const auditEmployerCount = employers.filter(hasAuditData).length;
    const impactEmployerCount = employers.filter(hasImpactData).length;
    const qualityOfLifeEmployerCount = employers.filter(hasQualityOfLifeData).length;
    const toPercent = (count) => {
        if (totalEmployers === 0) {
            return '0.0';
        }
        return ((count / totalEmployers) * 100).toFixed(1);
    };
    console.log([
        'Employer AI data coverage after load:',
        `audit ${auditEmployerCount}/${totalEmployers} (${toPercent(auditEmployerCount)}%)`,
        `impact ${impactEmployerCount}/${totalEmployers} (${toPercent(impactEmployerCount)}%)`,
        `qualityOfLife ${qualityOfLifeEmployerCount}/${totalEmployers} (${toPercent(qualityOfLifeEmployerCount)}%)`,
    ].join(' '));
    const uniqueEmployers = new Set(dedupedJobs.map((job) => String(job.company_name ?? '').trim().toLowerCase()).filter(Boolean));
    console.log(`Total jobs collected: ${dedupedJobs.length} from ${uniqueEmployers.size} unique employers`);
    return dedupedJobs;
}
