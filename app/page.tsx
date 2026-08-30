"use client";

import {
  Check,
  Cloud,
  ExternalLink,
  GitBranch,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";

type Repo = {
  id: string;
  name: string;
  description: string;
  icon: string;
  githubUrl: string;
  cloudflareUrl: string;
  tone: string;
};

const defaultRepos: Repo[] = [
  {
    id: "pika-flights",
    name: "Pika Flights",
    description: "Flight plans, packing checklists and baggage calculator.",
    icon: "✈️",
    githubUrl: "https://github.com/naz1234/pika-flights",
    cloudflareUrl: "",
    tone: "blue",
  },
  {
    id: "pika-car-maint",
    name: "Pika Car Maint",
    description: "A simple home for car maintenance records and checklists.",
    icon: "🚙",
    githubUrl: "https://github.com/naz1234/pika-car-Maint",
    cloudflareUrl: "",
    tone: "mint",
  },
  {
    id: "pika-places",
    name: "Pika Places",
    description: "Save interesting places found on TikTok, Facebook and more.",
    icon: "📍",
    githubUrl: "https://github.com/naz1234/pika-places",
    cloudflareUrl: "",
    tone: "pink",
  },
  {
    id: "pika-note",
    name: "Pika Note",
    description: "Public shared notes in a quick mobile-friendly workspace.",
    icon: "📝",
    githubUrl: "https://github.com/naz1234/pika-note",
    cloudflareUrl: "",
    tone: "yellow",
  },
  {
    id: "pika-calendar",
    name: "Pika Calendar",
    description: "Salary calendar with expected and received pay tracking.",
    icon: "📅",
    githubUrl: "https://github.com/naz1234/pika-calendar",
    cloudflareUrl: "",
    tone: "purple",
  },
  {
    id: "pika-checklist",
    name: "Pika Checklist",
    description: "Everyday lists, organised and easy to check on the go.",
    icon: "✅",
    githubUrl: "https://github.com/naz1234/Pika-checklist",
    cloudflareUrl: "",
    tone: "coral",
  },
];

const emptyForm = {
  name: "",
  description: "",
  icon: "⭐",
  githubUrl: "",
  cloudflareUrl: "",
};

export default function Home() {
  const [repos, setRepos] = useState<Repo[]>(defaultRepos);
  const [query, setQuery] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem("pika-repo-favourites");
    if (saved) {
      try {
        setRepos(JSON.parse(saved));
      } catch {
        setRepos(defaultRepos);
      }
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) {
      window.localStorage.setItem("pika-repo-favourites", JSON.stringify(repos));
    }
  }, [ready, repos]);

  const filteredRepos = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return repos;
    return repos.filter((repo) =>
      `${repo.name} ${repo.description}`.toLowerCase().includes(value),
    );
  }, [query, repos]);

  function openAddForm() {
    setEditingId(null);
    setForm(emptyForm);
    setFormOpen(true);
  }

  function openEditForm(repo: Repo) {
    setEditingId(repo.id);
    setForm({
      name: repo.name,
      description: repo.description,
      icon: repo.icon,
      githubUrl: repo.githubUrl,
      cloudflareUrl: repo.cloudflareUrl,
    });
    setFormOpen(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
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
        : (["blue", "mint", "pink", "yellow", "purple", "coral"][repos.length % 6] ?? "blue"),
    };

    setRepos((current) =>
      editingId
        ? current.map((repo) => (repo.id === editingId ? nextRepo : repo))
        : [nextRepo, ...current],
    );
    closeForm();
  }

  function removeRepo(id: string) {
    setRepos((current) => current.filter((repo) => repo.id !== id));
  }

  return (
    <main className="app-shell">
      <section className="hero" aria-labelledby="page-title">
        <div className="hero-orb hero-orb-one" />
        <div className="hero-orb hero-orb-two" />

        <div className="topbar">
          <div className="brand-lockup">
            <img className="brand-icon" src="/app-icon.png" alt="Pika GitHub family app icon" />
            <div>
              <p className="eyebrow">MY FAVOURITES</p>
              <h1 id="page-title">Pika Repo</h1>
            </div>
          </div>
          <button className="icon-button" type="button" onClick={openAddForm} aria-label="Add a favourite repository">
            <Plus size={22} strokeWidth={2.5} />
          </button>
        </div>

        <p className="hero-copy">All my favourite apps, code and live Cloudflare links in one happy place.</p>

        <div className="status-row">
          <span><span className="status-dot" /> Public</span>
          <span>No sign-in</span>
          <span>{repos.length} apps</span>
        </div>

        {formOpen && (
          <form className="repo-form" onSubmit={saveRepo}>
            <div className="form-heading">
              <div>
                <p className="eyebrow">{editingId ? "UPDATE APP" : "NEW FAVOURITE"}</p>
                <h2>{editingId ? "Edit repository" : "Add repository"}</h2>
              </div>
              <button className="plain-icon-button" type="button" onClick={closeForm} aria-label="Close form">
                <X size={20} />
              </button>
            </div>

            <div className="form-grid">
              <label className="icon-field">
                <span>Icon</span>
                <input
                  value={form.icon}
                  onChange={(event) => setForm({ ...form, icon: event.target.value })}
                  maxLength={8}
                  aria-label="App emoji icon"
                />
              </label>
              <label>
                <span>App name</span>
                <input
                  required
                  value={form.name}
                  onChange={(event) => setForm({ ...form, name: event.target.value })}
                  placeholder="Pika App"
                />
              </label>
            </div>
            <label>
              <span>Short description</span>
              <input
                value={form.description}
                onChange={(event) => setForm({ ...form, description: event.target.value })}
                placeholder="What this app is for"
              />
            </label>
            <label>
              <span>GitHub link</span>
              <input
                required
                type="url"
                inputMode="url"
                value={form.githubUrl}
                onChange={(event) => setForm({ ...form, githubUrl: event.target.value })}
                placeholder="https://github.com/..."
              />
            </label>
            <label>
              <span>Cloudflare link</span>
              <input
                type="url"
                inputMode="url"
                value={form.cloudflareUrl}
                onChange={(event) => setForm({ ...form, cloudflareUrl: event.target.value })}
                placeholder="https://your-app.pages.dev"
              />
            </label>
            <button className="save-button" type="submit">
              <Check size={18} /> Save favourite
            </button>
          </form>
        )}
      </section>

      <section className="content" aria-label="Favourite repositories">
        <div className="search-wrap">
          <Search size={19} aria-hidden="true" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search my apps..."
            aria-label="Search favourite repositories"
          />
          {query && (
            <button type="button" onClick={() => setQuery("")} aria-label="Clear search">
              <X size={17} />
            </button>
          )}
        </div>

        <div className="section-title-row">
          <div>
            <p className="eyebrow">QUICK ACCESS</p>
            <h2>Favourite apps</h2>
          </div>
          <span>{filteredRepos.length}</span>
        </div>

        <div className="repo-grid">
          {filteredRepos.map((repo) => (
            <article className={`repo-card tone-${repo.tone}`} key={repo.id}>
              <div className="card-top">
                <div className="repo-icon" aria-hidden="true">{repo.icon}</div>
                <div className="card-actions">
                  <button type="button" onClick={() => openEditForm(repo)} aria-label={`Edit ${repo.name}`}>
                    <Pencil size={16} />
                  </button>
                  <button type="button" onClick={() => removeRepo(repo.id)} aria-label={`Remove ${repo.name}`}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <h3>{repo.name}</h3>
              <p>{repo.description}</p>

              <div className="link-row">
                <a href={repo.githubUrl} target="_blank" rel="noreferrer">
                  <GitBranch size={18} /> GitHub <ExternalLink size={14} />
                </a>
                {repo.cloudflareUrl ? (
                  <a className="cloudflare-link" href={repo.cloudflareUrl} target="_blank" rel="noreferrer">
                    <Cloud size={18} /> Live <ExternalLink size={14} />
                  </a>
                ) : (
                  <button className="cloudflare-link pending" type="button" onClick={() => openEditForm(repo)}>
                    <Cloud size={18} /> Add live link
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>

        {filteredRepos.length === 0 && (
          <div className="empty-state">
            <span>🔎</span>
            <h3>No apps found</h3>
            <p>Try another search or add a new favourite.</p>
          </div>
        )}

        <button className="add-card" type="button" onClick={openAddForm}>
          <span><Plus size={20} /></span>
          <span>
            <strong>Add another favourite</strong>
            <small>Save its icon, GitHub and Cloudflare link</small>
          </span>
        </button>
      </section>

      <footer>
        <img src="/app-icon.png" alt="" />
        <span>Made with love for the Pika family</span>
        <span aria-hidden="true">♥</span>
      </footer>
    </main>
  );
}
