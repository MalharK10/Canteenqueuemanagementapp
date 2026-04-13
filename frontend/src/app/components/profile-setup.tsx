import { useState, useRef } from 'react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar';
import { Camera, Loader2, User } from 'lucide-react';

interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  bio: string;
  profilePicture: string;
  profileCompleted: boolean;
}

interface ProfileSetupProps {
  user: UserProfile;
  onComplete: (updatedUser: UserProfile) => void;
}

export function ProfileSetup({ user, onComplete }: ProfileSetupProps) {
  const [displayName, setDisplayName] = useState(user.displayName || '');
  const [bio, setBio] = useState(user.bio || '');
  const [previewUrl, setPreviewUrl] = useState(user.profilePicture || '');
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePictureSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
    const blobUrl = URL.createObjectURL(file);
    setPreviewUrl(blobUrl);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('profilePicture', file);

      const res = await fetch('http://localhost:3000/api/profile/picture', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      
      const data = (await res.json()) as { profilePicture?: string; error?: string };
      console.log('Upload response:', data);
      if (!res.ok) {
        setError(data.error ?? 'Failed to upload image.');
        setPreviewUrl(user.profilePicture || '');
      } else {
        setPreviewUrl(data.profilePicture ?? '');
      }
      URL.revokeObjectURL(blobUrl);
    } catch {
      setError('Network error uploading image.');
      setPreviewUrl(user.profilePicture || '');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSaving(true);

    try {
      const res = await fetch('http://localhost:3000/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ displayName, bio }),
      });

      const data = (await res.json()) as UserProfile & { error?: string };
      if (!res.ok) {
        setError(data.error ?? 'Failed to save profile.');
      } else {
        onComplete(data);
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const initials = (displayName || user.username || '?')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[100px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[100px] animate-pulse delay-1000" />

      <div className="z-10 w-full max-w-md">
        <Card className="border-border/50 shadow-2xl bg-card/80 backdrop-blur-xl transition-all duration-300">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Complete Your Profile
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Add a photo and tell us about yourself
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md animate-in fade-in slide-in-from-top-1">
                  {error}
                </div>
              )}

              {/* Profile picture upload */}
              <div className="flex flex-col items-center gap-3">
                <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  <Avatar className="w-24 h-24 border-4 border-primary/20 shadow-lg transition-transform group-hover:scale-105">
                    <AvatarImage src={previewUrl} alt="Profile" />
                    <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                      {previewUrl ? initials : <User className="w-10 h-10" />}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                    {isUploading ? (
                      <Loader2 className="w-8 h-8 text-white animate-spin" />
                    ) : (
                      <Camera className="w-8 h-8 text-white" />
                    )}
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePictureSelect}
                  disabled={isUploading}
                />
                <button
                  type="button"
                  className="text-sm text-primary hover:underline font-medium"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  {isUploading ? 'Uploading...' : 'Upload Photo'}
                </button>
              </div>

              {/* Display name */}
              <div className="space-y-2">
                <Label htmlFor="displayName" className="text-foreground/90 font-medium">
                  Display Name
                </Label>
                <Input
                  id="displayName"
                  type="text"
                  placeholder="How should we call you?"
                  className="bg-background/50 border-input hover:border-primary/50 focus:border-primary transition-colors"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  disabled={isSaving}
                />
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <Label htmlFor="bio" className="text-foreground/90 font-medium">
                  Bio <span className="text-muted-foreground font-normal">(optional)</span>
                </Label>
                <Textarea
                  id="bio"
                  placeholder="Tell us a bit about yourself..."
                  className="bg-background/50 border-input hover:border-primary/50 focus:border-primary transition-colors resize-none"
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  disabled={isSaving}
                />
              </div>

              <Button
                type="submit"
                className="w-full h-11 text-base font-semibold shadow-md hover:shadow-lg transition-all"
                disabled={isSaving || isUploading}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Continue to Menu'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
