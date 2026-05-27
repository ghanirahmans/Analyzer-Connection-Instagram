import { useMemo, useRef, useState } from "react";
import {
  ArrowDownAZ,
  ArrowUpAZ,
  BarChart3,
  Check,
  Clipboard,
  Download,
  FileJson,
  FolderOpen,
  Github,
  HeartHandshake,
  CircleHelp,
  RotateCcw,
  Search,
  ShieldCheck,
  Upload,
  UserCheck,
  UserMinus,
  Users,
  X,
} from "lucide-react";

const FILE_TYPES = {
  followers: {
    label: "Followers",
    filename: "followers_1.json",
    icon: Users,
  },
  following: {
    label: "Following",
    filename: "following.json",
    icon: UserCheck,
  },
};

const RESULT_TABS = [
  {
    id: "notFollowingBack",
    label: "Tidak Follow Back",
    icon: UserMinus,
    helper: "Akun yang Anda ikuti tetapi tidak mengikuti balik.",
  },
  {
    id: "youDontFollowBack",
    label: "Belum Anda Follow",
    icon: UserCheck,
    helper: "Akun yang mengikuti Anda tetapi belum Anda ikuti balik.",
  },
  {
    id: "mutuals",
    label: "Mutual",
    icon: HeartHandshake,
    helper: "Akun yang saling mengikuti dengan Anda.",
  },
];

function extractUsername(item) {
  const stringListUsername = item?.string_list_data?.find(
    (entry) => entry?.value,
  )?.value;

  return (
    stringListUsername || item?.title || item?.value || item?.username || null
  );
}

function uniqueSortedUsernames(values) {
  return [...new Set(values.filter(Boolean))]
    .map((name) => String(name).trim())
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));
}

function parseInstagramUsernames(rawData, type) {
  const data = typeof rawData === "string" ? JSON.parse(rawData) : rawData;
  const list =
    type === "following"
      ? (data.relationships_following ?? data)
      : (data.relationships_followers ?? data);

  if (!Array.isArray(list)) {
    throw new Error("Struktur JSON tidak sesuai dengan export Instagram.");
  }

  const usernames = uniqueSortedUsernames(list.map(extractUsername));

  if (!usernames.length) {
    throw new Error(
      "File terbaca, tapi username tidak ditemukan. Pastikan file berasal dari menu Followers and following dan formatnya JSON.",
    );
  }

  return usernames;
}

function analyzeConnections(followers, following) {
  const followersSet = new Set(followers);
  const followingSet = new Set(following);

  return {
    followers,
    following,
    mutuals: followers.filter((username) => followingSet.has(username)),
    notFollowingBack: following.filter(
      (username) => !followersSet.has(username),
    ),
    youDontFollowBack: followers.filter(
      (username) => !followingSet.has(username),
    ),
  };
}

function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("File tidak bisa dibaca."));
    reader.readAsText(file);
  });
}

