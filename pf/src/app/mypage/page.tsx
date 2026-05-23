"use client";

import { useState } from "react";
export default function myPage() {
  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="mx-auto w-full max-w-md md:max-w-2xl">
        <h1 className="text-2xl font-bold text-slate-800 mb-6">マイページ</h1>
        <p className="text-slate-600">1ヶ月以内に暗唱した数：</p>
        <p className="text-slate-600">これまでに暗唱した数：</p>
        
      </div>
    </div>
  );
}
