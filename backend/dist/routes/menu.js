import { Router } from 'express';
import { findMenuItems } from '../models/MenuItem.js';
const router = Router();
// GET /api/menu
router.get('/', async (_req, res) => {
    try {
        const items = await findMenuItems();
        res.json(items);
    }
    catch (err) {
        console.error('Menu fetch error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// GET /api/menu/:category
router.get('/:category', async (req, res) => {
    try {
        const category = String(req.params.category);
        if (!['main', 'beverage', 'snack'].includes(category)) {
            res.status(400).json({ error: 'Invalid category' });
            return;
        }
        const items = await findMenuItems(category);
        res.json(items);
    }
    catch (err) {
        console.error('Menu category fetch error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
export default router;
//# sourceMappingURL=menu.js.map