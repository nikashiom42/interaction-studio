import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import CarCard from './CarCard';
import carRangeRover from '@/assets/car-range-rover.jpg';
import carCorvette from '@/assets/car-corvette.jpg';
import carMercedes from '@/assets/car-mercedes.jpg';
import carTesla from '@/assets/car-tesla.jpg';

const cars = [
  {
    id: 1,
    image: carRangeRover,
    name: 'Range Rover Sport',
    type: 'Luxury SUV • Automatic',
    rating: 4.9,
    originalPrice: 180,
    price: 150,
  },
  {
    id: 2,
    image: carCorvette,
    name: 'Chevrolet Corvette',
    type: 'Sports • Automatic',
    rating: 5.0,
    originalPrice: 220,
    price: 195,
  },
  {
    id: 3,
    image: carMercedes,
    name: 'Mercedes S-Class',
    type: 'Luxury • Automatic',
    rating: 4.9,
    originalPrice: 250,
    price: 210,
  },
  {
    id: 4,
    image: carTesla,
    name: 'Tesla Model 3',
    type: 'Electric • Autopilot',
    rating: 4.7,
    originalPrice: 100,
    price: 85,
  },
];

const PopularCars = () => {
  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-foreground">Popular Cars Near You</h2>
          <Link to="/cars" className="flex items-center gap-2 text-primary font-medium hover:gap-3 transition-all group">
            <span>View all</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Cars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {cars.map((car, index) => (
            <Link key={car.id} to={`/car/${car.id}`}>
              <CarCard
                {...car}
                delay={index * 100}
              />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PopularCars;
