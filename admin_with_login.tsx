import React, { useMemo, useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { Search, Sun, Moon, LogOut, Mail, Users, BarChart3, Lock } from "lucide-react";

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

// ---- Authentication helpers ------------------------------------------------
const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    // Mock authentication - in real app, call your API
    await new Promise(resolve => setTimeout(resolve, 1000));
    if (email === "admin@example.com" && password === "password") {
      setIsAuthenticated(true);
      setIsLoading(false);
      return { success: true };
    } else {
      setIsLoading(false);
      return { success: false, error: "Invalid credentials" };
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
  };

  return { isAuthenticated, isLoading, login, logout };
};

// ---- Mock Data -------------------------------------------------------------
const monthly = [
  { month: "2025-01", total: 120, newlyAdded: 20 },
  { month: "2025-02", total: 150, newlyAdded: 30 },
  { month: "2025-03", total: 180, newlyAdded: 30 },
  { month: "2025-04", total: 210, newlyAdded: 30 },
  { month: "2025-05", total: 255, newlyAdded: 45 },
  { month: "2025-06", total: 300, newlyAdded: 45 },
  { month: "2025-07", total: 360, newlyAdded: 60 },
  { month: "2025-08", total: 410, newlyAdded: 50 },
  { month: "2025-09", total: 455, newlyAdded: 45 },
];

const mockUsersBase = Array.from({ length: 67 }, (_, i) => ({
  id: `user-${i + 1}`,
  email: `user${(i + 1).toString().padStart(2, "0")}@example.com`,
  status: Math.random() > 0.1 ? "active" : "canceled",
}));

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

const Button: React.FC<React.PropsWithChildren<{ onClick?: () => void; variant?: "solid" | "ghost" | "outline"; size?: "sm" | "md"; className?: string; disabled?: boolean; type?: "button" | "submit" | "reset" }>> = ({ onClick, variant = "solid", size = "md", className = "", children, disabled, type = "button" }) => {
  const base = "rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 dark:focus:ring-gray-600 disabled:opacity-50";
  const variants = {
    solid: "bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900 hover:opacity-90",
    ghost: "bg-transparent text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700",
    outline: "border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700",
  } as const;
  const sizes = { sm: "px-3 py-1.5 text-sm", md: "px-4 py-2" } as const;
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}>{children}</button>
  );
};

