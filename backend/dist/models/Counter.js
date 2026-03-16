import mongoose, { Schema } from 'mongoose';
const counterSchema = new Schema({
    name: { type: String, required: true, unique: true },
    seq: { type: Number, default: 0 },
});
export const Counter = mongoose.model('Counter', counterSchema);
export async function getNextQueueNumber() {
    const counter = await Counter.findOneAndUpdate({ name: 'queueNumber' }, { $inc: { seq: 1 } }, { new: true, upsert: true });
    return counter.seq;
}
//# sourceMappingURL=Counter.js.map