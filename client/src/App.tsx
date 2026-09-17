import {
  AlertCircle,
  ArrowUpDown,
  CalendarDays,
  CheckCircle2,
  ListRestart,
  Plus,
  RotateCw,
  Trash2,
  UserRound
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { clearCompletedActions, createAction, fetchActions, updateActionStatus } from "./api";
import type { ActionItem, CreateActionInput, Priority, Status } from "../../shared/actions";
import { priorities, statuses } from "../../shared/actions";

const emptyForm: CreateActionInput = {
  client: "",
  title: "",
  owner: "",
  dueDate: "",
  priority: "Medium",
  status: "Open"
};

type Filters = {
  status: "All" | Status;
  priority: "All" | Priority;
};

type SortBy = "dueDate" | "priority";

const initialFilters: Filters = {
  status: "All",
  priority: "All"
};

const priorityRank: Record<Priority, number> = {
  High: 0,
  Medium: 1,
  Low: 2
};

function isOverdue(action: ActionItem) {
  if (action.status === "Completed") {
    return false;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDate = new Date(`${action.dueDate}T00:00:00`);

  return dueDate < today;
}

function validateForm(form: CreateActionInput) {
  const errors: Partial<Record<keyof CreateActionInput, string>> = {};

  if (!form.client.trim()) {
    errors.client = "Client is required";
  }

  if (form.title.trim().length < 5) {
    errors.title = "Title must be at least 5 characters";
  }

  if (!form.owner.trim()) {
    errors.owner = "Owner is required";
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(form.dueDate)) {
    errors.dueDate = "Use YYYY-MM-DD";
  }

  return errors;
}

function statusLabel(status: Status) {
  if (status === "In Progress") {
    return "In progress";
  }

  return status;
}

export default function App() {
  const [actions, setActions] = useState<ActionItem[]>([]);
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [form, setForm] = useState<CreateActionInput>(emptyForm);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof CreateActionInput, string>>>({});
  const [sortBy, setSortBy] = useState<SortBy>("dueDate");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [error, setError] = useState("");

  async function loadActions() {
    setLoading(true);
    setError("");

    try {
      setActions(await fetchActions());
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to load actions");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadActions();
  }, []);

  const filteredActions = useMemo(() => {
    const matches = actions.filter((action) => {
      const statusMatch = filters.status === "All" || action.status === filters.status;
      const priorityMatch = filters.priority === "All" || action.priority === filters.priority;
      return statusMatch && priorityMatch;
    });

    return [...matches].sort((first, second) => {
      if (sortBy === "priority") {
        const priorityDifference = priorityRank[first.priority] - priorityRank[second.priority];

        if (priorityDifference !== 0) {
          return priorityDifference;
        }
      }

      return first.dueDate.localeCompare(second.dueDate);
    });
  }, [actions, filters, sortBy]);

  const counts = useMemo(() => {
    return statuses.map((status) => ({
      status,
      total: actions.filter((action) => action.status === status).length
    }));
  }, [actions]);

  const overdueCount = useMemo(() => actions.filter(isOverdue).length, [actions]);
  const completedCount = useMemo(() => actions.filter((action) => action.status === "Completed").length, [actions]);
  const hasFilters = filters.status !== "All" || filters.priority !== "All";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validationErrors = validateForm(form);
    setFormErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setSaving(true);
    setError("");

    try {
      const action = await createAction({
        ...form,
        client: form.client.trim(),
        title: form.title.trim(),
        owner: form.owner.trim()
      });
      setActions((current) => [action, ...current]);
      setForm(emptyForm);
      setFormErrors({});
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to create action");
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusChange(action: ActionItem, status: Status) {
    if (action.status === status) {
      return;
    }

    setError("");

    try {
      const updated = await updateActionStatus(action.id, status);
      setActions((current) => current.map((item) => (item.id === updated.id ? updated : item)));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to update action");
    }
  }

  async function handleClearCompleted() {
    setClearing(true);
    setError("");

    try {
      const result = await clearCompletedActions();
      setActions(result.actions);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to clear completed actions");
    } finally {
      setClearing(false);
    }
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <h1>Action tracker</h1>
      </header>

      <section className="overview" aria-label="Action summary">
        <div>
          <p className="eyebrow">Client delivery</p>
          <h2>Track commitments from discussion to completion.</h2>
        </div>
        <div className="metric-row">
          {counts.map(({ status, total }) => (
            <div className="metric" key={status}>
              <span>{statusLabel(status)}</span>
              <strong>{total}</strong>
            </div>
          ))}
          <div className="metric overdue">
            <span>Overdue</span>
            <strong>{overdueCount}</strong>
          </div>
        </div>
      </section>

      <section className="actions-section" aria-label="Action items">
        <section className="toolbar" aria-label="Filters">
          <label>
            Status
            <select
              value={filters.status}
              onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value as Filters["status"] }))}
            >
              <option>All</option>
              {statuses.map((status) => (
                <option key={status}>{status}</option>
              ))}
            </select>
          </label>
          <label>
            Priority
            <select
              value={filters.priority}
              onChange={(event) =>
                setFilters((current) => ({ ...current, priority: event.target.value as Filters["priority"] }))
              }
            >
              <option>All</option>
              {priorities.map((priority) => (
                <option key={priority}>{priority}</option>
              ))}
            </select>
          </label>
          <label>
            Sort
            <select value={sortBy} onChange={(event) => setSortBy(event.target.value as SortBy)}>
              <option value="dueDate">Due date</option>
              <option value="priority">Priority</option>
            </select>
          </label>
          <button className="ghost-button" type="button" onClick={() => setFilters(initialFilters)} disabled={!hasFilters}>
            <ListRestart aria-hidden="true" size={17} />
            Reset
          </button>
          <button className="ghost-button" type="button" onClick={loadActions}>
            <RotateCw aria-hidden="true" size={17} />
            Refresh
          </button>
          <button className="ghost-button danger-button" type="button" onClick={handleClearCompleted} disabled={clearing || completedCount === 0}>
            <Trash2 aria-hidden="true" size={17} />
            {clearing ? "Clearing..." : "Clear completed"}
          </button>
          <span className="sort-note">
            <ArrowUpDown aria-hidden="true" size={15} />
            {sortBy === "dueDate" ? "Earliest due first" : "High priority first"}
          </span>
        </section>

        {error ? (
          <div className="notice error" role="alert">
            <AlertCircle aria-hidden="true" size={18} />
            {error}
          </div>
        ) : null}

        <div className="workspace">
          <form className="action-form" onSubmit={handleSubmit} noValidate>
          <div className="form-heading">
            <Plus aria-hidden="true" size={19} />
            <h2>New action</h2>
          </div>
          <Field label="Client" error={formErrors.client}>
            <input
              value={form.client}
              onChange={(event) => setForm((current) => ({ ...current, client: event.target.value }))}
              placeholder="Kopano School"
            />
          </Field>
          <Field label="Title" error={formErrors.title}>
            <input
              value={form.title}
              onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
              placeholder="Confirm pilot user numbers"
            />
          </Field>
          <div className="form-grid">
            <Field label="Owner" error={formErrors.owner}>
              <input
                value={form.owner}
                onChange={(event) => setForm((current) => ({ ...current, owner: event.target.value }))}
                placeholder="Mac"
              />
            </Field>
            <Field label="Due date" error={formErrors.dueDate}>
              <input
                type="date"
                value={form.dueDate}
                onChange={(event) => setForm((current) => ({ ...current, dueDate: event.target.value }))}
              />
            </Field>
          </div>
          <div className="form-grid">
            <Field label="Priority">
              <select
                value={form.priority}
                onChange={(event) => setForm((current) => ({ ...current, priority: event.target.value as Priority }))}
              >
                {priorities.map((priority) => (
                  <option key={priority}>{priority}</option>
                ))}
              </select>
            </Field>
            <Field label="Status">
              <select
                value={form.status}
                onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as Status }))}
              >
                {statuses.map((status) => (
                  <option key={status}>{status}</option>
                ))}
              </select>
            </Field>
          </div>
          <button className="primary-button" type="submit" disabled={saving}>
            <Plus aria-hidden="true" size={17} />
            {saving ? "Creating..." : "Create action"}
          </button>
          </form>

          <section className="board" aria-label="Action board">
          {loading ? (
            <div className="state-panel">Loading action items...</div>
          ) : filteredActions.length === 0 ? (
            <div className="state-panel">No action items match the current filters.</div>
          ) : (
            statuses.map((status) => {
              const columnActions = filteredActions.filter((action) => action.status === status);
              return (
                <section className="column" key={status} aria-labelledby={`column-${status}`}>
                  <div className="column-header">
                    <h2 id={`column-${status}`}>{statusLabel(status)}</h2>
                    <span>{columnActions.length}</span>
                  </div>
                  <div className="card-stack">
                    {columnActions.length === 0 ? (
                      <p className="empty-column">No matching actions.</p>
                    ) : (
                      columnActions.map((action) => (
                        <article className={`action-card ${isOverdue(action) ? "is-overdue" : ""}`} key={action.id}>
                          <div className="card-topline">
                            <span>{action.id}</span>
                            <span className={`priority priority-${action.priority.toLowerCase()}`}>{action.priority}</span>
                          </div>
                          <h3>{action.title}</h3>
                          <p className="client-name">{action.client}</p>
                          <div className="card-meta">
                            <span>
                              <UserRound aria-hidden="true" size={14} />
                              {action.owner}
                            </span>
                            <span>
                              <CalendarDays aria-hidden="true" size={14} />
                              {action.dueDate}
                            </span>
                          </div>
                          {isOverdue(action) ? <p className="overdue-label">Overdue</p> : null}
                          <label className="status-control">
                            Move status
                            <select value={action.status} onChange={(event) => handleStatusChange(action, event.target.value as Status)}>
                              {statuses.map((statusOption) => (
                                <option key={statusOption}>{statusOption}</option>
                              ))}
                            </select>
                          </label>
                          {action.status === "Completed" ? (
                            <div className="completed-note">
                              <CheckCircle2 aria-hidden="true" size={15} />
                              Complete
                            </div>
                          ) : null}
                        </article>
                      ))
                    )}
                  </div>
                </section>
              );
            })
          )}
          </section>
        </div>
      </section>
    </main>
  );
}

type FieldProps = {
  children: ReactNode;
  error?: string;
  label: string;
};

function Field({ children, error, label }: FieldProps) {
  return (
    <label className="field">
      {label}
      {children}
      {error ? <span className="field-error">{error}</span> : null}
    </label>
  );
}
