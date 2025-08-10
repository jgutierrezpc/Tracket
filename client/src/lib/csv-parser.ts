import { InsertActivity } from "@shared/schema";

export interface CsvRow {
  date: string;
  sport: string;
  'activity type': string;
  'duration minutes': string;
  'club name': string;
  'club location': string;
  'club map link': string;
  'club latitude': string;
  'club longitude': string;
  'session rating': string;
  racket: string;
  partner: string;
  oponents: string; // Note: CSV has typo "oponents" instead of "opponents"
  notes: string;
}

export function parseCsvText(csvText: string): CsvRow[] {
  const lines = csvText.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  
  return lines.slice(1).map(line => {
    const values = parseCSVLine(line);
    const row: any = {};
    
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    
    return row as CsvRow;
  });
}

function parseCSVLine(line: string): string[] {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
}

export function csvRowToActivity(row: CsvRow): InsertActivity {
  return {
    date: row.date,
    sport: row.sport.toLowerCase(),
    activityType: row['activity type'] || null,
    duration: parseInt(row['duration minutes']) || 0,
    clubName: row['club name'] || null,
    clubLocation: row['club location'] || null,
    clubMapLink: row['club map link'] || null,
    clubLatitude: row['club latitude'] || null,
    clubLongitude: row['club longitude'] || null,
    sessionRating: row['session rating'] ? parseInt(row['session rating']) : null,
    racket: row.racket || null,
    partner: row.partner || null,
    opponents: row.oponents || null, // Handle the typo in CSV
    notes: row.notes || null,
  };
}

