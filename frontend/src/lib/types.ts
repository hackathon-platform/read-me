export interface Portfolio {
  firstName: string;
  lastName: string;
  firstNameKana: string;
  lastNameKana: string;
  imageUrl: string;
  socials: Social[];
  education: string;
  experience: Experience[];
  qualifications: Qualification[];
  resumeUrl: string;
  projects: Project[];
}

export interface Project {
  title: string;
  description: string;
  imageUrl: string;
  url?: string;
  media: ProjectMedia[];
  skills: Skill[];
}

export interface ProjectMedia {
  type: 'image' | 'video';
  url: string;
}

export interface Social {
  platform: 'linkedin' | 'instagram' | 'github' | 'facebook' | 'other';
  url: string;
  label?: string; // For "other" platform
}

export interface Experience {
  company: string;
  position: string;
  startDate: string; // YYYY-MM format
  endDate: string; // YYYY-MM format or "present"
  description: string;
  iconUrl?: string;
  url?: string;
  skills: Skill[];
}

export interface Qualification {
  name: string;
  acquisitionDate: string; // YYYY-MM format
  description?: string;
  score?: string;
}

export interface Skill {
  name: string;
  type: 'language' | 'framework' | 'tool' | 'other';
}

// quick example
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
    {
      company: '株式会社イノベーション',
      position: 'シニアエンジニア',
      startDate: '2021-04',
      endDate: 'present',
      description: 'フルスタックエンジニアとして、新規プロダクトの設計・開発を担当。',
      iconUrl: 'https://images.pexels.com/photos/15031644/pexels-photo-15031644.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      url: 'https://example.com/innovation',
      skills: [
        { name: 'TypeScript', type: 'language' },
        { name: 'React', type: 'framework' },
        { name: 'Next.js', type: 'framework' },
        { name: 'Node.js', type: 'language' }
      ]
    },
    {
      company: '株式会社テクノロジー',
      position: 'ソフトウェアエンジニア',
      startDate: '2019-04',
      endDate: '2021-03',
      description: 'バックエンド開発チームのメンバーとして、APIの設計・実装を担当。',
      iconUrl: 'https://images.pexels.com/photos/5473955/pexels-photo-5473955.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      url: 'https://example.com/technology',
      skills: [
        { name: 'Python', type: 'language' },
        { name: 'Django', type: 'framework' },
        { name: 'PostgreSQL', type: 'tool' }
      ]
    }
  ],
  qualifications: [
    {
      name: '普通自動車免許',
      acquisitionDate: '2015-03'
    },
    {
      name: 'TOEIC',
      acquisitionDate: '2018-12',
      score: '850点'
    },
    {
      name: '応用情報技術者試験',
      acquisitionDate: '2019-06'
    }
  ],
  resumeUrl: '',
  projects: [
    {
      title: 'AI チャットボット',
      description: '自然言語処理を活用したカスタマーサポート向けチャットボットの開発。応答の正確性が95%を達成。',
      imageUrl: 'https://images.pexels.com/photos/8386434/pexels-photo-8386434.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      media: [],
      skills: [
        { name: 'Python', type: 'language' },
        { name: 'TensorFlow', type: 'framework' },
        { name: 'FastAPI', type: 'framework' }
      ]
    },
    {
      title: 'フードデリバリーアプリ',
      description: 'React Nativeを使用したクロスプラットフォームアプリの開発。30日で10,000ダウンロードを達成。',
      imageUrl: 'https://images.pexels.com/photos/6169668/pexels-photo-6169668.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      media: [],
      skills: [
        { name: 'TypeScript', type: 'language' },
        { name: 'React Native', type: 'framework' },
        { name: 'Firebase', type: 'tool' }
      ]
    }
  ]
};