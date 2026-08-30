"use client";

import {
  Check,
  Cloud,
  ExternalLink,
  GitBranch,
  Heart,
  House,
  LayoutGrid,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";

type Tab = "home" | "apps" | "live" | "settings";

type Repo = {
  id: string;
  name: string;
  description: string;
  icon: string;
  githubUrl: string;
  cloudflareUrl: string;
  tone: string;
};

const STORAGE_KEY = "pika-repo-favourites";

const defaultRepos: Repo[] = [
  { id: "pika-flights", name: "Pika Flights", description: "Flight plans, packing checklists and baggage calculator.", icon: "✈️", githubUrl: "https://github.com/naz1234/pika-flights", cloudflareUrl: "", tone: "blue" },
  { id: "pika-car-maint", name: "Pika Car Maint", description: "A simple home for car maintenance records and checklists.", icon: "🚙", githubUrl: "https://github.com/naz1234/pika-car-Maint", cloudflareUrl: "", tone: "mint" },
  { id: "pika-places", name: "Pika Places", description: "Save interesting places found on TikTok, Facebook and more.", icon: "📍", githubUrl: "https://github.com/naz1234/pika-places", cloudflareUrl: "", tone: "pink" },
  { id: "pika-note", name: "Pika Note", description: "Public shared notes in a quick mobile-friendly workspace.", icon: "📝", githubUrl: "https://github.com/naz1234/pika-note", cloudflareUrl: "", tone: "yellow" },
  { id: "pika-calendar", name: "Pika Calendar", description: "Salary calendar with expected and received pay tracking.", icon: "📅", githubUrl: "https://github.com/naz1234/pika-calendar", cloudflareUrl: "", tone: "purple" },
  { id: "pika-checklist", name: "Pika Checklist", description: "Everyday lists, organised and easy to check on the go.", icon: "✅", githubUrl: "https://github.com/naz1234/Pika-checklist", cloudflareUrl: "", tone: "coral" },
];

const emptyForm = { name: "", description: "", icon: "⭐", githubUrl: "", cloudflareUrl: "" };
const toneCycle = ["blue", "mint", "pink", "yellow", "purple", "coral"];

export default function Home() {
  const [tab, setTab] = useState<Tab>("home");
  const [repos, setRepos] = useState<Repo[]>(defaultRepos);
  const [query, setQuery] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [ready, setReady] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const parsed: unknown = JSON.parse(saved);
          if (Array.isArray(parsed)) setRepos(parsed as Repo[]);
        } catch {
          setRepos(defaultRepos);
        }
      }
      setReady(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (ready) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(repos));
  }, [ready, repos]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 2400);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const filteredRepos = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return repos;
    return repos.filter((repo) => `${repo.name} ${repo.description}`.toLowerCase().includes(value));
  }, [query, repos]);

  const liveRepos = repos.filter((repo) => Boolean(repo.cloudflareUrl));
  const pendingRepos = repos.filter((repo) => !repo.cloudflareUrl);

  function changeTab(nextTab: Tab) {
    setTab(nextTab);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function openAddForm() {
    setEditingId(null);
    setForm(emptyForm);
    setFormOpen(true);
  }

  function openEditForm(repo: Repo) {
    setEditingId(repo.id);
    setForm({ name: repo.name, description: repo.description, icon: repo.icon, githubUrl: repo.githubUrl, cloudflareUrl: repo.cloudflareUrl });
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditingId(null);
    setForm(emptyForm);
  }

  function saveRepo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextRepo: Repo = {
      id: editingId ?? `${Date.now()}`,
      name: form.name.trim(),
      description: form.description.trim(),
      icon: form.icon.trim() || "⭐",
      githubUrl: form.githubUrl.trim(),
      cloudflareUrl: form.cloudflareUrl.trim(),
      tone: editingId
        ? (repos.find((repo) => repo.id === editingId)?.tone ?? "blue")
        : (toneCycle[repos.length % toneCycle.length] ?? "blue"),
    };

    setRepos((current) => editingId
      ? current.map((repo) => (repo.id === editingId ? nextRepo : repo))
      : [nextRepo, ...current]);
    setToast(editingId ? "Favourite updated." : "Favourite added.");
    closeForm();
  }

  function removeRepo(repo: Repo) {
    if (!window.confirm(`Remove ${repo.name} from your favourites?`)) return;
    setRepos((current) => current.filter((item) => item.id !== repo.id));
    setToast("Favourite removed.");
  }

  function resetRepos() {
    if (!window.confirm("Restore the original Pika favourites?")) return;
    setRepos(defaultRepos);
    setToast("Original favourites restored.");
  }

  function RepoCard({ repo, compact = false }: { repo: Repo; compact?: boolean }) {
    return (
      <article className={`repo-card tone-${repo.tone} ${compact ? "compact" : ""}`}>
        <div className="repo-card-head">
          <span className="repo-icon" aria-hidden="true">{repo.icon}</span>
          <span className="repo-copy"><strong>{repo.name}</strong><small>{repo.description}</small></span>
          {!compact && (
            <span className="repo-actions">
              <button type="button" onClick={() => openEditForm(repo)} aria-label={`Edit ${repo.name}`} title="Edit"><Pencil size={17} /></button>
              <button type="button" onClick={() => removeRepo(repo)} aria-label={`Remove ${repo.name}`} title="Remove"><Trash2 size={17} /></button>
            </span>
          )}
        </div>
        <div className="repo-links">
          <a href={repo.githubUrl} target="_blank" rel="noreferrer"><GitBranch size={18} /> GitHub <ExternalLink size={14} /></a>
          {repo.cloudflareUrl ? (
            <a className="cloudflare-link" href={repo.cloudflareUrl} target="_blank" rel="noreferrer"><Cloud size={18} /> Open app <ExternalLink size={14} /></a>
          ) : (
            <button className="cloudflare-link pending" type="button" onClick={() => openEditForm(repo)}><Cloud size={18} /> Add live link</button>
          )}
        </div>
      </article>
    );
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand-mark"><Image src="/app-icon.png" alt="Pika Repo" width={60} height={60} priority unoptimized /></div>
        <div><p className="eyebrow">My favourites</p><h1>Pika Repo</h1></div>
        <button className="add-top" type="button" onClick={openAddForm} aria-label="Add favourite" title="Add favourite"><Plus size={22} /></button>
      </header>

      <main className="main-content">
        {tab === "home" && (
          <section className="page-section">
            <div className="hero-card">
              <div className="hero-heading">
                <span className="hero-kicker"><Heart size={14} /> Family apps</span>
                <span className="hero-sparkle" aria-hidden="true"><Sparkles size={22} /></span>
              </div>
              <div className="hero-balance">
                <p className="hero-label">Favourite collection</p>
                <strong className="hero-amount">{repos.length} apps</strong>
                <p className="hero-sub">GitHub projects and Cloudflare links together.</p>
              </div>
              <Image className="hero-icon" src="/app-icon.png" alt="" width={82} height={82} priority unoptimized />
              <div className="hero-stats">
                <div><span>GitHub repos</span><strong>{repos.length}</strong></div>
                <div><span>Live apps</span><strong>{liveRepos.length}</strong></div>
              </div>
            </div>

            <div className="section-heading">
              <div><p className="eyebrow">Quick access</p><h2>Favourite apps</h2></div>
              <span className="count-pill">{repos.length}</span>
            </div>
            <div className="repo-stack">{repos.slice(0, 3).map((repo) => <RepoCard key={repo.id} repo={repo} compact />)}</div>
            <button className="view-all" type="button" onClick={() => changeTab("apps")}><LayoutGrid size={19} /> View all favourites</button>

            <div className="public-note">
              <ShieldCheck size={22} />
              <span><strong>Public and simple</strong><small>No login is needed. Your edits stay on this device.</small></span>
            </div>
          </section>
        )}

        {tab === "apps" && (
          <section className="page-section">
            <div className="page-title with-action">
              <div><p className="eyebrow">All projects</p><h2>Favourite apps</h2><p>{repos.length} saved repositories</p></div>
              <button className="square-add" type="button" onClick={openAddForm} aria-label="Add favourite"><Plus size={22} /></button>
            </div>

            <div className="search-wrap">
              <Search size={19} aria-hidden="true" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search my apps..." aria-label="Search favourite apps" />
              {query && <button type="button" onClick={() => setQuery("")} aria-label="Clear search"><X size={17} /></button>}
            </div>
            <div className="repo-stack spaced">{filteredRepos.map((repo) => <RepoCard key={repo.id} repo={repo} />)}</div>

            {!filteredRepos.length && (
              <div className="empty-state">
                <span><Search size={28} /></span><h3>No apps found</h3><p>Try another search or add a new favourite.</p>
                <button className="primary-button" type="button" onClick={openAddForm}><Plus size={18} /> Add favourite</button>
              </div>
            )}
          </section>
        )}

        {tab === "live" && (
          <section className="page-section">
            <div className="page-title"><p className="eyebrow">Cloudflare</p><h2>Live apps</h2><p>Open deployed apps or add their Cloudflare links.</p></div>

            <div className="live-summary">
              <span className="summary-icon"><Cloud size={24} /></span>
              <span><small>Connected links</small><strong>{liveRepos.length} of {repos.length}</strong></span>
              <span className="summary-pill">{pendingRepos.length} pending</span>
            </div>

            {liveRepos.length > 0 && (
              <><p className="group-label">Ready to open</p><div className="link-list">
                {liveRepos.map((repo) => (
                  <a href={repo.cloudflareUrl} target="_blank" rel="noreferrer" className="link-list-row" key={repo.id}>
                    <span className={`repo-icon tone-${repo.tone}`}>{repo.icon}</span>
                    <span><strong>{repo.name}</strong><small>{repo.cloudflareUrl.replace(/^https?:\/\//, "")}</small></span>
                    <ExternalLink size={18} />
                  </a>
                ))}
              </div></>
            )}

            {pendingRepos.length > 0 && (
              <><p className="group-label pending-label">Needs a live link</p><div className="link-list">
                {pendingRepos.map((repo) => (
                  <button className="link-list-row" type="button" onClick={() => openEditForm(repo)} key={repo.id}>
                    <span className={`repo-icon tone-${repo.tone}`}>{repo.icon}</span>
                    <span><strong>{repo.name}</strong><small>Add Cloudflare URL</small></span>
                    <Plus size={18} />
                  </button>
                ))}
              </div></>
            )}
          </section>
        )}

        {tab === "settings" && (
          <section className="page-section">
            <div className="page-title"><p className="eyebrow">About & data</p><h2>Settings</h2><p>Manage this public collection on your device.</p></div>
            <p className="group-label">App access</p>
            <div className="settings-card">
              <div className="setting-row"><span className="setting-icon green"><ShieldCheck size={19} /></span><span><strong>No login</strong><small>Anyone with the link can open the app</small></span><Check size={18} /></div>
              <div className="setting-row"><span className="setting-icon blue"><GitBranch size={19} /></span><span><strong>GitHub projects</strong><small>{repos.length} repository links saved</small></span><Check size={18} /></div>
              <div className="setting-row"><span className="setting-icon pink"><Cloud size={19} /></span><span><strong>Cloudflare apps</strong><small>{liveRepos.length} live links connected</small></span><Check size={18} /></div>
            </div>
            <div className="public-note settings-note"><ShieldCheck size={22} /><span><strong>Saved on this device</strong><small>Changes use browser storage and do not need an account.</small></span></div>
            <button className="danger-button" type="button" onClick={resetRepos}><RotateCcw size={17} /> Restore original favourites</button>
          </section>
        )}
      </main>

      <nav className="bottom-nav" aria-label="Main navigation">
        {([ ["home", House, "Home"], ["apps", LayoutGrid, "Apps"], ["live", Cloud, "Live"], ["settings", Settings, "Settings"] ] as const).map(([value, Icon, label]) => (
          <button key={value} type="button" className={tab === value ? "active" : ""} aria-current={tab === value ? "page" : undefined} onClick={() => changeTab(value)}><Icon size={21} /><span>{label}</span></button>
        ))}
      </nav>

      {formOpen && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) closeForm(); }}>
          <form className="modal-sheet" onSubmit={saveRepo}>
            <div className="sheet-handle" />
            <div className="modal-title">
              <div><p className="eyebrow">{editingId ? "Update app" : "New favourite"}</p><h2>{editingId ? "Edit repository" : "Add repository"}</h2></div>
              <button type="button" onClick={closeForm} aria-label="Close"><X size={21} /></button>
            </div>
            <div className="form-grid">
              <label className="icon-field"><span>Icon</span><input value={form.icon} onChange={(event) => setForm({ ...form, icon: event.target.value })} maxLength={8} aria-label="App emoji icon" /></label>
              <label><span>App name</span><input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Pika App" /></label>
            </div>
            <label><span>Short description</span><input value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="What this app is for" /></label>
            <label><span>GitHub link</span><input required type="url" inputMode="url" value={form.githubUrl} onChange={(event) => setForm({ ...form, githubUrl: event.target.value })} placeholder="https://github.com/..." /></label>
            <label><span>Cloudflare link</span><input type="url" inputMode="url" value={form.cloudflareUrl} onChange={(event) => setForm({ ...form, cloudflareUrl: event.target.value })} placeholder="https://your-app.pages.dev" /></label>
            <button className="primary-button full tall" type="submit"><Check size={20} /> Save favourite</button>
          </form>
        </div>
      )}

      {toast && <div className="toast" role="status"><Check size={18} />{toast}</div>}
    </div>
  );
}
