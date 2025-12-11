import RoadtripCard from './RoadtripCard';
import tripPacific from '@/assets/trip-pacific.jpg';
import tripRocky from '@/assets/trip-rocky.jpg';
import tripDesert from '@/assets/trip-desert.jpg';

const roadtrips = [
  {
    id: 1,
    image: tripPacific,
    title: 'Pacific Coast Highway',
    days: 5,
    miles: 655,
    description: 'Experience the breathtaking views of the California coastline in a convertible.',
    price: 499,
    badge: 'Bestseller',
  },
  {
    id: 2,
    image: tripRocky,
    title: 'Rocky Mountain Escape',
    days: 3,
    miles: 420,
    description: 'Drive through the majestic peaks and serene lakes of the Rockies.',
    price: 350,
  },
  {
    id: 3,
    image: tripDesert,
    title: 'Desert Safari Route',
    days: 2,
    miles: 280,
    description: 'An off-road adventure through canyons and dunes in a 4x4.',
    price: 280,
  },
];

const CuratedRoadtrips = () => {
  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-foreground mb-8">Curated Roadtrips</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roadtrips.map((trip, index) => (
            <RoadtripCard
              key={trip.id}
              {...trip}
              delay={index * 100}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default CuratedRoadtrips;
