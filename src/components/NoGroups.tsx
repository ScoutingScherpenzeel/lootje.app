"use client";

import { motion } from "motion/react";
import NewGroup from "./NewGroup";

export default function NoGroups() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative -rotate-1 transform overflow-hidden border-8 border-black bg-white p-16 text-center"
    >
      <div className="absolute top-4 right-4 text-6xl opacity-20">🎄</div>
      <div className="absolute bottom-4 left-4 text-5xl opacity-20">⛄</div>
      <div className="mx-auto mb-8 flex h-32 w-32 rotate-6 transform items-center justify-center border-4 border-green-700 bg-red-600">
        <span className="text-7xl">🎁</span>
      </div>
      <h3 className="mb-4 text-4xl font-black uppercase">
        Nog geen trekkingen
      </h3>
      <p className="mb-8 text-xl font-bold uppercase">
        Maak nu je eerste trekking!
      </p>
      <NewGroup />
    </motion.div>
  );
}
