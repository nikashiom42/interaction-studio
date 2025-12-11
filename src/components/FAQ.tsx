import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
  {
    question: 'What documents do I need to rent a car in Georgia?',
    answer: 'You need a valid driving license (international or from your home country), a passport or ID, and a credit/debit card for the deposit. Drivers must be at least 21 years old with at least 1 year of driving experience.',
  },
  {
    question: 'Is insurance included in the rental price?',
    answer: 'Yes, basic insurance (CDW - Collision Damage Waiver) is included in all our rentals. You can upgrade to full coverage insurance for additional peace of mind at checkout.',
  },
  {
    question: 'Can I pick up the car at Tbilisi Airport?',
    answer: 'Absolutely! We offer convenient pickup and drop-off at Tbilisi International Airport (TBS), as well as Batumi and Kutaisi airports. Airport pickup is available 24/7.',
  },
  {
    question: 'What is your cancellation policy?',
    answer: 'Free cancellation up to 48 hours before your pickup time for a full refund. Cancellations within 48 hours may be subject to a cancellation fee of one day\'s rental.',
  },
  {
    question: 'Do you offer one-way rentals?',
    answer: 'Yes, we offer one-way rentals between major cities in Georgia. Pick up in Tbilisi and drop off in Batumi, or vice versa. Additional fees may apply for one-way rentals.',
  },
  {
    question: 'What fuel policy do you have?',
    answer: 'We operate a "full-to-full" fuel policy. You receive the car with a full tank and should return it with a full tank. Fuel costs are not included in the rental price.',
  },
];

const FAQ = () => {
  return (
    <section className="py-16 bg-background">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-foreground mb-3">
            Frequently Asked Questions
          </h2>
          <p className="text-muted-foreground">
            Everything you need to know about renting a car in Georgia
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full space-y-3">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="bg-secondary/50 rounded-xl px-6 border-none"
            >
              <AccordionTrigger className="text-left font-medium text-foreground hover:no-underline py-5">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-5">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default FAQ;
