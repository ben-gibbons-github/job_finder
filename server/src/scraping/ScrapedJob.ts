import { ScrapedEmployer } from "./ScrapedEmployer.js";

export interface ScrapedJob {
  name: string;
  company_name: string;
  location: string;
  remote: string;
  location_lon: number;
  location_lat: number;
  description: string;
  type: string;
  source: string;
  source_url: string;
  posted: string | Date;
  impact_number: number;
  audit_number: number;
  audit_text: string;
  tags: string[];
  
  scrapedEmployer?: ScrapedEmployer;
}

