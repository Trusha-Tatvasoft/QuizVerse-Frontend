import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PlatformSettingsComponent } from './platform-settings.component';
import { PlatformSettingsService } from '../../../services/admin/platform-settings/platform-settings.service';
import { SnackbarService } from '../../../shared/service/snackbar/snackbar.service';
import { ValidationErrorService } from '../../../shared/service/validation-error/validation-error.service';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { plateformSettingCRUDMessages } from '../../../utils/constants';

describe('PlatformSettingsComponent', () => {
  let component: PlatformSettingsComponent;
  let fixture: ComponentFixture<PlatformSettingsComponent>;
  let mockPlatformSettingsService: jest.Mocked<PlatformSettingsService>;
  let mockSnackbar: jest.Mocked<SnackbarService>;
  let mockValidationErrorService: jest.Mocked<ValidationErrorService>;

  beforeEach(async () => {
    mockPlatformSettingsService = {
      getPlatformConfigurations: jest.fn().mockReturnValue(
        of({
          result: true,
          statusCode: 200,
          message: 'Fetched successfully',
          data: {
            logo: 'logo.png',
            defaultsColors: { primaryColor: '#0000FF', secondaryColor: '#00FF00' },
          },
        }),
      ),
      updatePlatformConfigurations: jest.fn().mockReturnValue(
        of({
          result: true,
          statusCode: 200,
          message: 'Updated successfully',
          data: null,
        }),
      ),
    } as any;

    mockSnackbar = {
      showError: jest.fn(),
      showSuccess: jest.fn(),
    } as any;

    mockValidationErrorService = {
      getErrorMessage: jest.fn().mockReturnValue('mock error'),
    } as any;

    await TestBed.configureTestingModule({
      imports: [PlatformSettingsComponent, ReactiveFormsModule],
      providers: [
        { provide: PlatformSettingsService, useValue: mockPlatformSettingsService },
        { provide: SnackbarService, useValue: mockSnackbar },
        { provide: ValidationErrorService, useValue: mockValidationErrorService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PlatformSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create component and initialize form', () => {
    expect(component).toBeTruthy();
    expect(component.platformSettingsForm).toBeDefined();
  });

  describe('loadPlatformConfigurations', () => {
    it('should load and patch config on success', () => {
      const mockConfig = {
        result: true,
        data: {
          quote: 'Test Quote',
          logo: 'logo.png',
          defaultsColors: { primaryColor: '#111111', secondaryColor: '#222222' },
        },
      };
      mockPlatformSettingsService.getPlatformConfigurations.mockReturnValue(of(mockConfig as any));

      component['loadPlatformConfigurations']();

      expect(component.platformConfig).toEqual(mockConfig.data);
      expect(component.previewUrl).toContain('logo.png');
      expect(component.platformSettingsForm.get('landingPageQuote')?.value).toBe('Test Quote');
    });

    it('should show error if result is false', () => {
      const mockRes = { result: false, message: 'Error' };
      mockPlatformSettingsService.getPlatformConfigurations.mockReturnValue(of(mockRes as any));

      component['loadPlatformConfigurations']();

      expect(mockSnackbar.showError).toHaveBeenCalledWith('Error');
    });

    it('should show error on exception', () => {
      mockPlatformSettingsService.getPlatformConfigurations.mockReturnValue(
        throwError(() => 'Http Error'),
      );

      component['loadPlatformConfigurations']();

      expect(mockSnackbar.showError).toHaveBeenCalledWith('Http Error');
    });
  });

  describe('patchFormValues', () => {
    it('should patch values correctly', () => {
      const config = {
        quote: 'Hello',
        defaultsColors: { primaryColor: '#111', secondaryColor: '#222' },
      } as any;
      component['patchFormValues'](config);

      expect(component.platformSettingsForm.get('landingPageQuote')?.value).toBe('Hello');
      expect(component.platformSettingsForm.get('primaryColor')?.value).toBe('#111');
    });

    it('should fallback to defaults if empty', () => {
      const config = {} as any;
      component['patchFormValues'](config);

      expect(component.platformSettingsForm.get('primaryColor')?.value).toBe('#000000');
      expect(component.platformSettingsForm.get('secondaryColor')?.value).toBe('#000000');
    });
  });

  describe('getError', () => {
    it('should return validation error message', () => {
      const msg = component.getError('landingPageQuote');
      expect(msg).toBe('mock error');
    });
  });

  describe('colorChange', () => {
    it('should update color control', () => {
      const event = { target: { value: '#123456' } } as any;
      component.colorChange(event, 'primaryColor');
      expect(component.platformSettingsForm.get('primaryColor')?.value).toBe('#123456');
    });
  });

  describe('textColorChange', () => {
    it('should add # if missing and set value if valid hex', () => {
      const event = { target: { value: '123456' } } as any;
      component.textColorChange(event, 'primaryColor');
      expect(component.platformSettingsForm.get('primaryColor')?.value).toBe('#123456');
    });

    it('should not set value if invalid hex', () => {
      const event = { target: { value: 'zzz' } } as any;
      component.textColorChange(event, 'primaryColor');
      expect(component.platformSettingsForm.get('primaryColor')?.value).not.toBe('#zzz');
    });
  });

  describe('savePlatformConfig', () => {
    it('should save valid form and show success', () => {
      component.platformSettingsForm.setValue({
        landingPageQuote: 'Quote',
        primaryColor: '#111111',
        secondaryColor: '#222222',
        siteLogo: null,
      });

      mockPlatformSettingsService.updatePlatformConfigurations.mockReturnValue(
        of({
          result: true,
          statusCode: 200,
          message: 'Updated successfully',
          data: null,
        }),
      );

      component.savePlatformConfig();

      expect(mockSnackbar.showSuccess).toHaveBeenCalledWith(
        plateformSettingCRUDMessages.plateformSettingUpdated,
      );
    });

    it('should show error if API returns false', () => {
      component.platformSettingsForm.setValue({
        landingPageQuote: 'Quote',
        primaryColor: '#111111',
        secondaryColor: '#222222',
        siteLogo: null,
      });

      mockPlatformSettingsService.updatePlatformConfigurations.mockReturnValue(
        of({
          result: false,
          statusCode: 400,
          message: 'Invalid request',
          data: null,
        }),
      );

      component.savePlatformConfig();

      expect(mockSnackbar.showError).toHaveBeenCalledWith('Invalid request');
    });

    it('should show error if API throws error', () => {
      component.platformSettingsForm.setValue({
        landingPageQuote: 'Quote',
        primaryColor: '#111111',
        secondaryColor: '#222222',
        siteLogo: null,
      });

      mockPlatformSettingsService.updatePlatformConfigurations.mockReturnValue(
        throwError(() => 'Error'),
      );

      component.savePlatformConfig();

      expect(mockSnackbar.showError).toHaveBeenCalledWith('Error');
    });

    it('should mark all as touched if form invalid', () => {
      jest.spyOn(component.platformSettingsForm, 'markAllAsTouched');
      component.platformSettingsForm.get('landingPageQuote')?.setValue('');

      component.savePlatformConfig();

      expect(component.platformSettingsForm.markAllAsTouched).toHaveBeenCalled();
    });
  });

  describe('fileSelected', () => {
    it('should accept valid image file', () => {
      const file = new File([''], 'logo.png', { type: 'image/png' });
      const event = { target: { files: [file], value: '' } } as any;

      component.fileSelected(event, 'siteLogo');
      expect(component.platformSettingsForm.get('siteLogo')?.value).toBe(file);
    });

    it('should reject invalid file type', () => {
      const file = new File([''], 'doc.txt', { type: 'text/plain' });
      const event = { target: { files: [file], value: '' } } as any;

      component.fileSelected(event, 'siteLogo');

      expect(mockSnackbar.showError).toHaveBeenCalledWith(
        plateformSettingCRUDMessages.invalidFileType,
      );
      expect(component.platformSettingsForm.get('siteLogo')?.value).toBeNull();
    });

    it('should reset form control if no file', () => {
      const event = { target: { files: [] } } as any;
      component.fileSelected(event, 'siteLogo');
      expect(component.platformSettingsForm.get('siteLogo')?.value).toBeNull();
    });
  });

  describe('removeImage', () => {
    it('should clear preview and reset control', () => {
      const input = { value: '' } as HTMLInputElement;
      component.previewUrl = 'something';
      component.platformSettingsForm.get('siteLogo')?.setValue('file');
      component.removeImage('siteLogo', input);

      expect(component.previewUrl).toBeNull();
      expect(component.platformSettingsForm.get('siteLogo')?.value).toBeNull();
    });
  });

  describe('color validation logic', () => {
    describe('isWhiteLike', () => {
      it('should return true for white-like colors', () => {
        expect((component as any).isWhiteLike('#FFFFFF')).toBe(true);
        expect((component as any).isWhiteLike('#F9F9F9')).toBe(true);
      });

      it('should return false for darker colors', () => {
        expect((component as any).isWhiteLike('#111111')).toBe(false);
      });
    });

    describe('areColorsSimilar', () => {
      it('should return true for very similar colors', () => {
        expect((component as any).areColorsSimilar('#111111', '#111112')).toBe(true);
      });

      it('should return false for very different colors', () => {
        expect((component as any).areColorsSimilar('#000000', '#FFFFFF')).toBe(false);
      });
    });

    describe('PlatformSettingsComponent color validation logic', () => {
      describe('validateAndSetColor', () => {
        it('should revert to service value if color is white-like', () => {
          // arrange
          (mockPlatformSettingsService as any).platformConfig$ = of({
            defaultsColors: { primaryColor: '#111111', secondaryColor: '#222222' },
          });

          // act
          (component as any).validateAndSetColor('primaryColor', '#FFFFFF');

          // assert
          expect(mockSnackbar.showError).toHaveBeenCalledWith(
            'White or very light colors are not allowed',
          );
          expect(component.platformSettingsForm.get('primaryColor')?.value).toBe('#111111');
        });

        it('should revert if colors are too similar', () => {
          (mockPlatformSettingsService as any).platformConfig$ = of({
            defaultsColors: { primaryColor: '#111111', secondaryColor: '#222222' },
          });

          component.platformSettingsForm.get('secondaryColor')?.setValue('#111112');

          (component as any).validateAndSetColor('primaryColor', '#111111');

          expect(mockSnackbar.showError).toHaveBeenCalledWith(
            'Primary and secondary colors cannot be the same or too similar',
          );
        });
      });

      describe('revertToServiceValue', () => {
        it('should fallback to service primaryColor when reverting primaryColor', () => {
          (mockPlatformSettingsService as any).platformConfig$ = of({
            defaultsColors: { primaryColor: '#ABCDEF', secondaryColor: '#FEDCBA' },
          });

          (component as any).revertToServiceValue('primaryColor');

          expect(component.platformSettingsForm.get('primaryColor')?.value).toBe('#ABCDEF');
        });

        it('should fallback to service secondaryColor when reverting secondaryColor', () => {
          (mockPlatformSettingsService as any).platformConfig$ = of({
            defaultsColors: { primaryColor: '#ABCDEF', secondaryColor: '#FEDCBA' },
          });

          (component as any).revertToServiceValue('secondaryColor');

          expect(component.platformSettingsForm.get('secondaryColor')?.value).toBe('#FEDCBA');
        });
      });
    });
  });

  describe('displayFileName', () => {
    it('should return selected file name if present', () => {
      component.selectedFile = new File([''], 'test.png', { type: 'image/png' });
      expect(component.displayFileName('siteLogo')).toBe('test.png');
    });

    it('should return file name from string path', () => {
      component.platformSettingsForm.get('siteLogo')?.setValue('uploads/logo.png');
      expect(component.displayFileName('siteLogo')).toBe('logo.png');
    });

    it('should return "No file chosen" if no file', () => {
      expect(component.displayFileName('siteLogo')).toBe('No file chosen');
    });
  });

  describe('hexToRgb', () => {
    it('should convert 6 digit hex to rgb', () => {
      const rgb = (component as any).hexToRgb('#FF0000');
      expect(rgb).toEqual({ r: 255, g: 0, b: 0 });
    });

    it('should convert 3 digit hex to rgb', () => {
      const rgb = (component as any).hexToRgb('#0F0');
      expect(rgb).toEqual({ r: 0, g: 255, b: 0 });
    });
  });

  describe('savePlatformConfig with file', () => {
    it('should append siteLogo if it is a File', () => {
      const file = new File([''], 'logo.png', { type: 'image/png' });
      component.platformSettingsForm.setValue({
        landingPageQuote: 'Quote',
        primaryColor: '#111111',
        secondaryColor: '#222222',
        siteLogo: file,
      });

      mockPlatformSettingsService.updatePlatformConfigurations.mockReturnValue(
        of({
          statusCode: 200,
          message: 'Success',
          result: true,
          data: null,
        }),
      );

      component.savePlatformConfig();

      expect(mockPlatformSettingsService.updatePlatformConfigurations).toHaveBeenCalled();
      const formData = mockPlatformSettingsService.updatePlatformConfigurations.mock.calls[0][0];
      expect(formData.get('Logo')).toBe(file);
    });
  });

  describe('fileSelected with preview', () => {
    it('should generate preview url for valid file', () => {
      const file = new File(['dummy content'], 'logo.png', { type: 'image/png' });
      const event = { target: { files: [file], value: '' } } as any;

      const mockFileReader: Partial<FileReader> = {
        readAsDataURL: jest.fn(),
        onload: null,
        result: null,
      };

      jest
        .spyOn(window as any, 'FileReader')
        .mockImplementation(() => mockFileReader as FileReader);

      component.fileSelected(event, 'siteLogo');

      const fakeResult = 'data:image/png;base64,abc';
      (mockFileReader as any).result = fakeResult;
      (mockFileReader.onload as any).call(mockFileReader, {});

      expect(component.previewUrl).toBe(fakeResult);

      (window.FileReader as any).mockRestore();
    });

    it('should reset if input.files is null', () => {
      const event = { target: { files: null, value: '' } } as any;
      component.fileSelected(event, 'siteLogo');
      expect(component.platformSettingsForm.get('siteLogo')?.value).toBeNull();
      expect(component.previewUrl).toBeNull();
    });
  });

  describe('validateAndSetColor success case', () => {
    it('should set color if valid and not similar', () => {
      (mockPlatformSettingsService as any).platformConfigSubject = {
        getValue: jest.fn().mockReturnValue({
          defaultsColors: { primaryColor: '#111111', secondaryColor: '#222222' },
        }),
      };

      (component as any).validateAndSetColor('primaryColor', '#123456');
      expect(component.platformSettingsForm.get('primaryColor')?.value).toBe('#123456');
    });
  });
});
