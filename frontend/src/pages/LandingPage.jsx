import { LayoutDashboard, Users, CheckCircle, Receipt, BarChart3, PlayCircle, Menu, X, Share2, MessageSquare } from "lucide-react";
import { Pagination, Autoplay } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { useEffect, useState } from "react";
import { Link } from "react-router";
import landingPage1 from "../assets/landingPage_1.png";
import landingPage2 from "../assets/landingPage_2.png";
import "swiper/css/pagination";
import "swiper/css";

const LandingPage = () => {
  
  const typingPhrase = "Independent Business";
  const sectionIds = ["features", "solutions", "reviews"];

  const [displayedLength, setDisplayedLength] = useState(0);
  const [activeSection, setActiveSection] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isLoading) return;

    const duration = 2000;
    const intervalTime = 20;
    const step = 100 / (duration / intervalTime);

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + step;
        if (next >= 100) {
          clearInterval(timer);
          setTimeout(() => setIsLoading(false), 200);
          return 100;
        }
        return next;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isLoading]);

  useEffect(() => {
    const isFull = !isDeleting && displayedLength === typingPhrase.length;
    const isEmpty = isDeleting && displayedLength === 0;
    const delay = isFull ? 1000 : isEmpty ? 500 : isDeleting ? 60 : 120;

    const timer = setTimeout(() => {
      if (isFull) {
        setIsDeleting(true);
        return;
      }
      if (isEmpty) {
        setIsDeleting(false);
        return;
      }
      setDisplayedLength((prev) => prev + (isDeleting ? -1 : 1));
    }, delay);

    return () => clearTimeout(timer);
  }, [displayedLength, isDeleting]);

  useEffect(() => {
    const handleScroll = () => {
      const values = sectionIds.map((sectionId) => {
        const el = document.getElementById(sectionId);
        if (!el) return { sectionId, distance: Number.MAX_VALUE, visible: false };
        const rect = el.getBoundingClientRect();
        return {
          sectionId,
          distance: Math.abs(rect.top - 120),
          visible: rect.top <= 140 && rect.bottom > 140,
        };
      });

      const visibleSection = values.find((item) => item.visible)?.sectionId;
      if (visibleSection) {
        setActiveSection(visibleSection);
        return;
      }

    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const typedText = typingPhrase.slice(0, displayedLength);

  const features = [
    {
      title: "Client Management",
      icon: <Users size={24} className="text-[#4b41e1]" />,
      desc: "Centralize your contacts, communication history, and key documents. Never lose track of a lead or client detail again.",
    },
    {
      title: "Project Tracking",
      icon: <CheckCircle size={24} className="text-[#4b41e1]" />,
      desc: "Break down deliverables, set milestones, and track time against specific tasks. Keep your workflow efficient and predictable.",
    },
    {
      title: "Seamless Invoicing",
      icon: <Receipt size={24} className="text-[#4b41e1]" />,
      desc: "Convert tracked time and project milestones into professional invoices instantly. Experience the seamless draft-to-paid workflow.",
    },
  ];

  const multipleFeatures = [
    "Automated MRR calculations",
    "Invoice aging reports",
    "Client profitability tracking",
  ];

  const usersReviews = [
    {
      name: "Alex Chen",
      quote:
        "Everything from the first client email to the final paid invoice happens in one clean, structured interface. It's the technical precision I expect from software.",
    },
    {
      name: "Sarah Miller",
      quote:
        "DevDesk handles my complex project timelines perfectly. I've finally found a tool that looks as good as the designs I deliver to my clients.",
    },
    {
      name: "James Wilson",
      quote:
        "The automated invoicing has saved me hours every month. I can focus on writing while DevDesk handles the administrative heavy lifting.",
    },
    {
      name: "Elena Rodriguez",
      quote:
        "Real-time analytics give me the confidence to scale my consulting business. I know exactly where my revenue stands at any given moment.",
    },
    {
      name: "Sarah Miller",
      quote:
        "DevDesk handles my complex project timelines perfectly. I've finally found a tool that looks as good as the designs I deliver to my clients.",
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#091426] flex flex-col items-center justify-center z-[9999]">
        <div className="w-64 max-w-[80vw]">
          <div className="flex justify-between items-end mb-4">
            <span className="text-white font-bold text-2xl flex items-center gap-2">
              <LayoutDashboard className="text-[#4b41e1]" size={28} />
              DevDesk
            </span>
            <span className="text-[#4b41e1] font-mono text-lg font-medium">{Math.round(progress)}%</span>
          </div>
          <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#4b41e1] transition-all duration-75 ease-linear rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f9fb] text-[#191c1e] font-sans antialiased">
      <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm transition-all duration-200">
        <div className="flex justify-between items-center max-w-7xl mx-auto px-6 h-20">
          <Link
            className="text-2xl font-bold text-[#091426] flex items-center gap-2"
            href="#"
          >
            <LayoutDashboard
              className="text-[#4b41e1] fill-[#4b41e1]/20"
              size={32}
            />
            DevDesk
          </Link>

          <nav className="hidden md:flex gap-8 items-center">
            {sectionIds.map((sectionId) => (
              <Link
                key={sectionId}
                className={`font-medium transition-colors ${
                  activeSection === sectionId
                    ? "text-[#4b41e1]"
                    : "text-gray-600 hover:text-[#091426]"
                }`}
                href={`#${sectionId}`}
              >
                {sectionId.charAt(0).toUpperCase() + sectionId.slice(1)}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              to={`/login`}
              className="hidden md:inline-block font-medium text-[#091426] bg-white border border-gray-300 hover:bg-gray-50 transition-colors rounded-lg px-5 py-2 shadow-sm"
              href="#"
            >
              Login
            </Link>
            <button
              className="md:hidden text-[#091426]"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden bg-white border-b border-gray-200 px-6 py-4 flex flex-col gap-4">
            {sectionIds.map((sectionId) => (
              <Link
                key={sectionId}
                className="text-gray-600 font-medium"
                href={`#${sectionId}`}
              >
                {sectionId.charAt(0).toUpperCase() + sectionId.slice(1)}
              </Link>
            ))}
            <hr />
            <Link to={`/login`} className="text-gray-600 font-medium" href="#">
              Login
            </Link>
          </div>
        )}
      </header>

      <main>
        <section className="relative overflow-hidden pt-36 sm:pt-40 pb-24 lg:pt-48 lg:pb-32 max-w-7xl mx-auto px-6">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,rgba(75,65,225,0.1),transparent_50%)]"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="max-w-2xl">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl leading-[1.1] font-bold text-[#091426] mb-6 tracking-tight">
                Empower your{" "}
                <span className="text-[#4b41e1] typing-text">
                  {typedText}
                  <span className="typing-cursor" aria-hidden="true"></span>
                </span>
              </h1>
              <p className="text-base sm:text-lg text-gray-600 mb-10 max-w-xl leading-relaxed">
                The all-in-one CRM built exclusively for independent
                professionals. Manage clients, track projects, and automate
                invoicing without the enterprise bloat.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to={`/signup`}
                  className="inline-flex justify-center items-center font-medium text-white bg-[#4b41e1] hover:bg-[#3323cc] transition-all rounded-lg px-8 py-4 shadow-lg"
                  href="#"
                >
                  Get Started
                </Link>
                <Link
                  className="inline-flex justify-center items-center font-medium text-[#091426] bg-white border border-gray-300 hover:bg-gray-50 transition-all rounded-lg px-8 py-4 shadow-sm"
                  href="#"
                >
                  <PlayCircle className="mr-2 text-[#4b41e1]" size={20} />
                  Watch Demo
                </Link>
              </div>
            </div>
            <div className="relative lg:ml-auto w-full mt-8 sm:mt-10 lg:mt-0 rounded-2xl shadow-2xl border border-gray-200 bg-white group p-4 sm:p-6 lg:p-8">
              <img
                alt="Dashboard Preview"
                className="w-full h-auto rounded-xl object-contain transition-transform duration-500 group-hover:scale-[1.02]"
                src={landingPage1}
              />
            </div>
          </div>
        </section>

        <section id="features" className="py-24 bg-white px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16 max-w-2xl mx-auto">
              <h2 className="text-3xl lg:text-4xl font-bold text-[#091426] mb-4">
                Everything you need to scale
              </h2>
              <p className="text-lg text-gray-600">
                Streamline your workflow from initial contact to final payment.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {features.map((feature, i) => (
                <div
                  key={i}
                  className="bg-[#f7f9fb] border border-gray-200 rounded-2xl p-8 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#4b41e1]/10 flex items-center justify-center mb-6">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-[#091426] mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="solutions" className="py-24 px-6 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="hover-3d">
                <figure className="hover-3d-card max-w-130 rounded-2xl overflow-hidden border border-gray-200 shadow-2xl bg-white">
                  <img
                    src={landingPage2}
                    alt="3D card"
                    className="w-full h-auto"
                  />
                </figure>
              </div>
            <div className="order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#4b41e1]/10 text-[#4b41e1] text-xs font-bold uppercase tracking-wider mb-6">
                <BarChart3 size={14} />
                Insights
              </div>
              <h2 className="text-4xl font-bold text-[#091426] mb-6 leading-tight">
                Real-time Analytics for your business health.
              </h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Stop guessing about your revenue pipeline. DevDesk provides
                high-density, actionable insights without the cognitive
                overload. Track unpaid invoices, forecasted revenue, and client
                lifetime value in one clear, structured view.
              </p>
              <ul className="space-y-4">
                {multipleFeatures.map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <CheckCircle className="text-[#4b41e1]" size={20} />
                    <span className="font-medium text-[#191c1e]">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="py-16 bg-[#f7f9fb] border-y border-gray-200">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-10">
              Trusted by 100+ independent professionals
            </p>
            <div className="trusted-marquee opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
              <div className="trusted-marquee-track inline-flex items-center gap-12 md:gap-20">
                <div className="flex items-center gap-2 text-xl font-bold">
                  <LayoutDashboard size={24} /> TechPro
                </div>
                <div className="flex items-center gap-2 text-xl font-bold">
                  <Users size={24} /> Studio.co
                </div>
                <div className="flex items-center gap-2 text-xl font-bold">
                  <BarChart3 size={24} /> MarketMinds
                </div>
                <div className="flex items-center gap-2 text-xl font-bold">
                  <MessageSquare size={24} /> Advisors
                </div>
                <div className="flex items-center gap-2 text-xl font-bold">
                  <LayoutDashboard size={24} /> TechPro
                </div>
                <div className="flex items-center gap-2 text-xl font-bold">
                  <Users size={24} /> Studio.co
                </div>
                <div className="flex items-center gap-2 text-xl font-bold">
                  <BarChart3 size={24} /> MarketMinds
                </div>
                <div className="flex items-center gap-2 text-xl font-bold">
                  <MessageSquare size={24} /> Advisors
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="reviews" className="py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-16">
              <span className="text-sm text-gray-500 font-medium text-center block mb-2">
                TESTIMONIAL
              </span>
              <h2 className="text-4xl text-center font-bold text-gray-900">
                What our happy user says!
              </h2>
            </div>

            <div className="swiper mySwiper">
              <Swiper
                modules={[Pagination, Autoplay]}
                slidesPerView={1}
                spaceBetween={32}
                loop={true}
                centeredSlides={true}
                pagination={{
                  el: ".swiper-pagination",
                  clickable: true,
                }}
                autoplay={{
                  delay: 2500,
                  disableOnInteraction: false,
                }}
                breakpoints={{
                  640: {
                    slidesPerView: 1,
                    spaceBetween: 32,
                  },
                  768: {
                    slidesPerView: 2,
                    spaceBetween: 32,
                  },
                  1024: {
                    slidesPerView: 3,
                    spaceBetween: 32,
                  },
                }}
                className="mySwiper"
              >
                {usersReviews.map((review, idx) => (
                  <SwiperSlide key={idx}>
                    <div className="group bg-white border border-solid border-gray-300 rounded-xl p-6 transition-all duration-500 w-full mx-auto hover:border-indigo-600 hover:shadow-sm slide_active:border-indigo-600">
                      <div>
                        <p className="text-base text-gray-600 leading-6 transition-all duration-500 pb-8 group-hover:text-gray-800 slide_active:text-gray-800">
                          {review.quote}
                        </p>
                      </div>
                      <div className="flex items-center gap-5 border-t border-solid border-gray-200 pt-5">
                        <div className="block">
                          <h5 className="text-gray-900 font-medium transition-all duration-500 mb-1">
                            {review.name}
                          </h5>
                        </div>
                      </div>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
              <div className="swiper-pagination"></div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-[#091426] text-white py-10 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12">
            <div className="lg:col-span-2">
              <Link
                className="text-2xl font-bold flex items-center gap-2 mb-6"
                href="#"
              >
                <LayoutDashboard className="text-[#4b41e1]" size={28} />
                DevDesk
              </Link>
              <p className="text-gray-400 mb-8 max-w-sm leading-relaxed">
                Built for the independent professional. High-density information
                management without the cognitive overload.
              </p>
              <div className="flex gap-4">
                <Link
                  href="#"
                  className="p-2 bg-white/5 rounded-lg hover:bg-[#4b41e1] transition-colors"
                >
                  <Share2 size={20} />
                </Link>
                <Link
                  href="#"
                  className="p-2 bg-white/5 rounded-lg hover:bg-[#4b41e1] transition-colors"
                >
                  <MessageSquare size={20} />
                </Link>
              </div>
            </div>

            {["Product", "Company", "Support"].map((title) => (
              <div key={title}>
                <h4 className="text-xs font-bold uppercase tracking-widest text-white mb-6">
                  {title}
                </h4>
                <ul className="space-y-4">
                  {title === "Product" &&
                    ["Features", "Pricing", "Solutions"].map((l) => (
                      <li key={l}>
                        <Link
                          href="#"
                          className="text-gray-400 hover:text-white transition-colors"
                        >
                          {l}
                        </Link>
                      </li>
                    ))}
                  {title === "Company" &&
                    ["About Us", "Careers", "Blog"].map((l) => (
                      <li key={l}>
                        <Link
                          href="#"
                          className="text-gray-400 hover:text-white transition-colors"
                        >
                          {l}
                        </Link>
                      </li>
                    ))}
                  {title === "Support" &&
                    ["Help Center", "Contact", "Privacy"].map((l) => (
                      <li key={l}>
                        <Link
                          href="#"
                          className="text-gray-400 hover:text-white transition-colors"
                        >
                          {l}
                        </Link>
                      </li>
                    ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-20 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
            <p>
              © 2026 DevDesk Inc. All rights reserved. Built for the independent
              professional.
            </p>
            <div className="flex gap-8">
              <Link href="#" className="hover:text-white">
                Terms
              </Link>
              <Link href="#" className="hover:text-white">
                Privacy
              </Link>
              <Link href="#" className="hover:text-white">
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;