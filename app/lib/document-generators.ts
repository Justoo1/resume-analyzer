import { jsPDF } from 'jspdf';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, UnderlineType, AlignmentType, Table, TableRow, TableCell, WidthType, BorderStyle } from 'docx';
import pkg from 'file-saver';


export const generatePDF = (restructuredCV: RestructuredCV, filename: string = 'restructured-cv.pdf') => {
  const doc = new jsPDF();
  let yPosition = 20;
  const lineHeight = 5;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 20;
  const pageWidth = doc.internal.pageSize.width;

  // Helper function to add text with word wrapping
  const addText = (text: string, fontSize: number = 12, isBold: boolean = false, isTitle: boolean = false, color: [number, number, number] = [0, 0, 0]) => {
    if (yPosition > pageHeight - margin - 20) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(fontSize);
    doc.setTextColor(color[0], color[1], color[2]);
    
    if (isBold) {
      doc.setFont('Helvetica', 'bold');
    } else {
      doc.setFont('Helvetica', 'normal');
    }

    const splitText = doc.splitTextToSize(text, pageWidth - 2 * margin);
    doc.text(splitText, margin, yPosition);
    yPosition += splitText.length * lineHeight;
  };

  // Helper function to add text on the same line (for title and date alignment)
  const addTextWithDate = (title: string, date: string, titleSize: number = 12, dateSize: number = 10) => {
    if (yPosition > pageHeight - margin - 20) {
      doc.addPage();
      yPosition = 20;
    }

    // Add title on the left
    doc.setFontSize(titleSize);
    doc.setFont('Helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text(title, margin, yPosition);

    // Add date on the right
    doc.setFontSize(dateSize);
    doc.setFont('Helvetica', 'normal');
    doc.setTextColor(120, 120, 120);
    const dateWidth = doc.getTextWidth(date);
    doc.text(date, pageWidth - margin - dateWidth, yPosition);

    yPosition += lineHeight + 1;
  };

  // Helper function to add skill tags with lighter colors
  const addSkillTags = (skills: string[], startY: number, tagColor: [number, number, number] = [186, 230, 253]) => {
    let currentX = margin;
    let currentY = startY;
    const tagHeight = 6;
    const tagPadding = 4;
    const tagSpacing = 3;
    const lineSpacing = 8;

    skills.forEach((skill, index) => {
      // Calculate text width
      doc.setFontSize(8);
      const textWidth = doc.getTextWidth(skill);
      const tagWidth = textWidth + 2 * tagPadding;

      // Check if tag fits on current line
      if (currentX + tagWidth > pageWidth - margin) {
        currentX = margin;
        currentY += lineSpacing;
      }

      // Draw tag background with lighter colors
      doc.setFillColor(tagColor[0], tagColor[1], tagColor[2]);
      doc.roundedRect(currentX, currentY - tagHeight + 2, tagWidth, tagHeight, 2, 2, 'F');

      // Add text with darker color for better readability
      doc.setTextColor(60, 60, 60);
      doc.setFont('Helvetica', 'normal');
      doc.text(skill, currentX + tagPadding, currentY);

      currentX += tagWidth + tagSpacing;
    });

    return currentY + lineSpacing;
  };

  // Helper function to add spacing
  const addSpacing = (space: number = 3) => {
    yPosition += space;
  };

  // Personal Info - Header Style
  if (restructuredCV.personalInfo.name) {
    addText(restructuredCV.personalInfo.name, 20, true, true);
    addSpacing(2);
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
    addText(contactInfo.join(' | '), 10, false, false, [100, 100, 100]);
    addSpacing(8);
  }

  // Professional Summary
  addText('PROFESSIONAL SUMMARY', 14, true, true, [0, 0, 0]);
  addSpacing(3);
  addText(restructuredCV.professionalSummary, 10, false, false, [60, 60, 60]);
  addSpacing(8);

  // Experience
  if (restructuredCV.experience.length > 0) {
    addText('PROFESSIONAL EXPERIENCE', 14, true, true);
    addSpacing(4);
    
    restructuredCV.experience.forEach((exp, index) => {
      // Position and Date on same line
      addTextWithDate(exp.position, exp.duration, 12, 9);
      
      // Company and location
      addText(`${exp.company}${exp.location ? ` | ${exp.location}` : ''}`, 10, false, false, [80, 80, 80]);
      addSpacing(2);
      
      // Achievements with bullet points
      exp.achievements.forEach(achievement => {
        // Add colored bullet point
        doc.setFillColor(34, 197, 94);
        doc.circle(margin + 2, yPosition - 1, 0.8, 'F');
        
        // Add achievement text with proper indentation
        const achievementText = doc.splitTextToSize(achievement, pageWidth - 2 * margin - 8);
        doc.setTextColor(60, 60, 60);
        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(9);
        doc.text(achievementText, margin + 6, yPosition);
        yPosition += achievementText.length * lineHeight;
      });
      addSpacing(6);
    });
  }

  // Education
  if (restructuredCV.education.length > 0) {
    addText('EDUCATION', 14, true, true);
    addSpacing(4);
    
    restructuredCV.education.forEach(edu => {
      // Degree and Date on same line
      addTextWithDate(edu.degree, edu.duration, 12, 9);
      
      // Institution and location
      addText(`${edu.institution}${edu.location ? ` | ${edu.location}` : ''}`, 10, false, false, [80, 80, 80]);
      
      if (edu.gpa) {
        addText(`GPA: ${edu.gpa}`, 9, false, false, [120, 120, 120]);
      }
      
      if (edu.relevantCoursework && edu.relevantCoursework.length > 0) {
        addText(`Relevant Coursework: ${edu.relevantCoursework.join(', ')}`, 9, false, false, [100, 100, 100]);
      }
      addSpacing(6);
    });
  }

  // Skills Section with lighter colored tags
  addText('TECHNICAL SKILLS', 14, true, true);
  addSpacing(4);

  if (restructuredCV.skills.technical.length > 0) {
    addText('Technical Skills', 11, true, false, [0, 0, 0]);
    addSpacing(2);
    yPosition = addSkillTags(restructuredCV.skills.technical, yPosition, [186, 230, 253]); // Light blue
    addSpacing(4);
  }

  if (restructuredCV.skills.soft.length > 0) {
    addText('Soft Skills', 11, true, false, [0, 0, 0]);
    addSpacing(2);
    yPosition = addSkillTags(restructuredCV.skills.soft, yPosition, [254, 240, 138]); // Light yellow
    addSpacing(4);
  }

  if (restructuredCV.skills.languages && restructuredCV.skills.languages.length > 0) {
    addText('Languages', 11, true, false, [0, 0, 0]);
    addSpacing(2);
    yPosition = addSkillTags(restructuredCV.skills.languages, yPosition, [253, 186, 116]); // Light orange
    addSpacing(4);
  }

  if (restructuredCV.skills.certifications && restructuredCV.skills.certifications.length > 0) {
    addText('Certifications', 11, true, false, [0, 0, 0]);
    addSpacing(2);
    yPosition = addSkillTags(restructuredCV.skills.certifications, yPosition, [221, 214, 254]); // Light purple
    addSpacing(4);
  }

  // Projects
  if (restructuredCV.projects && restructuredCV.projects.length > 0) {
    addSpacing(4);
    addText('PROJECTS', 14, true, true);
    addSpacing(4);
    
    restructuredCV.projects.forEach(project => {
      addText(project.name, 12, true, false, [0, 0, 0]);
      addText(project.description, 10, false, false, [60, 60, 60]);
      addSpacing(1);
      
      // Project technologies as tags
      if (project.technologies.length > 0) {
        addText('Technologies:', 9, true, false, [100, 100, 100]);
        addSpacing(1);
        yPosition = addSkillTags(project.technologies, yPosition, [254, 215, 170]); // Light orange for projects
      }
      
      if (project.link) {
        addText(`Link: ${project.link}`, 9, false, false, [59, 130, 246]);
      }
      addSpacing(6);
    });
  }

  doc.save(filename);
};

export const generateDOCX = async (restructuredCV: RestructuredCV, filename: string = 'restructured-cv.docx') => {
  const children: Paragraph[] = [];
  const {saveAs} = pkg;

  // Helper function to create a paragraph with title and date on same line
  const createTitleDateParagraph = (title: string, date: string, titleSize: number = 24, dateSize: number = 18) => {
    return new Paragraph({
      children: [
        new TextRun({
          text: title,
          bold: true,
          size: titleSize,
          color: "000000",
        }),
        new TextRun({
          text: `\t\t\t\t\t\t${date}`,
          size: dateSize,
          color: "777777",
        }),
      ],
      spacing: { before: 100, after: 50 },
    });
  };

  // Personal Info - Header Style
  if (restructuredCV.personalInfo.name) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: restructuredCV.personalInfo.name,
            bold: true,
            size: 36,
            color: "000000",
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 150 },
      })
    );
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
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: contactInfo.join(' | '),
            size: 20,
            color: "666666",
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 300 },
      })
    );
  }

  // Professional Summary
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: 'PROFESSIONAL SUMMARY',
          bold: true,
          size: 24,
          color: "000000",
        }),
      ],
      spacing: { before: 150, after: 100 },
    })
  );

  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: restructuredCV.professionalSummary,
          size: 20,
          color: "333333",
        }),
      ],
      spacing: { after: 300 },
    })
  );

  // Experience
  if (restructuredCV.experience.length > 0) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'PROFESSIONAL EXPERIENCE',
            bold: true,
            size: 24,
            color: "000000",
          }),
        ],
        spacing: { before: 150, after: 150 },
      })
    );

    restructuredCV.experience.forEach(exp => {
      // Position and Date on same line
      children.push(createTitleDateParagraph(exp.position, exp.duration, 22, 18));

      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `${exp.company}${exp.location ? ` | ${exp.location}` : ''}`,
              size: 18,
              color: "555555",
            }),
          ],
          spacing: { after: 100 },
        })
      );

      exp.achievements.forEach(achievement => {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `• ${achievement}`,
                size: 18,
                color: "333333",
              }),
            ],
            spacing: { after: 50 },
          })
        );
      });

      // Add spacing between experiences
      children.push(
        new Paragraph({
          children: [new TextRun({ text: "", size: 1 })],
          spacing: { after: 150 },
        })
      );
    });
  }

  // Education
  if (restructuredCV.education.length > 0) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'EDUCATION',
            bold: true,
            size: 24,
            color: "000000",
          }),
        ],
        spacing: { before: 200, after: 150 },
      })
    );

    restructuredCV.education.forEach(edu => {
      // Degree and Date on same line
      children.push(createTitleDateParagraph(edu.degree, edu.duration, 22, 18));

      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `${edu.institution}${edu.location ? ` | ${edu.location}` : ''}`,
              size: 18,
              color: "555555",
            }),
          ],
          spacing: { after: 50 },
        })
      );

      if (edu.gpa) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `GPA: ${edu.gpa}`,
                size: 16,
                color: "777777",
              }),
            ],
            spacing: { after: 50 },
          })
        );
      }

      if (edu.relevantCoursework && edu.relevantCoursework.length > 0) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `Relevant Coursework: ${edu.relevantCoursework.join(', ')}`,
                size: 16,
                color: "666666",
              }),
            ],
            spacing: { after: 100 },
          })
        );
      }
    });
  }

  // Skills Section with lighter highlighting
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: 'TECHNICAL SKILLS',
          bold: true,
          size: 24,
          color: "000000",
        }),
      ],
      spacing: { before: 300, after: 150 },
    })
  );

  if (restructuredCV.skills.technical.length > 0) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'Technical Skills',
            bold: true,
            size: 20,
            color: "000000",
          }),
        ],
        spacing: { before: 100, after: 50 },
      })
    );

    // Create skills as separate highlighted runs with lighter colors
    const skillRuns = restructuredCV.skills.technical.map((skill, index) => 
      new TextRun({
        text: skill,
        size: 16,
        color: "333333",
        highlight: "BFDBFE", // Light blue
        bold: false,
      })
    );

    // Add skills with spacing
    for (let i = 0; i < skillRuns.length; i += 6) {
      const rowSkills = skillRuns.slice(i, i + 6);
      children.push(
        new Paragraph({
          children: rowSkills.reduce((acc, skill, index) => {
            if (index > 0) acc.push(new TextRun({ text: "  ", size: 16 }));
            acc.push(skill);
            return acc;
          }, [] as TextRun[]),
          spacing: { after: 100 },
        })
      );
    }
  }

  if (restructuredCV.skills.soft.length > 0) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'Soft Skills',
            bold: true,
            size: 20,
            color: "000000",
          }),
        ],
        spacing: { before: 150, after: 50 },
      })
    );

    const skillRuns = restructuredCV.skills.soft.map((skill, index) => 
      new TextRun({
        text: skill,
        size: 16,
        color: "333333",
        highlight: "FEF08A", // Light yellow
        bold: false,
      })
    );

    for (let i = 0; i < skillRuns.length; i += 6) {
      const rowSkills = skillRuns.slice(i, i + 6);
      children.push(
        new Paragraph({
          children: rowSkills.reduce((acc, skill, index) => {
            if (index > 0) acc.push(new TextRun({ text: "  ", size: 16 }));
            acc.push(skill);
            return acc;
          }, [] as TextRun[]),
          spacing: { after: 100 },
        })
      );
    }
  }

  if (restructuredCV.skills.languages && restructuredCV.skills.languages.length > 0) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'Languages',
            bold: true,
            size: 20,
            color: "000000",
          }),
        ],
        spacing: { before: 150, after: 50 },
      })
    );

    const skillRuns = restructuredCV.skills.languages.map((lang, index) => 
      new TextRun({
        text: lang,
        size: 16,
        color: "333333",
        highlight: "FDBA74", // Light orange
        bold: false,
      })
    );

    for (let i = 0; i < skillRuns.length; i += 6) {
      const rowSkills = skillRuns.slice(i, i + 6);
      children.push(
        new Paragraph({
          children: rowSkills.reduce((acc, skill, index) => {
            if (index > 0) acc.push(new TextRun({ text: "  ", size: 16 }));
            acc.push(skill);
            return acc;
          }, [] as TextRun[]),
          spacing: { after: 100 },
        })
      );
    }
  }

  if (restructuredCV.skills.certifications && restructuredCV.skills.certifications.length > 0) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'Certifications',
            bold: true,
            size: 20,
            color: "000000",
          }),
        ],
        spacing: { before: 150, after: 50 },
      })
    );

    const skillRuns = restructuredCV.skills.certifications.map((cert, index) => 
      new TextRun({
        text: cert,
        size: 16,
        color: "333333",
        highlight: "DDD6FE", // Light purple
        bold: false,
      })
    );

    for (let i = 0; i < skillRuns.length; i += 6) {
      const rowSkills = skillRuns.slice(i, i + 6);
      children.push(
        new Paragraph({
          children: rowSkills.reduce((acc, skill, index) => {
            if (index > 0) acc.push(new TextRun({ text: "  ", size: 16 }));
            acc.push(skill);
            return acc;
          }, [] as TextRun[]),
          spacing: { after: 100 },
        })
      );
    }
  }

  // Projects
  if (restructuredCV.projects && restructuredCV.projects.length > 0) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'PROJECTS',
            bold: true,
            size: 24,
            color: "000000",
          }),
        ],
        spacing: { before: 300, after: 150 },
      })
    );

    restructuredCV.projects.forEach(project => {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: project.name,
              bold: true,
              size: 22,
              color: "000000",
            }),
          ],
          spacing: { before: 100, after: 50 },
        })
      );

      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: project.description,
              size: 18,
              color: "333333",
            }),
          ],
          spacing: { after: 50 },
        })
      );

      if (project.technologies.length > 0) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: 'Technologies: ',
                size: 16,
                bold: true,
                color: "666666",
              }),
              ...project.technologies.map((tech, index) => 
                new TextRun({
                  text: index === 0 ? tech : `  ${tech}`,
                  size: 14,
                  color: "333333",
                  highlight: "FED7AA", // Light orange for projects
                  bold: false,
                })
              ),
            ],
            spacing: { after: 50 },
          })
        );
      }

      if (project.link) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `Link: ${project.link}`,
                size: 14,
                color: "3B82F6",
                underline: { type: UnderlineType.SINGLE },
              }),
            ],
            spacing: { after: 150 },
          })
        );
      }
    });
  }

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, filename);
};

