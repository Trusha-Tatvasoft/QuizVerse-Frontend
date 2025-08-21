import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportQuestionPreviewComponent } from './import-question-preview.component';

describe('ImportQuestionPreviewComponent', () => {
  let component: ImportQuestionPreviewComponent;
  let fixture: ComponentFixture<ImportQuestionPreviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImportQuestionPreviewComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ImportQuestionPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
