# Nest local Photo / Document storage

Research for [#50](https://github.com/Leritas/skm-energo/issues/50) (map: [#41](https://github.com/Leritas/skm-energo/issues/41)). Facts about what NestJS 11, this repo’s `docker-compose.yml`, and Nuxt 4 SSR already imply for **local disk** Photo and Document storage. Not a design.

Domain: **Photo** (display image) and **Document** (downloadable file). See root `CONTEXT.md`. Locked constraints from #41: local disk, Nest module in this API (not a microservice), no S3, public read, admin-only write.

## Current repo (nothing lands on disk today)

- Nest 11 Express app (`@nestjs/platform-express`), global prefix `api`, port `3001`, CORS origin `http://localhost:3000` (`backend/src/main.ts`, `backend/.env.example`).
- Global `JwtAuthGuard` + `PermissionsGuard` (`backend/src/app.module.ts`). Unauthenticated routes must be `@Public()`. Public catalog GETs already are (`backend/src/catalog/catalog.controller.ts`). Admin writes use `@RequirePermissions` / `@RequireAnyPermissions` (`backend/src/catalog/catalog-admin.controller.ts`). `PermissionsGuard` is a no-op when no permission metadata is set.
- No `FileInterceptor`, no `MulterModule`, no `@nestjs/serve-static`, no `useStaticAssets`, no upload directory, no Nest service in Compose. `multer` is a **transitive** dependency of `@nestjs/platform-express` (`backend/package-lock.json`, multer `2.1.1`); it is not imported in `backend/src/`.
- Product still stores a string `pdfHref` (`backend/prisma/schema.prisma`). Seed/admin examples are paths like `/files/nh00-160a.pdf`. `frontend/public/` contains only `favicon.ico`, `logo.jpg`, `robots.txt` — no `/files/` tree.
- Nuxt 4, `ssr: true`, `devServer.port` 3000. JSON calls use `runtimeConfig.public.apiBase` = `NUXT_PUBLIC_API_BASE` default `http://localhost:3001/api` (`frontend/nuxt.config.ts`, `frontend/app/composables/useApi.ts`). No `routeRules` proxy, no `nitro.devProxy`.
- PDP: `SkmProductGallery` gets `:images="[]"`; Documents render as `SkmFileLink :href="product.pdfHref"` (`frontend/app/components/catalog/CatalogProductDetailView.vue`). `SkmProductMedia` and `SkmNewsCard` put the URL on a raw `<img :src>`. `SkmFileLink` puts it on a raw `<a :href>` with `target="_blank"` (no `download` attribute).
- Compose (`docker-compose.yml`): **Postgres only**. Named volume `postgres_data` → `/var/lib/postgresql/data`. Nest and Nuxt run on the host (`README.md`). No Dockerfile in the repo.

## 1. How a Nest upload lands on disk

Nest’s upload path is Express **multer**, wrapped as interceptors (`FileInterceptor` / `FilesInterceptor` / …) exported from `@nestjs/platform-express`. The interceptor options object is the same as the multer constructor ([NestJS File upload](https://docs.nestjs.com/techniques/file-upload); [multer README](https://github.com/expressjs/multer/blob/master/README.md)).

`FileInterceptor` constructs `multer({ ...moduleOptions, ...localOptions })` and, **before** calling `next.handle()`, runs `multer.single(fieldName)` ([Nest source](https://github.com/nestjs/nest/blob/master/packages/platform-express/multer/interceptors/file.interceptor.ts)).

Multer storage if you pass nothing / no `dest` / no `storage`: **memory**. The file is a `Buffer` on `file.buffer` and is never written to disk ([multer `index.js`](https://github.com/expressjs/multer/blob/master/index.js), `else { this.storage = memoryStorage() }`; README: “If you omit the options object, the files will be kept in memory and never written to disk”). Memory storage warns that large or bursty uploads can OOM. Stage 4b caps are 25 MB Photos / 50 MB Documents (#41) — those sizes are in the range that warning is about.

To write local files you must pass `dest` or `storage`:

| Mechanism                                                                    | Disk path                                                   | On-disk name                |
| ---------------------------------------------------------------------------- | ----------------------------------------------------------- | --------------------------- |
| `MulterModule.register({ dest: './upload' })` or interceptor `{ dest: '…' }` | that directory (string destination; multer `mkdirSync`s it) | **not** the original name   |
| `{ storage: diskStorage({ destination, filename }) }`                        | `destination` (string or callback)                          | whatever `filename` returns |

`dest` is implemented as `diskStorage({ destination: options.dest })` with **no** custom `filename` ([multer `index.js`](https://github.com/expressjs/multer/blob/master/index.js)). Default `filename` is 16 random bytes as hex, **no extension** ([multer `storage/disk.js`](https://github.com/expressjs/multer/blob/master/storage/disk.js) `getFilename`). README: “If no `filename` is given, each file will be given a random name that doesn't include any file extension” and “Multer will not append any file extension for you”.

After a disk write, multer attaches ([README “File information”](https://github.com/expressjs/multer/blob/master/README.md)):

- `originalname` — name on the user’s computer (the Document **display** name in this domain)
- `filename` — name **inside** `destination` (what must not collide)
- `path` — full filesystem path
- `mimetype`, `size`
- `buffer` — **only** for MemoryStorage, not DiskStorage

That split is how originals stay collide-safe **and** keep a display filename: unique `filename` on disk, keep `originalname` (typically in Postgres on the Photo/Document row). Using `originalname` as the disk `filename` is **not** collide-safe (second `datasheet.pdf` overwrites the first). Default hex names **are** collide-safe and **lose** the extension that `express.static` uses for `Content-Type` (see §2).

`fileFilter` runs as part of multer, **before** `storage._handleFile` ([multer `index.js`](https://github.com/expressjs/multer/blob/master/index.js) wraps `fileFilter`). Rejecting there never creates a file. `limits.fileSize` is passed through to busboy (README `limits`).

Nest `ParseFilePipe` / `MaxFileSizeValidator` / `FileTypeValidator` are **parameter pipes** on `@UploadedFile()`. Nest’s request lifecycle is middleware → **guards** → **interceptors** → **pipes** → handler ([Nest request lifecycle](https://docs.nestjs.com/faq/request-lifecycle)). So multer has already written a disk file **before** `ParseFilePipe` runs. A failed pipe leaves the file on disk unless something deletes `file.path`.

`FileTypeValidator` inspects **magic numbers** via `file-type` on `file.buffer` by default ([Nest file-upload docs](https://docs.nestjs.com/techniques/file-upload); [source](https://github.com/nestjs/nest/blob/master/packages/common/pipes/file/file-type.validator.ts)). With DiskStorage there is no `buffer`; `isValid` returns `false` unless `skipMagicNumbersValidation` or `fallbackToMimetype` is set. Implication for jpeg/png/webp and pdf/doc/docx/xlsx: either validate in `fileFilter` / multer `limits` (before write), use memory then write yourself, or opt the validator out of magic-number-only mode.

Guards run **before** the interceptor. Admin-only write on a Nest **route** is the existing pattern: omit `@Public()`, add `@RequirePermissions(...)`. A Guest never reaches multer on that route.

Relative `dest` / `destination` is resolved from **process cwd**, not from `dist/` ([Express static note](https://expressjs.com/en/starter/static-files.html) is the same rule). Nest `start:prod` is `node dist/main` from `backend/` (`backend/package.json`).

## 2. How the same process serves bytes publicly

Three mechanisms the stack actually provides. This repo uses **none** of them yet. There is **no reverse proxy** in-tree.

### A. Express static (`useStaticAssets` or `ServeStaticModule`)

Nest on Express is Express ([Nest MVC](https://docs.nestjs.com/techniques/mvc)). `app.useStaticAssets(join(__dirname, '..', 'public'))` is `express.static`. URL = mount path + **on-disk filename**. The directory name is not in the URL unless you mount with a prefix (`app.use('/static', express.static('public'))` → `/static/images/kitten.jpg`) ([Express static files](https://expressjs.com/en/starter/static-files.html)).

`@nestjs/serve-static` `ServeStaticModule.forRoot` also calls `express.static(rootPath)` on the Express instance ([express.loader.ts](https://github.com/nestjs/serve-static/blob/master/lib/loaders/express.loader.ts)). Options ([package README](https://github.com/nestjs/serve-static)):

- `rootPath` — directory on disk
- `serveRoot` — URL prefix (default `""` = `/`)
- `useGlobalPrefix` — default **`false`**. This app’s `setGlobalPrefix('api')` is **not** prepended unless `true`. So a typical mount is `http://localhost:3001/media/<filename>`, not under `/api`.
- Default `renderPath` is a wildcard that also tries to send `index.html` (SPA). For a Photo/Document directory that must be constrained (`serveRoot` + `renderPath`), or the module will compete with API routes. Nest’s own README says if you want asset files (images, docs), prefer `useStaticAssets()` ([@nestjs/serve-static README](https://github.com/nestjs/serve-static/blob/master/README.md)).

`express.static` is Express `app.use` middleware. Nest globally bound middleware runs **before** guards ([request lifecycle](https://docs.nestjs.com/faq/request-lifecycle)). A Guest `<img>` / `<a>` GET to that mount does **not** need `@Public()`. Write still stays on a guarded controller.

`Content-Type` comes from the file extension Express’s mime lookup uses. Hex names with no extension do not yield `image/jpeg` / `application/pdf`. Photos for `<img>` need a real image type; Documents can rely on `Content-Disposition` instead (below).

`serveStaticOptions.setHeaders` can set `Content-Disposition`. Static serving cannot look up a Postgres original name unless the on-disk name **is** that name or you add a controller.

### B. Nest controller + `StreamableFile`

Return `createReadStream(diskPath)` wrapped in `StreamableFile` ([Nest streaming files](https://docs.nestjs.com/techniques/streaming-files)). Default `Content-Type` is `application/octet-stream`. Options: `type`, `disposition` (`Content-Disposition`). This is a Nest **route**, so it **does** hit `JwtAuthGuard`. Guest PDP download/display requires `@Public()` on that GET (same as `HealthController` / `CatalogController`).

Because the handler can read the Photo/Document row, it can set:

- Photo: `type: image/jpeg` (etc.), `disposition: inline` (or omit) so `<img>` displays
- Document: `disposition: attachment; filename="…"` using the stored original name

RFC 6266: `inline` vs `attachment`; `filename` vs `filename*` (RFC 5987) for non-ASCII names ([RFC 6266](https://www.rfc-editor.org/rfc/rfc6266.html)). Document originals in this product are often Russian. Multer’s `defParamCharset` default is `'latin1'` for non-extended part headers ([multer README](https://github.com/expressjs/multer/blob/master/README.md)) — `originalname` can be mangled unless the client sends an extended filename parameter.

URL shape: `@Controller('media')` + global prefix → `http://localhost:3001/api/media/…`.

### C. Reverse proxy (nginx / Nuxt Nitro) in front of disk or Nest

Not present. Nitro can proxy in **dev** (`devProxy`) and via `routeRules: { '/proxy/**': { proxy: '…' } }` ([Nitro config](https://nitro.build/config#routerules)). This `nuxt.config.ts` does neither. Express docs also recommend a reverse-proxy cache in front of `express.static` for production ([Express static files](https://expressjs.com/en/starter/static-files.html)).

### What a Guest PDP actually does today

- `<img :src>`: HTML CORS-settings default is **No CORS** (`no-cors` fetch). The image **displays** cross-origin without `Access-Control-Allow-Origin`. `crossorigin` on `<img>` would switch to CORS mode and then Nest CORS **would** matter ([HTML CORS settings attributes](https://html.spec.whatwg.org/multipage/urls-and-fetching.html#cors-settings-attributes)). `SkmProductMedia` / `SkmNewsCard` do not set `crossorigin`.
- `<a href>`: top-level navigation / download. CORS does not apply. `enableCors` in `main.ts` is for credentialed `$fetch` JSON (with `credentials: true` and `CORS_ORIGIN`), not for these tags.
- HTML `download` on `<a>`: intended filename can be overridden by `Content-Disposition`; in cross-origin situations the spec requires combining `download` with `Content-Disposition: attachment` ([HTML links](https://html.spec.whatwg.org/dev/links.html)). `SkmFileLink` has **no** `download` attribute; it opens `target="_blank"`. Document save-as name is then the last URL path segment **or** Nest’s `Content-Disposition`, not the Vue `filename` prop (that prop is only the visible label). `productDocumentFilename()` currently takes `pdfHref.split('/').pop()` (`frontend/app/utils/product-seo.ts`) — if the path is a UUID, the UI label becomes the UUID unless the API also returns the original name.

## 3. Docker volume vs this Compose file

Docker: files in a container’s writable layer are gone when the container is destroyed ([Docker storage](https://docs.docker.com/engine/storage/)). Persistence is a **volume** or **bind mount** at the directory multer writes.

Compose named volumes: declare top-level, mount on the **service that writes the files**. `docker compose up` creates the volume if missing and reuses it ([Compose volumes](https://docs.docker.com/reference/compose-file/volumes/)). `docker compose down` removes containers and networks, **not** named volumes, unless `-v` / `--volumes` ([`docker compose down`](https://docs.docker.com/reference/cli/docker/compose/down/)).

This repo’s `docker-compose.yml` already does that **for Postgres**:

```yaml
services:
  postgres:
    volumes:
      - postgres_data:/var/lib/postgresql/data
volumes:
  postgres_data:
```

There is **no Nest service**. A volume cannot persist Nest uploads until Nest (or another process that writes the same directory) is a Compose service (or otherwise containerized) **and** that service mounts a volume at multer’s `destination`.

Implications:

- **Today (host `npm run start:dev`)**: uploads would live on the host filesystem under whatever path you pass to multer, relative to cwd (`backend/` in the documented workflow). Compose does not touch that directory. Redeploying **Postgres** does not wipe it. Restarting / replacing a **future Nest container** without a mount **would**.
- **If Nest is later added to Compose**: same pattern as Postgres — e.g. named volume mounted at the absolute in-container upload dir (the string you give `diskStorage.destination` / `useStaticAssets`). Bind mount if operators must see files on the host ([Docker storage: bind mounts](https://docs.docker.com/engine/storage/)).
- `docker compose down` (no `-v`) keeps `postgres_data`; the same would apply to an uploads volume. `down -v` would delete it. Compose does not back up volumes; #41 already lists disk backup as out of this research.

## 4. What URL Nuxt SSR stores / renders

Two different channels:

1. **JSON** (`useApi` / `$fetch`) uses `config.public.apiBase` (`http://localhost:3001/api` in dev). That prefix is **not** applied to `<img>` or `<a>`.
2. **Bytes** are requested by the **browser** from whatever string is in `src` / `href`. Relative URLs resolve against the **page origin** (Nuxt `http://localhost:3000` in dev), not against `apiBase` ([HTML parse a URL](https://html.spec.whatwg.org/multipage/urls-and-fetching.html) uses the document base URL). SSR still just emits that string into HTML ([Nuxt universal rendering](https://nuxt.com/docs/4.x/guide/concepts/rendering)).

Consequences that already show up with `pdfHref: '/files/nh00-160a.pdf'`:

| Stored / rendered value                                                                 | Browser GET (Guest on `:3000`)  | Hits Nest?                                                     |
| --------------------------------------------------------------------------------------- | ------------------------------- | -------------------------------------------------------------- |
| `/files/…` or `/media/…`                                                                | `http://localhost:3000/files/…` | No. Nuxt `public/` has no such files. 404.                     |
| `/api/…`                                                                                | `http://localhost:3000/api/…`   | No. No Nitro/nginx proxy in this repo. 404.                    |
| `http://localhost:3001/media/<disk-name>` (static, `useGlobalPrefix: false`)            | Nest `:3001`                    | Yes, if that mount exists.                                     |
| `http://localhost:3001/api/media/…` (controller or static with `useGlobalPrefix: true`) | Nest `:3001`                    | Yes, if that route exists and is `@Public()` for a controller. |

So:

- **Same-origin `/api/...` or `/media`** only works for Guest `<img>` / `<a>` if something on `:3000` (Nitro `routeRules.proxy` / `devProxy`, or a later TLS reverse proxy) forwards that path to Nest. This repo does not.
- **Absolute Nest URL** in the payload works in the browser without a Nuxt proxy (`<img>` no-cors; `<a>` navigation). It bakes a host into HTML/`src` unless the frontend prefixes a **path** from the API with a runtime media base (or `apiBase`).
- Nuxt `public/` is for **build-time** static files at the site origin ([Nuxt assets](https://nuxt.com/docs/4.x/getting-started/assets)). It is not Nest’s upload dir; putting uploads there would still not persist them on the API host.

`$fetch` of JSON during SSR talks to Nest with `apiBase`. That does not stream Photo/Document bytes into the HTML; it only copies URL strings (or fields from which the page builds URLs) into `<img>` / `<a>`.

## Implications (facts only)

1. Upload = `FileInterceptor` + multer `dest`/`diskStorage`. Display name = `originalname` (store on the Photo/Document row). Collision safety = unique on-disk `filename` **plus** extension if you serve via `express.static`.
2. `ParseFilePipe` runs after the disk write. Default `FileTypeValidator` needs `file.buffer` (memory storage) or explicit non-magic-number options.
3. Public read: Express static bypasses `JwtAuthGuard`; a Nest `StreamableFile` route does not (needs `@Public()`). Admin write stays a guarded controller either way.
4. A Compose volume must be mounted on the process that writes the files, at multer’s destination. Current Compose has that pattern only for Postgres. Nest-on-host uploads are ordinary host files.
5. Nuxt will not magically fetch bytes from `apiBase`. Relative `/files` and `/api` in `src`/`href` hit Nuxt. Absolute Nest URLs, or a same-origin path plus a proxy that this repo does not have, are the two ways a Guest `<img>` / Document `<a>` actually gets bytes.

## Sources

- [NestJS File upload](https://docs.nestjs.com/techniques/file-upload)
- [NestJS Streaming files](https://docs.nestjs.com/techniques/streaming-files)
- [NestJS Serve Static recipe](https://docs.nestjs.com/recipes/serve-static)
- [NestJS MVC / `useStaticAssets`](https://docs.nestjs.com/techniques/mvc)
- [NestJS Global prefix](https://docs.nestjs.com/faq/global-prefix)
- [NestJS Request lifecycle](https://docs.nestjs.com/faq/request-lifecycle)
- [Nest `FileInterceptor` source](https://github.com/nestjs/nest/blob/master/packages/platform-express/multer/interceptors/file.interceptor.ts)
- [Nest `FileTypeValidator` source](https://github.com/nestjs/nest/blob/master/packages/common/pipes/file/file-type.validator.ts)
- [multer README](https://github.com/expressjs/multer/blob/master/README.md), [index.js](https://github.com/expressjs/multer/blob/master/index.js), [storage/disk.js](https://github.com/expressjs/multer/blob/master/storage/disk.js)
- [@nestjs/serve-static README](https://github.com/nestjs/serve-static/blob/master/README.md) and [express.loader.ts](https://github.com/nestjs/serve-static/blob/master/lib/loaders/express.loader.ts)
- [Express static files](https://expressjs.com/en/starter/static-files.html)
- [Docker storage](https://docs.docker.com/engine/storage/), [Compose volumes](https://docs.docker.com/reference/compose-file/volumes/), [`docker compose down`](https://docs.docker.com/reference/cli/docker/compose/down/)
- [Nuxt rendering](https://nuxt.com/docs/4.x/guide/concepts/rendering), [Nuxt assets](https://nuxt.com/docs/4.x/getting-started/assets), [Nitro `routeRules` / `devProxy`](https://nitro.build/config#routerules)
- [HTML CORS settings attributes](https://html.spec.whatwg.org/multipage/urls-and-fetching.html#cors-settings-attributes), [HTML `download`](https://html.spec.whatwg.org/dev/links.html)
- [RFC 6266 `Content-Disposition`](https://www.rfc-editor.org/rfc/rfc6266.html)
- This repo: `backend/src/main.ts`, `backend/src/app.module.ts`, `docker-compose.yml`, `frontend/nuxt.config.ts`, `frontend/app/composables/useApi.ts`, `frontend/app/components/catalog/CatalogProductDetailView.vue`, `frontend/app/components/ui/SkmProductMedia/SkmProductMedia.vue`, `frontend/app/components/ui/SkmFileLink/SkmFileLink.vue`
