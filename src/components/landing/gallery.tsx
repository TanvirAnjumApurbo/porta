import Image from "next/image";

const sections = [
  {
    image: "/aerial-view-container-cargo-ship-sea.jpg",
    title: "Global Reach, Personal Touch",
    subtitle: "Connecting people and packages across borders with the care of a personal traveler.",
    align: "left",
  },
  {
    image: "/cargo-trucks-shipping-containers-sunset-port.jpg",
    title: "Trust Travels With You",
    subtitle: "Every package is verified, every traveler is vetted. Security isn't just a feature, it's our foundation.",
    align: "right",
  },
  {
    image: "/scene-with-photorealistic-logistics-operations-proceedings.jpg",
    title: "Eco-Friendly Logistics",
    subtitle: " Utilizing existing flights and extra luggage space to reduce the carbon footprint of global shipping.",
    align: "left",
  },
];

export function Gallery() {
  return (
    <section className="py-24 space-y-32">
      {sections.map((section, index) => (
        <div key={index} className="relative min-h-[800px] flex items-center overflow-hidden group">
          
          {/* Background Image with Blending */}
          <div className={`absolute inset-0 z-0 ${section.align === "left" ? "mr-12 md:mr-0" : "ml-12 md:ml-0"}`}>
            <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0c] via-transparent to-[#0a0a0c] z-10 pointer-events-none" />
            <Image
              src={section.image}
              alt={section.title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            {/* Blending Gradients */}
            <div className={`absolute inset-0 ${
              section.align === "left" 
                ? "bg-gradient-to-r from-transparent via-[#0a0a0c]/60 to-[#0a0a0c]" 
                : "bg-gradient-to-l from-transparent via-[#0a0a0c]/60 to-[#0a0a0c]"
            }`} />
            
            {/* Vertical Gradient for better text readability on mobile */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] via-transparent to-transparent md:hidden" />
          </div>

          {/* Content Container */}
          <div className="max-w-7xl mx-auto px-6 w-full relative z-10">
            <div className={`flex ${section.align === "left" ? "justify-end" : "justify-start"}`}>
              <div 
                className={`max-w-xl p-8 ${
                  section.align === "left" 
                    ? "md:translate-x-12" 
                    : "md:-translate-x-12"
                }`}
              >
                <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
                  <span className="text-white drop-shadow-lg">{section.title}</span>
                </h2>
                <p className="text-lg text-zinc-200 leading-relaxed font-medium drop-shadow-md">
                  {section.subtitle}
                </p>
              </div>
            </div>
          </div>

        </div>
      ))}
    </section>
  );
}
