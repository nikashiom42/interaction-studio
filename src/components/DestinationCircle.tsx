interface DestinationCircleProps {
  image: string;
  name: string;
  delay?: number;
}

const DestinationCircle = ({ image, name, delay = 0 }: DestinationCircleProps) => {
  return (
    <div 
      className="flex flex-col items-center gap-3 cursor-pointer group opacity-0 animate-scale-in"
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'forwards' }}
    >
      <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden ring-2 ring-transparent group-hover:ring-primary transition-all duration-300 shadow-card group-hover:shadow-card-hover">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/20 transition-colors duration-300" />
      </div>
      <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
        {name}
      </span>
    </div>
  );
};

export default DestinationCircle;
