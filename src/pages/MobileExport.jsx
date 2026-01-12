import React from 'react';
import { Smartphone } from 'lucide-react';
export default function MobileExport() {
    return (
        <div className="text-white font-['Outfit']">
            <div className="flex items-center gap-3 mb-8"><Smartphone className="text-blue-400" /><h1 className="text-3xl font-black italic">MOBILE EXPORT</h1></div>
            <div className="grid grid-cols-2 gap-6">
                <div className="bg-[#0f172a] p-8 rounded-2xl border border-slate-800"><h3 className="font-bold mb-4">iOS (CoreML)</h3><button className="w-full py-2 bg-white text-black font-bold rounded-lg">Export Xcode</button></div>
                <div className="bg-[#0f172a] p-8 rounded-2xl border border-slate-800"><h3 className="font-bold mb-4">Android (TFLite)</h3><button className="w-full py-2 bg-[#3ddc84] text-black font-bold rounded-lg">Export Android</button></div>
            </div>
        </div>
    );
}