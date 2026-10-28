import { useEffect, useState } from 'react';
import {
  Bell,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ContactRound,
  LayoutDashboard,
  LogOut,
  Plus,
  Search,
  UserRound,
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

  useEffect(() => {
    let active = true;

    Promise.all([getStats(auth.token), getLeads(auth.token)])
      .then(([nextStats, nextLeads]) => {
        if (!active) return;
        setStats(nextStats);
        setLeads(nextLeads.slice(0, 5));
      })
      .catch((err) => {
        if (active) setError(err.message);
      });

    return () => {
      active = false;
    };
  }, [auth.token]);

  if (error) {
    return (
      <Shell>
        <div className="alert error">{error}</div>
      </Shell>
    );
  }

  const items = [
    ['Total leads', stats?.total, 'total'],
    ['New', stats?.new, 'new'],
    ['Contacted', stats?.contacted, 'contacted'],
    ['Converted', stats?.converted, 'converted'],
  ];

  return (
    <Shell>
      <header className="page-heading">
        <div>
          <p className="eyebrow">OVERVIEW</p>
          <h1>Your sales pipeline</h1>
          <p>See what needs your attention today.</p>
        </div>
        <NavLink className="button-link" to="/leads">
          Manage leads
        </NavLink>
      </header>

      <section className="stats">
        {items.map(([label, value, key]) => (
          <article className="stat" key={key}>
            <span>{label}</span>
            <strong>{stats ? value : '—'}</strong>
            <i className={key} />
          </article>
        ))}
      </section>

      <section className="panel">
        <div className="panel-title">
          <h2>Recent leads</h2>
          <NavLink to="/leads">View all</NavLink>
        </div>

        {leads.length ? (
          <LeadTable leads={leads} compact />
        ) : (
          <p className="empty">
            No leads yet. Add your first lead from the Leads page.
          </p>
        )}
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
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    source: '',
  });
  const [modal, setModal] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (location.state?.globalSearch) {
      setFilters((current) => ({
        ...current,
        search: location.state.globalSearch,
      }));
      navigate(location.pathname, { replace: true, state: null });
    } else if (location.state?.openNewLead) {
      setModal('new');
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.pathname, location.state, navigate]);

  const load = async () => {
    setLoading(true);

    try {
      const query = new URLSearchParams(
        Object.entries(filters).filter(([, value]) => value),
      );
      setLeads(
        await getLeads(auth.token, query.toString() ? `?${query}` : ''),
      );
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
    if (!window.confirm(`Delete ${lead.name}? This cannot be undone.`)) {
      return;
    }

    try {
      await removeLead(auth.token, lead._id);
      setMessage('Lead deleted.');
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Shell>
      <header className="page-heading">
        <div>
          <p className="eyebrow">LEAD MANAGEMENT</p>
          <h1>Leads</h1>
          <p>Track every conversation from first contact to conversion.</p>
        </div>
        <button type="button" onClick={() => setModal('new')}>
          + Add lead
        </button>
      </header>

      {message && <div className="alert success">{message}</div>}
      {error && <div className="alert error">{error}</div>}

      <section className="panel">
        <div className="filters">
          <input
            aria-label="Search leads"
            placeholder="Search name, email, company…"
            value={filters.search}
            onChange={(event) =>
              setFilters({ ...filters, search: event.target.value })
            }
          />

          <select
            aria-label="Filter by status"
            value={filters.status}
            onChange={(event) =>
              setFilters({ ...filters, status: event.target.value })
            }
          >
            <option value="">All statuses</option>
            {statuses.map((status) => (
              <option key={status} value={status}>
                {pretty(status)}
              </option>
            ))}
          </select>

          <select
            aria-label="Filter by source"
            value={filters.source}
            onChange={(event) =>
              setFilters({ ...filters, source: event.target.value })
            }
          >
            <option value="">All sources</option>
            {sources.map((source) => (
              <option key={source} value={source}>
                {pretty(source)}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <p className="empty">Loading leads…</p>
        ) : leads.length ? (
          <LeadTable leads={leads} onEdit={setModal} onDelete={del} />
        ) : (
          <p className="empty">No leads match these filters.</p>
        )}
      </section>

      {modal && (
        <LeadModal
          lead={modal === 'new' ? null : modal}
          onClose={() => setModal(null)}
          onSave={save}
        />
      )}
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
        <div>
          <p className="eyebrow">ACCOUNT</p>
          <h1>My profile</h1>
          <p>Keep your personal information up to date.</p>
        </div>
      </header>

      <section className="panel profile-panel">
        <form className="profile-form" onSubmit={submit}>
          {error && <div className="alert error">{error}</div>}
          {message && <div className="alert success">{message}</div>}

          <div className="form-grid">
            <label>
              Full name
              <input
                required
                value={form.name}
                onChange={(event) =>
                  setForm({ ...form, name: event.target.value })
                }
              />
            </label>

            <label>
              Email address
              <input
                required
                type="email"
                value={form.email}
                onChange={(event) =>
                  setForm({ ...form, email: event.target.value })
                }
              />
            </label>

            <label>
              Phone number
              <input
                type="tel"
                value={form.phone}
                onChange={(event) =>
                  setForm({ ...form, phone: event.target.value })
                }
              />
            </label>

            <label>
              Job title
              <input
                value={form.jobTitle}
                onChange={(event) =>
                  setForm({ ...form, jobTitle: event.target.value })
                }
              />
            </label>

            <label className="full">
              About me
              <textarea
                rows="4"
                maxLength="500"
                value={form.bio}
                onChange={(event) =>
                  setForm({ ...form, bio: event.target.value })
                }
                placeholder="A short introduction…"
              />
            </label>
          </div>

          <div className="modal-actions">
            <button disabled={busy}>
              {busy ? 'Saving…' : 'Save profile'}
            </button>
          </div>
        </form>
      </section>
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
