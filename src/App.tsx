/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  motion, 
  AnimatePresence 
} from 'motion/react';
import { 
  Wallet, 
  Calendar, 
  CalendarDays, 
  Coins, 
  TrendingUp, 
  RotateCcw, 
  Calculator, 
  AlertCircle, 
  Sparkles, 
  Info, 
  PiggyBank,
  ChevronRight,
  TrendingDown
} from 'lucide-react';

// Vietnamese Numbers-to-Words Converter
function docSoVietNam(so: number): string {
  if (so === 0) return 'Không đồng';
  if (so < 0) return 'Không đồng (Số âm)';

  const mangSo = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];
  
  function docBlock3(n: number, isFirst: boolean): string {
    let tram = Math.floor(n / 100);
    let chuc = Math.floor((n % 100) / 10);
    let donvi = n % 10;
    let res = '';
    
    if (tram > 0 || !isFirst) {
      res += mangSo[tram] + ' trăm ';
    }
    
    if (chuc > 1) {
      res += mangSo[chuc] + ' mươi ';
    } else if (chuc === 1) {
      res += 'mười ';
    } else if (chuc === 0 && donvi > 0 && (tram > 0 || !isFirst)) {
      res += 'lẻ ';
    }
    
    if (donvi === 1 && chuc > 1) {
      res += 'mốt';
    } else if (donvi === 5 && chuc > 0) {
      res += 'lăm';
    } else if (donvi > 0) {
      res += mangSo[donvi];
    }
    
    return res.trim();
  }
  
  let str = '';
  const units = ['', ' nghìn', ' triệu', ' tỷ'];
  let temp = Math.round(so);
  const blocks: number[] = [];
  
  while (temp > 0) {
    blocks.push(temp % 1000);
    temp = Math.floor(temp / 1000);
  }
  
  for (let i = blocks.length - 1; i >= 0; i--) {
    const isFirst = (i === blocks.length - 1);
    const blockStr = docBlock3(blocks[i], isFirst);
    if (blockStr !== '') {
      str += ' ' + blockStr + units[i % 4];
      if (i > 0 && i % 4 === 0) {
        str += ' tỷ';
      }
    }
  }
  
  let output = str.trim();
  if (output) {
    output = output.charAt(0).toUpperCase() + output.slice(1) + ' đồng';
  } else {
    output = 'Không đồng';
  }
  
  return output.replace(/\s+/g, ' ');
}

// Format number to VND string e.g. 15.000.000 VNĐ
const formatVND = (value: number) => {
  return new Intl.NumberFormat('vi-VN').format(Math.round(value)) + ' VNĐ';
};

