# Pins

## High-Level Overview

Pin = a map marker with title, comment, optional image, lat/lng. Stored in `Pins` table. Images uploaded via `multer`, stored at `STORAGE_PATH`.

### Desktop / Web Application

Create pins from the map UI. Browse paginated list or view single pin.

### Mobile Application

Not implemented.

## API Endpoints

All under `/api/pin`.

| Method | Path         | Auth      | Body                                                            | Response                              |
| ------ | ------------ | --------- | --------------------------------------------------------------- | ------------------------------------- |
| GET    | /api/pin/    | —         | —                                                               | `{ rows, count }`                     |
| GET    | /api/pin/:id | —         | —                                                               | `{ message: { ...pin, authorName } }` |
| POST   | /api/pin     | BasicAuth | multipart: title, authorid, comment, lat, lng, image (optional) | `{ message, error: false, id }`       |
| PUT    | /api/pin/:id | BasicAuth | `{ comment }`                                                   | `{ message }`                         |
| DELETE | /api/pin/:id | BasicAuth | —                                                               | `{ message }`                         |

