// External imports
import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { Component, NO_ERRORS_SCHEMA }    from "@angular/core";
import { By }           from "@angular/platform-browser";
import { ActivatedRoute } from "@angular/router";
import { ClarityModule } from "clarity-angular";

// Internal imports
import { Chassis, ChassisService }  from "../../services/chassis/index";
import { FakeChassisService, fakeChassisData }   from "../../services/testing/fake-chassis.service";
import { ChassisSummaryComponent } from "./chassis-summary.component";
import { GlobalsService, RefreshService } from "../../shared/index";
import { ActivatedRouteStub } from "../../testing/index";


// ---------- Testing stubs ------------

const navServiceStub: {
};

const utilsServiceStub = {
   translate(messages: { [key: string]: any }): any {
      return Object.keys(messages);
   }
};

@Component({selector: "app-header", template: ""})
class AppHeaderStubComponent {}

@Component({selector: "sidenav", template: ""})
class SidenavStubComponent {}

// ----------- Testing vars ------------

let chassis0: Chassis;
let fixture: ComponentFixture<ChassisSummaryComponent>;
let comp: ChassisSummaryComponent;
let page: Page;

let activatedRoute: ActivatedRouteStub;

// -------------- Tests ----------------

xdescribe("ChassisSummaryComponent", () => {

   beforeEach(() => {
      chassis0 = fakeChassisData[0];
      // Make summary page use first chassis
      activatedRoute = new ActivatedRouteStub();
      activatedRoute.testParams = { id: chassis0.id };
   });

   // async beforeEach
   beforeEach(async(() => {
      TestBed.configureTestingModule({
         imports: [
            ClarityModule.forRoot()
         ],
         declarations: [
            ChassisSummaryComponent, AppHeaderStubComponent, SidenavStubComponent
         ],
         providers:    [ GlobalsService, RefreshService,
            { provide: ActivatedRoute, useValue: activatedRoute },
            { provide: ChassisService, useClass: FakeChassisService }
         ],
         schemas: [ NO_ERRORS_SCHEMA ]
      }).compileComponents()
      .then(createComponent);
   }));

   // synchronous beforeEach
   beforeEach(async(() => {
      fixture.detectChanges();
   }));

   it("should instantiate SummaryComponent", () => {
      expect(fixture.componentInstance instanceof ChassisSummaryComponent).toBe(true,
         "should create SummaryComponent");
   });

   it("should display 3 cards", () => {
      expect(page.cards.length).toEqual(3);
   });

   it("should display chassis name on first card", () => {
      expect(page.cardHeaders[0].textContent).toContain(chassis0.name, "chassis.name");
   });
});

// -------------- Helpers ----------------

function createComponent() {
   fixture = TestBed.createComponent(ChassisSummaryComponent);
   comp    = fixture.componentInstance;

   // change detection triggers ngOnInit which loads the chassis data
   fixture.detectChanges();

   // whenStable ensures data is read, then we can build the page
   return fixture.whenStable().then(() => {
      fixture.detectChanges();
      page = new Page();
   });
}

class Page {
   cards: HTMLDivElement[];
   cardHeaders: HTMLDivElement[];

   constructor() {
      this.cards =  fixture.debugElement.queryAll(By.css("div.card"))
         .map(de => de.nativeElement);
      this.cardHeaders =  fixture.debugElement.queryAll(By.css("div.card-header"))
         .map(de => de.nativeElement);
   };
}