const Input: React.FC<{
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}> = ({ value, onChange, placeholder, type = "text" }) => (
  <input
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    type={type}
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

// ---- Login Page -----------------------------------------------------------
const LoginPage: React.FC<{
  onLogin: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  isLoading: boolean;
  dark: boolean;
  setDark: (v: boolean) => void;
}> = ({ onLogin, isLoading, dark, setDark }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const result = await onLogin(email, password);
    if (!result.success) {
      setError(result.error || "Login failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Theme toggle */}
        <div className="flex justify-end mb-4">
          <Button variant="ghost" onClick={() => setDark(!dark)} className="flex items-center gap-2">
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            <span>{dark ? "Light" : "Dark"}</span>
          </Button>
        </div>

        <Card>
          <CardHeader title="AI Coaching Admin" icon={<Lock className="h-5 w-5" />} />
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm mb-1 text-gray-700 dark:text-gray-200">Email</label>
                <Input
                  type="email"
                  value={email}
                  onChange={setEmail}
                  placeholder="admin@example.com"
                />
              </div>
              <div>
                <label className="block text-sm mb-1 text-gray-700 dark:text-gray-200">Password</label>
                <Input
                  type="password"
                  value={password}
                  onChange={setPassword}
                  placeholder="Enter your password"
                />
              </div>
              {error && (
                <div className="text-sm text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/30 p-3 rounded-xl">
                  {error}
                </div>
              )}
              <Button
                type="submit"
                disabled={isLoading || !email || !password}
                className="w-full"
              >
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>
            </form>
            <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center">
              Demo credentials: admin@example.com / password
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// ---- Header ---------------------------------------------------------------
const Header: React.FC<{
  adminEmail: string;
  currentPage: string;
  onNavigate: (page: PageKey) => void;
  dark: boolean;
  setDark: (v: boolean) => void;
  onLogout: () => void;
}> = ({ adminEmail, currentPage, onNavigate, dark, setDark, onLogout }) => {
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
const Dashboard: React.FC = () => {
  const current = monthly[monthly.length - 1]?.total ?? 0;
  const previous = monthly[monthly.length - 2]?.total ?? 0;
  const mom = previous === 0 ? 0 : ((current - previous) / previous) * 100;
  const newThisMonth = monthly[monthly.length - 1]?.newlyAdded ?? 0;

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader title="Total Subscribers" icon={<Users className="h-5 w-5" />} />
          <CardContent>
            <div className="text-3xl font-semibold text-gray-900 dark:text-gray-100">{current}</div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">as of this month</p>
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
              <LineChart data={monthly} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
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
              <LineChart data={monthly} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
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
const UsersPage: React.FC = () => {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [users, setUsers] = useState(mockUsersBase);
  const pageSize = 10;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users.filter((u) => u.email.toLowerCase().includes(q));
  }, [query, users]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageItems = filtered.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [totalPages, page]);

  const toggleSub = (id: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, status: u.status === "active" ? "canceled" : "active" } : u))
    );
  };

  const addUser = () => {
    const nextIndex = users.length + 1;
    const email = `user${nextIndex.toString().padStart(2, "0")}@example.com`;
    setUsers((prev) => [{ id: `user-${nextIndex}`, email, status: "active" }, ...prev]);
    setPage(1);
    setQuery("");
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader title="User Directory" action={<Button onClick={addUser}>Add Mock User</Button>} />
        <CardContent>
          <div className="flex items-center gap-3 mb-4">
            <div className="relative w-full max-w-md">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input value={query} onChange={setQuery} placeholder="Search by email" />
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600 dark:text-gray-300">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600 dark:text-gray-300">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-600 dark:text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {pageItems.map((u) => (
                  <tr key={u.id}>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        u.status === "active"
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                          : "bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300"
                      }`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="outline" size="sm" onClick={() => toggleSub(u.id)}>
                        {u.status === "active" ? "Remove from subscription" : "Re-activate"}
                      </Button>
                    </td>
                  </tr>
                ))}
                {pageItems.length === 0 && (
                  <tr>
                    <td className="px-4 py-6 text-sm text-gray-500 dark:text-gray-400" colSpan={3}>No users match the search.</td>
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
const NewsletterPage: React.FC = () => {
  const [subject, setSubject] = useState("");
  const [preheader, setPreheader] = useState("");
  const [body, setBody] = useState("<h1>New content is live</h1><p>We just published fresh coaching modules. Dive in.</p>");
  const previewHtml = `<!doctype html><html><head><meta charset='utf-8'><meta name='viewport' content='width=device-width,initial-scale=1'>
    <style>body{font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Ubuntu;line-height:1.6;margin:0;padding:24px;background:#f9fafb;color:#111827} .card{background:#ffffff;border-radius:16px;padding:24px;border:1px solid #e5e7eb} .footer{font-size:12px;color:#6b7280;margin-top:24px}</style>
  </head><body>
    <div class='card'>
      <div style='color:#6b7280;font-size:12px'>${preheader || "Preheader goes here"}</div>
      <h1 style='margin:8px 0 16px'>${subject || "Subject preview"}</h1>
      <div>${body}</div>
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
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm mb-1 text-gray-700 dark:text-gray-200">Subject</label>
              <Input value={subject} onChange={setSubject} placeholder="Write an engaging subject" />
            </div>
            <div>
              <label className="block text-sm mb-1 text-gray-700 dark:text-gray-200">Preheader</label>
              <Input value={preheader} onChange={setPreheader} placeholder="Short teaser shown in inbox" />
            </div>
            <div>
              <label className="block text-sm mb-1 text-gray-700 dark:text-gray-200">HTML Body</label>
              <Textarea value={body} onChange={setBody} rows={12} />
            </div>
            <div className="flex gap-2">
              <Button onClick={downloadPreview}>Download HTML Preview</Button>
              <Button variant="outline">Send Test (mock)</Button>
              <Button variant="outline">Schedule / Send (mock)</Button>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader title="Preview" />
          <CardContent>
            <iframe title="preview" className="w-full h-[600px] rounded-xl border border-gray-200 dark:border-gray-700 bg-white" srcDoc={previewHtml} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// ---- App Shell ------------------------------------------------------------

type PageKey = "dashboard" | "users" | "newsletter";

export default function AdminPanelWithLogin() {
  const { dark, setDark } = useTheme();
  const { isAuthenticated, isLoading, login, logout } = useAuth();
  const [page, setPage] = useState<PageKey>("dashboard");

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return (
      <LoginPage 
        onLogin={login} 
        isLoading={isLoading} 
        dark={dark} 
        setDark={setDark} 
      />
    );
  }

  // Show admin panel if authenticated
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header 
        adminEmail="admin@example.com" 
        currentPage={page} 
        onNavigate={setPage} 
        dark={dark} 
        setDark={setDark} 
        onLogout={logout}
      />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        {page === "dashboard" && <Dashboard />}
        {page === "users" && <UsersPage />}
        {page === "newsletter" && <NewsletterPage />}
      </main>

      <footer className="border-t border-gray-200 dark:border-gray-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col items-center justify-center space-y-2 text-sm text-gray-500 dark:text-gray-400">
            <p>
              © 2025{' '}
              <a 
                href="https://hillmanchan.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="font-medium text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Hillman
              </a>
            </p>
            <p className="text-xs">
              AI Coaching Documentation Platform
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Tailwind notes (for your project):
// - Set dark mode to class in tailwind.config.js => darkMode: 'class'
// - Base colors used: bg gray-50/900, cards white/gray-800, borders gray-200/700
// - All paddings/margins sized for daily use (comfortable density)