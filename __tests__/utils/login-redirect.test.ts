import { describe, it, expect } from "vitest";
import { getLoginUrl, isValidCallbackUrl } from "@/lib/utils/login-redirect";

describe("getLoginUrl", () => {
  it("returns base login URL without returnTo", () => {
    expect(getLoginUrl()).toBe("/anmelden");
  });

  it("returns base login URL with undefined returnTo", () => {
    expect(getLoginUrl(undefined)).toBe("/anmelden");
  });

  it("includes callbackUrl for valid returnTo path", () => {
    expect(getLoginUrl("/materialien")).toBe("/anmelden?callbackUrl=%2Fmaterialien");
  });

  it("encodes complex returnTo paths", () => {
    const url = getLoginUrl("/konto/settings?tab=profile");
    expect(url).toContain("callbackUrl=");
    expect(url).toContain("%2Fkonto%2Fsettings");
  });

  it("returns base URL for invalid returnTo", () => {
    expect(getLoginUrl("https://evil.com")).toBe("/anmelden");
    expect(getLoginUrl("//evil.com")).toBe("/anmelden");
  });

  it("returns base URL for auth page returnTo", () => {
    expect(getLoginUrl("/anmelden")).toBe("/anmelden");
    expect(getLoginUrl("/registrieren")).toBe("/anmelden");
  });
});

describe("isValidCallbackUrl", () => {
  it("returns true for valid relative paths", () => {
    expect(isValidCallbackUrl("/materialien")).toBe(true);
    expect(isValidCallbackUrl("/konto/uploads")).toBe(true);
    expect(isValidCallbackUrl("/a")).toBe(true);
  });

  it("returns false for empty string", () => {
    expect(isValidCallbackUrl("")).toBe(false);
  });

  it("returns false for non-string values", () => {
     
    expect(isValidCallbackUrl(null as any)).toBe(false);
     
    expect(isValidCallbackUrl(undefined as any)).toBe(false);
     
    expect(isValidCallbackUrl(123 as any)).toBe(false);
  });

  it("returns false for absolute URLs", () => {
    expect(isValidCallbackUrl("https://evil.com")).toBe(false);
    expect(isValidCallbackUrl("http://localhost")).toBe(false);
  });

  it("returns false for protocol-relative URLs", () => {
    expect(isValidCallbackUrl("//evil.com")).toBe(false);
  });

  it("returns false for backslash URLs (redirect bypass)", () => {
    expect(isValidCallbackUrl("/test\\evil")).toBe(false);
    expect(isValidCallbackUrl("\\evil")).toBe(false);
  });

  it("returns false for auth pages", () => {
    expect(isValidCallbackUrl("/anmelden")).toBe(false);
    expect(isValidCallbackUrl("/anmelden?foo=bar")).toBe(false);
    expect(isValidCallbackUrl("/registrieren")).toBe(false);
    expect(isValidCallbackUrl("/registrieren/success")).toBe(false);
  });
});
