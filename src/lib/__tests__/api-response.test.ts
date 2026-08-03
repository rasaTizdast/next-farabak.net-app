import { describe, it, expect } from "vitest";
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  notFoundResponse,
  serverErrorResponse,
} from "@/lib/api-response";

describe("src/lib/api-response.ts", () => {
  describe("successResponse", () => {
    it("returns 200 with success: true and data", async () => {
      const response = successResponse({ id: 1, name: "Test" });
      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json).toEqual({ success: true, data: { id: 1, name: "Test" } });
    });

    it("uses custom status when provided", async () => {
      const response = successResponse("created", 201);
      expect(response.status).toBe(201);
      const json = await response.json();
      expect(json).toEqual({ success: true, data: "created" });
    });
  });

  describe("errorResponse", () => {
    it("returns 400 with success: false and error message", async () => {
      const response = errorResponse("Validation failed");
      expect(response.status).toBe(400);
      const json = await response.json();
      expect(json).toEqual({ success: false, error: "Validation failed" });
    });

    it("uses custom status when provided", async () => {
      const response = errorResponse("Not allowed", 403);
      expect(response.status).toBe(403);
      const json = await response.json();
      expect(json).toEqual({ success: false, error: "Not allowed" });
    });
  });

  describe("unauthorizedResponse", () => {
    it("returns 401 with default message", async () => {
      const response = unauthorizedResponse();
      expect(response.status).toBe(401);
      const json = await response.json();
      expect(json).toEqual({ success: false, error: "Unauthorized" });
    });

    it("uses custom message when provided", async () => {
      const response = unauthorizedResponse("Token expired");
      expect(response.status).toBe(401);
      const json = await response.json();
      expect(json).toEqual({ success: false, error: "Token expired" });
    });
  });

  describe("notFoundResponse", () => {
    it("returns 404 with default message", async () => {
      const response = notFoundResponse();
      expect(response.status).toBe(404);
      const json = await response.json();
      expect(json).toEqual({ success: false, error: "Not found" });
    });

    it("uses custom message when provided", async () => {
      const response = notFoundResponse("User not found");
      expect(response.status).toBe(404);
      const json = await response.json();
      expect(json).toEqual({ success: false, error: "User not found" });
    });
  });

  describe("serverErrorResponse", () => {
    it("returns 500 with default message", async () => {
      const response = serverErrorResponse();
      expect(response.status).toBe(500);
      const json = await response.json();
      expect(json).toEqual({ success: false, error: "Internal server error" });
    });

    it("uses custom message when provided", async () => {
      const response = serverErrorResponse("Database connection failed");
      expect(response.status).toBe(500);
      const json = await response.json();
      expect(json).toEqual({ success: false, error: "Database connection failed" });
    });
  });
});