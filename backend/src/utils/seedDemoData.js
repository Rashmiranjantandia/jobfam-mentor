/**
 * seedDemoData.js — OPTIONAL standalone seed script for the deployed demo.
 *
 * Usage (run manually from the backend/ directory):
 *   node src/utils/seedDemoData.js
 *
 * SAFETY RULES:
 *   - NEVER runs automatically at server startup.
 *   - NEVER deletes or drops any existing data.
 *   - Checks for existing emails before inserting — safe to run multiple times.
 *   - Creates realistic but clearly fictional demo personas.
 *   - All open slots are set 14-90 days into the future.
 *
 * After running, share these credentials with the client for the demo:
 *
 *   Mentors    (they can log in and approve/decline bookings):
 *     sarah.mitchell@demo.jobfam.example    / DemoMentor2026!
 *     vishal.mallik@demo.jobfam.example     / DemoMentor2026!
 *     nandini.sahoo@demo.jobfam.example     / DemoMentor2026!
 *     james.okeefe@demo.jobfam.example      / DemoMentor2026!
 *     priya.sharma@demo.jobfam.example      / DemoMentor2026!
 *
 *   Candidates (they can browse and book):
 *     alex.chen@demo.jobfam.example         / DemoCandidate2026!
 *     aisha.patel@demo.jobfam.example       / DemoCandidate2026!
 */

'use strict';

require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const mongoose = require('mongoose');
const User     = require('../models/User');
const Slot     = require('../models/Slot');

// ── Helper ────────────────────────────────────────────────────────────────────
/** Returns a Date that is `daysFromNow` days ahead of today, at the given hour/minute UTC */
const futureDate = (daysFromNow, hour = 10, minute = 0) => {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + daysFromNow);
  d.setUTCHours(hour, minute, 0, 0);
  return d;
};

// ── Demo data ─────────────────────────────────────────────────────────────────
const MENTORS = [
  {
    name: 'Sarah Mitchell',
    email: 'sarah.mitchell@demo.jobfam.example',
    password: 'DemoMentor2026!',
    role: 'mentor',
    bio: 'Senior Frontend Engineer with 9 years of experience building scalable React applications at fast-growing startups. Passionate about clean architecture, accessibility, and growing junior engineers.',
    expertiseTags: ['React', 'TypeScript', 'Next.js', 'CSS', 'Accessibility'],
    slots: [
      { start: futureDate(14, 10, 0), end: futureDate(14, 10, 45) },
      { start: futureDate(21, 14, 0), end: futureDate(21, 14, 45) },
      { start: futureDate(28, 10, 0), end: futureDate(28, 10, 45) },
    ],
  },
  {
    name: 'Vishal Mallik',
    email: 'vishal.mallik@demo.jobfam.example',
    password: 'DemoMentor2026!',
    role: 'mentor',
    bio: 'Full-Stack Software Engineer specialising in Node.js and distributed systems. Previously led backend teams at two Series B companies. Enjoys helping engineers level up in system design interviews.',
    expertiseTags: ['Node.js', 'Express', 'MongoDB', 'System Design', 'AWS'],
    slots: [
      { start: futureDate(15, 9, 0),  end: futureDate(15, 9, 30)  },
      { start: futureDate(22, 11, 0), end: futureDate(22, 11, 30) },
      { start: futureDate(29, 16, 0), end: futureDate(29, 16, 30) },
    ],
  },
  {
    name: 'Nandini Sahoo',
    email: 'nandini.sahoo@demo.jobfam.example',
    password: 'DemoMentor2026!',
    role: 'mentor',
    bio: 'Product Engineer turned Engineering Manager. 8 years in UX-focused engineering. Mentors engineers looking to move from IC to EM or to break into product-led engineering roles.',
    expertiseTags: ['JavaScript', 'React', 'UX Engineering', 'Leadership', 'Career Growth'],
    slots: [
      { start: futureDate(16, 12, 0), end: futureDate(16, 12, 45) },
      { start: futureDate(23, 15, 0), end: futureDate(23, 15, 45) },
    ],
  },
  {
    name: 'James O\'Keefe',
    email: 'james.okeefe@demo.jobfam.example',
    password: 'DemoMentor2026!',
    role: 'mentor',
    bio: 'Principal Data Engineer at a UK fintech. 11 years of experience in building data pipelines, analytics platforms, and advising on data strategy. Based in London.',
    expertiseTags: ['Python', 'SQL', 'Data Engineering', 'Spark', 'dbt'],
    slots: [
      { start: futureDate(17, 10, 30), end: futureDate(17, 11, 0) },
      { start: futureDate(24, 13, 30), end: futureDate(24, 14, 0) },
      { start: futureDate(31, 10, 30), end: futureDate(31, 11, 0) },
    ],
  },
  {
    name: 'Priya Sharma',
    email: 'priya.sharma@demo.jobfam.example',
    password: 'DemoMentor2026!',
    role: 'mentor',
    bio: 'DevOps & Cloud Architect with 10 years of experience on GCP and AWS. Specialises in CI/CD, containerisation, and helping early-career engineers transition into platform or SRE roles.',
    expertiseTags: ['DevOps', 'GCP', 'Docker', 'Kubernetes', 'CI/CD'],
    slots: [
      { start: futureDate(18, 8, 0),  end: futureDate(18, 8, 45)  },
      { start: futureDate(25, 17, 0), end: futureDate(25, 17, 45) },
    ],
  },
];

