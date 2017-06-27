import { Component, Input, OnInit, ViewChild } from "@angular/core";

import { GlobalsService }   from "../../shared/index";
import { DynamicDialogComponent }  from "./dynamic-dialog.component";
import { Action1ModalComponent, EchoModalComponent} from "../../views/modals/index";
import { EditChassisComponent } from "../../views/modals/edit-chassis.component"; // [removable-chassis-line]

/**
 * Generic dialog used to wrap modal dialog sub-components in dev mode.
 * Each sub-component class must be declared here and define a handleSubmit method.
 */
@Component({
   selector: "dialog-box",
   styleUrls: ["./dialog-box.component.scss"],
   templateUrl: "./dialog-box.component.html"
})
export class DialogBoxComponent implements OnInit {
   componentData = null;
   size: string;  // Clarity modals size: 'sm', 'lg', 'xl', or medium by default
   title: string;
   showCancelButton: boolean;
   @Input() modalOpened = false;
   @ViewChild(DynamicDialogComponent) dialog: DynamicDialogComponent;

   constructor(public gs: GlobalsService) {
   }

   ngOnInit(): void {
   }

   // Injection of Action1ModalComponent
   openActionDialog(context: any, title: string): void {
      this.componentData = {
         component: Action1ModalComponent,
         inputs: {
            context: context
         }
      };
      this.title = title;
      this.showCancelButton = true;
      this.modalOpened = true;
   }

   // Injection of EchoModalComponent
   openEchoModal(context: any, title: string): void {
      this.componentData = {
         component: EchoModalComponent,
         inputs: {
            context: context
         }
      };
      this.title = title;
      this.size = "sm";
      this.showCancelButton = false;
      this.modalOpened = true;
   }

   // [removable-chassis-code]
   // Injection of EditChassisComponent
   openEditChassis(context: any, title: string): void {
      this.componentData = {
         component: EditChassisComponent,
         inputs: {
            context: context
         }
      };
      this.title = title;
      this.showCancelButton = true;
      this.modalOpened = true;
   }
   // [end-chassis-code]

   onSubmit(): void {
      this.modalOpened = false;

      // Call the generic handleSubmit method on the underlying component
      this.dialog.currentComponent._component.handleSubmit();
   }

   onCancel(): void {
      this.modalOpened = false;
   }

}
