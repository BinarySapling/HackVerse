import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trophy, Users, Code, HelpCircle, ArrowRight } from 'lucide-react';
import Button from '../components/ui/Button';

const Landing = () => {
  return (
    <div className="flex flex-col gap-14 py-6">
      {/* Hero Section */}
      <section className="text-center flex flex-col items-center gap-6 max-w-4xl mx-auto py-10">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-4xl sm:text-5xl font-semibold tracking-tight text-secondary leading-tight"
        >
          Unleash Innovation with <span className="text-primary">HackVerse</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="text-base sm:text-lg text-slate-500 max-w-2xl"
        >
          Manage, register, build, and judge hackathons all in one clean, professional platform designed for academic innovation.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="flex gap-4"
        >
          <Link to="/hackathons">
            <Button variant="primary" size="lg" className="gap-2">
              Explore Hackathons <ArrowRight size={18} />
            </Button>
          </Link>
          <Link to="/signup">
            <Button variant="secondary" size="lg">
              Get Started
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-border p-6 rounded-lg shadow-sm flex flex-col gap-3">
          <div className="p-3 bg-teal-50 text-primary w-fit rounded-lg">
            <Trophy size={24} />
          </div>
          <h3 className="text-lg font-bold text-secondary">Dynamic Hackathons</h3>
          <p className="text-sm text-slate-500 leading-relaxed">
            Create, configure, and display live hackathons with clear dates, registration windows, constraints, and custom problem statements.
          </p>
        </div>

        <div className="bg-white border border-border p-6 rounded-lg shadow-sm flex flex-col gap-3">
          <div className="p-3 bg-hoverSurface text-secondary w-fit rounded-lg">
            <Users size={24} />
          </div>
          <h3 className="text-lg font-bold text-secondary">Team Collaboration</h3>
          <p className="text-sm text-slate-500 leading-relaxed">
            Form teams, invite peers, and manage project contributions securely under strict capacity guidelines.
          </p>
        </div>

        <div className="bg-white border border-border p-6 rounded-lg shadow-sm flex flex-col gap-3">
          <div className="p-3 bg-orange-50 text-warning w-fit rounded-lg">
            <Code size={24} />
          </div>
          <h3 className="text-lg font-bold text-secondary">Evaluations & Results</h3>
          <p className="text-sm text-slate-500 leading-relaxed">
            Assigned judges score submissions directly based on innovation, technology, and presentation. Ranks update dynamically.
          </p>
        </div>
      </section>

      {/* Process Section */}
      <section className="bg-white border border-border rounded-lg p-6 md:p-10 shadow-sm flex flex-col gap-8">
        <div className="text-center max-w-xl mx-auto">
          <h2 className="text-2xl font-bold text-secondary mb-2">How HackVerse Works</h2>
          <p className="text-sm text-slate-500">From setup to final rankings, the lifecycle of a hackathon made simple.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
          {[
            { step: '1', title: 'Setup', desc: 'Organizer creates event and sets timelines.' },
            { step: '2', title: 'Register', desc: 'Participants register and form teams.' },
            { step: '3', title: 'Submit', desc: 'Teams upload github repos and project demo links.' },
            { step: '4', title: 'Rank', desc: 'Judges score and dynamic leaderboard updates.' },
          ].map((item) => (
            <div key={item.step} className="flex flex-col items-center sm:items-start text-center sm:text-left gap-2">
              <span className="h-8 w-8 bg-teal-50 text-primary rounded-full flex items-center justify-center font-bold text-sm">
                {item.step}
              </span>
              <h4 className="font-semibold text-secondary">{item.title}</h4>
              <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="text-center border border-border grid grid-cols-2 md:grid-cols-4 gap-8 bg-hoverSurface rounded-lg p-6">
        {[
          { count: '10+', label: 'Active Hackathons' },
          { count: '500+', label: 'Innovators Registered' },
          { count: '120+', label: 'Projects Submitted' },
          { count: '25+', label: 'Expert Judges' },
        ].map((stat, idx) => (
          <div key={idx} className="flex flex-col gap-1">
            <span className="text-3xl font-extrabold text-primary">{stat.count}</span>
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">{stat.label}</span>
          </div>
        ))}
      </section>
    </div>
  );
};

export default Landing;
