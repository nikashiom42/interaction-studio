-- Seed page_seo rows for Help Center, Safety Information, and Cancellation Policy
INSERT INTO page_seo (page_key, meta_title, meta_description, no_index)
VALUES
  (
    'help-center',
    'Help Center – Car Rental Support in Georgia | Pegarent',
    'Need help with your car rental in Georgia? Find answers about booking, pickup, insurance, driving tips and more. Contact our support team anytime.',
    false
  ),
  (
    'safety-information',
    'Car Rental Insurance in Georgia | Pegarent',
    'All Pegarent rental cars are insured with 100% exterior damage coverage. Drive across Georgia with confidence. Learn what''s covered and what''s not.',
    false
  ),
  (
    'cancellation-policy',
    'Car Rental Cancellation Policy | Pegarent',
    'Flexible car rental cancellation policy in Georgia. Free cancellation, no advance payment required, and easy booking modifications.',
    false
  )
ON CONFLICT (page_key) DO NOTHING;
