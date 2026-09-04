import Navigation from "@/components/Navigation";
import About from "@/components/About";

const AboutPage = () => {
  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      <div className="pt-[58px]">
        <About />
      </div>
    </main>
  );
};

export default AboutPage;
