import { useState, useEffect, useRef } from 'react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/app/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/app/components/ui/alert-dialog';
import {
  Shield,
  Plus,
  Pencil,
  Trash2,
  ImagePlus,
  Loader2,
  LogOut,
  UtensilsCrossed,
  Clock,
} from 'lucide-react';

interface MenuItemData {
  _id: string;
  name: string;
  category: 'main' | 'beverage' | 'snack';
  price: number;
  image: string;
  prepTime: number;
  description: string;
}

interface AdminDashboardProps {
  onLogout: () => void;
}

const EMPTY_FORM = {
  name: '',
  category: 'main' as 'main' | 'beverage' | 'snack',
  price: '',
  prepTime: '',
  description: '',
};

export function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [items, setItems] = useState<MenuItemData[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItemData | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchItems = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/admin/menu', { credentials: 'include' });
      if (res.ok) {
        const data = (await res.json()) as MenuItemData[];
        setItems(data);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const openCreate = () => {
    setEditingItem(null);
    setForm(EMPTY_FORM);
    setImageFile(null);
    setImagePreview('');
    setError('');
    setDialogOpen(true);
  };

  const openEdit = (item: MenuItemData) => {
    setEditingItem(item);
    setForm({
      name: item.name,
      category: item.category,
      price: item.price.toString(),
      prepTime: item.prepTime.toString(),
      description: item.description,
    });
    setImageFile(null);
    setImagePreview(item.image);
    setError('');
    setDialogOpen(true);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be smaller than 5 MB.');
      return;
    }
    setError('');
    setImageFile(file);
    if (imagePreview && imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    setError('');

    if (!form.name || !form.category || !form.price || !form.prepTime || !form.description) {
      setError('All fields are required.');
      return;
    }

    if (!editingItem && !imageFile) {
      setError('Please select an image for the menu item.');
      return;
    }

    setSaving(true);

    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('category', form.category);
      formData.append('price', form.price);
      formData.append('prepTime', form.prepTime);
      formData.append('description', form.description);
      if (imageFile) {
        formData.append('image', imageFile);
      }

      const url = editingItem
        ? `http://localhost:5000/api/admin/menu/${editingItem._id}`
        : 'http://localhost:5000/api/admin/menu';

      const res = await fetch(url, {
        method: editingItem ? 'PUT' : 'POST',
        credentials: 'include',
        body: formData,
      });

      const data = (await res.json()) as MenuItemData & { error?: string };
      if (!res.ok) {
        setError(data.error ?? 'Failed to save menu item.');
      } else {
        setDialogOpen(false);
        fetchItems();
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`http://localhost:5000/api/admin/menu/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      fetchItems();
    } catch {
      // silently fail
    }
  };

  const handleLogout = async () => {
    await fetch('http://localhost:5000/api/admin/logout', {
      method: 'POST',
      credentials: 'include',
    });
    onLogout();
  };

  const categoryLabel = (cat: string) => {
    switch (cat) {
      case 'main': return 'Main Dish';
      case 'beverage': return 'Beverage';
      case 'snack': return 'Snack';
      default: return cat;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-destructive flex items-center justify-center">
              <Shield className="w-6 h-6 text-destructive-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground">Manage canteen menu</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-primary">{items.length}</div>
              <p className="text-sm text-muted-foreground">Total Items</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-primary">
                {items.filter(i => i.category === 'main').length}
              </div>
              <p className="text-sm text-muted-foreground">Main Dishes</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-primary">
                {items.filter(i => i.category === 'beverage').length + items.filter(i => i.category === 'snack').length}
              </div>
              <p className="text-sm text-muted-foreground">Beverages & Snacks</p>
            </CardContent>
          </Card>
        </div>

        {/* Actions bar */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">Menu Items</h2>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreate}>
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingItem ? 'Edit Menu Item' : 'Add Menu Item'}</DialogTitle>
                <DialogDescription>
                  {editingItem ? 'Update the details below.' : 'Fill in the details to add a new menu item.'}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 pt-2">
                {error && (
                  <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                    {error}
                  </div>
                )}

                {/* Image upload */}
                <div className="space-y-2">
                  <Label>Image</Label>
                  <div
                    className="relative border-2 border-dashed border-input rounded-lg p-4 text-center cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() => fileRef.current?.click()}
                  >
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-md"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground">
                        <ImagePlus className="w-10 h-10" />
                        <span className="text-sm">Click to upload image</span>
                      </div>
                    )}
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageSelect}
                    />
                  </div>
                </div>

                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="item-name">Name</Label>
                  <Input
                    id="item-name"
                    placeholder="e.g. Classic Burger"
                    value={form.name}
                    onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                  />
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={form.category}
                    onValueChange={(v) => setForm(f => ({ ...f, category: v as 'main' | 'beverage' | 'snack' }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="main">Main Dish</SelectItem>
                      <SelectItem value="beverage">Beverage</SelectItem>
                      <SelectItem value="snack">Snack</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Price & Prep time */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="item-price">Price ($)</Label>
                    <Input
                      id="item-price"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="5.99"
                      value={form.price}
                      onChange={(e) => setForm(f => ({ ...f, price: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="item-preptime">Prep Time (mins)</Label>
                    <Input
                      id="item-preptime"
                      type="number"
                      min="1"
                      placeholder="8"
                      value={form.prepTime}
                      onChange={(e) => setForm(f => ({ ...f, prepTime: e.target.value }))}
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="item-desc">Description</Label>
                  <Textarea
                    id="item-desc"
                    placeholder="A short description..."
                    rows={3}
                    value={form.description}
                    onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                  />
                </div>

                <Button
                  className="w-full"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : editingItem ? (
                    'Update Item'
                  ) : (
                    'Add Item'
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Items list */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-12">
            <UtensilsCrossed className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No menu items yet. Add your first item!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((item) => (
              <Card key={item._id} className="overflow-hidden group">
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                  <Badge className="absolute top-2 right-2 bg-secondary text-secondary-foreground">
                    {categoryLabel(item.category)}
                  </Badge>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-1">{item.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{item.description}</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-lg font-bold text-primary">${item.price.toFixed(2)}</span>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{item.prepTime}m</span>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => openEdit(item)}
                    >
                      <Pencil className="w-3.5 h-3.5 mr-1" />
                      Edit
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm" className="flex-1">
                          <Trash2 className="w-3.5 h-3.5 mr-1" />
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete &quot;{item.name}&quot;?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently remove this item and its image. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(item._id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
