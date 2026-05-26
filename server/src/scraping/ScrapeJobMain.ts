import ClimateBaseScraper from './ClimateBase.js';
import GreenhouseScraper from './Greenhouse.js';
import LeverScraper from './Lever.js';
import AshbyScraper from './Ashby.js';
import BreezyScraper from './Breezy.js';
import BambooScraper from './Bamboo.js';
import BuiltInScraper from './BuiltIn.js';
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
import PharmiwebRssScraper from './PharmiwebRSS.js';
import APICCareersScraper from './APICCareers.js';
import FACSSurgeryCareerConnectionScraper from './FACSSurgeryCareerConnection.js';
import BuiltInHealthTechScraper from './BuiltInHealthTech.js';
import PharmiwebSoftwareRssScraper from './PharmiwebSoftwareRSS.js';
import PharmiwebEngineerRssScraper from './PharmiwebEngineerRSS.js';
import PharmiwebDataRssScraper from './PharmiwebDataRSS.js';
import {
  ensureCacheDir,
  readAnyCache,
  readFreshCache,
  writeCache,
} from './ScrapingCache.js';

import type { ScrapedJob } from './ScrapedJob.js';

interface ScraperComponent {
  name: string;
  scrapeJobs: () => Promise<ScrapedJob[]>;
}

const SCRAPER_COMPONENTS: ScraperComponent[] = [
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
];

async function loadComponentJobs(component: ScraperComponent): Promise<ScrapedJob[]> {
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
      console.warn(
        `Using stale cache for ${component.name} because fresh scrape returned 0 jobs (${staleCache.length} jobs)`
      );
      return staleCache;
    }

    return [];
  }

  await writeCache(component.name, scrapedJobs);
  console.log(`Scraped ${scrapedJobs.length} jobs from ${component.name} and updated cache`);

  return scrapedJobs;
}

export async function scrapeJobsMain() {
  const jobs: ScrapedJob[] = [];

  console.log('Starting job scraping...');

  await ensureCacheDir();

  for (const component of SCRAPER_COMPONENTS) {
    const componentJobs = await loadComponentJobs(component);
    jobs.push(...componentJobs);
  }

  const dedupedJobs: ScrapedJob[] = [];
  const seenSourceUrls = new Set<string>();

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

  const uniqueEmployers = new Set(
    dedupedJobs.map((job) => String(job.company_name ?? '').trim().toLowerCase()).filter(Boolean)
  )

  console.log(`Total jobs collected: ${dedupedJobs.length} from ${uniqueEmployers.size} unique employers`)
  return dedupedJobs;
}

