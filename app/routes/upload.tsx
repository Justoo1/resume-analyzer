import { prepareInstructions } from "constants/index";
import { useState, type FormEvent } from "react"
import { useNavigate } from "react-router";
import { CVRefineSectionBackground } from "~/components/background";
import FileUploader from "~/components/FileUploader";
import Navbar from "~/components/Navbar"
import { convertPdfToImage } from "~/lib/pdf2img";
import { usePuterStore } from "~/lib/puter";
import { generateUUID } from "~/lib/utils";

const Upload = () => {
  const { auth, isLoading, fs, ai, kv } = usePuterStore();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const handleFileSelect = (file: File | null) => {
    setFile(file);
  }

  const handleAnalyzer = async ({companyName, jobTitle, jobDescription, file}: {companyName: string, jobTitle: string, jobDescription: string, file: File}) => {
    setIsProcessing(true);
    setStatusText('Processing...');

    const uploadedFile = await fs?.upload([file]);
    if(!uploadedFile) return setStatusText('Error: Failed to upload file.');
    
    setStatusText('Converting to image...');
    const imageFile = await convertPdfToImage(file);
    if(!imageFile.file) return setStatusText(`Error: ${imageFile.error}`);

    setStatusText("Uploading the image...");
    const uploadedImage = await fs?.upload([imageFile.file]);
    if(!uploadedImage) return setStatusText('Error: Failed to upload image.');

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

    const feedback = await ai.feedback(
        uploadedFile.path,
        prepareInstructions({jobTitle, jobDescription})
    )
    
    if(!feedback) return setStatusText('Error: Failed to analyze resume.');

    const feedbackText = typeof feedback.message.content === 'string' ? feedback.message.content : feedback.message.content[0].text;

    data.feedback = JSON.parse(feedbackText);

    await kv.set(`resume-${uuid}`, JSON.stringify(data));

    setStatusText('Analysis complete, redirecting...');

    console.log(data)
    navigate(`/resume/${uuid}`);
  }

  const handleSubmit = (e:FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget.closest('form');

    if(!form) return;
    const formData = new FormData(form);
    
    const companyName = formData.get('company-name') as string;
    const jobTitle = formData.get('job-title') as string;
    const jobDescription = formData.get('job-description') as string;

    if(!file) return;

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