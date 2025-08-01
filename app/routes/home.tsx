import Navbar from "~/components/Navbar";
import type { Route } from "./+types/home";
import ResumeCard from "~/components/ResumeCard";
import { useEffect, useState } from "react";
import { usePuterStore } from "~/lib/puter";
import { Link, useNavigate } from "react-router";
import { CVRefineIcon } from "~/components/favicon";
import { CVRefineSectionBackground } from "~/components/background";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "CVRefine" },
    { name: "description", content: "Smart CV Analyzer" },
  ];
}

export default function Home() {
  const { auth, kv } = usePuterStore();
  const navigate = useNavigate();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loadingResumes, setLoadingResumes] = useState(false);


  useEffect(() => {
    if(!auth.isAuthenticated) navigate('/auth?next=/')
  }, [auth.isAuthenticated])

  useEffect(() => {
    const loadResumes = async () => {
      setLoadingResumes(true);
      const resumes = (await kv.list('resume-*', true)) as KVItem[];
      const parsedResumes = resumes?.map((resume) => (
        JSON.parse(resume.value) as Resume
      ));

      setResumes(parsedResumes || []);
      setLoadingResumes(false);
    }

    loadResumes();
  },[])

  return (
    <CVRefineSectionBackground>
      <main className="">
        <Navbar />
        <section  className="main-section">
          <div className="page-heading py-16">
            <h1>Refine Your Resume, Land Your Dream Job</h1>
            {!loadingResumes && resumes.length === 0 ? (
              <h2>Ready for better job matches? Upload your first CV to unlock AI-powered insights</h2>
            ): (
              <h2>Smart CV Review & AI-Driven Improvements</h2>
            )}
          </div>

          {loadingResumes &&(
            <div className="flex flex-col items-center justify-center">
              <img src="/images/resume-scan-2.gif" alt="resume scan" className="w-[200px]" />
            </div>
          )}

          {
            !loadingResumes && resumes.length > 0 && (
              <div className="resumes-section">
                {
                  resumes.map((resume:Resume) => (
                    <ResumeCard key={resume.id} resume={resume} />
                  ))
                }
              </div>
            )
          }
          {
            !loadingResumes && resumes.length === 0 && (
              <div className="flex flex-col items-center justify-center mt-10 gap-4">
                <Link to="/upload" className="primary-button w-fit text-xl font-semibold">
                  Upload CV
                </Link>
                <CVRefineIcon />
              </div>
            )
          }
        </section>
      </main>
    </CVRefineSectionBackground>
  )
}
