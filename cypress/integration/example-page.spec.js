/// <reference types='Cypress' />

context("Example page", () => {
    before(() => {
        cy.login("who");
        cy.visit("#/");
    });

    it("has page title", () => {
        cy.title().should("equal", "GEE App");
    });
});
