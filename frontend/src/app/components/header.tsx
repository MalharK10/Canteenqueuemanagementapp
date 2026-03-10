import { UtensilsCrossed, User, LogOut, UserCog } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/app/components/ui/dropdown-menu';

interface HeaderProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  queueInfo: {
    currentQueue: number;
    averageWaitTime: number;
  };
  userProfile?: {
    displayName: string;
    profilePicture: string;
    username: string;
  };
  onProfileClick?: () => void;
  onLogout?: () => void;
}

export function Header({ selectedCategory, onCategoryChange, queueInfo, userProfile, onProfileClick, onLogout }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <UtensilsCrossed className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl">Campus Canteen</h1>
                <p className="text-sm text-muted-foreground">Order ahead, skip the queue</p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-6 text-sm">
              <div className="text-center">
                <div className="text-2xl text-primary">{queueInfo.currentQueue}</div>
                <div className="text-muted-foreground">in queue</div>
              </div>
              <div className="text-center">
                <div className="text-2xl text-primary">{queueInfo.averageWaitTime}m</div>
                <div className="text-muted-foreground">avg wait</div>
              </div>
              {userProfile && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="ml-2 focus:outline-none focus:ring-2 focus:ring-primary rounded-full transition-transform hover:scale-105"
                    >
                      <Avatar className="w-10 h-10 border-2 border-primary/30">
                        <AvatarImage src={userProfile.profilePicture} alt={userProfile.displayName || userProfile.username} />
                        <AvatarFallback className="bg-primary/10 text-primary text-sm">
                          {(userProfile.displayName || userProfile.username || '?').slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <div className="px-2 py-1.5 text-sm font-medium">
                      {userProfile.displayName || userProfile.username}
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={onProfileClick}>
                      <UserCog className="w-4 h-4 mr-2" />
                      Edit Profile
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={onLogout} className="text-destructive focus:text-destructive">
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
          
          <Tabs value={selectedCategory} onValueChange={onCategoryChange} className="w-full">
            <TabsList className="w-full justify-start bg-secondary">
              <TabsTrigger value="all">All Items</TabsTrigger>
              <TabsTrigger value="main">Main Dishes</TabsTrigger>
              <TabsTrigger value="beverage">Beverages</TabsTrigger>
              <TabsTrigger value="snack">Snacks</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="sm:hidden flex items-center justify-around py-2 border-t">
            <div className="text-center">
              <div className="text-lg text-primary">{queueInfo.currentQueue}</div>
              <div className="text-xs text-muted-foreground">in queue</div>
            </div>
            <div className="text-center">
              <div className="text-lg text-primary">{queueInfo.averageWaitTime}m</div>
              <div className="text-xs text-muted-foreground">avg wait</div>
            </div>
            {userProfile && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="focus:outline-none focus:ring-2 focus:ring-primary rounded-full transition-transform hover:scale-105"
                  >
                    <Avatar className="w-9 h-9 border-2 border-primary/30">
                      <AvatarImage src={userProfile.profilePicture} alt={userProfile.displayName || userProfile.username} />
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {(userProfile.displayName || userProfile.username || '?').slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-2 py-1.5 text-sm font-medium">
                    {userProfile.displayName || userProfile.username}
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onProfileClick}>
                    <UserCog className="w-4 h-4 mr-2" />
                    Edit Profile
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onLogout} className="text-destructive focus:text-destructive">
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
