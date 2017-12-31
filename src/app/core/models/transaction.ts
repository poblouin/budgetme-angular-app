export class Transaction {
    id: number;
    amount: number;
    date: string;
    description: string;

    constructor(jsonObj: any) {
        this.id = jsonObj.id;
        this.amount = Number(jsonObj.amount);
        this.date = jsonObj.date;
        this.description = jsonObj.description;
    }
}
