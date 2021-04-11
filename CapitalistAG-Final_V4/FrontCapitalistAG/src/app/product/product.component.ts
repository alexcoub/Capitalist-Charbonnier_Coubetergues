import { EventEmitter, Input } from '@angular/core';
import { Output } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { Product } from '../world';
import { Pallier } from '../world';
import { RestserviceService } from '../restservice.service';
import {MatProgressBarModule} from '@angular/material/progress-bar'


@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss']
})

export class ProductComponent implements OnInit {
  server = "http://localhost:8080/";
  progressbarvalue: number = 0;
  lastupdate: number = 0;
  product: Product = new Product;
  isRun: boolean = true;
  progressbar: any;

  // évènements de sortie
  @Output() 
  notifyProduction: EventEmitter<Product> = new EventEmitter<Product>();
  
  @Output() 
  notifyBuying: EventEmitter<number> = new EventEmitter<number>();
  
  @Output() 
  notifyUnlocked: EventEmitter<Pallier> = new EventEmitter<Pallier>();

  constructor(private service: RestserviceService) { }

  @Input()
  set prod(value: Product) {
    this.product = value;
    if (this.product && this.product.timeleft > 0) {
      this.lastupdate = Date.now();
      let progress = (this.product.vitesse - this.product.timeleft) / this.product.vitesse;
      this.progressbar.set(progress);
      this.progressbar.animate(1, { duration : this.product.timeleft});
    }
  }

  // Argent possédé par le joueur
  _money: number = 0;
  @Input()
  set money(value: number) {
    this._money = value;
    console.log(this._money)
  }

  // Stocke l’état actuel du commutateur d’achat général
  _qtmulti: string = "";
  @Input()
  set qtmulti(value: string) {
    if (value == 'Max') {
      this._qtmulti = 'X' + this.calcMaxCanBuy();
    } else {
      this._qtmulti = value;
    }
  }

  startFabrication() {
    if (this.product.quantite >=1 && !this.isRun) {
      this.product.timeleft = this.product.vitesse;
      this.service.putProduit(this.product);
      this.lastupdate = Date.now();
      this.progressbar.animate(1, { duration: this.product.vitesse });
      this.isRun = true;
    }
    console.log("OK");
    // Erreur de fabrication !!! 
  }


  calcScore() {
    if (this.isRun) {
      // Si Un produit n'est pas en production (son timeleft=0) et que le manager est en fonctionnement, alors la production du produit se lance 
      if (this.product.timeleft === 0 && this.product.managerUnlocked) {
        this.startFabrication();
      }
      if (this.product.timeleft != 0) {
        this.product.timeleft = this.product.vitesse - (Date.now() - this.lastupdate);

        // Si le temps de production est écoulé
        if (this.product.timeleft <= 0) {
          this.product.timeleft = 0;
          this.progressbarvalue = 0;
          // on notifie le parent de la bonne production du produit
          this.notifyProduction.emit(this.product);
        }
        // Tant que le produit n'est pas en cours de production, on ne fait rien
        else if (this.product.timeleft > 0) {
          // Permet le calcul de la barre de progression
          this.progressbarvalue = ((this.product.vitesse - this.product.timeleft) / this.product.vitesse) * 100
        }
        // on previent le composant parent que ce produit a généré son revenu
        this.notifyProduction.emit(this.product);
      }
    }
  }
  
  // Calcul la quantite supplémentaire maximale achetable par le joueur de ce produit 
  calcMaxCanBuy() {
    let quantiteMax = 0;
    let totalCost = 0;
    let costForOne = this.product.cout * (this.product.croissance ** this.product.quantite);
   // Doit être appelé non seulement quand la valeur du commutateur général change,
   // mais aussi quand l’argent possédé par le joueur évolue
    while ((totalCost + costForOne) <= this._money) {
      totalCost += costForOne;
      quantiteMax++;
      costForOne = costForOne * this.product.croissance;
    }
    return quantiteMax;
  }

  calcCost(qty: number) {
    let totalCost = 0;
    let costForOne = this.product.cout * (this.product.croissance ** this.product.quantite);
    for (let i = 0; i < qty; i++) {
      totalCost += costForOne;
      costForOne = costForOne * this.product.croissance;
    }
    return totalCost;
  }

  onBuy() {
    console.log("onBuy"+this.product.name);
    let qty: number;
    if (this._qtmulti === 'X1') {
      qty = 1;
    } else if (this._qtmulti === 'X10') {
      qty = 10;
    } else if (this._qtmulti == 'X100') {
      qty = 100
    } else {
      qty = this.calcMaxCanBuy();
    }
    var coutAchat = this.calcCost(qty);
    console.log(coutAchat);
    if (this._money >= coutAchat) {
      this.notifyBuying.emit(coutAchat);
      this.product.quantite = this.product.quantite + qty;
    }
    this.productsUnlocks();
    this.service.putProduit(this.product);
  }

  // Permet d’exécuter du code toutes les ms
  ngOnInit(): void {
    setInterval(() => { this.calcScore(); }, 100);
    this.progressbarvalue = 0;
    this.productsUnlocks();
  }

  quantiteAchetable() {
    let qty = 0;
    if (this._qtmulti === "X1") { qty = 1 }
    else if (this._qtmulti === "X10") { qty = 10 }
    else if (this._qtmulti === "X100") { qty = 100 }
    else if (this._qtmulti === "Max") { qty = this.calcMaxCanBuy() }
    return qty;
  }

  calcUpgrade(pallier: Pallier) {
    switch (pallier.typeratio) {
      case 'VITESSE':
        this.product.vitesse = this.product.vitesse / pallier.ratio;
        break;
      case 'GAIN':
        this.product.revenu = this.product.revenu * pallier.ratio;
        break;
    }
  }

  productsUnlocks() {
    this.product.palliers.pallier.forEach(palier => {
      if (!palier.unlocked && this.product.quantite >= palier.seuil) {
        palier.unlocked = true;
        this.calcUpgrade(palier);
        this.notifyUnlocked.emit(palier);
      }
    });
  }

}
