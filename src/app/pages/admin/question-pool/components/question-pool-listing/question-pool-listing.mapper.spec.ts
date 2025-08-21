import { questionPoolToTableData } from './question-pool-listing.mapper';
import type {
  QuestionPoolListData,
  QueOptionsAndAns,
} from '../../interfaces/question-pool-list-data.interface';

describe('questionPoolToTableData', () => {
  const baseOptions: QueOptionsAndAns[] = [
    { id: 1, questionId: 1, key: 'Answer', value: 'Correct Answer' },
    { id: 2, questionId: 1, key: 'Option1', value: 'Wrong 1' },
  ];

  const basePool: QuestionPoolListData = {
    id: 1,
    categoryId: 10,
    categoryName: 'General Knowledge',
    queDifficultyId: 2,
    queDifficultyName: 'Medium',
    queText: 'Sample Question?',
    queTypeId: 5,
    queTypeName: 'Multiple Choice',
    queOptionsAns: baseOptions,
  };

  it('should map QuestionPoolListData to TableData correctly', () => {
    const result = questionPoolToTableData(basePool);

    const queText = result['queText'] as { question: string; correctAnswer: string };
    expect(queText.question).toBe(basePool.queText);
    expect(queText.correctAnswer).toBe('Correct Answer');

    const queTypeName = result['queTypeName'] as {
      tagConfig: {
        id: number;
        label: string;
        backgroundColor: string;
        textColor: string;
        hasBorder: boolean;
      };
    };
    expect(queTypeName.tagConfig).toEqual({
      id: basePool.queTypeId,
      label: basePool.queTypeName,
      backgroundColor: 'lightWhite',
      textColor: 'black',
      hasBorder: true,
    });

    expect(result['categoryName']).toBe(basePool.categoryName);

    const queDifficultyName = result['queDifficultyName'] as {
      tagConfig: { id: number; label: string; backgroundColor: string; textColor: string };
    };
    expect(queDifficultyName.tagConfig).toEqual({
      id: basePool.queDifficultyId,
      label: basePool.queDifficultyName,
      backgroundColor: 'lightYellow',
      textColor: 'yellow',
    });

    expect(result['actions']).toEqual([
      { icon: 'visibility', tooltip: 'View Question' },
      { icon: 'edit', tooltip: 'Edit Question' },
      { icon: 'delete', tooltip: 'Delete Question' },
    ]);
  });

  it('should return "N/A" when no correct answer key is found', () => {
    const poolWithoutAnswer: QuestionPoolListData = {
      ...basePool,
      queOptionsAns: [
        { id: 3, questionId: 1, key: 'Option1', value: 'Wrong 1' },
        { id: 4, questionId: 1, key: 'Option2', value: 'Wrong 2' },
      ],
    };

    const result = questionPoolToTableData(poolWithoutAnswer);
    const queText = result['queText'] as { question: string; correctAnswer: string };
    expect(queText.correctAnswer).toBe('N/A');
  });

  it('should assign correct colors for difficulty levels', () => {
    const difficulties = [
      { name: 'Easy', bg: 'lightGreen', text: 'green' },
      { name: 'Medium', bg: 'lightYellow', text: 'yellow' },
      { name: 'Hard', bg: 'lightRed', text: 'red' },
      { name: 'Unknown', bg: 'lightOrange', text: 'orange' },
    ];

    difficulties.forEach(({ name, bg, text }) => {
      const pool: QuestionPoolListData = {
        ...basePool,
        queDifficultyName: name,
      };

      const result = questionPoolToTableData(pool);
      const queDifficultyName = result['queDifficultyName'] as {
        tagConfig: { backgroundColor: string; textColor: string };
      };
      expect(queDifficultyName.tagConfig.backgroundColor).toBe(bg);
      expect(queDifficultyName.tagConfig.textColor).toBe(text);
    });
  });
});
