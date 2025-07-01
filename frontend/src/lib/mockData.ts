export interface Event {
    id: string;
    title: string;
    titleJa: string;
    description: string;
    theme: string;
    themeJa: string;
    startDate: string;
    endDate: string;
    venue: string;
    venueJa: string;
    registrationDeadline: string;
    location: "online" | "in-person";
    locationDetails?: string;
    url?: string;
    image: string;
    status: "upcoming" | "open" | "ended";
    participants: {
      current: number;
      max: number;
    };
    tags: string[];
    organizationId: string;
    organizerJa: string;
    createdAt: string;
    updatedAt: string;
    prizes?: string; // Added prizes property
  }
  
  export interface Organization {
    id: string;
    name: string;
    nameJa: string;
    description: string;
    descriptionJa: string;
    imageUrl: string;
    website?: string;
    email?: string;
    createdAt: string;
    ownerId: string;
    memberCount: number;
    eventCount: number;
  }
  
  export interface Organizer {
    id: string;
    userId: string;
    organizationId: string;
    role: "owner" | "admin" | "member";
    joinedAt: string;
    permissions: string[];
  }
  
  export interface User {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    imageUrl: string;
  }
  

export const mockEvents: Event[] = [
  {
    id: "1",
    title: "Virtual Innovation Hackathon 2025",
    titleJa: "バーチャルイノベーションハッカソン2025",
    description:
      "Design the future of smart cities in virtual space. Join developers, designers, and innovators in a 48-hour coding marathon.",
    startDate: "2025-09-15",
    endDate: "2025-09-17",
    registrationDeadline: "2025-09-01",
    location: "online",
    venue: "Virtual Naruto City Hall",
    venueJa: "バーチャル鳴門市役所",
    status: "upcoming",
    participants: { current: 32, max: 40 },
    prizes: "¥900,000",
    theme: "Smart Cities & Social Impact",
    themeJa: "スマートシティ・社会課題解決",
    organizer: "TechHub Japan",
    organizerJa: "テックハブ・ジャパン",
    image:
      "https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=800",
    tags: ["AI/ML", "IoT", "スマートシティ", "社会課題"],
    featured: true,
  },
  {
    id: "2",
    title: "Tokyo FinTech Challenge",
    titleJa: "東京フィンテック・チャレンジ2025",
    description:
      "Revolutionary financial technology solutions for the next generation. Build the future of digital payments and blockchain.",
    startDate: "2025-08-20",
    endDate: "2025-08-22",
    registrationDeadline: "2025-08-10",
    location: "in-person",
    venue: "Tokyo Tech Center, Shibuya",
    venueJa: "東京テックセンター（渋谷）",
    status: "open",
    participants: { current: 45, max: 60 },
    prizes: "¥1,500,000",
    theme: "Financial Technology",
    themeJa: "フィンテック・金融技術",
    organizer: "FinTech Tokyo",
    organizerJa: "フィンテック東京",
    image:
      "https://images.pexels.com/photos/3861458/pexels-photo-3861458.jpeg?auto=compress&cs=tinysrgb&w=800",
    tags: ["ブロックチェーン", "フィンテック", "決済", "DeFi"],
  },
  {
    id: "3",
    title: "Green Tech Innovation Summit",
    titleJa: "グリーンテック・イノベーション・サミット",
    description:
      "Sustainable technology solutions for environmental challenges. Create impactful solutions for climate change.",
    startDate: "2025-07-10",
    endDate: "2025-07-12",
    registrationDeadline: "2025-06-30",
    location: "in-person",
    venue: "Osaka Innovation Hub",
    venueJa: "大阪イノベーションハブ",
    status: "ended",
    participants: { current: 38, max: 40 },
    prizes: "¥800,000",
    theme: "Environmental Technology",
    themeJa: "環境技術・持続可能性",
    organizer: "GreenTech Alliance",
    organizerJa: "グリーンテック・アライアンス",
    image:
      "https://images.pexels.com/photos/3861972/pexels-photo-3861972.jpeg?auto=compress&cs=tinysrgb&w=800",
    tags: ["持続可能性", "クリーンテック", "環境", "エネルギー"],
  },
  {
    id: "4",
    title: "Healthcare AI Hackathon",
    titleJa: "ヘルスケアAIハッカソン2025",
    description:
      "Artificial intelligence solutions for modern healthcare challenges. Build tools that save lives and improve patient care.",
    startDate: "2025-10-05",
    endDate: "2025-10-07",
    registrationDeadline: "2025-09-25",
    location: "online",
    venue: "Virtual Medical Center",
    venueJa: "バーチャル医療センター",
    status: "upcoming",
    participants: { current: 28, max: 50 },
    prizes: "¥1,200,000",
    theme: "Healthcare & AI",
    themeJa: "ヘルスケア・人工知能",
    organizer: "MedTech Innovation",
    organizerJa: "メドテック・イノベーション",
    image:
      "https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=800",
    tags: ["ヘルスケア", "AI/ML", "医療", "イノベーション"],
    featured: true,
  },
  {
      id: "5",
      title: "Gaming & VR Experience Jam",
      titleJa: "ゲーミング・VR体験ジャム",
      description: "Create immersive gaming experiences and virtual reality applications. Push the boundaries of interactive entertainment.",
      startDate: "2025-08-01",
      endDate: "2025-08-03",
      registrationDeadline: "2025-07-20",
      location: "in-person",
      venue: "Gaming Arena Tokyo",
      venueJa: "ゲーミングアリーナ東京",
      status: "open",
      participants: { current: 52, max: 80 },
      prizes: "¥600,000",
      theme: "Gaming & Virtual Reality",
      themeJa: "ゲーミング・バーチャルリアリティ",
      // Removed 'organizer' as it does not exist in the Event interface
      organizerJa: "ゲームデブ東京",
      image: "https://images.pexels.com/photos/3861458/pexels-photo-3861458.jpeg?auto=compress&cs=tinysrgb&w=800",
      tags: ["ゲーミング", "VR/AR", "Unity", "エンターテイメント"],
      organizationId: "",
      createdAt: "",
      updatedAt: ""
  },
  {
      id: "6",
      title: "EdTech Learning Revolution",
      titleJa: "エドテック学習革命ハッカソン",
      description: "Transform education through technology. Build platforms and tools that make learning accessible and engaging for everyone.",
      startDate: "2025-06-25",
      endDate: "2025-06-27",
      registrationDeadline: "2025-06-05",
      location: "online",
      venue: "Virtual Education Hub",
      venueJa: "バーチャル教育ハブ",
      status: "ended",
      participants: { current: 35, max: 40 },
      prizes: "¥700,000",
      theme: "Educational Technology",
      themeJa: "教育技術・EdTech",
      organizerJa: "エドテック・ジャパン",
      image: "https://images.pexels.com/photos/3861972/pexels-photo-3861972.jpeg?auto=compress&cs=tinysrgb&w=800",
      tags: ["教育", "Eラーニング", "EdTech", "アクセシビリティ"],
      organizationId: "",
      createdAt: "",
      updatedAt: ""
  },
];



