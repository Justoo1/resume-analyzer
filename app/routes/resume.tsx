import { useEffect, useState } from "react";
import { prepareRestructureInstructions } from "constants/index";
import { Link, useNavigate, useParams } from "react-router";
import { CVRefineSectionBackground } from "~/components/background";
import ATS from "~/components/feedback/ATS";
import Details from "~/components/feedback/Details";
import Summary from "~/components/feedback/Summary";
import RestructuredCV from "~/components/RestructuredCV";
import { usePuterStore } from "~/lib/puter";

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

    const handleRestructureCV = async () => {
        if (!resumeData || !feedback) return;
        
        setIsRestructuring(true);
        
        try {
            const restructurePrompt = prepareRestructureInstructions({
                jobTitle: resumeData.jobTitle || 'Not specified',
                jobDescription: resumeData.jobDescription || 'Not specified',
                feedback: feedback
            });
            
            const response = await ai.restructure(resumeData.resumePath, restructurePrompt);
            
            if (response) {
                const responseText = typeof response.message.content === 'string' 
                    ? response.message.content 
                    : response.message.content[0].text;
                
                const restructuredData = JSON.parse(responseText);
                setRestructuredCV(restructuredData);
                setShowRestructured(true);
                
                // Save the restructured CV to storage
                const updatedResumeData = {
                    ...resumeData,
                    restructuredCV: restructuredData
                };
                await kv.set(`resume-${id}`, JSON.stringify(updatedResumeData));
                setResumeData(updatedResumeData);
            }
        } catch (error) {
            console.error('Error restructuring CV:', error);
        } finally {
            setIsRestructuring(false);
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
                <CVRefineSectionBackground className="w-full h-[100vh] sticky top-0 items-center justify-center">
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
                <div className="feedback-section">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-4xl !text-black font-bold">CV Review</h2>
                        {feedback && !showRestructured && (
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
                                    </>
                                )}
                            </button>
                        )}
                        {showRestructured && (
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setShowRestructured(false)}
                                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                                >
                                    Show Feedback
                                </button>
                                <button
                                    onClick={() => setShowRestructured(true)}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Show Restructured CV
                                </button>
                            </div>
                        )}
                    </div>
                    
                    {showRestructured && restructuredCV ? (
                        <RestructuredCV 
                            restructuredCV={restructuredCV} 
                            isGenerating={isRestructuring}
                        />
                    ) : feedback ? (
                        <div className="flex flex-col gap-8 animate-in fade-in duration-1000">
                            <Summary feedback={feedback} />
                            <ATS score={feedback.ATS.score || 0} suggestions={feedback.ATS.tips || []} />
                            <Details feedback={feedback} />
                        </div>
                    ):(
                        <img src="/images/resume-scan-2.gif" className="w-full" />
                    )}
                </div>
            </div>
        </main>
    )
}

export default Resume