import { useEffect, useState } from 'react';
import {
  Activity,
  Bell,
  CalendarDays,
  Camera,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  ContactRound,
  FileText,
  LayoutDashboard,
  LogOut,
  Mail,
  MoreHorizontal,
  Phone,
  Plus,
  Search,
  ShieldCheck,
  Table2,
  Trophy,
  Upload,
  UserRound,
  Users,
  X,
} from 'lucide-react';
import {
  Navigate,
  NavLink,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import {
  createLead,
  getLeads,
  getStats,
  removeLead,
  updateLead,
} from './services/leadService';

const emptyLead = {
  name: '',
  email: '',
  phone: '',
  company: '',
  source: 'website',
  status: 'new',
  notes: '',
  followUpDate: '',
};

const statuses = ['new', 'contacted', 'qualified', 'converted', 'lost'];
const sources = ['website', 'linkedin', 'referral', 'instagram', 'google', 'other'];

const pretty = (value) =>
  value ? value[0].toUpperCase() + value.slice(1) : '—';

const formatDate = (value) =>
  value
    ? new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(
        new Date(value),
      )
    : '—';

function Protected({ children }) {
  const { auth, loading } = useAuth();

  if (loading) {
    return <div className="loading-screen">Loading your workspace…</div>;
  }

  return auth ? children : <Navigate to="/login" replace />;
}

function Login() {
  const { auth, login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (auth) return <Navigate to="/dashboard" replace />;

  async function submit(event) {
    event.preventDefault();
    setError('');
    setBusy(true);

    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="login-page">
      <form className="login-card" onSubmit={submit}>
        <span className="brand-mark">P</span>
        <h1>Welcome back</h1>
        <p>Sign in to manage your lead pipeline.</p>

        {error && <div className="alert error">{error}</div>}

        <label>
          Email
          <input
            type="email"
            required
            autoComplete="email"
            value={form.email}
            onChange={(event) =>
              setForm({ ...form, email: event.target.value })
            }
          />
        </label>

        <label>
          Password
          <input
            type="password"
            required
            autoComplete="current-password"
            value={form.password}
            onChange={(event) =>
              setForm({ ...form, password: event.target.value })
            }
          />
        </label>

        <p>
          New to Pipeline? <NavLink to="/signup">Create an account</NavLink>
        </p>

        <button disabled={busy}>
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </main>
  );
}

function Shell({ children }) {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');

  const user = auth?.user || {};
  const initials =
    (user.name || user.email || 'U')
      .split(/[\s@._-]+/)
      .filter(Boolean)
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'U';

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
    { to: '/leads', label: 'Leads', Icon: ContactRound },
    { to: '/profile', label: 'My profile', Icon: UserRound },
  ];

  function submitGlobalSearch(event) {
    event.preventDefault();
    const query = globalSearch.trim();

    navigate('/leads', {
      state: query ? { globalSearch: query } : null,
    });
  }

  function openAddLead() {
    setNotificationsOpen(false);
    navigate('/leads', { state: { openNewLead: true } });
  }

  function openLeads() {
    setNotificationsOpen(false);
    navigate('/leads');
  }

  return (
    <div className={`app-shell ${collapsed ? 'sidebar-collapsed' : ''}`}>
      <aside className="app-sidebar">
        <div className="sidebar-brand">
          <NavLink
            to="/dashboard"
            className="brand-link"
            aria-label="Pipeline dashboard"
          >
            <span className="brand-mark">P</span>
            {!collapsed && (
              <span className="brand-copy">
                <strong>Pipeline</strong>
                <small>Mini CRM</small>
              </span>
            )}
          </NavLink>

          <button
            type="button"
            className="collapse-button"
            onClick={() => setCollapsed((current) => !current)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-expanded={!collapsed}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? (
              <ChevronRight size={19} />
            ) : (
              <ChevronLeft size={19} />
            )}
          </button>
        </div>

        <nav className="sidebar-nav" aria-label="Main navigation">
          {navItems.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              title={collapsed ? label : undefined}
              className={({ isActive }) =>
                `sidebar-nav-link${isActive ? ' active' : ''}`
              }
            >
              <Icon size={20} aria-hidden="true" />
              {!collapsed && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-account">
          <div className="user-avatar" aria-hidden="true">
            {initials}
          </div>

          {!collapsed && (
            <div className="account-copy">
              <strong>{user.name || 'User'}</strong>
              <small>{user.email || ''}</small>
            </div>
          )}

          <button
            type="button"
            className="signout-button"
            onClick={logout}
            title="Sign out"
            aria-label="Sign out"
          >
            <LogOut size={19} aria-hidden="true" />
            {!collapsed && <span>Sign out</span>}
          </button>
        </div>
      </aside>

      <div className="workspace">
        <header className="topbar">
          <form className="global-search" onSubmit={submitGlobalSearch}>
            <Search size={19} aria-hidden="true" />
            <input
              aria-label="Search leads, companies, or notes"
              placeholder="Search leads, companies, or notes…"
              value={globalSearch}
              onChange={(event) => setGlobalSearch(event.target.value)}
            />
          </form>

          <div className="topbar-actions">
            <button
              type="button"
              className="topbar-add-button"
              onClick={openAddLead}
            >
              <Plus size={18} aria-hidden="true" />
              <span>Add lead</span>
            </button>

            <div className="notification-wrap">
              <button
                type="button"
                className="notification-button"
                aria-label="Notifications"
                aria-expanded={notificationsOpen}
                onClick={() =>
                  setNotificationsOpen((current) => !current)
                }
              >
                <Bell size={21} aria-hidden="true" />
                <span className="notification-dot" />
              </button>

              {notificationsOpen && (
                <>
                  <button
                    type="button"
                    className="notification-dismiss-layer"
                    aria-label="Close notifications"
                    onClick={() => setNotificationsOpen(false)}
                  />

                  <section
                    className="notification-popover"
                    aria-label="Notifications panel"
                  >
                    <div className="notification-heading">
                      <div>
                        <strong>Notifications</strong>
                        <small>Helpful reminders for your pipeline</small>
                      </div>
                      <button
                        type="button"
                        className="notification-close"
                        aria-label="Close notifications"
                        onClick={() => setNotificationsOpen(false)}
                      >
                        <X size={17} />
                      </button>
                    </div>

                    <div className="notification-item">
                      <span className="notification-icon notification-blue">
                        <ContactRound size={18} />
                      </span>
                      <div>
                        <strong>Review your latest leads</strong>
                        <p>Open your leads list to review recent enquiries.</p>
                      </div>
                    </div>

                    <div className="notification-item">
                      <span className="notification-icon notification-orange">
                        <CalendarDays size={18} />
                      </span>
                      <div>
                        <strong>Check follow-ups</strong>
                        <p>Review leads with upcoming follow-up dates.</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="notification-footer"
                      onClick={openLeads}
                    >
                      View leads <ChevronRight size={16} />
                    </button>
                  </section>
                </>
              )}
            </div>

            <button
              type="button"
              className="topbar-user"
              onClick={() => navigate('/profile')}
              title="Open profile"
            >
              <span className="user-avatar" aria-hidden="true">
                {initials}
              </span>
              <span className="topbar-user-name">
                {user.name || 'My profile'}
              </span>
              <ChevronRight className="profile-chevron" size={16} />
            </button>
          </div>
        </header>

        <main className="content">{children}</main>
      </div>
    </div>
  );
}

function Dashboard() {
  const { auth } = useAuth();
  const [stats, setStats] = useState(null);
  const [leads, setLeads] = useState([]);
  const [error, setError] = useState('');
  const [period, setPeriod] = useState('This Month');

  useEffect(() => {
    let active = true;
    Promise.all([getStats(auth.token), getLeads(auth.token)])
      .then(([nextStats, nextLeads]) => {
        if (!active) return;
        setStats(nextStats);
        setLeads(nextLeads);
      })
      .catch((err) => {
        if (active) setError(err.message);
      });
    return () => { active = false; };
  }, [auth.token]);

  const total = Number(stats?.total || 0);
  const newCount = Number(stats?.new || 0);
  const contacted = Number(stats?.contacted || 0);
  const converted = Number(stats?.converted || 0);
  const qualified = leads.filter((lead) => lead.status === 'qualified').length;
  const recentLeads = [...leads].slice(0, 4);
  const statusCounts = [
    { label: 'New', count: newCount, color: '#2684ff' },
    { label: 'Contacted', count: contacted, color: '#8b5cf6' },
    { label: 'Qualified', count: qualified, color: '#f97316' },
    { label: 'Converted', count: converted, color: '#10b981' },
  ];
  const bars = [1, 2, 3, 2, 3, 4, 3, 5, 6, 4, 6, 8];

  return (
    <Shell>
      <header className="page-heading dashboard-heading">
        <div>
          <p className="eyebrow">OVERVIEW</p>
          <h1>Dashboard</h1>
          <p>Here’s what’s happening with your sales pipeline.</p>
        </div>
        <label className="period-select">
          <CalendarDays size={17} />
          <select value={period} onChange={(event) => setPeriod(event.target.value)} aria-label="Dashboard date range">
            <option>This Month</option>
            <option>Last Month</option>
            <option>This Year</option>
          </select>
        </label>
      </header>

      {error && <div className="alert error">{error}</div>}

      <section className="analytics-stats">
        <article className="analytics-stat">
          <span className="analytics-stat-icon blue"><Users size={22} /></span>
          <div><strong>{stats ? total : '—'}</strong><span>Total Leads</span></div>
          <small className="trend-up"><Activity size={14} /> Pipeline</small>
        </article>
        <article className="analytics-stat">
          <span className="analytics-stat-icon orange"><FileText size={22} /></span>
          <div><strong>{stats ? newCount : '—'}</strong><span>New Leads</span></div>
          <small className="trend-neutral">Needs review</small>
        </article>
        <article className="analytics-stat">
          <span className="analytics-stat-icon purple"><ContactRound size={22} /></span>
          <div><strong>{stats ? contacted + qualified : '—'}</strong><span>Active Deals</span></div>
          <small className="trend-neutral">In progress</small>
        </article>
        <article className="analytics-stat">
          <span className="analytics-stat-icon green"><Trophy size={22} /></span>
          <div><strong>{stats ? converted : '—'}</strong><span>Converted</span></div>
          <small className="trend-up"><CheckCircle2 size={14} /> Won</small>
        </article>
      </section>

      <section className="analytics-grid">
        <article className="panel analytics-panel">
          <div className="panel-title analytics-panel-title">
            <div><h2>Lead Status</h2><p>Distribution of your leads by status.</p></div>
            <span className="mini-period">{period}</span>
          </div>
          <div className="status-chart-layout">
            <div className="donut-chart" style={{ '--new': newCount, '--contacted': contacted, '--qualified': qualified, '--converted': converted }}>
              <div className="donut-center"><strong>{total}</strong><span>Total Leads</span></div>
            </div>
            <div className="chart-legend">
              {statusCounts.map((item) => (
                <div className="legend-row" key={item.label}>
                  <span className="legend-name"><i style={{ background: item.color }} />{item.label}</span>
                  <strong>{item.count}</strong>
                  <span>{total ? Math.round((item.count / total) * 100) : 0}%</span>
                </div>
              ))}
            </div>
          </div>
        </article>

        <article className="panel analytics-panel">
          <div className="panel-title analytics-panel-title">
            <div><h2>Lead Activity</h2><p>Illustrative activity trend for the selected period.</p></div>
            <span className="mini-period">{period}</span>
          </div>
          <div className="activity-chart">
            <div className="chart-y-labels"><span>8</span><span>6</span><span>4</span><span>2</span><span>0</span></div>
            <div className="bar-chart">
              {bars.map((bar, index) => <div className="bar-column" key={index}><i style={{ height: `${bar * 11}%` }} /></div>)}
            </div>
            <div className="chart-x-labels"><span>Oct 1</span><span>Oct 5</span><span>Oct 10</span><span>Oct 15</span><span>Oct 20</span><span>Oct 25</span><span>Oct 31</span></div>
          </div>
        </article>
      </section>

      <section className="panel recent-leads-panel">
        <div className="panel-title">
          <div><h2><span className="heading-spark">✦</span> Recent / Important Leads</h2><p>Latest leads or those needing attention. Go to the Leads page to see and manage all leads.</p></div>
          <NavLink to="/leads">View all leads <ChevronRight size={16} /></NavLink>
        </div>
        {recentLeads.length ? (
          <div className="recent-lead-cards">
            {recentLeads.map((lead, index) => (
              <article className={`recent-lead-card tone-${index % 4}`} key={lead._id}>
                <div className="recent-lead-top">
                  <span className="lead-initial">{(lead.name || '?').charAt(0).toUpperCase()}</span>
                  <div className="recent-lead-identity"><strong>{lead.name}</strong><span>{lead.company || pretty(lead.source)}</span><small>{lead.email}</small></div>
                  <span className={`badge ${lead.status}`}>{pretty(lead.status)}</span>
                </div>
                <div className="recent-lead-meta">
                  <span><CalendarDays size={14} /> {formatDate(lead.followUpDate)}</span>
                  <span><Phone size={14} /> {lead.phone || '—'}</span>
                </div>
                {lead.notes && <p className="recent-lead-note">“{lead.notes}”</p>}
                <div className="recent-lead-bottom"><span><CircleDollarSign size={16} /> <b>—</b></span><NavLink to="/leads">Open lead</NavLink></div>
              </article>
            ))}
          </div>
        ) : <p className="empty">No leads yet. Add your first lead from the Leads page.</p>}
      </section>
    </Shell>
  );
}

function LeadTable({ leads, onEdit, onDelete, compact = false }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Lead</th>
            <th>Source</th>
            <th>Status</th>
            <th>Follow-up</th>
            {!compact && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            <tr key={lead._id}>
              <td>
                <b>{lead.name}</b>
                <small>
                  {lead.email}
                  {lead.company ? ` · ${lead.company}` : ''}
                </small>
              </td>
              <td>{pretty(lead.source)}</td>
              <td>
                <span className={`badge ${lead.status}`}>
                  {pretty(lead.status)}
                </span>
              </td>
              <td>{formatDate(lead.followUpDate)}</td>
              {!compact && (
                <td className="actions">
                  <button
                    type="button"
                    className="icon-button"
                    aria-label={`Edit ${lead.name}`}
                    onClick={() => onEdit(lead)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="danger-link"
                    aria-label={`Delete ${lead.name}`}
                    onClick={() => onDelete(lead)}
                  >
                    Delete
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function LeadModal({ lead, onClose, onSave }) {
  const [form, setForm] = useState(lead || emptyLead);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const change = (key, value) => setForm({ ...form, [key]: value });

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError('');

    try {
      await onSave({ ...form, followUpDate: form.followUpDate || null });
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <form
        className="modal"
        onSubmit={submit}
        role="dialog"
        aria-modal="true"
        aria-labelledby="lead-form-title"
      >
        <div className="modal-head">
          <h2 id="lead-form-title">{lead ? 'Edit lead' : 'Add lead'}</h2>
          <button
            type="button"
            className="text-button"
            onClick={onClose}
          >
            Close
          </button>
        </div>

        {error && <div className="alert error">{error}</div>}

        <div className="form-grid">
          <label>
            Name
            <input
              required
              value={form.name}
              onChange={(event) => change('name', event.target.value)}
            />
          </label>

          <label>
            Email
            <input
              required
              type="email"
              value={form.email}
              onChange={(event) => change('email', event.target.value)}
            />
          </label>

          <label>
            Phone
            <input
              value={form.phone}
              onChange={(event) => change('phone', event.target.value)}
            />
          </label>

          <label>
            Company
            <input
              value={form.company}
              onChange={(event) => change('company', event.target.value)}
            />
          </label>

          <label>
            Source
            <select
              value={form.source}
              onChange={(event) => change('source', event.target.value)}
            >
              {sources.map((source) => (
                <option key={source} value={source}>
                  {pretty(source)}
                </option>
              ))}
            </select>
          </label>

          <label>
            Status
            <select
              value={form.status}
              onChange={(event) => change('status', event.target.value)}
            >
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {pretty(status)}
                </option>
              ))}
            </select>
          </label>

          <label>
            Follow-up date
            <input
              type="date"
              value={
                form.followUpDate ? form.followUpDate.slice(0, 10) : ''
              }
              onChange={(event) =>
                change('followUpDate', event.target.value)
              }
            />
          </label>

          <label className="full">
            Notes
            <textarea
              rows="4"
              value={form.notes}
              onChange={(event) => change('notes', event.target.value)}
              placeholder="Add a useful follow-up note…"
            />
          </label>
        </div>

        <div className="modal-actions">
          <button
            type="button"
            className="secondary"
            onClick={onClose}
          >
            Cancel
          </button>
          <button disabled={busy}>
            {busy ? 'Saving…' : lead ? 'Save changes' : 'Create lead'}
          </button>
        </div>
      </form>
    </div>
  );
}

function Leads() {
  const { auth } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [filters, setFilters] = useState({ search: '', status: '', source: '' });
  const [followUpFilter, setFollowUpFilter] = useState('all');
  const [viewMode, setViewMode] = useState('kanban');
  const [modal, setModal] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (location.state?.globalSearch) {
      setFilters((current) => ({ ...current, search: location.state.globalSearch }));
      navigate(location.pathname, { replace: true, state: null });
    } else if (location.state?.openNewLead) {
      setModal('new');
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.pathname, location.state, navigate]);

  const load = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams(Object.entries(filters).filter(([, value]) => value));
      setLeads(await getLeads(auth.token, query.toString() ? `?${query}` : ''));
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const id = setTimeout(load, 250);
    return () => clearTimeout(id);
  }, [filters, auth.token]);

  const save = async (form) => {
    if (modal && modal !== 'new') {
      await updateLead(auth.token, modal._id, form);
      setMessage('Lead updated.');
    } else {
      await createLead(auth.token, form);
      setMessage('Lead created.');
    }
    await load();
  };

  const del = async (lead) => {
    if (!window.confirm(`Delete ${lead.name}? This cannot be undone.`)) return;
    try {
      await removeLead(auth.token, lead._id);
      setMessage('Lead deleted.');
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  const filteredLeads = leads.filter((lead) => {
    if (followUpFilter === 'all') return true;
    if (!lead.followUpDate) return false;
    const date = new Date(lead.followUpDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(date);
    due.setHours(0, 0, 0, 0);
    const diff = Math.round((due - today) / 86400000);
    if (followUpFilter === 'today') return diff === 0;
    if (followUpFilter === 'week') return diff >= 0 && diff <= 7;
    if (followUpFilter === 'month') return diff >= 0 && diff <= 30;
    if (followUpFilter === 'overdue') return diff < 0;
    return true;
  });

  const columns = [
    { status: 'new', title: 'New', subtitle: 'Initial interest', color: 'blue' },
    { status: 'contacted', title: 'Contacted', subtitle: 'Reached out and engaging', color: 'purple' },
    { status: 'qualified', title: 'Qualified', subtitle: 'Needs and budget confirmed', color: 'orange' },
    { status: 'converted', title: 'Converted', subtitle: 'Closed and won', color: 'green' },
    { status: 'lost', title: 'Lost', subtitle: 'Not moving forward', color: 'red' },
  ];

  return (
    <Shell>
      <header className="page-heading leads-heading">
        <div>
          <p className="eyebrow">LEAD MANAGEMENT</p>
          <h1>Leads</h1>
          <p>Track every conversation from first contact to conversion.</p>
        </div>
        <div className="leads-heading-actions">
          <div className="view-switch" aria-label="Lead view">
            <button type="button" className={viewMode === 'kanban' ? 'selected' : ''} onClick={() => setViewMode('kanban')}><LayoutDashboard size={16} /> Kanban</button>
            <button type="button" className={viewMode === 'table' ? 'selected' : ''} onClick={() => setViewMode('table')}><Table2 size={16} /> Table</button>
          </div>
          <button type="button" onClick={() => setModal('new')}><Plus size={17} /> Add Lead</button>
        </div>
      </header>

      {message && <div className="alert success">{message}</div>}
      {error && <div className="alert error">{error}</div>}

      <section className="panel leads-panel">
        <div className="leads-toolbar">
          <label className="leads-search"><Search size={18} /><input aria-label="Search leads" placeholder="Search name, email, company…" value={filters.search} onChange={(event) => setFilters({ ...filters, search: event.target.value })} /></label>
          <select aria-label="Filter by status" value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value })}>
            <option value="">All statuses</option>
            {statuses.map((status) => <option key={status} value={status}>{pretty(status)}</option>)}
          </select>
          <select aria-label="Filter by source" value={filters.source} onChange={(event) => setFilters({ ...filters, source: event.target.value })}>
            <option value="">All sources</option>
            {sources.map((source) => <option key={source} value={source}>{pretty(source)}</option>)}
          </select>
          <label className="followup-select"><CalendarDays size={17} /><select aria-label="Filter by follow-up date" value={followUpFilter} onChange={(event) => setFollowUpFilter(event.target.value)}>
            <option value="all">Follow-up date: All dates</option>
            <option value="today">Due today</option>
            <option value="week">Due this week</option>
            <option value="month">Due this month</option>
            <option value="overdue">Overdue</option>
          </select></label>
        </div>

        {loading ? <p className="empty">Loading leads…</p> : !filteredLeads.length ? <p className="empty">No leads match these filters.</p> : viewMode === 'table' ? (
          <LeadTable leads={filteredLeads} onEdit={setModal} onDelete={del} />
        ) : (
          <div className="kanban-board">
            {columns.map((column) => {
              const columnLeads = filteredLeads.filter((lead) => lead.status === column.status);
              return (
                <section className={`kanban-column ${column.color}`} key={column.status}>
                  <div className="kanban-column-heading">
                    <div><span className="kanban-dot" /><div><strong>{column.title}</strong><small>{column.subtitle}</small></div></div>
                    <span className="kanban-count">{columnLeads.length}</span>
                  </div>
                  <div className="kanban-cards">
                    {columnLeads.map((lead) => (
                      <article className="kanban-card" key={lead._id}>
                        <div className="kanban-card-top"><span className="lead-initial">{(lead.name || '?').charAt(0).toUpperCase()}</span><button type="button" className="more-button" aria-label={`Edit ${lead.name}`} onClick={() => setModal(lead)}><MoreHorizontal size={19} /></button></div>
                        <strong className="kanban-lead-name">{lead.name}</strong>
                        <span className="kanban-company">{lead.company || pretty(lead.source)}</span>
                        <span className="kanban-email">{lead.email}</span>
                        {lead.notes && <p className="kanban-note">{lead.notes}</p>}
                        <div className="kanban-card-meta"><span><CalendarDays size={14} />{formatDate(lead.followUpDate)}</span><span>{pretty(lead.source)}</span></div>
                        <div className="kanban-card-actions"><button type="button" className="small-edit" onClick={() => setModal(lead)}>Edit</button><button type="button" className="small-delete" onClick={() => del(lead)}>Delete</button></div>
                      </article>
                    ))}
                    {!columnLeads.length && <p className="kanban-empty">No leads here</p>}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </section>

      {modal && <LeadModal lead={modal === 'new' ? null : modal} onClose={() => setModal(null)} onSave={save} />}
    </Shell>
  );
}

function Signup() {
  const { auth, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (auth) return <Navigate to="/dashboard" replace />;

  async function submit(event) {
    event.preventDefault();

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setBusy(true);
    setError('');

    try {
      await register(form.name, form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="login-page">
      <form className="login-card" onSubmit={submit}>
        <span className="brand-mark">P</span>
        <h1>Create your account</h1>
        <p>Start managing your lead pipeline today.</p>

        {error && <div className="alert error">{error}</div>}

        <label>
          Full name
          <input
            required
            autoComplete="name"
            value={form.name}
            onChange={(event) =>
              setForm({ ...form, name: event.target.value })
            }
          />
        </label>

        <label>
          Email
          <input
            required
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={(event) =>
              setForm({ ...form, email: event.target.value })
            }
          />
        </label>

        <label>
          Password
          <input
            required
            minLength="8"
            type="password"
            autoComplete="new-password"
            value={form.password}
            onChange={(event) =>
              setForm({ ...form, password: event.target.value })
            }
          />
        </label>

        <label>
          Confirm password
          <input
            required
            minLength="8"
            type="password"
            autoComplete="new-password"
            value={form.confirmPassword}
            onChange={(event) =>
              setForm({ ...form, confirmPassword: event.target.value })
            }
          />
        </label>

        <p className="auth-switch">
          Already have an account? <NavLink to="/login">Sign in</NavLink>
        </p>

        <button disabled={busy}>
          {busy ? 'Creating account…' : 'Create account'}
        </button>
      </form>
    </main>
  );
}

function Profile() {
  const { auth, updateProfile } = useAuth();
  const [form, setForm] = useState(() => ({
    name: auth.user.name || '',
    email: auth.user.email || '',
    phone: auth.user.phone || '',
    jobTitle: auth.user.jobTitle || '',
    bio: auth.user.bio || '',
  }));
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const initials = (form.name || form.email || 'U').split(/[\s@._-]+/).filter(Boolean).map((part) => part[0]).join('').slice(0, 2).toUpperCase();

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    setMessage('');
    try {
      await updateProfile(form);
      setMessage('Your profile has been updated.');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Shell>
      <header className="page-heading">
        <div><p className="eyebrow">ACCOUNT</p><h1>My profile</h1><p>Manage your personal information and account settings.</p></div>
      </header>
      <div className="profile-layout">
        <section className="panel profile-panel">
          <div className="profile-section-heading">
            <span className="profile-icon"><UserRound size={21} /></span>
            <div><h2>Personal Information</h2><p>Keep your information up to date.</p></div>
          </div>
          <form className="profile-form" onSubmit={submit}>
            {error && <div className="alert error">{error}</div>}
            {message && <div className="alert success">{message}</div>}
            <div className="form-grid">
              <label>Full name<input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label>
              <label>Email address<input required type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></label>
              <label>Phone number<input type="tel" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} placeholder="+91 98765 43210" /></label>
              <label>Job title<input value={form.jobTitle} onChange={(event) => setForm({ ...form, jobTitle: event.target.value })} placeholder="e.g. Sales Manager" /></label>
              <label className="full">About me<textarea rows="5" maxLength="500" value={form.bio} onChange={(event) => setForm({ ...form, bio: event.target.value })} placeholder="A short introduction about yourself…" /></label>
            </div>
            <div className="modal-actions"><button disabled={busy}>{busy ? 'Saving…' : <><Upload size={16} /> Save changes</>}</button></div>
          </form>
        </section>

        <aside className="profile-side-column">
          <section className="panel profile-picture-panel">
            <div className="profile-section-heading"><span className="profile-icon"><Camera size={21} /></span><div><h2>Profile picture</h2><p>Your account avatar.</p></div></div>
            <div className="profile-large-avatar">{initials}</div>
            <p className="profile-avatar-note">Your initials are shown as your profile image.</p>
          </section>
          <section className="panel account-info-panel">
            <div className="profile-section-heading"><span className="profile-icon"><ShieldCheck size={21} /></span><div><h2>Account information</h2><p>Your account details and preferences.</p></div></div>
            <div className="account-info-row"><Mail size={18} /><div><strong>Email</strong><span>{form.email || 'Not provided'}</span></div></div>
            <div className="account-info-row"><CalendarDays size={18} /><div><strong>Profile</strong><span>Personal information</span></div></div>
            <div className="account-info-row"><ShieldCheck size={18} /><div><strong>Account access</strong><span>Authenticated user</span></div></div>
            <div className="account-info-row"><Phone size={18} /><div><strong>Phone</strong><span>{form.phone || 'Not provided'}</span></div></div>
          </section>
        </aside>
      </div>
    </Shell>
  );
}

function NotFound() {
  return <Navigate to="/dashboard" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route
        path="/dashboard"
        element={
          <Protected>
            <Dashboard />
          </Protected>
        }
      />
      <Route
        path="/leads"
        element={
          <Protected>
            <Leads />
          </Protected>
        }
      />
      <Route
        path="/profile"
        element={
          <Protected>
            <Profile />
          </Protected>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
