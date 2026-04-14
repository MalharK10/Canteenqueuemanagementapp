import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
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
  ChefHat,
  Package,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { apiUrl } from '@/app/lib/api';

interface MenuItemData {
  _id: string;
  name: string;
  category: 'main' | 'beverage' | 'snack';
  price: number;
  image: string;
  prepTime: number;
  description: string;
}

interface OrderData {
  _id: string;
  userId: { _id: string; username: string; displayName?: string } | string;
  queueNumber: number;
  items: string[];
  status: 'pending' | 'preparing' | 'ready' | 'completed';
  totalPrice: number;
  estimatedTime: number;
  createdAt: string;
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
  const [activeTab, setActiveTab] = useState('orders');

  // Order management state
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch(apiUrl('/api/admin/orders'), { credentials: 'include' });
      if (res.ok) {
        const data = (await res.json()) as OrderData[];
        setOrders(data);
      }
    } catch {
      // silently fail
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  // Poll orders every 5 seconds when on orders tab
  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(apiUrl(`/api/admin/orders/${orderId}/status`), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        const updated = (await res.json()) as OrderData;
        setOrders(prev => prev.map(o => o._id === updated._id ? updated : o));
      }
    } catch {
      // silently fail
    }
  };

  const fetchItems = async () => {
    try {
      const res = await fetch(apiUrl('/api/admin/menu'), { credentials: 'include' });
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
        ? apiUrl(`/api/admin/menu/${editingItem._id}`)
        : apiUrl('/api/admin/menu');

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
      await fetch(apiUrl(`/api/admin/menu/${id}`), {
        method: 'DELETE',
        credentials: 'include',
      });
      fetchItems();
    } catch {
      // silently fail
    }
  };

  const handleLogout = async () => {
    await fetch(apiUrl('/api/admin/logout'), {
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/30"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'preparing': return <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/30"><ChefHat className="w-3 h-3 mr-1" />Preparing</Badge>;
      case 'ready': return <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30"><Package className="w-3 h-3 mr-1" />Ready</Badge>;
      case 'completed': return <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30"><CheckCircle2 className="w-3 h-3 mr-1" />Completed</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getNextStatus = (status: string): string | null => {
    switch (status) {
      case 'pending': return 'preparing';
      case 'preparing': return 'ready';
      case 'ready': return 'completed';
      default: return null;
    }
  };

  const getNextStatusLabel = (status: string): string => {
    switch (status) {
      case 'pending': return 'Start Preparing';
      case 'preparing': return 'Mark Ready';
      case 'ready': return 'Mark Completed';
      default: return '';
    }
  };

  const getUserName = (order: OrderData): string => {
    if (typeof order.userId === 'object' && order.userId) {
      return order.userId.displayName || order.userId.username;
    }
    return 'Unknown';
  };

  const activeOrders = orders.filter(o => o.status !== 'completed');
  const completedOrders = orders.filter(o => o.status === 'completed');

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
              <p className="text-sm text-muted-foreground">Manage orders & menu</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="orders">
              Orders
              {activeOrders.length > 0 && (
                <Badge className="ml-2 h-5 px-1.5 bg-destructive text-destructive-foreground">{activeOrders.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="menu">Menu Items</TabsTrigger>
          </TabsList>

          {/* ─── ORDERS TAB ─── */}
          <TabsContent value="orders">
            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="text-3xl font-bold text-yellow-600">{orders.filter(o => o.status === 'pending').length}</div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="text-3xl font-bold text-blue-600">{orders.filter(o => o.status === 'preparing').length}</div>
                  <p className="text-sm text-muted-foreground">Preparing</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="text-3xl font-bold text-green-600">{orders.filter(o => o.status === 'ready').length}</div>
                  <p className="text-sm text-muted-foreground">Ready</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="text-3xl font-bold text-primary">{completedOrders.length}</div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                </CardContent>
              </Card>
            </div>

            {/* Active orders */}
            <h2 className="text-xl font-semibold mb-4">Active Queue</h2>
            {ordersLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : activeOrders.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No active orders. All caught up!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {activeOrders.map((order) => {
                  const nextStatus = getNextStatus(order.status);
                  return (
                    <Card key={order._id} className="relative">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">
                            #{order.queueNumber.toString().padStart(3, '0')}
                          </CardTitle>
                          {getStatusBadge(order.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">{getUserName(order)}</p>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <ul className="space-y-1">
                          {order.items.map((item, i) => (
                            <li key={i} className="text-sm flex items-center gap-2">
                              <div className="w-1 h-1 rounded-full bg-primary" />
                              {item}
                            </li>
                          ))}
                        </ul>
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <span>${order.totalPrice.toFixed(2)}</span>
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{order.estimatedTime}m</span>
                        </div>
                        {nextStatus && (
                          <Button
                            className="w-full"
                            size="sm"
                            onClick={() => updateOrderStatus(order._id, nextStatus)}
                          >
                            {getNextStatusLabel(order.status)}
                            <ArrowRight className="w-4 h-4 ml-1" />
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            {/* Completed orders */}
            {completedOrders.length > 0 && (
              <>
                <h2 className="text-xl font-semibold mb-4 mt-8">Completed Today</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {completedOrders.slice(0, 12).map((order) => (
                    <Card key={order._id} className="opacity-70">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">
                            #{order.queueNumber.toString().padStart(3, '0')}
                          </CardTitle>
                          {getStatusBadge(order.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">{getUserName(order)}</p>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-1">
                          {order.items.map((item, i) => (
                            <li key={i} className="text-sm flex items-center gap-2">
                              <div className="w-1 h-1 rounded-full bg-muted-foreground" />
                              {item}
                            </li>
                          ))}
                        </ul>
                        <p className="text-sm text-muted-foreground mt-2">${order.totalPrice.toFixed(2)}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </TabsContent>

          {/* ─── MENU TAB ─── */}
          <TabsContent value="menu">
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
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
