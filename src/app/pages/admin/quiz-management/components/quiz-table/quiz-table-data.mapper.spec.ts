import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ApiResponse } from '../../../../../shared/interfaces/api-response.interface';
import { PaginatedDataResponse } from '../../../../../shared/interfaces/paginated-data-response.interface';
import { QuizListData } from '../../interfaces/quiz-table-data.interface';
import { QuizManagementComponent } from '../../quiz-management.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { QuizManagementService } from '../../../../../services/admin/quiz-management/quiz-management.service';
import { of } from 'rxjs';
import { colors, debounceTimeValue } from '../../../../../utils/constants';
import { quizToQuizListingTableData } from './quiz-table-data.mapper';
import { DropdownService } from '../../../../../shared/service/dropdown/dropdown.service';

// Mock data
const mockQuizzes: QuizListData[] = [
  {
    id: 1,
    quizTitle: 'General Knowledge Basics',
    categoryName: 'General Knowledge',
    quizDifficultyLevel: 'Easy',
    totalQuestion: 15,
    noOfPersonAttempted: 120,
    status: 2,
    createdDate: '2024-01-15T10:30:00Z',
  },
];

const mockPaginatedResponse = {
  totalRecords: 1,
  records: mockQuizzes,
};

const mockApiResponse: ApiResponse<PaginatedDataResponse<QuizListData>> = {
  result: true,
  statusCode: 200,
  message: 'Success',
  data: mockPaginatedResponse,
};

describe('QuizManagementComponent', () => {
  let component: QuizManagementComponent;
  let fixture: ComponentFixture<QuizManagementComponent>;
  let quizServiceMock: jest.Mocked<QuizManagementService>;
  let dropdownServiceMock: jest.Mocked<DropdownService>;

  beforeEach(async () => {
    quizServiceMock = {
      getQuizzes: jest.fn().mockReturnValue(of(mockApiResponse)),
      getQuizManagementStats: jest
        .fn()
        .mockReturnValue(of({ result: true, data: { totalQuizzes: 1 } })),
    } as any;

    dropdownServiceMock = {
      getDropdownData: jest.fn().mockReturnValue(of([])),
    } as any;

    await TestBed.configureTestingModule({
      imports: [QuizManagementComponent, ReactiveFormsModule, HttpClientTestingModule],
      providers: [
        { provide: QuizManagementService, useValue: quizServiceMock },
        { provide: DropdownService, useValue: dropdownServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(QuizManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    // Verifies the component initializes correctly
    expect(component).toBeTruthy();
    expect(quizServiceMock.getQuizzes).toHaveBeenCalled();
    expect(quizServiceMock.getQuizManagementStats).toHaveBeenCalled();
    expect(dropdownServiceMock.getDropdownData).toHaveBeenCalledTimes(2);
  });

  it('should fetch quizzes on init', () => {
    // Ensures quizzes are fetched and stored on component init
    expect(quizServiceMock.getQuizzes).toHaveBeenCalledTimes(1);
    expect(component.dataSource().length).toBe(1);
    expect(component.totalItems()).toBe(1);
  });

  it('should call fetchQuizzes when page changes', () => {
    // Confirms fetchQuizzes is triggered and pagination updates on page change
    const spy = jest.spyOn(component, 'fetchQuizzes');
    component.onPageChange({ pageIndex: 1, pageSize: 10 });
    expect(spy).toHaveBeenCalled();
    expect(component.pagination()).toEqual({ pageNumber: 2, pageSize: 10 });
  });

  it('should call fetchQuizzes when sort changes', () => {
    // Confirms fetchQuizzes is triggered and sorting updates on sort change
    const spy = jest.spyOn(component, 'fetchQuizzes');
    component.onSortChange({ active: 'fullName', direction: 'asc' });
    expect(spy).toHaveBeenCalled();
    expect(component.sort()).toEqual({ sortColumn: 'fullName', sortDescending: false });
  });

  it('should call fetchQuizzes on filter change', () => {
    // Ensures filter change triggers a new fetch
    const spy = jest.spyOn(component, 'fetchQuizzes');
    component.selectedStatus = 1;
    component.selectedCategory = 2;
    component.selectedDifficulty = 3;
    component.onFilterChange();
    expect(spy).toHaveBeenCalled();
  });

  it('should debounce and fetch quizzes on search input change after 500ms', fakeAsync(() => {
    // Validates that search input changes are debounced
    const spy = jest.spyOn(component as any, 'fetchQuizzes');
    component.onSearchInputChange('Maths');
    expect(spy).not.toHaveBeenCalled();
    tick(debounceTimeValue);
    expect(spy).toHaveBeenCalledTimes(1);
  }));

  it('should correctly apply filters to request payload', () => {
    // Ensures correct request object is built from filters and search term
    component.selectedStatus = 1;
    component.selectedCategory = 2;
    component.selectedDifficulty = 3;
    component.searchControl.setValue('test');

    const expectedRequest = {
      pageNumber: 1,
      pageSize: 5,
      searchTerm: 'test',
      sortColumn: '',
      sortDescending: false,
      filters: {
        quizStatus: 1,
        quizCategoryId: 2,
        quizDifficultyId: 3,
      },
    };

    component.fetchQuizzes();
    expect(quizServiceMock.getQuizzes).toHaveBeenLastCalledWith(expectedRequest);
  });

  it('should transform API response to table data using quizToQuizListingTableData', () => {
    // Validates that API quiz data is transformed correctly to table format
    component.fetchQuizzes();
    const tableRow = component.dataSource()[0] as {
      quizTitle: string;
      categoryName: string;
      quizDifficultyLevel: { tagConfig: { label: string } };
    };

    expect(tableRow.quizTitle).toBe('General Knowledge Basics');
    expect(tableRow.categoryName).toBe('General Knowledge');
    expect(tableRow.quizDifficultyLevel.tagConfig.label).toBe('Easy');
  });

  // Status mapping should return correct label, color, and background
  it.each([
    { status: 1, expectedLabel: 'Active', bg: colors.green.bg, text: colors.green.text },
    { status: 2, expectedLabel: 'Draft', bg: colors.blue.bg, text: colors.blue.text },
    { status: 3, expectedLabel: 'Inactive', bg: colors.yellow.bg, text: colors.yellow.text },
    { status: 99, expectedLabel: 'Unknown', bg: colors.brown.bg, text: colors.brown.text },
  ])('should map status correctly for status $status', ({ status, expectedLabel, bg, text }) => {
    const quiz = { ...mockQuizzes[0], status };
    const result = quizToQuizListingTableData(quiz) as any;
    expect(result.status.tagConfig.label).toBe(expectedLabel);
    expect(result.status.tagConfig.backgroundColor).toBe(bg);
    expect(result.status.tagConfig.textColor).toBe(text);
  });
});
