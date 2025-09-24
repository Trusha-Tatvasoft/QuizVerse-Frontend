export interface DefaultsColors {
  primaryColor: string;
  secondaryColor: string;
}

export interface PlatformConfigurationRequestDTO {
  quote: string;
  defaultsColors: DefaultsColors;
  logo?: File;
}

export interface PlatformConfigurationResponseDTO {
  quote: string;
  defaultsColors: DefaultsColors;
  logo?: string | null;
}
