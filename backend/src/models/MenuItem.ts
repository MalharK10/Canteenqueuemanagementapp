import mongoose, { Schema, Document } from 'mongoose';

export interface IMenuItem extends Document {
  name: string;
  category: 'main' | 'beverage' | 'snack';
  price: number;
  image: string;
  prepTime: number;
  description: string;
}

const menuItemSchema = new Schema<IMenuItem>({
  name:        { type: String, required: true },
  category:    { type: String, enum: ['main', 'beverage', 'snack'], required: true },
  price:       { type: Number, required: true },
  image:       { type: String, required: true },
  prepTime:    { type: Number, required: true },
  description: { type: String, required: true },
});

export const MenuItem = mongoose.model<IMenuItem>('MenuItem', menuItemSchema);
