const users = [
  { username: "user", password: "user" },
  { username: "fake", password: "wrong" },
  { username: "", password: "" },
  { username: "blankName", password: "" },
  { username: "", password: "blankPassword" }
];

const products = [
  { name: "apple", price: "5" },
  { name: "apple pie", price: "6" },
  { name: "", price: "" },
  { name: "banana", price: "" },
  { name: "", price: "7" },
  { name: "orange", price: "3" },
  { name: "chocolate", price: "-5" },
];

describe('Product Store E2E Tests', () => {
  beforeEach(() => {
    cy.visit('http://localhost:8100/tabs/tab3');
  });

  it('Registered, logined, and accessed tab1 and tab2 as user', () => {
    cy.get("ion-input[name='username'] input").type(users[0].username, { force: true });
    cy.get("ion-input[name='password'] input").type(users[0].password, { force: true });
    cy.get('ion-button').contains('Register').click();
    cy.contains("Registration successful").should('exist');

    cy.get("ion-input[name='username'] input").type(users[0].username, { force: true });
    cy.get("ion-input[name='password'] input").type(users[0].password, { force: true });
    cy.get('ion-button').contains('Login').click();
    cy.contains(users[0].username).should('exist');

    cy.get("ion-tab-button[tab='tab2']").click();
    cy.contains("Tab 2 - Add Item to Store").should('exist');

    cy.get("ion-tab-button[tab='tab1']").click();
    cy.contains("Tab 1 - Update and Delete Items").should('exist');

    cy.get("ion-button:contains('Logout'):visible").click();
  });

  it('Invalid login without registration correctly failed', () => {
    cy.get("ion-input[name='username'] input").type(users[1].username, { force: true });
    cy.get("ion-input[name='password'] input").type(users[1].password, { force: true });
    cy.get('ion-button').contains('Login').click();
    cy.contains("Invalid credentials").should('exist');
  });

  it('Invalid registration with empty username and/or password correctly failed', () => {
    for (let x = 2; x < 5; x++) {
      cy.visit('http://localhost:8100/tabs/tab3');
      if(users[x].username != "")
      {
        cy.get("ion-input[name='username'] input").type(users[x].username, { force: true });
      }else{
        cy.get("ion-input[name='username'] input").clear({ force: true });
      }
      if(users[x].password != "")
      {
        cy.get("ion-input[name='password'] input").type(users[x].password, { force: true });
      }else{
        cy.get("ion-input[name='password'] input").clear({ force: true });
      }     
      cy.get('ion-button').contains('Register').click();
      cy.contains("Username and/or password should not be empty").should('exist');
    }
  });

  it('Invalid login with empty username and/or password correctly failed', () => {
    for (let x = 2; x < 5; x++) {
      cy.visit('http://localhost:8100/tabs/tab3');
      if(users[x].username != "")
      {
        cy.get("ion-input[name='username'] input").type(users[x].username, { force: true });
      }else{
        cy.get("ion-input[name='username'] input").clear({ force: true });
      }
      if(users[x].password != "")
      {
        cy.get("ion-input[name='password'] input").type(users[x].password, { force: true });
      }else{
        cy.get("ion-input[name='password'] input").clear({ force: true });
      }     
      cy.get('ion-button').contains('Login').click();
      cy.contains("Username and/or password should not be empty").should('exist');
    }
  });

  it('Invalid registration with existing user correctly failed', () => {
    cy.get("ion-input[name='username'] input").type(users[0].username, { force: true });
    cy.get("ion-input[name='password'] input").type(users[0].password, { force: true });
    cy.get('ion-button').contains('Register').click();
    cy.contains("User already exists").should('exist');
  });

  it('Added a product', () => {
    cy.get("ion-input[name='username'] input").type(users[0].username, { force: true });
    cy.get("ion-input[name='password'] input").type(users[0].password, { force: true });
    cy.get('ion-button').contains('Login').click();

    cy.get("ion-tab-button[tab='tab2']").click();
    cy.get("ion-input[name='productName'] input").type(products[0].name, { force: true });
    cy.get("ion-input[name='productPrice'] input").type(products[0].price, { force: true });
    cy.get('ion-button').contains('Add Product').click();
    cy.contains("Product added").should('exist');
  });

  it('Invalid addition of product with empty name and/or price correctly failed', () => {
    cy.get("ion-tab-button[tab='tab2']").click();
    for (let x = 2; x < 5; x++) {
      if(products[x].name != "")
      {
        cy.get("ion-input[name='productName'] input").type(products[x].name, { force: true });
      }else{
        cy.get("ion-input[name='productName'] input").clear({ force: true });
      }
      if(products[x].price != "")
      {
        cy.get("ion-input[name='productPrice'] input").type(products[x].price, { force: true });
      }else{
        cy.get("ion-input[name='productPrice'] input").clear({ force: true });
      }     
      
      cy.get('ion-button').contains('Add Product').click({force: true});
      if(products[x].name == "")
      {
        cy.contains("Product name should not be empty").should('exist');
      }
      else if(products[x].price == "")
      {
        cy.contains("Product price should be >= 0").should('exist');
      }
    }
  });

  it('Searched a product', () => {
    cy.get("ion-tab-button[tab='tab2']").click();
    cy.get("ion-input[name='productName'] input").type(products[0].name, { force: true });
    cy.get('ion-button').contains('Search By Name').click();
    cy.get('ion-col').should('contain.text', products[0].name, { force: true });
    cy.get('ion-col').should('contain.text', products[0].price, { force: true });
  });

  it('Searched similar products', () => {
    cy.get("ion-tab-button[tab='tab2']").click();
    cy.get("ion-input[name='productName'] input").type(products[1].name, { force: true });
    cy.get("ion-input[name='productPrice'] input").type(products[1].price, { force: true });
    cy.get('ion-button').contains('Add Product').click();

    cy.get("ion-input[name='productName'] input").type(products[0].name, { force: true });
    cy.get('ion-button').contains('Search By Name').click();

    cy.get('ion-col').should('contain.text', products[0].name);
    cy.get('ion-col').should('contain.text', products[0].price);
    cy.get('ion-col').should('contain.text', products[1].name);
    cy.get('ion-col').should('contain.text', products[1].price);
  });

  it('Searched without product name', () => {
    cy.get("ion-tab-button[tab='tab2']").click();
    cy.get("ion-input[name='productName'] input").clear({ force: true });
    cy.get('ion-button').contains('Search By Name').click();

    cy.get('ion-col').should('contain.text', products[0].name);
    cy.get('ion-col').should('contain.text', products[0].price);
    cy.get('ion-col').should('contain.text', products[1].name);
    cy.get('ion-col').should('contain.text', products[1].price);
  });

  it('Updated the detail of a product', () => {
    cy.get("ion-tab-button[tab='tab1']").click();
    cy.get("ion-select").click();
    cy.get('ion-alert').within(() => {
      cy.contains('apple').click();
      cy.contains('OK').click();
    });
    cy.get("ion-input[name='newName'] input").type(products[5].name, { force: true });
    cy.get("ion-input[name='newPrice'] input").type(products[5].price, { force: true });
    cy.get('ion-button').contains('Update Product').click();
    cy.get('ion-col').should('contain.text', products[5].name);
    cy.get('ion-col').should('contain.text', products[5].price);

    cy.get("ion-tab-button[tab='tab2']").click();
    cy.get("ion-input[name='productName'] input").clear({ force: true });
    cy.get('ion-button').contains('Search By Name').click();
    cy.get('ion-col').should('contain.text', products[5].name);
    cy.get('ion-col').should('contain.text', products[5].price);
  });

  it('Deleted a product', () => {
    cy.get("ion-tab-button[tab='tab1']").click();
    cy.get('ion-row')
      .contains(products[5].name)
      .parents('ion-row')
      .within(() => {
        cy.get('ion-button').contains('Delete').click({force: true});
      });
    cy.get('ion-col').should('not.contain.text', products[5].name);
    cy.get('ion-col').should('not.contain.text', products[5].price);    
  });
});
