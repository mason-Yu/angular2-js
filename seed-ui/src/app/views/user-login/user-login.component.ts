import { Component, Input, OnInit, OnDestroy, ViewChild, ChangeDetectorRef } from "@angular/core";
import { ActivatedRoute, Params } from "@angular/router";
import { Subscription } from "rxjs/Subscription";
import { NavService } from "../../services/nav.service";
import { USerLoginService } from "../../services/user-login/user-login.service";
import { GlobalsService, RefreshService,
AppAlertService, I18nService }   from "../../shared/index";
@Component({
   styleUrls: ["./user-login.component.scss"],
   templateUrl: "./user-login.component.html",
})
export class userLoginComponent implements OnInit {

   private subscription: Subscription;
   errorMsg = "";
   formData = {
        userName: "",
        password: ""
   }
   constructor(public gs: GlobalsService,
               private userLogin: USerLoginService,
               private navService: NavService) {
     
   }


   
   ngOnInit(): void {
      
   }

   login(){
       if (this.checkCredentials()) {
             this.userLogin.login(this.formData.userName, this.formData.password)
                .subscribe(
                    response => {
                        this.navService.showView("mainView");
                    }
                    ,error => {
                        this.errorMsg = error;
                    }
                )
       }
   }

   checkCredentials(): boolean {
        if (this.formData.userName === '') {
            this.errorMsg = "please input userName";
            return false;
        }
        if (this.formData.password === '') {
            this.errorMsg = "please input passowrd";
            return false;
        } 
        this.errorMsg = "";
        return true;
   }
  
}
