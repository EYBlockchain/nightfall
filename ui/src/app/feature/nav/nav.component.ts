import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { SimpleGlobal } from 'ng2-simple-global';

/**
 * Componet to show the navigation bar
 */
@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css'],
  providers: [AuthService]
})
export class NavComponent implements OnInit {
  @Input() name: any;
  adminAuth = false;
  userRole: any;
  assetId: any;

  constructor(
    private auth: AuthService,
    private router: Router,
    private sg: SimpleGlobal
  ) { }

  ngOnInit() {
    this.name = this.sg['name'] || localStorage.getItem('name');
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
