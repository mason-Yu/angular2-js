import { Component, Input, OnInit, OnDestroy, ViewChild, ChangeDetectorRef } from "@angular/core";
import { ActivatedRoute, Params } from "@angular/router";
import { Subscription } from "rxjs/Subscription";
import { NavService } from "../../services/nav.service";
import { GlobalsService, RefreshService,
AppAlertService, I18nService }   from "../../shared/index";
@Component({
   styleUrls: ["./user-login.component.scss"],
   templateUrl: "./user-login.component.html",
})
export class userLoginComponent implements OnInit, OnDestroy {

   private subscription: Subscription;

   constructor(public gs: GlobalsService) {
     
   }


   
   ngOnInit(): void {
      
   }

   ngOnDestroy(): void {
      this.subscription.unsubscribe();
   }

  
}
