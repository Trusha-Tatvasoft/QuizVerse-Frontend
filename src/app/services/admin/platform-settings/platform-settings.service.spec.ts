import { TestBed } from '@angular/core/testing';

import { PlatformSettingsService } from './platform-settings.service';

describe('PlatformSettingsService', () => {
  let service: PlatformSettingsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PlatformSettingsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
