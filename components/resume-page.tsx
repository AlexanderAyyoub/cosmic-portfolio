'use client'

import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ResumePageBackground from "@/components/background-resume-page";
import ProjectCard from "@/components/project-cards";
import projectsData from "@/public/projects.json";
import { useRouter } from 'next/navigation';
import { Mail } from 'lucide-react'
import { FaGithub, FaLinkedin } from "react-icons/fa";


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
            Alexander Ayyoub
          </div>

          <div
            className="flex flex-wrap items-center justify-center gap-3 text-sm md:text-base"
            style={{
              color: '#C2C8B8',
              textShadow: strongShadow,
            }}
          >
            <span>732-772-5451</span>

            <span className="opacity-60">|</span>

            <a
              href="mailto:AlexanderAyyoub1@gmail.com"
              className="inline-flex items-center gap-2 text-[#C2C8B8] hover:text-[#EEE8DC] transition-colors"
            >
              <Mail size={16} />
              <span>AlexanderAyyoub1@gmail.com</span>
            </a>

            <span className="opacity-60">|</span>

            <a
              href="https://github.com/AlexanderAyyoub"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-[#C2C8B8] hover:text-[#EEE8DC] transition-colors"
            >
              <FaGithub size={16} />
              <span>github.com/AlexanderAyyoub</span>
            </a>

            <span className="opacity-60">|</span>

            <a
              href="https://www.linkedin.com/in/alexander-ayyoub/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-[#C2C8B8] hover:text-[#EEE8DC] transition-colors"
            >
              <FaLinkedin size={16} />
              <span>linkedin.com/in/alexander-ayyoub</span>
            </a>
          </div>
        </header>

        <div
          className="relative overflow-hidden rounded-[28px]"
          style={{
            background: 'rgba(0, 14, 20, 0.7)',
            backdropFilter: 'blur(7px)',
            WebkitBackdropFilter: 'blur(7px)',
          }}
        >
          <div className="px-6 md:px-8 lg:px-10 py-8 space-y-14">
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
                    Software Engineer (Contract)
                  </CardTitle>
                  <p
                    className="text-sm md:text-base"
                    style={{ color: '#C2C8B8', textShadow: strongShadow }}
                  >
                    Synthetica Solutions | Nov. 2025 – Present | Monroe, NJ
                  </p>
                </CardHeader>
                <CardContent>
                  <ul
                    className="list-disc pl-5 space-y-2 text-sm md:text-base"
                    style={{ color: '#C2C8B8' }}
                  >
                    <li>
                      Drove AI-driven chemical formulation testing using locally hosted models and databases on a
                      custom-built NAS server, keeping all experimentation on-prem and independent of external APIs.
                    </li>
                    <li>
                      Built a computer vision defect detection program using pixel-level color analysis to identify and
                      circle imperfections in gummy products from live camera input, automating quality control
                      reporting for the production team.
                    </li>
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
                    Data Automation Developer (Contract)
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
                    <li>
                      Engineered a Python and Playwright pipeline to extract firm-affiliation data from SEC government
                      filings, automating collection across 77,000+ records to help recruiters evaluate top portfolio
                      manager candidates.
                    </li>
                    <li>
                      Delivered production-ready tooling through iterative client feedback cycles, refining data
                      structure, field coverage, and CSV export format to precisely match recruiter workflow
                      requirements.
                    </li>
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
                    <li>
                      Sole overnight operator managing all front-desk operations, financial reconciliation, and
                      facilities decisions across 11PM–7AM shifts with zero supervisory support.
                    </li>
                    <li>
                      Independently resolved guest issues, de-escalated conflicts, and made on-the-spot operational
                      decisions — consistently maintaining service standards under pressure.
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </section>

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
                      React, Next.js, Three.js, PyQt5, Tailwind CSS, Playwright, Ollama, Docker, Drizzle ORM, Stable Diffusion, Git, Vercel, Blender, Steamworks API
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
                      Browser automation, data extraction, full-stack development, desktop apps, computer vision, locally hosted LLMs, 3D rendering and shaders
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
