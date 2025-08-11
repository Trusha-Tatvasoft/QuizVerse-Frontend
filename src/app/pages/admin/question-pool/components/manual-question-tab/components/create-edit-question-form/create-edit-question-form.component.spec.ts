import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateEditQuestionFormComponent } from './create-edit-question-form.component';

describe('CreateEditQuestionFormComponent', () => {
  let component: CreateEditQuestionFormComponent;
  let fixture: ComponentFixture<CreateEditQuestionFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateEditQuestionFormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateEditQuestionFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
