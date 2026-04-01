import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";

interface TourItem {
  id: string;
  title: string;
  slug: string;
  summary: string;
  destination: string;
  cover: string;
  price: number;
}

export function FeaturedTours({ tours }: { tours: TourItem[] }) {
  return (
    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
      {tours.map((tour, i) => (
        <Link 
          key={tour.id} 
          href={`/travel-deals/${tour.slug}`} 
          className="group relative h-[450px] w-full overflow-hidden rounded-[2rem] block bg-slate-100 isolate"
          style={{ animationDelay: `${i * 150}ms` }}
        >
          {/* Image Layer */}
          <Image 
            src={tour.cover} 
            alt={tour.title} 
            fill 
            className="object-cover transition-transform duration-1000 group-hover:scale-110" 
          />
          
          {/* Gradients */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/10 to-bb-navy/90 transition-opacity duration-500" />
          <div className="absolute inset-0 bg-gradient-to-t from-bb-navy via-transparent to-transparent opacity-0 group-hover:opacity-60 transition-opacity duration-700" />
          
          {/* Floating Destination Badge */}
          <div className="absolute top-6 left-6 inline-flex items-center gap-1.5 rounded-full bg-white/20 backdrop-blur-md px-4 py-1.5 border border-white/20 shadow-lg translate-y-0 group-hover:-translate-y-1 transition-transform duration-500">
            <MapPin className="h-3 w-3 text-white" />
            <span className="text-xs font-bold uppercase tracking-widest text-white">{tour.destination}</span>
          </div>

          {/* Content Layer */}
          <div className="absolute bottom-0 left-0 right-0 p-8 pt-20">
            <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 ease-out">
              <h3 className="text-3xl font-bold text-white mb-3 tracking-tight">{tour.title}</h3>
              
              <div className="h-px w-full bg-white/20 my-5 overflow-hidden">
                <div className="h-full w-1/3 bg-bb-gold -translate-x-[100%] group-hover:translate-x-0 transition-transform duration-700 delay-100" />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-widest text-white/70 mb-1">Starting from</p>
                  <span className="text-xl font-bold text-bb-gold">${tour.price}</span>
                </div>
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-white text-bb-navy transition-all duration-300 group-hover:scale-110 group-hover:bg-bb-gold shadow-[0_0_20px_rgba(255,255,255,0.2)] group-hover:shadow-[0_0_20px_rgba(234,179,8,0.4)]">
                  <ArrowRight className="h-5 w-5 -rotate-45 group-hover:rotate-0 transition-transform duration-500" />
                </span>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
