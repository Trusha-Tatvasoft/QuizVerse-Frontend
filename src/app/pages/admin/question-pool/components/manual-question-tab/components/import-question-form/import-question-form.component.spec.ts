import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportQuestionFormComponent } from './import-question-form.component';

describe('ImportQuestionFormComponent', () => {
  let component: ImportQuestionFormComponent;
  let fixture: ComponentFixture<ImportQuestionFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImportQuestionFormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ImportQuestionFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
