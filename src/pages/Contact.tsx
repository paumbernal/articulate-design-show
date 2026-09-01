import Navigation from "@/components/Navigation";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

const ContactPage = () => {
  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      <div className="pt-32">
        <Contact />
      </div>
      <Footer />
    </main>
  );
};

export default ContactPage;
