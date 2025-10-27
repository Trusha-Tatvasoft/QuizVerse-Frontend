import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QuizResultPageComponent } from './quiz-result-page.component';
import { ActivatedRoute } from '@angular/router';
import { SnackbarService } from '../../../shared/service/snackbar/snackbar.service';
import { platformMessages } from '../../../utils/constants';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('QuizResultPageComponent', () => {
  let component: QuizResultPageComponent;
  let fixture: ComponentFixture<QuizResultPageComponent>;
  let mockSnackbarService: Partial<SnackbarService>;
  let mockActivatedRoute = {
    snapshot: {
      paramMap: {
        get: jest.fn(),
        getAll: jest.fn().mockReturnValue([]),
        has: jest.fn().mockReturnValue(true),
        keys: [],
      } as any, // or cast to ParamMap
    },
  };

  beforeEach(async () => {
    mockSnackbarService = {
      showError: jest.fn(),
    };

    const mockParamMap = {
      get: jest.fn(),
      getAll: jest.fn().mockReturnValue([]),
      has: jest.fn().mockReturnValue(true),
      keys: [],
    };

    mockActivatedRoute = {
      snapshot: {
        paramMap: mockParamMap,
      },
    };

    await TestBed.configureTestingModule({
      imports: [
        QuizResultPageComponent,
        HttpClientTestingModule, // <-- this fixes the NullInjectorError
      ],
      providers: [
        { provide: SnackbarService, useValue: mockSnackbarService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(QuizResultPageComponent);
    component = fixture.componentInstance;
  });

  describe('decodeRouteId', () => {
    it('should decode a valid base64 encoded numeric id', () => {
      const validId = btoa('123'); // base64 encode number as string
      (mockActivatedRoute.snapshot.paramMap.get as jest.Mock).mockReturnValue(
        encodeURIComponent(validId),
      );

      component.decodeRouteId();

      expect(component.decodedQuizId).toBe(123);
      expect(mockSnackbarService.showError).not.toHaveBeenCalled();
    });

    it('should show error if encoded id is invalid base64', () => {
      const invalidId = '%'; // invalid encoding
      (mockActivatedRoute.snapshot.paramMap.get as jest.Mock).mockReturnValue(invalidId);

      component.decodeRouteId();

      expect(component.decodedQuizId).toBe(0);
      expect(mockSnackbarService.showError).toHaveBeenCalledWith(
        platformMessages.errorMessage,
        platformMessages.invalidQuizId,
      );
    });

    it('should show error if decoded value is not a number', () => {
      const notANumber = btoa('abc'); // base64 of a non-number
      (mockActivatedRoute.snapshot.paramMap.get as jest.Mock).mockReturnValue(
        encodeURIComponent(notANumber),
      );

      component.decodeRouteId();

      expect(component.decodedQuizId).toBe(0);
      expect(mockSnackbarService.showError).toHaveBeenCalledWith(
        platformMessages.errorTitle,
        platformMessages.invalidQuizId,
      );
    });

    it('should do nothing if route param id is null', () => {
      (mockActivatedRoute.snapshot.paramMap.get as jest.Mock).mockReturnValue(null);

      component.decodeRouteId();

      expect(component.decodedQuizId).toBeUndefined();
      expect(mockSnackbarService.showError).not.toHaveBeenCalled();
    });
  });

  it('should call decodeRouteId on ngOnInit', () => {
    const spy = jest.spyOn(component, 'decodeRouteId');
    component.ngOnInit();
    expect(spy).toHaveBeenCalled();
  });
});
