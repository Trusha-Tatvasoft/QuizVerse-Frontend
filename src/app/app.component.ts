import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LazyTab } from './shared/interfaces/tab-component.interface';
import { TabComponent, TabContentDirective } from './shared/components/tab/tab.component';
import { ButtonConfig } from './shared/interfaces/button-config.interface';
import { FilledButtonComponent } from './shared/components/filled-button/filled-button.component';
import { TabLazyComponentMap } from './utils/tab-component-lazy-map';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, TabComponent, TabContentDirective, FilledButtonComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'QuizVerse-Frontend';
  playButton: ButtonConfig = {
    label: 'Start Playing Now',
    matIcon: 'play_arrow',
    iconFontSet: 'material-icons',
    imagePosition: 'left',
    fontWeight: 500,
    variant: 'gradient',
  };

  tabs: LazyTab[] = [
    {
      id: 'filled-button',
      label: 'Button Example',
      icon: 'play_arrow',
      // loadChildren: TabLazyComponentMap['filled-button'],
    },
    {
      id: 'page-header',
      label: 'Header Example',
      icon: 'badge',
      loadChildren: TabLazyComponentMap['page-header'],
    },
    {
      id: 'static-quote',
      label: 'Quote',
      icon: 'format_quote',
    },
  ];

  selectedIndex = 0;

  onTabChanged(index: number) {}
}
