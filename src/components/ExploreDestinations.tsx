import DestinationCircle from './DestinationCircle';
import destMiami from '@/assets/dest-miami.jpg';
import destLA from '@/assets/dest-la.jpg';
import destLondon from '@/assets/dest-london.jpg';
import destDubai from '@/assets/dest-dubai.jpg';
import destParis from '@/assets/dest-paris.jpg';
import destTokyo from '@/assets/dest-tokyo.jpg';

const destinations = [
  { id: 1, name: 'Miami', image: destMiami },
  { id: 2, name: 'Los Angeles', image: destLA },
  { id: 3, name: 'London', image: destLondon },
  { id: 4, name: 'Dubai', image: destDubai },
  { id: 5, name: 'Paris', image: destParis },
  { id: 6, name: 'Tokyo', image: destTokyo },
];

const ExploreDestinations = () => {
  return (
    <section className="py-12 bg-secondary/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-foreground mb-8">Explore Destinations</h2>
        
        <div className="flex justify-start sm:justify-center gap-6 sm:gap-10 overflow-x-auto pb-4 scrollbar-hide">
          {destinations.map((dest, index) => (
            <DestinationCircle
              key={dest.id}
              image={dest.image}
              name={dest.name}
              delay={index * 80}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ExploreDestinations;
