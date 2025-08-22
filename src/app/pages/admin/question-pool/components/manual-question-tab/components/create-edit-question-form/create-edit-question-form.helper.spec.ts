import { FormBuilder, FormGroup } from '@angular/forms';
import {
  patchFormWithQuestion,
  mapFormToQuestionRequest,
  updateDropdownOptions,
} from './create-edit-question-form.hepler';
import { QuestionDetail } from '../../../../interfaces/question-pool-preview.interface';
import { DynamicFormField } from '../../../../../../../shared/interfaces/dynamic-form-field.interface';
import { CommonListDropDown } from '../../../../../../../shared/interfaces/common-dropdown.interface';

describe('create-edit-question-form.helper', () => {
  let fb: FormBuilder;
  let form: FormGroup;

  const categories: CommonListDropDown[] = [
    { id: 1, name: 'Math' },
    { id: 2, name: 'Science' },
  ];

  const difficulties: CommonListDropDown[] = [
    { id: 1, name: 'Easy' },
    { id: 2, name: 'Hard' },
  ];

  const types: CommonListDropDown[] = [
    { id: 1, name: 'MCQ' },
    { id: 2, name: 'True/False' },
  ];

  beforeEach(() => {
    fb = new FormBuilder();
    form = fb.group({
      category: [null],
      type: [null],
      difficulty: [null],
      questionText: [''],
      option1: [''],
      option2: [''],
      option3: [''],
      option4: [''],
      correctAnswer: [''],
    });
  });

  describe('patchFormWithQuestion', () => {
    it('should patch MCQ question correctly', () => {
      const q: QuestionDetail = {
        id: 1,
        category: 'Math',
        questionType: 'MCQ',
        difficulty: 'Easy',
        questionText: '2+2=?',
        options: [
          { label: '3', value: '3', isCorrect: false },
          { label: '4', value: '4', isCorrect: true },
        ],
        correctAnswer: '4',
      };

      patchFormWithQuestion(form, q, categories, difficulties, types);

      expect(form.value.category).toBe(1); // Math id
      expect(form.value.difficulty).toBe(1); // Easy id
      expect(form.value.type).toBe(1); // MCQ id
      expect(form.value.questionText).toBe('2+2=?');
      expect(form.value.option1).toBe('3');
      expect(form.value.option2).toBe('4');
      expect(form.value.correctAnswer).toBe('option2');
    });

    it('should patch True/False question correctly', () => {
      const q: QuestionDetail = {
        id: 2,
        category: 'Science',
        questionType: 'True/False',
        difficulty: 'Hard',
        questionText: 'The earth is flat',
        correctAnswer: 'False',
        options: null,
      };

      patchFormWithQuestion(form, q, categories, difficulties, types);

      expect(form.value.type).toBe(2); // True/False id
      expect(form.value.correctAnswer).toBe('false'); // lowercase
    });

    it('should patch fallback when no options provided', () => {
      const q: QuestionDetail = {
        id: 3,
        category: 'Math',
        questionType: 'MCQ',
        difficulty: 'Easy',
        questionText: 'Fallback test',
        options: [],
        correctAnswer: 'DirectAnswer',
      };

      patchFormWithQuestion(form, q, categories, difficulties, types);

      expect(form.value.correctAnswer).toBe('DirectAnswer');
    });
  });

  describe('mapFormToQuestionRequest', () => {
    it('should map form to QuestionRequest with options', () => {
      form.patchValue({
        type: 1,
        category: 2,
        difficulty: 1,
        questionText: 'Capital of France?',
        option1: 'Paris',
        option2: 'London',
        correctAnswer: 'option1',
      });

      const req = mapFormToQuestionRequest(form);

      expect(req).toEqual({
        questionTypeId: 1,
        categoryId: 2,
        difficultyId: 1,
        questionText: 'Capital of France?',
        options: ['Paris', 'London'],
        correctAnswer: 'Paris',
      });
    });

    it('should map direct answer when not option-based', () => {
      form.patchValue({
        type: 2,
        category: 1,
        difficulty: 2,
        questionText: 'Sun rises from West?',
        correctAnswer: 'False',
      });

      const req = mapFormToQuestionRequest(form);

      expect(req.correctAnswer).toBe('False');
      expect(req.options).toEqual([]);
    });
  });

  describe('updateDropdownOptions', () => {
    it('should update fields with dropdown options', () => {
      const fields: DynamicFormField[] = [
        {
          name: 'category',
          label: '',
          type: 'select',
          placeholder: '',
          validators: [],
          options: [],
        },
        {
          name: 'difficulty',
          label: '',
          type: 'select',
          placeholder: '',
          validators: [],
          options: [],
        },
        { name: 'type', label: '', type: 'select', placeholder: '', validators: [], options: [] },
      ];

      updateDropdownOptions(fields, categories, difficulties, types);

      expect(fields.find((f) => f.name === 'category')?.options).toEqual([
        { value: 1, label: 'Math' },
        { value: 2, label: 'Science' },
      ]);

      expect(fields.find((f) => f.name === 'difficulty')?.options).toEqual([
        { value: 1, label: 'Easy' },
        { value: 2, label: 'Hard' },
      ]);

      expect(fields.find((f) => f.name === 'type')?.options).toEqual([
        { value: 1, label: 'MCQ' },
        { value: 2, label: 'True/False' },
      ]);
    });

    it('should ignore fields that are not category/difficulty/type', () => {
      const fields: DynamicFormField[] = [
        {
          name: 'other',
          label: 'Other',
          type: 'text',
          placeholder: 'Enter something',
          validators: [],
          options: [],
        },
      ];

      updateDropdownOptions(fields, categories, difficulties, types);

      expect(fields[0].options).toEqual([]); // unchanged
    });
  });
});
