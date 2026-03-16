import mongoose, { Schema } from 'mongoose';
const orderSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    queueNumber: { type: Number, required: true },
    items: [{ type: String }],
    status: { type: String, enum: ['pending', 'preparing', 'ready', 'completed'], default: 'pending' },
    totalPrice: { type: Number, required: true },
    estimatedTime: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now },
});
export const Order = mongoose.model('Order', orderSchema);
//# sourceMappingURL=Order.js.map