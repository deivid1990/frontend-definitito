import { Given, Then } from "@badeball/cypress-cucumber-preprocessor";
export { };

/**
 * RF-03 – Consulta de biblioteca de ejercicios
 * Validación E2E de lectura (GET) sin mocks
 */

Given("entra a la biblioteca de ejercicios", () => {
    // Navega a la vista de ejercicios desde el dashboard o menú
    cy.visit("/dashboard");

    cy.location("pathname", { timeout: 20000 }).should("not.eq", "/login");

    cy.get('[data-testid="nav-exercises"]', { timeout: 20000 })
        .should("exist")
        .and("be.visible")
        .scrollIntoView()
        .click();

    // Confirma que la vista de ejercicios cargó
    cy.contains(/ejercicios|biblioteca/i, { timeout: 20000 }).should("be.visible");
});

Then("debe visualizar una lista de ejercicios disponibles", () => {
    // Contenedor principal de la lista
    cy.get('[data-testid="exercise-list"]', { timeout: 20000 })
        .should("exist");

    // Al menos un ejercicio renderizado
    cy.get('[data-testid="exercise-item"]', { timeout: 20000 })
        .should("have.length.greaterThan", 0);
});
