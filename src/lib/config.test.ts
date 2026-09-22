import { resolveApiBaseUrl } from "./config";

describe("resolveApiBaseUrl", () => {
  it("uses same-origin API routing in production", () => {
    expect(
      resolveApiBaseUrl(
        "production",
        "https://portfolio.example",
        "http://localhost:3002",
      ),
    ).toBe("https://portfolio.example");
  });

  it("keeps the configured API URL during development", () => {
    expect(
      resolveApiBaseUrl(
        "development",
        "http://localhost:3000",
        "http://localhost:3002",
      ),
    ).toBe("http://localhost:3002");
  });

  it("uses the current LAN hostname during development when configured API is local", () => {
    expect(
      resolveApiBaseUrl(
        "development",
        "http://192.168.1.25:3000",
        "http://127.0.0.1:3002",
      ),
    ).toBe("http://192.168.1.25:3002");
  });

  it("keeps an explicitly remote development API URL", () => {
    expect(
      resolveApiBaseUrl(
        "development",
        "http://192.168.1.25:3000",
        "https://api.example.com",
      ),
    ).toBe("https://api.example.com");
  });
});
