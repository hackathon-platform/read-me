export interface Portfolio {
  firstName: string;
  lastName: string;
  firstNameKana: string;
  lastNameKana: string;
  imageUrl: string;
  socials: Social[];
  education: string;
  experience: string[];
  resumeUrl: string;
  projects: Project[];
}

export interface Project {
  title: string;
  description: string;
  imageUrl: string;
  url?: string;
}

export interface Social {
  platform: 'linkedin' | 'instagram' | 'github' | 'facebook';
  url: string;
}

export const INITIAL_PORTFOLIO: Portfolio = {
  firstName: '太郎',
  lastName: '山田',
  firstNameKana: 'タロウ',
  lastNameKana: 'ヤマダ',
  imageUrl: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
  socials: [
    { platform: 'github', url: 'https://github.com' },
    { platform: 'linkedin', url: 'https://linkedin.com' }
  ],
  education: '東京大学工学部（2019年卒業）',
  experience: [
    '株式会社テクノロジー（2019年4月〜2021年3月）- ソフトウェアエンジニア',
    '株式会社イノベーション（2021年4月〜現在）- シニアエンジニア'
  ],
  resumeUrl: '',
  projects: [
    {
      title: 'AI チャットボット',
      description: '自然言語処理を活用したカスタマーサポート向けチャットボットの開発。応答の正確性が95%を達成。',
      imageUrl: 'https://images.pexels.com/photos/8386434/pexels-photo-8386434.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
    },
    {
      title: 'フードデリバリーアプリ',
      description: 'React Nativeを使用したクロスプラットフォームアプリの開発。30日で10,000ダウンロードを達成。',
      imageUrl: 'https://images.pexels.com/photos/6169668/pexels-photo-6169668.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
    }
  ]
};