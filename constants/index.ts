export const resumes: Resume[] = [
  {
    id: "1",
    companyName: "Google",
    jobTitle: "Frontend Developer",
    imagePath: "/images/resume_01.png",
    resumePath: "/resumes/resume-1.pdf",
    feedback: {
      overallScore: 85,
      ATS: {
        score: 90,
        tips: [],
      },
      toneAndStyle: {
        score: 90,
        tips: [],
      },
      content: {
        score: 90,
        tips: [],
      },
      structure: {
        score: 90,
        tips: [],
      },
      skills: {
        score: 90,
        tips: [],
      },
    },
  },
  {
    id: "2",
    companyName: "Microsoft",
    jobTitle: "Cloud Engineer",
    imagePath: "/images/resume_02.png",
    resumePath: "/resumes/resume-2.pdf",
    feedback: {
      overallScore: 55,
      ATS: {
        score: 90,
        tips: [],
      },
      toneAndStyle: {
        score: 90,
        tips: [],
      },
      content: {
        score: 90,
        tips: [],
      },
      structure: {
        score: 90,
        tips: [],
      },
      skills: {
        score: 90,
        tips: [],
      },
    },
  },
  {
    id: "3",
    companyName: "Apple",
    jobTitle: "iOS Developer",
    imagePath: "/images/resume_03.png",
    resumePath: "/resumes/resume-3.pdf",
    feedback: {
      overallScore: 75,
      ATS: {
        score: 90,
        tips: [],
      },
      toneAndStyle: {
        score: 90,
        tips: [],
      },
      content: {
        score: 90,
        tips: [],
      },
      structure: {
        score: 90,
        tips: [],
      },
      skills: {
        score: 90,
        tips: [],
      },
    },
  },
];

export const AIResponseFormat = `
      interface Feedback {
      overallScore: number; //max 100
      ATS: {
        score: number; //rate based on ATS suitability
        tips: {
          type: "good" | "improve";
          tip: string; //give 3-4 tips
        }[];
      };
      toneAndStyle: {
        score: number; //max 100
        tips: {
          type: "good" | "improve";
          tip: string; //make it a short "title" for the actual explanation
          explanation: string; //explain in detail here
        }[]; //give 3-4 tips
      };
      content: {
        score: number; //max 100
        tips: {
          type: "good" | "improve";
          tip: string; //make it a short "title" for the actual explanation
          explanation: string; //explain in detail here
        }[]; //give 3-4 tips
      };
      structure: {
        score: number; //max 100
        tips: {
          type: "good" | "improve";
          tip: string; //make it a short "title" for the actual explanation
          explanation: string; //explain in detail here
        }[]; //give 3-4 tips
      };
      skills: {
        score: number; //max 100
        tips: {
          type: "good" | "improve";
          tip: string; //make it a short "title" for the actual explanation
          explanation: string; //explain in detail here
        }[]; //give 3-4 tips
      };
    }`;

export const RestructuredCVFormat = `
interface RestructuredCV {
  personalInfo: {
    name?: string;
    email?: string;
    phone?: string;
    location?: string;
    linkedin?: string;
    github?: string;
    website?: string;
  };
  professionalSummary: string;
  experience: {
    company: string;
    position: string;
    duration: string;
    location?: string;
    achievements: string[];
  }[];
  education: {
    institution: string;
    degree: string;
    duration: string;
    location?: string;
    gpa?: string;
    relevantCoursework?: string[];
  }[];
  skills: {
    technical: string[];
    soft: string[];
    languages?: string[];
    certifications?: string[];
  };
  projects?: {
    name: string;
    description: string;
    technologies: string[];
    link?: string;
  }[];
  improvements: {
    changes: string[];
    reasoning: string;
  };
}`;

export const prepareRestructureInstructions = ({
  jobTitle,
  jobDescription,
  feedback,
}: {
  jobTitle: string;
  jobDescription: string;
  feedback: Feedback;
}) =>
  `You are an expert CV restructuring specialist and ATS optimization expert.
  
  Your task is to restructure and optimize this resume to perfectly match the job requirements while fixing all identified issues.
  
  JOB DETAILS:
  Job Title: ${jobTitle}
  Job Description: ${jobDescription}
  
  FEEDBACK FROM PREVIOUS ANALYSIS:
  Overall Score: ${feedback.overallScore}/100
  ATS Score: ${feedback.ATS.score}/100
  Issues to fix: ${JSON.stringify({ 
    ats: feedback.ATS.tips.filter(tip => tip.type === 'improve').map(tip => tip.tip),
    content: feedback.content.tips.filter(tip => tip.type === 'improve').map(tip => tip.tip),
    structure: feedback.structure.tips.filter(tip => tip.type === 'improve').map(tip => tip.tip),
    toneAndStyle: feedback.toneAndStyle.tips.filter(tip => tip.type === 'improve').map(tip => tip.tip),
    skills: feedback.skills.tips.filter(tip => tip.type === 'improve').map(tip => tip.tip)
  })}
  
  INSTRUCTIONS:
  1. Extract and restructure ALL information from the resume
  2. Fix every issue identified in the feedback
  3. Optimize the content to match the job requirements
  4. Ensure ATS-friendly formatting and keywords
  5. Improve the professional summary to target this specific role
  6. Rewrite achievements using action verbs and quantifiable results
  7. Prioritize relevant skills and experience for this job
  8. Add missing keywords from the job description naturally
  9. Ensure proper structure and formatting
  10. Provide detailed reasoning for all changes made
  
  IMPORTANT:
  - Keep all original information but improve presentation
  - Add relevant keywords from job description naturally
  - Make achievements more impactful with numbers/results where possible
  - Fix any grammar, formatting, or ATS issues
  - Prioritize content relevance to the target role
  
  Return the restructured CV using this exact format: ${RestructuredCVFormat}
  Return as a JSON object only, without backticks or additional text.`;

export const prepareInstructions = ({
  jobTitle,
  jobDescription,
}: {
  jobTitle: string;
  jobDescription: string;
}) =>
  `You are an expert in ATS (Applicant Tracking System) and resume analysis.
  Please analyze and rate this resume and suggest how to improve it.
  The rating can be low if the resume is bad.
  Be thorough and detailed. Don't be afraid to point out any mistakes or areas for improvement.
  If there is a lot to improve, don't hesitate to give low scores. This is to help the user to improve their resume.
  If available, use the job description for the job user is applying to to give more detailed feedback.
  If provided, take the job description into consideration.
  The job title is: ${jobTitle}
  The job description is: ${jobDescription}
  Provide the feedback using the following format: ${AIResponseFormat}
  Return the analysis as a JSON object, without any other text and without the backticks.
  Do not include any other text or comments.`;