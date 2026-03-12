import { describe, it, expect } from "vitest";
import { transformUrl } from "../../src/url-transform.js";

describe("transformUrl", () => {
  describe("*.my.salesforce.com", () => {
    it("transforms a standard Account record URL", () => {
      expect(
        transformUrl(
          "https://acme.my.salesforce.com/lightning/r/Account/001XXXXXXXXXXXX/view"
        )
      ).toBe("https://acme.my.salesforce.com/001XXXXXXXXXXXX");
    });

    it("transforms a Contact record URL", () => {
      expect(
        transformUrl(
          "https://acme.my.salesforce.com/lightning/r/Contact/003AABBCCDDEE12/view"
        )
      ).toBe("https://acme.my.salesforce.com/003AABBCCDDEE12");
    });

    it("transforms an 18-character record ID", () => {
      expect(
        transformUrl(
          "https://acme.my.salesforce.com/lightning/r/Account/001XXXXXXXXXXXX123/view"
        )
      ).toBe("https://acme.my.salesforce.com/001XXXXXXXXXXXX123");
    });

    it("transforms a sandbox URL", () => {
      expect(
        transformUrl(
          "https://acme--stg.sandbox.my.salesforce.com/lightning/r/Contact/003AABBCCDDEE12/view"
        )
      ).toBe("https://acme--stg.sandbox.my.salesforce.com/003AABBCCDDEE12");
    });

    it("handles custom object names with underscores", () => {
      expect(
        transformUrl(
          "https://acme.my.salesforce.com/lightning/r/Custom_Object__c/a00AABBCCDDEE12/view"
        )
      ).toBe("https://acme.my.salesforce.com/a00AABBCCDDEE12");
    });
  });

  describe("*.lightning.force.com", () => {
    it("transforms and rewrites host to my.salesforce.com", () => {
      expect(
        transformUrl(
          "https://acme.lightning.force.com/lightning/r/Account/001XXXXXXXXXXXX/view"
        )
      ).toBe("https://acme.my.salesforce.com/001XXXXXXXXXXXX");
    });

    it("transforms with 18-character ID", () => {
      expect(
        transformUrl(
          "https://acme.lightning.force.com/lightning/r/Lead/00Q123456789012345/view"
        )
      ).toBe("https://acme.my.salesforce.com/00Q123456789012345");
    });
  });

  describe("non-matching URLs", () => {
    it("returns null for non-Salesforce URLs", () => {
      expect(transformUrl("https://google.com/some/path")).toBeNull();
    });

    it("returns null for Lightning home page", () => {
      expect(
        transformUrl("https://acme.my.salesforce.com/lightning/page/home")
      ).toBeNull();
    });

    it("returns null for Lightning list views", () => {
      expect(
        transformUrl(
          "https://acme.my.salesforce.com/lightning/o/Account/list"
        )
      ).toBeNull();
    });

    it("returns null for non-record Lightning paths", () => {
      expect(
        transformUrl(
          "https://acme.my.salesforce.com/lightning/setup/ObjectManager/home"
        )
      ).toBeNull();
    });

    it("returns null for invalid URLs", () => {
      expect(transformUrl("not a url")).toBeNull();
    });

    it("returns null for record ID that is too short", () => {
      expect(
        transformUrl(
          "https://acme.my.salesforce.com/lightning/r/Account/001SHORT/view"
        )
      ).toBeNull();
    });

    it("returns null for record ID that is too long", () => {
      expect(
        transformUrl(
          "https://acme.my.salesforce.com/lightning/r/Account/001TOOLONGRECORDIDVALUE/view"
        )
      ).toBeNull();
    });

    it("returns null when path does not end with /view", () => {
      expect(
        transformUrl(
          "https://acme.my.salesforce.com/lightning/r/Account/001XXXXXXXXXXXX/edit"
        )
      ).toBeNull();
    });

    it("returns null for unrecognized Salesforce host", () => {
      expect(
        transformUrl(
          "https://acme.salesforce.com/lightning/r/Account/001XXXXXXXXXXXX/view"
        )
      ).toBeNull();
    });
  });
});
