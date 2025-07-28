export interface LandingPageStat {
  value: string;
  label: string;
}

export interface LandingPageConfig {
  quote: string;
  stats: LandingPageStat[];
}
