-- Create a function to update car ratings based on reviews
CREATE OR REPLACE FUNCTION public.update_car_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_car_id uuid;
BEGIN
  -- Determine which car_id to update
  IF TG_OP = 'DELETE' THEN
    target_car_id := OLD.car_id;
  ELSE
    target_car_id := NEW.car_id;
  END IF;
  
  -- Update car rating
  IF target_car_id IS NOT NULL THEN
    UPDATE public.cars
    SET 
      rating = COALESCE((SELECT AVG(rating) FROM public.reviews WHERE car_id = target_car_id AND is_approved = true), 0),
      reviews_count = (SELECT COUNT(*) FROM public.reviews WHERE car_id = target_car_id AND is_approved = true)
    WHERE id = target_car_id;
  END IF;
  
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$;

-- Create trigger for INSERT and UPDATE
CREATE TRIGGER trigger_update_car_rating_insert_update
AFTER INSERT OR UPDATE ON public.reviews
FOR EACH ROW
WHEN (NEW.car_id IS NOT NULL)
EXECUTE FUNCTION public.update_car_rating();

-- Create trigger for DELETE  
CREATE TRIGGER trigger_update_car_rating_delete
AFTER DELETE ON public.reviews
FOR EACH ROW
WHEN (OLD.car_id IS NOT NULL)
EXECUTE FUNCTION public.update_car_rating();