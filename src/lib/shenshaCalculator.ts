import shenshaData from '@/data/shensha.json';

/**
 * 計算神煞
 * @param dayStem 日干
 * @param yearBranch 年支
 * @param monthBranch 月支  
 * @param dayBranch 日支
 * @param hourBranch 時支
 * @returns 神煞列表
 */
export function calculateShensha(
  dayStem: string,
  yearBranch: string,
  monthBranch: string,
  dayBranch: string,
  hourBranch: string
): string[] {
  const shensha: string[] = [];
  const allBranches = [yearBranch, monthBranch, dayBranch, hourBranch];

  // 計算吉神
  const jiShen = shenshaData.吉神;
  
  // 天乙貴人（日干查支）
  const tianYi = jiShen.天乙貴人.查法[dayStem as keyof typeof jiShen.天乙貴人.查法];
  if (tianYi && allBranches.some(b => tianYi.includes(b))) {
    shensha.push('天乙貴人');
  }

  // 文昌貴人（日干查支）
  const wenChang = jiShen.文昌貴人.查法[dayStem as keyof typeof jiShen.文昌貴人.查法];
  if (wenChang && allBranches.some(b => wenChang.includes(b))) {
    shensha.push('文昌貴人');
  }

  // 太極貴人（日干查支）
  const taiJi = jiShen.太極貴人.查法[dayStem as keyof typeof jiShen.太極貴人.查法];
  if (taiJi && allBranches.some(b => taiJi.includes(b))) {
    shensha.push('太極貴人');
  }

  // 將星（年支三合局）
  const jiangXing = jiShen.將星.查法;
  const yearTriad = getTriad(yearBranch);
  const jiangXingBranch = jiangXing[yearTriad as keyof typeof jiangXing];
  if (jiangXingBranch && allBranches.includes(jiangXingBranch)) {
    shensha.push('將星');
  }

  // 華蓋（年支三合局）
  const huaGai = jiShen.華蓋.查法;
  const huaGaiBranch = huaGai[yearTriad as keyof typeof huaGai];
  if (huaGaiBranch && allBranches.includes(huaGaiBranch)) {
    shensha.push('華蓋');
  }

  // 金輿（日干查支）
  const jinYu = jiShen.金輿.查法[dayStem as keyof typeof jiShen.金輿.查法];
  if (jinYu && allBranches.some(b => jinYu.includes(b))) {
    shensha.push('金輿');
  }

  // 天廚（日干查支）
  const tianChu = jiShen.天廚.查法[dayStem as keyof typeof jiShen.天廚.查法];
  if (tianChu && allBranches.some(b => tianChu.includes(b))) {
    shensha.push('天廚');
  }

  // 福星貴人（日干查支）
  const fuXing = jiShen.福星貴人.查法[dayStem as keyof typeof jiShen.福星貴人.查法];
  if (fuXing && allBranches.some(b => fuXing.includes(b))) {
    shensha.push('福星貴人');
  }

  // 計算凶煞
  const xiongSha = shenshaData.凶煞;

  // 羊刃（日干查支）
  const yangRen = xiongSha.羊刃.查法[dayStem as keyof typeof xiongSha.羊刃.查法];
  if (yangRen && allBranches.some(b => yangRen.includes(b))) {
    shensha.push('羊刃');
  }

  // 劫煞（年支三合局）
  const jieSha = xiongSha.劫煞.查法[yearTriad as keyof typeof xiongSha.劫煞.查法];
  if (jieSha && allBranches.includes(jieSha)) {
    shensha.push('劫煞');
  }

  // 災煞（年支三合局）
  const zaiSha = xiongSha.災煞.查法[yearTriad as keyof typeof xiongSha.災煞.查法];
  if (zaiSha && allBranches.includes(zaiSha)) {
    shensha.push('災煞');
  }

  // 孤辰（年支查支）
  const guChen = xiongSha.孤辰.查法;
  const yearGroup = getBranchGroup(yearBranch);
  const guChenBranch = guChen[yearGroup as keyof typeof guChen];
  if (guChenBranch && allBranches.includes(guChenBranch)) {
    shensha.push('孤辰');
  }

  // 寡宿（年支查支）
  const guaSu = xiongSha.寡宿.查法;
  const guaSuBranch = guaSu[yearGroup as keyof typeof guaSu];
  if (guaSuBranch && allBranches.includes(guaSuBranch)) {
    shensha.push('寡宿');
  }

  // 亡神（年支三合局）
  const wangShen = xiongSha.亡神.查法[yearTriad as keyof typeof xiongSha.亡神.查法];
  if (wangShen && allBranches.includes(wangShen)) {
    shensha.push('亡神');
  }

  // 白虎（年支三合局）
  const baiHu = xiongSha.白虎.查法[yearTriad as keyof typeof xiongSha.白虎.查法];
  if (baiHu && allBranches.includes(baiHu)) {
    shensha.push('白虎');
  }

  // 天狗（年支三合局）
  const tianGou = xiongSha.天狗.查法[yearTriad as keyof typeof xiongSha.天狗.查法];
  if (tianGou && allBranches.includes(tianGou)) {
    shensha.push('天狗');
  }

  // 計算桃花
  const taoHua = shenshaData.桃花;

  // 咸池（年支三合局）
  const xianChi = taoHua.咸池.查法[yearTriad as keyof typeof taoHua.咸池.查法];
  if (xianChi && allBranches.includes(xianChi)) {
    shensha.push('咸池');
  }

  // 紅鸞（年支查支）
  const hongLuan = taoHua.紅鸞.查法[yearBranch as keyof typeof taoHua.紅鸞.查法];
  if (hongLuan && allBranches.includes(hongLuan)) {
    shensha.push('紅鸞');
  }

  // 天喜（年支查支）
  const tianXi = taoHua.天喜.查法[yearBranch as keyof typeof taoHua.天喜.查法];
  if (tianXi && allBranches.includes(tianXi)) {
    shensha.push('天喜');
  }

  // 計算空亡
  const kongWang = calculateKongWang(dayBranch);
  if (allBranches.some(b => kongWang.includes(b))) {
    shensha.push('空亡');
  }

  // 天羅地網
  const teLuo = shenshaData.特殊神煞;
  if (allBranches.some(b => teLuo.天羅.查法.includes(b))) {
    shensha.push('天羅');
  }
  if (allBranches.some(b => teLuo.地網.查法.includes(b))) {
    shensha.push('地網');
  }

  return shensha;
}

