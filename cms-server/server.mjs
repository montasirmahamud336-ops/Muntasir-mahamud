import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import jwt from "jsonwebtoken";
import multer from "multer";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config({ path: path.resolve(__dirname, ".env"), override: true });

const PORT = Number(process.env.CMS_PORT || 4000);
const JWT_SECRET = String(process.env.CMS_JWT_SECRET || "change-this-cms-jwt-secret");
const ADMIN_USERNAME = String(process.env.CMS_ADMIN_USERNAME || "admin")
  .trim()
  .toLowerCase();
const ADMIN_PASSWORD = String(process.env.CMS_ADMIN_PASSWORD || "admin123");
const ADMIN_EMAIL = String(process.env.CMS_ADMIN_EMAIL || "admin@localhost.local")
  .trim()
  .toLowerCase();

const DATA_DIR = path.resolve(__dirname, "data");
const UPLOADS_DIR = path.resolve(__dirname, "uploads");
const DB_FILE = path.join(DATA_DIR, "cms-db.json");

const DEFAULT_SETTINGS = [
  { key: "public_site_name", value: "Muhammad Muntasir Mahmud" },
  { key: "public_default_seo_title", value: "Muhammad Muntasir Mahmud - Portfolio" },
  { key: "public_default_meta_description", value: "Technical and creative freelancer portfolio website." },
];

const SYSTEM_PAGE_SEEDS = [
  {
    title: "Home",
    slug: "home",
    seo_title: "Home",
    meta_description: "Home page",
    status: "published",
    page_type: "system",
    template_key: "home",
    use_builder: false,
  },
  {
    title: "About",
    slug: "about",
    seo_title: "About",
    meta_description: "About page",
    status: "published",
    page_type: "system",
    template_key: "about",
    use_builder: false,
  },
  {
    title: "Services",
    slug: "services",
    seo_title: "Services",
    meta_description: "Services page",
    status: "published",
    page_type: "system",
    template_key: "services",
    use_builder: false,
  },
  {
    title: "Portfolio",
    slug: "portfolio",
    seo_title: "Portfolio",
    meta_description: "Portfolio page",
    status: "published",
    page_type: "system",
    template_key: "portfolio",
    use_builder: false,
  },
  {
    title: "Reviews",
    slug: "reviews",
    seo_title: "Reviews",
    meta_description: "Reviews page",
    status: "published",
    page_type: "system",
    template_key: "reviews",
    use_builder: false,
  },
  {
    title: "Contact",
    slug: "contact",
    seo_title: "Contact",
    meta_description: "Contact page",
    status: "published",
    page_type: "system",
    template_key: "contact",
    use_builder: false,
  },
  {
    title: "Get Started",
    slug: "get-started",
    seo_title: "Get Started",
    meta_description: "Start your project",
    status: "published",
    page_type: "system",
    template_key: "get-started",
    use_builder: false,
  },
  {
    title: "Engineering Drawings",
    slug: "services/engineering-drawings",
    seo_title: "Engineering Drawings",
    meta_description: "Engineering drawings service",
    status: "published",
    page_type: "system",
    template_key: "services-engineering-drawings",
    use_builder: false,
  },
  {
    title: "Web Development",
    slug: "services/web-development",
    seo_title: "Web Development",
    meta_description: "Web development service",
    status: "published",
    page_type: "system",
    template_key: "services-web-development",
    use_builder: false,
  },
  {
    title: "Graphic Design",
    slug: "services/graphic-design",
    seo_title: "Graphic Design",
    meta_description: "Graphic design service",
    status: "published",
    page_type: "system",
    template_key: "services-graphic-design",
    use_builder: false,
  },
  {
    title: "Video Editing",
    slug: "services/video-editing",
    seo_title: "Video Editing",
    meta_description: "Video editing service",
    status: "published",
    page_type: "system",
    template_key: "services-video-editing",
    use_builder: false,
  },
];

const DEFAULT_TESTIMONIAL_SEEDS = [
  {
    client_name: "Tanvir Hasan",
    review_text:
      "Delivered my AutoCAD package ahead of schedule. The drawings were clean, accurate, and ready for submission.",
    rating: 5,
    status: "published",
  },
  {
    client_name: "Nabila Chowdhury",
    review_text:
      "Our business website now feels premium and converts better. Communication was fast and revisions were smooth.",
    rating: 5,
    status: "published",
  },
  {
    client_name: "Farhan Ahmed",
    review_text:
      "Great experience for video editing and social content. Quality output with consistent branding across all files.",
    rating: 4,
    status: "published",
  },
  {
    client_name: "Sadia Rahman",
    review_text:
      "Very professional with design and technical documentation. Strong attention to detail and reliable delivery.",
    rating: 5,
    status: "published",
  },
];

