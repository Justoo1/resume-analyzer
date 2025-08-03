import React, { useState } from 'react';
import { ArrowDown, ArrowUp, Copy, Download, FileText, CheckCircle, Replace, RefreshCw } from 'lucide-react';
import { generatePDF, generateDOCX, generateTXT } from '~/lib/document-generators';

interface RestructuredCVProps {
  restructuredCV: RestructuredCV;
  isGenerating?: boolean;
  onReplaceCV?: () => void;
  isReplacing?: boolean;
}

const RestructuredCV: React.FC<RestructuredCVProps> = ({ 
  restructuredCV, 
  isGenerating = false,
  onReplaceCV,
  isReplacing = false
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const [downloadingFormat, setDownloadingFormat] = useState<string | null>(null);

  const copyToClipboard = async (text: string, sectionName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSection(sectionName);
      setTimeout(() => setCopiedSection(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const generateFullCVText = () => {
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

  const handleDownload = async (format: 'pdf' | 'docx' | 'txt') => {
    setDownloadingFormat(format);
    try {
      const filename = `restructured-cv.${format}`;
      
      switch (format) {
        case 'pdf':
          generatePDF(restructuredCV, filename);
          break;
        case 'docx':
          await generateDOCX(restructuredCV, filename);
          break;
        case 'txt':
          generateTXT(restructuredCV, filename);
          break;
      }
    } catch (error) {
      console.error(`Error generating ${format.toUpperCase()}:`, error);
    } finally {
      setDownloadingFormat(null);
      setShowDownloadMenu(false);
    }
  };

  const CopyButton: React.FC<{ text: string; sectionName: string }> = ({ text, sectionName }) => (
    <button
      onClick={() => copyToClipboard(text, sectionName)}
      className="ml-2 p-1 rounded-md hover:bg-gray-200 transition-colors"
      title={`Copy ${sectionName}`}
    >
      {copiedSection === sectionName ? (
        <CheckCircle className="w-4 h-4 text-green-600" />
      ) : (
        <Copy className="w-4 h-4 text-gray-500" />
      )}
    </button>
  );

  if (isGenerating) {
    return (
      <div className="bg-white rounded-2xl shadow-md p-6">
        <div className="flex items-center gap-3 mb-4">
          <FileText className="w-6 h-6 text-blue-600" />
          <h3 className="text-2xl font-bold">Restructuring Your CV</h3>
        </div>
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600 text-center">
            Our AI is restructuring your CV to match the job requirements and fix identified issues...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-md">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b">
        {/* <div className="flex items-center gap-3">
          <FileText className="w-6 h-6 text-green-600" />
          <h3 className="text-2xl font-bold">Restructured CV</h3>
        </div> */}
        <div className="flex items-center gap-2">
          {/* Download with multiple formats */}
          <div className="relative">
            <button
              onClick={() => setShowDownloadMenu(!showDownloadMenu)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              disabled={downloadingFormat !== null}
            >
              <Download className="w-4 h-4" />
              {downloadingFormat ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                  Generating...
                </>
              ) : (
                'Download'
              )}
              <ArrowDown className="w-3 h-3" />
            </button>
            
            {showDownloadMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-10">
                <div className="py-1">
                  <button
                    onClick={() => handleDownload('pdf')}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                    disabled={downloadingFormat !== null}
                  >
                    <FileText className="w-4 h-4 text-red-500" />
                    Download as PDF
                  </button>
                  <button
                    onClick={() => handleDownload('docx')}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                    disabled={downloadingFormat !== null}
                  >
                    <FileText className="w-4 h-4 text-blue-500" />
                    Download as DOCX
                  </button>
                  <button
                    onClick={() => handleDownload('txt')}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                    disabled={downloadingFormat !== null}
                  >
                    <FileText className="w-4 h-4 text-gray-500" />
                    Download as TXT
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Replace CV Button */}
          {onReplaceCV && (
            <button
              onClick={onReplaceCV}
              disabled={isReplacing}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isReplacing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Replacing...
                </>
              ) : (
                <>
                  <Replace className="w-4 h-4" />
                  Replace Original CV
                </>
              )}
            </button>
          )}

          <button
            onClick={() => copyToClipboard(generateFullCVText(), 'Full CV')}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            {copiedSection === 'Full CV' ? (
              <>
                <CheckCircle className="w-4 h-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy All
              </>
            )}
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {isExpanded ? <ArrowUp className="w-5 h-5" /> : <ArrowDown className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-6 space-y-8">
          {/* Improvements Summary */}
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <h4 className="font-semibold text-green-800">Key Improvements Made</h4>
            </div>
            <div className="space-y-2">
              {restructuredCV.improvements.changes.map((change, index) => (
                <div key={index} className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-green-700 text-sm">{change}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-green-200">
              <p className="text-green-700 text-sm">
                <strong>Reasoning:</strong> {restructuredCV.improvements.reasoning}
              </p>
            </div>
          </div>

          {/* Personal Information */}
          <div className="cv-section">
            <div className="flex items-center gap-2 mb-4">
              <h4 className="text-xl font-semibold">Personal Information</h4>
              <CopyButton 
                text={Object.entries(restructuredCV.personalInfo)
                  .filter(([_, value]) => value)
                  .map(([key, value]) => `${key}: ${value}`)
                  .join('\n')} 
                sectionName="Personal Info" 
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(restructuredCV.personalInfo).map(([key, value]) => 
                value ? (
                  <div key={key} className="flex flex-col">
                    <span className="text-sm font-medium text-gray-600 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <span className="text-gray-900">{value}</span>
                  </div>
                ) : null
              )}
            </div>
          </div>

          {/* Professional Summary */}
          <div className="cv-section">
            <div className="flex items-center gap-2 mb-4">
              <h4 className="text-xl font-semibold">Professional Summary</h4>
              <CopyButton text={restructuredCV.professionalSummary} sectionName="Summary" />
            </div>
            <p className="text-gray-700 leading-relaxed">{restructuredCV.professionalSummary}</p>
          </div>

          {/* Experience */}
          {restructuredCV.experience.length > 0 && (
            <div className="cv-section">
              <div className="flex items-center gap-2 mb-4">
                <h4 className="text-xl font-semibold">Professional Experience</h4>
                <CopyButton 
                  text={restructuredCV.experience.map(exp => 
                    `${exp.position}\n${exp.company}${exp.location ? ` | ${exp.location}` : ''}\n${exp.duration}\n${exp.achievements.map(a => `• ${a}`).join('\n')}`
                  ).join('\n\n')} 
                  sectionName="Experience" 
                />
              </div>
              <div className="space-y-6">
                {restructuredCV.experience.map((exp, index) => (
                  <div key={index} className="border-l-4 border-blue-200 pl-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
                      <h5 className="text-lg font-semibold text-gray-900">{exp.position}</h5>
                      <span className="text-sm text-gray-600">{exp.duration}</span>
                    </div>
                    <p className="text-gray-700 font-medium mb-3">
                      {exp.company}{exp.location && ` | ${exp.location}`}
                    </p>
                    <ul className="space-y-2">
                      {exp.achievements.map((achievement, achIndex) => (
                        <li key={achIndex} className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-gray-700 text-sm">{achievement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {restructuredCV.education.length > 0 && (
            <div className="cv-section">
              <div className="flex items-center gap-2 mb-4">
                <h4 className="text-xl font-semibold">Education</h4>
                <CopyButton 
                  text={restructuredCV.education.map(edu => 
                    `${edu.degree}\n${edu.institution}${edu.location ? ` | ${edu.location}` : ''}\n${edu.duration}${edu.gpa ? ` | GPA: ${edu.gpa}` : ''}${edu.relevantCoursework ? `\nRelevant Coursework: ${edu.relevantCoursework.join(', ')}` : ''}`
                  ).join('\n\n')} 
                  sectionName="Education" 
                />
              </div>
              <div className="space-y-4">
                {restructuredCV.education.map((edu, index) => (
                  <div key={index} className="border-l-4 border-purple-200 pl-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
                      <h5 className="text-lg font-semibold text-gray-900">{edu.degree}</h5>
                      <span className="text-sm text-gray-600">{edu.duration}</span>
                    </div>
                    <p className="text-gray-700 font-medium">
                      {edu.institution}{edu.location && ` | ${edu.location}`}
                    </p>
                    {edu.gpa && (
                      <p className="text-sm text-gray-600 mt-1">GPA: {edu.gpa}</p>
                    )}
                    {edu.relevantCoursework && edu.relevantCoursework.length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm font-medium text-gray-700">Relevant Coursework:</p>
                        <p className="text-sm text-gray-600">{edu.relevantCoursework.join(', ')}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skills */}
          <div className="cv-section">
            <div className="flex items-center gap-2 mb-4">
              <h4 className="text-xl font-semibold">Skills</h4>
              <CopyButton 
                text={[
                  restructuredCV.skills.technical.length > 0 ? `Technical: ${restructuredCV.skills.technical.join(', ')}` : '',
                  restructuredCV.skills.soft.length > 0 ? `Soft Skills: ${restructuredCV.skills.soft.join(', ')}` : '',
                  restructuredCV.skills.languages && restructuredCV.skills.languages.length > 0 ? `Languages: ${restructuredCV.skills.languages.join(', ')}` : '',
                  restructuredCV.skills.certifications && restructuredCV.skills.certifications.length > 0 ? `Certifications: ${restructuredCV.skills.certifications.join(', ')}` : ''
                ].filter(Boolean).join('\n')} 
                sectionName="Skills" 
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {restructuredCV.skills.technical.length > 0 && (
                <div>
                  <h5 className="font-semibold text-gray-800 mb-2">Technical Skills</h5>
                  <div className="flex flex-wrap gap-2">
                    {restructuredCV.skills.technical.map((skill, index) => (
                      <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {restructuredCV.skills.soft.length > 0 && (
                <div>
                  <h5 className="font-semibold text-gray-800 mb-2">Soft Skills</h5>
                  <div className="flex flex-wrap gap-2">
                    {restructuredCV.skills.soft.map((skill, index) => (
                      <span key={index} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {restructuredCV.skills.languages && restructuredCV.skills.languages.length > 0 && (
                <div>
                  <h5 className="font-semibold text-gray-800 mb-2">Languages</h5>
                  <div className="flex flex-wrap gap-2">
                    {restructuredCV.skills.languages.map((lang, index) => (
                      <span key={index} className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {restructuredCV.skills.certifications && restructuredCV.skills.certifications.length > 0 && (
                <div>
                  <h5 className="font-semibold text-gray-800 mb-2">Certifications</h5>
                  <div className="flex flex-wrap gap-2">
                    {restructuredCV.skills.certifications.map((cert, index) => (
                      <span key={index} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                        {cert}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Projects */}
          {restructuredCV.projects && restructuredCV.projects.length > 0 && (
            <div className="cv-section">
              <div className="flex items-center gap-2 mb-4">
                <h4 className="text-xl font-semibold">Projects</h4>
                <CopyButton 
                  text={restructuredCV.projects.map(project => 
                    `${project.name}\n${project.description}\nTechnologies: ${project.technologies.join(', ')}${project.link ? `\nLink: ${project.link}` : ''}`
                  ).join('\n\n')} 
                  sectionName="Projects" 
                />
              </div>
              <div className="space-y-6">
                {restructuredCV.projects.map((project, index) => (
                  <div key={index} className="border-l-4 border-orange-200 pl-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
                      <h5 className="text-lg font-semibold text-gray-900">{project.name}</h5>
                      {project.link && (
                        <a 
                          href={project.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          View Project →
                        </a>
                      )}
                    </div>
                    <p className="text-gray-700 mb-3">{project.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {project.technologies.map((tech, techIndex) => (
                        <span key={techIndex} className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RestructuredCV;