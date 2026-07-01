export interface AutobiographyPersonalization {
  name?: string;
  age?: number;
  lifeStage?: string;
  purposes: string[];
  style?: string;
  tocPlan: string[];
}

function readLineValue(text: string, label: string): string | undefined {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = text.match(new RegExp(`${escaped}\\s*:\\s*(.+)`));
  return match?.[1]?.trim();
}

export function parseAutobiographyPersonalization(introText?: string): AutobiographyPersonalization {
  const text = introText || '';
  const ageText = readLineValue(text, '나이');
  const purposesText = readLineValue(text, '자서전 제작 목적') || '';

  return {
    name: readLineValue(text, '이름'),
    age: ageText ? Number.parseInt(ageText, 10) : undefined,
    lifeStage: readLineValue(text, '현재 상태'),
    purposes: purposesText
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean),
    style: readLineValue(text, '원하는 결과물 스타일'),
    tocPlan: readTocPlan(text),
  };
}

function readTocPlan(text: string): string[] {
  const marker = '추천 목차 설계:';
  const start = text.indexOf(marker);
  if (start < 0) return [];

  const rest = text.slice(start + marker.length);
  const endMarkers = ['\n\n이름과 현재의 나:', '\r\n\r\n이름과 현재의 나:'];
  const endIndex = endMarkers
    .map((endMarker) => rest.indexOf(endMarker))
    .filter((index) => index >= 0)
    .sort((a, b) => a - b)[0];
  const section = endIndex >= 0 ? rest.slice(0, endIndex) : rest;

  return section
    .split(/\r?\n/)
    .map((line) => line.replace(/^\s*\d+\.\s*/, '').trim())
    .filter(Boolean);
}

export function buildPersonalizedTocPlan(profile: AutobiographyPersonalization): string[] {
  if (profile.tocPlan.length > 0) {
    return profile.tocPlan;
  }

  const isSenior = profile.lifeStage === '은퇴/시니어' || (profile.age || 0) >= 60;
  const isYoung = profile.lifeStage === '학생' || (profile.age !== undefined && profile.age < 30);
  const isCareer = profile.purposes.includes('진로/포트폴리오');
  const isFamily = profile.purposes.includes('가족에게 남기기') || profile.purposes.includes('자녀/후손에게 전하기');
  const isEvent = profile.purposes.includes('특별한 사건 기록');
  const isSimple = profile.style === '짧고 간단하게';

  const chapters: string[] = [];

  if (isYoung) {
    chapters.push('나를 소개하는 첫 장', '어린 시절과 성장 배경', '학교생활과 관계');
    chapters.push(isCareer ? '진로 고민과 나의 강점' : '나를 바꾼 경험들');
    chapters.push('앞으로 만들고 싶은 삶');
  } else if (isSenior) {
    chapters.push('내 삶의 시작과 시대 배경', '가족과 함께한 시간', '일과 생업의 기록');
    chapters.push(isFamily ? '후손에게 남기고 싶은 말' : '인생의 전환점');
    chapters.push('돌아보며 배운 것');
  } else {
    chapters.push('지금의 나를 만든 배경', '일과 삶의 균형', '가족과 관계');
    chapters.push(isCareer ? '성취와 실패에서 배운 것' : '중요한 선택과 전환점');
    chapters.push('앞으로의 방향');
  }

  if (isEvent) {
    chapters.splice(Math.min(3, chapters.length), 0, '특별한 사건과 그 이후의 변화');
  }
  if (profile.style === '따뜻하고 감성적으로') {
    chapters.push('고마운 사람들과 마음의 기록');
  }
  if (profile.style === '책처럼 문학적으로') {
    chapters.push('내 이야기에 붙이고 싶은 제목과 장면');
  }

  return [...new Set(chapters)].slice(0, isSimple ? 4 : 7);
}

export function personalizeChapterTitle(originalTitle: string, orderIndex: number, profile: AutobiographyPersonalization): string {
  const plan = buildPersonalizedTocPlan(profile);
  return plan[orderIndex] || originalTitle;
}

export function personalizeQuestionText(originalText: string, chapterTitle: string, questionIndex: number, profile: AutobiographyPersonalization): string {
  const templates = selectQuestionTemplates(chapterTitle, profile);
  return templates[questionIndex] || originalText;
}

function selectQuestionTemplates(chapterTitle: string, profile: AutobiographyPersonalization): string[] {
  const namePrefix = profile.name ? `${profile.name}님의` : '당신의';
  const styleHint = profile.style === '짧고 간단하게' ? '짧게' : '가능한 한 구체적으로';

  if (chapterTitle.includes('진로') || chapterTitle.includes('강점') || chapterTitle.includes('성취')) {
    return [
      `${namePrefix} 진로 또는 일에서 가장 중요하게 생각했던 선택은 무엇인가요?`,
      `그 선택을 하게 된 배경과 당시의 고민을 ${styleHint} 들려주세요.`,
      '그 경험이 지금의 강점이나 앞으로의 목표에 어떤 영향을 주었나요?',
    ];
  }

  if (chapterTitle.includes('가족') || chapterTitle.includes('후손') || chapterTitle.includes('고마운')) {
    return [
      '가족이나 가까운 사람들과 함께한 기억 중 가장 오래 남은 장면은 무엇인가요?',
      `그 사람들에게 꼭 전하고 싶은 말이 있다면 ${styleHint} 적어주세요.`,
      '그 관계를 통해 배운 삶의 태도나 마음은 무엇인가요?',
    ];
  }

  if (chapterTitle.includes('시대') || chapterTitle.includes('시작') || chapterTitle.includes('성장')) {
    return [
      '어린 시절 또는 성장 과정에서 가장 선명하게 떠오르는 장소는 어디인가요?',
      `그 시절의 분위기, 가족, 동네, 학교 이야기를 ${styleHint} 들려주세요.`,
      '그 시간이 지금의 나에게 남긴 영향은 무엇인가요?',
    ];
  }

  if (chapterTitle.includes('사건') || chapterTitle.includes('전환점') || chapterTitle.includes('변화')) {
    return [
      '삶의 방향을 바꾼 사건이나 선택이 있었다면 무엇인가요?',
      `그 일이 일어나기 전과 후의 변화를 ${styleHint} 들려주세요.`,
      '그 경험을 지금 다시 돌아본다면 어떤 의미로 남아 있나요?',
    ];
  }

  if (chapterTitle.includes('앞으로') || chapterTitle.includes('방향') || chapterTitle.includes('제목')) {
    return [
      '앞으로 어떤 사람으로 기억되고 싶나요?',
      `남은 삶에서 지키고 싶은 가치나 이루고 싶은 일을 ${styleHint} 적어주세요.`,
      '자서전의 마지막에 남기고 싶은 한 문장이 있다면 무엇인가요?',
    ];
  }

  return [
    `${namePrefix} 삶에서 이 장과 가장 어울리는 기억은 무엇인가요?`,
    `그 기억이 생긴 배경과 당시의 감정을 ${styleHint} 들려주세요.`,
    '그 경험이 지금의 나에게 어떤 의미로 남아 있나요?',
  ];
}
