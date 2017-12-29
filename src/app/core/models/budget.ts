export class Budget {
    id: number;
    name: string;
    weekly_amount: number;

    constructor(json: any) {
        this.id = json.id;
        this.name = json.name;
        this.weekly_amount = Number(json.weekly_amount);
    }
}
