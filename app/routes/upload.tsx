import { prepareInstructions } from "constants/index";
import { useState, type FormEvent } from "react"
import { useNavigate } from "react-router";
import { CVRefineSectionBackground } from "~/components/background";
import FileUploader from "~/components/FileUploader";
import Navbar from "~/components/Navbar"
import { convertPdfToImage } from "~/lib/pdf2img";
import { usePuterStore } from "~/lib/puter";
import { generateUUID } from "~/lib/utils";
import { useNotifications } from "~/lib/notifications";
import { handleApiError, showSuccessNotification, showInfoNotification } from "~/lib/errorHandler";

const Upload = () => {
  const { auth, isLoading, fs, ai, kv } = usePuterStore();
  const navigate = useNavigate();
  const { addNotification } = useNotifications();
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const handleFileSelect = (file: File | null) => {
    setFile(file);
  }

  const handleAnalyzer = async ({companyName, jobTitle, jobDescription, file}: {companyName: string, jobTitle: string, jobDescription: string, file: File}) => {
    try {
      setIsProcessing(true);
      setStatusText('Processing...');

      // Show info notification for start of process
      showInfoNotification(addNotification, 'Analysis Started', 'Your resume analysis has begun. This may take a moment.');

      const uploadedFile = await fs?.upload([file]);
      if(!uploadedFile) {
        setStatusText('Error: Failed to upload file.');
        addNotification({
          type: 'error',
          title: 'Upload Failed',
          message: 'Failed to upload your resume file. Please try again.',
          duration: 8000,
          dismissible: true,
        });
        return;
      }
      
      setStatusText('Converting to image...');
      const imageFile = await convertPdfToImage(file);
      if(!imageFile.file) {
        setStatusText(`Error: ${imageFile.error}`);
        addNotification({
          type: 'error',
          title: 'Conversion Failed',
          message: `Failed to convert PDF to image: ${imageFile.error}`,
          duration: 8000,
          dismissible: true,
        });
        return;
      }

      setStatusText("Uploading the image...");
      const uploadedImage = await fs?.upload([imageFile.file]);
      if(!uploadedImage) {
        setStatusText('Error: Failed to upload image.');
        addNotification({
          type: 'error',
          title: 'Image Upload Failed',
          message: 'Failed to upload the converted image. Please try again.',
          duration: 8000,
          dismissible: true,
        });
        return;
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

      setStatusText("Analyzing...");

      // This is where the error in your original code occurs (line 71)
      const feedback = await ai.feedback(
          uploadedFile.path,
          prepareInstructions({jobTitle, jobDescription})
      );
      
      if(!feedback) {
        setStatusText('Error: Failed to analyze resume.');
        addNotification({
          type: 'error',
          title: 'Analysis Failed',
          message: 'Failed to analyze your resume. This might be due to API limits or technical issues.',
          duration: 10000,
          actions: [
            {
              label: 'Try Again',
              onClick: () => {
                setIsProcessing(false);
                setStatusText('');
              },
              variant: 'primary'
            }
          ],
          dismissible: true,
        });
        return;
      }

      const feedbackText = typeof feedback.message.content === 'string' ? feedback.message.content : feedback.message.content[0].text;

      data.feedback = JSON.parse(feedbackText);

      await kv.set(`resume-${uuid}`, JSON.stringify(data));

      setStatusText('Analysis complete, redirecting...');

      // Show success notification
      showSuccessNotification(addNotification, 'Analysis Complete', 'Your resume has been successfully analyzed!');

      console.log(data)
      navigate(`/resume/${uuid}`);

    } catch (error) {
      console.error('Error during analysis:', error);
      setIsProcessing(false);
      setStatusText('');
      
      // Handle the error using the error handler
      handleApiError(error, {
        addNotification,
        navigate
      });
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

    // Validation
    if (!companyName.trim()) {
      addNotification({
        type: 'warning',
        title: 'Missing Information',
        message: 'Please enter a company name.',
        duration: 5000,
        dismissible: true,
      });
      return;
    }

    if (!jobTitle.trim()) {
      addNotification({
        type: 'warning',
        title: 'Missing Information',
        message: 'Please enter a job title.',
        duration: 5000,
        dismissible: true,
      });
      return;
    }

    if (!jobDescription.trim()) {
      addNotification({
        type: 'warning',
        title: 'Missing Information',
        message: 'Please enter a job description.',
        duration: 5000,
        dismissible: true,
      });
      return;
    }

    if(!file) {
      addNotification({
        type: 'warning',
        title: 'No File Selected',
        message: 'Please upload your resume file before submitting.',
        duration: 5000,
        dismissible: true,
      });
      return;
    }

    handleAnalyzer({companyName, jobTitle, jobDescription, file});
  }

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
                            <img src="/images/resume-scan.gif" alt="resume" className="w-full" />
                        </>
                    ): (
                        <>
                            <h2>Drop your resume for an ATS score and improvement tips</h2>
                        </>
                    )}

                    {!isProcessing && (
                        <form id="upload-form" onSubmit={handleSubmit} className="flex flex-col gap-4 mt-8">
                            <div className="form-div">
                                <label htmlFor="company-name">Company Name</label>
                                <input type="text" name="company-name" placeholder="Company Name" id="company-name" />
                            </div>
                            <div className="form-div">
                                <label htmlFor="job-title">Job Title</label>
                                <input type="text" name="job-title" placeholder="Job Title" id="job-title" />
                            </div>
                            <div className="form-div">
                                <label htmlFor="job-description">Job Description</label>
                                <textarea rows={5} name="job-description" placeholder="Job Description" id="job-description" />
                            </div>
                            <div className="form-div">
                                <label htmlFor="uploader">Upload Resume</label>
                                <FileUploader onFileSelect={handleFileSelect} />
                            </div>
                            <button className="primary-button" type="submit">Analyze CV</button>
                        </form>
                    )}
                </div>
            </section>
        </main>
    </CVRefineSectionBackground>
  )
}

export default Upload