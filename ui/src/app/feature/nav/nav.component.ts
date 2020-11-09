import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { RxStompService} from '@stomp/ng2-stompjs';
import { Message } from '@stomp/stompjs';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

import { AuthService } from '../../services/auth/auth.service';
import { SimpleGlobal } from 'ng2-simple-global';

interface OnDestroy {
  ngOnDestroy(): void;
}

/**
 * Componet to show the navigation bar
 */
@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css'],
  providers: [AuthService]
})
export class NavComponent implements OnInit, OnDestroy {
  @Input() name: any;
  adminAuth = false;
  userRole: any;
  assetId: any;
  private topicSubscription: Subscription;

  constructor(
    private auth: AuthService,
    private router: Router,
    private sg: SimpleGlobal,
    private rxStompService: RxStompService,
    private toastr: ToastrService,
  ) {}

  ngOnDestroy() {
    this.topicSubscription.unsubscribe();
  }

  ngOnInit() {
    this.name = this.sg['name'] || localStorage.getItem('name');
    this.receiveMessages();
  }

  receiveMessages() {
    this.topicSubscription = this.rxStompService.watch(this.name).subscribe((message: Message) => {
      const data = JSON.parse(message.body);
      this.parseDataAndShowToaster(data);
    });
  }

  toastRemover(action) {
    for (const toast of this.toastr.toasts) {
      if (toast.portal.instance.toastPackage.toastType === action) {
        this.toastr.clear(toast.toastId);
        break;
      }
    }
  }

  parseDataAndShowToaster(data) {
    const placeholder = `Something went wrong.`;
    const toasterSettings = {
      timeOut: 10000,
    };

    switch (data.type) {
      case '/mintFTCommitment':
        this.toastRemover('mintFTCommitment');
        if (data.error) {
          this.toastr.error(
            `Failed to mint fungible token commitment`,
            null,
            toasterSettings
          );
        } else {
          this.toastr.success(
            `Successfully minted fungible token commitment`,
            null,
            toasterSettings
          );
        }
        break;

      case '/transferFTCommitment':
        this.toastRemover('transferFTCommitment');
        if (data.error) {
          this.toastr.error(
            `Failed to transfer fungible token commitment`,
            null,
            toasterSettings
          );
        } else {
          this.toastr.success(
            `Successfully transferred fungible token commitment value ${Number(data[0].value)} to ${data[0].owner.name}`,
            null,
            toasterSettings
          );
        }
        break;

      case '/burnFTCommitment':
        this.toastRemover('burnFTCommitment');
        if (data.error) {
          this.toastr.error(
            `Failed burning fungible token commitment`,
            null,
            toasterSettings
          );
        } else {
          this.toastr.success(
            `Successfully burned fungible token commitment`,
            null,
            toasterSettings
          );
        }
        break;

        case '/simpleFTCommitmentBatchTransfer':
          this.toastRemover('simpleFTCommitmentBatchTransfer');
          if (data.error) {
            this.toastr.error(
              `Failed batch transfer of fungible token commitments`,
              null,
              toasterSettings
            );
          } else {
            this.toastr.success(
              `Successfully transferred fungible token commitments to selected reciever(s) `,
              null,
              toasterSettings
            );
          }
          break;

        case '/mintNFTCommitment':
          this.toastRemover('mintNFTCommitment');
          if (data.error) {
            this.toastr.error(
              `Failed to mint non-fungible token commitment`,
              null,
              toasterSettings
            );
          } else {
            this.toastr.success(
              `Successfully minted non-fungible token commitment`,
              null,
              toasterSettings
            );
          }
          break;

        case '/transferNFTCommitment':
          this.toastRemover('transferNFTCommitment');
          if (data.error) {
            this.toastr.error(
              `Failed to transfer non-fungible token commitment`,
              null,
              toasterSettings
            );
          } else {
            this.toastr.success(
              `Successfully transferred non-fungible token commitment to reciever`,
              null,
              toasterSettings
            );
          }
          break;

        case '/burnNFTCommitment':
          this.toastRemover('burnNFTCommitment');
          if (data.error) {
            this.toastr.error(
              `Failed to burn non-fungible token commitment`,
              null,
              toasterSettings
            );
          } else {
            this.toastr.success(
              `Successfully burned non-fungible token commitment`,
              null,
              toasterSettings
            );
          }
          break;

        case '/consolidationTransfer':
          this.toastRemover('consolidationTransfer');
          if (data.error) {
            this.toastr.error(
              `Failed consolidation transfer of fungible token commitments to reciever`,
              null,
              toasterSettings
            );
          } else {
            this.toastr.success(
              `Successfully transferred consolidated fungible token commitment to reciever`,
              null,
              toasterSettings
            );
          }
          break;

        case '/consolidationTransfer':
          if (data.error) {
            this.toastr.error(
              `ft commitment consolidation transfer failed: ${data.error.message || placeholder}`,
              null,
              toasterSettings
            );
          } else {
            this.toastr.success(
              `ft commitment consolidation transferred successfully.`,
              null,
              toasterSettings
            );
          }
          break;

      default:
        // code...
        break;
    }
  }
  /**
   * Method to signout user
   */
  signOut() {
    this.auth.clearStorage();
    this.router.navigate(['/login']);
  }

  /**
   * Method to navigate to settings page
   */
  settings() {
    this.router.navigate(['/settings']);
  }
}
