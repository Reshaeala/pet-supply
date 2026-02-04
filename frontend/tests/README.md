# Playwright E2E Tests for Save My Pet

This directory contains end-to-end tests for the payment checkout flow using Playwright.

## Setup

Already installed! Just run the tests.

## Running Tests

### Run all tests (headless mode):
```bash
npm test
```

### Run tests with UI mode (recommended for development):
```bash
npm run test:ui
```

### Run tests in headed mode (see the browser):
```bash
npm run test:headed
```

### Run tests in debug mode (step through each action):
```bash
npm run test:debug
```

### View last test report:
```bash
npm run test:report
```

### Run specific test file:
```bash
npx playwright test checkout.spec.js
```

### Run specific test by name:
```bash
npx playwright test -g "should navigate to checkout"
```

## Test Coverage

The current test suite covers:

1. ✅ **Navigation to Checkout** - Adding items to cart and navigating to checkout
2. ✅ **Form Validation** - Testing required field validation
3. ✅ **Shipping Information** - Filling and verifying shipping details
4. ✅ **Payment Options** - Testing payment method selection
5. ✅ **Paystack Integration** - Verifying Paystack popup appears
6. ✅ **Order Summary** - Checking order total calculations

## What Gets Tested

### Functional Tests:
- User signup/login flow
- Adding products to cart
- Navigating to checkout
- Form validation (required fields)
- Filling shipping information
- Selecting payment methods
- Triggering Paystack payment popup
- Order summary display

### Browsers Tested:
- Chrome (Desktop)
- Firefox (Desktop)
- Safari/Webkit (Desktop)
- Mobile Chrome (Pixel 5)
- Mobile Safari (iPhone 12)

## Test Reports

After running tests, you'll get:
- **Console output** with pass/fail status
- **HTML report** (automatically opens on failure)
- **Screenshots** (on failure)
- **Videos** (on failure)
- **Traces** (for debugging)

## Tips

1. **Use UI Mode** during development:
   ```bash
   npm run test:ui
   ```
   This gives you a nice interface to see tests running in real-time.

2. **Debug failing tests**:
   ```bash
   npm run test:debug
   ```
   This opens Playwright Inspector to step through tests.

3. **Run tests on specific browser**:
   ```bash
   npx playwright test --project=chromium
   npx playwright test --project=firefox
   npx playwright test --project=webkit
   ```

4. **Update test snapshots** (if using visual regression):
   ```bash
   npx playwright test --update-snapshots
   ```

## CI/CD Integration

To run tests in CI/CD:

```yaml
# GitHub Actions example
- name: Install dependencies
  run: npm ci

- name: Install Playwright Browsers
  run: npx playwright install --with-deps

- name: Run Playwright tests
  run: npm test

- name: Upload test results
  uses: actions/upload-artifact@v3
  if: always()
  with:
    name: playwright-report
    path: playwright-report/
```

## Common Issues

### Issue: Tests timeout
**Solution**: Increase timeout in `playwright.config.js`:
```javascript
use: {
  actionTimeout: 10000,
  navigationTimeout: 30000,
}
```

### Issue: Paystack iframe not loading
**Solution**:
- Check that `VITE_PAYSTACK_PUBLIC_KEY` is set in `.env`
- Ensure backend is running on port 5000
- Check network connection

### Issue: User already exists error
**Solution**: Tests automatically handle this by trying login if signup fails

## Adding New Tests

1. Create a new `.spec.js` file in the `tests/` directory
2. Import test and expect:
   ```javascript
   import { test, expect } from '@playwright/test';
   ```
3. Write your tests:
   ```javascript
   test('my new test', async ({ page }) => {
     await page.goto('/');
     // Your test code
   });
   ```

## Need Help?

- [Playwright Documentation](https://playwright.dev/)
- [Playwright Discord](https://aka.ms/playwright/discord)
- Check the HTML report: `npm run test:report`
