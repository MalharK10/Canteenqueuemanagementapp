import mongoose, { Document } from 'mongoose';
export interface IOrder extends Document {
    userId: mongoose.Types.ObjectId;
    queueNumber: number;
    items: string[];
    status: 'pending' | 'preparing' | 'ready' | 'completed';
    totalPrice: number;
    estimatedTime: number;
    createdAt: Date;
}
export declare const Order: mongoose.Model<IOrder, {}, {}, {}, mongoose.Document<unknown, {}, IOrder, {}, {}> & IOrder & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Order.d.ts.map