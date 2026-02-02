import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";

Given("el usuario inicia sesión correctamente", () => {
    cy.login(); // login real reutilizado
});

When("el usuario navega a la sección de seguimiento de progreso", () => {
    cy.get('[data-testid="nav-progress"]')
        .should("exist")
        .scrollIntoView()
        .click({ force: true });

    cy.url().should("include", "/progreso");
});

Then("el sistema debe mostrar la pantalla de progreso", () => {
    cy.get('[data-testid="progress-page"]').should("exist");
    cy.get('[data-testid="progress-title"]').should("exist");
});

When("el usuario sube una fotografía de progreso con descripción", () => {
    // ✅ Intercept REAL y estable (insert en tabla Supabase)
    cy.intercept("POST", "**/rest/v1/entrenamiento_selfies*").as("insertSelfie");

    // 1️⃣ Abrir modal
    cy.get('[data-testid="progress-open-modal"]')
        .should("exist")
        .scrollIntoView()
        .click({ force: true });

    // 2️⃣ Esperar que el modal exista (evita problemas de timing)
    cy.get('[data-testid="progress-upload-modal"]').should("exist");

    // 3️⃣ Interactuar dentro del modal
    cy.get('[data-testid="progress-upload-modal"]').within(() => {

        // Subir imagen REAL
        cy.get('[data-testid="progress-photo-input"]')
            .should("exist")
            .selectFile("cypress/fixtures/progress.jpg", { force: true });

        // Escribir descripción
        cy.get('[data-testid="progress-description"]')
            .should("exist")
            .type("Semana 1 - progreso inicial");

        // ✅ AJUSTE CLAVE: asegurar que el botón esté habilitado
        cy.get('[data-testid="progress-upload-button"]')
            .should("not.be.disabled");

        // Click final
        cy.get('[data-testid="progress-upload-button"]')
            .should("exist")
            .click({ force: true });
    });
});

Then("el sistema debe guardar la fotografía en el backend", () => {
    // ✅ Evidencia backend REAL
    cy.wait("@insertSelfie", { timeout: 60000 })
        .its("response.statusCode")
        .should("be.oneOf", [200, 201]);

    // Flag visual de carga correcta
    cy.get('[data-testid="progress-loaded"]').should("exist");
});

Then("la fotografía debe aparecer en la galería de progreso", () => {
    cy.get('[data-testid="progress-gallery"]').should("exist");

    cy.get('[data-testid="progress-photo-item"]')
        .should("exist")
        .first()
        .within(() => {
            cy.get('[data-testid="progress-photo-date"]').should("exist");
            cy.get('[data-testid="progress-photo-description"]').should("exist");
        });
});