const DEFAULT_WORK_SEEDS = [
  {
    title: "Industrial P&ID Drawing",
    category: "engineering",
    description: "Complete piping and instrumentation diagram for a chemical processing plant.",
    client: "Rafsan Engineering",
    service_key: "autocad",
    status: "published",
  },
  {
    title: "Corporate Website Redesign",
    category: "web",
    description: "Modern responsive website for a consulting company with conversion-focused sections.",
    client: "NorthLine Consulting",
    service_key: "web",
    status: "published",
  },
  {
    title: "Automation Reporting Tool",
    category: "automation",
    description: "Python automation system for weekly data processing and report generation.",
    client: "DataGrid Labs",
    service_key: "automation",
    status: "published",
  },
  {
    title: "Brand Identity Package",
    category: "graphics",
    description: "Logo set, color system, and social post templates for a startup launch.",
    client: "StudioArc",
    service_key: "graphics",
    status: "published",
  },
  {
    title: "Product Promo Video",
    category: "video",
    description: "Fast-paced promotional edit with motion graphics and sound design.",
    client: "Pixel Bay",
    service_key: "video",
    status: "published",
  },
];

function ensureDirectories() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

function nowIso() {
  return new Date().toISOString();
}

function createId() {
  return crypto.randomUUID();
}

function slugify(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s/-]+/g, "")
    .replace(/\s+/g, "-")
    .replace(/\/+/g, "/")
    .replace(/^-+|-+$/g, "")
    .replace(/^\/+|\/+$/g, "");
}

function emptyPageContent() {
  return { sections: [] };
}

function baseDb() {
  return {
    pages: [],
    testimonials: [],
    works: [],
    media: [],
    settings: [],
    admins: [],
  };
}

function loadDb() {
  if (!fs.existsSync(DB_FILE)) {
    const initial = baseDb();
    applyDefaults(initial);
    saveDb(initial);
    return initial;
  }

  try {
    const raw = fs.readFileSync(DB_FILE, "utf8");
    const parsed = JSON.parse(raw);
    const db = { ...baseDb(), ...parsed };
    db.pages = Array.isArray(db.pages) ? db.pages : [];
    db.testimonials = Array.isArray(db.testimonials) ? db.testimonials : [];
    db.works = Array.isArray(db.works) ? db.works : [];
    db.media = Array.isArray(db.media) ? db.media : [];
    db.settings = Array.isArray(db.settings) ? db.settings : [];
    db.admins = Array.isArray(db.admins) ? db.admins : [];
    return db;
  } catch {
    const fallback = baseDb();
    applyDefaults(fallback);
    saveDb(fallback);
    return fallback;
  }
}

function saveDb(db) {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf8");
}

function applyDefaults(db) {
  let changed = false;
  const now = nowIso();

  for (const seed of SYSTEM_PAGE_SEEDS) {
    const exists = db.pages.find((page) => page.slug === seed.slug);
    if (!exists) {
      db.pages.push({
        id: createId(),
        ...seed,
        content: emptyPageContent(),
        created_at: now,
        updated_at: now,
      });
      changed = true;
    }
  }

  for (const setting of DEFAULT_SETTINGS) {
    const exists = db.settings.find((x) => x.setting_key === setting.key);
    if (!exists) {
      db.settings.push({
        id: createId(),
        setting_key: setting.key,
        setting_value: setting.value,
        created_at: now,
        updated_at: now,
      });
      changed = true;
    }
  }

  for (const seed of DEFAULT_TESTIMONIAL_SEEDS) {
    const exists = db.testimonials.find(
      (item) => item.client_name === seed.client_name && item.review_text === seed.review_text,
    );

    if (!exists) {
      db.testimonials.push({
        id: createId(),
        client_name: seed.client_name,
        client_photo_media_id: null,
        client_photo_url: null,
        review_text: seed.review_text,
        rating: seed.rating,
        status: seed.status,
        deleted_at: null,
        created_at: now,
        updated_at: now,
      });
      changed = true;
    }
  }

  for (const seed of DEFAULT_WORK_SEEDS) {
    const exists = db.works.find(
      (item) => item.title === seed.title && item.description === seed.description,
    );

    if (!exists) {
      db.works.push({
        id: createId(),
        title: seed.title,
        category: seed.category,
        description: seed.description,
        client: seed.client || null,
        image_media_id: null,
        image_url: null,
        service_key: seed.service_key || null,
        status: seed.status,
        deleted_at: null,
        created_at: now,
        updated_at: now,
      });
      changed = true;
    }
  }

  return changed;
}

