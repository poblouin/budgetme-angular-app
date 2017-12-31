export class TransactionCategory {
    id: number;
    name: string;

    constructor(jsonObj: any) {
        this.id = jsonObj.id;
        this.name = jsonObj.name;
    }
}