function downloadText(filename, content, type = "text/plain;charset=utf-8") {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function toCsv(usernames) {
  return [
    "username",
    ...usernames.map((username) => `"${username.replaceAll('"', '""')}"`),
  ].join("\n");
}

function App() {
  const isLocalDev = import.meta.env.DEV;
  const [files, setFiles] = useState({ followers: null, following: null });
  const [data, setData] = useState({ followers: [], following: [] });
  const [activeTab, setActiveTab] = useState("notFollowingBack");
  const [query, setQuery] = useState("");
  const [sortDirection, setSortDirection] = useState("asc");
  const [status, setStatus] = useState({ type: "idle", message: "" });
  const [copied, setCopied] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const followersInputRef = useRef(null);
  const followingInputRef = useRef(null);

  const hasBothFiles = data.followers.length > 0 && data.following.length > 0;

  const analysis = useMemo(
    () => analyzeConnections(data.followers, data.following),
    [data.followers, data.following],
  );

  const activeResult = analysis[activeTab] ?? [];
  const filteredResult = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const result = normalizedQuery
      ? activeResult.filter((username) =>
          username.toLowerCase().includes(normalizedQuery),
        )
      : activeResult;

    return [...result].sort((a, b) => {
      const compared = a.localeCompare(b);
      return sortDirection === "asc" ? compared : -compared;
    });
  }, [activeResult, query, sortDirection]);

  const followBackRate = analysis.following.length
    ? Math.round((analysis.mutuals.length / analysis.following.length) * 100)
    : 0;

  async function handleFile(type, file) {
    if (!file) return;

    try {
      const content = await readFileAsText(file);
      const usernames = parseInstagramUsernames(content, type);

      if (usernames.length === 0) {
        throw new Error("Tidak ada username yang terbaca dari file ini.");
      }

      setFiles((current) => ({ ...current, [type]: file }));
      setData((current) => ({ ...current, [type]: usernames }));
      setStatus({
        type: "success",
        message: `${FILE_TYPES[type].label} terbaca: ${usernames.length.toLocaleString("id-ID")} akun.`,
      });
    } catch (error) {
      setStatus({
        type: "error",
        message: `${FILE_TYPES[type].filename} gagal diproses. ${error.message}`,
      });
    }
  }

  async function loadFromDataFolder() {
    try {
      setStatus({ type: "idle", message: "Membaca file dari folder data..." });

      const [followersResponse, followingResponse] = await Promise.all([
        fetch("/data/followers_1.json"),
        fetch("/data/following.json"),
      ]);

      if (!followersResponse.ok || !followingResponse.ok) {
        throw new Error(
          "Pastikan data/followers_1.json dan data/following.json tersedia.",
        );
      }

      const [followersContent, followingContent] = await Promise.all([
        followersResponse.text(),
        followingResponse.text(),
      ]);

      const followers = parseInstagramUsernames(followersContent, "followers");
      const following = parseInstagramUsernames(followingContent, "following");

      setFiles({
        followers: { name: "data/followers_1.json" },
        following: { name: "data/following.json" },
      });
      setData({ followers, following });
      setStatus({
        type: "success",
        message: `Data folder terbaca: ${followers.length.toLocaleString("id-ID")} followers dan ${following.length.toLocaleString("id-ID")} following.`,
      });
    } catch (error) {
      setStatus({
        type: "error",
        message: `Gagal membaca folder data. ${error.message}`,
      });
    }
  }

  function handleDrop(event, type) {
    event.preventDefault();
    handleFile(type, event.dataTransfer.files?.[0]);
  }

  function resetAll() {
    setFiles({ followers: null, following: null });
    setData({ followers: [], following: [] });
    setQuery("");
    setActiveTab("notFollowingBack");
    setStatus({ type: "idle", message: "" });

    if (followersInputRef.current) followersInputRef.current.value = "";
    if (followingInputRef.current) followingInputRef.current.value = "";
  }

  async function copyResult() {
    await navigator.clipboard.writeText(filteredResult.join("\n"));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  function exportResult() {
    downloadText(
      `${activeTab}.csv`,
      toCsv(filteredResult),
      "text/csv;charset=utf-8",
    );
  }

  return (
    <main className="app-shell">
      <section className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">Instagram Connection Analyzer</p>
            <h1>Analisis followers dan following dari file JSON Instagram.</h1>
          </div>
          <div className="topbar-actions">
            <button
              type="button"
              className="help-button"
              onClick={() => setIsGuideOpen(true)}
            >
              <CircleHelp size={18} />
              Cara dapat JSON
            </button>
            <a
              className="github-link"
              href="https://github.com/ghanirahmans/Analyzer-Connection-Instagram"
              target="_blank"
              rel="noreferrer"
            >
              <Github size={18} />
              GitHub
            </a>
          </div>
        </header>

        {isLocalDev && (
          <section
            className="data-folder-bar"
            aria-label="Muat dari folder data"
          >
            <div>
              <strong>Folder data local dev</strong>
              <span>
                Simpan file di data/followers_1.json dan data/following.json
                untuk dibaca otomatis saat npm run dev.
              </span>
            </div>
            <button type="button" onClick={loadFromDataFolder}>
              <FolderOpen size={18} />
              Muat data
            </button>
          </section>
        )}

        <section className="privacy-bar" aria-label="Privasi data">
          <ShieldCheck size={22} />
          <div>
            <strong>Data diproses lokal di browser</strong>
            <span>
              File yang dipilih user tidak dikirim ke server, dan tidak disimpan
              oleh aplikasi.
            </span>
          </div>
        </section>

        <section className="upload-grid" aria-label="Upload file Instagram">
          <FileDrop
            refInput={followersInputRef}
            type="followers"
            file={files.followers}
            count={data.followers.length}
            onFile={handleFile}
            onDrop={handleDrop}
          />
          <FileDrop
            refInput={followingInputRef}
            type="following"
            file={files.following}
            count={data.following.length}
            onFile={handleFile}
            onDrop={handleDrop}
          />
        </section>

        {status.message && (
          <div className={`notice ${status.type}`} role="status">
            {status.type === "error" ? <X size={18} /> : <Check size={18} />}
            <span>{status.message}</span>
          </div>
        )}

        <section className="summary-grid" aria-label="Ringkasan analisis">
          <Metric
            icon={Users}
            label="Followers"
            value={analysis.followers.length}
            tone="green"
          />
          <Metric
            icon={UserCheck}
            label="Following"
            value={analysis.following.length}
            tone="blue"
          />
          <Metric
            icon={HeartHandshake}
            label="Mutual"
            value={analysis.mutuals.length}
            tone="violet"
          />
          <Metric
            icon={UserMinus}
            label="Tidak follow back"
            value={analysis.notFollowingBack.length}
            tone="red"
          />
        </section>

        <section className="insight-strip" aria-label="Skor follow back">
          <div className="insight-heading">
            <div>
              <span className="section-kicker">Follow back rate</span>
              <strong>{followBackRate}%</strong>
            </div>
            <ShieldCheck size={22} />
          </div>
          <div className="progress-track" aria-hidden="true">
            <div
              className="progress-fill"
              style={{ width: `${followBackRate}%` }}
            />
          </div>
          <p>
            {hasBothFiles
              ? `${analysis.mutuals.length.toLocaleString("id-ID")} dari ${analysis.following.length.toLocaleString("id-ID")} akun yang Anda ikuti juga mengikuti balik.`
              : "Upload dua file JSON untuk melihat hasil analisis."}
          </p>
        </section>

        <section className="results-panel" aria-label="Hasil analisis">
          <div className="panel-head">
            <div>
              <span className="section-kicker">Hasil</span>
              <h2>{RESULT_TABS.find((tab) => tab.id === activeTab)?.label}</h2>
            </div>
            <div className="actions">
              <button
                type="button"
                className="icon-button"
                onClick={() =>
                  setSortDirection(sortDirection === "asc" ? "desc" : "asc")
                }
                title="Ubah urutan"
              >
                {sortDirection === "asc" ? (
                  <ArrowDownAZ size={18} />
                ) : (
                  <ArrowUpAZ size={18} />
                )}
              </button>
              <button
                type="button"
                className="icon-button"
                onClick={copyResult}
                disabled={!filteredResult.length}
                title="Salin hasil"
              >
                {copied ? <Check size={18} /> : <Clipboard size={18} />}
              </button>
              <button
                type="button"
                className="icon-button"
                onClick={exportResult}
                disabled={!filteredResult.length}
                title="Download CSV"
              >
                <Download size={18} />
              </button>
              <button
                type="button"
                className="icon-button danger"
                onClick={resetAll}
                title="Reset"
              >
                <RotateCcw size={18} />
              </button>
            </div>
          </div>

          <div className="tabs" role="tablist" aria-label="Kategori hasil">
            {RESULT_TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  className={activeTab === tab.id ? "tab active" : "tab"}
                  onClick={() => setActiveTab(tab.id)}
                  role="tab"
                  aria-selected={activeTab === tab.id}
                >
                  <Icon size={17} />
                  <span>{tab.label}</span>
                  <strong>{analysis[tab.id].length}</strong>
                </button>
              );
            })}
          </div>

          <div className="search-row">
            <Search size={18} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Cari username"
              aria-label="Cari username"
            />
          </div>

          <div className="result-meta">
            <p>{RESULT_TABS.find((tab) => tab.id === activeTab)?.helper}</p>
            <span>{filteredResult.length.toLocaleString("id-ID")} akun</span>
          </div>

          <UserList
            users={filteredResult}
            empty={
              !hasBothFiles
                ? "Upload followers_1.json dan following.json."
                : "Tidak ada username yang cocok."
            }
          />
        </section>

        <footer className="app-footer">
          Program ini dibuat dan dikembangkan oleh <strong>ghanirahmans</strong>{" "}
          untuk keperluan portofolio.
        </footer>
      </section>

      {isGuideOpen && <GuideModal onClose={() => setIsGuideOpen(false)} />}
    </main>
  );
}

