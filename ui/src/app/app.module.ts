import { InjectableRxStompConfig, RxStompService, rxStompServiceFactory } from '@stomp/ng2-stompjs';
import '@angular/compiler';
import { myRxStompConfig } from './rx-stomp.config';
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
import LoginComponent from './pages/login';
import CreateAccountsComponent from './pages/create-accounts';
import { SimpleGlobal } from 'ng2-simple-global';
import { TokenInterceptor } from './shared/token.intercepter';
import { AuthService } from './services/auth/auth.service';
import OverviewComponent from './pages/overview';
import { NgSelectModule } from '@ng-select/ng-select';

import UserSettingsComponent from './pages/user-settings';
import AdminComponent from './pages/admin';
import UserProfileComponent from './pages/user-profile';
import { UserAccountsComponent } from './pages/user-accounts/user-accounts.component';
import { CustomSelectionComponent } from './pages/user-accounts/custom-selection-component';
import { CustomTextComponent } from './pages/user-accounts/custom-text-component';

import NftMintComponent from './pages/nft-mint';
import NftTransferComponent from './pages/nft-transfer';
import NftBurnComponent from './pages/nft-burn';
import NftListComponent from './pages/nft-list';

import NftCommitmentMintComponent from './pages/nft-commitment-mint';
import NftCommitmentTransferComponent from './pages/nft-commitment-transfer';
import NftCommitmentBurnComponent from './pages/nft-commitment-burn';
import NftCommitmentListComponent from './pages/nft-commitment-list';

import FtMintComponent from './pages/ft-mint';
import FtBurnComponent from './pages/ft-burn';
import FtTransferComponent from './pages/ft-transfer';

import FtCommitmentMintComponent from './pages/ft-commitment-mint';
import FtCommitmentTrasnferComponent from './pages/ft-commitment-transfer';
import FtCommitmentConsolidationTrasnferComponent from './pages/ft-commitment-consolidation-transfer';
import FtCommitmentBatchTrasnferComponent from './pages/ft-commitment-batch-transfer';
import FtCommitmentBurnComponent from './pages/ft-commitment-burn';
import FtCommitmentListComponent from './pages/ft-commitment-list';

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
    NftCommitmentMintComponent,
    NftMintComponent,
    FtCommitmentMintComponent,
    NftCommitmentTransferComponent,
    NftTransferComponent,
    NftCommitmentBurnComponent,
    NftBurnComponent,
    NftListComponent,
    FtCommitmentTrasnferComponent,
    FtCommitmentConsolidationTrasnferComponent,
    FtCommitmentBatchTrasnferComponent,
    FtCommitmentBurnComponent,
    FtMintComponent,
    FtTransferComponent,
    FtBurnComponent,
    CreateAccountsComponent,
    OverviewComponent,
    NftCommitmentListComponent,
    FtCommitmentListComponent,
    UserSettingsComponent,
    UserAccountsComponent,
    CustomSelectionComponent,
    CustomTextComponent,
    UserProfileComponent,
    AdminComponent,
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
      positionClass: 'toast-top-right',
      timeOut: 6000,
      tapToDismiss: true
    }),
    NgSelectModule,
  ],

  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true
    },
    {
      provide: InjectableRxStompConfig,
      useValue: myRxStompConfig
    },
    {
      provide: RxStompService,
      useFactory: rxStompServiceFactory,
      deps: [InjectableRxStompConfig]
    },
    AuthService,
    SimpleGlobal
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}

