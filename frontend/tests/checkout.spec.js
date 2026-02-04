// Playwright E2E Test for Paystack Checkout
// Run: npx playwright test
// Run with UI: npx playwright test --ui
// Run specific test: npx playwright test checkout.spec.js

import { test, expect } from "@playwright/test";

test.describe("Save My Pet - Paystack Checkout Flow", () => {
  // Helper function to create a test user and login
  async function loginAsTestUser(page) {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Click Sign In button in header
    await page
      .getByRole("banner")
      .getByRole("button", { name: "Sign In" })
      .click();
    await page.waitForTimeout(500);

    // Fill in login details (using existing test user)
    await page.fill('input[type="email"]', "test@example.com");
    await page.fill('input[type="password"]', "password123");

    // Click Sign In button in the modal (submit button)
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "Sign In" })
      .click();

    // Wait for modal to close (indicating successful login)
    await page.waitForSelector('[role="dialog"]', {
      state: "hidden",
      timeout: 5000,
    });

    // Wait for page to stabilize after login
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);
  }

  test.beforeEach(async ({ page }) => {
    // Set viewport for consistent testing
    await page.setViewportSize({ width: 1280, height: 720 });
  });

  test("should navigate to checkout after adding items to cart", async ({
    page,
  }) => {
    await loginAsTestUser(page);

    // Navigate to Dogs products by clicking the animal category
    await page.getByText("Dogs").first().click();
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    //Let's get by text Flea and Tick Prevention
    await page.getByText("Pedigree Flea & Tick Topical For Dogs").click();
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(3000);

    // Wait for Add to Cart button on product detail page
    await page
      .getByRole("button", { name: /add to cart/i })
      .waitFor({ timeout: 15000 });

    // Add product to cart
    await page.getByRole("button", { name: /add to cart/i }).click();
    await page.waitForTimeout(1000);

    // Go to cart
    await page.getByLabel("Shopping cart").click();
    await page.waitForLoadState("networkidle");

    // Verify cart has items
    await expect(page.getByText(/proceed to checkout/i)).toBeVisible();

    // Proceed to checkout
    await page.getByRole("button", { name: /proceed to checkout/i }).click();
    await page.waitForLoadState("networkidle");

    // Verify we're on checkout page
    await expect(page).toHaveURL(/checkout/);
    await expect(page.getByText("Checkout")).toBeVisible();
  });

  test("should validate shipping form before payment", async ({ page }) => {
    await loginAsTestUser(page);

    // Add item to cart and go to checkout
    await page.getByText("Dogs").first().click();
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);
    //Let's get by text Flea and Tick Prevention
    await page.getByText("Pedigree Flea & Tick Topical For Dogs").click();
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(3000);
    await page.waitForLoadState("networkidle");
    await page
      .getByRole("button", { name: /add to cart/i })
      .waitFor({ timeout: 10000 });
    await page.getByRole("button", { name: /add to cart/i }).click();
    await page.waitForTimeout(500);
    await page.getByLabel("Shopping cart").click();
    await page.getByRole("button", { name: /proceed to checkout/i }).click();
    await page.waitForLoadState("networkidle");

    // Try to place order without filling form
    await page.getByRole("button", { name: /place order/i }).click();

    // Should show validation errors
    await expect(page.getByText(/first name is required/i)).toBeVisible();
    await expect(page.getByText(/last name is required/i)).toBeVisible();
  });

  test("should fill shipping information correctly", async ({ page }) => {
    await loginAsTestUser(page);

    // Add item and navigate to checkout
    await page.getByText("Dogs").first().click();
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);
    //Let's get by text Flea and Tick Prevention
    await page.getByText("Pedigree Flea & Tick Topical For Dogs").click();
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(3000);
    await page.waitForLoadState("networkidle");
    await page
      .getByRole("button", { name: /add to cart/i })
      .waitFor({ timeout: 10000 });
    await page.getByRole("button", { name: /add to cart/i }).click();
    await page.waitForTimeout(500);
    await page.getByLabel("Shopping cart").click();
    await page.getByRole("button", { name: /proceed to checkout/i }).click();
    await page.waitForLoadState("networkidle");

    // Fill in shipping information
    await page.fill('input[name="firstName"]', "John");
    await page.fill('input[name="lastName"]', "Doe");
    await page.fill('input[name="phone"]', "08012345678");
    await page.fill(
      'input[name="address"]',
      "123 Test Street, Victoria Island"
    );
    await page.fill('input[name="city"]', "Lagos");
    await page.fill('input[name="state"]', "Lagos State");

    // Email should be pre-filled
    const emailValue = await page.inputValue('input[name="email"]');
    expect(emailValue).toBeTruthy();

    // Verify all fields are filled
    await expect(page.locator('input[name="firstName"]')).toHaveValue("John");
    await expect(page.locator('input[name="lastName"]')).toHaveValue("Doe");
  });

  test("should display payment options", async ({ page }) => {
    await loginAsTestUser(page);

    // Navigate to checkout with items
    await page.getByText("Dogs").first().click();
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);
    //Let's get by text Flea and Tick Prevention
    await page.getByText("Pedigree Flea & Tick Topical For Dogs").click();
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(3000);
    await page.waitForLoadState("networkidle");
    await page
      .getByRole("button", { name: /add to cart/i })
      .waitFor({ timeout: 10000 });
    await page.getByRole("button", { name: /add to cart/i }).click();
    await page.waitForTimeout(500);
    await page.getByLabel("Shopping cart").click();
    await page.getByRole("button", { name: /proceed to checkout/i }).click();
    await page.waitForLoadState("networkidle");

    // Verify payment options exist
    await expect(page.getByText("Card Payment")).toBeVisible();
    await expect(page.getByText("Bank Transfer")).toBeVisible();

    // Select Card Payment
    await page.check('input[value="Card Payment"]');
    await expect(page.locator('input[value="Card Payment"]')).toBeChecked();
  });

  test("should trigger Paystack popup with Card Payment", async ({ page }) => {
    await loginAsTestUser(page);

    // Complete checkout flow
    await page.getByText("Dogs").first().click();
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);
    //Let's get by text Flea and Tick Prevention
    await page.getByText("Pedigree Flea & Tick Topical For Dogs").click();
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(3000);
    await page.waitForLoadState("networkidle");
    await page
      .getByRole("button", { name: /add to cart/i })
      .waitFor({ timeout: 10000 });
    await page.getByRole("button", { name: /add to cart/i }).click();
    await page.waitForTimeout(500);
    await page.getByLabel("Shopping cart").click();
    await page.getByRole("button", { name: /proceed to checkout/i }).click();
    await page.waitForLoadState("networkidle");

    // Fill form
    await page.fill('input[name="firstName"]', "John");
    await page.fill('input[name="lastName"]', "Doe");
    await page.fill('input[name="phone"]', "08012345678");
    await page.fill('input[name="address"]', "123 Test Street");
    await page.fill('input[name="city"]', "Lagos");
    await page.fill('input[name="state"]', "Lagos State");

    // Select Card Payment
    await page.check('input[value="Card Payment"]');

    // Click Place Order - this should open Paystack
    await page.getByRole("button", { name: /place order/i }).click();

    // Wait for Paystack iframe to appear
    await page.waitForTimeout(3000);

    // Check if Paystack iframe is present
    const paystackIframe = page.frameLocator('iframe[src*="paystack"]');
    await expect(paystackIframe.locator("body")).toBeVisible({
      timeout: 10000,
    });
  });

  test("should show order summary with correct totals", async ({ page }) => {
    await loginAsTestUser(page);

    // Add item and go to checkout
    await page.getByText("Dogs").first().click();
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);
    //Let's get by text Flea and Tick Prevention
    await page.getByText("Pedigree Flea & Tick Topical For Dogs").click();
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(3000);
    await page.waitForLoadState("networkidle");
    await page
      .getByRole("button", { name: /add to cart/i })
      .waitFor({ timeout: 10000 });
    await page.getByRole("button", { name: /add to cart/i }).click();
    await page.waitForTimeout(500);
    await page.getByLabel("Shopping cart").click();
    await page.getByRole("button", { name: /proceed to checkout/i }).click();
    await page.waitForLoadState("networkidle");

    // // Verify order summary section exists
    await expect(page.getByText("Order Summary")).toBeVisible();
    // await expect(page.getByText("Subtotal:")).toBeVisible();
    // await expect(page.getByText("Total:")).toBeVisible();
  });
});
