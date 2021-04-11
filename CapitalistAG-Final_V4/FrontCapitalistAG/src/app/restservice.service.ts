import { Injectable } from '@angular/core';
import{ HttpClient, HttpHeaders} from '@angular/common/http';
import{ World, Pallier, Product} from './world';

import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})

export class RestserviceService {

server= "http://localhost:8080/";
user= localStorage.getItem("username")|| 'Friends' + Math.floor(Math.random() * 10000);;

// injections du service http via le constructeur
constructor(private http: HttpClient) { }

getUser(): string{
  return this.user;
}
setUser(user: string): void{
  this.user = user;
}

getServer(): string{
  return this.server;
}
setServer(a:string){
  this.server=a;
}

private handleError(error: any): Promise <any> 
{
  console.error('An error occurred', error);
   return Promise.reject(error.message|| error);
  }
  // Réalise l appel GET /world au service web
  getWorld(): Promise<World> {
    return this.http.get(this.server + "adventureisis/generic/world", {
      headers: this.setHeaders(this.user)
    }).toPromise().catch(this.handleError);
  };


private setHeaders(user: string): HttpHeaders {
    var headers = new HttpHeaders({ 'X-User': user});
    return headers;
  };

  public saveWorld (world : World) {
    this.http
    .put(this.server + "adventureisis/generic/world", world, {
      headers: this.setHeaders(this.user)
    })
    .subscribe(
      () => {
        console.log('Save world');
      },
      (error)=>{
        console.log(error);
      }
      );
    
  }

  putManager(manager: Pallier): Promise<Pallier> {
    return this.http.put(this.server + "adventureisis/generic/manager", manager, {
      headers: this.setHeaders(this.user)
    }).toPromise().catch(this.handleError);
  };

  putProduit(product: Product): Promise<Response> {
    return this.http.put(this.server + "adventureisis/generic/product", product, {
      headers: this.setHeaders(this.getUser())
    })
      .toPromise()
    .then(response => response)
    .catch(this.handleError);
  };

  deleteWorld(): Promise<World> {
    console.log("World"+this.user)
    return this.http.delete(this.server + "adventureisis/generic/world", {
      headers: this.setHeaders(this.user)
    })
    .toPromise().then(response => response)
    .catch(this.handleError);
  }

  putUpgrade(upgrade: Pallier): Promise<Response> {
    return this.http.put(this.server + "adventureisis/generic/product", upgrade, {
      headers: this.setHeaders(this.user)
    })
      .toPromise().then(response => response)
      .catch(this.handleError);
  };


}
