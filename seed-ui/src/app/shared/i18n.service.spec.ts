
import { I18nService } from "./i18n.service";

let i18nService: I18nService;

// Simple service unit tests without assistance from Angular testing utilities
// Note: we don't really need to test initLocale() which is only for dev mode

describe("I18Service tests", () => {
   beforeEach(() => {
      i18nService = new I18nService(null, null, null);
   });
   it ("interpolates messages correctly", () => {
      const msg1 = "message1 without params";
      const msg2 = "message2 with {0}";
      const msg4 = "message4 with {0} {1}";
      const result1 = i18nService.interpolate(msg1, null);
      const result2 = i18nService.interpolate(msg2, "param");
      const result3 = i18nService.interpolate(msg2, ["param"]);
      const result4 = i18nService.interpolate(msg4, ["param"]);


      expect(result1).toBe(msg1);
      expect(result2).toBe("message2 with param");
      expect(result3).toBe("message2 with param");
      expect(result4).toBe("message4 with param {1}");
   });
});
