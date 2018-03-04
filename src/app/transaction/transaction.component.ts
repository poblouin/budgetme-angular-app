import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { MatTableDataSource, MatSort, MatDialog } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';

import { ISubscription } from 'rxjs/Subscription';

import { TransactionService, DashService } from 'app/core';
import { Transaction } from 'app/core/models/transaction';
import { TransactionDialogComponent, BudgetPeriod } from 'app/shared';


@Component({
    selector: 'transaction-management',
    templateUrl: './transaction.component.html'
})
export class TransactionManagementComponent implements OnInit, OnDestroy {
    private transactionSub: ISubscription;
    private hoverRow: Transaction;

    @ViewChild(MatSort) public sort: MatSort;
    public displayedColumns = ['id', 'date', 'amount', 'description', 'category', 'budget'];
    public dataSource = new MatTableDataSource<Transaction>();
    public transactionTotalFormatted = '0.00 $';
    public selection = new SelectionModel<Transaction>(false, undefined);

    constructor(
        private transactionService: TransactionService,
        private dashService: DashService,
        public dialog: MatDialog
    ) { }

    ngOnInit(): void {
        this.transactionSub = this.transactionService.transactions.subscribe(
            transactionMap => {
                const transactionElements = new Array<Transaction>();
                let transactionTotal = 0;

                transactionMap.forEach((transactions, k) => {
                    transactions.forEach(
                        t => {
                            transactionTotal += t.amount;
                            transactionElements.push(t);
                        }
                    );
                });
                this.dataSource = new MatTableDataSource(transactionElements);
                this.ngAfterViewInit();
                this.transactionTotalFormatted = `${transactionTotal.toFixed(2)} $`;
            }
        );
    }

    // tslint:disable-next-line:use-life-cycle-interface
    ngAfterViewInit(): void {
        this.dataSource.sort = this.sort;
    }

    ngOnDestroy(): void {
        this.transactionSub.unsubscribe();
    }

    onMouseEnter(row): void {
        this.hoverRow = row;
    }

    onMouseLeave(row): void {
        this.hoverRow = undefined;
    }

    isRowHover(row): boolean {
        return this.hoverRow !== undefined && row.id === this.hoverRow.id;
    }

    createTransactionDialog(): void {
        const budgetPeriod: BudgetPeriod = this.dashService.getBudgetPeriod();
        this.dialog.open(TransactionDialogComponent, {
            width: 'auto',
            data: {
                periodStart: budgetPeriod.periodStart,
                periodEnd: budgetPeriod.periodEnd,
                transaction: this.hoverRow
            },
            disableClose: true
        });
    }

}