function sanitizeStatus(value) {
  return value === "published" ? "published" : "draft";
}

function sanitizePageType(value) {
  return value === "system" ? "system" : "custom";
}

function sanitizeWorkCategory(value) {
  const clean = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "");
  return clean || "general";
}

function formatAdmin(admin) {
  return {
    id: admin.id,
    auth_user_id: admin.auth_user_id,
    username: admin.username,
    email: admin.email,
    full_name: admin.full_name || null,
    is_active: Boolean(admin.is_active),
  };
}

function makeAuthToken(admin) {
  return jwt.sign(
    {
      adminId: admin.id,
      username: admin.username,
    },
    JWT_SECRET,
    { expiresIn: "7d" },
  );
}

function parseAdminFromRequest(req) {
  const header = String(req.headers.authorization || "");
  if (!header.startsWith("Bearer ")) {
    return null;
  }

  const token = header.slice(7).trim();
  if (!token) {
    return null;
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    if (!payload || typeof payload !== "object" || !("adminId" in payload)) {
      return null;
    }

    const db = loadDb();
    const admin = db.admins.find((x) => x.id === payload.adminId && x.is_active);
    if (!admin) {
      return null;
    }

    return admin;
  } catch {
    return null;
  }
}

function requireAdmin(req, res, next) {
  const admin = parseAdminFromRequest(req);
  if (!admin) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  req.admin = admin;
  next();
}

function buildPagePayload(input, existing = null) {
  const title = input.title !== undefined ? String(input.title).trim() : existing?.title;
  const slugRaw = input.slug !== undefined ? input.slug : existing?.slug;
  const slug = slugify(slugRaw);

  if (!title) {
    return { error: "Page title is required." };
  }

  if (!slug) {
    return { error: "Page slug is required." };
  }

  const content =
    input.content !== undefined
      ? input.content
      : existing?.content || emptyPageContent();

  return {
    title,
    slug,
    seo_title:
      input.seo_title !== undefined
        ? input.seo_title
        : existing?.seo_title ?? null,
    meta_description:
      input.meta_description !== undefined
        ? input.meta_description
        : existing?.meta_description ?? null,
    status:
      input.status !== undefined
        ? sanitizeStatus(input.status)
        : sanitizeStatus(existing?.status),
    page_type:
      input.page_type !== undefined
        ? sanitizePageType(input.page_type)
        : sanitizePageType(existing?.page_type),
    template_key:
      input.template_key !== undefined
        ? input.template_key || null
        : existing?.template_key ?? null,
    use_builder:
      input.use_builder !== undefined
        ? Boolean(input.use_builder)
        : Boolean(existing?.use_builder),
    content:
      content && typeof content === "object"
        ? content
        : emptyPageContent(),
  };
}

function buildTestimonialPayload(input, existing = null) {
  const clientName =
    input.client_name !== undefined
      ? String(input.client_name).trim()
      : String(existing?.client_name || "").trim();
  const reviewText =
    input.review_text !== undefined
      ? String(input.review_text).trim()
      : String(existing?.review_text || "").trim();
  const ratingRaw =
    input.rating !== undefined ? Number(input.rating) : Number(existing?.rating || 0);
  const rating = Math.max(1, Math.min(5, Number.isFinite(ratingRaw) ? Math.round(ratingRaw) : 0));

  if (!clientName) {
    return { error: "Client name is required." };
  }

  if (!reviewText) {
    return { error: "Review text is required." };
  }

  if (rating < 1 || rating > 5) {
    return { error: "Rating must be between 1 and 5." };
  }

  return {
    client_name: clientName,
    client_photo_media_id:
      input.client_photo_media_id !== undefined
        ? input.client_photo_media_id || null
        : existing?.client_photo_media_id ?? null,
    client_photo_url:
      input.client_photo_url !== undefined
        ? input.client_photo_url || null
        : existing?.client_photo_url ?? null,
    review_text: reviewText,
    rating,
    status:
      input.status !== undefined
        ? sanitizeStatus(input.status)
        : sanitizeStatus(existing?.status),
    deleted_at: null,
  };
}

