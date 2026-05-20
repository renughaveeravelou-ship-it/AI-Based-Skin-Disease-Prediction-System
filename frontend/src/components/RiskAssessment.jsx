import React, { useState } from 'react';
import { ShieldAlert, CheckCircle, ChevronRight, HelpCircle } from 'lucide-react';

const QUESTIONS = [
  {
    id: 1,
    text: "What is the color of your eyes in natural sunlight?",
    options: [
      { score: 0, label: "Light blue, light gray, or light green" },
      { score: 1, label: "Blue, gray, or green" },
      { score: 2, label: "Dark gray, hazel, or light brown" },
      { score: 3, label: "Dark brown" },
      { score: 4, label: "Black or brownish black" }
    ]
  },
  {
    id: 2,
    text: "What is your natural, unexposed hair color?",
    options: [
      { score: 0, label: "Red or bright ginger" },
      { score: 1, label: "Blonde / Sandy blonde" },
      { score: 2, label: "Dark blonde, chestnut, or light brown" },
      { score: 3, label: "Dark brown" },
      { score: 4, label: "Jet black" }
    ]
  },
  {
    id: 3,
    text: "What is the color of your skin in unexposed areas (like upper arm)?",
    options: [
      { score: 0, label: "Very pale, reddish, or fair" },
      { score: 1, label: "Fair or pale-beige" },
      { score: 2, label: "Olive or light-tanned" },
      { score: 3, label: "Medium brown" },
      { score: 4, label: "Dark brown or black" }
    ]
  },
  {
    id: 4,
    text: "What happens when you are exposed to direct sunlight for 30 minutes without SPF?",
    options: [
      { score: 0, label: "Always burn, blister, and peel immediately (never tan)" },
      { score: 1, label: "Usually burn and peel, tans only with extreme difficulty" },
      { score: 2, label: "Sometime burns, tans moderately and evenly" },
      { score: 3, label: "Rarely burns, tans easily and deeply" },
      { score: 4, label: "Never burns, skin is naturally pigmented" }
    ]
  },
  {
    id: 5,
    text: "How many freckles or moles do you notice on your body?",
    options: [
      { score: 0, label: "Many freckles and highly atypical irregular moles" },
      { score: 1, label: "Several freckles and scattered moles" },
      { score: 2, label: "A few freckles or small circular moles" },
      { score: 3, label: "Virtually no freckles and less than 5 moles" },
      { score: 4, label: "None at all" }
    ]
  }
];

