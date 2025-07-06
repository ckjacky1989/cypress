describe('Login Test(user)', () => 
{
  it('should log in as user, succeed to browse secured index page, but fail to browse delete page', () => 
  {
    cy.visit('http://localhost:8080/login')
    cy.get('input[name=username]').type('user')
    cy.get('input[name=password]').type('user')
    cy.get('input[type=submit]').click()

    cy.visit('http://localhost:8080/secure')
    cy.title().should('eq', 'Secured Index')

    // Try to visit delete page that leads to 403
    cy.visit('http://localhost:8080/secure/delete', { failOnStatusCode: false })
    cy.contains('Permission denied').should('be.visible')

    // Logout
    cy.get('input[type=submit][value="Logout"]').click()    
  });
});

describe('Login Test(admin)', () => 
{
  it('should log in as admin, succeed to browse secured index page and delete page', () => 
  {
    cy.visit('http://localhost:8080/login')
    cy.get('input[name=username]').type('admin')
    cy.get('input[name=password]').type('admin')
    cy.get('input[type=submit]').click()

    cy.visit('http://localhost:8080/secure')
    cy.title().should('eq', 'Secured Index')

    cy.visit('http://localhost:8080/secure/delete')
    cy.title().should('eq', 'Delete Page')

    cy.get('input[type=submit][value="Logout"]').click()    
  });
});

describe('Login Test(-ve)', () => 
{
  it('should log in as admin, succeed to browse secured index page and delete page', () => 
  {
    cy.visit('http://localhost:8080/login')
    cy.get('input[name=username]').type('invalid name')
    cy.get('input[name=password]').type('invalid pw')
    cy.get('input[type=submit]').click()

    cy.contains('Invalid credentials').should('be.visible')
  
  });
});

describe('User functionality', () => 
{
  it('should log in as user, reserve, hold the availability, search by reg no and email', () => 
  {
    cy.visit('http://localhost:8080/login')
    cy.get('input[name=username]').type('user')
    cy.get('input[name=password]').type('user')
    cy.get('input[type=submit]').click()

    cy.visit('http://localhost:8080/secure')
    cy.get('form').should('exist')

    cy.get('select[name=sessionNo]').select('1')
    cy.get('input[name=regDate]').type('2025-06-01')
    cy.get('input[name=email]').type('test@example.com')
    cy.get('input[type=submit][value="Reserve"]').click()

    // Check that the reservation updated availability
    cy.get('table')
    // Find the row with sessionNo = 1 (.contains(selector, content))
    .contains('td', '1') 
    // Get the <tr> that contains this <td>
    .parent() 
    // Check if the 4th column is false
    .within(() => {
      cy.get('td').eq(3).should('contain.text', 'false') 
    })

    // Search by reg no
    cy.get('input[name=findByRegNo]').type('1')
    cy.get('input[type=submit][value="Search by reg no"]').click()
    cy.get('table')
    .contains('td', 'test@example.com')
    .parent()
    .within(() => {
      cy.get('td').eq(0).should('contain.text', '1') 
      cy.get('td').eq(1).should('contain.text', '2025-06-01') 
      cy.get('td').eq(2).should('contain.text', '1') 
      cy.get('td').eq(3).should('contain.text', 'test@example.com')
    })

    // Search by email
    cy.get('input[name=findByEmail]').type('test@example.com')
    cy.get('input[type=submit][value="Search by email"]').click()
    cy.get('table')
    .contains('td', 'test@example.com')
    .parent()
    .within(() => {
      cy.get('td').eq(0).should('contain.text', '1') 
      cy.get('td').eq(1).should('contain.text', '2025-06-01') 
      cy.get('td').eq(2).should('contain.text', '1') 
      cy.get('td').eq(3).should('contain.text', 'test@example.com')
    })

    // Logout
    cy.get('input[type=submit][value="Logout"]').click()
  });
});

