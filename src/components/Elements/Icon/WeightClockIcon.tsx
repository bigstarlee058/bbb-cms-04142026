import React from "react";
import { CiDumbbell, CiClock1  } from "react-icons/ci";

export default function WeightClockIcon() {
  return (
    <div className="relative inline-block w-10 h-10">
      <CiClock1 className="absolute left-[-10px] top-[-7px] left-0 text-white w-full h-full scale-50" />
      <CiDumbbell className="absolute left-[-4px] bottom-[-7px] left-0 text-white w-full h-full scale-50" />
    </div>
  );
}