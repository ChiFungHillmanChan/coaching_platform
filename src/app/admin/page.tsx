'use client'

import React, { useMemo, useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { Search, Sun, Moon, LogOut, Mail, Users, BarChart3, Send, Calendar, AlertCircle, Shield } from "lucide-react";

// ---- Theme helpers ---------------------------------------------------------
const useTheme = () => {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const root = document.documentElement;
    if (dark) root.classList.add("dark");
    else root.classList.remove("dark");
  }, [dark]);
  return { dark, setDark };
};

// ---- Types ----------------------------------------------------------------
interface Subscriber {
  email: string;
  subscribedAt: string;
  source?: string;
  isActive?: boolean;
}

interface Newsletter {
  id: string;
  sentAt: string;
  subject: string;
  contentTitle: string;
  recipientCount: number;
  successCount: number;
  failedCount: number;
}

interface Stats {
  totalActiveSubscribers: number;
  recentNewsletters: number;
  lastNewsletterSent: string | null;
}

type PageKey = "dashboard" | "users" | "newsletter";

// ---- Small UI primitives (cards, buttons, inputs) -------------------------
const Card: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ className = "", children }) => (
  <div className={`rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 ${className}`}>{children}</div>
);

const CardHeader: React.FC<React.PropsWithChildren<{ title?: string; icon?: React.ReactNode; action?: React.ReactNode }>> = ({ title, icon, action, children }) => (
  <div className="flex items-center justify-between p-4 sm:p-5 border-b border-gray-100 dark:border-gray-700">
    <div className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
      {icon && <span className="h-5 w-5">{icon}</span>}
      {title && <h3 className="font-semibold tracking-tight">{title}</h3>}
    </div>
    {action && <div>{action}</div>}
    {children}
  </div>
);

const CardContent: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ className = "", children }) => (
  <div className={`p-4 sm:p-6 ${className}`}>{children}</div>
);

const Button: React.FC<React.PropsWithChildren<{ onClick?: () => void; variant?: "solid" | "ghost" | "outline"; size?: "sm" | "md"; className?: string; disabled?: boolean; type?: "button" | "submit" }>> = ({ onClick, variant = "solid", size = "md", className = "", children, disabled, type = "button" }) => {
  const base = "rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 dark:focus:ring-gray-600 disabled:opacity-50";
  const variants = {
    solid: "bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900 hover:opacity-90",
    ghost: "bg-transparent text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700",
    outline: "border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700",
  } as const;
  const sizes = { sm: "px-3 py-1.5 text-sm", md: "px-4 py-2" } as const;
  return (
    <button onClick={onClick} disabled={disabled} type={type} className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}>{children}</button>
  );
};

const Input: React.FC<{
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
}> = ({ value, onChange, placeholder, type = "text", required }) => (
  <input
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    type={type}
    required={required}
    className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-600"
  />
);

const Textarea: React.FC<{
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  placeholder?: string;
}> = ({ value, onChange, rows = 8, placeholder }) => (
  <textarea
    value={value}
    onChange={(e) => onChange(e.target.value)}
    rows={rows}
    placeholder={placeholder}
    className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-600"
  />
);

