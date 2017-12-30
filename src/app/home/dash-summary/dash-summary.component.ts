import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'dash-summary',
    templateUrl: './dash-summary.component.html'
})
export class DashSummaryComponent implements OnInit {
    // Doughnut
    public doughnutChartLabels: string[] = ['Download Sales', 'In-Store Sales', 'Mail-Order Sales'];
    public doughnutChartData: number[] = [350, 450, 100];
    public doughnutChartType: string = 'doughnut';

    constructor() { }

    ngOnInit() { }

    // events
    public chartClicked(e: any): void {
        console.log(e);
    }

    public chartHovered(e: any): void {
        console.log(e);
    }
}