// Mock data for organizations
export const mockOrganizations: Organization[] = [
    {
      id: "org-1",
      name: "Tokyo Tech Innovators",
      nameJa: "東京テックイノベーターズ",
      description: "Promoting innovation through technology events and hackathons in Tokyo.",
      descriptionJa: "東京でテクノロジーイベントやハッカソンを通じてイノベーションを推進する組織です。",
      imageUrl: "https://images.pexels.com/photos/3861972/pexels-photo-3861972.jpeg?auto=compress&cs=tinysrgb&w=800",
      website: "https://tokyotechinnovators.com",
      email: "contact@tokyotechinnovators.com",
      createdAt: "2023-01-15T09:00:00Z",
      ownerId: "user-1",
      memberCount: 15,
      eventCount: 8
    },
    {
      id: "org-2",
      name: "DevConnect Japan",
      nameJa: "デベロッパーコネクト・ジャパン",
      description: "Connecting developers across Japan through workshops and networking events.",
      descriptionJa: "ワークショップやネットワーキングイベントを通じて日本全国の開発者をつなぐ組織です。",
      imageUrl: "https://images.pexels.com/photos/3861972/pexels-photo-3861972.jpeg?auto=compress&cs=tinysrgb&w=800",
      website: "https://devconnect.jp",
      email: "hello@devconnect.jp",
      createdAt: "2023-03-20T10:30:00Z",
      ownerId: "user-1",
      memberCount: 32,
      eventCount: 12
    },
    {
      id: "org-3",
      name: "AI Research Collective",
      nameJa: "AI研究コレクティブ",
      description: "Advancing AI research and education through collaborative events.",
      descriptionJa: "協働イベントを通じてAI研究と教育を推進する組織です。",
      imageUrl: "https://images.pexels.com/photos/3861972/pexels-photo-3861972.jpeg?auto=compress&cs=tinysrgb&w=800",
      website: "https://airesearch.jp",
      createdAt: "2022-11-05T14:15:00Z",
      ownerId: "user-2",
      memberCount: 8,
      eventCount: 4
    }
  ];
  
  // Mock data for events (updated to match new structure)
  export const mockOrgEvents: Event[] = [
    {
        id: "event-1",
        title: "Spring Tech Hackathon 2025",
        titleJa: "スプリング・テック・ハッカソン 2025",
        description: "Join us for a 48-hour hackathon focused on sustainable technology solutions.",
        theme: "Sustainable Technology",
        themeJa: "持続可能なテクノロジー",
        startDate: "2025-07-15T09:00:00Z",
        endDate: "2025-07-17T18:00:00Z",
        location: "in-person",
        locationDetails: "東京国際フォーラム",
        url: "https://example.com/spring-hackathon",
        image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=600&fit=crop",
        status: "open",
        participants: {
            current: 45,
            max: 100
        },
        tags: ["ハッカソン", "持続可能性", "イノベーション"],
        organizationId: "org-1",
        organizerJa: "東京テックイノベーターズ",
        createdAt: "2025-05-01T10:00:00Z",
        updatedAt: "2025-06-20T15:30:00Z",
        venue: "",
        registrationDeadline: "",
        venueJa: ""
    },
    {
        id: "event-2",
        title: "AI Workshop Series - Deep Learning Fundamentals",
        titleJa: "AIワークショップシリーズ - ディープラーニング基礎",
        description: "Learn the fundamentals of deep learning in this hands-on workshop.",
        theme: "AI & Machine Learning",
        themeJa: "AI・機械学習",
        startDate: "2025-07-08T13:00:00Z",
        endDate: "2025-07-08T17:00:00Z",
        location: "online",
        url: "https://zoom.us/webinar/123456",
        image: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&h=600&fit=crop",
        status: "open",
        participants: {
            current: 28,
            max: 50
        },
        tags: ["AI", "ディープラーニング", "ワークショップ"],
        organizationId: "org-3",
        organizerJa: "AI研究コレクティブ",
        createdAt: "2025-05-15T14:20:00Z",
        updatedAt: "2025-06-18T11:45:00Z",
        venue: "",
        registrationDeadline: "",
        venueJa: ""
    },
    {
        id: "event-3",
        title: "React Native Mobile Development Bootcamp",
        titleJa: "React Nativeモバイル開発ブートキャンプ",
        description: "Intensive 3-day bootcamp covering React Native development from basics to advanced.",
        theme: "Mobile Development",
        themeJa: "モバイル開発",
        startDate: "2025-08-20T09:00:00Z",
        endDate: "2025-08-22T17:00:00Z",
        location: "in-person",
        locationDetails: "渋谷スカイビル",
        image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=600&fit=crop",
        status: "upcoming",
        participants: {
            current: 12,
            max: 30
        },
        tags: ["React Native", "モバイル", "ブートキャンプ"],
        organizationId: "org-2",
        organizerJa: "デベロッパーコネクト・ジャパン",
        createdAt: "2025-04-20T09:30:00Z",
        updatedAt: "2025-06-25T16:20:00Z",
        venue: "",
        registrationDeadline: "",
        venueJa: ""
    },
    {
        id: "event-4",
        title: "Web3 and Blockchain Future Forum",
        titleJa: "Web3・ブロックチェーン未来フォーラム",
        description: "Explore the future of Web3 and blockchain technology with industry experts.",
        theme: "Blockchain & Web3",
        themeJa: "ブロックチェーン・Web3",
        startDate: "2025-06-30T18:00:00Z",
        endDate: "2025-06-30T21:00:00Z",
        location: "online",
        image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&h=600&fit=crop",
        status: "ended",
        participants: {
            current: 150,
            max: 150
        },
        tags: ["Web3", "ブロックチェーン", "フォーラム"],
        organizationId: "org-1",
        organizerJa: "東京テックイノベーターズ",
        createdAt: "2025-04-10T12:00:00Z",
        updatedAt: "2025-06-30T22:00:00Z",
        venue: "",
        registrationDeadline: "",
        venueJa: ""
    }
  ];
  
  // Mock data for organizers/members
  export const mockOrganizers: Organizer[] = [
    {
      id: "org-member-1",
      userId: "user-1",
      organizationId: "org-1",
      role: "owner",
      joinedAt: "2023-01-15T09:00:00Z",
      permissions: ["create_event", "edit_event", "delete_event", "manage_members", "edit_organization"]
    },
    {
      id: "org-member-2",
      userId: "user-1",
      organizationId: "org-2",
      role: "owner",
      joinedAt: "2023-03-20T10:30:00Z",
      permissions: ["create_event", "edit_event", "delete_event", "manage_members", "edit_organization"]
    },
    {
      id: "org-member-3",
      userId: "user-1",
      organizationId: "org-3",
      role: "admin",
      joinedAt: "2023-06-10T15:45:00Z",
      permissions: ["create_event", "edit_event", "manage_members"]
    },
    {
      id: "org-member-4",
      userId: "user-2",
      organizationId: "org-3",
      role: "owner",
      joinedAt: "2022-11-05T14:15:00Z",
      permissions: ["create_event", "edit_event", "delete_event", "manage_members", "edit_organization"]
    }
  ];
  
  // Mock current user
  export const mockCurrentUser: User = {
    id: "user-1",
    username: "tech_innovator",
    firstName: "田中",
    lastName: "太郎",
    email: "tanaka@example.com",
    imageUrl: "https://images.pexels.com/photos/3861972/pexels-photo-3861972.jpeg?auto=compress&cs=tinysrgb&w=800"
  };




