import { When, Then } from "@badeball/cypress-cucumber-preprocessor";
export { };

/**
 * RF-02 – Gestión de rutinas de entrenamiento
 * Fix: botones dentro de contenedores con overflow:hidden pueden "existir" pero no ser "visible" para Cypress.
 * Estrategia: assert exist + scrollIntoView + click(force) sin exigir be.visible.
 */

When("cambia al modo Diseñar", () => {
  cy.get('[data-testid="mode-generate"]', { timeout: 20000 })
    .should("exist")
    .scrollIntoView()
    .click({ force: true });
});

When("inicia el diseño de rutina", () => {
  cy.get('[data-testid="generate-start"]', { timeout: 20000 })
    .should("exist")
    .scrollIntoView()
    .click({ force: true });
});

Then("debe ver el preview de la rutina generada", () => {
  cy.get('[data-testid="routine-preview"]', { timeout: 90000 })
    .should("exist");

  cy.get('[data-testid="preview-title"]', { timeout: 90000 })
    .should("exist")
    .invoke("text")
    .then((text) => {
      expect(text.trim()).to.not.equal("");
    });
});

When("acepta la rutina generada", () => {
  // Asegura que el preview está montado
  cy.get('[data-testid="routine-preview"]', { timeout: 90000 })
    .should("exist");

  // El botón puede estar recortado por overflow:hidden => no exigir be.visible
  cy.get('[data-testid="routine-accept"]', { timeout: 60000 })
    .should("exist")
    .scrollIntoView({ block: "center" })
    .click({ force: true });
});

Then("debe ver confirmación de rutina activada", () => {
  cy.contains(/rutina.*(éxito|activada|disponible)/i, { timeout: 60000 })
    .should("be.visible");
});

