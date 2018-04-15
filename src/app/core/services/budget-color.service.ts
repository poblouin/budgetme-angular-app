import { Injectable, OnDestroy } from '@angular/core';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { ISubscription } from 'rxjs/Subscription';

import * as _ from 'lodash';
import { BudgetService } from './budget.service';
import { Budget } from '../models/budget';

// Material Palette Colors.
// TODO: Generate this considering the number of budget or limit number of budget.
const BUDGET_COLORS = [
    { color: '#FF5722', name: 'Deep Orange' },
    { color: '#3F51B5', name: 'Indigo' },
    { color: '#2196F3', name: 'Blue' },
    { color: '#F44336', name: 'Red' },
    { color: '#FFEB3B', name: 'Yellow' },
    { color: '#E91E63', name: 'Pink' },
    { color: '#673AB7', name: 'Deep purple' },
    { color: '#03A9F4', name: 'Light Blue' },
    { color: '#FFC107', name: 'Amber' },
    { color: '#009688', name: 'Teal' },
    { color: '#4CAF50', name: 'Green' },
    { color: '#8BC34A', name: 'Light Green' },
    { color: '#CDDC39', name: 'Lime' },
    { color: '#9C27B0', name: 'Purple' },
    { color: '#FF9800', name: 'Orange' },
    { color: '#00BCD4', name: 'Cyan' },
    { color: '#795548', name: 'Brown' },
];

@Injectable()
export class BudgetColorService implements OnDestroy {
    private budgetSub: ISubscription;
    private budgets: Array<Budget>;
    private budgetColors = new Map<string, string>(); // color, budgetName
    private remainingColors = Array.from(BUDGET_COLORS);
    private _remainingColorSubject = new BehaviorSubject<Array<any>>([]);

    public readonly remainingColorsObs = this._remainingColorSubject.asObservable();

    constructor(private budgetService: BudgetService) {
        this.budgetSub = this.budgetService.budgets.subscribe(
            budgets => {
                this.budgets = budgets;
                this.remainingColors = Array.from(BUDGET_COLORS);
                this.assignColors();
            }
        );
    }

    ngOnDestroy(): void {
        this.budgetSub.unsubscribe();
    }

    getChartColors(budgetNames: Array<string>): any {
        const colors = new Array<string>();
        budgetNames.forEach(name => {
            colors.push(this.budgetColors.get(name));
        });
        return [{ backgroundColor: colors }];
    }

    private assignColors(): void {
        const colorMap = new Map<string, string>();
        this.budgets.forEach(budget => {
            let colorIndex = -1;
            if (budget.colorDisplay) {
                colorIndex = this.remainingColors.findIndex(c => c.color === budget.colorDisplay);
            }

            if (colorIndex === -1) {
                const color = this.remainingColors.pop().color;
                colorMap.set(budget.name, color);
            } else {
                colorMap.set(budget.name, budget.colorDisplay);
                this.remainingColors.splice(colorIndex, 1);
            }
        });
        this.budgetColors = colorMap;

        //  TODO: Show or not selected color... Figure out.
        // this._remainingColorSubject.next(this.remainingColors);
        this._remainingColorSubject.next(Array.from(BUDGET_COLORS));
    }

}