describe('Admin functionality', () => 
{
  it('should log in as admin, and delete the reservation', () => 
  {
    cy.visit('http://localhost:8080/login')
    cy.get('input[name=username]').type('admin')
    cy.get('input[name=password]').type('admin')
    cy.get('input[type=submit]').click()

    cy.visit('http://localhost:8080/secure/delete')
    cy.get('select[name=regNo]').select('1')
    cy.get('input[type=submit][value="Delete"]').click()
    
    // After deleting reg no 1, there should be nothing inside except "-- Select Reg Number --"
    cy.get('select[name=regNo] option').should('have.length', 1)

    cy.get('input[type=submit][value="Logout"]').click()
  });
});

describe('Form validation(reserve)', () => 
{
  it('should fail registration with empty date and email', () => 
  {
    cy.visit('http://localhost:8080/login')
    cy.get('input[name=username]').type('user')
    cy.get('input[name=password]').type('user')
    cy.get('input[type=submit]').click()

    cy.visit('http://localhost:8080/secure')

    // Empty sessions no
    cy.get('select[name=sessionNo]').select('')
    cy.get('input[name=regDate]').type('2025-06-01')
    cy.get('input[name=email]').type('test@example.com')
    cy.get('input[type=submit][value="Reserve"]').click()
    cy.contains('Session number should not be empty.').should('be.visible')

    // Empty reg date
    cy.get('select[name=sessionNo]').select('2')
    cy.get('input[name=regDate]').clear()
    cy.get('input[name=email]').type('test@example.com')
    cy.get('input[type=submit][value="Reserve"]').click()
    cy.contains('Date should not be empty.').should('be.visible')

    // Empty email
    cy.get('select[name=sessionNo]').select('3')
    cy.get('input[name=regDate]').type('2025-06-01')
    cy.get('input[name=email]').clear()
    cy.get('input[type=submit][value="Reserve"]').click()
    cy.contains('Email should not be empty.').should('be.visible')

    cy.get('input[type=submit][value="Logout"]').click()
  });
});

describe('Form validation(Search by reg no)', () => 
{
  it('should fail searching with empty reg no and invalid no', () => 
  {
    cy.visit('http://localhost:8080/login')
    cy.get('input[name=username]').type('user')
    cy.get('input[name=password]').type('user')
    cy.get('input[type=submit]').click()

    // Empty reg no
    cy.visit('http://localhost:8080/secure')
    cy.get('input[name=findByRegNo]').clear()
    cy.get('input[type=submit][value="Search by reg no"]').click()
    cy.contains('Registration number should not be empty.').should('be.visible')

    // Reg no 99 does not exist
    cy.get('input[name=findByRegNo]').type('99')
    cy.get('input[type=submit][value="Search by reg no"]').click()
    cy.contains('Registration number not found.').should('be.visible')

    // Reg no is not an integer
    cy.get('input[name=findByRegNo]').type('abc')
    cy.get('input[type=submit][value="Search by reg no"]').click()
    cy.contains('Registration number should be an integer.').should('be.visible')
    
    cy.get('input[type=submit][value="Logout"]').click()
  });
});

describe('Form validation(Search by email)', () => 
{
  it('should fail searching with empty email and invalid email', () => 
  {
    cy.visit('http://localhost:8080/login')
    cy.get('input[name=username]').type('user')
    cy.get('input[name=password]').type('user')
    cy.get('input[type=submit]').click()

    cy.visit('http://localhost:8080/secure')

    // Empty email
    cy.get('input[name=findByEmail]').clear()
    cy.get('input[type=submit][value="Search by email"]').click()
    cy.contains('Email should not be empty.').should('be.visible')

    // Invalid email
    cy.get('input[name=findByEmail]').type('invalidEmail')
    cy.get('input[type=submit][value="Search by email"]').click()
    cy.contains('Email not found.').should('be.visible')
    
    cy.get('input[type=submit][value="Logout"]').click()
  });
});

describe('Form validation(Delete)', () => 
{
  it('should fail searching with empty email and invalid email', () => 
  {
    cy.visit('http://localhost:8080/login')
    cy.get('input[name=username]').type('admin')
    cy.get('input[name=password]').type('admin')
    cy.get('input[type=submit]').click()

    cy.visit('http://localhost:8080/secure/delete')
    cy.get('select[name=regNo]').select('')
    cy.get('input[type=submit][value="Delete"]').click()
    cy.contains('Registration number should not be empty.').should('be.visible')
    
    cy.get('input[type=submit][value="Logout"]').click()
  });
});