"use server";
import { promises as fs } from 'fs';
import path from 'path';

let airportsCache: any[] | null = null;

export async function searchAirports(query: string) {
  // If query is very short, return empty
  if (!query || query.length < 2) return [];

  if (!airportsCache) {
      try {
        const filePath = path.join(process.cwd(), 'src', 'lib', 'data', 'airports.json');
        const fileContent = await fs.readFile(filePath, 'utf-8');
        const json = JSON.parse(fileContent);
        // Data is Object format {"AAA": {...}, ...}
        airportsCache = Object.values(json);
      } catch (e) {
        console.error("Failed to load airports.json", e);
        return [];
      }
  }

  const q = query.toLowerCase();
  
  // Simple filter
  // We prioritize matches where input matches IATA exactly or starts with name
  return airportsCache!
    .filter((a: any) => 
       (a.iata && a.iata.toLowerCase().includes(q)) ||
       (a.name && a.name.toLowerCase().includes(q)) ||
       (a.city && a.city.toLowerCase().includes(q))
    )
    .slice(0, 50)
    .map((a: any) => ({
      name: a.name,
      iata: a.iata,
      city: a.city,
      country: a.country, // ISO2
      state: a.state,
      label: `${a.iata} - ${a.name} (${a.city})`
    }));
}
