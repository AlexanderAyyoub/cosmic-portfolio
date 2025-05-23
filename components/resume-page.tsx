'use client'

import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ResumePageBackground from "@/components/background-resume-page";
import ProjectCard from "@/components/project-cards";
import projectsData from "@/public/projects.json";

export default function ResumePage() {
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
            <div className="text-3xl font-semibold border-b pb-2" style={{ fontFamily: 'AlbertusMTStd, serif', color: '#EEE8DC', borderColor: '#2B3F2F' }}>
              Projects
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {projectsData.map((project, index) => (
                <ProjectCard key={index} project={project} index={index} />
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}