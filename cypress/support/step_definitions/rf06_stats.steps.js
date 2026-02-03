import { When, Then } from "@badeball/cypress-cucumber-preprocessor";

When("el usuario navega a la sección de estadísticas", () => {
    cy.get('[data-testid="nav-stats"]', { timeout: 20000 })
        .should("exist")
        .scrollIntoView()
        .click({ force: true });

    cy.url({ timeout: 20000 }).should("include", "/estadisticas");
});

Then("el sistema debe mostrar el dashboard de estadísticas", () => {
    cy.get('[data-testid="stats-page"]', { timeout: 20000 }).should("exist");
    cy.get('[data-testid="stats-title"]', { timeout: 20000 }).should("exist");
});

Then("debe mostrar el gráfico de constancia de los últimos 7 días", () => {
    cy.get('[data-testid="stats-chart-7d"]', { timeout: 20000 }).should("exist");
    cy.get('[data-testid^="stats-bar-"]', { timeout: 20000 }).should("exist");
});

Then("debe mostrar el conteo de sesiones semanales", () => {
    cy.get('[data-testid="stats-weekly-sessions"]', { timeout: 20000 }).should("exist");
});

Then("debe mostrar indicadores por colores de cumplimiento", () => {
    cy.get('[data-testid^="stats-bar-"]', { timeout: 20000 }).should("exist");
});

Then("el dashboard debe ser responsive", () => {
    // Desktop
    cy.viewport(1000, 660);
    cy.get('[data-testid="stats-page"]').should("exist");

    // Mobile
    cy.viewport(390, 844);
    cy.get('[data-testid="stats-page"]').should("exist");
});
