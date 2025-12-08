import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-purple-500 selection:text-white overflow-x-hidden scroll-smooth">
      {/* --- Background Ambient Glows --- */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/30 rounded-full blur-[120px] mix-blend-screen animate-pulse" />
        <div className="absolute top-[20%] right-[-10%] w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px] mix-blend-screen" />
        <div className="absolute bottom-[-10%] left-[20%] w-[500px] h-[500px] bg-pink-600/20 rounded-full blur-[120px] mix-blend-screen" />
      </div>

      {/* --- Navbar (Glass) --- */}
      <header className="fixed top-0 w-full z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-4">
          <div className="bg-slate-900/50 backdrop-blur-md border border-white/10 rounded-full px-6 py-4 flex justify-between items-center shadow-lg shadow-purple-500/5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold">
                S
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                Supersheet
              </span>
            </div>
            
            <nav className="hidden md:flex space-x-8 text-sm font-medium">
              {['Features', 'Pricing', 'About'].map((item) => (
                <a 
                  key={item} 
                  href={`#${item.toLowerCase()}`} 
                  className="text-slate-300 hover:text-white transition-colors hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                >
                  {item}
                </a>
              ))}
            </nav>

            <Link href="/auth">
              <button className="hidden sm:block bg-white text-slate-900 px-5 py-2 rounded-full font-semibold hover:bg-slate-200 transition-all text-sm">
                Sign In
              </button>
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10 pt-32 pb-20">
        
        {/* --- Hero Section --- */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-purple-300 mb-8 backdrop-blur-sm">
            <span className="flex h-2 w-2 rounded-full bg-purple-500 animate-pulse"></span>
            v2.0 is now live
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-slate-500">
            Data superpowers <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
              for your team
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            The ultimate spreadsheet solution that transforms how you work. 
            Automate workflows, visualize data, and collaborate in real-time.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-20">
            <Link href="/auth" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold py-4 px-8 rounded-full text-lg transition-all duration-300 shadow-[0_0_40px_rgba(79,70,229,0.4)] hover:shadow-[0_0_60px_rgba(79,70,229,0.6)] hover:-translate-y-1">
                Get Started Free
              </button>
            </Link>
            <button className="w-full sm:w-auto px-8 py-4 rounded-full font-semibold text-white border border-white/20 hover:bg-white/10 backdrop-blur-sm transition-all duration-300 flex items-center justify-center gap-2 group">
              <span>Watch Demo</span>
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* --- CSS 3D Mockup Interface (No Images needed) --- */}
          <div className="relative mx-auto max-w-5xl mt-12 perspective-1000">
            <div className="relative rounded-xl bg-slate-900/80 border border-white/10 backdrop-blur-xl shadow-2xl overflow-hidden transform rotate-x-12 hover:rotate-x-0 transition-transform duration-700 ease-out p-2">
              {/* Window Controls */}
              <div className="absolute top-0 left-0 right-0 h-10 bg-white/5 border-b border-white/5 flex items-center px-4 gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
              </div>
              
              {/* Mock Spreadsheet Grid */}
              <div className="mt-10 grid grid-cols-5 gap-px bg-slate-800 border border-slate-700/50">
                 {/* Header Row */}
                 {['Name', 'Status', 'Revenue', 'Growth', 'Team'].map((head, i) => (
                   <div key={i} className="bg-slate-900/50 p-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">{head}</div>
                 ))}
                 
                 {/* Data Rows (Mock) */}
                 {[...Array(6)].map((_, rowIdx) => (
                   <>
                    <div className="bg-slate-900/30 p-4 text-sm text-slate-300 font-medium">Project {String.fromCharCode(65 + rowIdx)}</div>
                    <div className="bg-slate-900/30 p-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${rowIdx % 2 === 0 ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'}`}>
                        {rowIdx % 2 === 0 ? 'Active' : 'Pending'}
                      </span>
                    </div>
                    <div className="bg-slate-900/30 p-4 text-sm text-slate-300">${(Math.random() * 10000).toFixed(2)}</div>
                    <div className="bg-slate-900/30 p-4">
                       <div className="h-1.5 w-full bg-slate-700 rounded-full overflow-hidden">
                         <div className="h-full bg-blue-500 rounded-full" style={{width: `${Math.random() * 100}%`}}></div>
                       </div>
                    </div>
                    <div className="bg-slate-900/30 p-4 flex -space-x-2">
                      <div className="w-6 h-6 rounded-full bg-purple-500 border border-slate-900"></div>
                      <div className="w-6 h-6 rounded-full bg-pink-500 border border-slate-900"></div>
                    </div>
                   </>
                 ))}
              </div>
              
              {/* Overlay Gradient for Fade effect */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-40"></div>
            </div>
            
            {/* Glow under the image */}
            <div className="absolute -bottom-10 inset-x-10 h-20 bg-blue-600/30 blur-[60px] -z-10 rounded-[100%]"></div>
          </div>
        </div>

        {/* --- Social Proof --- */}
        <div className="mt-24 py-10 border-y border-white/5 bg-white/[0.02]">
          <p className="text-center text-sm text-slate-500 mb-8 font-medium tracking-widest uppercase">Trusted by modern teams</p>
          <div className="flex flex-wrap justify-center gap-12 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
             {/* Simple Text Logos for demo purposes */}
             {['Acme Corp', 'GlobalBank', 'Nebula', 'SaaS Way', 'FutureTech'].map(brand => (
               <span key={brand} className="text-xl font-bold text-white">{brand}</span>
             ))}
          </div>
        </div>

        {/* --- Features Section --- */}
        <div id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              Why Choose Supersheet?
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Built for speed, designed for collaboration. Experience the next generation of spreadsheet technology.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group relative p-8 rounded-3xl bg-slate-900/40 border border-white/10 hover:border-blue-500/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)] backdrop-blur-sm overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="w-14 h-14 bg-slate-800 rounded-2xl flex items-center justify-center mb-6 text-blue-400 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-3 relative z-10">Lightning Fast</h3>
              <p className="text-slate-400 relative z-10">
                Process millions of rows in seconds. Our WASM-powered engine delivers native app performance in the browser.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group relative p-8 rounded-3xl bg-slate-900/40 border border-white/10 hover:border-green-500/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(34,197,94,0.15)] backdrop-blur-sm overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-br from-green-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="w-14 h-14 bg-slate-800 rounded-2xl flex items-center justify-center mb-6 text-green-400 group-hover:scale-110 group-hover:bg-green-600 group-hover:text-white transition-all duration-300">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-3 relative z-10">Real-time Sync</h3>
              <p className="text-slate-400 relative z-10">
                Collaborate seamlessly. See cursors, comments, and edits as they happen without any conflict.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group relative p-8 rounded-3xl bg-slate-900/40 border border-white/10 hover:border-purple-500/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(168,85,247,0.15)] backdrop-blur-sm overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="w-14 h-14 bg-slate-800 rounded-2xl flex items-center justify-center mb-6 text-purple-400 group-hover:scale-110 group-hover:bg-purple-600 group-hover:text-white transition-all duration-300">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-3 relative z-10">AI Insights</h3>
              <p className="text-slate-400 relative z-10">
                Ask questions about your data in plain English. Generate charts and pivot tables instantly with AI.
              </p>
            </div>
          </div>
        </div>

        {/* --- Big CTA Section --- */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-blue-900/50 to-purple-900/50 border border-white/10 p-12 text-center">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white relative z-10">Ready to boost your productivity?</h2>
                <p className="text-lg text-slate-300 mb-8 max-w-2xl mx-auto relative z-10">Join thousands of teams who have switched to Supersheet for better data management.</p>
                <div className="relative z-10">
                     <Link href="/auth">
                        <button className="bg-white text-slate-900 hover:bg-slate-100 font-bold py-4 px-10 rounded-full text-lg transition-all shadow-xl hover:shadow-2xl hover:scale-105">
                            Start for free today
                        </button>
                    </Link>
                </div>
            </div>
        </div>
      </main>

      {/* --- Footer --- */}
      <footer className="border-t border-white/10 bg-slate-900/50 backdrop-blur-lg mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-gradient-to-tr from-blue-500 to-purple-500 rounded flex items-center justify-center text-white text-xs font-bold">S</div>
                <div className="text-slate-400 text-sm">
                © 2025 Supersheet.
                </div>
            </div>
            
            <div className="flex space-x-8 text-sm font-medium text-slate-400">
              <a href="#privacy" className="hover:text-white transition-colors">Privacy</a>
              <a href="#terms" className="hover:text-white transition-colors">Terms</a>
              <a href="#contact" className="hover:text-white transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