export const CSV_DATA = `date,sport,activity type,duration minutes,club name,club location,club map link,club latitude,club longitude,session rating,racket,partner,oponents,notes
2025-08-03,padel,friendly,90,Padel Town,"Mag warehouses, Plot 911 - Al Quoz Industrial Area 2 - Dubai",https://maps.app.goo.gl/UCJaZnernuPw3NSj8,25.14082667,55.25946167,4,Wilson Bela Elite V2.5,Alvaro,"Ricardo, Tomas",
2025-07-26,padel,friendly,90,Padel Town,"Mag warehouses, Plot 911 - Al Quoz Industrial Area 2 - Dubai",https://maps.app.goo.gl/UCJaZnernuPw3NSj8,25.14082667,55.25946167,3,Wilson Bela Elite V2.5,Rami,"Ricardo, Tomas",
2025-07-19,padel,tournament,210,Padel Pro Al Quoz,Al Quoz - Al Quoz Industrial Area 2 - Dubai,https://maps.app.goo.gl/fBZJxcYssLYKn9Ft8,25.12536306,55.2402342,2,Wilson Bela Elite V2.5,Rami,Various,
2025-07-17,padel,friendly,60,Match Point Padel,ABA AVENUE - 93 24B Street - Al Quoz - Al Quoz Industrial Area 2 - Dubai,https://maps.app.goo.gl/UurvvaUXD4jwuepM9,25.12457595,55.2441098,4,Wilson Bela Elite V2.5,Simon,"Miguel, Daniel",
2025-06-27,padel,friendly,90,Padel Town,"Mag warehouses, Plot 911 - Al Quoz Industrial Area 2 - Dubai",https://maps.app.goo.gl/UCJaZnernuPw3NSj8,25.14082667,55.25946167,5,Wilson Bela Elite V2.5,Rami,"Ricardo, Tomas",
2025-06-22,padel,friendly,90,Padel Town,"Mag warehouses, Plot 911 - Al Quoz Industrial Area 2 - Dubai",https://maps.app.goo.gl/UCJaZnernuPw3NSj8,25.14082667,55.25946167,4,Wilson Bela Elite V2.5,Rami,"Ricardo, Tomas",
2025-06-08,padel,friendly,90,Danube Sports World,al habtoor city - Al Meydan Rd - Dubai,https://maps.app.goo.gl/5cnmpXmj4jN87N868,25.17937899,55.25293443,,Wilson Bela Elite V2.5,Rami,"Ricardo, Tomas",
2025-06-06,padel,friendly,90,Padel Pro Al Quoz,Al Quoz - Al Quoz Industrial Area 2 - Dubai,https://maps.app.goo.gl/fBZJxcYssLYKn9Ft8,25.12536306,55.2402342,3,Wilson Bela Elite V2.5,Rami,"Ricardo, Tomas",
2025-05-25,padel,tournament,210,Padel Town,"Mag warehouses, Plot 911 - Al Quoz Industrial Area 2 - Dubai",https://maps.app.goo.gl/UCJaZnernuPw3NSj8,25.14082667,55.25946167,4,Wilson Bela Elite V2.5,Ana,Various,wifey broke her achilles :(
2025-05-17,padel,tournament,180,WPA - Dubai - World Padel Academy - Al Qouz,56 3B St - Al Quoz - القوز 1 - Dubai,https://maps.app.goo.gl/kugK5wCnbc1ZYCe47,25.14656899,55.2423792,,Wilson Bela Elite V2.5,,,
2025-05-10,padel,friendly,90,Padel Pro Al Quoz,Al Quoz - Al Quoz Industrial Area 2 - Dubai,https://maps.app.goo.gl/fBZJxcYssLYKn9Ft8,25.12536306,55.2402342,,Wilson Bela Elite V2.5,Fabien,"Ricardo, Tomas",
2025-04-26,padel,tournament,180,Padel Pro One Central,"One Central, DWTC Dubai Trade Centre Hotel Apartments Block C - Dubai",https://maps.app.goo.gl/tysYyCzy3A71kd5K8,25.24468475,55.2835619,,Wilson Bela Elite V2.5,,,
2025-04-10,padel,friendly,90,Match Point Padel,ABA AVENUE - 93 24B Street - Al Quoz - Al Quoz Industrial Area 2 - Dubai,https://maps.app.goo.gl/UurvvaUXD4jwuepM9,25.12457595,55.2441098,,Wilson Bela Elite V2.5,,,
2025-03-23,padel,training,60,Sheraton Dubai Creek Hotel,Baniyas Rd - Port Saeed - Riggat Al Buteen - Dubai,https://maps.app.goo.gl/TfLezWEToTTsiHAd7,25.26177268,55.31409251,,Wilson Bela Elite V2.5,Ana,,
2025-03-16,padel,training,60,Sheraton Dubai Creek Hotel,Baniyas Rd - Port Saeed - Riggat Al Buteen - Dubai,https://maps.app.goo.gl/TfLezWEToTTsiHAd7,25.26177268,55.31409251,,Wilson Bela Elite V2.5,Ana,,
2025-03-08,padel,tournament,180,Padel Pro Al Quoz,Al Quoz - Al Quoz Industrial Area 2 - Dubai,https://maps.app.goo.gl/fBZJxcYssLYKn9Ft8,25.12536306,55.2402342,2,Wilson Bela Elite V2.5,Fabien,,
2025-02-23,padel,training,60,Sheraton Dubai Creek Hotel,Baniyas Rd - Port Saeed - Riggat Al Buteen - Dubai,https://maps.app.goo.gl/TfLezWEToTTsiHAd7,25.26177268,55.31409251,,Wilson Bela Elite V2.5,Ana,,
2025-02-16,padel,training,90,Sheraton Dubai Creek Hotel,Baniyas Rd - Port Saeed - Riggat Al Buteen - Dubai,https://maps.app.goo.gl/TfLezWEToTTsiHAd7,25.26177268,55.31409251,,Wilson Bela Elite V2.5,Ana,,
2025-02-01,padel,training,60,Sheraton Dubai Creek Hotel,Baniyas Rd - Port Saeed - Riggat Al Buteen - Dubai,https://maps.app.goo.gl/TfLezWEToTTsiHAd7,25.26177268,55.31409251,,Wilson Bela Elite V2.5,Ana,,
2025-01-31,padel,friendly,120,Padel Pro Al Quoz,Al Quoz - Al Quoz Industrial Area 2 - Dubai,https://maps.app.goo.gl/fBZJxcYssLYKn9Ft8,25.24468475,55.2835619,,Wilson Bela Elite V2.5,Matias,"Fabien, Flavio",
2025-01-26,padel,friendly,120,Padel Pro One Central,"One Central, DWTC Dubai Trade Centre Hotel Apartments Block C - Dubai",https://maps.app.goo.gl/tysYyCzy3A71kd5K8,25.24468475,55.2835619,,Wilson Bela Elite V2.5,,,
2025-01-25,padel,training,60,Sheraton Dubai Creek Hotel,Baniyas Rd - Port Saeed - Riggat Al Buteen - Dubai,https://maps.app.goo.gl/TfLezWEToTTsiHAd7,25.26177268,55.31409251,,Wilson Bela Elite V2.5,Ana,,
2025-01-22,padel,friendly,90,Padel Pro One Central,"One Central, DWTC Dubai Trade Centre Hotel Apartments Block C - Dubai",https://maps.app.goo.gl/tysYyCzy3A71kd5K8,25.24468475,55.2835619,,Wilson Bela Elite V2.5,,,
2025-01-19,padel,friendly,90,Padel Pro One Central,"One Central, DWTC Dubai Trade Centre Hotel Apartments Block C - Dubai",https://maps.app.goo.gl/tysYyCzy3A71kd5K8,25.24468475,55.2835619,,Wilson Bela Elite V2.5,,,
2025-01-18,padel,training,60,Sheraton Dubai Creek Hotel,Baniyas Rd - Port Saeed - Riggat Al Buteen - Dubai,https://maps.app.goo.gl/TfLezWEToTTsiHAd7,25.26177268,55.31409251,,Wilson Bela Elite V2.5,Ana,,
2025-01-16,padel,training,60,Sheraton Dubai Creek Hotel,Baniyas Rd - Port Saeed - Riggat Al Buteen - Dubai,https://maps.app.goo.gl/TfLezWEToTTsiHAd7,25.26177268,55.31409251,,Wilson Bela Elite V2.5,Ana,,
2024-10-06,tennis,friendly,18,Hamlin Tennis Center,"Pottruck Health and Fitness Center, 3701 Walnut St #23, Philadelphia, PA 19104, United States",https://maps.app.goo.gl/XgwxaM5DJfFPxGjV8,39.94938249,-75.18754332,,Head Graphene 360 Radical MP,Ana,,
2024-09-29,tennis,friendly,60,Hamlin Tennis Center,"Pottruck Health and Fitness Center, 3701 Walnut St #23, Philadelphia, PA 19104, United States",https://maps.app.goo.gl/XgwxaM5DJfFPxGjV8,39.94938249,-75.18754332,,Head Graphene 360 Radical MP,Ana,,
2024-09-22,tennis,friendly,60,Hamlin Tennis Center,"Pottruck Health and Fitness Center, 3701 Walnut St #23, Philadelphia, PA 19104, United States",https://maps.app.goo.gl/XgwxaM5DJfFPxGjV8,39.94938249,-75.18754332,,Head Graphene 360 Radical MP,Ana,,
2024-08-25,tennis,friendly,45,Hamlin Tennis Center,"Pottruck Health and Fitness Center, 3701 Walnut St #23, Philadelphia, PA 19104, United States",https://maps.app.goo.gl/XgwxaM5DJfFPxGjV8,39.94938249,-75.18754332,,Head Graphene 360 Radical MP,Ana,,
2024-08-18,tennis,friendly,61,Hamlin Tennis Center,"Pottruck Health and Fitness Center, 3701 Walnut St #23, Philadelphia, PA 19104, United States",https://maps.app.goo.gl/XgwxaM5DJfFPxGjV8,39.94938249,-75.18754332,,Head Graphene 360 Radical MP,Ana,,
2024-08-11,tennis,friendly,45,Hamlin Tennis Center,"Pottruck Health and Fitness Center, 3701 Walnut St #23, Philadelphia, PA 19104, United States",https://maps.app.goo.gl/XgwxaM5DJfFPxGjV8,39.94938249,-75.18754332,,Head Graphene 360 Radical MP,Ana,,
2024-08-04,tennis,friendly,50,Hamlin Tennis Center,"Pottruck Health and Fitness Center, 3701 Walnut St #23, Philadelphia, PA 19104, United States",https://maps.app.goo.gl/XgwxaM5DJfFPxGjV8,39.94938249,-75.18754332,,Head Graphene 360 Radical MP,Ana,,
2024-07-28,tennis,friendly,55,Hamlin Tennis Center,"Pottruck Health and Fitness Center, 3701 Walnut St #23, Philadelphia, PA 19104, United States",https://maps.app.goo.gl/XgwxaM5DJfFPxGjV8,39.94938249,-75.18754332,,Head Graphene 360 Radical MP,Ana,,
2024-07-21,tennis,friendly,34,Hamlin Tennis Center,"Pottruck Health and Fitness Center, 3701 Walnut St #23, Philadelphia, PA 19104, United States",https://maps.app.goo.gl/XgwxaM5DJfFPxGjV8,39.94938249,-75.18754332,,Head Graphene 360 Radical MP,Ana,,
2024-07-14,tennis,friendly,46,Hamlin Tennis Center,"Pottruck Health and Fitness Center, 3701 Walnut St #23, Philadelphia, PA 19104, United States",https://maps.app.goo.gl/XgwxaM5DJfFPxGjV8,39.94938249,-75.18754332,,Head Graphene 360 Radical MP,Ana,,
2024-05-22,tennis,friendly,111,Hamlin Tennis Center,"Pottruck Health and Fitness Center, 3701 Walnut St #23, Philadelphia, PA 19104, United States",https://maps.app.goo.gl/XgwxaM5DJfFPxGjV8,39.94938249,-75.18754332,,Head Graphene 360 Radical MP,Ana,,
2023-12-10,tennis,friendly,111,Hamlin Tennis Center,"Pottruck Health and Fitness Center, 3701 Walnut St #23, Philadelphia, PA 19104, United States",https://maps.app.goo.gl/XgwxaM5DJfFPxGjV8,39.94938249,-75.18754332,,Head Graphene 360 Radical MP,Ana,,
2023-11-24,tennis,friendly,64,Hamlin Tennis Center,"Pottruck Health and Fitness Center, 3701 Walnut St #23, Philadelphia, PA 19104, United States",https://maps.app.goo.gl/XgwxaM5DJfFPxGjV8,39.94938249,-75.18754332,,Head Graphene 360 Radical MP,Ana,,
2023-11-15,padel,friendly,79,PADELphia,"601 Righters Ferry Rd, Bala Cynwyd, PA 19004, United States",https://maps.app.goo.gl/TtuqmsdW6quwqmvN8,40.01401467,-75.21105089,,HEAD Speed Elite,Mous,"Alvaro, ",
2023-11-12,padel,friendly,151,PADELphia,"601 Righters Ferry Rd, Bala Cynwyd, PA 19004, United States",https://maps.app.goo.gl/TtuqmsdW6quwqmvN8,40.01401467,-75.21105089,,HEAD Speed Elite,Daniel,,
2023-11-11,padel,tournament,99,PADELphia,"601 Righters Ferry Rd, Bala Cynwyd, PA 19004, United States",https://maps.app.goo.gl/TtuqmsdW6quwqmvN8,40.01401467,-75.21105089,,HEAD Speed Elite,Daniel,,
2023-11-11,padel,tournament,85,PADELphia,"601 Righters Ferry Rd, Bala Cynwyd, PA 19004, United States",https://maps.app.goo.gl/TtuqmsdW6quwqmvN8,40.01401467,-75.21105089,,HEAD Speed Elite,Daniel,,
2023-11-10,padel,tournament,75,PADELphia,"601 Righters Ferry Rd, Bala Cynwyd, PA 19004, United States",https://maps.app.goo.gl/TtuqmsdW6quwqmvN8,40.01401467,-75.21105089,,HEAD Speed Elite,Daniel,,
2023-11-09,padel,training,120,PADELphia,"601 Righters Ferry Rd, Bala Cynwyd, PA 19004, United States",https://maps.app.goo.gl/TtuqmsdW6quwqmvN8,40.01401467,-75.21105089,,HEAD Speed Elite,Daniel,,
2023-11-06,padel,friendly,73,PADELphia,"601 Righters Ferry Rd, Bala Cynwyd, PA 19004, United States",https://maps.app.goo.gl/TtuqmsdW6quwqmvN8,40.01401467,-75.21105089,,HEAD Speed Elite,,,
2023-10-21,tennis,friendly,42,Hamlin Tennis Center,"Pottruck Health and Fitness Center, 3701 Walnut St #23, Philadelphia, PA 19104, United States",https://maps.app.goo.gl/XgwxaM5DJfFPxGjV8,39.94938249,-75.18754332,,Head Graphene 360 Radical MP,,,
2023-07-09,tennis,friendly,120,CityLights Building,"4-74 48th Ave, Long Island City, NY 11109, United States",https://maps.app.goo.gl/DgeKGmgBiPTedqED7,40.74456127,-73.95686807,,Head Graphene 360 Radical MP,,,
2023-07-04,padel,friendly,66,Padel Haus Williamsburg,"307 Kent Ave, Brooklyn, NY 11249, United States",https://maps.app.goo.gl/f7X6WofMeypWVYVD6,40.71424865,-73.96651987,,HEAD Speed Elite,,,
2023-06-18,tennis,friendly,40,CityLights Building,"4-74 48th Ave, Long Island City, NY 11109, United States",https://maps.app.goo.gl/DgeKGmgBiPTedqED7,40.74456127,-73.95686807,,Head Graphene 360 Radical MP,,,
2023-06-09,padel,friendly,65,Padel Club Mallorca,"Carrer George Sand, 4, Llevant, 07007 Palma, Illes Balears, Spain",https://maps.app.goo.gl/PJsbEV5oRgTFBnhp8,39.57435696,2.679997925,,NA,,,
2023-05-13,tennis,friendly,47,CityLights Building,"4-74 48th Ave, Long Island City, NY 11109, United States",https://maps.app.goo.gl/DgeKGmgBiPTedqED7,40.74456127,-73.95686807,,Head Graphene 360 Radical MP,,,
2023-04-16,tennis,friendly,30,CityLights Building,"4-74 48th Ave, Long Island City, NY 11109, United States",https://maps.app.goo.gl/DgeKGmgBiPTedqED7,40.74456127,-73.95686807,,Head Graphene 360 Radical MP,,,
2023-04-09,tennis,friendly,35,CityLights Building,"4-74 48th Ave, Long Island City, NY 11109, United States",https://maps.app.goo.gl/DgeKGmgBiPTedqED7,40.74456127,-73.95686807,,Head Graphene 360 Radical MP,,,
2023-03-12,padel,friendly,120,Padel Haus Williamsburg,"307 Kent Ave, Brooklyn, NY 11249, United States",https://maps.app.goo.gl/f7X6WofMeypWVYVD6,40.71424865,-73.96651987,,HEAD Speed Elite,,,
2023-03-05,padel,friendly,120,Padel Haus Williamsburg,"307 Kent Ave, Brooklyn, NY 11249, United States",https://maps.app.goo.gl/f7X6WofMeypWVYVD6,40.71424865,-73.96651987,,HEAD Speed Elite,,,
2023-02-12,padel,tournament,144,Padel Haus Williamsburg,"307 Kent Ave, Brooklyn, NY 11249, United States",https://maps.app.goo.gl/f7X6WofMeypWVYVD6,40.71424865,-73.96651987,,HEAD Speed Elite,,,
2023-02-05,padel,friendly,126,Padel Haus Williamsburg,"307 Kent Ave, Brooklyn, NY 11249, United States",https://maps.app.goo.gl/f7X6WofMeypWVYVD6,40.71424865,-73.96651987,,HEAD Speed Elite,,,
2023-01-29,padel,friendly,120,Padel Haus Williamsburg,"307 Kent Ave, Brooklyn, NY 11249, United States",https://maps.app.goo.gl/f7X6WofMeypWVYVD6,40.71424865,-73.96651987,,HEAD Speed Elite,,,
2023-01-22,padel,friendly,115,Padel Haus Williamsburg,"307 Kent Ave, Brooklyn, NY 11249, United States",https://maps.app.goo.gl/f7X6WofMeypWVYVD6,40.71424865,-73.96651987,,HEAD Speed Elite,,,
2023-01-15,padel,friendly,115,Padel Haus Williamsburg,"307 Kent Ave, Brooklyn, NY 11249, United States",https://maps.app.goo.gl/f7X6WofMeypWVYVD6,40.71424865,-73.96651987,,HEAD Speed Elite,,,
2022-12-16,tennis,,90,,,,,,,Head Graphene 360 Radical MP,,,
2022-11-06,tennis,,60,,,,,,,Head Graphene 360 Radical MP,,,
2022-10-10,tennis,,30,,,,,,,Head Graphene 360 Radical MP,,,
2022-10-09,tennis,,45,,,,,,,Head Graphene 360 Radical MP,,,
2022-09-25,tennis,,70,,,,,,,Head Graphene 360 Radical MP,,,
2022-09-21,tennis,,37,,,,,,,Head Graphene 360 Radical MP,,,
2022-09-19,tennis,,25,,,,,,,Head Graphene 360 Radical MP,,,
2022-09-05,tennis,,130,,,,,,,Head Graphene 360 Radical MP,,,
2022-08-28,tennis,,31,,,,,,,Head Graphene 360 Radical MP, ,,
2022-08-21,tennis,,52,,,,,,,Head Graphene 360 Radical MP,,,
2022-08-19,tennis,,52,,,,,,,Head Graphene 360 Radical MP,,,
2022-08-14,tennis,,36,,,,,,,Head Graphene 360 Radical MP,,,
2022-08-12,tennis,,48,,,,,,,Babolat Pure Strike,,,
2022-08-07,tennis,,34,,,,,,,Babolat Pure Strike,,,
2022-08-05,tennis,,60,,,,,,,Babolat Pure Strike,,,
2022-07-24,tennis,,60,,,,,,,Babolat Pure Strike,,,
2022-07-22,tennis,,56,,,,,,,Babolat Pure Strike,,,
2022-07-15,tennis,,31,,,,,,,Babolat Pure Strike,,,
2022-06-18,padel,,140,,,,,,,NA,,,
2022-06-15,tennis,,68,,,,,,,Babolat Pure Strike,,,
2022-06-13,tennis,,46,,,,,,,Babolat Pure Strike,,,
2022-05-30,tennis,,77,,,,,,,Babolat Pure Strike,,,
2022-05-27,tennis,,52,,,,,,,Babolat Pure Strike,,,
2022-05-23,tennis,,44,,,,,,,Babolat Pure Strike,,,
2022-05-20,tennis,,43,,,,,,,Babolat Pure Strike,`;