// ---- Header ---------------------------------------------------------------
const Header: React.FC<{
  adminEmail: string;
  currentPage: string;
  onNavigate: (page: PageKey) => void;
  onLogout: () => void;
  dark: boolean;
  setDark: (v: boolean) => void;
}> = ({ adminEmail, currentPage, onNavigate, onLogout, dark, setDark }) => {
  const tabs: { key: PageKey; label: string }[] = [
    { key: "dashboard", label: "Dashboard" },
    { key: "users", label: "Users" },
    { key: "newsletter", label: "Newsletter" },
  ];
  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-200 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="font-semibold text-gray-900 dark:text-gray-100">AI Coaching Admin</span>
            <nav className="hidden md:flex items-center gap-2">
              {tabs.map((t) => (
                <button
                  key={t.key}
                  onClick={() => onNavigate(t.key)}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    currentPage === t.key
                      ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700"
                      : "text-gray-600 dark:text-gray-300 hover:bg-white/60 dark:hover:bg-gray-800/60"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center text-sm text-gray-600 dark:text-gray-300 mr-2">
              <Mail className="h-4 w-4 mr-1" /> {adminEmail}
            </div>
            <Button variant="ghost" onClick={() => setDark(!dark)} className="flex items-center gap-2">
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              <span className="hidden sm:inline">{dark ? "Light" : "Dark"}</span>
            </Button>
            <Button variant="outline" onClick={onLogout} className="flex items-center gap-2">
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
        {/* mobile tabs */}
        <nav className="md:hidden flex items-center gap-2 pb-3">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => onNavigate(t.key)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                currentPage === t.key
                  ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700"
                  : "text-gray-600 dark:text-gray-300 hover:bg-white/60 dark:hover:bg-gray-800/60"
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
};

// ---- Dashboard ------------------------------------------------------------
const Dashboard: React.FC<{ 
  stats: Stats; 
  monthlyData: Array<{ month: string; total: number; newlyAdded: number }> 
}> = ({ stats, monthlyData }) => {
  const current = monthlyData[monthlyData.length - 1]?.total ?? 0;
  const previous = monthlyData[monthlyData.length - 2]?.total ?? 0;
  const mom = previous === 0 ? 0 : ((current - previous) / previous) * 100;
  const newThisMonth = monthlyData[monthlyData.length - 1]?.newlyAdded ?? 0;

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader title="Total Subscribers" icon={<Users className="h-5 w-5" />} />
          <CardContent>
            <div className="text-3xl font-semibold text-gray-900 dark:text-gray-100">{stats.totalActiveSubscribers}</div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">active subscribers</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader title="MoM Change" icon={<BarChart3 className="h-5 w-5" />} />
          <CardContent>
            <div className={`text-3xl font-semibold ${mom >= 0 ? "text-emerald-600" : "text-rose-600"}`}>{mom.toFixed(1)}%</div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">compared to previous month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader title="New Subs (This Month)" icon={<Users className="h-5 w-5" />} />
          <CardContent>
            <div className="text-3xl font-semibold text-gray-900 dark:text-gray-100">{newThisMonth}</div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">joined this month</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader title="Total Subscribers by Month" />
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-gray-200 dark:text-gray-700" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="currentColor" className="text-gray-500 dark:text-gray-400" />
                <YAxis tick={{ fontSize: 12 }} stroke="currentColor" className="text-gray-500 dark:text-gray-400" />
                <Tooltip contentStyle={{ borderRadius: 12 }} />
                <Legend />
                <Line type="monotone" dataKey="total" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader title="New Subscriptions per Month" />
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-gray-200 dark:text-gray-700" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="currentColor" className="text-gray-500 dark:text-gray-400" />
                <YAxis tick={{ fontSize: 12 }} stroke="currentColor" className="text-gray-500 dark:text-gray-400" />
                <Tooltip contentStyle={{ borderRadius: 12 }} />
                <Legend />
                <Line type="monotone" dataKey="newlyAdded" name="new" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// ---- Users ----------------------------------------------------------------
const UsersPage: React.FC<{ 
  subscribers: Subscriber[]; 
  onToggleSubscription: (email: string) => void;
}> = ({ subscribers, onToggleSubscription }) => {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return subscribers.filter((u) => u.email.toLowerCase().includes(q));
  }, [query, subscribers]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageItems = filtered.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [totalPages, page]);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader title="User Directory" />
        <CardContent>
          <div className="flex items-center gap-3 mb-4">
            <div className="relative w-full max-w-md">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <div className="pl-10">
                <Input value={query} onChange={setQuery} placeholder="Search by email" />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600 dark:text-gray-300">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600 dark:text-gray-300">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600 dark:text-gray-300">Subscribed</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-600 dark:text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {pageItems.map((u, index) => (
                  <tr key={index}>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        u.isActive !== false
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                          : "bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300"
                      }`}>
                        {u.isActive !== false ? "active" : "canceled"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                      {new Date(u.subscribedAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="outline" size="sm" onClick={() => onToggleSubscription(u.email)}>
                        {u.isActive !== false ? "Unsubscribe" : "Re-activate"}
                      </Button>
                    </td>
                  </tr>
                ))}
                {pageItems.length === 0 && (
                  <tr>
                    <td className="px-4 py-6 text-sm text-gray-500 dark:text-gray-400 text-center" colSpan={4}>No users match the search.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-gray-600 dark:text-gray-300">Showing {pageItems.length} of {filtered.length}</p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setPage(1)} disabled={page === 1}>First</Button>
              <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>Prev</Button>
              <span className="text-sm text-gray-700 dark:text-gray-200">Page {page} / {totalPages}</span>
              <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next</Button>
              <Button variant="outline" size="sm" onClick={() => setPage(totalPages)} disabled={page === totalPages}>Last</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// ---- Newsletter -----------------------------------------------------------
const NewsletterPage: React.FC<{ 
  onSendNewsletter: (data: { subject: string; contentTitle: string; contentUrl: string }) => void;
  isSending: boolean;
  sendResult: string;
  subscriberCount: number;
}> = ({ onSendNewsletter, isSending, sendResult, subscriberCount }) => {
  const [subject, setSubject] = useState("");
  const [contentTitle, setContentTitle] = useState("");
  const [contentUrl, setContentUrl] = useState("");
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSendNewsletter({ subject, contentTitle, contentUrl });
  };

  // Generate preview HTML
  const previewHtml = `<!doctype html><html><head><meta charset='utf-8'><meta name='viewport' content='width=device-width,initial-scale=1'>
    <style>body{font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Ubuntu;line-height:1.6;margin:0;padding:24px;background:#f9fafb;color:#111827} .card{background:#ffffff;border-radius:16px;padding:24px;border:1px solid #e5e7eb} .footer{font-size:12px;color:#6b7280;margin-top:24px}</style>
  </head><body>
    <div class='card'>
      <h1 style='margin:8px 0 16px;color:#2563eb'>${subject || "Newsletter Subject"}</h1>
      <h2 style='margin:16px 0;color:#1f2937'>${contentTitle || "Content Title"}</h2>
      <p>Check out our latest update and learn something new today!</p>
      <p><a href='${contentUrl || "#"}' style='color:#2563eb;text-decoration:none;font-weight:500'>View Content →</a></p>
      <div class='footer'>You received this because you subscribed to AI Coaching updates. <a href='#'>Unsubscribe</a></div>
    </div>
  </body></html>`;

  const downloadPreview = () => {
    const blob = new Blob([previewHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "newsletter_preview.html";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader title="Compose Newsletter" />
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm mb-1 text-gray-700 dark:text-gray-200">Subject</label>
                <Input value={subject} onChange={setSubject} placeholder="Write an engaging subject" required />
              </div>
              <div>
                <label className="block text-sm mb-1 text-gray-700 dark:text-gray-200">Content Title</label>
                <Input value={contentTitle} onChange={setContentTitle} placeholder="Title of your content" required />
              </div>
              <div>
                <label className="block text-sm mb-1 text-gray-700 dark:text-gray-200">Content URL</label>
                <Input value={contentUrl} onChange={setContentUrl} placeholder="https://yoursite.com/new-content" required />
              </div>
              
              <div className="flex gap-2">
                <Button type="submit" disabled={isSending}>
                  {isSending ? 'Sending...' : `Send to ${subscriberCount} Subscribers`}
                </Button>
                <Button type="button" variant="outline" onClick={downloadPreview}>Download HTML Preview</Button>
              </div>
            </form>

            {sendResult && (
              <div className={`mt-4 p-3 rounded ${
                sendResult.includes('✅') 
                  ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300' 
                  : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300'
              }`}>
                {sendResult}
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader title="Preview" />
          <CardContent>
            <iframe title="preview" className="w-full h-[500px] rounded-xl border border-gray-200 dark:border-gray-700 bg-white" srcDoc={previewHtml} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// ---- Main App Component ---------------------------------------------------
export default function AdminPanel() {
  const { dark, setDark } = useTheme();
  const [page, setPage] = useState<PageKey>("dashboard");
  
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Admin data
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalActiveSubscribers: 0,
    recentNewsletters: 0,
    lastNewsletterSent: null
  });

  // Newsletter form state
  const [isSending, setIsSending] = useState(false);
  const [sendResult, setSendResult] = useState('');

  // Monthly data for charts
  const monthlyData = useMemo(() => {
    // Generate monthly data from subscriber history
    const monthCounts: { [key: string]: { total: number; newlyAdded: number } } = {};
    
    subscribers.forEach(sub => {
      const date = new Date(sub.subscribedAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthCounts[monthKey]) {
        monthCounts[monthKey] = { total: 0, newlyAdded: 0 };
      }
      monthCounts[monthKey].newlyAdded++;
    });

    // Convert to array and calculate running totals
    const months = Object.keys(monthCounts).sort();
    let runningTotal = 0;
    
    return months.map(month => {
      runningTotal += monthCounts[month].newlyAdded;
      return {
        month,
        total: runningTotal,
        newlyAdded: monthCounts[month].newlyAdded
      };
    });
  }, [subscribers]);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/admin/auth');
      if (response.ok) {
        const data = await response.json();
        setIsAuthenticated(data.isAuthenticated);
        if (data.isAuthenticated) {
          loadAdminData();
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Check authentication status
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  const loadAdminData = async () => {
    try {
      const response = await fetch('/api/admin/auth');
      if (response.ok) {
        const data = await response.json();
        setIsAuthenticated(data.isAuthenticated);
        if (data.isAuthenticated) {
          loadAdminData();
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    
    try {
      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      if (response.ok) {
        setIsAuthenticated(true);
        loadAdminData();
      } else {
        const data = await response.json();
        setLoginError(data.error || 'Login failed');
      }
    } catch (error) {
      setLoginError('Network error occurred');
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/admin/auth', { method: 'DELETE' });
      setIsAuthenticated(false);
      setEmail('');
      setPassword('');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const loadAdminData = async () => {
    try {
      // Load subscribers
      const subscribersResponse = await fetch('/api/admin/subscribers');
      if (subscribersResponse.ok) {
        const subscribersData = await subscribersResponse.json();
        setSubscribers(subscribersData.subscribers);
        setStats(subscribersData.stats);
      }

      // Load newsletters
      const newslettersResponse = await fetch('/api/send-newsletter');
      if (newslettersResponse.ok) {
        const newslettersData = await newslettersResponse.json();
        setNewsletters(newslettersData.newsletters);
      }
    } catch (error) {
      console.error('Failed to load admin data:', error);
    }
  };

  const sendNewsletter = async (data: { subject: string; contentTitle: string; contentUrl: string }) => {
    setIsSending(true);
    setSendResult('');

    try {
      const response = await fetch('/api/send-newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: data.subject,
          contentTitle: data.contentTitle,
          contentUrl: data.contentUrl,
          sections: [{
            title: data.contentTitle,
            content: `Check out our latest update: ${data.contentTitle}`,
            link: data.contentUrl
          }]
        })
      });

      const result = await response.json();
      
      if (response.ok) {
        setSendResult(`✅ Newsletter sent successfully to ${result.stats.successful} subscribers!`);
        loadAdminData(); // Refresh data
      } else {
        setSendResult(`❌ Error: ${result.error}`);
      }
    } catch (error) {
      setSendResult('❌ Network error occurred');
    } finally {
      setIsSending(false);
    }
  };

  const toggleSubscription = async (email: string) => {
    try {
      const response = await fetch('/api/subscribe', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      if (response.ok) {
        loadAdminData(); // Refresh data
      }
    } catch (error) {
      console.error('Failed to toggle subscription:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="text-center w-full">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Admin Login</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Enter your admin credentials to access the email management system.
              </p>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={login} className="space-y-4">
              <div>
                <Input
                  type="email"
                  placeholder="Admin email"
                  value={email}
                  onChange={setEmail}
                  required
                />
              </div>
              <div>
                <Input
                  type="password"
                  placeholder="Admin password"
                  value={password}
                  onChange={setPassword}
                  required
                />
              </div>
              
              {loginError && (
                <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 p-3 rounded">
                  <AlertCircle className="h-4 w-4" />
                  {loginError}
                </div>
              )}
              
              <Button type="submit" className="w-full">
                Login
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header 
        adminEmail={email} 
        currentPage={page} 
        onNavigate={setPage} 
        onLogout={logout}
        dark={dark} 
        setDark={setDark} 
      />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        {page === "dashboard" && <Dashboard stats={stats} monthlyData={monthlyData} />}
        {page === "users" && <UsersPage subscribers={subscribers} onToggleSubscription={toggleSubscription} />}
        {page === "newsletter" && (
          <NewsletterPage 
            onSendNewsletter={sendNewsletter}
            isSending={isSending}
            sendResult={sendResult}
            subscriberCount={stats.totalActiveSubscribers}
          />
        )}
      </main>

      <footer className="border-t border-gray-200 dark:border-gray-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 text-xs text-gray-500 dark:text-gray-400">
          © {new Date().getFullYear()} AI Coaching Admin. Powered by real data.
        </div>
      </footer>
    </div>
  );
}