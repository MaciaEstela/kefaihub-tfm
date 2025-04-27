import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'kefaihub-angular';

  constructor(private translate: TranslateService) {
    translate.addLangs(['ca', 'es']);
    translate.setDefaultLang('ca');

    const savedLang = localStorage.getItem('lang');
    const browserLang = translate.getBrowserLang();
    const resolvedLang =
      savedLang ??
      (['ca', 'es'].includes(browserLang ?? '') ? browserLang! : 'ca');

    translate.use(resolvedLang);
  }
}
