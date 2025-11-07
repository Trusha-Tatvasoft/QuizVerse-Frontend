import { FormBuilder, FormGroup } from '@angular/forms';
import {
  createCategoryTag,
  getTotalQuestions,
  resetFormControlsErrors,
} from './ai-question-tab.helper';
import { QuestionGenerationFormat } from '../../interfaces/question-pool-ai-tab.interface';

describe('ai-question-tab.helper', () => {
  describe('createCategoryTag()', () => {
    it('should return a TagInputConfig with correct values', () => {
      const category = 'Science';
      const result = createCategoryTag(category);

      expect(result).toEqual({
        id: 'Science',
        label: 'Science',
        type: 'static',
        isSelected: true,
        hasBorder: true,
        backgroundColor: 'yellow',
        textColor: 'lightYellow',
      });
    });

    it('should handle empty string category', () => {
      const category = '';
      const result = createCategoryTag(category);

      expect(result).toEqual({
        id: '',
        label: '',
        type: 'static',
        isSelected: true,
        hasBorder: true,
        backgroundColor: 'yellow',
        textColor: 'lightYellow',
      });
    });

    it('should handle category with special characters', () => {
      const category = 'Math & Physics';
      const result = createCategoryTag(category);

      expect(result.id).toBe('Math & Physics');
      expect(result.label).toBe('Math & Physics');
    });
  });

  describe('getTotalQuestions()', () => {
    it('should return the correct total number of questions', () => {
      const configs: QuestionGenerationFormat[] = [
        {
          questionDifficultyId: 1,
          questionDifficultyName: 'Easy',
          questionPerQuestionType: [
            {
              questionPerQuestionTypeId: 1,
              questionPerQuestionTypeName: 'MCQ',
              noOfQuesitons: 2,
            },
            {
              questionPerQuestionTypeId: 2,
              questionPerQuestionTypeName: 'True/False',
              noOfQuesitons: 3,
            },
          ],
        },
        {
          questionDifficultyId: 3,
          questionDifficultyName: 'Hard',
          questionPerQuestionType: [
            {
              questionPerQuestionTypeId: 1,
              questionPerQuestionTypeName: 'MCQ',
              noOfQuesitons: 4,
            },
          ],
        },
      ];

      const totalQuestions = getTotalQuestions(configs);

      expect(totalQuestions).toBe(9);
    });

    it('should return 0 if no questions are present', () => {
      const configs: QuestionGenerationFormat[] = [];
      const totalQuestions = getTotalQuestions(configs);

      expect(totalQuestions).toBe(0);
    });

    it('should handle single difficulty with multiple question types', () => {
      const configs: QuestionGenerationFormat[] = [
        {
          questionDifficultyId: 1,
          questionDifficultyName: 'Medium',
          questionPerQuestionType: [
            {
              questionPerQuestionTypeId: 1,
              questionPerQuestionTypeName: 'MCQ',
              noOfQuesitons: 5,
            },
            {
              questionPerQuestionTypeId: 2,
              questionPerQuestionTypeName: 'True/False',
              noOfQuesitons: 3,
            },
            {
              questionPerQuestionTypeId: 3,
              questionPerQuestionTypeName: 'Short Answer',
              noOfQuesitons: 2,
            },
          ],
        },
      ];

      const totalQuestions = getTotalQuestions(configs);

      expect(totalQuestions).toBe(10);
    });

    it('should handle multiple difficulties with single question type', () => {
      const configs: QuestionGenerationFormat[] = [
        {
          questionDifficultyId: 1,
          questionDifficultyName: 'Easy',
          questionPerQuestionType: [
            {
              questionPerQuestionTypeId: 1,
              questionPerQuestionTypeName: 'MCQ',
              noOfQuesitons: 3,
            },
          ],
        },
        {
          questionDifficultyId: 2,
          questionDifficultyName: 'Medium',
          questionPerQuestionType: [
            {
              questionPerQuestionTypeId: 1,
              questionPerQuestionTypeName: 'MCQ',
              noOfQuesitons: 4,
            },
          ],
        },
        {
          questionDifficultyId: 3,
          questionDifficultyName: 'Hard',
          questionPerQuestionType: [
            {
              questionPerQuestionTypeId: 1,
              questionPerQuestionTypeName: 'MCQ',
              noOfQuesitons: 2,
            },
          ],
        },
      ];

      const totalQuestions = getTotalQuestions(configs);

      expect(totalQuestions).toBe(9);
    });

    it('should handle zero questions in some question types', () => {
      const configs: QuestionGenerationFormat[] = [
        {
          questionDifficultyId: 1,
          questionDifficultyName: 'Easy',
          questionPerQuestionType: [
            {
              questionPerQuestionTypeId: 1,
              questionPerQuestionTypeName: 'MCQ',
              noOfQuesitons: 0,
            },
            {
              questionPerQuestionTypeId: 2,
              questionPerQuestionTypeName: 'True/False',
              noOfQuesitons: 5,
            },
          ],
        },
      ];

      const totalQuestions = getTotalQuestions(configs);

      expect(totalQuestions).toBe(5);
    });

    it('should handle difficulty with empty questionPerQuestionType array', () => {
      const configs: QuestionGenerationFormat[] = [
        {
          questionDifficultyId: 1,
          questionDifficultyName: 'Easy',
          questionPerQuestionType: [],
        },
      ];

      const totalQuestions = getTotalQuestions(configs);

      expect(totalQuestions).toBe(0);
    });
  });

  describe('resetFormControlsErrors()', () => {
    let form: FormGroup;

    beforeEach(() => {
      const fb = new FormBuilder();
      form = fb.group({
        category: ['Science'],
        difficulty: ['Easy'],
      });

      form.get('category')?.setErrors({ required: true });
      form.get('difficulty')?.markAsTouched();
    });

    it('should reset errors, pristine, and untouched state for all controls', () => {
      resetFormControlsErrors(form);

      const categoryControl = form.get('category');
      const difficultyControl = form.get('difficulty');

      expect(categoryControl?.errors).toBeNull();
      expect(categoryControl?.pristine).toBe(true);
      expect(categoryControl?.touched).toBe(false);

      expect(difficultyControl?.errors).toBeNull();
      expect(difficultyControl?.pristine).toBe(true);
      expect(difficultyControl?.touched).toBe(false);
    });

    it('should handle form with multiple controls having errors', () => {
      const fb = new FormBuilder();
      form = fb.group({
        field1: [''],
        field2: [''],
        field3: [''],
      });

      form.get('field1')?.setErrors({ required: true });
      form.get('field2')?.setErrors({ minLength: true });
      form.get('field3')?.setErrors({ pattern: true });

      form.get('field1')?.markAsTouched();
      form.get('field2')?.markAsDirty();
      form.get('field3')?.markAsTouched();

      resetFormControlsErrors(form);

      expect(form.get('field1')?.errors).toBeNull();
      expect(form.get('field2')?.errors).toBeNull();
      expect(form.get('field3')?.errors).toBeNull();

      expect(form.get('field1')?.pristine).toBe(true);
      expect(form.get('field2')?.pristine).toBe(true);
      expect(form.get('field3')?.pristine).toBe(true);

      expect(form.get('field1')?.touched).toBe(false);
      expect(form.get('field2')?.touched).toBe(false);
      expect(form.get('field3')?.touched).toBe(false);
    });

    it('should handle empty form group', () => {
      const fb = new FormBuilder();
      const emptyForm = fb.group({});

      expect(() => resetFormControlsErrors(emptyForm)).not.toThrow();
    });

    it('should not throw error if control does not exist', () => {
      const fb = new FormBuilder();
      form = fb.group({
        existingControl: ['value'],
      });

      expect(() => resetFormControlsErrors(form)).not.toThrow();
    });

    it('should handle nested form groups', () => {
      const fb = new FormBuilder();
      form = fb.group({
        name: ['John'],
        address: fb.group({
          street: ['Main St'],
          city: ['New York'],
        }),
      });

      form.get('name')?.setErrors({ required: true });
      form.get('name')?.markAsTouched();

      resetFormControlsErrors(form);

      expect(form.get('name')?.errors).toBeNull();
      expect(form.get('name')?.pristine).toBe(true);
      expect(form.get('name')?.touched).toBe(false);
    });

    it('should preserve form values while resetting errors', () => {
      const fb = new FormBuilder();
      form = fb.group({
        username: ['testuser'],
        email: ['test@example.com'],
      });

      form.get('username')?.setErrors({ required: true });
      form.get('email')?.setErrors({ email: true });

      resetFormControlsErrors(form);

      expect(form.get('username')?.value).toBe('testuser');
      expect(form.get('email')?.value).toBe('test@example.com');
      expect(form.get('username')?.errors).toBeNull();
      expect(form.get('email')?.errors).toBeNull();
    });
  });
});
