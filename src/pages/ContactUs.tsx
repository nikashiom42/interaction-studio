import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import { usePageSEO } from '@/hooks/usePageSEO';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Phone, Mail, MapPin, Clock, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { contactConfig, getPhoneLink, getEmailLink } from '@/config/contact';

const contactInfo = [
  {
    icon: Phone,
    label: 'Phone',
    value: contactConfig.phone.display,
    href: getPhoneLink(),
  },
  {
    icon: Mail,
    label: 'Email',
    value: contactConfig.email,
    href: getEmailLink(),
  },
  {
    icon: MapPin,
    label: 'Office',
    value: contactConfig.address,
    href: 'https://maps.google.com/?q=Tbilisi+Georgia',
  },
  {
    icon: Clock,
    label: 'Working Hours',
    value: `Weekdays: ${contactConfig.hours.weekdays} | Weekends: ${contactConfig.hours.weekends}`,
    href: null,
  },
];

const ContactUs = () => {
  const { toast } = useToast();
  const { data: seo } = usePageSEO('contact');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('contact_messages')
        .insert([{
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim() || null,
          subject: formData.subject.trim(),
          message: formData.message.trim(),
        }]);

      if (error) throw error;

      let emailError: string | null = null;

      try {
        const response = await fetch('/api/send-contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name.trim(),
            email: formData.email.trim(),
            phone: formData.phone.trim(),
            subject: formData.subject.trim(),
            message: formData.message.trim(),
          }),
        });

        if (!response.ok) {
          const payload = await response.json().catch(() => null);
          emailError = payload?.error || 'Email notification failed.';
        }
      } catch (fetchError) {
        emailError = 'Email notification failed.';
      }

      toast({
        title: emailError ? 'Message saved, email failed' : 'Message Sent!',
        description: emailError
          ? 'We saved your message but could not send the notification email. We will still follow up.'
          : 'Thank you for contacting us. We will get back to you within 24 hours.',
        variant: emailError ? 'destructive' : undefined,
      });

      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (error) {
      toast({
        title: 'Error sending message',
        description: 'Please try again later or contact us directly.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={seo?.meta_title || "Contact Us"}
        description={seo?.meta_description || "Get in touch with Pegarent. 24/7 customer support, phone, email, and office location in Tbilisi."}
        url="/contact"
        keywords={seo?.keywords || undefined}
        image={seo?.og_image || undefined}
        canonicalUrl={seo?.canonical_url || undefined}
        noIndex={seo?.no_index || false}
        schemaMarkup={seo?.schema_markup || undefined}
      />
      <Header />

      <main>
        {/* Hero Section */}
        <section className="relative py-16 bg-gradient-to-br from-primary/10 to-secondary">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Get in Touch
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Have questions about our services? We're here to help you plan your perfect Georgian adventure.
            </p>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-16 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12">
              {/* Contact Info */}
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-6">Contact Information</h2>
                <p className="text-muted-foreground mb-8">
                  Our team is available 24/7 to assist you with bookings, inquiries, or roadside support. 
                  Reach out through any of the channels below.
                </p>

                <div className="space-y-6">
                  {contactInfo.map((info) => (
                    <div key={info.label} className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                        <info.icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">{info.label}</div>
                        {info.href ? (
                          <a
                            href={info.href}
                            target={info.href.startsWith('http') ? '_blank' : undefined}
                            rel={info.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                            className="text-foreground font-medium hover:text-primary transition-colors"
                          >
                            {info.value}
                          </a>
                        ) : (
                          <div className="text-foreground font-medium">{info.value}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Map Placeholder */}
                <div className="mt-10 h-64 bg-secondary rounded-2xl overflow-hidden">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2977.8902287073!2d44.7931!3d41.7151!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x40440cd00a4c6ca9%3A0x64bcc9f37e0a7f1!2sRustaveli%20Ave%2C%20Tbilisi%2C%20Georgia!5e0!3m2!1sen!2sus!4v1699900000000!5m2!1sen!2sus"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Office Location"
                  />
                </div>
              </div>

              {/* Contact Form */}
              <div className="bg-secondary/50 rounded-2xl p-8">
                <h2 className="text-2xl font-bold text-foreground mb-6">Send us a Message</h2>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="John Doe"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="john@example.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder={contactConfig.phone.display}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject</Label>
                      <Input
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        placeholder="Booking inquiry"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Tell us how we can help you..."
                      rows={5}
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full gap-2"
                    size="lg"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      'Sending...'
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default ContactUs;
