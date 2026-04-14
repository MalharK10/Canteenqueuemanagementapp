export type MenuCategory = 'main' | 'beverage' | 'snack';
export interface IMenuItem {
    _id: string;
    id: string;
    name: string;
    category: MenuCategory;
    price: number;
    image: string;
    prepTime: number;
    description: string;
}
export declare function findMenuItems(category?: MenuCategory): Promise<IMenuItem[]>;
export declare function findMenuItemById(id: string): Promise<IMenuItem | null>;
export declare function createMenuItem(input: Omit<IMenuItem, '_id' | 'id'>): Promise<IMenuItem>;
export declare function updateMenuItem(id: string, input: Partial<Omit<IMenuItem, '_id' | 'id'>>): Promise<IMenuItem | null>;
export declare function deleteMenuItem(id: string): Promise<boolean>;
export declare function countMenuItems(): Promise<number>;
export declare function insertManyMenuItems(items: Array<Omit<IMenuItem, '_id' | 'id'>>): Promise<void>;
//# sourceMappingURL=MenuItem.d.ts.map