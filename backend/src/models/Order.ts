import mongoose, { Schema, Document } from 'mongoose';

export interface IOrder extends Document {
  userId: mongoose.Types.ObjectId;
  queueNumber: number;
  items: string[];
  status: 'pending' | 'preparing' | 'ready' | 'completed';
  totalPrice: number;
  estimatedTime: number;
  createdAt: Date;
}

const orderSchema = new Schema<IOrder>({
  userId:        { type: Schema.Types.ObjectId, ref: 'User', required: true },
  queueNumber:   { type: Number, required: true },
  items:         [{ type: String }],
  status:        { type: String, enum: ['pending', 'preparing', 'ready', 'completed'], default: 'pending' },
  totalPrice:    { type: Number, required: true },
  estimatedTime: { type: Number, required: true },
  createdAt:     { type: Date, default: Date.now },
});

export const Order = mongoose.model<IOrder>('Order', orderSchema);
