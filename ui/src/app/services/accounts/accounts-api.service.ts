import { api } from './../../shared/config';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { HttpClient } from '@angular/common/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/forkJoin';
import { HttpHeaders } from '@angular/common/http';
import { catchError, tap, map } from 'rxjs/operators';
import { config } from '../../shared/config';

/**
 * Account services, which accomodated all account related methods.
 */
@Injectable()
export class AccountsApiService {

  root = config.apiGateway.root;
  searchAPI = 'asset';

  constructor(private http: HttpClient) {}

  /**
   * Method to initiate a HTTP request to get all user accounts.
   */
  getAccounts() {
    return this.http.get(this.root + 'listAccounts').pipe(
      tap(datra => console.log(''))
    );
  }

  /**
   * Method to initiate a HTTP request to get all users.
   */
  getUsers() {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    };
    const url = config.apiGateway.root + 'offchain-service/pkd/names';

    return this.http
      .get(url, httpOptions)
      .pipe(tap(data => console.log(data)),
      catchError(err => {
        console.log('User Not Found', err);
        return err;
      })
    );
  }

  /**
   * Method to initiate a HTTP request to get a user.
   */
  getUser() {
    const url = config.database.root + 'user?pk_B=' + localStorage.getItem('publickey');
    return this.http.get(url).pipe(
      tap(data => {}),
      catchError(err => {
        console.log('User Not Found', err);
        return err;
      })
    );
  }

  /**
   * Method to initiate a HTTP request to get transaction history based on type
   * @param type Possible types are tokens, publictokens, coins, publiccoins
   * @param pageNo Page number
   * @param limit Page limit
   */
  getTransactions(type: string, pageNo: number, limit: number) {
    let url;
    if (type === 'tokens') {
      url = config.database.root + 'token/transaction?type=' + type + '&pageNo=' + pageNo + '&limit=' + limit;
    } else if (type === 'publictokens') {
      url = config.database.root + 'nft/transaction?type=' + type + '&pageNo=' + pageNo + '&limit=' + limit;
 } else if (type === 'publiccoins') {
      url = config.database.root + 'ft/transaction?type=' + type + '&pageNo=' + pageNo + '&limit=' + limit;
 } else {
      url = config.database.root + 'coin/transaction?pageNo=' + pageNo + '&limit=' + limit;
 }

    return this.http.get(url).pipe(
      tap(data => {}),
      catchError(err => {
        console.log('User Not Found', err);
        return err;
      })
    );
  }

  /**
   * Method to initiate a HTTP request to get ERC-20 token commitments of logged in user.
   */
  getCoins() {
    const url = config.zkp.root + 'ft/details';
    return this.http.get(url).pipe(
      map((data: any) => {
        console.log('coins', data);
        data.data.balance = Number('0x' + data.data.balance);
        return data;
      }),
      catchError(err => {
        console.log('Coins Not Found', err);
        return err;
      })
    );
  }

  /**
   * Method to initiate a HTTP request to get ERC-721 tokens of logged in user.
   */
  getNFTBalance() {
    const url = config.zkp.root + 'nft/details';
    return this.http.get(url).pipe(
      tap(data => {}),
      catchError(err => {
        console.log('Coins Not Found', err);
        return err;
      })
    );
  }

  /**
   * Method to initiate a HTTP request to get ERC-721 token commitment count of logged in user.
   */
  getCount() {
    const url = config.database.root + 'count';
    return this.http.get(url).pipe(
      tap(data => {}),
      catchError(err => {
        console.log('Count api Not Found', err);
        return err;
      })
    );
  }

  /**
   * Method to initiate a HTTP request to get ERC-721 token count of logged in user.
   */
  getBalance(address) {
    const url = this.root + 'account/' + address;
    return this.http.get(url).pipe(
      tap(datra => console.log(''))
    );
  }

  /**
   * Method to initiate a HTTP request to create new account
   *
   * @param account
   */
  createAccount(account) {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    };
    const url = this.root + 'createAccount';
    const body = {
      name: account.accountName,
      email: account.email,
      password: account.passphrase
    };
    return this.http.post(url, body, httpOptions).pipe(tap(data => console.log('Account Created')));
  }

  /**
   * Method to initiate a HTTP request to login the account
   *
   * @param account {Object} Account details
   *
   */
  login(account) {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    };
    const url = this.root + 'login';
    const body = {
      name: account.accountName,
      password: account.passphrase,
    };
    return this.http.post(url, body, httpOptions).pipe(
      tap(data => {
        console.log('Logged In');
      })
    );
  }

  /**
   * Method to initiate a HTTP request to Add shield contract address
   */
  addContractAddress(account) {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    };
    const url = config.apiGateway.root + 'user/contractAddress';
    const body = {
      contractAddress: account.contractAdd,
      contractName: account.contractName
    };
    return this.http.post(url, body, httpOptions).pipe(tap(data => console.log('added ERC-20 Account')));
  }

  /**
   * Method to initiate a HTTP request to update shield contract address
   */
  updateContractAccounts(account) {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    };
    const url = config.apiGateway.root + 'user/contractAddress';
    const body = {};
    if (account.coinShield) {
      body['coinShield'] = {
        contractAddress: account.contractAdd,
        contractName: account.contractName,
        isSelected: account.selection
      };

    } else if (account.tokenShield) {
      body['tokenShield'] = {
        contractAddress: account.contractAdd,
        contractName: account.contractName,
        isSelected: account.selection
      };
    }
    return this.http.put(url, body, httpOptions).pipe(tap(data => console.log('update ERC-20 Account')));
  }

  /**
   * Method to initiate a HTTP request to delete shield contract address
   */
  deleteContractAddress(account) {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    };
    let url = config.apiGateway.root + 'user/contractAddress?';
    if (account.coinShield) {
      url = url + 'coin_shield=' + account.contractAdd;
    } else if (account.tokenShield) {
      url = url + 'token_shield=' + account.contractAdd;
    }
    return this.http.delete(url, httpOptions).pipe(tap(data => console.log('update ERC-20 Account')));
  }

  /**
   * Method to initiate a HTTP request to get the default shield contract address
   */
  getDefaultShieldAddress() {
    const url = config.apiGateway.root + 'shield/address';
    return this.http.get(url).pipe(
      tap(data => console.log(''))
    );
  }


  /**
   * Method to initiate a HTTP request to get the ERC-721 contract address
   */
  getNFTAddress() {
    const url = config.zkp.root  + 'nft/address';
    return this.http.get(url).pipe(
      tap(data => console.log(''))
    );
  }

  /**
   * Method to initiate a HTTP request to get the ERC-20 contract address
   */
  getFTAddress() {
    const url = config.zkp.root + 'ft/address';
    return this.http.get(url).pipe(
      tap(data => console.log(''))
    );
  }


  /**
   * Error handler for http request.
   *
   * @param operation
   * @param result
   */
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(error); // log to console instead
      console.log(`${operation} failed: ${error.message}`);
      return error;
    };
  }

}
