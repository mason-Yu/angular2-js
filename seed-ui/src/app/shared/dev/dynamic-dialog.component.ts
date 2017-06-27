import { Component, Input, ViewContainerRef, ViewChild,
         ReflectiveInjector, ComponentFactoryResolver} from '@angular/core';
import { Action1ModalComponent, EchoModalComponent } from '../../views/modals/index';
import { EditChassisComponent } from "../../views/modals/edit-chassis.component"; // [removable-chassis-line]

/**
 * Dynamic injection of components, used by dialog-box
 * Based on http://blog.rangle.io/dynamically-creating-components-with-angular-2/
 */
@Component({
   selector: 'dynamic-component',
   // Add reference to the components here in order to dynamically create them
   entryComponents: [
         Action1ModalComponent,
         EditChassisComponent,  // [removable-chassis-line]
         EchoModalComponent],
   template: `
    <div #dynamicComponentContainer></div>
  `,
})
export class DynamicDialogComponent {
   currentComponent = null;

   @ViewChild('dynamicComponentContainer', { read: ViewContainerRef }) dynamicComponentContainer: ViewContainerRef;

   constructor(private resolver: ComponentFactoryResolver) {
   }

   // component: Class for the component you want to create
   // inputs: An object with key/value pairs mapped to input name/input value
   @Input() set componentData(data: { component: any, inputs: any }) {
      if (!data) {
         return;
      }

      // Inputs need to be in the following format to be resolved properly
      const inputProviders = Object.keys(data.inputs).map((inputName) => {
            return {
               provide: inputName,
               useValue: data.inputs[inputName]
            };
      });
      const resolvedInputs = ReflectiveInjector.resolve(inputProviders);

      // Create an injector out of the data we want to pass down and this components injector
      const injector = ReflectiveInjector.fromResolvedProviders(resolvedInputs,
            this.dynamicComponentContainer.parentInjector);

      // Create a factory out of the component we want to create
      const factory = this.resolver.resolveComponentFactory(data.component);

      // Create the component using the factory and the injector
      const component = factory.create(injector);

      // Insert the component into the dom container
      this.dynamicComponentContainer.insert(component.hostView);

      // Destroy any old component if necessary
      if (this.currentComponent) {
         this.currentComponent.destroy();
      }
      this.currentComponent = component;
   }
}
