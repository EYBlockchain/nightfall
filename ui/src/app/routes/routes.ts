
import { Routes } from '@angular/router';
import LoginComponent from '../pages/login';
import CreateAccountsComponent from '../pages/create-accounts';
import OverviewComponent from '../pages/overview';
import { AuthService } from '../services/auth/auth.service';
import UserSettingsComponent from '../pages/user-settings';
import UserProfileComponent from '../pages/user-profile';
import { UserAccountsComponent } from '../pages/user-accounts/user-accounts.component';

import NftMintComponent from '../pages/nft-mint';
import NftTransferComponent from '../pages/nft-transfer';
import NftBurnComponent from '../pages/nft-burn';
import NftListComponent from '../pages/nft-list';

import NftCommitmentMintComponent from '../pages/nft-commitment-mint';
import NftCommitmentTransferComponent from '../pages/nft-commitment-transfer';
import NftCommitmentBurnComponent from '../pages/nft-commitment-burn';
import NftCommitmentListComponent from '../pages/nft-commitment-list';

import FtMintComponent from '../pages/ft-mint';
import FtBurnComponent from '../pages/ft-burn';
import FtTransferComponent from '../pages/ft-transfer';

import FtCommitmentMintComponent from '../pages/ft-commitment-mint';
import FtCommitmentTrasnferComponent from '../pages/ft-commitment-transfer';
import FtCommitmentBurnComponent from '../pages/ft-commitment-burn';
import FtCommitmentListComponent from '../pages/ft-commitment-list';
import FtCommitmentBatchTrasnferComponent from '../pages/ft-commitment-batch-transfer';

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

  { path: 'nft-commitment/mint', component: NftCommitmentMintComponent , canActivate: [AuthService]},
  { path: 'nft-commitment/transfer', component: NftCommitmentTransferComponent, canActivate: [AuthService] },
  { path: 'nft-commitment/burn', component: NftCommitmentBurnComponent , canActivate: [AuthService]},
  { path: 'nft-commitment/list', component: NftCommitmentListComponent , canActivate: [AuthService]},

  { path: 'nft/mint', component: NftMintComponent , canActivate: [AuthService]},
  { path: 'nft/transfer', component: NftTransferComponent , canActivate: [AuthService]},
  { path: 'nft/burn', component: NftBurnComponent , canActivate: [AuthService]},
  { path: 'nft/list', component: NftListComponent , canActivate: [AuthService]},

  { path: 'ft-commitment/mint' , component: FtCommitmentMintComponent, canActivate: [AuthService] },
  { path: 'ft-commitment/transfer', component: FtCommitmentTrasnferComponent, canActivate: [AuthService] },
  { path: 'ft-commitment/batch-transfer', component: FtCommitmentBatchTrasnferComponent, canActivate: [AuthService] },
  { path: 'ft-commitment/burn', component: FtCommitmentBurnComponent, canActivate: [AuthService] },
  { path: 'ft-commitment/list' , component: FtCommitmentListComponent, canActivate: [AuthService] },

  { path: 'ft/mint', component: FtMintComponent, canActivate: [AuthService] },
  { path: 'ft/transfer', component: FtTransferComponent, canActivate: [AuthService] },
  { path: 'ft/burn', component: FtBurnComponent, canActivate: [AuthService] },

  { path: '**', redirectTo: '/login', pathMatch: 'full' },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
];
