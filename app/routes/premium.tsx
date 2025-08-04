// routes/premium.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Check, X, Star, Zap, Crown, Users } from 'lucide-react';
import Navbar from '~/components/Navbar';
import { CVRefineSectionBackground } from '~/components/background';
import { useUserStore } from '~/lib/userStore';
import { useNotifications } from '~/lib/notifications';

// routes/premium.tsx
const PremiumPage = () => {
  const navigate = useNavigate();
  const { currentUser, isPremium, isTrialActive, daysLeftInTrial } = useUserStore();
  const { addNotification } = useNotifications();
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly');
  const [isLoading, setIsLoading] = useState(false);

  const plans = {
    free: {
      name: 'Free',
      price: { monthly: 0, yearly: 0 },
      description: 'Perfect for trying out our resume analyzer',
      features: [
        '3 analyses per day',
        'Basic ATS score',
        'General recommendations',
        'Community support'
      ],
      limitations: [
        'Limited daily analyses',
        'Basic feedback only',
        'No premium templates',
        'No export options'
      ],
      cta: 'Current Plan',
      popular: false
    },
    pro: {
      name: 'Pro',
      price: { monthly: 9.99, yearly: 99.99 },
      description: 'For job seekers who want the best resume optimization',
      features: [
        'Unlimited analyses',
        'Advanced ATS scoring',
        'Industry-specific insights',
        'Premium resume templates',
        'Export to PDF, DOCX, LinkedIn',
        'Salary insights & benchmarks',
        'Interview preparation tips',
        'Priority support',
        'Resume version history'
      ],
      limitations: [],
      cta: 'Upgrade to Pro',
      popular: true
    },
    enterprise: {
      name: 'Enterprise',
      price: { monthly: 49.99, yearly: 499.99 },
      description: 'For HR teams and recruitment agencies',
      features: [
        'Everything in Pro',
        'Bulk resume processing',
        'Team dashboard & analytics',
        'API access',
        'Custom integrations',
        'Dedicated account manager',
        'Custom branding',
        'Advanced reporting',
        'SSO integration'
      ],
      limitations: [],
      cta: 'Contact Sales',
      popular: false
    }
  };

  const handleUpgrade = async (planType: 'pro' | 'enterprise') => {
    setIsLoading(true);
    
    try {
      if (planType === 'enterprise') {
        navigate('/contact');
        return;
      }
      
      const price = plans[planType].price[selectedPlan];
      
      addNotification({
        type: 'info',
        title: 'Payment Processing',
        message: `Redirecting to secure payment for ${planType} plan ($${price}/${selectedPlan.replace('ly', '')})...`,
        duration: 3000,
        dismissible: true,
      });
      
      setTimeout(() => {
        addNotification({
          type: 'success',
          title: 'Upgrade Successful!',
          message: `Welcome to Resume Analyzer ${planType}! You now have access to all premium features.`,
          duration: 5000,
          dismissible: true,
        });
        
        navigate('/upload');
      }, 2000);
      
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Upgrade Failed',
        message: 'There was an error processing your upgrade. Please try again.',
        duration: 8000,
        dismissible: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price: number, billing: 'monthly' | 'yearly') => {
    if (price === 0) return 'Free';
    if (billing === 'yearly') {
      const monthlyEquivalent = (price / 12).toFixed(2);
      return `$${monthlyEquivalent}/mo`;
    }
    return `$${price}/mo`;
  };

  const getSavings = (plan: any) => {
    if (plan.price.yearly === 0) return null;
    const yearlySavings = (plan.price.monthly * 12) - plan.price.yearly;
    return Math.round(yearlySavings);
  };

  return (
    <CVRefineSectionBackground>
      <main>
        <Navbar />
        <section className="main-section">
          <div className="page-heading py-16">
            <h1>Choose Your Plan</h1>
            <h2>Get the resume analysis that lands you the job</h2>
            
            {isTrialActive() && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8 max-w-2xl">
                <div className="flex items-center gap-2 text-blue-800">
                  <Star className="h-5 w-5" />
                  <span className="font-medium">
                    Free Pro Trial - {daysLeftInTrial()} days remaining
                  </span>
                </div>
                <p className="text-blue-600 mt-1">
                  Enjoying the Pro features? Upgrade now to continue unlimited access!
                </p>
              </div>
            )}

            <div className="flex items-center justify-center gap-4 mb-12">
              <span className={`font-medium ${selectedPlan === 'monthly' ? 'text-dark-200' : 'text-gray-500'}`}>
                Monthly
              </span>
              <button
                onClick={() => setSelectedPlan(selectedPlan === 'monthly' ? 'yearly' : 'monthly')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  selectedPlan === 'yearly' ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    selectedPlan === 'yearly' ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className={`font-medium ${selectedPlan === 'yearly' ? 'text-dark-200' : 'text-gray-500'}`}>
                Yearly
              </span>
              {selectedPlan === 'yearly' && (
                <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                  Save up to $20
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full">
              {Object.entries(plans).map(([key, plan]) => (
                <div
                  key={key}
                  className={`relative bg-white rounded-2xl border-2 p-8 ${
                    plan.popular 
                      ? 'border-blue-500 shadow-xl scale-105' 
                      : 'border-gray-200 shadow-lg'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div className="text-center mb-6">
                    <div className="flex items-center justify-center mb-2">
                      {key === 'free' && <Zap className="h-6 w-6 text-gray-500 mr-2" />}
                      {key === 'pro' && <Crown className="h-6 w-6 text-blue-500 mr-2" />}
                      {key === 'enterprise' && <Users className="h-6 w-6 text-purple-500 mr-2" />}
                      <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                    </div>
                    
                    <div className="mb-4">
                      <span className="text-4xl font-bold text-dark-200">
                        {formatPrice(plan.price[selectedPlan], selectedPlan)}
                      </span>
                      {plan.price[selectedPlan] > 0 && (
                        <span className="text-gray-500 ml-1">
                          /{selectedPlan.replace('ly', '')}
                        </span>
                      )}
                    </div>
                    
                    {selectedPlan === 'yearly' && getSavings(plan) && (
                      <div className="text-green-600 text-sm font-medium">
                        Save ${getSavings(plan)} per year
                      </div>
                    )}
                    
                    <p className="text-gray-600 text-sm">{plan.description}</p>
                  </div>

                  <div className="space-y-3 mb-8">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700 text-sm">{feature}</span>
                      </div>
                    ))}
                    
                    {plan.limitations.map((limitation, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <X className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-500 text-sm">{limitation}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => {
                      if (key === 'free') return;
                      handleUpgrade(key as 'pro' | 'enterprise');
                    }}
                    disabled={isLoading || (key === 'free') || (isPremium() && key === 'pro')}
                    className={`w-full py-3 px-6 rounded-lg font-medium transition-all duration-200 ${
                      key === 'free' || (isPremium() && key === 'pro')
                        ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                        : plan.popular
                        ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg'
                        : 'bg-gray-900 text-white hover:bg-gray-800'
                    }`}
                  >
                    {isLoading ? 'Processing...' : 
                     (isPremium() && key === 'pro') ? 'Current Plan' : 
                     plan.cta}
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-16 max-w-4xl">
              <h3 className="text-2xl font-bold text-center mb-8 text-dark-200">
                Frequently Asked Questions
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Can I cancel anytime?
                  </h4>
                  <p className="text-gray-600 text-sm">
                    Yes! You can cancel your subscription at any time. You'll continue to have access to Pro features until the end of your billing period.
                  </p>
                </div>
                
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    What's included in the free trial?
                  </h4>
                  <p className="text-gray-600 text-sm">
                    New users get 7 days of full Pro access with unlimited analyses, premium templates, and all advanced features.
                  </p>
                </div>
                
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Do you offer refunds?
                  </h4>
                  <p className="text-gray-600 text-sm">
                    We offer a 30-day money-back guarantee if you're not satisfied with Resume Analyzer Pro.
                  </p>
                </div>
                
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Is my data secure?
                  </h4>
                  <p className="text-gray-600 text-sm">
                    Absolutely! Your resumes are encrypted and stored securely. We never share your personal information with third parties.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </CVRefineSectionBackground>
  );
};

export default PremiumPage;