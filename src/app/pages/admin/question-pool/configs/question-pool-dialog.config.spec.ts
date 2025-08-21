// test cases for the export functions
import { Validators } from '@angular/forms';
import { buildBaseFields, buildFieldsByQuestionType } from './question-pool-dialog.config';

describe('Question Pool Config Functions', () => {
  describe('buildBaseFields', () => {
    it('should return the base fields with correct properties', () => {
      const fields = buildBaseFields();

      expect(fields.length).toBe(4);

      const names = fields.map((f) => f.name);
      expect(names).toEqual(['category', 'type', 'difficulty', 'questionText']);

      fields.forEach((field) => {
        expect(field.validators).toContain(Validators.required);
        fields.forEach((field) => {
          expect(field.validators).toContain(Validators.required);
          expect(field.validationMessages).toBeDefined();
          expect(field.validationMessages!['required']).toBeDefined();
        });
      });

      fields.forEach((field) => expect(field.gridClass).toBeDefined());
    });
  });

  describe('buildFieldsByQuestionType', () => {
    it('should return 5 fields for MCQ type (type=1)', () => {
      const fields = buildFieldsByQuestionType(1);
      expect(fields.length).toBe(5);

      const optionFields = fields.slice(0, 4);
      optionFields.forEach((f, index) => {
        expect(f.name).toBe(`option${index + 1}`);
        expect(f.validators).toContain(Validators.required);
        expect(f.validationMessages?.['notUnique']).toBe('All options must be unique.');
      });

      const correctAnswer = fields[4];
      expect(correctAnswer.name).toBe('correctAnswer');
      expect(correctAnswer.type).toBe('select');
      expect(correctAnswer.options?.length).toBe(4);
    });

    it('should return 1 field for True/False type (type=2)', () => {
      const fields = buildFieldsByQuestionType(2);
      expect(fields.length).toBe(1);
      expect(fields[0].name).toBe('correctAnswer');
      expect(fields[0].options).toEqual([
        { value: 'true', label: 'True' },
        { value: 'false', label: 'False' },
      ]);
      expect(fields[0].validators).toContain(Validators.required);
    });

    it('should return 1 textarea field for Detailed Answer type (type=3)', () => {
      const fields = buildFieldsByQuestionType(3);
      expect(fields.length).toBe(1);
      expect(fields[0].name).toBe('correctAnswer');
      expect(fields[0].type).toBe('textarea');
      expect(fields[0].validators).toContain(Validators.required);
    });

    it('should return 1 text field for Short Answer type (type=4)', () => {
      const fields = buildFieldsByQuestionType(4);
      expect(fields.length).toBe(1);
      expect(fields[0].name).toBe('correctAnswer');
      expect(fields[0].type).toBe('text');
      expect(fields[0].validators).toContain(Validators.required);
    });

    it('should return empty array for unknown type', () => {
      const fields = buildFieldsByQuestionType(99);
      expect(fields).toEqual([]);
    });
  });
});
