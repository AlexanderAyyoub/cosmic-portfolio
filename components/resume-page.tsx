'use client'

import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ResumePageBackground from "@/components/background-resume-page";
import ProjectCard from "@/components/project-cards";
import projectsData from "@/public/projects.json";
import { useRouter } from 'next/navigation';

export default function ResumePage() {
  const router = useRouter();

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

  const handleStarGazingClick = () => {
    router.push('/homePage');
  };

  const strongShadow = 'none';

return (
  <div
    className="relative min-h-screen overflow-x-hidden"
    style={{
      fontFamily: 'ABCArizonaFlare, Arial, sans-serif',
      color: '#EEE8DC',
    }}
  >
    <ResumePageBackground />

    <div className="relative z-10 pl-16 pr-6 md:pl-28 md:pr-12 lg:pl-36 lg:pr-20 py-12">
      <div className="max-w-4xl ml-auto">
        <header className="text-center space-y-3 mb-10">
          <div
            className="text-5xl md:text-6xl font-bold tracking-tight"
            style={{
              fontFamily: 'AlbertusMTStd, serif',
              color: '#EEE8DC',
            }}
          >
            Ratatouille the Developer
          </div>

          <div
            className="text-sm md:text-base"
            style={{
              color: '#C2C8B8',
              textShadow: strongShadow,
            }}
          >
            555-555-5555 | hello@email.com | github.com/yourgithub | linkedin.com/in/yourlinkedin
          </div>
        </header>

        {/* Rounded panel starts after title */}
        <div
          className="relative overflow-hidden rounded-[28px]"
          style={{
            background: 'rgba(0, 14, 20, 0.7)',
            backdropFilter: 'blur(7px)',
            WebkitBackdropFilter: 'blur(7px)',
          }}
        >
          <div className="px-6 md:px-8 lg:px-10 py-8 space-y-14">
            {/* Experience */}
            <section className="space-y-5">
              <div
                className="text-2xl md:text-3xl font-semibold border-b pb-2"
                style={{
                  fontFamily: 'AlbertusMTStd, serif',
                  color: '#EEE8DC',
                  borderColor: '#6E00F5',
                  textShadow: strongShadow,
                }}
              >
                Experience
              </div>

              <Card
                className="rounded-sm border shadow-none"
                style={{
                  backgroundColor: 'rgba(0, 14, 20, 0.82)',
                  borderColor: 'rgba(238, 232, 220, 0.14)',
                }}
              >
                <CardHeader>
                  <CardTitle
                    className="text-xl md:text-2xl"
                    style={{
                      fontFamily: 'AlbertusMTStd, serif',
                      color: '#EEE8DC',
                      textShadow: strongShadow,
                    }}
                  >
                    AI Research & Workflow Automation Consultant
                  </CardTitle>
                  <p
                    className="text-sm md:text-base"
                    style={{ color: '#C2C8B8', textShadow: strongShadow }}
                  >
                    Cynthetica Solutions | Nov. 2025 – Present | Morganville, NJ
                  </p>
                </CardHeader>
                <CardContent>
                  <ul
                    className="list-disc pl-5 space-y-2 text-sm md:text-base"
                    style={{ color: '#C2C8B8' }}
                  >
                    <li>Tested AI prompting and workflow strategies to surface useful internal insights.</li>
                    <li>Built automation systems that reduced manual overhead across client processes.</li>
                  </ul>
                </CardContent>
              </Card>

              <Card
                className="rounded-sm border shadow-none"
                style={{
                  backgroundColor: 'rgba(0, 14, 20, 0.82)',
                  borderColor: 'rgba(238, 232, 220, 0.14)',
                }}
              >
                <CardHeader>
                  <CardTitle
                    className="text-xl md:text-2xl"
                    style={{
                      fontFamily: 'AlbertusMTStd, serif',
                      color: '#EEE8DC',
                      textShadow: strongShadow,
                    }}
                  >
                    Contract Data Automation Developer
                  </CardTitle>
                  <p
                    className="text-sm md:text-base"
                    style={{ color: '#C2C8B8', textShadow: strongShadow }}
                  >
                    Confidential Financial Firm | Nov. 2024 – Jan. 2025 | Morganville, NJ
                  </p>
                </CardHeader>
                <CardContent>
                  <ul
                    className="list-disc pl-5 space-y-2 text-sm md:text-base"
                    style={{ color: '#C2C8B8' }}
                  >
                    <li>Built a Python and Playwright scraping pipeline for 77,000+ SEC filing records.</li>
                    <li>Refined output structure and coverage through direct client feedback.</li>
                  </ul>
                </CardContent>
              </Card>

              <Card
                className="rounded-sm border shadow-none"
                style={{
                  backgroundColor: 'rgba(0, 14, 20, 0.82)',
                  borderColor: 'rgba(238, 232, 220, 0.14)',
                }}
              >
                <CardHeader>
                  <CardTitle
                    className="text-xl md:text-2xl"
                    style={{
                      fontFamily: 'AlbertusMTStd, serif',
                      color: '#EEE8DC',
                      textShadow: strongShadow,
                    }}
                  >
                    Night Auditor
                  </CardTitle>
                  <p
                    className="text-sm md:text-base"
                    style={{ color: '#C2C8B8', textShadow: strongShadow }}
                  >
                    Marriott | Feb. 2025 – Jan. 2026 | Red Bank, NJ
                  </p>
                </CardHeader>
                <CardContent>
                  <ul
                    className="list-disc pl-5 space-y-2 text-sm md:text-base"
                    style={{ color: '#C2C8B8' }}
                  >
                    <li>Managed overnight front desk, reconciliation, and facilities decisions independently.</li>
                    <li>Resolved guest and operations issues during unsupervised overnight shifts.</li>
                  </ul>
                </CardContent>
              </Card>
            </section>

            {/* Projects */}
            <section className="space-y-6">
              <div
                className="text-2xl md:text-3xl font-semibold border-b pb-2"
                style={{
                  fontFamily: 'AlbertusMTStd, serif',
                  color: '#EEE8DC',
                  borderColor: '#6E00F5',
                  textShadow: strongShadow,
                }}
              >
                Projects
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {projectsData.map((project, index) => (
                  <ProjectCard key={index} project={project} index={index} />
                ))}
              </div>
            </section>

            {/* Education */}
            <section className="space-y-5">
              <div
                className="text-2xl md:text-3xl font-semibold border-b pb-2"
                style={{
                  fontFamily: 'AlbertusMTStd, serif',
                  color: '#EEE8DC',
                  borderColor: '#6E00F5',
                  textShadow: strongShadow,
                }}
              >
                Education
              </div>

              <Card
                className="rounded-sm border shadow-none"
                style={{
                  backgroundColor: 'rgba(0, 14, 20, 0.82)',
                  borderColor: 'rgba(238, 232, 220, 0.14)',
                }}
              >
                <CardHeader>
                  <CardTitle
                    className="text-xl md:text-2xl"
                    style={{
                      fontFamily: 'AlbertusMTStd, serif',
                      color: '#EEE8DC',
                      textShadow: strongShadow,
                    }}
                  >
                    Rutgers University – New Brunswick
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p
                    className="text-sm md:text-base"
                    style={{ color: '#C2C8B8', textShadow: strongShadow }}
                  >
                    Bachelor of Science in Computer Science | Sept. 2025 – May 2027 | New Brunswick, NJ
                  </p>
                </CardContent>
              </Card>

              <Card
                className="rounded-sm border shadow-none"
                style={{
                  backgroundColor: 'rgba(0, 14, 20, 0.82)',
                  borderColor: 'rgba(238, 232, 220, 0.14)',
                }}
              >
                <CardHeader>
                  <CardTitle
                    className="text-xl md:text-2xl"
                    style={{
                      fontFamily: 'AlbertusMTStd, serif',
                      color: '#EEE8DC',
                      textShadow: strongShadow,
                    }}
                  >
                    Brookdale Community College
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p
                    className="text-sm md:text-base"
                    style={{ color: '#C2C8B8', textShadow: strongShadow }}
                  >
                    Associate of Science in Computer Science | Sept. 2023 – May 2025 | Lincroft, NJ
                  </p>
                </CardContent>
              </Card>
            </section>

            {/* Skills */}
            <section className="space-y-5">
              <div
                className="text-2xl md:text-3xl font-semibold border-b pb-2"
                style={{
                  fontFamily: 'AlbertusMTStd, serif',
                  color: '#EEE8DC',
                  borderColor: '#6E00F5',
                  textShadow: strongShadow,
                }}
              >
                Skills
              </div>

              <Card
                className="rounded-sm border shadow-none"
                style={{
                  backgroundColor: 'rgba(0, 14, 20, 0.82)',
                  borderColor: 'rgba(238, 232, 220, 0.14)',
                }}
              >
                <CardContent className="pt-6 space-y-4">
                  <div>
                    <p
                      className="text-base md:text-lg"
                      style={{ color: '#EEE8DC', textShadow: strongShadow }}
                    >
                      Languages
                    </p>
                    <p className="text-sm md:text-base" style={{ color: '#C2C8B8' }}>
                      Python, JavaScript, TypeScript, SQL, HTML/CSS, GLSL
                    </p>
                  </div>

                  <div>
                    <p
                      className="text-base md:text-lg"
                      style={{ color: '#EEE8DC', textShadow: strongShadow }}
                    >
                      Frameworks & Tools
                    </p>
                    <p className="text-sm md:text-base" style={{ color: '#C2C8B8' }}>
                      React, Next.js, Three.js, PyQt5, Tailwind CSS, Playwright, Drizzle ORM, Git, Vercel, Blender, Steamworks API
                    </p>
                  </div>

                  <div>
                    <p
                      className="text-base md:text-lg"
                      style={{ color: '#EEE8DC', textShadow: strongShadow }}
                    >
                      Concepts
                    </p>
                    <p className="text-sm md:text-base" style={{ color: '#C2C8B8' }}>
                      Browser automation, data extraction, full-stack development, desktop apps, 3D rendering and shaders
                    </p>
                  </div>
                </CardContent>
              </Card>
            </section>
          </div>
        </div>
      </div>
    </div>

    <button
      onClick={handleStarGazingClick}
      className="fixed bottom-8 right-8 z-50 px-6 py-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
      style={{
        backgroundColor: '#000E14',
        border: '2px solid #EEE8DC',
        fontFamily: 'AlbertusMTStd, serif',
        textShadow: strongShadow,
        color: '#EEE8DC',
      }}
    >
      <div className="text-center">
        <div className="text-lg font-semibold mb-1">
          Let&apos;s go star gazing
        </div>
        <div
          className="text-xs"
          style={{
            color: '#6E00F5',
            textShadow: strongShadow,
          }}
        >
          Highly recommended
        </div>
      </div>
    </button>
  </div>
);
}