export const generateTXT = (restructuredCV: RestructuredCV, filename: string = 'restructured-cv.txt') => {
  let cvText = '';
  
  // Personal Info
  if (restructuredCV.personalInfo.name) {
    cvText += `${restructuredCV.personalInfo.name}\n`;
    cvText += `${'='.repeat(restructuredCV.personalInfo.name.length)}\n`;
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
  cvText += `${'─'.repeat(20)}\n`;
  cvText += `${restructuredCV.professionalSummary}\n\n`;

  // Experience
  if (restructuredCV.experience.length > 0) {
    cvText += `PROFESSIONAL EXPERIENCE\n`;
    cvText += `${'─'.repeat(25)}\n`;
    restructuredCV.experience.forEach(exp => {
      cvText += `\n${exp.position}                                        ${exp.duration}\n`;
      cvText += `${exp.company}`;
      if (exp.location) cvText += ` | ${exp.location}`;
      cvText += `\n`;
      exp.achievements.forEach(achievement => {
        cvText += `• ${achievement}\n`;
      });
    });
    cvText += '\n';
  }

  // Education
  if (restructuredCV.education.length > 0) {
    cvText += `EDUCATION\n`;
    cvText += `${'─'.repeat(10)}\n`;
    restructuredCV.education.forEach(edu => {
      cvText += `\n${edu.degree}                                        ${edu.duration}\n`;
      cvText += `${edu.institution}`;
      if (edu.location) cvText += ` | ${edu.location}`;
      cvText += '\n';
      if (edu.gpa) cvText += `GPA: ${edu.gpa}\n`;
      if (edu.relevantCoursework && edu.relevantCoursework.length > 0) {
        cvText += `Relevant Coursework: ${edu.relevantCoursework.join(', ')}\n`;
      }
    });
    cvText += '\n';
  }

  // Skills with better formatting
  cvText += `TECHNICAL SKILLS\n`;
  cvText += `${'─'.repeat(15)}\n`;
  if (restructuredCV.skills.technical.length > 0) {
    cvText += `Technical Skills:\n`;
    cvText += `  ${restructuredCV.skills.technical.map(skill => `[${skill}]`).join(' ')}\n\n`;
  }
  if (restructuredCV.skills.soft.length > 0) {
    cvText += `Soft Skills:\n`;
    cvText += `  ${restructuredCV.skills.soft.map(skill => `[${skill}]`).join(' ')}\n\n`;
  }
  if (restructuredCV.skills.languages && restructuredCV.skills.languages.length > 0) {
    cvText += `Languages:\n`;
    cvText += `  ${restructuredCV.skills.languages.map(lang => `[${lang}]`).join(' ')}\n\n`;
  }
  if (restructuredCV.skills.certifications && restructuredCV.skills.certifications.length > 0) {
    cvText += `Certifications:\n`;
    cvText += `  ${restructuredCV.skills.certifications.map(cert => `[${cert}]`).join(' ')}\n\n`;
  }

  // Projects
  if (restructuredCV.projects && restructuredCV.projects.length > 0) {
    cvText += `PROJECTS\n`;
    cvText += `${'─'.repeat(8)}\n`;
    restructuredCV.projects.forEach(project => {
      cvText += `\n${project.name}\n`;
      cvText += `${project.description}\n`;
      cvText += `Technologies: ${project.technologies.map(tech => `[${tech}]`).join(' ')}`;
      if (project.link) cvText += ` | ${project.link}`;
      cvText += '\n';
    });
  }

  const blob = new Blob([cvText], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