// Additional types for organization management
export interface OrgMember {
    id: string;
    userId: string;
    organizationId: string;
    role: "owner" | "admin" | "member";
    joinedAt: string;
    permissions: string[];
    // User profile data
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    imageUrl: string;
    description?: string;
    // Additional member-specific data
    lastActive?: string;
    eventsCreated?: number;
    status: "active" | "inactive" | "pending";
  }
  
  // Mock data for organization members (expanded from existing profiles)
  export const mockOrgMembers: OrgMember[] = [
    // Tokyo Tech Innovators (org-1) members
    {
      id: "member-1",
      userId: "user-1",
      organizationId: "org-1",
      role: "owner",
      joinedAt: "2023-01-15T09:00:00Z",
      permissions: ["create_event", "edit_event", "delete_event", "manage_members", "edit_organization"],
      username: "tech_innovator",
      firstName: "田中",
      lastName: "太郎",
      email: "tanaka@example.com",
      imageUrl: "https://images.pexels.com/photos/3861972/pexels-photo-3861972.jpeg?auto=compress&cs=tinysrgb&w=800",
      description: "テクノロジーを通じて社会課題を解決することに情熱を注いでいます。",
      lastActive: "2025-06-25T10:30:00Z",
      eventsCreated: 5,
      status: "active"
    },
    {
      id: "member-2",
      userId: "user-3",
      organizationId: "org-1",
      role: "admin",
      joinedAt: "2023-02-20T14:30:00Z",
      permissions: ["create_event", "edit_event", "manage_members"],
      username: "design_pro",
      firstName: "佐藤",
      lastName: "花子",
      email: "sato@example.com",
      imageUrl: "https://images.pexels.com/photos/3861972/pexels-photo-3861972.jpeg?auto=compress&cs=tinysrgb&w=800",
      description: "UX/UIデザイナーとして、ユーザー中心のデザインを追求しています。",
      lastActive: "2025-06-24T16:45:00Z",
      eventsCreated: 3,
      status: "active"
    },
    {
      id: "member-3",
      userId: "user-4",
      organizationId: "org-1",
      role: "member",
      joinedAt: "2023-03-10T11:15:00Z",
      permissions: ["create_event"],
      username: "backend_ninja",
      firstName: "鈴木",
      lastName: "一郎",
      email: "suzuki@example.com",
      imageUrl: "https://via.placeholder.com/150x150/10B981/FFFFFF?text=鈴木",
      description: "バックエンド開発とクラウドアーキテクチャが専門です。",
      lastActive: "2025-06-20T09:20:00Z",
      eventsCreated: 1,
      status: "active"
    },
    {
      id: "member-4",
      userId: "user-5",
      organizationId: "org-1",
      role: "member",
      joinedAt: "2023-04-05T16:00:00Z",
      permissions: ["create_event"],
      username: "ai_researcher",
      firstName: "高橋",
      lastName: "美咲",
      email: "takahashi@example.com",
      imageUrl: "https://images.pexels.com/photos/3861972/pexels-photo-3861972.jpeg?auto=compress&cs=tinysrgb&w=800",
      description: "機械学習とデータサイエンスの研究者です。",
      lastActive: "2025-06-22T13:10:00Z",
      eventsCreated: 2,
      status: "active"
    },
    {
      id: "member-5",
      userId: "user-6",
      organizationId: "org-1",
      role: "member",
      joinedAt: "2023-05-15T10:30:00Z",
      permissions: [],
      username: "mobile_dev",
      firstName: "渡辺",
      lastName: "健太",
      email: "watanabe@example.com",
      imageUrl: "https://images.pexels.com/photos/3861972/pexels-photo-3861972.jpeg?auto=compress&cs=tinysrgb&w=800",
      description: "iOS/Androidアプリ開発エンジニアです。",
      lastActive: "2025-06-18T11:40:00Z",
      eventsCreated: 0,
      status: "inactive"
    },
    {
      id: "member-6",
      userId: "user-7",
      organizationId: "org-1",
      role: "member",
      joinedAt: "2025-06-20T15:20:00Z",
      permissions: [],
      username: "frontend_expert",
      firstName: "山田",
      lastName: "麻衣",
      email: "yamada@example.com",
      imageUrl: "https://images.pexels.com/photos/3861972/pexels-photo-3861972.jpeg?auto=compress&cs=tinysrgb&w=800",
      description: "React/Vue.jsを用いたフロントエンド開発が得意です。",
      lastActive: "2025-06-25T14:20:00Z",
      eventsCreated: 0,
      status: "pending"
    },
  
    // DevConnect Japan (org-2) members  
    {
      id: "member-7",
      userId: "user-1",
      organizationId: "org-2",
      role: "owner",
      joinedAt: "2023-03-20T10:30:00Z",
      permissions: ["create_event", "edit_event", "delete_event", "manage_members", "edit_organization"],
      username: "tech_innovator",
      firstName: "田中",
      lastName: "太郎",
      email: "tanaka@example.com",
      imageUrl: "https://images.pexels.com/photos/3861972/pexels-photo-3861972.jpeg?auto=compress&cs=tinysrgb&w=800",
      description: "テクノロジーを通じて社会課題を解決することに情熱を注いでいます。",
      lastActive: "2025-06-25T10:30:00Z",
      eventsCreated: 8,
      status: "active"
    },
    {
      id: "member-8",
      userId: "user-8",
      organizationId: "org-2",
      role: "admin",
      joinedAt: "2023-04-15T12:00:00Z",
      permissions: ["create_event", "edit_event", "manage_members"],
      username: "community_builder",
      firstName: "中村",
      lastName: "拓也",
      email: "nakamura@example.com",
      imageUrl: "https://images.pexels.com/photos/3861972/pexels-photo-3861972.jpeg?auto=compress&cs=tinysrgb&w=800",
      description: "コミュニティ運営とネットワーキングイベントが専門です。",
      lastActive: "2025-06-24T18:15:00Z",
      eventsCreated: 4,
      status: "active"
    },
  
    // AI Research Collective (org-3) members
    {
      id: "member-9",
      userId: "user-2",
      organizationId: "org-3",
      role: "owner",
      joinedAt: "2022-11-05T14:15:00Z",
      permissions: ["create_event", "edit_event", "delete_event", "manage_members", "edit_organization"],
      username: "ai_pioneer",
      firstName: "木村",
      lastName: "博士",
      email: "kimura@example.com",
      imageUrl: "https://images.pexels.com/photos/3861972/pexels-photo-3861972.jpeg?auto=compress&cs=tinysrgb&w=800",
      description: "AI研究の第一人者として、次世代技術の開発に取り組んでいます。",
      lastActive: "2025-06-23T15:30:00Z",
      eventsCreated: 3,
      status: "active"
    },
    {
      id: "member-10",
      userId: "user-1",
      organizationId: "org-3",
      role: "admin",
      joinedAt: "2023-06-10T15:45:00Z",
      permissions: ["create_event", "edit_event", "manage_members"],
      username: "tech_innovator",
      firstName: "田中",
      lastName: "太郎",
      email: "tanaka@example.com",
      imageUrl: "https://images.pexels.com/photos/3861972/pexels-photo-3861972.jpeg?auto=compress&cs=tinysrgb&w=800",
      description: "テクノロジーを通じて社会課題を解決することに情熱を注いでいます。",
      lastActive: "2025-06-25T10:30:00Z",
      eventsCreated: 1,
      status: "active"
    }
  ];
  
  // Helper function to get members by organization
  export const getMembersByOrganization = (organizationId: string): OrgMember[] => {
    return mockOrgMembers.filter(member => member.organizationId === organizationId);
  };
  
  // Helper function to get organization member count by role
  export const getOrgMemberStats = (organizationId: string) => {
    const members = getMembersByOrganization(organizationId);
    return {
      total: members.length,
      owners: members.filter(m => m.role === "owner").length,
      admins: members.filter(m => m.role === "admin").length,
      members: members.filter(m => m.role === "member").length,
      active: members.filter(m => m.status === "active").length,
      pending: members.filter(m => m.status === "pending").length,
      inactive: members.filter(m => m.status === "inactive").length
    };
  };