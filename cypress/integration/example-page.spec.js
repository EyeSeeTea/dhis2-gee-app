/// <reference types='Cypress' />

context("Example page", () => {
    before(() => {
        cy.login("admin");
        cy.visit("#/for");
    });

    it("has page title", () => {
        cy.title().should("equal", "React App");
    });

    it("increments counter when button clicked", () => {
        cy.contains("+1").click();
        cy.contains("Value=1");
    });

    it("shows feedback when button clicked", () => {
        cy.contains("Click to show feedback").click();
        cy.contains("Some info");
    });
});