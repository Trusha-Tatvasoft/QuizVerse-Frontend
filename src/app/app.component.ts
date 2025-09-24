import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoaderComponent } from './shared/components/loader/loader.component';
import { PlatformSettingsService } from './services/admin/platform-settings/platform-settings.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, LoaderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'QuizVerse-Frontend';

  // Inject PlatformSettingsService to initialize theme
  private readonly platformSettingsService = inject(PlatformSettingsService);
}
