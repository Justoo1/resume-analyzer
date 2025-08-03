import { useEffect, useState } from "react";
import { prepareRestructureInstructions } from "constants/index";
import { Link, useNavigate, useParams } from "react-router";
import { CVRefineSectionBackground } from "~/components/background";
import ATS from "~/components/feedback/ATS";
import Details from "~/components/feedback/Details";
import Summary from "~/components/feedback/Summary";
import RestructuredCV from "~/components/RestructuredCV";
import ErrorFeedback from "~/components/ErrorFeedback";
import { usePuterStore } from "~/lib/puter";
import { parseAPIError } from "~/lib/error-handler";
import type { ErrorInfo } from "~/lib/error-handler";

export const meta = () => {
    return [
        { title: "CVRefine | Review" },
        { name: "description", content: "Detailed CV overview" },
    ];
}

const Resume = () => {
    const { auth, isLoading, fs, kv, ai } = usePuterStore();
    const { id } = useParams();
    const [imageUrl, setImageUrl] = useState('');
    const [resumeUrl, setResumeUrl] = useState('');
    const [feedback , setFeedback] = useState<Feedback | null>(null);
    const [resumeData, setResumeData] = useState<any>(null);
    const [restructuredCV, setRestructuredCV] = useState<RestructuredCV | null>(null);
    const [isRestructuring, setIsRestructuring] = useState(false);
    const [showRestructured, setShowRestructured] = useState(false);
    const [isReplacing, setIsReplacing] = useState(false);
    const [isReanalyzing, setIsReanalyzing] = useState(false);
    const [error, setError] = useState<ErrorInfo | null>(null);
    const [title, setTitle] = useState('CV Review');
    const navigate = useNavigate();

     useEffect(() => {
        if(!isLoading && !auth.isAuthenticated) navigate(`/auth?next=/resume/${id}`);
    }, [isLoading])
    
    useEffect(() => {
        const loadResume = async () => {
            const resume = await kv.get(`resume-${id}`);
            if(!resume) return;

            const data = JSON.parse(resume);
            console.log(data)
            setResumeData(data);
            
            const resumeBlob = await fs.read(data.resumePath);
            if(!resumeBlob) return;

            const pdfBlob = new Blob([resumeBlob], { type: 'application/pdf' });
            const resumeUrl = URL.createObjectURL(pdfBlob);

            const imageBlob = await fs.read(data.imagePath);
            if(!imageBlob) return;

            const image = new Blob([imageBlob], { type: 'image/png' });
            const imageUrl = URL.createObjectURL(image);

            setResumeUrl(resumeUrl);
            setImageUrl(imageUrl);
            setFeedback(data.feedback);
            
            // Load existing restructured CV if available
            if (data.restructuredCV) {
                setRestructuredCV(data.restructuredCV);
                setShowRestructured(true);
                setTitle('Restructured CV');
            }

            console.log({
                resumeUrl,
                imageUrl,
                feedback: data.feedback,
                restructuredCV: data.restructuredCV
            })
        }

        loadResume();
    },[id])

    const generateRestructuredCVText = (restructuredCV: RestructuredCV) => {
        let cvText = '';
        
        // Personal Info
        if (restructuredCV.personalInfo.name) {
            cvText += `${restructuredCV.personalInfo.name}\n`;
        }
        const contactInfo = [
            restructuredCV.personalInfo.email,
            restructuredCV.personalInfo.phone,
            restructuredCV.personalInfo.location,
            restructuredCV.personalInfo.linkedin,
            restructuredCV.personalInfo.github,
            restructuredCV.personalInfo.website
        ].filter(Boolean);
        
        if (contactInfo.length > 0) {
            cvText += `${contactInfo.join(' | ')}\n\n`;
        }

        // Professional Summary
        cvText += `PROFESSIONAL SUMMARY\n`;
        cvText += `${restructuredCV.professionalSummary}\n\n`;

        // Experience
        if (restructuredCV.experience.length > 0) {
            cvText += `PROFESSIONAL EXPERIENCE\n`;
            restructuredCV.experience.forEach(exp => {
                cvText += `\n${exp.position}\n`;
                cvText += `${exp.company}`;
                if (exp.location) cvText += ` | ${exp.location}`;
                cvText += `\n${exp.duration}\n`;
                exp.achievements.forEach(achievement => {
                    cvText += `• ${achievement}\n`;
                });
            });
            cvText += '\n';
        }

        // Education
        if (restructuredCV.education.length > 0) {
            cvText += `EDUCATION\n`;
            restructuredCV.education.forEach(edu => {
                cvText += `\n${edu.degree}\n`;
                cvText += `${edu.institution}`;
                if (edu.location) cvText += ` | ${edu.location}`;
                cvText += `\n${edu.duration}`;
                if (edu.gpa) cvText += ` | GPA: ${edu.gpa}`;
                cvText += '\n';
                if (edu.relevantCoursework && edu.relevantCoursework.length > 0) {
                    cvText += `Relevant Coursework: ${edu.relevantCoursework.join(', ')}\n`;
                }
            });
            cvText += '\n';
        }

        // Skills
        cvText += `TECHNICAL SKILLS\n`;
        if (restructuredCV.skills.technical.length > 0) {
            cvText += `Technical: ${restructuredCV.skills.technical.join(', ')}\n`;
        }
        if (restructuredCV.skills.soft.length > 0) {
            cvText += `Soft Skills: ${restructuredCV.skills.soft.join(', ')}\n`;
        }
        if (restructuredCV.skills.languages && restructuredCV.skills.languages.length > 0) {
            cvText += `Languages: ${restructuredCV.skills.languages.join(', ')}\n`;
        }
        if (restructuredCV.skills.certifications && restructuredCV.skills.certifications.length > 0) {
            cvText += `Certifications: ${restructuredCV.skills.certifications.join(', ')}\n`;
        }

        // Projects
        if (restructuredCV.projects && restructuredCV.projects.length > 0) {
            cvText += `\nPROJECTS\n`;
            restructuredCV.projects.forEach(project => {
                cvText += `\n${project.name}\n`;
                cvText += `${project.description}\n`;
                cvText += `Technologies: ${project.technologies.join(', ')}`;
                if (project.link) cvText += ` | ${project.link}`;
                cvText += '\n';
            });
        }

        return cvText;
    };

    const handleRestructureCV = async () => {
        if (!resumeData || !feedback) return;
        
        setIsRestructuring(true);
        setError(null);
        
        try {
            const restructurePrompt = prepareRestructureInstructions({
                jobTitle: resumeData.jobTitle || 'Not specified',
                jobDescription: resumeData.jobDescription || 'Not specified',
                feedback: feedback
            });
            
            const response = await ai.restructure(resumeData.resumePath, restructurePrompt);
            
            if (!response) {
                throw new Error('AI restructuring failed. Please try again later.');
            }

            // Check for API errors in the response
            if (!(response as any).success && (response as any).error) {
                throw response; // This will be caught and parsed as an API error
            }
                
            const responseText = typeof response.message.content === 'string' 
                ? response.message.content 
                : response.message.content[0].text;
                
            let restructuredData;
            try {
                restructuredData = JSON.parse(responseText);
            } catch (parseError) {
                throw new Error('Failed to process AI restructuring results. Please try again.');
            }
                
            setRestructuredCV(restructuredData);
            setShowRestructured(true);
                
            // Save the restructured CV to storage
            const updatedResumeData = {
                ...resumeData,
                restructuredCV: restructuredData
            };
            await kv.set(`resume-${id}`, JSON.stringify(updatedResumeData));
            setResumeData(updatedResumeData);
        } catch (err: any) {
            console.error('Error restructuring CV:', err);
            const errorInfo = parseAPIError(err);
            setError(errorInfo);
        } finally {
            setIsRestructuring(false);
        }
    };

    const handleReplaceCV = async () => {
        if (!restructuredCV || !resumeData) return;
        
        setIsReplacing(true);
        
        try {
            // Generate the restructured CV as text
            const restructuredText = generateRestructuredCVText(restructuredCV);
            
            // Create a new text file with the restructured content
            const blob = new Blob([restructuredText], { type: 'text/plain' });
            
            // Generate a new filename
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const newFileName = `restructured-cv-${timestamp}.txt`;
            
            // Save the new file to Puter filesystem
            const newFile = await fs.write(newFileName, blob);
            
            if (newFile) {
                // Update the resume data with the new file path
                const updatedResumeData = {
                    ...resumeData,
                    resumePath: newFileName,
                    originalResumePath: resumeData.resumePath, // Keep reference to original
                    isRestructured: true,
                    replacedAt: new Date().toISOString()
                };
                
                // Save updated data to KV store
                await kv.set(`resume-${id}`, JSON.stringify(updatedResumeData));
                setResumeData(updatedResumeData);
                
                // Re-analyze the new CV against the job description
                if (resumeData.jobDescription) {
                    await reanalyzeCV(newFileName, updatedResumeData);
                }
                
                // Reset restructured view to show new feedback
                setShowRestructured(false);
                setRestructuredCV(null);
            }
        } catch (error) {
            console.error('Error replacing CV:', error);
        } finally {
            setIsReplacing(false);
        }
    };

    const reanalyzeCV = async (newFilePath: string, updatedData: any) => {
        setIsReanalyzing(true);
        setError(null);
        
        try {
            // Import the feedback prompt preparation function
            const { prepareInstructions } = await import("constants/index");
            
            const feedbackPrompt = prepareInstructions({
                jobTitle: updatedData.jobTitle || 'Not specified',
                jobDescription: updatedData.jobDescription || 'Not specified'
            });
            
            const response = await ai.feedback(newFilePath, feedbackPrompt);
            
            if (!response) {
                throw new Error('AI re-analysis failed. Please try again later.');
            }

            // Check for API errors in the response
            if ('error' in response) {
                throw response; // This will be caught and parsed as an API error
            }
                
            const responseText = typeof response.message.content === 'string' 
                ? response.message.content 
                : response.message.content[0].text;
                
            let newFeedback;
            try {
                newFeedback = JSON.parse(responseText);
            } catch (parseError) {
                throw new Error('Failed to process AI re-analysis results. Please try again.');
            }
                
            setFeedback(newFeedback);
                
            // Update the resume data with new feedback
            const finalUpdatedData = {
                ...updatedData,
                feedback: newFeedback,
                reanalyzedAt: new Date().toISOString()
            };
                
            await kv.set(`resume-${id}`, JSON.stringify(finalUpdatedData));
            setResumeData(finalUpdatedData);
        } catch (err: any) {
            console.error('Error re-analyzing CV:', err);
            const errorInfo = parseAPIError(err);
            setError(errorInfo);
        } finally {
            setIsReanalyzing(false);
        }
    };

    return (
        <main className="!pt-0 colorable-svg">
            <nav className="resume-nav">
                <Link to="/" className="back-button">
                    <img src="/icons/back.svg" alt="logo" className="w-2.5 h-2.5" />
                    <span className="text-gray-800 text-sm font-semibold">Back to Homepage</span>
                </Link>
            </nav>
            <div className="flex flex-row w-full max-lg:flex-col-reverse">
                <CVRefineSectionBackground className="w-[50%] h-[100vh] sticky top-0 items-center justify-center">
                    <section className="feedback-section w-full h-[100vh] sticky top-0 items-center justify-center">
                        {imageUrl && resumeUrl && (
                            <div className="animate-in fade-in duration-1000 gradient-border max-sm:m-0 h-[90%] max-2xl:h-fit w-fit">
                                <a href={resumeUrl} target="_blank" rel="noopener noreferrer">
                                    <img src={imageUrl} alt="resume" className="w-full h-full object-contain rounded-2xl" />
                                </a>
                            </div>
                        )}
                    </section>
                </CVRefineSectionBackground>
                <div className="feedback-section !w-[50%]">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-4xl !text-black font-bold">{title}</h2>
                            {resumeData?.isRestructured && (
                                <p className="text-sm text-green-600 mt-1">
                                    ✓ This CV has been restructured and re-analyzed
                                </p>
                            )}
                        </div>
                        <div className="flex gap-2">
                            {feedback && !showRestructured && !isReanalyzing && !restructuredCV ? (
                                <button
                                    onClick={handleRestructureCV}
                                    disabled={isRestructuring}
                                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                                >
                                    {isRestructuring ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            Restructuring...
                                        </>
                                    ) : (
                                        <>
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                                Restructure CV
                                            
                                            {/* {showRestructured && (
                                            )} */}
                                            
                                        </>
                                    )}
                                </button>
                            ): (
                                <>
                                    {!showRestructured && (
                                        <button
                                            onClick={() => {
                                                setShowRestructured(true);
                                                setTitle('Restructured CV');
                                            }}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                        >
                                            Show Restructured CV
                                        </button>
                                    )}
                                </>
                            )}
                            {showRestructured && (
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => {
                                            setShowRestructured(false);
                                            setTitle('Feedback');
                                        }}
                                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                                    >
                                        Show Feedback
                                    </button>
                                    {/* <button
                                        onClick={() => setShowRestructured(true)}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        Show Restructured CV
                                    </button> */}
                                </div>
                            )}
                        </div>
                    </div>
                    
                    {isReanalyzing && (
                        <div className="bg-blue-50 rounded-lg p-4 mb-6">
                            <div className="flex items-center gap-3">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                                <p className="text-blue-800 font-medium">Re-analyzing your restructured CV...</p>
                            </div>
                            <p className="text-blue-600 text-sm mt-2">
                                Your CV has been replaced with the restructured version and is being analyzed against the job description again.
                            </p>
                        </div>
                    )}
                    
                    {showRestructured && restructuredCV ? (
                        <RestructuredCV 
                            restructuredCV={restructuredCV} 
                            isGenerating={isRestructuring}
                            onReplaceCV={handleReplaceCV}
                            isReplacing={isReplacing}
                        />
                    ) : feedback && !isReanalyzing ? (
                        <div className="flex flex-col gap-8 animate-in fade-in duration-1000">
                            <Summary feedback={feedback} />
                            <ATS score={feedback.ATS.score || 0} suggestions={feedback.ATS.tips || []} />
                            <Details feedback={feedback} />
                        </div>
                    ) : (
                        <img src="/images/resume-scan-2.gif" className="w-full" />
                    )}
                </div>
            </div>

            {/* Error Feedback Modal */}
            {error && (
                <ErrorFeedback
                    error={error}
                    onClose={() => setError(null)}
                    onRetry={error.type !== 'usage_limit' ? () => {
                        setError(null);
                        // Optionally retry the last operation
                    } : undefined}
                    showRetryTimer={error.type === 'usage_limit'}
                />
            )}
        </main>
    )
}

export default Resume