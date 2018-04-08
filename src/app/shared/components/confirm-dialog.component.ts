import { Component, Inject } from '@angular/core';

import { MAT_DIALOG_DATA } from '@angular/material';
import { MatDialogRef } from '@angular/material/dialog';


@Component({
    selector: 'confirm-dialog',
    templateUrl: 'confirm-dialog.component.html',
})
export class ConfirmDialogComponent {
    public title: string;
    public content: string;

    constructor(
        @Inject(MAT_DIALOG_DATA) private data: any,
        private dialogRef: MatDialogRef<ConfirmDialogComponent>,
    ) {
        this.title = 'title' in data ? this.data.title : 'Are you really sure?';
        this.content = this.data.content;
    }

    confirm(): void {
        this.dialogRef.close(true);
    }

}
