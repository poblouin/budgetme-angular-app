import { ScheduledTransactionModule } from './scheduled-transaction.module';

describe('ScheduledTransactionModule', () => {
  let scheduledTransactionModule: ScheduledTransactionModule;

  beforeEach(() => {
    scheduledTransactionModule = new ScheduledTransactionModule();
  });

  it('should create an instance', () => {
    expect(scheduledTransactionModule).toBeTruthy();
  });
});
