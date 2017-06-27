import { UiPluginPage } from './app.po';
import { browser, element, by } from "protractor";

describe('cli-project App', () => {
   let page: UiPluginPage;
   const expectedTitle = '__pluginName__ (dev mode)';

   beforeEach(() => {
      page = new UiPluginPage();
   });

   it('should have the title: ' + expectedTitle, () => {
      page.navigateTo();
      expect<any>(page.getHeaderTitle()).toEqual(expectedTitle);
   });

   it('should start with the home page tag', () => {
      page.navigateTo();
      expect<any>(page.getTabFirstParagraph()).toEqual('Add your main view content here.');
   });

   it('should open a popup in the EchoService tab', () => {
      page.navigateTo();
      page.getButtonByText("Echo Service").click();
      element(by.id('helloBtn1')).click();
      expect<any>(page.getOpenModalElement()).toBeTruthy();
      expect<any>(page.getOpenModalTitle()).toBe("Echo Response");
   });

   it('should navigate to the Settings page after button click', () => {
      page.navigateTo();
      page.getButtonByText("Home").click();
      page.getFirstBtnLink().click();
      browser.waitForAngular();
      expect<any>(page.getContentFirstParagraph()).toEqual('Add your settings content here.');
   });
});
