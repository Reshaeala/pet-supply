// Cypress E2E Test for Paystack Checkout
// Install: npm install -D cypress
// Run: npx cypress open

describe('Paystack Checkout Flow', () => {
  beforeEach(() => {
    // Visit the app and login
    cy.visit('http://localhost:3001');
    cy.contains('Sign In').click();
    cy.get('input[type="email"]').type('test@example.com');
    cy.get('input[type="password"]').type('password123');
    cy.contains('button', 'Login').click();
  });

  it('should complete a successful payment', () => {
    // Add product to cart
    cy.contains('Dogs').click();
    cy.contains('button', 'Add to Cart').first().click();

    // Go to cart and checkout
    cy.get('[aria-label="Shopping cart"]').click();
    cy.contains('Proceed to Checkout').click();

    // Fill shipping information
    cy.get('input[name="firstName"]').type('John');
    cy.get('input[name="lastName"]').type('Doe');
    cy.get('input[name="email"]').clear().type('john@example.com');
    cy.get('input[name="phone"]').type('08012345678');
    cy.get('input[name="address"]').type('123 Test Street');
    cy.get('input[name="city"]').type('Lagos');
    cy.get('input[name="state"]').type('Lagos');

    // Select Card Payment
    cy.get('input[value="Card Payment"]').check();

    // Click Place Order
    cy.contains('button', 'Place Order').click();

    // Handle Paystack iframe
    cy.origin('https://checkout.paystack.com', () => {
      // Fill in test card details
      cy.get('input[name="cardnumber"]').type('4084084084084081');
      cy.get('input[name="expirydate"]').type('01/30');
      cy.get('input[name="cvv"]').type('408');
      cy.contains('button', 'Pay').click();

      // Handle PIN
      cy.get('input[name="pin"]').type('0000');
      cy.contains('button', 'Submit').click();

      // Handle OTP
      cy.get('input[name="otp"]').type('123456');
      cy.contains('button', 'Submit').click();
    });

    // Verify redirect to confirmation
    cy.url().should('include', '/order-confirmation');
    cy.contains('Order Confirmed').should('be.visible');
  });

  it('should show all order details on confirmation page', () => {
    // ... complete payment flow

    // Verify order details
    cy.contains('John Doe').should('be.visible');
    cy.contains('08012345678').should('be.visible');
    cy.contains('123 Test Street').should('be.visible');
  });
});
