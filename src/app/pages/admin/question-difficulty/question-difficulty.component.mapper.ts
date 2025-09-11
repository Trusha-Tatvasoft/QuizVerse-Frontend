import { TableData } from '../../../shared/interfaces/table-component.interface';
import { QuestionDifficultyResponseDTO } from './interfaces/question-difficulty.interface';
export function questionDifficultyToTableData(dto: QuestionDifficultyResponseDTO): TableData {
  return {
    id: dto.id,

    name: {
      tagConfig: {
        id: dto.id.toString(),
        label: dto.name,
        type: 'static',
        backgroundColor: 'lightWhite',
        textColor: 'black',
        hasBorder: true,
      },
    },

    description: dto.description,

    xpPerQuestion: {
      tagConfig: {
        id: dto.id.toString(),
        label: `${dto.xpGained} XP`,
        type: 'static',
        backgroundColor: 'lightGreen',
        textColor: 'green',
        hasBorder: true,
      },
    },

    totalQuestions: `${dto.totalQuestions} Questions`,

    actions: [
      { icon: 'edit', tooltip: 'Edit Question Difficulty' },
      { icon: 'delete', tooltip: 'Delete Question Difficulty' },
    ],
  };
}
