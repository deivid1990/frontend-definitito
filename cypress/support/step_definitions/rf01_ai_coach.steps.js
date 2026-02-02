import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";
export { };

/**
 * RF-01 – Interacción con Coach Virtual IA
 * Prueba funcional E2E con Cypress + Cucumber
 */

Given("el usuario inicia sesión", () => {
    cy.visit("/login");

    cy.get('[data-testid="login-email"]')
        .should("be.visible")
        .type(Cypress.env("E2E_EMAIL"));

    cy.get('[data-testid="login-password"]')
        .should("be.visible")
        .type(Cypress.env("E2E_PASSWORD"), { log: false });

    cy.get('[data-testid="login-submit"]').click();

    cy.location("pathname", { timeout: 10000 }).should("not.eq", "/login");
});

Given("entra a la página AI Coach", () => {
    cy.visit("/dashboard");

    cy.get('[data-testid="nav-ai-coach"]', { timeout: 10000 })
        .scrollIntoView()
        .click();

    cy.get('[data-testid="mode-chat"]', { timeout: 10000 })
        .scrollIntoView()
        .click({ force: true });

    cy.get('[data-testid="chat-input"]', { timeout: 20000 })
        .should("be.visible");
});

When('escribe el mensaje {string}', (mensaje) => {
    cy.get('[data-testid="chat-input"]').clear().type(mensaje);

    // Guardamos el conteo inicial JUSTO antes de enviar
    cy.get('[data-testid="chat-messages"] [data-testid="ai-bubble"]')
        .its("length")
        .as("initialAiCount");
});

When("presiona enviar", () => {
    cy.get('[data-testid="chat-submit"]').click();
});

Then("debe ver una respuesta del Coach", function () {
    cy.get('[data-testid="chat-messages"]', { timeout: 30000 }).should("be.visible");

    cy.get("@initialAiCount").then((initialCount) => {
        cy.log("AI bubbles antes de enviar: " + initialCount);

        cy.get('[data-testid="chat-messages"] [data-testid="ai-bubble"]', { timeout: 60000 })
            .should(($els) => {
                expect($els.length).to.be.greaterThan(Number(initialCount));
            });
    });
});
