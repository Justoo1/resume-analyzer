// routes/contact.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Mail, Phone, MessageSquare } from 'lucide-react';
import Navbar from '~/components/Navbar';
import { CVRefineSectionBackground } from '~/components/background';
import { useNotifications } from '~/lib/notifications';

const ContactPage = () => {
  const navigate = useNavigate();
  const { addNotification } = useNotifications();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      company: formData.get('company'),
      message: formData.get('message'),
      plan: 'enterprise'
    };

    // Simulate form submission
    setTimeout(() => {
      addNotification({
        type: 'success',
        title: 'Message Sent!',
        message: 'Thank you for your interest in Resume Analyzer Enterprise. We\'ll get back to you within 24 hours.',
        duration: 8000,
        dismissible: true,
      });
      
      setIsSubmitting(false);
      navigate('/');
    }, 1500);
  };

  return (
    <CVRefineSectionBackground>
      <main>
        <Navbar />
        <section className="main-section">
          <div className="page-heading py-16">
            <h1>Contact Sales</h1>
            <h2>Let's discuss how Resume Analyzer Enterprise can help your team</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl w-full mt-12">
              {/* Contact Form */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Get in Touch</h3>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Work Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="john@company.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                      Company Name *
                    </label>
                    <input
                      type="text"
                      id="company"
                      name="company"
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Company Inc."
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                      Tell us about your needs
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={4}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="How many team members? What features are most important? Any specific integration needs?"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                  </button>
                </form>
              </div>

              {/* Contact Info & Features */}
              <div className="space-y-8">
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Why Choose Enterprise?</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <MessageSquare className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Dedicated Support</h4>
                        <p className="text-gray-600 text-sm">Priority support with dedicated account manager</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Mail className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Custom Integrations</h4>
                        <p className="text-gray-600 text-sm">Integrate with your existing HR tools and workflows</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Phone className="h-4 w-4 text-purple-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Bulk Processing</h4>
                        <p className="text-gray-600 text-sm">Analyze hundreds of resumes simultaneously</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-2xl p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Response</h3>
                  <p className="text-gray-600 mb-4">
                    We typically respond to enterprise inquiries within 24 hours. For urgent needs, 
                    you can also reach us directly:
                  </p>
                  
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      <strong>Email:</strong> enterprise@resumeanalyzer.com
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Phone:</strong> +1 (555) 123-4567
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </CVRefineSectionBackground>
  );
};

export default ContactPage;