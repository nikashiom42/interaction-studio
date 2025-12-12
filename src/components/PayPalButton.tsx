import { PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js";
import { Skeleton } from "@/components/ui/skeleton";

interface PayPalButtonProps {
  amount: string;
  currency?: string;
  onSuccess?: (details: any) => void;
  onError?: (error: any) => void;
  onCancel?: () => void;
}

const PayPalButton = ({
  amount,
  currency = "USD",
  onSuccess,
  onError,
  onCancel,
}: PayPalButtonProps) => {
  const [{ isPending, isRejected }] = usePayPalScriptReducer();

  if (isPending) {
    return <Skeleton className="h-12 w-full" />;
  }

  if (isRejected) {
    return (
      <div className="text-destructive text-sm text-center p-4">
        Failed to load PayPal. Please refresh and try again.
      </div>
    );
  }

  return (
    <PayPalButtons
      style={{
        layout: "vertical",
        color: "gold",
        shape: "rect",
        label: "paypal",
      }}
      createOrder={(data, actions) => {
        return actions.order.create({
          intent: "CAPTURE",
          purchase_units: [
            {
              amount: {
                currency_code: currency,
                value: amount,
              },
            },
          ],
        });
      }}
      onApprove={async (data, actions) => {
        if (actions.order) {
          const details = await actions.order.capture();
          onSuccess?.(details);
        }
      }}
      onError={(err) => {
        console.error("PayPal error:", err);
        onError?.(err);
      }}
      onCancel={() => {
        onCancel?.();
      }}
    />
  );
};

export default PayPalButton;
