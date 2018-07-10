import { Component, OnInit, ViewChild, Input } from '@angular/core';

import { MatButton, MatDialog } from '@angular/material';
import { BudgetPeriod, TransactionDialogComponent } from 'app/shared';
import { DashService } from '../core/services/dash.service';
import { trigger, state, style, transition, animate, query } from '@angular/animations';
import { ScheduledTransactionDialogComponent } from 'app/scheduled-transaction/scheduled-transaction-dialog.component';

@Component({
    selector: 'fab-button',
    templateUrl: './fab-button.component.html',
    styleUrls: [ './fab-button.component.scss' ],
    animations: [
      trigger('spinInOut', [
        state('in', style({transform: 'rotate(0)', opacity: '1'})),
        transition(':enter', [
          style({transform: 'rotate(-180deg)', opacity: '0'}),
          animate('150ms ease')
        ]),
        transition(':leave', [
          animate('150ms ease', style({transform: 'rotate(180deg)', opacity: '0'}))
        ]),
      ]),
      trigger('preventInitialAnimation', [
        transition(':enter', [
          query(':enter', [], {optional: true})
        ]),
      ]),
    ]
})
export class FabButtonComponent implements OnInit {
    @Input('dashService') private dashService: DashService;

    public actions = [
        { name: 'New Scheduled Transaction', icon: 'schedule', type: 'scheduled' },
        { name: 'New Transaction', icon: 'shopping_cart', type: '' },
      ];

    constructor(
        public dialog: MatDialog
    ) { }

    ngOnInit(): void { }

    createDialog(type: string): void {
        if (type === 'scheduled') {
            this.createScheduledTransactionDialog();
        } else {
            this.createTransactionDialog();
        }
    }

    private createTransactionDialog(): void {
        const budgetPeriod: BudgetPeriod = this.dashService.getBudgetPeriod();
        this.dialog.open(TransactionDialogComponent, {
            width: 'auto',
            data: { periodStart: budgetPeriod.periodStart, periodEnd: budgetPeriod.periodEnd },
            disableClose: true
        });
    }

    private createScheduledTransactionDialog(): void {
        this.dialog.open(ScheduledTransactionDialogComponent, {
            width: 'auto',
            data: {},
            disableClose: true
        });
    }

}
