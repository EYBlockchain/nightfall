
import { Routes } from '@angular/router';
import { LoginComponent } from '../pages/login/login.component';
import { MintTokensComponent } from '../pages/mint-token/mint-token.component';
import { MintCoinsComponent } from '../pages/mint-coin/mint-coin.component';
import { SpendTokenComponent } from '../pages/spend-token/spend-token.component';
import { CreateAccountsComponent } from '../pages/create-accounts/create-accounts.component';
import { SpendCoinComponent } from '../pages/spend-coin/spend-coin.component';
import { BurnCoinComponent } from '../pages/burn-coin/burn-coin.component';
import {TokenListComponent} from '../pages/token-list/token-list.component';
import {CoinListComponent} from '../pages/coin-list/coin-list.component';
import { OverviewComponent } from '../pages/overview/overview.component';
import { AuthService } from '../services/auth/auth.service';
import { MintPublicTokenComponent } from '../pages/mint-public-token/mint-public-token.component';
import { UserSettingsComponent } from '../pages/user-settings/user-settings.component';
import { UserProfileComponent } from '../pages/user-profile/user-profile.component';
import { UserAccountsComponent } from '../pages/user-accounts/user-accounts.component';
import { SpendPublicTokenComponent } from '../pages/spend-public-token/spend-public-token.component';
import { BurnPublicTokenComponent } from '../pages/burn-public-token/burn-public-token.component';
import { PublicTokenListComponent } from '../pages/public-token-list/public-token-list.component';
import { BurnTokenComponent } from '../pages/burn-token/burn-token.component';
import { MintPublicCoinComponent } from '../pages/mint-public-coin/mint-public-coin.component';
import { BurnPublicCoinComponent } from '../pages/burn-public-coin/burn-public-coin.component';
import { SpendPublicCoinComponent } from '../pages/spend-public-coin/spend-public-coin.component';

export const appRoutes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'createAccount', component: CreateAccountsComponent },
  { path: 'settings',
    component: UserSettingsComponent,
    children: [
      {path: '', redirectTo: 'profile', pathMatch: 'full'},
      {path: 'profile', component: UserProfileComponent},
      {path: 'accounts', component: UserAccountsComponent}
    ],
    canActivate: [AuthService]
  },
  { path: 'overview', component: OverviewComponent, canActivate: [AuthService] },
  { path: 'token/mint', component: MintTokensComponent , canActivate: [AuthService]},
  { path: 'token/public/mint', component: MintPublicTokenComponent , canActivate: [AuthService]},
  { path: 'token/public/transfer', component: SpendPublicTokenComponent , canActivate: [AuthService]},
  { path: 'token/burn', component: BurnTokenComponent , canActivate: [AuthService]},
  { path: 'token/public/burn', component: BurnPublicTokenComponent , canActivate: [AuthService]},
  { path: 'token/public/list', component: PublicTokenListComponent , canActivate: [AuthService]},
  { path: 'token/list', component: TokenListComponent , canActivate: [AuthService]},
  { path: 'coin/list' , component: CoinListComponent, canActivate: [AuthService] },
  { path: 'coin/mint' , component: MintCoinsComponent, canActivate: [AuthService] },
  { path: 'token/transfer', component: SpendTokenComponent, canActivate: [AuthService] },
  { path: 'coin/transfer', component: SpendCoinComponent, canActivate: [AuthService] },
  { path: 'coin/burn', component: BurnCoinComponent, canActivate: [AuthService] },
  { path: 'coin/public/mint', component: MintPublicCoinComponent, canActivate: [AuthService] },
  { path: 'coin/public/transfer', component: SpendPublicCoinComponent, canActivate: [AuthService] },
  { path: 'coin/public/burn', component: BurnPublicCoinComponent, canActivate: [AuthService] },
  { path: '**', redirectTo: '/login', pathMatch: 'full' },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
];