export default function RiskAssessment() {
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);

  const handleSelect = (qId, score) => {
    setAnswers(prev => ({
      ...prev,
      [qId]: score
    }));
  };

  const calculateScore = () => {
    const answeredCount = Object.keys(answers).length;
    if (answeredCount < QUESTIONS.length) {
      alert("Please answer all 5 questions to calculate your risk assessment.");
      return;
    }

    let totalScore = 0;
    Object.values(answers).forEach(val => totalScore += val);

    // Map to Fitzpatrick Type
    let type = "";
    let risk = "";
    let advice = [];
    
    if (totalScore <= 4) {
      type = "Fitzpatrick Type I";
      risk = "Extreme High Risk";
      advice = [
        "Highly prone to severe sunburns, blistering, and photoaging.",
        "Crucial to apply broad-spectrum SPF 50+ mineral sunscreen daily.",
        "Wear UV-blocking sunglasses and wide-brimmed hats.",
        "Schedule professional dermatological screenings every 6 months."
      ];
    } else if (totalScore <= 8) {
      type = "Fitzpatrick Type II";
      risk = "High Risk";
      advice = [
        "High risk of sunburns, photoaging, and actinic keratosis.",
        "Apply broad-spectrum SPF 30+ daily, and reapply every 2 hours.",
        "Limit direct sun exposure between 10 AM and 4 PM.",
        "Conduct monthly self-examinations of moles."
      ];
    } else if (totalScore <= 12) {
      type = "Fitzpatrick Type III";
      risk = "Moderate Risk";
      advice = [
        "May burn occasionally, but tans gradually.",
        "Use SPF 30+ sunscreen during outdoor activities.",
        "Stay hydrated and apply moisturizers after sun exposure.",
        "Consult a dermatologist if you notice evolving moles."
      ];
    } else if (totalScore <= 16) {
      type = "Fitzpatrick Type IV / V";
      risk = "Low Risk";
      advice = [
        "Rarely burns, tans easily and naturally.",
        "SPF 15+ or 30+ is still recommended to prevent hyperpigmentation.",
        "Use light non-comedogenic hydration moisturizers.",
        "Focus on protecting the skin barrier from dry elements."
      ];
    } else {
      type = "Fitzpatrick Type VI";
      risk = "Very Low Risk";
      advice = [
        "Naturally highly pigmented skin, highly resistant to UV burns.",
        "Sunscreen is still beneficial to prevent uneven skin tones.",
        "Use standard barrier recovery creams containing ceramides.",
        "Routine checkups for general epidermal health."
      ];
    }

    setResult({
      score: totalScore,
      type,
      risk,
      advice
    });
  };

  const resetQuiz = () => {
    setAnswers({});
    setResult(null);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-16 md:pb-0">
      {/* Header */}
      <div>
        <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white">Skin Risk Assessment</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Calculate your Fitzpatrick phototype rating and sun-burn susceptibility.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Questions */}
        <div className="lg:col-span-7 space-y-6">
          <div className="glass-panel p-5 space-y-6">
            <div className="flex items-center gap-2 border-b border-slate-200 dark:border-[#1f293d] pb-3">
              <HelpCircle size={18} className="text-indigo-600 dark:text-indigo-400" />
              <h4 className="font-extrabold text-slate-800 dark:text-white">Fitzpatrick Questionnaire</h4>
            </div>

            <div className="space-y-6">
              {QUESTIONS.map((q) => (
                <div key={q.id} className="space-y-3">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {q.id}. {q.text}
                  </p>
                  <div className="grid grid-cols-1 gap-2">
                    {q.options.map((opt, oIdx) => {
                      const isSelected = answers[q.id] === opt.score;
                      return (
                        <button
                          key={oIdx}
                          onClick={() => handleSelect(q.id, opt.score)}
                          className={`w-full p-3 rounded-xl border text-left text-xs font-semibold transition-all ${
                            isSelected
                              ? 'bg-indigo-600 border-transparent text-white shadow-lg shadow-indigo-600/10'
                              : 'bg-slate-50 dark:bg-slate-800/20 border-slate-200 dark:border-[#1f293d] text-slate-650 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/40'
                          }`}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {!result && (
              <button
                onClick={calculateScore}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black shadow-lg transition-all border border-indigo-400/20"
              >
                Compile Risk Assessment
              </button>
            )}
          </div>
        </div>

        {/* Right: Results */}
        <div className="lg:col-span-5">
          {result ? (
            <div className="glass-panel p-5 space-y-5 animate-scale-up border-indigo-500/20">
              <div className="flex items-center gap-2 border-b border-slate-200 dark:border-[#1f293d] pb-3 text-emerald-500 dark:text-emerald-400">
                <CheckCircle size={18} />
                <h4 className="font-extrabold text-slate-800 dark:text-white">Assessment Computed</h4>
              </div>

              <div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-black tracking-wider">Classification</p>
                <h3 className="text-xl font-black text-slate-900 dark:text-white mt-0.5">{result.type}</h3>
              </div>

              <div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-black tracking-wider">UV Susceptibility Risk</p>
                <span className={`inline-block text-[10px] font-black border rounded-full px-2.5 py-1 uppercase mt-1 tracking-wider ${
                  result.risk.includes("Extreme") || result.risk.includes("High")
                    ? 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400'
                    : result.risk.includes("Moderate")
                    ? 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400'
                    : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                }`}>
                  {result.risk}
                </span>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-black tracking-wider">Preventive Recommendations</p>
                {result.advice.map((adv, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 leading-normal">
                    <ChevronRight size={14} className="text-indigo-650 dark:text-indigo-400 shrink-0 mt-0.5" />
                    <span>{adv}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={resetQuiz}
                className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-[#1f293d] text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-xs font-bold transition-all"
              >
                Reset Questionnaire
              </button>
            </div>
          ) : (
            <div className="glass-panel p-5 text-center flex flex-col items-center justify-center py-12">
              <ShieldAlert size={36} className="text-slate-400 dark:text-slate-600 mb-2 animate-pulse" />
              <h5 className="font-extrabold text-slate-800 dark:text-white text-sm">Awaiting Responses</h5>
              <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 max-w-[220px]">
                Complete the Fitzpatrick survey on the left to compile your personal dermatological risk analysis.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
