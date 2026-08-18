import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { NativeSelect } from '@/components/native-select';
import { AlertCircle, Lock, RefreshCw, Filter } from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────

interface IssueReport {
  id: number;
  issueType: string;
  pageAffected: string | null;
  description: string;
  email: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  status: string;
  createdAt: string;
}

const STATUSES = ['open', 'reviewing', 'resolved', 'dismissed'] as const;
const ISSUE_TYPES = ['data_error', 'broken_link', 'missing_data', 'ui_bug', 'inappropriate', 'other'] as const;

const ISSUE_TYPE_LABELS: Record<string, string> = {
  data_error:    'Data Error',
  broken_link:   'Broken Link',
  missing_data:  'Missing Data',
  ui_bug:        'UI Bug',
  inappropriate: 'Inappropriate',
  other:         'Other',
};

const STATUS_COLORS: Record<string, string> = {
  open:       'bg-amber-100 text-amber-800 border-amber-200',
  reviewing:  'bg-blue-100 text-blue-800 border-blue-200',
  resolved:   'bg-green-100 text-green-800 border-green-200',
  dismissed:  'bg-gray-100 text-gray-600 border-gray-200',
};

const TYPE_COLORS: Record<string, string> = {
  data_error:    'bg-red-50 text-red-700 border-red-200',
  broken_link:   'bg-orange-50 text-orange-700 border-orange-200',
  missing_data:  'bg-purple-50 text-purple-700 border-purple-200',
  ui_bug:        'bg-sky-50 text-sky-700 border-sky-200',
  inappropriate: 'bg-rose-50 text-rose-700 border-rose-200',
  other:         'bg-gray-50 text-gray-600 border-gray-200',
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

const TOKEN_KEY = 'govlens_admin_token';

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AdminIssues() {
  const [token, setToken] = useState(() => sessionStorage.getItem(TOKEN_KEY) ?? '');
  const [tokenInput, setTokenInput] = useState('');
  const [authed, setAuthed] = useState(false);

  const [issues, setIssues] = useState<IssueReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Filters
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType,   setFilterType]   = useState<string>('all');

  // Inline expand
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  // ── Fetch ───────────────────────────────────────────────────────────────────
  const fetchIssues = useCallback(async (tok: string) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/issues', {
        headers: { 'x-admin-token': tok },
      });
      if (res.status === 401) {
        setAuthed(false);
        sessionStorage.removeItem(TOKEN_KEY);
        setToken('');
        setError('Invalid token.');
        return;
      }
      if (!res.ok) throw new Error('Failed to fetch');
      const data: IssueReport[] = await res.json();
      setIssues(data);
      setAuthed(true);
      sessionStorage.setItem(TOKEN_KEY, tok);
    } catch {
      setError('Could not load reports. Check that the API server is running.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (token) fetchIssues(token);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Status update ────────────────────────────────────────────────────────
  async function updateStatus(id: number, status: string) {
    setIssues(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    await fetch(`/api/admin/issues/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
      body: JSON.stringify({ status }),
    });
  }

  // ── Auth gate ────────────────────────────────────────────────────────────
  if (!authed) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-card border border-border rounded-xl p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <Lock className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground">Admin — Issue Reports</h1>
              <p className="text-xs text-muted-foreground">Enter your admin token to continue</p>
            </div>
          </div>

          {error && (
            <div className="mb-4 flex items-center gap-2 text-sm text-destructive bg-destructive/5 border border-destructive/20 rounded-lg px-3 py-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={e => { e.preventDefault(); fetchIssues(tokenInput); }} className="space-y-3">
            <Input
              type="password"
              placeholder="Admin token"
              value={tokenInput}
              onChange={e => setTokenInput(e.target.value)}
              autoFocus
            />
            <Button type="submit" className="w-full" disabled={!tokenInput || loading}>
              {loading ? 'Checking…' : 'Sign in'}
            </Button>
          </form>
        </div>
      </div>
    );
  }

  // ── Filtered view ─────────────────────────────────────────────────────────
  const filtered = issues.filter(r => {
    if (filterStatus !== 'all' && r.status !== filterStatus) return false;
    if (filterType   !== 'all' && r.issueType !== filterType)  return false;
    return true;
  });

  const counts: Record<string, number> = { all: issues.length };
  for (const r of issues) {
    counts[r.status] = (counts[r.status] ?? 0) + 1;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-foreground">Issue Reports</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {counts['all']} total · {counts['open'] ?? 0} open
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchIssues(token)}
            disabled={loading}
            className="gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">

        {/* Status pills */}
        <div className="flex flex-wrap items-center gap-2">
          {(['all', ...STATUSES] as const).map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                filterStatus === s
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
              <span className="ml-1.5 opacity-70">{counts[s] ?? 0}</span>
            </button>
          ))}

          {/* Type filter */}
          <div className="ml-auto flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-muted-foreground" />
            <NativeSelect value={filterType} onValueChange={setFilterType} className="h-8 text-xs w-40">
              <option value="all">All types</option>
              {ISSUE_TYPES.map(t => (
                <option key={t} value={t}>{ISSUE_TYPE_LABELS[t]}</option>
              ))}
            </NativeSelect>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/5 border border-destructive/20 rounded-lg px-4 py-3">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Empty */}
        {!loading && filtered.length === 0 && (
          <div className="text-center py-16 text-muted-foreground text-sm">
            No reports match the current filter.
          </div>
        )}

        {/* Table */}
        {filtered.length > 0 && (
          <div className="rounded-xl border border-border overflow-hidden bg-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground w-10">#</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Type</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Page</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Description</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Contact</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Date</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground w-36">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, i) => {
                  const isExpanded = expanded.has(r.id);
                  return (
                    <tr
                      key={r.id}
                      className={`border-b border-border last:border-0 transition-colors ${
                        i % 2 === 0 ? 'bg-card' : 'bg-muted/10'
                      } hover:bg-muted/20`}
                    >
                      <td className="px-4 py-3 text-xs text-muted-foreground align-top">{r.id}</td>

                      {/* Type badge */}
                      <td className="px-4 py-3 align-top">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${TYPE_COLORS[r.issueType] ?? TYPE_COLORS['other']}`}>
                          {ISSUE_TYPE_LABELS[r.issueType] ?? r.issueType}
                        </span>
                      </td>

                      {/* Page */}
                      <td className="px-4 py-3 align-top">
                        {r.pageAffected ? (
                          <code className="text-xs bg-muted px-1.5 py-0.5 rounded text-foreground/80">
                            {r.pageAffected}
                          </code>
                        ) : (
                          <span className="text-xs text-muted-foreground/50">—</span>
                        )}
                      </td>

                      {/* Description — truncated with expand */}
                      <td className="px-4 py-3 align-top max-w-xs">
                        <p className={`text-xs text-foreground/80 leading-relaxed ${!isExpanded ? 'line-clamp-2' : ''}`}>
                          {r.description}
                        </p>
                        {r.description.length > 120 && (
                          <button
                            onClick={() => setExpanded(prev => {
                              const next = new Set(prev);
                              next.has(r.id) ? next.delete(r.id) : next.add(r.id);
                              return next;
                            })}
                            className="text-xs text-primary hover:underline mt-1"
                          >
                            {isExpanded ? 'Show less' : 'Show more'}
                          </button>
                        )}
                      </td>

                      {/* Email */}
                      <td className="px-4 py-3 align-top">
                        {r.email ? (
                          <a href={`mailto:${r.email}`} className="text-xs text-primary hover:underline">
                            {r.email}
                          </a>
                        ) : (
                          <span className="text-xs text-muted-foreground/50">—</span>
                        )}
                      </td>

                      {/* Date */}
                      <td className="px-4 py-3 align-top whitespace-nowrap text-xs text-muted-foreground">
                        {formatDate(r.createdAt)}
                      </td>

                      {/* Status selector */}
                      <td className="px-4 py-3 align-top">
                        <NativeSelect
                          value={r.status}
                          onValueChange={(val) => updateStatus(r.id, val)}
                          className={`h-7 text-xs border font-medium ${STATUS_COLORS[r.status] ?? ''}`}
                        >
                          {STATUSES.map(s => (
                            <option key={s} value={s}>
                              {s.charAt(0).toUpperCase() + s.slice(1)}
                            </option>
                          ))}
                        </NativeSelect>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
