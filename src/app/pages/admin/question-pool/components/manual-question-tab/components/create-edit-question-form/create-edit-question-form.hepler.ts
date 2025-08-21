import { FormGroup } from '@angular/forms';
import { QuestionDetail } from '../../../../interfaces/question-pool-preview.interface';
import { DynamicFormField } from '../../../../../../../shared/interfaces/dynamic-form-field.interface';
import { QuestionRequest } from '../../../../interfaces/question-request.interface';
import { CommonListDropDown } from '../../../../../../../shared/interfaces/common-dropdown.interface';

export function patchFormWithQuestion(
  form: FormGroup,
  q: QuestionDetail,
  categories: CommonListDropDown[],
  difficulties: CommonListDropDown[],
  types: CommonListDropDown[],
) {
  const categoryId = categories.find((c) => c.name === q.category)?.id;
  const difficultyId = difficulties.find((d) => d.name === q.difficulty)?.id;
  const typeId = types.find((t) => t.name === q.questionType)?.id;

  form.patchValue({
    category: categoryId,
    type: typeId,
    difficulty: difficultyId,
    questionText: q.questionText,
  });

  if (q.questionType === 'True/False') {
    form.get('correctAnswer')?.setValue(q.correctAnswer?.toLowerCase());
  } else if (q.options?.length) {
    q.options.forEach((opt, index) => form.get(`option${index + 1}`)?.setValue(opt.value));
    const correctIndex = q.options.findIndex((o) => o.isCorrect);
    if (correctIndex >= 0) {
      form.get('correctAnswer')?.setValue(`option${correctIndex + 1}`);
    }
  } else {
    form.get('correctAnswer')?.setValue(q.correctAnswer);
  }
}

export function mapFormToQuestionRequest(form: FormGroup): QuestionRequest {
  const fv = form.value;
  const optionKeys = Object.keys(fv).filter((k) => k.startsWith('option'));
  const options = optionKeys.map((k) => fv[k]).filter((opt: string) => !!opt);

  let correctAnswerValue = fv.correctAnswer;
  if (optionKeys.includes(fv.correctAnswer)) {
    correctAnswerValue = fv[fv.correctAnswer];
  }

  return {
    questionTypeId: fv.type,
    categoryId: fv.category,
    difficultyId: fv.difficulty,
    questionText: fv.questionText,
    options,
    correctAnswer: correctAnswerValue,
  };
}

export function updateDropdownOptions(
  fields: DynamicFormField[],
  categories: CommonListDropDown[],
  difficulties: CommonListDropDown[],
  types: CommonListDropDown[],
) {
  fields.forEach((field) => {
    if (field.name === 'category')
      field.options = categories.map((c) => ({ value: c.id, label: c.name }));
    if (field.name === 'difficulty')
      field.options = difficulties.map((d) => ({ value: d.id, label: d.name }));
    if (field.name === 'type') field.options = types.map((t) => ({ value: t.id, label: t.name }));
  });
}
