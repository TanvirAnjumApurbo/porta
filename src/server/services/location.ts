"use server";

// Service for CountriesNow API (https://countriesnow.space)
// Free API for hierarchical location data (Country > State > City)

const BASE_URL = "https://countriesnow.space/api/v0.1/countries";

// In-memory caches for faster repeated requests
let countriesCache: any[] | null = null;
const statesCache = new Map<string, any[]>();

export async function getAllCountries() {
  // Return cached data if available
  if (countriesCache) {
    return { success: true, data: countriesCache };
  }
  
  try {
    // This endpoint returns countries with their ISO2/ISO3 codes
    const res = await fetch(`${BASE_URL}/iso`, { 
        next: { revalidate: 86400 } // Cache for 24h
    });
    const json = await res.json();
    if (!json.error && json.data) {
        countriesCache = json.data; // Store in memory
        return { success: true, data: json.data };
    }
    return { success: false, error: json.msg || "Failed to fetch countries" };
  } catch (err) {
    console.error("CountriesNow API Error:", err);
    return { success: false, error: "Network error" };
  }
}

export async function getStates(countryName: string) {
  // Check cache first
  if (statesCache.has(countryName)) {
    return { success: true, data: statesCache.get(countryName)! };
  }
  
  try {
    const res = await fetch(`${BASE_URL}/states`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ country: countryName }),
      next: { revalidate: 3600 } // Cache for 1h
    });
    const json = await res.json();
    if (!json.error && json.data && json.data.states) {
        statesCache.set(countryName, json.data.states); // Store in memory
        return { success: true, data: json.data.states }; // Returns array of { name, state_code }
    }
    return { success: false, error: "Failed to fetch states" };
  } catch (err) {
    console.error("CountriesNow API Error:", err);
    return { success: false, error: "Network error" };
  }
}

export async function getCities(countryName: string, stateName: string) {
  try {
    const res = await fetch(`${BASE_URL}/state/cities`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ country: countryName, state: stateName }),
      next: { revalidate: 3600 } 
    });
    const json = await res.json();
    if (!json.error && json.data) {
        return { success: true, data: json.data }; // Returns array of strings (city names)
    }
    return { success: false, error: "Failed to fetch cities" };
  } catch (err) {
    console.error("CountriesNow API Error:", err);
    return { success: false, error: "Network error" };
  }
}
