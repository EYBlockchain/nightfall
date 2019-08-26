import { SpinnerComponent } from './shared/spinner/spinner.component';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { NavComponent } from './feature/nav/nav.component';
import { RouterModule} from '@angular/router';
import { HttpClientModule, HTTP_INTERCEPTORS  } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ToastrModule } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { appRoutes} from './routes/routes';
import { AppComponent } from './app.component';
import { LoginComponent } from './pages/login/login.component';
import { MintTokensComponent } from './pages/mint-token/mint-token.component';
import { MintCoinsComponent } from './pages/mint-coin/mint-coin.component';
import { SpendTokenComponent } from './pages/spend-token/spend-token.component';
import { CreateAccountsComponent } from './pages/create-accounts/create-accounts.component';
import { SpendCoinComponent } from './pages/spend-coin/spend-coin.component';
import { BurnCoinComponent } from './pages/burn-coin/burn-coin.component';
import { SimpleGlobal } from 'ng2-simple-global';
import { TokenInterceptor } from './shared/token.intercepter';
import { AuthService } from './services/auth/auth.service';
import { OverviewComponent } from './pages/overview/overview.component';
import { TokenListComponent } from './pages/token-list/token-list.component';
import { CoinListComponent } from './pages/coin-list/coin-list.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { MintPublicTokenComponent } from './pages/mint-public-token/mint-public-token.component';
import { UserSettingsComponent } from './pages/user-settings/user-settings.component';
import { UserAccountsComponent } from './pages/user-accounts/user-accounts.component';
import { UserProfileComponent } from './pages/user-profile/user-profile.component';
import { CustomSelectionComponent } from './pages/user-accounts/custom-selection-component';
import { CustomTextComponent } from './pages/user-accounts/custom-text-component';
import { SpendPublicTokenComponent } from './pages/spend-public-token/spend-public-token.component';
import { BurnPublicTokenComponent } from './pages/burn-public-token/burn-public-token.component';
import { PublicTokenListComponent } from './pages/public-token-list/public-token-list.component';
import { BurnTokenComponent } from './pages/burn-token/burn-token.component';
import { MintPublicCoinComponent } from './pages/mint-public-coin/mint-public-coin.component';
import { BurnPublicCoinComponent } from './pages/burn-public-coin/burn-public-coin.component';
import { SpendPublicCoinComponent } from './pages/spend-public-coin/spend-public-coin.component';
import { AppAutoFocusDirective } from './shared/autofocus.directive';


/**
 * App moduleis the root module, which will load all the components in the application
 */
@NgModule({
  declarations: [
    AppComponent,
    SpinnerComponent,
    NavComponent,
    LoginComponent,
    MintTokensComponent,
    MintPublicTokenComponent,
    MintCoinsComponent,
    SpendTokenComponent,
    SpendPublicTokenComponent,
    BurnTokenComponent,
    BurnPublicTokenComponent,
    PublicTokenListComponent,
    SpendCoinComponent,
    BurnCoinComponent,
    MintPublicCoinComponent,
    SpendPublicCoinComponent,
    BurnPublicCoinComponent,
    CreateAccountsComponent,
    OverviewComponent,
    TokenListComponent,
    CoinListComponent,
    UserSettingsComponent,
    UserAccountsComponent,
    CustomSelectionComponent,
    CustomTextComponent,
    UserProfileComponent,
    AppAutoFocusDirective
  ],
  entryComponents: [
    CustomSelectionComponent,
    CustomTextComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule,
    Ng2SmartTableModule,
    CommonModule,
    NgbModule,
    RouterModule.forRoot(
      appRoutes // <-- debugging purposes only
    ),
    ToastrModule.forRoot({
      positionClass: 'toast-top-center',
      timeOut: 2000,
      closeButton: true,
      tapToDismiss: true
    }),
    NgSelectModule

  ],

  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true
    },
    AuthService,
    SimpleGlobal
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}

