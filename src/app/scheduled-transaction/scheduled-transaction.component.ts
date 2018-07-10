import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { MatTableDataSource, MatSort, MatDialog } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';

import { SubscriptionLike as ISubscription } from 'rxjs';

import { ScheduledTransaction } from '../core/models/scheduled-transaction';
import { ScheduledTransactionDialogComponent } from 'app/scheduled-transaction/scheduled-transaction-dialog.component';
import { ScheduledTransactionService } from 'app/core/services';


@Component({
    selector: 'scheduled-transaction',
    templateUrl: './scheduled-transaction.component.html'
})
export class ScheduledTransactionComponent implements OnInit, OnDestroy {
    private scheduledTransactionSub: ISubscription;
    private hoverRow: ScheduledTransaction;

    @ViewChild(MatSort) public sort: MatSort;
    public displayedColumns = ['id', 'date', 'amount', 'description', 'frequency', 'category'];
    public dataSource = new MatTableDataSource<ScheduledTransaction>();
    public selection = new SelectionModel<ScheduledTransaction>(false, undefined);

    constructor(
        private scheduledTransactionService: ScheduledTransactionService,
        public dialog: MatDialog
    ) { }

    ngOnInit(): void {
        this.scheduledTransactionSub = this.scheduledTransactionService.scheduledTransactions.subscribe(
            scheduledTransactions => {
                this.dataSource = new MatTableDataSource(scheduledTransactions);
                this.ngAfterViewInit();
            }
        );
    }

    // tslint:disable-next-line:use-life-cycle-interface
    ngAfterViewInit(): void {
        this.dataSource.sort = this.sort;
    }

    ngOnDestroy(): void {
        this.scheduledTransactionSub.unsubscribe();
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

    createScheduledTransactionDialog(): void {
        this.dialog.open(ScheduledTransactionDialogComponent, {
            width: 'auto',
            data: {
                scheduledTransaction: this.hoverRow,
            },
            disableClose: true
        });
    }

}
