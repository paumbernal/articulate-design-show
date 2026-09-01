import Navigation from "@/components/Navigation";
import OrderFlowTerminal from "@/features/orderflow-edge-lab/OrderFlowTerminal";

const OrderFlow = () => {
  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      <div className="pt-32">
        <OrderFlowTerminal />
      </div>
    </main>
  );
};

export default OrderFlow;
