# Google Trends API

A Node.js API to fetch and parse Google Trends data.


## Endpoints

### 1. Get Country Metadata

Returns supported country codes and time period mappings.

- **URL**: `/country`
- **Method**: `GET`

### 2. Get Trends Data

Fetches trending data for a specific country and time period.

- **URL**: `/data`
- **Method**: `GET`
- **Query Parameters**:
  - `cc`: Country code (e.g., `IN`, `US`).
  - `t`: Time period in hours (`4`, `24`, `48`, `168`).
  - `p`: Set to `true` to return parsed JSON. If omitted or not `true`, returns raw text.

**Example Request**:

```bash
GET /data?cc=IN&t=24&p=true
```

## Response Structure (Parsed)

When `p=true` is used, the items contain:

- `term`: The trending query.
- `score`: Combined volume and velocity (e.g., `500k+, 1000%`).
- `time`: Relative time string (e.g., `3 hours ago`).
- `breakdown`: Array of related queries.
