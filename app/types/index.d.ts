interface Job {
  title: string;
  description: string;
  location: string;
  requiredSkills: string[];
}

interface Resume {
  id: string;
  companyName?: string;
  jobTitle?: string;
  jobDescription?: string;
  imagePath: string;
  resumePath: string;
  feedback: Feedback;
  restructuredCV?: RestructuredCV;
}

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
}

interface Feedback {
  overallScore: number;
  ATS: {
    score: number;
    tips: {
      type: "good" | "improve";
      tip: string;
    }[];
  };
  toneAndStyle: {
    score: number;
    tips: {
      type: "good" | "improve";
      tip: string;
      explanation: string;
    }[];
  };
  content: {
    score: number;
    tips: {
      type: "good" | "improve";
      tip: string;
      explanation: string;
    }[];
  };
  structure: {
    score: number;
    tips: {
      type: "good" | "improve";
      tip: string;
      explanation: string;
    }[];
  };
  skills: {
    score: number;
    tips: {
      type: "good" | "improve";
      tip: string;
      explanation: string;
    }[];
  };
}