/**
 * 獲取地支的三合局
 */
function getTriad(branch: string): string {
  const triads: Record<string, string> = {
    '申': '申子辰',
    '子': '申子辰',
    '辰': '申子辰',
    '寅': '寅午戌',
    '午': '寅午戌',
    '戌': '寅午戌',
    '巳': '巳酉丑',
    '酉': '巳酉丑',
    '丑': '巳酉丑',
    '亥': '亥卯未',
    '卯': '亥卯未',
    '未': '亥卯未'
  };
  return triads[branch] || '';
}

/**
 * 獲取地支的組別（用於孤辰寡宿）
 */
function getBranchGroup(branch: string): string {
  const groups: Record<string, string> = {
    '亥': '亥子丑',
    '子': '亥子丑',
    '丑': '亥子丑',
    '寅': '寅卯辰',
    '卯': '寅卯辰',
    '辰': '寅卯辰',
    '巳': '巳午未',
    '午': '巳午未',
    '未': '巳午未',
    '申': '申酉戌',
    '酉': '申酉戌',
    '戌': '申酉戌'
  };
  return groups[branch] || '';
}

/**
 * 計算空亡（旬空）
 */
function calculateKongWang(dayBranch: string): string[] {
  const branches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
  const stems = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
  
  const branchIndex = branches.indexOf(dayBranch);
  
  // 六十甲子中，每旬有兩個空亡
  const xunIndex = Math.floor(branchIndex / 10);
  const kongWangIndices = [(xunIndex * 10 + 10) % 12, (xunIndex * 10 + 11) % 12];
  
  return kongWangIndices.map(i => branches[i]);
}

/**
 * 獲取神煞的詳細資訊
 */
export function getShenshaInfo(shensha: string) {
  // 查找吉神
  const jiShen = shenshaData.吉神[shensha as keyof typeof shenshaData.吉神];
  if (jiShen) {
    return {
      類型: '吉神',
      ...jiShen
    };
  }

  // 查找凶煞
  const xiongSha = shenshaData.凶煞[shensha as keyof typeof shenshaData.凶煞];
  if (xiongSha) {
    return {
      類型: '凶煞',
      ...xiongSha
    };
  }

  // 查找桃花
  const taoHua = shenshaData.桃花[shensha as keyof typeof shenshaData.桃花];
  if (taoHua) {
    return {
      類型: '桃花',
      ...taoHua
    };
  }

  // 查找特殊神煞
  const teShu = shenshaData.特殊神煞[shensha as keyof typeof shenshaData.特殊神煞];
  if (teShu) {
    return {
      類型: '特殊',
      ...teShu
    };
  }

  return null;
}
