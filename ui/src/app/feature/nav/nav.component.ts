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

  parseDataAndShowToaster(data) {
    const placeholder = `Something went wrong.`;
    const toasterSettings = {
      timeOut: 10000,
    };

    switch (data.type) {
      case '/mintFTCommitment':
        if (data.error) {
          this.toastr.error(
            `ft commitment mint failed: ${data.error.message || placeholder}`,
            'Error',
            toasterSettings
          );
        } else {
          this.toastr.success(
            `ft commitment minted successfully.`,
            'Success',
            toasterSettings
          );
        }
        break;

      case '/transferFTCommitment':
        if (data.error) {
          this.toastr.error(
            `ft commitment transfer failed: ${data.error.message || placeholder}`,
            'Error',
            toasterSettings
          );
        } else {
          this.toastr.success(
            `ft commitment value ${Number(data[0].value)} transferred successfully to ${data[0].owner.name}`,
            'Success',
            toasterSettings
          );
        }
        break;

      case '/burnFTCommitment':
        if (data.error) {
          this.toastr.error(
            `ft commitment burn failed: ${data.error.message || placeholder}`,
            'Error',
            toasterSettings
          );
        } else {
          this.toastr.success(
            `ft commitment burned successfully.`,
            'Success',
            toasterSettings
          );
        }
        break;

        case '/simpleFTCommitmentBatchTransfer':
          if (data.error) {
            this.toastr.error(
              `ft commitment batch transfer failed: ${data.error.message || placeholder}`,
              'Error',
              toasterSettings
            );
          } else {
            this.toastr.success(
              `ft commitment batch transferred successfully.`,
              'Success',
              toasterSettings
            );
          }
          break;

        case '/mintNFTCommitment':
          if (data.error) {
            this.toastr.error(
              `nft commitment mint failed: ${data.error.message || placeholder}`,
              'Error',
              toasterSettings
            );
          } else {
            this.toastr.success(
              `nft commitment minted successfully.`,
              'Success',
              toasterSettings
            );
          }
          break;

        case '/transferNFTCommitment':
          if (data.error) {
            this.toastr.error(
              `nft commitment transfer failed: ${data.error.message || placeholder}`,
              'Error',
              toasterSettings
            );
          } else {
            this.toastr.success(
              `nft commitment transferred successfully.`,
              'Success',
              toasterSettings
            );
          }
          break;

        case '/burnNFTCommitment':
          if (data.error) {
            this.toastr.error(
              `nft commitment burn failed: ${data.error.message || placeholder}`,
              'Error',
              toasterSettings
            );
          } else {
            this.toastr.success(
              `nft commitment burned successfully.`,
              'Success',
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