function GuideModal({ onClose }) {
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="guide-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="guide-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="modal-head">
          <div>
            <span className="section-kicker">Panduan data Instagram</span>
            <h2 id="guide-title">Cara mendapatkan file JSON</h2>
          </div>
          <button
            type="button"
            className="icon-button"
            onClick={onClose}
            title="Tutup"
          >
            <X size={18} />
          </button>
        </div>

        <ol className="guide-steps">
          <li>Buka Instagram, lalu masuk ke Settings and privacy.</li>
          <li>Pilih Accounts Center.</li>
          <li>Buka Your information and permissions.</li>
          <li>Pilih Download your information.</li>
          <li>Buat request download untuk akun Instagram yang ingin dicek.</li>
          <li>Pilih Select types of information.</li>
          <li>Centang Followers and following saja.</li>
          <li>Pastikan format download adalah JSON, lalu submit request.</li>
          <li>Setelah file ZIP siap, download dan ekstrak.</li>
          <li>
            Cari folder followers_and_following, lalu gunakan followers_1.json
            dan following.json di aplikasi ini.
          </li>
        </ol>

        <div className="modal-note">
          <ShieldCheck size={18} />
          <p>
            File dipilih dari browser user dan diproses lokal. Aplikasi tidak
            mengupload file JSON ke server.
          </p>
        </div>
      </section>
    </div>
  );
}

