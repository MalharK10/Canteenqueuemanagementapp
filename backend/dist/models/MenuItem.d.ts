import mongoose, { Document } from 'mongoose';
export interface IMenuItem extends Document {
    name: string;
    category: 'main' | 'beverage' | 'snack';
    price: number;
    image: string;
    prepTime: number;
    description: string;
}
export declare const MenuItem: mongoose.Model<IMenuItem, {}, {}, {}, mongoose.Document<unknown, {}, IMenuItem, {}, {}> & IMenuItem & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=MenuItem.d.ts.map