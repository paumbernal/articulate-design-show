import Navigation from "@/components/Navigation";
import FuturesRiskLab from "@/features/futures-risk-lab/FuturesRiskLab";

const FuturesRiskLabPage = () => {
  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      <div className="pt-32">
        <FuturesRiskLab />
      </div>
    </main>
  );
};

export default FuturesRiskLabPage;
