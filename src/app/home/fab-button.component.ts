import { Component, OnInit, ViewChild, Input } from '@angular/core';

import { MatButton, MatDialog } from '@angular/material';
import { BudgetPeriod, TransactionDialogComponent } from 'app/shared';
import { DashService } from '../core/services/dash.service';

@Component({
    selector: 'fab-button',
    templateUrl: './fab-button.component.html'
})
export class FabButtonComponent implements OnInit {
    @ViewChild('fabButton') private fabButton: MatButton;
    @Input('dashService') private dashService: DashService;

    constructor(
        public dialog: MatDialog
    ) { }

    ngOnInit(): void { }

    createTransactionDialog(): void {
        const budgetPeriod: BudgetPeriod = this.dashService.getBudgetPeriod();
        const matDialogRef = this.dialog.open(TransactionDialogComponent, {
            width: 'auto',
            data: { periodStart: budgetPeriod.periodStart, periodEnd: budgetPeriod.periodEnd },
            disableClose: true
        });

        // Little hack, otherwise the button stays focused.
        matDialogRef.afterClosed().subscribe(() => {
            this.fabButton._elementRef.nativeElement.classList.remove('cdk-focused');
            this.fabButton._elementRef.nativeElement.classList.remove('cdk-program-focused');
            this.fabButton._elementRef.nativeElement.classList.add('cdk-mouse-focused');
        });
    }

}