function FileDrop({ refInput, type, file, count, onFile, onDrop }) {
  const config = FILE_TYPES[type];
  const Icon = config.icon;

  return (
    <label
      className="drop-zone"
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => onDrop(event, type)}
    >
      <input
        ref={refInput}
        type="file"
        accept=".json,application/json"
        onChange={(event) => onFile(type, event.target.files?.[0])}
      />
      <span className="drop-icon">
        <Icon size={22} />
      </span>
      <span className="drop-copy">
        <strong>{config.label}</strong>
        <small>{file ? file.name : config.filename}</small>
      </span>
      <span className="drop-action">
        {count ? (
          `${count.toLocaleString("id-ID")} akun`
        ) : (
          <>
            <Upload size={16} /> Pilih
          </>
        )}
      </span>
    </label>
  );
}

function Metric({ icon: Icon, label, value, tone }) {
  return (
    <article className={`metric ${tone}`}>
      <div>
        <span>{label}</span>
        <strong>{value.toLocaleString("id-ID")}</strong>
      </div>
      <Icon size={22} />
    </article>
  );
}

function UserList({ users, empty }) {
  if (!users.length) {
    return (
      <div className="empty-state">
        <BarChart3 size={28} />
        <p>{empty}</p>
      </div>
    );
  }

  return (
    <ul className="user-list">
      {users.map((username) => (
        <li key={username}>
          <FileJson size={16} />
          <span>@{username}</span>
          <a
            href={`https://www.instagram.com/${username}/`}
            target="_blank"
            rel="noreferrer"
          >
            Buka
          </a>
        </li>
      ))}
    </ul>
  );
}

export default App;
