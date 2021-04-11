import { Component, QueryList, ViewChildren } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RestserviceService } from './restservice.service';
import { World, Product, Pallier } from './world';
import { ProductComponent } from './product/product.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent {
  @ViewChildren(ProductComponent)
  public productComponent!: QueryList<ProductComponent>;
  server = "http://localhost:8080/";
  title = 'CapitalistAG';
  world: World = new World();
  username: string = "";
  qtmulti: string = "X1";
  managerDispo: boolean = false;
  upgradeDispo: boolean = false;
  angelDispo: boolean = false;
  interval: any;

  constructor(private service: RestserviceService, private snackBar: MatSnackBar) {
    this.server = service.getServer();
    this.username = localStorage.getItem("username") || 'Friends' + ' ' + Math.floor(Math.random() * 10000);
    this.service.user = this.username;
    service.getWorld().then(
      world => {
        this.world = world;
      }
    );
  }

  ngOnInit(): void {
    this.interval = setInterval(() => {
      this.service.saveWorld(this.world);
      this.managerDisponibility();
      this.upgradeDisponibility();
    }, 1000)
  }

  //Augmente l’argent (et le score) du joueur en fonction de ce que rapporte la production du produit
  onProductionDone(p: Product) {
    this.world.money = this.world.money + p.revenu * p.quantite * (this.world.angelbonus ** this.world.activeangels);
    this.world.score = this.world.score + p.revenu * p.quantite * (this.world.angelbonus ** this.world.activeangels);
    this.managerDisponibility();
    this.upgradeDisponibility();
    this.service.putProduit(p);
  }

  // Acheter une certaine quantité de produit
  commu() {
    switch (this.qtmulti) {
      case 'X1':
        this.qtmulti = 'X10';
        break;

      case 'X10':
        this.qtmulti = 'X100';
        break;

      case 'X100':
        this.qtmulti = 'Max';
        break;

      case 'Max': this.qtmulti = 'X1';
        break;

    }
  }

  async onBuyDone(n: number) {
    if (this.world.money >= n) {
      this.world.money = this.world.money - n;
    } else {
      this.world.money = this.world.money;
    }
    this.managerDisponibility();
    this.upgradeDisponibility();
  }

  // Afficher un message éphémère pour l’utilisateur
  popMessage(message: string): void {
    this.snackBar.open(message, "", { duration: 2000 })
  }

  onUsernameChanged(): void {
    localStorage.setItem("username", this.username);
    this.service.setUser(this.username);
    this.service.getWorld().then(
      world => {
        this.world = world;
        console.log("world:", world);
      })
  }

  managerDisponibility(): void {
    this.managerDispo = false;
    this.world.managers.pallier.forEach(val => {
      if (!this.managerDispo) {
        if (this.world.money > val.seuil && !val.unlocked) {
          this.managerDispo = true;
        }
      }
    })
  }

  upgradeDisponibility() {
    this.upgradeDispo = false;
    this.world.upgrades.pallier.map(upgrade => {
      if (!this.upgradeDispo) {
        if (!upgrade.unlocked && this.world.money > upgrade.seuil) {
          this.upgradeDispo = true
        }
      }
    })
  }

  achatManager(m: Pallier) {
    if (this.world.money >= m.seuil) {
      this.world.money = this.world.money - m.seuil;
      var index = this.world.managers.pallier.indexOf(m);
      this.world.managers.pallier[index].unlocked = true;

      this.world.products.product.forEach(element => {
        if (m.idcible == element.id) {
          var index = this.world.products.product.indexOf(element);
          this.world.products.product[index].managerUnlocked = true;
        }
      });
      this.managerDisponibility();
      this.popMessage(m.name + " est désormais votre esclave");
    }
  }

  achatUpgrade(pa: Pallier) {
    if (this.world.money >= pa.seuil) {
      this.world.money = this.world.money - pa.seuil;
      this.world.upgrades.pallier[this.world.upgrades.pallier.indexOf(pa)].unlocked = true;
      if (pa.idcible == 0) {
        this.productComponent.forEach(prod => prod.calcUpgrade(pa));
      }
      else {
        this.productComponent.forEach(prod => {
          if (pa.idcible == prod.product.id) {
            prod.calcUpgrade(pa);
          }
        })
      }
      this.upgradeDisponibility();
      this.service.putUpgrade(pa);
      this.popMessage(pa.name + " Upagrade !");
    }
  }

  resetWorld() {
    this.service.deleteWorld().then(() => {
      this.service.getWorld().then(world => {
        this.world = world;
      })
    });
  }
}




