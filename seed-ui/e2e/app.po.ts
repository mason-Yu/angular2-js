import { browser, element, by } from 'protractor';

export class UiPluginPage {
   navigateTo() {
      return browser.get('/');
   }

   getHeaderTitle() {
      return element(by.css('my-app header .branding')).getText();
   }

   getTabFirstParagraph() {
      return element.all(by.css('clr-tab-content p')).first().getText();
   }

   getContentFirstParagraph() {
      return element.all(by.css('.content-area p')).first().getText();
   }

   getButtonByText(text) {
      return element(by.buttonText(text));
   }

   getLinkByText(text) {
      return element(by.linkText(text));
   }

   getOpenModalElement() {
      return element(by.css('.modal-dialog'));
   }

   getOpenModalTitle() {
      return element(by.css('.modal-dialog .modal-title')).getText();
   }

   getFirstBtnLink() {
      return element.all(by.css('clr-tab-content .btn-link')).first();
   }

   doubleClickFirstRow() {
      // let row1 = element.all(by.css('.content-area .row')).get(1).getWebElement().getText();
      // console.log("*** " + row1);
      // element.all(by.css('.content-area .row')).get(1).doubleClick();
      element.all(by.css('.content-area .row')).then(function(items) {
         // console.log("*** " + items[1].getWebElement().getText());
         browser.actions().doubleClick(items[1]).perform();
      });
   }
}
