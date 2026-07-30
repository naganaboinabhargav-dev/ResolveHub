import Navbar from '../components/landing/Navbar';
import Hero from '../components/landing/Hero';
import LogoStrip from '../components/landing/LogoStrip';
import Features from '../components/landing/Features';
import Workflow from '../components/landing/Workflow';
import Roles from '../components/landing/Roles';
import Faq from '../components/landing/Faq';
import CTA from '../components/landing/CTA';
import Footer from '../components/landing/Footer';

const Landing = () => (
  <div className="min-h-screen bg-white">
    <Navbar />
    <Hero />
    <LogoStrip />
    <Features />
    <Workflow />
    <Roles />
    <Faq />
    <CTA />
    <Footer />
  </div>
);

export default Landing;
