import Navigation from "@/components/Navigation";
import Contact from "@/components/Contact";

const ContactPage = () => {
  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      <div className="pt-32">
        <Contact />
      </div>
    </main>
  );
};

export default ContactPage;
