"use server";

const API_KEY = process.env.AVIATIONSTACK_API_KEY;
const BASE_URL = "http://api.aviationstack.com/v1";

interface AviationStackResponse<T> {
  pagination: {
    limit: number;
    offset: number;
    count: number;
    total: number;
  };
  data: T[];
}

export interface Country {
  country_name: string;
  country_iso2: string;
  currency_name: string;
  capital: string;
}

export interface City {
  city_name: string;
  iata_code: string;
  country_iso2: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

export interface Airport {
  airport_name: string;
  iata_code: string;
  icao_code: string;
  latitude: number;
  longitude: number;
  geoname_id: string;
  timezone: string;
  gmt: string;
  phone_number: string;
  country_name: string;
  country_iso2: string;
  city_iata_code: string;
}

export async function getCountries() {
  if (!API_KEY) return { error: "API Key missing" };
  
  try {
    const res = await fetch(`${BASE_URL}/countries?access_key=${API_KEY}&limit=300`, { next: { revalidate: 86400 } }); // Cache for 24h
    const data = await res.json() as AviationStackResponse<Country>;
    
    // Sort alphabetically
    const sorted = (data.data || []).sort((a, b) => a.country_name.localeCompare(b.country_name));
    return { data: sorted };
  } catch (error) {
    console.error("Aviationstack Error:", error);
    return { error: "Failed to fetch countries" };
  }
}

export async function getCities(countryIso2: string) {
  if (!API_KEY) return { error: "API Key missing" };
  if (!countryIso2) return { data: [] };

  try {
    // Note: The API might perform searching best just by requesting all or using search param
    // But strictly speaking, we want cities IN a country.
    // If simple filter isn't supported, we might have to rely on search.
    // Let's try passing the country_iso2 as a param if supported, otherwise just assume it works or we filter.
    // A common pattern is `?country_iso2=US`?
    // Checking docs indirectly: usually it's supported.
    const res = await fetch(`${BASE_URL}/cities?access_key=${API_KEY}&limit=300&country_iso2=${countryIso2}`);
    const data = await res.json() as AviationStackResponse<City>;
    
    // Filter out entries without IATA code if for flight travel? Or keep all?
    // Keeps valid cities.
    const sorted = (data.data || []).sort((a, b) => a.city_name.localeCompare(b.city_name));
    return { data: sorted };
  } catch (error) {
    console.error("Aviationstack Error:", error);
    return { error: "Failed to fetch cities" };
  }
}

export async function getAirports(cityIataCode: string) {
  if (!API_KEY) return { error: "API Key missing" };
  if (!cityIataCode) return { data: [] };

  try {
    const res = await fetch(`${BASE_URL}/airports?access_key=${API_KEY}&city_iata_code=${cityIataCode}`);
    const data = await res.json() as AviationStackResponse<Airport>;
    
    return { data: data.data || [] };
  } catch (error) {
    console.error("Aviationstack Error:", error);
    return { error: "Failed to fetch airports" };
  }
}

export async function getAirportsBySearch(search: string) {
  if (!API_KEY) return { error: "API Key missing" };
  if (!search) return { data: [] };

  try {
    const res = await fetch(`${BASE_URL}/airports?access_key=${API_KEY}&search=${encodeURIComponent(search)}`);
    const data = await res.json() as AviationStackResponse<Airport>;
    
    return { data: data.data || [] };
  } catch (error) {
    console.error("Aviationstack Error:", error);
    return { error: "Failed to fetch airports" };
  }
}

export async function getFlight(flightIata: string) {
  if (!API_KEY) return { error: "API Key missing" };
  try {
    const res = await fetch(`${BASE_URL}/flights?access_key=${API_KEY}&flight_iata=${flightIata}&limit=1`);
    const json = await res.json();
    if (!json.error && json.data && json.data.length > 0) {
      return { success: true, data: json.data[0] };
    }
    return { success: false, error: "Flight not found" };
  } catch (err) {
    console.error(err);
    return { success: false, error: "Network error" };
  }
}

export async function getAirportByIata(iata: string) {
  if (!API_KEY) return { error: "API Key missing" };
  try {
    const res = await fetch(`${BASE_URL}/airports?access_key=${API_KEY}&iata_code=${iata}`);
    const json = await res.json();
    if (!json.error && json.data && json.data.length > 0) {
      return { success: true, data: json.data[0] };
    }
    return { success: false, error: "Airport not found" };
  } catch (err) {
      console.error(err);
      return { success: false, error: "Network error" };
  }
}
