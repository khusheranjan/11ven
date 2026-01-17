import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="min-h-screen selection:bg-gray-200">
      {/* Hero Section */}
      <section id="hero" className="relative h-screen flex items-center justify-center overflow-hidden bg-white">
        {/* Background Accents */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gray-100 -z-10 translate-x-1/2 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute bottom-0 left-0 w-1/4 h-1/2 bg-gray-200 -z-10 -translate-x-1/2 rounded-full blur-3xl opacity-30"></div>

        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="animate-fade-in space-y-8">
            <span className="inline-block px-4 py-1.5 bg-gray-200 text-gray-700 text-[10px] font-bold tracking-[0.4em] uppercase rounded-full mb-4">
              Premium Bespoke Apparel
            </span>
            <h1 className="text-7xl md:text-9xl font-serif font-bold text-black tracking-tight leading-[0.9]">
              Wear Your <br />
              <span className="italic font-light text-gray-500">Masterpiece.</span>
            </h1>
            <p className="max-w-xl mx-auto text-lg text-gray-600 font-light leading-relaxed">
              11ven blends high-fashion quality with absolute creative freedom. Your designs, printed on our sustainably sourced, premium-weight fabrics.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-10">
              <Link 
                to="/signup" 
                className="group relative bg-black text-white px-10 py-5 rounded-full font-bold overflow-hidden transition-all hover:pr-14"
              >
                <span className="relative z-10">Start Creating</span>
                <span className="absolute right-6 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                  →
                </span>
              </Link>
              <a href="#gallery" className="text-black font-bold border-b-2 border-gray-300 hover:border-black transition-all py-1">
                View Lookbook
              </a>
            </div>
          </div>
        </div>

        {/* Floating elements */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce text-gray-400">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* Feature Section */}
      <section className="py-24 bg-black text-white">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-16">
          <div className="space-y-4">
            <h3 className="text-xl font-bold font-serif italic text-gray-300">Superior Fabric</h3>
            <p className="text-gray-400 leading-relaxed font-light">
              We exclusively use 240GSM organic Supima cotton. Every shirt is engineered to last a lifetime, maintaining shape and texture through every wash.
            </p>
          </div>
          <div className="space-y-4">
            <h3 className="text-xl font-bold font-serif italic text-gray-300">Precision Print</h3>
            <p className="text-gray-400 leading-relaxed font-light">
              Our advanced DTG technology ensures vibrant colors and razor-sharp details that fuse into the fabric rather than sitting on top.
            </p>
          </div>
          <div className="space-y-4">
            <h3 className="text-xl font-bold font-serif italic text-gray-300">Ethical Soul</h3>
            <p className="text-gray-400 leading-relaxed font-light">
              Made-to-order means zero waste. Our production facilities operate on 100% renewable energy and provide fair living wages.
            </p>
          </div>
        </div>
      </section>

      {/* Gallery / Social Proof */}
      <section id="gallery" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-end mb-16">
            <div>
              <h2 className="text-4xl font-serif font-bold text-black mb-2">The 11ven Gallery</h2>
              <p className="text-gray-600">Curated community designs that defy convention.</p>
            </div>
            <button className="text-black font-bold hover:underline">Explore More</button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="aspect-[3/4] overflow-hidden rounded-2xl bg-gray-200">
              <img src="https://picsum.photos/seed/eleven1/600/800" alt="Design 1" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" />
            </div>
            <div className="aspect-[3/4] overflow-hidden rounded-2xl bg-gray-200 mt-12">
              <img src="https://picsum.photos/seed/eleven2/600/800" alt="Design 2" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" />
            </div>
            <div className="aspect-[3/4] overflow-hidden rounded-2xl bg-gray-200">
              <img src="https://picsum.photos/seed/eleven3/600/800" alt="Design 3" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" />
            </div>
            <div className="aspect-[3/4] overflow-hidden rounded-2xl bg-gray-200 mt-12">
              <img src="https://picsum.photos/seed/eleven4/600/800" alt="Design 4" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 bg-black text-white border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-start mb-16 space-y-12 md:space-y-0">
            <div className="space-y-6">
              <div className="text-3xl font-bold font-serif tracking-widest text-white">11VEN</div>
              <p className="max-w-xs text-gray-400 text-sm">
                Redefining personal style through high-end craftsmanship and artificial intelligence.
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-12 md:gap-24">
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-widest text-white">Brand</h4>
                <ul className="space-y-2 text-gray-400 text-sm">
                  <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Sustainability</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Press</a></li>
                </ul>
              </div>
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-widest text-white">Support</h4>
                <ul className="space-y-2 text-gray-400 text-sm">
                  <li><a href="#" className="hover:text-white transition-colors">Sizing Guide</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Shipping</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                </ul>
              </div>
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-widest text-white">Social</h4>
                <ul className="space-y-2 text-gray-400 text-sm">
                  <li><a href="#" className="hover:text-white transition-colors">Instagram</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Pinterest</a></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-gray-800 text-[10px] text-gray-500 font-bold uppercase tracking-widest">
            <p>© 2024 11VEN Bespoke Apparel. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="hover:text-white">Privacy Policy</a>
              <a href="#" className="hover:text-white">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
