/**
 * Generates supabase/migrations/024_seed_featured_tours.sql from the same
 * catalogue as src/lib/mockData.ts (featuredTours).
 * Run from repo root: node scripts/emit-featured-tours-migration.mjs
 */
import { writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

const tours = [
  {
    title: "Dubai Luxury Escape",
    slug: "dubai-luxury-escape",
    destination: "Dubai, UAE",
    durationDays: 6,
    price: 1500,
    priceRange: "$1,500 - $2,200",
    cover:
      "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80",
    shortDescription:
      "Experience the pinnacle of luxury with our all-inclusive Dubai package featuring premium stays and exclusive guided tours.",
    overview:
      "Our Dubai Luxury Escape is designed for those who desire the absolute best. From the moment you arrive, you'll be treated to VIP experiences, staying in 5-star accommodations overlooking the breathtaking skyline. This meticulously planned itinerary balances high-octane adventure in the Arabian desert with refined dining, world-class shopping, and exclusive access to iconic landmarks like the Burj Khalifa.",
    highlights: ["Desert Safari", "Burj Khalifa VIP", "Marina Dhow Cruise"],
    included: [
      "5 Nights 5-Star Accommodation",
      "VIP Airport Meet & Greet",
      "Daily Gourmet Breakfast & Select Dinners",
      "Premium Desert Safari with BBQ",
      "At The Top Burj Khalifa Tickets",
      "Private City Tour Transportation"
    ],
    excluded: ["International Flights", "Personal Expenses", "Visa Fees (available as add-on)"],
    itinerary: [
      {
        day: 1,
        title: "Arrival & VIP Welcome",
        description:
          "Arrive at DXB. Private transfer to your luxury hotel. Evening Welcome Dinner at Marina."
      },
      {
        day: 2,
        title: "Modern Dubai City Tour",
        description: "Explore the futuristic side of Dubai. VIP access to the Burj Khalifa and breathtaking views."
      },
      {
        day: 3,
        title: "Premium Desert Safari",
        description:
          "Afternoon dune bashing in 4x4s, camel rides, and a luxurious sunset BBQ dinner in the desert."
      },
      {
        day: 4,
        title: "Cultural & Heritage Tour",
        description:
          "Visit the Gold and Spice Souks. Cross the Dubai Creek on an Abra and enjoy a Dhow Cruise dinner."
      },
      { day: 5, title: "Leisure & Shopping", description: "Free day for high-end shopping at the Dubai Mall or relaxing at private beach clubs." },
      { day: 6, title: "Departure", description: "Private luxury transfer back to the airport for your onward journey." }
    ],
    sort_order: 0
  },
  {
    title: "Singapore City Explorer",
    slug: "singapore-city-explorer",
    destination: "Singapore",
    durationDays: 7,
    price: 2100,
    priceRange: "$2,100 - $2,800",
    cover:
      "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=1200&q=80",
    shortDescription:
      "Immerse yourself in the futuristic beauty of Singapore. A perfect blend of culture, technology, and stunning architecture.",
    overview:
      "Singapore is a marvel of modern engineering and rich cultural heritage. This 7-day explorer package takes you from the bustling street food markets of Chinatown and Little India to the breathtaking Supertree Grove in Gardens by the Bay. Experience a destination where nature flawlessly intertwines with futuristic architecture, providing an unforgettable balance of relaxation and urban exploration.",
    highlights: ["Gardens by the Bay", "Sentosa Island", "Marina Bay Sands"],
    included: [
      "6 Nights Premium Accommodation",
      "All Land Transfers",
      "Daily Breakfast",
      "Gardens by the Bay Entry",
      "Sentosa Island Pass",
      "Guided Cultural Tours"
    ],
    excluded: ["Flights", "Travel Insurance", "Lunch and Dinner"],
    itinerary: [
      { day: 1, title: "Arrival at Changi", description: "Arrival in Singapore, famous for its incredible airport. Transfer and check-in." },
      {
        day: 2,
        title: "Gardens by the Bay",
        description: "Full day exploring the Flower Dome, Cloud Forest, and evening Supertree light show."
      },
      {
        day: 3,
        title: "Cultural Neighborhoods",
        description: "Guided walking tours of Chinatown, Kampong Glam, and Little India with food tasting."
      },
      { day: 4, title: "Sentosa Island", description: "Full day of entertainment at Sentosa, including Universal Studios or beach clubs." },
      {
        day: 5,
        title: "Marina Bay Area",
        description: "Explore the Marina Bay Sands precinct, ArtScience Museum, and enjoy high tea."
      },
      {
        day: 6,
        title: "Nature & Wildlife",
        description: "Visit the Singapore Botanic Gardens or Night Safari for a unique wildlife experience."
      },
      { day: 7, title: "Departure", description: "Morning leisure. Transfer to Changi Airport for departure." }
    ],
    sort_order: 1
  },
  {
    title: "Parisian Romance",
    slug: "parisian-romance",
    destination: "Paris, France",
    durationDays: 5,
    price: 1800,
    priceRange: "$1,800 - $2,500",
    cover: "/images/tours/paris.webp",
    shortDescription:
      "Discover the magic of Paris with expertly curated romantic experiences, central accommodations, and seamless logistics.",
    overview:
      "There is nowhere quite like Paris for a romantic escape. This 5-day itinerary focuses entirely on the ambiance and elegance of the French capital. Avoid the typical tourist traps as our local guides lead you through hidden cobblestone streets, private museum viewings, and exclusive culinary experiences, culminating in an unforgettable dinner with a view of the twinkling Eiffel Tower.",
    highlights: ["Eiffel Tower Dinner", "Louvre Fast-track", "Seine River Cruise"],
    included: [
      "4 Nights Boutique Hotel in Le Marais",
      "Eiffel Tower Dinner Reservation (set menu)",
      "Fast-Track Louvre Tickets",
      "Private Seine River Evening Cruise",
      "Airport Transfers"
    ],
    excluded: ["Schengen Visa", "International Flights", "Personal Shopping"],
    itinerary: [
      {
        day: 1,
        title: "Arrival in Paris",
        description: "Welcome to the City of Light. Private transfer to your boutique hotel. Evening stroll in Montmartre."
      },
      { day: 2, title: "Art & Culture", description: "Fast-track entry to the Louvre. Afternoon exploring the Latin Quarter." },
      {
        day: 3,
        title: "The Seine & Romance",
        description: "A day at leisure. Evening private boat cruise on the River Seine with champagne."
      },
      {
        day: 4,
        title: "Iconic Views",
        description: "Explore Champs-Élysées. Evening concludes with a spectacular dinner at the Eiffel Tower."
      },
      { day: 5, title: "Au Revoir", description: "Final café au lait and croissants before private transfer to CDG Airport." }
    ],
    sort_order: 2
  },
  {
    title: "Cape Town Adventure",
    slug: "cape-town-adventure",
    destination: "Cape Town, South Africa",
    durationDays: 8,
    price: 1200,
    priceRange: "$1,200 - $1,900",
    cover:
      "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?auto=format&fit=crop&w=1200&q=80",
    shortDescription:
      "An unforgettable South African journey combining breathtaking landscapes, wildlife, and vibrant city life.",
    overview:
      "Cape Town is consistently voted one of the most beautiful cities in the world. This 8-day adventure showcases its stunning natural diversity—from ascending the iconic Table Mountain via cable car to observing the penguin colonies at Boulders Beach, and sipping world-renowned varietals in the historic Stellenbosch Winelands.",
    highlights: ["Table Mountain", "Cape Point", "Winelands Tour"],
    included: [
      "7 Nights 4-Star Accommodation",
      "Table Mountain Aerial Cableway Tickets",
      "Cape Point Nature Reserve Entry",
      "Full Day Winelands Tour with Tastings",
      "All Ground Transport"
    ],
    excluded: ["Flights", "Optional Shark Cage Diving", "Lunches & Dinners"],
    itinerary: [
      {
        day: 1,
        title: "Welcome to the Mother City",
        description: "Arrive at CPT. Transfer to V&A Waterfront hotel. Evening welcome dinner."
      },
      {
        day: 2,
        title: "Table Mountain & City",
        description: "Morning cable car up Table Mountain. Afternoon historical city tour including Bo-Kaap."
      },
      {
        day: 3,
        title: "Cape Peninsula Tour",
        description: "Scenic drive via Chapman's Peak to Cape Point and the Cape of Good Hope."
      },
      {
        day: 4,
        title: "Penguins & Coastline",
        description: "Visit Boulders Beach penguin colony and have lunch in historic Simon's Town."
      },
      {
        day: 5,
        title: "Cape Winelands",
        description: "Full day exploring Stellenbosch and Franschhoek with premium wine and cheese tastings."
      },
      {
        day: 6,
        title: "Robben Island",
        description: "Ferry trip to Robben Island to tour the former prison where Nelson Mandela was held."
      },
      {
        day: 7,
        title: "Leisure & Shopping",
        description: "Free day at the V&A Waterfront for shopping or optional adventure activities."
      },
      { day: 8, title: "Departure", description: "Transfer to Cape Town International Airport." }
    ],
    sort_order: 3
  },
  {
    title: "London Heritage Tour",
    slug: "london-heritage-tour",
    destination: "London, UK",
    durationDays: 6,
    price: 2000,
    priceRange: "$2,000 - $2,600",
    cover:
      "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1200&q=80",
    shortDescription:
      "Explore the historic streets of London with our premium guided experience covering all major royal and cultural landmarks.",
    overview:
      "Step into centuries of history integrated seamlessly with a thriving modern metropolis. Our London Heritage Tour is an extensive cultural immersion. You will walk the corridors of regal palaces, witness legendary theater in the West End, and explore world-class museums, all coordinated with private transport and fast-track access.",
    highlights: ["Tower of London", "Buckingham Palace", "West End Show"],
    included: [
      "5 Nights Central London Hotel",
      "Oyster Card for Transport",
      "Tower of London Entry",
      "West End Theater Tickets (Premium Seating)",
      "Afternoon Tea Experience"
    ],
    excluded: ["UK Visa", "International Flights", "Meals outside of breakfast/tea"],
    itinerary: [
      {
        day: 1,
        title: "London Arrival",
        description: "Welcome to London. Private transfer to your hotel. Evening walk around Covent Garden."
      },
      {
        day: 2,
        title: "Royal London",
        description: "Witness the Changing of the Guard. Tour Westminster Abbey and see Big Ben."
      },
      {
        day: 3,
        title: "Tower & Thames",
        description: "Explore the Tower of London and Crown Jewels. Afternoon Thames Clipper cruise."
      },
      {
        day: 4,
        title: "Museums & High Tea",
        description: "Morning at the British Museum. Traditional Afternoon Tea at a luxury hotel."
      },
      {
        day: 5,
        title: "The West End",
        description: "Day at leisure for shopping on Oxford Street. Evening premium theater performance."
      },
      { day: 6, title: "Departure", description: "Transfer to Heathrow or Gatwick for your departure." }
    ],
    sort_order: 4
  },
  {
    title: "Bali Wellness Retreat",
    slug: "bali-wellness-retreat",
    destination: "Bali, Indonesia",
    durationDays: 10,
    price: 1400,
    priceRange: "$1,400 - $2,100",
    cover:
      "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80",
    shortDescription:
      "Disconnect and recharge in tropical paradise. A fully managed luxury retreat prioritizing peace, culture, and relaxation.",
    overview:
      "Find your center on the Island of the Gods. This 10-day wellness retreat perfectly balances spiritual exploration in the jungle-clad hills of Ubud with the sophisticated beach club culture of Seminyak. Designed to rejuvenate both body and mind, this package includes luxury villa stays, traditional spa treatments, and privately guided cultural excursions.",
    highlights: ["Ubud Temples", "Seminyak Beaches", "Private Villa Stay"],
    included: [
      "9 Nights Luxury Villa Accommodation",
      "Traditional Balinese Massage Therapy",
      "Guided Yoga Sessions",
      "Ubud Cultural Tour",
      "Airport & Inter-City Transfers",
      "Daily Healthy Breakfasts"
    ],
    excluded: ["Flights", "Alcoholic Beverages", "Gratuities"],
    itinerary: [
      { day: 1, title: "Check-in at Ubud", description: "Arrival in Bali. Transfer to your private jungle villa in Ubud. Rest." },
      { day: 2, title: "Ubud Yoga & Culture", description: "Morning yoga. Afternoon visit to the Sacred Monkey Forest and Royal Palace." },
      {
        day: 3,
        title: "Rice Terraces & Temples",
        description: "Sunrise tour of Tegalalang Rice Terraces and purification at Tirta Empul Temple."
      },
      { day: 4, title: "Wellness & Spa Day", description: "A day dedicated to relaxation with included traditional Balinese healing spa treatments." },
      {
        day: 5,
        title: "Transfer to Seminyak",
        description: "Move from the jungle to the trendy coastal town of Seminyak. Check into beach villa."
      },
      {
        day: 6,
        title: "Beach Clubs & Sunsets",
        description: "Relax by the ocean. Evening sunset viewing at the famous Potato Head Beach Club."
      },
      {
        day: 7,
        title: "Uluwatu Excursion",
        description: "Afternoon trip to the stunning Uluwatu cliff temple and traditional Kecak fire dance."
      },
      {
        day: 8,
        title: "Shopping & Leisure",
        description: "Explore the boutique shops and exquisite cafes lining Seminyak's colorful streets."
      },
      {
        day: 9,
        title: "Farewell Dinner",
        description: "Final day at leisure ending with an elegant farewell dinner by the beach."
      },
      { day: 10, title: "Departure", description: "Check out and transfer to Ngurah Rai International Airport for departure." }
    ],
    sort_order: 5
  }
];

function sqlString(s) {
  return "'" + String(s).replace(/'/g, "''") + "'";
}

function sqlTextArray(arr) {
  return "array[" + arr.map((x) => sqlString(x)).join(", ") + "]::text[]";
}

const valueRows = tours.map((t) => {
  const duration = `${t.durationDays} days`;
  const imagesLiteral = sqlString(JSON.stringify([t.cover]));
  const itineraryLiteral = sqlString(JSON.stringify(t.itinerary));
  return `  (${sqlString(t.title)}, ${sqlString(t.slug)}, ${Number(t.price)}, ${sqlString(duration)}, ${itineraryLiteral}::jsonb, ${sqlTextArray(
    t.included
  )}, ${imagesLiteral}::jsonb, true, ${sqlString(t.destination)}, ${t.durationDays}, ${sqlString(
    t.priceRange
  )}, ${sqlString(t.cover)}, ${sqlString(t.shortDescription)}, ${sqlString(t.overview)}, ${sqlTextArray(
    t.highlights
  )}, ${sqlTextArray(t.excluded)}, ${t.sort_order})`;
});

const header = `-- Catalogue seed: mirrors src/lib/mockData.ts featuredTours. Safe to re-run (upserts on slug).
insert into public.tours (
  title, slug, price, duration, itinerary, inclusions, images, is_active,
  destination, duration_days, price_range, cover_image, short_description, overview,
  highlights, exclusions, sort_order
) values
`;

const conflict = `
on conflict (slug) do update set
  title = excluded.title,
  price = excluded.price,
  duration = excluded.duration,
  itinerary = excluded.itinerary,
  inclusions = excluded.inclusions,
  images = excluded.images,
  is_active = excluded.is_active,
  destination = excluded.destination,
  duration_days = excluded.duration_days,
  price_range = excluded.price_range,
  cover_image = excluded.cover_image,
  short_description = excluded.short_description,
  overview = excluded.overview,
  highlights = excluded.highlights,
  exclusions = excluded.exclusions,
  sort_order = excluded.sort_order,
  updated_at = now();
`;

const sql = header + valueRows.join(",\n") + conflict;

const out = join(__dirname, "..", "supabase", "migrations", "024_seed_featured_tours.sql");
writeFileSync(out, sql, "utf8");
console.log("Wrote", out);