function buildWorkPayload(input, existing = null) {
  const title =
    input.title !== undefined
      ? String(input.title).trim()
      : String(existing?.title || "").trim();
  const description =
    input.description !== undefined
      ? String(input.description).trim()
      : String(existing?.description || "").trim();
  const category =
    input.category !== undefined
      ? sanitizeWorkCategory(input.category)
      : sanitizeWorkCategory(existing?.category);

  if (!title) {
    return { error: "Work title is required." };
  }

  if (!description) {
    return { error: "Work description is required." };
  }

  return {
    title,
    category,
    description,
    client:
      input.client !== undefined
        ? String(input.client || "").trim() || null
        : existing?.client ?? null,
    image_media_id:
      input.image_media_id !== undefined
        ? input.image_media_id || null
        : existing?.image_media_id ?? null,
    image_url:
      input.image_url !== undefined
        ? String(input.image_url || "").trim() || null
        : existing?.image_url ?? null,
    service_key:
      input.service_key !== undefined
        ? String(input.service_key || "").trim() || null
        : existing?.service_key ?? null,
    status:
      input.status !== undefined
        ? sanitizeStatus(input.status)
        : sanitizeStatus(existing?.status),
    deleted_at: null,
  };
}

const storage = multer.diskStorage({
  destination: (_, __, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (_, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase() || ".bin";
    const base = slugify(path.basename(file.originalname || "file", ext)) || "file";
    const random = crypto.randomBytes(4).toString("hex");
    cb(null, `${Date.now()}-${random}-${base}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
});

ensureDirectories();
const startupDb = loadDb();
if (applyDefaults(startupDb)) {
  saveDb(startupDb);
}

const app = express();

app.use(cors({ origin: true }));
app.use(express.json({ limit: "5mb" }));
app.use("/uploads", express.static(UPLOADS_DIR));

app.get("/api/health", (_, res) => {
  res.json({ ok: true, mode: "local-cms" });
});

app.post("/api/auth/login", (req, res) => {
  const username = String(req.body?.username || "")
    .trim()
    .toLowerCase();
  const password = String(req.body?.password || "");

  if (!username || !password) {
    res.status(400).json({ error: "Username and password are required." });
    return;
  }

  if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
    res.status(401).json({ error: "Invalid admin credentials." });
    return;
  }

  const db = loadDb();
  let admin = db.admins.find((x) => x.username === ADMIN_USERNAME);

  if (!admin) {
    const adminId = createId();
    admin = {
      id: adminId,
      auth_user_id: adminId,
      username: ADMIN_USERNAME,
      email: ADMIN_EMAIL,
      full_name: "Main Admin",
      is_active: true,
      created_at: nowIso(),
      updated_at: nowIso(),
    };
    db.admins.push(admin);
    saveDb(db);
  } else {
    admin.email = ADMIN_EMAIL;
    admin.is_active = true;
    admin.updated_at = nowIso();
    saveDb(db);
  }

  res.json({
    token: makeAuthToken(admin),
    admin: formatAdmin(admin),
  });
});

app.get("/api/auth/me", requireAdmin, (req, res) => {
  res.json(formatAdmin(req.admin));
});

app.post("/api/auth/logout", requireAdmin, (_, res) => {
  res.json({ ok: true });
});

app.post("/api/pages/ensure-system", requireAdmin, (_, res) => {
  const db = loadDb();
  const changed = applyDefaults(db);
  if (changed) {
    saveDb(db);
  }
  res.json({ ok: true, total_pages: db.pages.length });
});

app.get("/api/pages", requireAdmin, (_, res) => {
  const db = loadDb();
  const items = [...db.pages].sort((a, b) => a.created_at.localeCompare(b.created_at));
  res.json(items);
});

app.get("/api/pages/:id", requireAdmin, (req, res) => {
  const db = loadDb();
  const page = db.pages.find((x) => x.id === req.params.id);
  if (!page) {
    res.status(404).json({ error: "Page not found." });
    return;
  }
  res.json(page);
});

app.post("/api/pages", requireAdmin, (req, res) => {
  const db = loadDb();
  const payload = buildPagePayload(req.body || {});

  if (payload.error) {
    res.status(400).json({ error: payload.error });
    return;
  }

  if (db.pages.some((page) => page.slug === payload.slug)) {
    res.status(409).json({ error: "A page with this slug already exists." });
    return;
  }

  const page = {
    id: createId(),
    ...payload,
    created_at: nowIso(),
    updated_at: nowIso(),
  };

  db.pages.push(page);
  saveDb(db);
  res.json(page);
});

app.put("/api/pages/:id", requireAdmin, (req, res) => {
  const db = loadDb();
  const index = db.pages.findIndex((x) => x.id === req.params.id);
  if (index === -1) {
    res.status(404).json({ error: "Page not found." });
    return;
  }

  const existing = db.pages[index];
  const payload = buildPagePayload(req.body || {}, existing);
  if (payload.error) {
    res.status(400).json({ error: payload.error });
    return;
  }

  const duplicate = db.pages.find((page) => page.slug === payload.slug && page.id !== existing.id);
  if (duplicate) {
    res.status(409).json({ error: "A page with this slug already exists." });
    return;
  }

  db.pages[index] = {
    ...existing,
    ...payload,
    updated_at: nowIso(),
  };

  saveDb(db);
  res.json(db.pages[index]);
});

app.get("/api/public/pages/by-slug", (req, res) => {
  const slug = slugify(req.query.slug);
  const db = loadDb();
  const page = db.pages.find((x) => x.slug === slug && x.status === "published");
  res.json(page || null);
});

app.get("/api/public/pages/by-template", (req, res) => {
  const templateKey = String(req.query.templateKey || "").trim();
  const db = loadDb();
  const page = db.pages.find((x) => x.template_key === templateKey && x.status === "published");
  res.json(page || null);
});

app.get("/api/testimonials", requireAdmin, (req, res) => {
  const includeDraft = !["false", "0"].includes(String(req.query.includeDraft || "1"));
  const db = loadDb();
  let items = [...db.testimonials];
  if (!includeDraft) {
    items = items.filter((x) => x.status === "published" && !x.deleted_at);
  }
  items.sort((a, b) => b.created_at.localeCompare(a.created_at));
  res.json(items);
});

app.get("/api/public/testimonials", (_, res) => {
  const db = loadDb();
  const items = db.testimonials
    .filter((x) => x.status === "published" && !x.deleted_at)
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
  res.json(items);
});

app.post("/api/testimonials", requireAdmin, (req, res) => {
  const db = loadDb();
  const payload = buildTestimonialPayload(req.body || {});
  if (payload.error) {
    res.status(400).json({ error: payload.error });
    return;
  }

  const item = {
    id: createId(),
    ...payload,
    created_at: nowIso(),
    updated_at: nowIso(),
  };

  db.testimonials.push(item);
  saveDb(db);
  res.json(item);
});

app.put("/api/testimonials/:id", requireAdmin, (req, res) => {
  const db = loadDb();
  const index = db.testimonials.findIndex((x) => x.id === req.params.id);
  if (index === -1) {
    res.status(404).json({ error: "Testimonial not found." });
    return;
  }

  const payload = buildTestimonialPayload(req.body || {}, db.testimonials[index]);
  if (payload.error) {
    res.status(400).json({ error: payload.error });
    return;
  }

  db.testimonials[index] = {
    ...db.testimonials[index],
    ...payload,
    updated_at: nowIso(),
  };

  saveDb(db);
  res.json(db.testimonials[index]);
});

app.delete("/api/testimonials/:id", requireAdmin, (req, res) => {
  const db = loadDb();
  const index = db.testimonials.findIndex((x) => x.id === req.params.id);
  if (index === -1) {
    res.status(404).json({ error: "Testimonial not found." });
    return;
  }

  db.testimonials[index] = {
    ...db.testimonials[index],
    status: "draft",
    deleted_at: nowIso(),
    updated_at: nowIso(),
  };

  saveDb(db);
  res.json({ ok: true });
});

app.get("/api/works", requireAdmin, (req, res) => {
  const includeDraft = !["false", "0"].includes(String(req.query.includeDraft || "1"));
  const db = loadDb();
  let items = [...db.works];
  if (!includeDraft) {
    items = items.filter((x) => x.status === "published" && !x.deleted_at);
  }
  items.sort((a, b) => b.created_at.localeCompare(a.created_at));
  res.json(items);
});

app.get("/api/public/works", (_, res) => {
  const db = loadDb();
  const items = db.works
    .filter((x) => x.status === "published" && !x.deleted_at)
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
  res.json(items);
});

app.post("/api/works", requireAdmin, (req, res) => {
  const db = loadDb();
  const payload = buildWorkPayload(req.body || {});
  if (payload.error) {
    res.status(400).json({ error: payload.error });
    return;
  }

  const item = {
    id: createId(),
    ...payload,
    created_at: nowIso(),
    updated_at: nowIso(),
  };

  db.works.push(item);
  saveDb(db);
  res.json(item);
});

app.put("/api/works/:id", requireAdmin, (req, res) => {
  const db = loadDb();
  const index = db.works.findIndex((x) => x.id === req.params.id);
  if (index === -1) {
    res.status(404).json({ error: "Work not found." });
    return;
  }

  const payload = buildWorkPayload(req.body || {}, db.works[index]);
  if (payload.error) {
    res.status(400).json({ error: payload.error });
    return;
  }

  db.works[index] = {
    ...db.works[index],
    ...payload,
    updated_at: nowIso(),
  };

  saveDb(db);
  res.json(db.works[index]);
});

app.delete("/api/works/:id", requireAdmin, (req, res) => {
  const db = loadDb();
  const index = db.works.findIndex((x) => x.id === req.params.id);
  if (index === -1) {
    res.status(404).json({ error: "Work not found." });
    return;
  }

  db.works[index] = {
    ...db.works[index],
    status: "draft",
    deleted_at: nowIso(),
    updated_at: nowIso(),
  };

  saveDb(db);
  res.json({ ok: true });
});

app.get("/api/media", (_, res) => {
  const db = loadDb();
  const items = [...db.media].sort((a, b) => b.created_at.localeCompare(a.created_at));
  res.json(items);
});

app.post("/api/media", requireAdmin, upload.single("file"), (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: "Media file is required." });
    return;
  }

  const db = loadDb();
  const media = {
    id: createId(),
    file_name: req.file.originalname,
    storage_path: req.file.filename,
    mime_type: req.file.mimetype || null,
    file_size: Number.isFinite(req.file.size) ? req.file.size : null,
    width: null,
    height: null,
    alt_text: req.body?.alt_text ? String(req.body.alt_text) : null,
    created_at: nowIso(),
  };

  db.media.push(media);
  saveDb(db);
  res.json(media);
});

app.delete("/api/media/:id", requireAdmin, (req, res) => {
  const db = loadDb();
  const index = db.media.findIndex((x) => x.id === req.params.id);
  if (index === -1) {
    res.status(404).json({ error: "Media not found." });
    return;
  }

  const [media] = db.media.splice(index, 1);
  const localPath = path.join(UPLOADS_DIR, media.storage_path);
  if (fs.existsSync(localPath)) {
    try {
      fs.unlinkSync(localPath);
    } catch {
      // ignore local file deletion failures
    }
  }

  db.testimonials = db.testimonials.map((item) =>
    item.client_photo_media_id === media.id
      ? { ...item, client_photo_media_id: null, updated_at: nowIso() }
      : item,
  );

  db.works = db.works.map((item) =>
    item.image_media_id === media.id
      ? { ...item, image_media_id: null, updated_at: nowIso() }
      : item,
  );

  saveDb(db);
  res.json({ ok: true });
});

app.get("/api/settings", requireAdmin, (_, res) => {
  const db = loadDb();
  const items = [...db.settings].sort((a, b) => a.setting_key.localeCompare(b.setting_key));
  res.json(items);
});

app.put("/api/settings/:settingKey", requireAdmin, (req, res) => {
  const settingKey = String(req.params.settingKey || "").trim();
  if (!settingKey) {
    res.status(400).json({ error: "Setting key is required." });
    return;
  }

  const db = loadDb();
  const index = db.settings.findIndex((x) => x.setting_key === settingKey);
  const now = nowIso();

  if (index === -1) {
    db.settings.push({
      id: createId(),
      setting_key: settingKey,
      setting_value: req.body?.setting_value ?? null,
      created_at: now,
      updated_at: now,
    });
  } else {
    db.settings[index] = {
      ...db.settings[index],
      setting_value: req.body?.setting_value ?? null,
      updated_at: now,
    };
  }

  saveDb(db);
  res.json({ ok: true });
});

app.get("/api/stats", requireAdmin, (_, res) => {
  const db = loadDb();
  const stats = {
    pages: db.pages.length,
    testimonials: db.testimonials.filter((x) => !x.deleted_at).length,
    works: db.works.filter((x) => !x.deleted_at).length,
    media: db.media.length,
  };
  res.json(stats);
});

app.use((err, _, res, __) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      res.status(400).json({ error: "File size exceeds 10MB limit." });
      return;
    }
    res.status(400).json({ error: err.message });
    return;
  }

  res.status(500).json({ error: "Internal server error." });
});

app.listen(PORT, () => {
  console.log(`Local CMS API running on http://localhost:${PORT}`);
});
