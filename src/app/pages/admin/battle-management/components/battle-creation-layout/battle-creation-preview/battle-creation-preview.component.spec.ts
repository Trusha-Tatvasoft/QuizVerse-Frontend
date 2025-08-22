import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BattleCreationPreviewComponent } from './battle-creation-preview.component';

describe('BattleCreationPreviewComponent', () => {
  let component: BattleCreationPreviewComponent;
  let fixture: ComponentFixture<BattleCreationPreviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BattleCreationPreviewComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BattleCreationPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
