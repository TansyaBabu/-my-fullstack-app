import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const features = [
  {
    title: 'Excel Uploads',
    desc: 'Upload and manage your Excel files securely in the cloud.',
    icon: (
      <svg className="w-8 h-8 text-teal-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" /></svg>
    ),
  },
  {
    title: 'Data Visualization',
    desc: 'Create beautiful charts and graphs from your data in seconds.',
    icon: (
      <svg className="w-8 h-8 text-cyan-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11 17a2 2 0 104 0v-6a2 2 0 10-4 0v6zm-7 4a2 2 0 002-2v-4a2 2 0 10-4 0v4a2 2 0 002 2zm14-2a2 2 0 002-2v-8a2 2 0 10-4 0v8a2 2 0 002 2z" /></svg>
    ),
  },
  {
    title: 'AI Insights',
    desc: 'Get smart summaries and insights powered by AI for your spreadsheets.',
    icon: (
      <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m4 0h-1v4h-1m-4 0h-1v-4h-1" /></svg>
    ),
  },
  {
    title: 'Admin Controls',
    desc: 'Admins can manage users, files, and monitor system health easily.',
    icon: (
      <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
    ),
  },
];

const testimonials = [
  {
    name: 'Priya S.',
    role: 'Business Analyst',
    quote: 'ExcelVerse made it so easy to upload and visualize my sales data. The AI insights are a game changer!',
    avatar: 'https://randomuser.me/api/portraits/women/68.jpg'
  },
  {
    name: 'Rahul M.',
    role: 'Operations Manager',
    quote: "The admin controls let me manage my team's files and users effortlessly. Highly recommended!",
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg'
  },
  {
    name: 'Aisha K.',
    role: 'Data Scientist',
    quote: 'I love how quickly I can turn Excel sheets into beautiful charts. ExcelVerse saves me hours every week.',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg'
  },
];

const HomePage = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.user);

  return (
    <div className="relative min-h-screen flex flex-col justify-between items-center overflow-x-hidden">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-teal-400 via-cyan-200 to-blue-300 animate-gradient-x" />

      {/* Hero Card */}
      <div className="relative z-10 w-full flex flex-col items-center pt-24 pb-10">
        <div className="backdrop-blur-lg bg-white/60 border border-white/30 shadow-2xl rounded-3xl px-8 py-12 max-w-2xl w-full text-center mx-auto">
          {/* Logo */}
          <div className="mb-6 flex justify-center">
            <span className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-teal-100 shadow-lg">
              <svg className="w-12 h-12" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="48" height="48" rx="12" fill="#14b8a6"/>
                <path d="M14 34L34 14M14 14l20 20" stroke="#fff" strokeWidth="3" strokeLinecap="round"/>
                <rect x="10" y="10" width="28" height="28" rx="6" stroke="#fff" strokeWidth="2"/>
              </svg>
            </span>
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-teal-700 mb-4 drop-shadow-lg">Welcome to <span className="text-blue-600">ExcelVerse</span></h1>
          <p className="text-xl md:text-2xl text-gray-700 mb-8">Analyze, visualize, and manage your Excel data with ease. Secure, powerful, and built for you.</p>
          <div className="flex flex-col md:flex-row justify-center items-center gap-6 mb-4">
            <button
              className="bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white font-bold py-3 px-10 rounded-xl text-lg shadow-xl transition transform hover:scale-105"
              onClick={() => navigate('/login')}
            >
              Login
            </button>
            <button
              className="bg-white border-2 border-teal-500 text-teal-700 hover:bg-teal-50 font-bold py-3 px-10 rounded-xl text-lg shadow-xl transition transform hover:scale-105"
              onClick={() => navigate('/register')}
            >
              Register
            </button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative z-10 w-full max-w-5xl mx-auto mt-12 mb-20">
        <h2 className="text-2xl font-bold text-teal-700 text-center mb-8">Why ExcelVerse?</h2>
        <div className="flex flex-row md:grid md:grid-cols-4 gap-6 overflow-x-auto px-2 md:px-0">
          {features.map((f, idx) => (
            <div key={idx} className="bg-white/80 rounded-2xl shadow-md p-6 flex flex-col items-center min-w-[220px] hover:shadow-xl transition">
              <div>{f.icon}</div>
              <h3 className="text-lg font-bold text-teal-800 mt-3 mb-1">{f.title}</h3>
              <p className="text-gray-600 text-center">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="relative z-10 w-full max-w-5xl mx-auto mb-20">
        <h2 className="text-2xl font-bold text-cyan-700 text-center mb-8">What Our Users Say</h2>
        <div className="flex flex-row gap-8 overflow-x-auto px-2 md:px-0">
          {testimonials.map((t, idx) => (
            <div key={idx} className="bg-white/80 rounded-2xl shadow-md p-6 flex flex-col items-center min-w-[320px] hover:shadow-xl transition">
              <img src={t.avatar} alt={t.name} className="w-16 h-16 rounded-full mb-3 border-4 border-teal-100 shadow" />
              <svg className="w-8 h-8 text-cyan-400 mb-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7 17a4 4 0 01-4-4V7a4 4 0 014-4h2a4 4 0 014 4v6a4 4 0 01-4 4zm10 0a4 4 0 01-4-4V7a4 4 0 014-4h2a4 4 0 014 4v6a4 4 0 01-4 4z" /></svg>
              <p className="text-gray-700 italic mb-4 text-center">"{t.quote}"</p>
              <div className="font-bold text-teal-700">{t.name}</div>
              <div className="text-xs text-gray-500">{t.role}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Video Section */}
      <div className="relative z-10 w-full max-w-3xl mx-auto mb-20">
        <h2 className="text-2xl font-bold text-emerald-700 text-center mb-8">See ExcelVerse in Action</h2>
        <div className="relative aspect-w-16 aspect-h-9 rounded-2xl overflow-hidden shadow-2xl">
          <iframe
            src="https://www.youtube.com/embed/dQw4w9WgXcQ"
            title="ExcelVerse Demo Video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          ></iframe>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <svg className="w-24 h-24 text-white/80" fill="currentColor" viewBox="0 0 84 84">
              <circle cx="42" cy="42" r="42" fill="currentColor" opacity="0.2"/>
              <polygon points="34,28 60,42 34,56" fill="white"/>
            </svg>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 w-full text-center py-8 text-gray-400 text-sm border-t border-gray-100 bg-white/60 backdrop-blur">
        &copy; {new Date().getFullYear()} ExcelVerse. All rights reserved. | Contact: <a href="mailto:support@excelverse.com" className="underline hover:text-teal-600">support@excelverse.com</a>
      </footer>
    </div>
  );
};

export default HomePage; 