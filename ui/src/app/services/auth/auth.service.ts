import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router/src/index';
import { Router, ActivatedRouteSnapshot } from '@angular/router';

/**
 * Auth services, which accomodated all account related methods.
 */
@Injectable()
export class AuthService implements CanActivate {
  isValid: boolean;
  constructor(
    private router: Router
  ) {}
  /**
   * @ignore
   */
  public getToken(): string {
    return localStorage.getItem('token') ? localStorage.getItem('token') : '';
  }

  /**
   * Method to cleare local storage.
   */
  public clearStorage() {
    localStorage.removeItem('token');
    localStorage.removeItem('address');
    localStorage.removeItem('name');
    localStorage.removeItem('publickey');
    localStorage.removeItem('secretkey');
  }

  /**
   * Method to get user role.
   */
  public getRole(): Promise<string> {
    return new Promise((resolve, reject) => {
      resolve(localStorage.getItem('role') ? localStorage.getItem('role') : '');
    });
  }

  /**
   *
   * Method to protect private routes.
   *
   * @param route {Object} ActivatedRouteSnapshot
   */
  public canActivate(route: ActivatedRouteSnapshot): boolean {
    const Role = route.data.Role;
    const token = this.getToken();
    this.getRole().then((result) => {
      if (token) {
        if (this.router.url === '/accounts') {
          if (Role === result ) {
            return true;
          } else {
            this.router.navigate(['/home']);
            return false;
          }
        } else {
          return true;
        }
      } else {
        this.isValid = false;
        this.router.navigate(['/login']);
        return false;
      }
    });
    return true;
  }
}
