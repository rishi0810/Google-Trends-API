import express from "express";
import cors from "cors";
import rateLimit from "./middleware/rateLimit.js";
import axios from "axios";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { parseResponse } from "./util/parseResponse.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(cors());
app.use(rateLimit);

const mappingData = JSON.parse(
  fs.readFileSync(join(__dirname, "util", "mapping.json"), "utf-8"),
);

const trendsEndpoint = process.env.URL 
const countryResponse = {
  countryCodes: mappingData.countryCodes,
  time_periods: {
    "24 hours": 24,
    "4 hours": 4,
    "48 hours": 48,
    "1 week": 168,
  },
};

app.get("/country", (req, res) => {
  res.set("Cache-Control", "public, max-age=31536000, immutable");
  res.json(countryResponse);
});

app.get("/data", async (req, res) => {
  try {
    const { cc, t, p } = req.query;
    if (!cc || !t) {
      return res.status(400).json({
        error:
          "Missing required parameters: cc (country code), t (time period))",
      });
    }

    const validTimePeriods = [4, 24, 48, 168];
    const timePeriod = parseInt(t);
    if (!validTimePeriods.includes(timePeriod)) {
      return res.status(400).json({
        error: "Invalid time period",
        allowedTimePeriods: {
          "24 hours": 24,
          "4 hours": 4,
          "48 hours": 48,
          "1 week": 168,
        },
      });
    }

    let requestString = mappingData.requestString;
    requestString = requestString.replace("COUNTRY_CODE", cc);
    requestString = requestString.replace("TIME_PERIOD", timePeriod);

    const response = await axios.post(
      trendsEndpoint,
      requestString,
      {
        headers: {
          accept: "*/*",
          "content-type": "application/x-www-form-urlencoded;charset=UTF-8",
          "user-agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36",
        },
      },
    );

    if (p === "true") {
      const parsedData = parseResponse(response.data);
      res.json(parsedData);
    } else {
      res.send(response.data);
    }
  } catch (error) {
    console.error("Error fetching Google Trends data:", error.message);
    res.status(500).json({
      error: "Failed to fetch Google Trends data",
      details: error.message,
    });
  }
});

app.listen(3000, () => {
  console.log("Server started on port 3000");
});
