import React from 'react';

/**
 * Komponen Footer Layout
 * Menampilkan hak cipta dan kredensial STMIK Bandung.
 */
export const Footer = () => {
  return (
    <footer className="py-6 px-8 text-center text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200/60 dark:border-slate-800/60 mt-auto">
      <p>© {new Date().getFullYear()} STMIK Bandung. Fullstack Capstone Project Perwalian Academic Enterprise System.</p>
    </footer>
  );
};
