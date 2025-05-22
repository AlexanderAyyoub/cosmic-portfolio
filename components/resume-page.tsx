'use client'

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FaGithub } from "react-icons/fa";
import { useTheme } from "next-themes";
import ResumePageBackground from "@/components/background-resume-page";
import projectsData from "@/public/projects.json";

export default function ResumePage() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  // Load the fonts
  useEffect(() => {
    const titleFont = new FontFace(
      'AlbertusMTStd',
      'url(/fonts/AlbertusMTStd.otf)'
    );
    
    const bodyFont = new FontFace(
      'ABCArizonaFlare',
      'url(/fonts/ABCArizonaFlare-Regular-Trial.otf)'
    );
    
    Promise.all([titleFont.load(), bodyFont.load()])
      .then(([loadedTitleFont, loadedBodyFont]) => {
        document.fonts.add(loadedTitleFont);
        document.fonts.add(loadedBodyFont);
      })
      .catch((error) => {
        console.error('Font failed to load:', error);
      });
  }, []);

  return (
    <div className="relative min-h-screen overflow-x-hidden" style={{ fontFamily: 'ABCArizonaFlare, Arial, sans-serif', color: '#EEE8DC' }}>
      <ResumePageBackground />

      <div className="px-8 md:px-24 lg:px-32 py-12 space-y-16 bg-transparent">
        <div className="max-w-6xl mx-auto">
          <header className="text-center space-y-2">
            <div className="text-6xl font-bold tracking-tight" style={{ fontFamily: 'AlbertusMTStd, serif', color: '#EEE8DC' }}>
              Ratatouille the Developer
            </div>
            <p className="text-lg" style={{ color: '#C2C8B8' }}>
              Full Stack Developer | Creative Technologist
            </p>
            <button
              onClick={toggleTheme}
              className="mt-4 h-10 w-10 flex items-center justify-center rounded-sm border border-gray-300 dark:border-gray-700 bg-transparent hover:bg-gray-100 dark:hover:bg-zinc-800 transition"
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-700" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </button>
          </header>

          <section className="space-y-6 mt-16">
            <div className="text-3xl font-semibold border-b pb-2" style={{ fontFamily: 'AlbertusMTStd, serif', color: '#EEE8DC', borderColor: '#2B3F2F' }}>
              Education
            </div>
            <Card className="rounded-sm border shadow-none" style={{ backgroundColor: '#000E14', borderColor: '#2B3F2F' }}>
              <CardHeader>
                <CardTitle className="text-2xl" style={{ fontFamily: 'AlbertusMTStd, serif', color: '#EEE8DC' }}>
                  B.S. in Computer Science
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg" style={{ color: '#C2C8B8' }}>Example University, 2022</p>
              </CardContent>
            </Card>
          </section>

          <section className="space-y-6 mt-12">
            <div className="text-3xl font-semibold border-b pb-2" style={{ fontFamily: 'AlbertusMTStd, serif', color: '#EEE8DC', borderColor: '#2B3F2F' }}>
              Experience
            </div>
            <Card className="rounded-sm border shadow-none" style={{ backgroundColor: '#000E14', borderColor: '#2B3F2F' }}>
              <CardHeader>
                <CardTitle className="text-2xl" style={{ fontFamily: 'AlbertusMTStd, serif', color: '#EEE8DC' }}>
                  Frontend Developer Intern
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg" style={{ color: '#C2C8B8' }}>Tech Corp (2023 - Present)</p>
              </CardContent>
            </Card>
          </section>

          <section className="space-y-6 mt-16">
            <div className="text-3xl font-semibold border-b border-gray-300 dark:border-gray-700 pb-2" style={{ fontFamily: 'AlbertusMTStd, serif', color: '#EEE8DC' }}>
              Projects
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {projectsData.map((project, index) => {
                const images = project.image?.split(',').slice(0, 4) || [];
                const [currentImage, setCurrentImage] = useState(0);
                const [isTransitioning, setIsTransitioning] = useState(false);
                const [displayedImage, setDisplayedImage] = useState(0);

                //Fading image transition logic 
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
                }, []);

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
                            className={`w-full h-48 object-cover rounded-lg border-2 border-gray-300 dark:border-zinc-700 absolute inset-0 transition-opacity duration-300 ease-in-out ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}
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
              })}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}