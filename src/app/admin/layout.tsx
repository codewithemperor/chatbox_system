'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Brain, Menu, X, LogOut, Settings, BookOpen, Trophy, FileText, Plus, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Admin {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface DashboardStats {
  totalTopics: number;
  totalNotes: number;
  totalQuizzes: number;
  totalFaqs: number;
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalTopics: 0,
    totalNotes: 0,
    totalQuizzes: 0,
    totalFaqs: 0,
  });
  const [isClient, setIsClient] = useState(false);
  const [currentPath, setCurrentPath] = useState('');
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
    setCurrentPath(window.location.pathname);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    // Don't check authentication on login page
    if (currentPath === '/admin/login') {
      return;
    }

    // Check if admin is logged in
    const token = localStorage.getItem('adminToken');
    const adminData = localStorage.getItem('admin');
    
    if (!token || !adminData) {
      router.push('/admin/login');
      return;
    }

    try {
      setAdmin(JSON.parse(adminData));
    } catch (error) {
      console.error('Failed to parse admin data:', error);
      router.push('/admin/login');
      return;
    }

    // Fetch dashboard stats
    fetchStats();
  }, [router, isClient, currentPath]);

  const fetchStats = async () => {
    if (!isClient) return;

    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        console.error('No admin token found');
        router.push('/admin/login');
        return;
      }

      const response = await fetch('/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else if (response.status === 401) {
        console.error('Unauthorized - redirecting to login');
        router.push('/admin/login');
      } else {
        console.error('Failed to fetch stats:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleLogout = () => {
    if (isClient) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('admin');
    }
    router.push('/admin/login');
  };

  const navigationItems = [
    { href: '/admin', label: 'Dashboard', icon: Brain },
    { href: '/admin/topics', label: 'Topics', icon: BookOpen },
    { href: '/admin/notes', label: 'Notes', icon: FileText },
    { href: '/admin/quizzes', label: 'Quizzes', icon: Trophy },
    { href: '/admin/faqs', label: 'FAQs', icon: Settings },
  ];

  if (!isClient) {
    // Don't show admin layout on login page
    if (currentPath === '/admin/login') {
      return children;
    }
    
    return (
      <div className="flex h-screen bg-background items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  // Don't show admin layout on login page
  if (currentPath === '/admin/login') {
    return children;
  }

  if (!admin) {
    return (
      <div className="flex h-screen bg-background items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 shadow-2xl transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg">
                  <Brain className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="font-semibold text-white">Admin Panel</h2>
                  <p className="text-xs text-purple-200">COM1111 Management</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSidebarOpen(false)}
                className="lg:hidden hover:bg-white/10 text-white"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-2">
              {navigationItems.map((item) => (
                <Button
                  key={item.href}
                  variant="ghost"
                  className="w-full justify-start text-purple-100 hover:bg-white/10 hover:text-white transition-all duration-200"
                  onClick={() => {
                    router.push(item.href);
                    setIsSidebarOpen(false);
                  }}
                >
                  <item.icon className="h-4 w-4 mr-3" />
                  {item.label}
                </Button>
              ))}
            </div>
          </ScrollArea>

          <div className="p-4 border-t border-white/10">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                  <span className="text-white text-sm font-bold">
                    {admin?.name.charAt(0).toUpperCase() || 'Admin'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{admin.name}</p>
                  <p className="text-xs text-purple-200 truncate">{admin.email}</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full border-white/20 text-purple-100 hover:bg-white/10 hover:text-white hover:border-white/30 transition-all duration-200"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 w-full lg:w-auto">
        {/* Header */}
        <header className="border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 flex-shrink-0">
          <div className="flex items-center justify-between p-4 min-w-0">
            <div className="flex items-center gap-3 min-w-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden flex-shrink-0"
              >
                <Menu className="h-4 w-4" />
              </Button>
              <div className="min-w-0">
                <h1 className="text-lg font-semibold truncate">Admin Dashboard</h1>
                <p className="text-xs text-muted-foreground">
                  Manage COM1111 Content
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 flex-shrink-0">
              <Badge variant="secondary" className="hidden sm:inline-flex">
                {admin.role}
              </Badge>
              <div className="text-xs text-muted-foreground hidden md:block">
                Topics: {stats.totalTopics} | Notes: {stats.totalNotes} | Quizzes: {stats.totalQuizzes} | FAQs: {stats.totalFaqs}
              </div>
              <div className="text-xs text-muted-foreground md:hidden">
                {stats.totalTopics + stats.totalNotes + stats.totalQuizzes + stats.totalFaqs} items
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 w-full min-w-0">
          <div className="w-full max-w-full">
            {children}
          </div>
        </main>
      </div>

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}