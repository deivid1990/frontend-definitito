import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";

Given("el usuario inicia sesión con credenciales válidas", () => {
    cy.visit("/login");

    cy.get('[data-testid="login-email"]', { timeout: 20000 })
        .should("exist")
        .scrollIntoView()
        .type(Cypress.env("E2E_EMAIL"));

    cy.get('[data-testid="login-password"]', { timeout: 20000 })
        .should("exist")
        .scrollIntoView()
        .type(Cypress.env("E2E_PASSWORD"), { log: false });

    cy.get('[data-testid="login-submit"]', { timeout: 20000 })
        .should("exist")
        .scrollIntoView()
        .click({ force: true });

    // Confirmar login exitoso
    cy.location("pathname", { timeout: 20000 }).should("not.include", "/login");
});

When("navega a perfil físico desde el menú lateral", () => {
    cy.get('[data-testid="nav-profile"]', { timeout: 20000 })
        .should("exist")
        .scrollIntoView()
        .click({ force: true });

    cy.location("pathname", { timeout: 20000 }).should("eq", "/perfil");
});

When("completa los datos del perfil físico", () => {
    // ✅ FIX DEFINITIVO: evita DavidDavidDavid
    cy.get('[data-testid="input-name"]', { timeout: 20000 })
        .should("exist")
        .scrollIntoView()
        .type("{selectall}{backspace}David", { force: true });

    cy.get('[data-testid="input-age"]', { timeout: 20000 })
        .should("exist")
        .scrollIntoView()
        .clear({ force: true })
        .type("34", { force: true });

    cy.get('[data-testid="input-weight"]', { timeout: 20000 })
        .should("exist")
        .scrollIntoView()
        .clear({ force: true })
        .type("94", { force: true });

    cy.get('[data-testid="input-height"]', { timeout: 20000 })
        .should("exist")
        .scrollIntoView()
        .clear({ force: true })
        .type("181", { force: true });
});

When("guarda el perfil físico", () => {
    // Persistencia real en Supabase
    cy.intercept("POST", "**/rest/v1/biometric_history*").as("saveBiometric");

    cy.get('[data-testid="btn-save-profile"]', { timeout: 20000 })
        .should("exist")
        .scrollIntoView()
        .click({ force: true });

    cy.wait("@saveBiometric", { timeout: 30000 }).then((i) => {
        expect(i.response?.statusCode).to.be.oneOf([200, 201]);
    });
});

Then("el sistema muestra confirmación visual de guardado exitoso", () => {
    // Validación estable (no depende de animaciones)
    cy.get('[data-testid="profile-success"]', { timeout: 20000 })
        .should("exist");
});