export default function App() {
  // Input states as strings for direct input formatting and easy clearing
  const [basicSalary, setBasicSalary] = useState<string>("0");
  const [standardDays, setStandardDays] = useState<string>("26");
  const [actualDays, setActualDays] = useState<string>("0");
  const [allowance, setAllowance] = useState<string>("0");
  const [revenue, setRevenue] = useState<string>("0");
  const [advance, setAdvance] = useState<string>("0");

  // Visual pulse trigger on calculate click
  const [pulseTrigger, setPulseTrigger] = useState<boolean>(false);
  const [showCalculationDetails, setShowCalculationDetails] = useState<boolean>(true);

  // Parse strings back to values safely
  const parseCurrency = (str: string): number => {
    const numericStr = str.replace(/\D/g, '');
    return numericStr ? parseInt(numericStr, 10) : 0;
  };

  const parseDays = (str: string): number => {
    const parsed = parseFloat(str);
    return isNaN(parsed) ? 0 : parsed;
  };

  const basicSalaryNum = parseCurrency(basicSalary);
  const standardDaysNum = parseDays(standardDays);
  const actualDaysNum = parseDays(actualDays);
  const allowanceNum = parseCurrency(allowance);
  const revenueNum = parseCurrency(revenue);
  const advanceNum = parseCurrency(advance);

  // Validations list
  const validationErrors: string[] = [];
  
  // Mandatory empty fields check
  if (!basicSalary) validationErrors.push("Lương cơ bản không được để trống.");
  if (!standardDays) validationErrors.push("Ngày công chuẩn không được để trống.");
  if (!actualDays) validationErrors.push("Ngày công thực tế không được để trống.");
  if (!allowance) validationErrors.push("Phụ cấp không được để trống. Hãy nhập 0 nếu không có.");
  if (!revenue) validationErrors.push("Doanh thu không được để trống. Hãy nhập 0 nếu không có.");
  if (!advance) validationErrors.push("Tiền ứng không được để trống. Hãy nhập 0 nếu không có.");

  // Numeric validity
  if (standardDaysNum <= 0) {
    validationErrors.push("Ngày công chuẩn của tháng phải lớn hơn 0.");
  }
  if (actualDaysNum > standardDaysNum) {
    validationErrors.push("Ngày công thực tế không được lớn hơn ngày công chuẩn.");
  }
  if (basicSalaryNum < 0 || allowanceNum < 0 || revenueNum < 0 || advanceNum < 0 || actualDaysNum < 0 || standardDaysNum < 0) {
    validationErrors.push("Không cho phép nhập giá trị số âm.");
  }

  // Calculate formulas
  const totalSalary = (standardDaysNum > 0 && actualDaysNum >= 0) 
    ? (basicSalaryNum / standardDaysNum) * actualDaysNum 
    : 0;

  const netSalary = totalSalary + allowanceNum + revenueNum - advanceNum;

  // Handle inputs change safely with thousand separators in real-time
  const handleCurrencyInput = (valStr: string, setter: (val: string) => void) => {
    // Keep only numbers
    const numericVal = valStr.replace(/\D/g, '');
    if (!numericVal) {
      setter('');
      return;
    }
    const parsed = parseInt(numericVal, 10);
    // Safe-guard to avoid overflow
    if (parsed > 999999999999) return;
    setter(new Intl.NumberFormat('vi-VN').format(parsed));
  };

  const handleDaysInput = (valStr: string, setter: (val: string) => void) => {
    // Keep only numbers and a single decimal point
    let cleaned = valStr.replace(/[^0-9.]/g, '');
    const parts = cleaned.split('.');
    if (parts.length > 2) {
      cleaned = `${parts[0]}.${parts.slice(1).join('')}`;
    }
    // Days can't realistically exceed 31
    const parsed = parseFloat(cleaned);
    if (!isNaN(parsed) && parsed > 31) {
      cleaned = "31";
    }
    setter(cleaned);
  };

  // Reset function back to clear state
  const handleReset = () => {
    setBasicSalary("0");
    setStandardDays("26");
    setActualDays("0");
    setAllowance("0");
    setRevenue("0");
    setAdvance("0");
    setPulseTrigger(false);
  };

  const triggerCalculateVisual = () => {
    setPulseTrigger(true);
    setTimeout(() => setPulseTrigger(false), 800);
    
    // Scroll to results on mobile devices automatically
    const resultsElement = document.getElementById('receipt-container');
    if (resultsElement) {
      resultsElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  // 20% savings rule calculation
  const suggestedSavings = netSalary > 0 ? Math.round(netSalary * 0.2) : 0;

  return (
    <div className="bg-gradient-to-br from-[#e0f2fe] via-[#ffffff] to-[#7dd3fc] min-h-screen font-sans antialiased text-slate-800 selection:bg-blue-200 selection:text-blue-900 py-6 md:py-12 px-4 flex flex-col justify-between">
      
      {/* Main Glass Layout Container */}
      <div className="max-w-6xl mx-auto w-full flex-grow flex flex-col justify-center" id="main-container">
        
        {/* Responsive Grid layout containing both panel inputs and visualizations */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch" id="app-grid">
          
          {/* LEFT COLUMN: INPUT FORM with Frosted Glass styling */}
          <motion.section 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-7 bg-white/60 backdrop-blur-xl border border-white/40 rounded-[40px] shadow-2xl p-6 md:p-10 flex flex-col justify-between" 
            id="inputs-panel"
          >
            <div>
              {/* Header inside the panel */}
              <div className="mb-8" id="inputs-header">
                <h1 className="text-2xl md:text-3xl font-black text-blue-900 tracking-tight flex items-center gap-3">
                  <span className="bg-blue-600 text-white p-2.5 rounded-2xl shadow-md shadow-blue-500/20 inline-flex items-center justify-center">
                    <Calculator className="w-6 h-6" />
                  </span>
                  TÍNH LƯƠNG CÁ NHÂN
                </h1>
                <p className="text-blue-600/70 font-medium mt-1">Công cụ tính thu nhập thực tế nhanh chóng, chuẩn xác</p>
              </div>

              {/* Input elements list */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6" id="input-fields-grid">
                
                {/* Lương cơ bản */}
                <div className="space-y-2">
                  <label htmlFor="basic-salary" className="text-xs md:text-sm font-bold text-blue-900 uppercase tracking-wider ml-1 flex items-center gap-1">
                    <span>Lương cơ bản (VNĐ)</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500 font-bold text-lg select-none">₫</span>
                    <input
                      id="basic-salary"
                      type="text"
                      inputMode="numeric"
                      value={basicSalary}
                      onChange={(e) => handleCurrencyInput(e.target.value, setBasicSalary)}
                      className="w-full bg-white/50 border border-blue-100 rounded-2xl py-3.5 pl-10 pr-4 text-lg font-semibold text-blue-900 focus:outline-hidden focus:ring-2 focus:ring-blue-400 focus:bg-white/85 transition-all shadow-xs"
                      placeholder="0"
                    />
                  </div>
                </div>

                {/* Phụ cấp */}
                <div className="space-y-2">
                  <label htmlFor="allowance" className="text-xs md:text-sm font-bold text-blue-900 uppercase tracking-wider ml-1">
                    Phụ cấp
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500 font-bold text-lg select-none">+</span>
                    <input
                      id="allowance"
                      type="text"
                      inputMode="numeric"
                      value={allowance}
                      onChange={(e) => handleCurrencyInput(e.target.value, setAllowance)}
                      className="w-full bg-white/50 border border-blue-100 rounded-2xl py-3.5 pl-10 pr-4 text-lg font-semibold text-blue-900 focus:outline-hidden focus:ring-2 focus:ring-blue-400 focus:bg-white/85 transition-all shadow-xs"
                      placeholder="Ăn trưa, đi lại..."
                    />
                  </div>
                </div>

                {/* Ngày công chuẩn */}
                <div className="space-y-2">
                  <label htmlFor="standard-days" className="text-xs md:text-sm font-bold text-blue-900 uppercase tracking-wider ml-1 flex items-center gap-1">
                    <span>Ngày công chuẩn</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg select-none">📅</span>
                    <input
                      id="standard-days"
                      type="text"
                      inputMode="decimal"
                      value={standardDays}
                      onChange={(e) => handleDaysInput(e.target.value, setStandardDays)}
                      className="w-full bg-white/50 border border-blue-100 rounded-2xl py-3.5 pl-11 pr-4 text-lg font-semibold text-blue-900 focus:outline-hidden focus:ring-2 focus:ring-blue-400 focus:bg-white/85 transition-all shadow-xs"
                      placeholder="26"
                    />
                  </div>
                </div>

                {/* Ngày công thực tế */}
                <div className="space-y-2">
                  <label htmlFor="actual-days" className="text-xs md:text-sm font-bold text-blue-900 uppercase tracking-wider ml-1 flex items-center gap-1">
                    <span>Ngày công thực tế</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg select-none">✅</span>
                    <input
                      id="actual-days"
                      type="text"
                      inputMode="decimal"
                      value={actualDays}
                      onChange={(e) => handleDaysInput(e.target.value, setActualDays)}
                      className="w-full bg-white/50 border border-blue-100 rounded-2xl py-3.5 pl-11 pr-4 text-lg font-semibold text-blue-900 focus:outline-hidden focus:ring-2 focus:ring-blue-400 focus:bg-white/85 transition-all shadow-xs"
                      placeholder="0"
                    />
                  </div>
                </div>

                {/* Doanh thu */}
                <div className="space-y-2">
                  <label htmlFor="revenue" className="text-xs md:text-sm font-bold text-blue-900 uppercase tracking-wider ml-1">
                    Doanh thu / Thưởng
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg select-none">🚀</span>
                    <input
                      id="revenue"
                      type="text"
                      inputMode="numeric"
                      value={revenue}
                      onChange={(e) => handleCurrencyInput(e.target.value, setRevenue)}
                      className="w-full bg-white/50 border border-blue-100 rounded-2xl py-3.5 pl-11 pr-4 text-lg font-semibold text-blue-900 focus:outline-hidden focus:ring-2 focus:ring-blue-400 focus:bg-white/85 transition-all shadow-xs"
                      placeholder="Hoa hồng doanh số..."
                    />
                  </div>
                </div>

                {/* Tiền tạm ứng */}
                <div className="space-y-2">
                  <label htmlFor="advance" className="text-xs md:text-sm font-bold text-blue-900 uppercase tracking-wider ml-1">
                    Tiền tạm ứng
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-red-500 font-bold text-lg select-none">−</span>
                    <input
                      id="advance"
                      type="text"
                      inputMode="numeric"
                      value={advance}
                      onChange={(e) => handleCurrencyInput(e.target.value, setAdvance)}
                      className="w-full bg-white/50 border border-blue-100 rounded-2xl py-3.5 pl-10 pr-4 text-lg font-semibold text-blue-900 focus:outline-hidden focus:ring-2 focus:ring-blue-400 focus:bg-white/85 transition-all shadow-xs"
                      placeholder="Tạm ứng trong tháng..."
                    />
                  </div>
                </div>

              </div>
            </div>

            {/* Form control buttons */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4" id="form-actions">
              <button
                type="button"
                onClick={triggerCalculateVisual}
                className="flex-grow bg-blue-600 hover:bg-blue-700 active:scale-97 text-white font-black py-4 px-6 rounded-2xl shadow-lg shadow-blue-200 transition-all uppercase tracking-widest cursor-pointer select-none text-center"
              >
                Tính Lương
              </button>
              
              <button
                type="button"
                onClick={handleReset}
                className="px-8 bg-white/80 text-blue-600 font-bold py-4 rounded-2xl border border-blue-100 hover:bg-white active:scale-97 transition-all uppercase tracking-widest cursor-pointer select-none text-center"
              >
                Làm mới
              </button>
            </div>
          </motion.section>

          {/* RIGHT COLUMN: RESULTS VISUALIZATION */}
          <aside className="lg:col-span-5 flex flex-col gap-6" id="receipt-container">
            <AnimatePresence mode="wait">
              {validationErrors.length > 0 ? (
                
                /* Errors List Box with nice frosted warnings */
                <motion.div
                  key="error-box"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white/60 backdrop-blur-xl border border-white/40 rounded-[40px] p-8 shadow-2xl flex flex-col items-center text-center space-y-4"
                  id="error-block"
                >
                  <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center text-red-600 shadow-sm">
                    <AlertCircle className="w-7 h-7" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-extrabold text-blue-950 text-xl">Dữ liệu chưa đúng</h3>
                    <p className="text-xs text-blue-800/60 font-semibold">Vui lòng điều chỉnh lại các lỗi nhập liệu dưới đây:</p>
                  </div>
                  <ul className="text-left w-full bg-red-50/50 border border-red-100 rounded-2xl p-4 space-y-2 text-xs font-semibold text-red-700 leading-relaxed">
                    {validationErrors.map((err, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-red-500 mt-0.5">•</span>
                        <span>{err}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="text-[10px] text-slate-400 font-medium">
                    Hệ thống sẽ tự động hiển thị kết quả ngay khi nhập đúng.
                  </div>
                </motion.div>

              ) : (

                /* Frosted Glass Result Details & dynamic saving tip card */
                <motion.div
                  key="receipt-box"
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col gap-6 h-full"
                >
                  {/* Summary Card */}
                  <motion.div 
                    animate={pulseTrigger ? { scale: [1, 1.02, 1] } : {}}
                    transition={{ duration: 0.4 }}
                    className="flex-grow bg-blue-900 text-white rounded-[40px] shadow-2xl p-8 flex flex-col justify-between min-h-[380px] relative overflow-hidden"
                    id="receipt-inner"
                  >
                    {/* Upper decorative ambient lighting light blue sphere */}
                    <div className="absolute -right-12 -top-12 w-32 h-32 rounded-full bg-blue-500/20 blur-2xl pointer-events-none"></div>
                    
                    <div>
                      <p className="text-blue-300 text-xs font-bold uppercase tracking-[0.2em] mb-2">Tổng quan thu nhập</p>
                      <h2 className="text-lg font-semibold opacity-90">Bảng tính tháng này</h2>
                    </div>

                    {/* Detailed calculation list */}
                    <div className="py-6 space-y-3.5">
                      <div className="flex items-center justify-between border-b border-blue-800/70 pb-3">
                        <span className="text-blue-200/90 text-sm">Lương ngày công ({actualDaysNum}/{standardDaysNum} công)</span>
                        <span className="font-mono font-semibold text-blue-50">{formatVND(totalSalary)}</span>
                      </div>
                      
                      <div className="flex items-center justify-between border-b border-blue-800/70 pb-3">
                        <span className="text-blue-200/90 text-sm">Cộng phụ cấp & thưởng</span>
                        <span className="font-mono font-semibold text-emerald-300">+{formatVND(allowanceNum + revenueNum)}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-blue-200/90 text-sm">Trừ tiền tạm ứng</span>
                        <span className="font-mono font-semibold text-red-300">-{formatVND(advanceNum)}</span>
                      </div>
                    </div>

                    {/* Main Total highlighting box */}
                    <div className="bg-white/10 rounded-3xl p-6 border border-white/10 backdrop-blur-xs">
                      <p className="text-blue-200 text-xs font-bold uppercase tracking-wider mb-1">Lương thực lãnh</p>
                      <p className="text-3xl md:text-4xl font-black tracking-tight text-white flex items-baseline gap-1.5 wrap-break">
                        {new Intl.NumberFormat('vi-VN').format(Math.round(netSalary))}
                        <span className="text-sm font-bold opacity-80 uppercase tracking-widest text-blue-200">VNĐ</span>
                      </p>
                    </div>

                    {/* Numbers into words description */}
                    <div className="mt-4 text-xs text-blue-200/80 leading-relaxed font-semibold">
                      <span className="text-[10px] text-blue-300 uppercase tracking-wider block font-bold mb-0.5">Bằng chữ</span>
                      <p className="text-white text-xs line-clamp-2 italic bg-blue-950/40 p-2.5 rounded-xl border border-blue-800/30">
                        {docSoVietNam(netSalary)}
                      </p>
                    </div>
                  </motion.div>

                  {/* Information Card - Dynamic Saving tip */}
                  <div className="bg-white/40 backdrop-blur-md border border-white/60 rounded-[40px] p-6 flex items-center gap-6" id="info-card">
                    <div className="w-16 h-16 bg-blue-100/90 rounded-full flex items-center justify-center text-3xl shrink-0 shadow-xs select-none">
                      💡
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-blue-900 text-sm md:text-base">Gợi ý phân bổ</h3>
                      <p className="text-xs md:text-sm text-blue-800/80 leading-relaxed font-medium">
                        {suggestedSavings > 0 ? (
                          <>Dựa trên mức thực lãnh, bạn nên trích lập ít nhất <strong className="text-blue-950 font-bold">{formatVND(suggestedSavings)}</strong> (20%) cho quỹ dự phòng khẩn cấp hoặc tích lũy đầu tư.</>
                        ) : (
                          <>Nhập các thông số ngày công & lương cơ bản hợp lệ để nhận phân bổ tài chính cá nhân tối ưu.</>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Toggle button to see calculation formula */}
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => setShowCalculationDetails(!showCalculationDetails)}
                      className="text-xs text-blue-900/60 hover:text-blue-900 transition font-bold inline-flex items-center gap-1 cursor-pointer select-none"
                    >
                      <span>{showCalculationDetails ? "Ẩn công thức tính chi tiết" : "Hiện công thức tính chi tiết"}</span>
                      <ChevronRight className={`w-3.5 h-3.5 transition duration-200 ${showCalculationDetails ? "rotate-90" : ""}`} />
                    </button>
                  </div>

                  {showCalculationDetails && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="bg-white/50 border border-blue-100 rounded-3xl p-5 text-xs text-blue-900/70 leading-relaxed font-semibold"
                    >
                      <div className="font-bold uppercase text-[10px] text-blue-900 tracking-wider mb-1.5 flex items-center gap-1">
                        <Info className="w-3.5 h-3.5 text-blue-500" />
                        PHƯƠNG THỨC TÍNH TOÁN
                      </div>
                      <div className="space-y-1.5">
                        <p>1. Tổng lương ngày công = (Lương cơ bản / Ngày công chuẩn) × Ngày công thực tế</p>
                        <p>2. Lương thực lãnh = Tổng lương ngày công + Phụ cấp + Doanh thu − Tiền tạm ứng</p>
                        <div className="border-t border-blue-200/40 pt-1.5 font-mono text-blue-800 text-[11px]">
                          ({new Intl.NumberFormat('vi-VN').format(basicSalaryNum)} / {standardDaysNum}) × {actualDaysNum} = {formatVND(totalSalary)}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </aside>

        </div>

      </div>

      {/* Footer credits matches theme */}
      <footer className="text-center pt-10 pb-2 text-[11px] font-bold text-blue-900/40 max-w-6xl mx-auto w-full">
        <div>TÍNH LƯƠNG THÁNG CÁ NHÂN • {new Date().getFullYear()}</div>
        <div className="font-medium opacity-85 mt-0.5">Thiết kế Frosted Glass thanh lịch • An toàn, bảo mật & không lưu trữ thông tin</div>
      </footer>
    </div>
  );
}
