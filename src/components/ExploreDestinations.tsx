import DestinationCircle from './DestinationCircle';
import destTbilisi from '@/assets/dest-miami.jpg';
import destBatumi from '@/assets/dest-la.jpg';
import destKutaisi from '@/assets/dest-london.jpg';
import destKazbegi from '@/assets/dest-dubai.jpg';
import destBorjomi from '@/assets/dest-paris.jpg';
import destSvaneti from '@/assets/dest-tokyo.jpg';

const destinations = [
  { id: 1, name: 'Tbilisi', image: destTbilisi },
  { id: 2, name: 'Batumi', image: destBatumi },
  { id: 3, name: 'Kutaisi', image: destKutaisi },
  { id: 4, name: 'Kazbegi', image: destKazbegi },
  { id: 5, name: 'Borjomi', image: destBorjomi },
  { id: 6, name: 'Svaneti', image: destSvaneti },
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
