import { Badge } from "@/components/ui/badge";
import { Scroll, Award, BookOpen, Sparkles, Shield, Crown } from "lucide-react";

interface ProfessionalReportHeaderProps {
  name: string;
  gender: string;
  birthDate?: string;
  dayMaster: string;
}

export const ProfessionalReportHeader = ({ 
  name, 
  gender, 
  birthDate,
  dayMaster 
}: ProfessionalReportHeaderProps) => {
  const genderText = gender === 'male' ? '男' : gender === 'female' ? '女' : gender;
  
  return (
    <div className="relative overflow-hidden rounded-xl border-2 border-primary/40 bg-gradient-to-b from-stone-950 via-stone-900 to-stone-950">
      {/* 傳統紋理背景 */}
      <div className="absolute inset-0 pattern-traditional opacity-30" />
      
      {/* 四角裝飾 */}
      <div className="absolute top-2 left-2 w-8 h-8 border-l-2 border-t-2 border-primary/60" />
      <div className="absolute top-2 right-2 w-8 h-8 border-r-2 border-t-2 border-primary/60" />
      <div className="absolute bottom-2 left-2 w-8 h-8 border-l-2 border-b-2 border-primary/60" />
      <div className="absolute bottom-2 right-2 w-8 h-8 border-r-2 border-b-2 border-primary/60" />
      
      <div className="relative z-10 p-6 md:p-8">
        {/* 頂部裝飾線 */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
          <Crown className="w-6 h-6 text-primary animate-float" />
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
        </div>
        
        {/* 主標題 */}
        <div className="text-center mb-6">
          <h1 className="text-4xl md:text-5xl font-bold font-serif tracking-widest text-fortune mb-2">
            御所命盤
          </h1>
          <p className="text-lg text-primary/80 font-serif tracking-[0.3em]">
            子平命理 · 四柱推命
          </p>
        </div>
        
        {/* 專業認證標籤 */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
          <Badge variant="outline" className="border-primary/50 text-primary bg-primary/10 gap-1.5 py-1">
            <BookOpen className="w-3.5 h-3.5" />
            <span className="text-xs">依據《滴天髓》《子平真詮》</span>
          </Badge>
          <Badge variant="outline" className="border-emerald-500/50 text-emerald-400 bg-emerald-500/10 gap-1.5 py-1">
            <Shield className="w-3.5 h-3.5" />
            <span className="text-xs">傳統命理正宗算法</span>
          </Badge>
          <Badge variant="outline" className="border-violet-500/50 text-violet-400 bg-violet-500/10 gap-1.5 py-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span className="text-xs">香港天文台節氣數據</span>
          </Badge>
        </div>
        
        {/* 命主資訊 */}
        <div className="relative rounded-lg border border-primary/30 bg-black/40 p-5">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 bg-stone-900">
            <span className="text-sm font-serif text-primary tracking-widest">命 主 資 料</span>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
            <div className="text-center">
              <span className="text-xs text-muted-foreground block mb-1 tracking-wider">姓 名</span>
              <p className="text-xl font-bold font-serif text-foreground">{name}</p>
            </div>
            <div className="text-center">
              <span className="text-xs text-muted-foreground block mb-1 tracking-wider">性 別</span>
              <p className="text-xl font-bold font-serif text-foreground">{genderText}</p>
            </div>
            <div className="text-center">
              <span className="text-xs text-muted-foreground block mb-1 tracking-wider">日 主</span>
              <p className="text-xl font-bold font-serif text-primary">{dayMaster}</p>
            </div>
            <div className="text-center">
              <span className="text-xs text-muted-foreground block mb-1 tracking-wider">命 造</span>
              <p className="text-xl font-bold font-serif text-foreground">
                {genderText === '男' ? '乾造' : '坤造'}
              </p>
            </div>
          </div>
        </div>
        
        {/* 專業提示 */}
        <div className="mt-6 p-4 rounded-lg bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border border-primary/20">
          <div className="flex items-start gap-3">
            <Scroll className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <div className="text-sm text-muted-foreground leading-relaxed">
              <p className="mb-2">
                <span className="text-primary font-medium">【命理說明】</span>
                本報告依據傳統子平命理學，結合《滴天髓》、《子平真詮》、《窮通寶鑑》等經典著作之理論，
                採用香港天文台精確節氣數據進行排盤計算。
              </p>
              <p className="text-xs text-muted-foreground/70 italic">
                「命由天定，運由己造」——八字揭示的是人生的潛能與傾向，並非絕對的命運定數。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
