import { prepareInstructions } from "constants/index";
import { useState, type FormEvent } from "react"
import { useNavigate } from "react-router";
import { CVRefineSectionBackground } from "~/components/background";
import FileUploader from "~/components/FileUploader";
import Navbar from "~/components/Navbar"
import ErrorFeedback from "~/components/ErrorFeedback";
import { convertPdfToImage } from "~/lib/pdf2img";
import { usePuterStore } from "~/lib/puter";
import { generateUUID } from "~/lib/utils";
import { parseAPIError } from "~/lib/error-handler";
import type { ErrorInfo } from "~/lib/error-handler";

const Upload = () => {
  const { auth, isLoading, fs, ai, kv } = usePuterStore();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<ErrorInfo | null>(null);

  const handleFileSelect = (file: File | null) => {
    setFile(file);
  }

  const handleAnalyzer = async ({companyName, jobTitle, jobDescription, file}: {companyName: string, jobTitle: string, jobDescription: string, file: File}) => {
    // Check authentication before processing
    // if (!auth.isAuthenticated) {
    //   navigate('/auth?next=/upload');
    //   return;
    // }

    setIsProcessing(true);
    setStatusText('Processing...');
    setError(null);

    try {
      const uploadedFile = await fs?.upload([file]);
      if(!uploadedFile) {
        throw new Error('Failed to upload file. Please check your connection and try again.');
      }
      
      setStatusText('Converting to image...');
      const imageFile = await convertPdfToImage(file);
      if(!imageFile.file) {
        throw new Error(imageFile.error || 'Failed to process PDF file.');
      }

      setStatusText("Uploading the image...");
      const uploadedImage = await fs?.upload([imageFile.file]);
      if(!uploadedImage) {
        throw new Error('Failed to upload image. Please try again.');
      }

      setStatusText("Preparing data...");

      const uuid = generateUUID();
      const data = {
          id: uuid,
          resumePath: uploadedFile.path,
          imagePath: uploadedImage.path,
          companyName,
          jobTitle,
          jobDescription,
          feedback: '',
          restructuredCV: null,
      };
      await kv.set(`resume-${uuid}`, JSON.stringify(data));

      setStatusText("Analyzing with AI...");

      const feedback = await ai.feedback(
          uploadedFile.path,
          prepareInstructions({jobTitle, jobDescription})
      )
      
      if(!feedback) {
        throw new Error('AI analysis failed. Please try again later.');
      }

      // Check for API errors in the response
      if ('error' in feedback) {
        throw feedback; // This will be caught and parsed as an API error
      }

      const feedbackText = typeof feedback.message.content === 'string' ? feedback.message.content : feedback.message.content[0].text;

      try {
        data.feedback = JSON.parse(feedbackText);
      } catch (parseError) {
        throw new Error('Failed to process AI analysis results. Please try again.');
      }

      await kv.set(`resume-${uuid}`, JSON.stringify(data));

      setStatusText('Analysis complete, redirecting...');

      console.log(data)
      navigate(`/resume/${uuid}`);

    } catch (err: any) {
      console.error('Analysis error:', err);
      const errorInfo = parseAPIError(err);
      setError(errorInfo);
      setIsProcessing(false);
      setStatusText('');
    }
  }

  const handleSubmit = (e:FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget.closest('form');

    if(!form) return;
    const formData = new FormData(form);
    
    const companyName = formData.get('company-name') as string;
    const jobTitle = formData.get('job-title') as string;
    const jobDescription = formData.get('job-description') as string;

    if(!file) {
      setError({
        type: 'validation',
        title: 'File Required',
        message: 'Please upload your resume to continue with the analysis.',
        suggestion: 'Select a PDF file of your resume using the upload area above.',
        icon: '📄',
        color: 'yellow'
      });
      return;
    }

    if(!jobTitle.trim()) {
      setError({
        type: 'validation',
        title: 'Job Title Required',
        message: 'Please enter the job title you\'re applying for.',
        suggestion: 'This helps our AI provide more targeted feedback for your specific role.',
        icon: '💼',
        color: 'yellow'
      });
      return;
    }

    handleAnalyzer({companyName, jobTitle, jobDescription, file});
  }

  const handleRetry = () => {
    setError(null);
    // Optionally trigger the analysis again
  };

  const handleCloseError = () => {
    setError(null);
  };

  return (
    <CVRefineSectionBackground>
        <main className="">
            <Navbar />
            <section  className="main-section">
                <div className="page-heading py-16">
                    <h1>Smart feedback for your dream job</h1>
                    {isProcessing ? (
                        <>
                            <h2>{statusText}</h2>
                            <div className="mt-8">
                              <img src="/images/resume-scan.gif" alt="resume" className="w-full max-w-md mx-auto" />
                              <div className="mt-4 bg-blue-50 rounded-lg p-4 max-w-md mx-auto">
                                <p className="text-blue-800 text-sm text-center">
                                  ⚡ This usually takes 30-60 seconds depending on your resume complexity
                                </p>
                              </div>
                            </div>
                        </>
                    ): (
                        <>
                            <h2>Drop your resume for an ATS score and improvement tips</h2>
                            {!auth.isAuthenticated && (
                              <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-2xl mx-auto">
                                <p className="text-blue-800 text-sm text-center">
                                  📝 You can upload and fill the form without signing in. 
                                  Authentication is only required when you're ready to analyze your CV.
                                </p>
                              </div>
                            )}
                        </>
                    )}

                    {!isProcessing && (
                        <form id="upload-form" onSubmit={handleSubmit} className="flex flex-col gap-4 mt-8">
                            <div className="form-div">
                                <label htmlFor="company-name">Company Name</label>
                                <input type="text" name="company-name" placeholder="Company Name (Optional)" id="company-name" />
                            </div>
                            <div className="form-div">
                                <label htmlFor="job-title">Job Title <span className="text-red-500">*</span></label>
                                <input type="text" name="job-title" placeholder="e.g., Frontend Developer, Marketing Manager" id="job-title" required />
                            </div>
                            <div className="form-div">
                                <label htmlFor="job-description">Job Description</label>
                                <textarea 
                                  rows={5} 
                                  name="job-description" 
                                  placeholder="Paste the job description here for more targeted feedback..." 
                                  id="job-description" 
                                />
                                <small className="text-gray-600 mt-1">
                                  💡 Adding a job description helps our AI provide more specific recommendations
                                </small>
                            </div>
                            <div className="form-div">
                                <label htmlFor="uploader">Upload Resume <span className="text-red-500">*</span></label>
                                <FileUploader onFileSelect={handleFileSelect} />
                                {file && (
                                  <div className="mt-2 text-sm text-green-600">
                                    ✓ {file.name} uploaded successfully
                                  </div>
                                )}
                            </div>
                            <button className="primary-button" type="submit" disabled={!file}>
                              {!file ? 'Please Upload Resume First' : 
                               !auth.isAuthenticated ? 'Sign In & Analyze CV' : 'Analyze CV'}
                            </button>
                        </form>
                    )}
                </div>
            </section>
        </main>

        {/* Error Feedback Modal */}
        {error && (
          <ErrorFeedback
            error={error}
            onClose={handleCloseError}
            onRetry={error.type !== 'usage_limit' ? handleRetry : undefined}
            showRetryTimer={error.type === 'usage_limit'}
          />
        )}
    </CVRefineSectionBackground>
  )
}

export default Upload