const CANDIDATES = [
  {
    name: 'Alex Chen',
    email: 'alex.chen@demo.jobfam.example',
    password: 'DemoCandidate2026!',
    role: 'candidate',
    bio: 'Junior software engineer with 1 year of experience, looking to grow in full-stack development.',
    skills: ['JavaScript', 'React', 'Node.js'],
  },
  {
    name: 'Aisha Patel',
    email: 'aisha.patel@demo.jobfam.example',
    password: 'DemoCandidate2026!',
    role: 'candidate',
    bio: 'Recent Computer Science graduate seeking guidance on breaking into the data engineering field.',
    skills: ['Python', 'SQL', 'Data Analysis'],
  },
];

// ── Main ──────────────────────────────────────────────────────────────────────
const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅  MongoDB connected:', mongoose.connection.host);

    let mentorsCreated   = 0;
    let candidatesCreated = 0;
    let slotsCreated     = 0;

    // ── Create mentors + their open slots ────────────────────────────────────
    for (const m of MENTORS) {
      const exists = await User.findOne({ email: m.email });
      if (exists) {
        console.log(`⏭   Mentor already exists — skipping: ${m.email}`);
        continue;
      }

      const user = new User({
        name: m.name,
        email: m.email,
        passwordHash: m.password, // pre-save hook will hash this
        role: m.role,
        bio: m.bio,
        expertiseTags: m.expertiseTags,
      });
      await user.save();
      mentorsCreated++;
      console.log(`👤  Created mentor: ${m.name} (${m.email})`);

      // Create their open slots
      for (const s of m.slots) {
        await Slot.create({ mentorId: user._id, startTime: s.start, endTime: s.end, status: 'open' });
        slotsCreated++;
      }
      console.log(`📅  Created ${m.slots.length} open slots for ${m.name}`);
    }

    // ── Create candidates ──────────────────────────────────────────────────
    for (const c of CANDIDATES) {
      const exists = await User.findOne({ email: c.email });
      if (exists) {
        console.log(`⏭   Candidate already exists — skipping: ${c.email}`);
        continue;
      }

      const user = new User({
        name: c.name,
        email: c.email,
        passwordHash: c.password,
        role: c.role,
        bio: c.bio,
        skills: c.skills,
      });
      await user.save();
      candidatesCreated++;
      console.log(`👤  Created candidate: ${c.name} (${c.email})`);
    }

    // ── Summary ─────────────────────────────────────────────────────────────
    console.log('\n─────────────────────────────────────────────');
    console.log(`✅  Seed complete`);
    console.log(`    Mentors created   : ${mentorsCreated}`);
    console.log(`    Candidates created: ${candidatesCreated}`);
    console.log(`    Open slots created: ${slotsCreated}`);
    console.log('─────────────────────────────────────────────');
    console.log('\n  Demo credentials (Mentors):');
    console.log('  sarah.mitchell@demo.jobfam.example  / DemoMentor2026!');
    console.log('  vishal.mallik@demo.jobfam.example   / DemoMentor2026!');
    console.log('  nandini.sahoo@demo.jobfam.example   / DemoMentor2026!');
    console.log('  james.okeefe@demo.jobfam.example    / DemoMentor2026!');
    console.log('  priya.sharma@demo.jobfam.example    / DemoMentor2026!');
    console.log('\n  Demo credentials (Candidates):');
    console.log('  alex.chen@demo.jobfam.example       / DemoCandidate2026!');
    console.log('  aisha.patel@demo.jobfam.example     / DemoCandidate2026!');
    console.log('─────────────────────────────────────────────\n');

  } catch (err) {
    console.error('❌  Seed error:', err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB disconnected.');
  }
};

seed();
