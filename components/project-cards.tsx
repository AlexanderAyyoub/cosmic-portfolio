'use client'

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FaGithub } from "react-icons/fa";

interface Project {
  title: string;
  description: string;
  image?: string;
  link: string;
}

interface ProjectCardProps {
  project: Project;
  index: number;
}

export default function ProjectCard({ project, index }: ProjectCardProps) {
  const images = project.image?.split(',').slice(0, 4) || [];
  const [currentImage, setCurrentImage] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [displayedImage, setDisplayedImage] = useState(0);

  // Fading image transition logic 
  const changeImage = (newIndex: number): void => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);

    setTimeout(() => {
      setDisplayedImage(newIndex);
      setTimeout(() => {
        setIsTransitioning(false);
        setCurrentImage(newIndex);
      }, 50);
    }, 300); 
  };

  useEffect(() => {
    setDisplayedImage(currentImage);
  }, [currentImage]);

  return (
    <Card key={index} className="rounded-sm border shadow-none overflow-hidden" style={{ backgroundColor: '#000E14', borderColor: '#2B3F2F' }}>
      <CardHeader>
        <CardTitle className="text-lg" style={{ fontFamily: 'AlbertusMTStd, serif', color: '#EEE8DC' }}>
          {project.title}
        </CardTitle>
      </CardHeader>

      {images.length > 0 && (
        <div className="relative w-full px-4 pb-2">
          <div className="w-full h-48 relative overflow-hidden">
            <img
              src={images[displayedImage].trim()}
              alt={`${project.title} screenshot ${displayedImage + 1}`}
              className={`w-full h-48 object-cover rounded-lg border-2 border-zinc-700 absolute inset-0 transition-opacity duration-300 ease-in-out ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}
            />
          </div>
          {images.length > 1 && (
            <div className="absolute inset-0 flex items-center justify-between px-2">
              <button 
                onClick={() => changeImage((currentImage - 1 + images.length) % images.length)} 
                className="text-white bg-black/50 rounded-full px-2 py-1 hover:bg-black/70 transition"
                disabled={isTransitioning}
              >
                ‹
              </button>
              <button 
                onClick={() => changeImage((currentImage + 1) % images.length)} 
                className="text-white bg-black/50 rounded-full px-2 py-1 hover:bg-black/70 transition"
                disabled={isTransitioning}
              >
                ›
              </button>
            </div>
          )}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1">
              {images.map((_, i) => (
                <button 
                  key={i} 
                  onClick={() => changeImage(i)}
                  className={`h-2 w-2 rounded-full ${i === currentImage ? 'bg-white' : 'bg-white/50'}`}
                  aria-label={`View image ${i + 1}`}
                  disabled={isTransitioning}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <CardContent className="flex flex-col gap-2">
        <p style={{ color: '#C2C8B8' }}>{project.description}</p>
        <a
          href={project.link}
          target="_blank"
          rel="noopener noreferrer"
          className="focus:outline-none inline-flex items-center gap-2 hover:opacity-80 transition-opacity"
          style={{ color: '#C2C8B8' }}
        >
          <FaGithub size={20} />
          <span className="sr-only">View on GitHub</span>
        </a>
      </CardContent>
    </Card>
  );
}