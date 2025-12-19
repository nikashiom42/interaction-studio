-- Seed blog posts for the car rental site
INSERT INTO public.blogs (title, slug, excerpt, content, author_name, is_published, published_at, main_image)
VALUES 
(
  'Top 10 Scenic Drives in Georgia',
  'top-10-scenic-drives-georgia',
  'Discover the most breathtaking routes through Georgia''s stunning landscapes, from mountain passes to coastal roads.',
  '## Explore Georgia''s Most Beautiful Roads

Georgia offers some of the most spectacular driving experiences in the world. From the winding roads of the Caucasus Mountains to the lush valleys of Kakheti, every turn reveals a new adventure.

### 1. Georgian Military Highway
The legendary route connecting Tbilisi to Vladikavkaz offers breathtaking views of the Greater Caucasus. Stop at the iconic Ananuri Fortress and the stunning Jvari Pass.

### 2. Tusheti Road
One of the most dangerous yet rewarding roads in the world. This unpaved mountain pass leads to the remote Tusheti region.

### 3. Svaneti Route
Drive through UNESCO-protected villages with their iconic medieval towers against a backdrop of snow-capped peaks.

### 4. Kakheti Wine Route
A gentler drive through Georgia''s premier wine region, perfect for combining scenic views with wine tasting.

### 5. Kazbegi Highway
Experience the majesty of Mount Kazbek while driving through dramatic gorges and past ancient churches.

**Pro Tip:** Rent an SUV for the more adventurous routes, especially Tusheti and some parts of Svaneti.',
  'Travel Team',
  true,
  NOW() - INTERVAL '5 days',
  'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800'
),
(
  'Essential Tips for Renting a Car in Georgia',
  'essential-tips-renting-car-georgia',
  'Everything you need to know before renting a car in Georgia - from documentation to driving culture.',
  '## Your Complete Guide to Car Rental in Georgia

Renting a car in Georgia gives you the freedom to explore this beautiful country at your own pace. Here''s what you need to know.

### Documentation Required
- Valid driver''s license (international license recommended)
- Passport or ID
- Credit card for deposit
- Minimum age: 21 years (25 for luxury vehicles)

### Driving in Georgia
Georgia drives on the right side of the road. Speed limits are typically:
- Urban areas: 60 km/h
- Rural roads: 80 km/h
- Highways: 110 km/h

### Insurance Options
We recommend comprehensive insurance, especially if you plan to venture into mountainous regions. Our packages include:
- Basic liability coverage
- Collision damage waiver (CDW)
- Full coverage with zero deductible

### Fuel Tips
- Petrol stations are widely available in cities and along major routes
- In remote areas, fill up whenever you see a station
- Most cars run on petrol; diesel is less common

### Road Conditions
Main highways are generally in good condition. Mountain roads can be challenging but offer incredible views. Always check weather conditions before heading into the mountains.',
  'Customer Support',
  true,
  NOW() - INTERVAL '3 days',
  'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800'
),
(
  'Best Time to Visit Georgia: A Seasonal Guide',
  'best-time-visit-georgia-seasonal-guide',
  'Plan your perfect Georgian road trip by understanding the best seasons for different regions and activities.',
  '## When to Visit Georgia

Georgia is a year-round destination, but each season offers unique experiences.

### Spring (April - May)
- Perfect weather for road trips
- Wildflowers blanket the valleys
- Great for wine regions
- Some mountain passes may still be closed

### Summer (June - August)
- Ideal for mountain adventures
- All roads and passes are open
- Beach season on the Black Sea coast
- Festival season in full swing

### Autumn (September - November)
- Wine harvest season (Rtveli)
- Beautiful fall colors
- Perfect temperatures for driving
- Great for photography

### Winter (December - March)
- Ski season in Gudauri and Bakuriani
- Festive atmosphere in Tbilisi
- Some mountain roads closed
- Great for hot springs and cozy experiences

**Our Recommendation:** September and October offer the best combination of weather, accessibility, and unique cultural experiences like the traditional wine harvest.',
  'Travel Team',
  true,
  NOW() - INTERVAL '1 day',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800'
);