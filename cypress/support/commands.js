Cypress.Commands.add("login", () => {
    cy.visit("/login");

    cy.get('[data-testid="login-email"]', { timeout: 10000 })
        .should("be.visible")
        .clear()
        .type(Cypress.env("E2E_EMAIL"));

    cy.get('[data-testid="login-password"]', { timeout: 10000 })
        .should("be.visible")
        .clear()
        .type(Cypress.env("E2E_PASSWORD"), { log: false });

    cy.get('[data-testid="login-submit"]', { timeout: 10000 })
        .should("be.visible")
        .click();

    // Validación de salida del login
    cy.location("pathname", { timeout: 20000 }).should("not.eq", "/login");
});
