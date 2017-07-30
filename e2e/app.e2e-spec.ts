import { BudgetmeAngularAppPage } from './app.po';

describe('budgetme-angular-app App', () => {
  let page: BudgetmeAngularAppPage;

  beforeEach(() => {
    page = new BudgetmeAngularAppPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!!');
  });
});
