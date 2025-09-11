import {
  BrowseQuizzesSorting,
  BrowseQuizzesFilterByType,
} from '../../../shared/enums/browse-quiz.enum';
import { CommonListDropDown } from '../../../shared/interfaces/common-dropdown.interface';
import { DropDownData } from '../../../shared/interfaces/drop-down-data.interface';
import { TagInputConfig } from '../../../shared/interfaces/tag-component.interface';
import { defaultTagConfig } from './configs/browse-quizzes.config';
import { BrowseQuizResponse } from './interfaces/browse-quiz-response.interface';
import { quizTabConfig } from './configs/browse-quizzes-tab.config';
import { QuizCardConfig } from './interfaces/browsr-quiz-request.interface';

export function mapQuizToCardConfig(apiQuiz: BrowseQuizResponse): QuizCardConfig {
  return {
    id: apiQuiz.id,
    title: apiQuiz.name,
    description: apiQuiz.description,
    category: {
      id: apiQuiz.categoryName.toLowerCase(),
      label: apiQuiz.categoryName,
      type: 'static',
      isSelected: false,
      hasBorder: true,
      backgroundColor: 'lightYellow',
      textColor: 'yellow',
    },
    difficulty: {
      id: apiQuiz.difficultyLevel.toLowerCase(),
      label: apiQuiz.difficultyLevel,
      type: 'static',
      isSelected: false,
      hasBorder: true,
      backgroundColor: 'lightWhite',
      textColor: 'black',
    },
    priceTag: apiQuiz.isPaid
      ? {
          id: `price-${apiQuiz.id}`,
          label: `₹ ${apiQuiz.price}`,
          type: 'static',
          isSelected: false,
          hasBorder: true,
          backgroundColor: 'lightGreen',
          textColor: 'green',
        }
      : undefined,
    tags: (apiQuiz.tags || [])
      .filter((tag) => tag !== null)
      .map((tag, i) => ({
        id: `${apiQuiz.id}-tag-${i}`,
        label: tag,
        type: 'static',
        isSelected: false,
        hasBorder: false,
        backgroundColor: 'lightPurple',
        textColor: 'purple',
      })),
    duration: `${apiQuiz.totalTime}m`,
    questions: apiQuiz.totalQuestions,
    participants: apiQuiz.totalParticipates,
    rating: apiQuiz.rating,
    isFeatured: apiQuiz.isFeatured,
    isPaid: apiQuiz.isPaid,
    isAttempted: apiQuiz.isAttempted,
    buttonConfig: apiQuiz.isAttempted
      ? {
          label: 'Show Result',
          matIcon: 'visibility',
          iconFontSet: 'material-icons-outlined',
          variant: 'secondary',
          fontWeight: 600,
        }
      : {
          label: apiQuiz.isPaid ? `Play ₹${apiQuiz.price}` : 'Play Free',
          matIcon: 'play_arrow',
          iconFontSet: 'material-icons-outlined',
          variant: 'secondary',
          fontWeight: 600,
        },
  };
}

export function mapSortingEnumToDropdown(): DropDownData[] {
  return Object.keys(BrowseQuizzesSorting)
    .filter((key) => isNaN(Number(key)))
    .map((key) => ({
      id: BrowseQuizzesSorting[key as keyof typeof BrowseQuizzesSorting],
      name: key.replace(/([A-Z])/g, ' $1').trim(),
    }));
}

export function mapDropdownToTags(dropdowns: CommonListDropDown[]): TagInputConfig[] {
  return dropdowns.map((drop) => ({
    ...defaultTagConfig,
    id: drop.id.toString(),
    label: drop.name,
  }));
}

export function getTabCount(
  tabId: string,
  tabCounts: { featured: number; allQuizzes: number; free: number; premium: number },
): number {
  switch (tabId) {
    case 'featured':
      return tabCounts.featured;
    case 'all-quizzes':
      return tabCounts.allQuizzes;
    case 'free':
      return tabCounts.free;
    case 'premium':
      return tabCounts.premium;
    default:
      return 0;
  }
}

export function updateTabLabels(tabCounts: {
  featured: number;
  allQuizzes: number;
  free: number;
  premium: number;
}) {
  return quizTabConfig.map((tab) => {
    const count = getTabCount(tab.id, tabCounts);
    return {
      ...tab,
      label: `${tab.label.split(' (')[0]} (${count})`,
    };
  });
}

export const tabToTypeMap: Record<string, BrowseQuizzesFilterByType | null> = {
  featured: BrowseQuizzesFilterByType.Featured,
  'all-quizzes': null,
  free: BrowseQuizzesFilterByType.Free,
  premium: BrowseQuizzesFilterByType.Premium,
};
