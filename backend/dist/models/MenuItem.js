import mongoose, { Schema } from 'mongoose';
const menuItemSchema = new Schema({
    name: { type: String, required: true },
    category: { type: String, enum: ['main', 'beverage', 'snack'], required: true },
    price: { type: Number, required: true },
    image: { type: String, required: true },
    prepTime: { type: Number, required: true },
    description: { type: String, required: true },
});
export const MenuItem = mongoose.model('MenuItem', menuItemSchema);
//# sourceMappingURL=MenuItem.js.map