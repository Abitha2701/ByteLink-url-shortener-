# TODO - Fix short URL redirect issue

## Plan (Option A: redirect to longUrl)
- [ ] Verify which shortUrl is being generated (backend base URL vs frontend base URL) and ensure it points to the backend redirect host.
- [ ] Confirm redirect route is reachable at the shortUrl host/path (e.g. https://<host>/<shortCode> hits backend `app.use('/', redirectRoutes)`).
- [ ] Ensure frontend/build hosting is not swallowing the path (SPA fallback vs backend).
- [ ] Add temporary logging in redirect controller to confirm request arrives and which shortCode is parsed.
- [ ] If misrouting is due to frontend hosting: update deployment/NGINX to forward `/:shortCode` to backend.

## Completion criteria
- [ ] Opening a generated short URL results in a 30x redirect to the correct longUrl.

