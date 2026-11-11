// src/image.ts
var P = "ejs-picture";
var isError = (r) => typeof r.error === "string";
function normalizeImage(v) {
  if (!v || typeof v !== "object" || Array.isArray(v))
    return null;
  const o = v;
  if (typeof o.url !== "string" || !o.url || typeof o.width !== "number" || typeof o.height !== "number")
    return null;
  return { ...o, url: o.url, width: o.width, height: o.height, alt: typeof o.alt === "string" ? o.alt : "" };
}
function el(tag, cls, text) {
  const e = document.createElement(tag);
  e.className = cls;
  if (text !== undefined)
    e.textContent = text;
  return e;
}
function imageField(opts) {
  const { config, api, onChange } = opts;
  let img = opts.value;
  const root = el("div", `${P}-field`);
  const note = el("div", `${P}-error`);
  note.setAttribute("role", "alert");
  const fail = (m) => {
    note.textContent = m;
  };
  const set = (v) => {
    img = v;
    onChange(v);
    draw();
  };
  const run = async (btn, job) => {
    btn.disabled = true;
    try {
      await job();
    } catch (e) {
      fail(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      btn.disabled = false;
    }
  };
  const button = (label, onClick) => {
    const b = el("button", `${P}-btn`, label);
    b.type = "button";
    b.onclick = () => onClick(b);
    return b;
  };
  function draw() {
    root.replaceChildren();
    if (img) {
      const pic = el("img", `${P}-img`);
      pic.src = img.url;
      pic.alt = img.alt;
      root.append(pic);
    } else
      root.append(el("div", `${P}-empty`, "No picture yet"));
    const bar = el("div", `${P}-bar`);
    if (!api.readOnly.isEnabled) {
      if (config.uploader) {
        const up = config.uploader;
        const file = el("input", `${P}-file`);
        file.type = "file";
        file.accept = "image/*";
        file.hidden = true;
        file.onchange = () => {
          const f = file.files?.[0];
          file.value = "";
          if (f)
            run(pick, async () => {
              const r = await up(f);
              if (isError(r))
                return fail(r.error);
              set({ ...r, alt: img?.alt ?? "" });
            });
        };
        const pick = button(img ? "Replace picture" : "Upload picture", () => file.click());
        bar.append(file, pick);
      }
      for (const s of config.sources ?? []) {
        bar.append(button(s.label, (b) => void run(b, async () => {
          const r = await s.pick();
          if (r)
            set({ ...r, alt: r.alt ?? img?.alt ?? "" });
        })));
      }
      if (img) {
        for (const a of config.actions ?? []) {
          if (!a.show(img))
            continue;
          bar.append(button(a.label, (b) => void run(b, async () => {
            const r = await a.run(img);
            if (isError(r))
              return fail(r.error);
            set(r);
          })));
        }
        bar.append(button("Remove", () => set(null)));
      }
    }
    root.append(bar);
    if (img) {
      const label = el("label", `${P}-label`, "Description (alt text, required)");
      const alt = el("input", `${P}-input`);
      alt.type = "text";
      alt.value = img.alt;
      alt.required = true;
      alt.disabled = api.readOnly.isEnabled;
      alt.setAttribute("aria-invalid", String(!img.alt.trim()));
      alt.oninput = () => {
        img = { ...img, alt: alt.value };
        alt.setAttribute("aria-invalid", String(!alt.value.trim()));
        onChange(img);
      };
      label.append(alt);
      root.append(label);
    }
    root.append(note);
  }
  draw();
  return root;
}

// src/index.ts
function normalize(data) {
  const o = data && typeof data === "object" ? data : {};
  return { image: normalizeImage(o.image) };
}
var isValid = (d) => !!d.image && d.image.alt.trim() !== "";
var isEmpty = (d) => !d.image;

class PictureTool {
  opts;
  data;
  constructor(opts) {
    this.opts = opts;
    this.data = normalize(opts.data);
  }
  static get toolbox() {
    return { title: "Picture", icon: '<svg width="17" height="15" viewBox="0 0 17 15"><rect x="1" y="1" width="15" height="13" rx="2" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="5.5" cy="5.5" r="1.5" fill="currentColor"/><path d="M2 12l4-4 3 3 2-2 4 4z" fill="currentColor"/></svg>' };
  }
  static get isReadOnlySupported() {
    return true;
  }
  render() {
    const root = el("div", "ejs-picture");
    root.addEventListener("input", () => this.opts.block.dispatchChange());
    root.append(imageField({ value: this.data.image, config: this.opts.config ?? {}, api: this.opts.api, onChange: (v) => {
      this.data = { image: v };
    } }));
    return root;
  }
  save() {
    return this.data;
  }
  validate(data) {
    return !isEmpty(normalize(data));
  }
}
export {
  PictureTool as default,
  isEmpty,
  isValid,
  normalize
};
